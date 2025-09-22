-- Create database triggers for user sync between auth.users and public.users
-- Migration: 011_create_user_sync_triggers
-- Date: 2025-09-22

-- Function to auto-create public.users record when auth user signs up
CREATE OR REPLACE FUNCTION public.handle_new_auth_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Only create public.users record if phone is provided in raw_user_meta_data
  IF NEW.raw_user_meta_data ? 'phone' THEN
    INSERT INTO public.users (
      auth_user_id,
      phone_number,
      name,
      is_admin,
      is_active
    ) VALUES (
      NEW.id,
      NEW.raw_user_meta_data->>'phone',
      COALESCE(NEW.raw_user_meta_data->>'name', 'User'),
      COALESCE((NEW.raw_user_meta_data->>'is_admin')::boolean, false),
      true
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to sync phone number changes between tables
CREATE OR REPLACE FUNCTION public.sync_auth_user_phone()
RETURNS TRIGGER AS $$
BEGIN
  -- Update public.users when auth.users phone changes
  IF OLD.phone IS DISTINCT FROM NEW.phone THEN
    UPDATE public.users
    SET phone_number = NEW.phone,
        updated_at = NOW()
    WHERE auth_user_id = NEW.id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to sync phone number changes from public.users to auth.users
CREATE OR REPLACE FUNCTION public.sync_public_user_phone()
RETURNS TRIGGER AS $$
BEGIN
  -- Update auth.users when public.users phone_number changes
  IF OLD.phone_number IS DISTINCT FROM NEW.phone_number AND NEW.auth_user_id IS NOT NULL THEN
    UPDATE auth.users
    SET phone = NEW.phone_number,
        updated_at = NOW()
    WHERE id = NEW.auth_user_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create triggers
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_auth_user();

DROP TRIGGER IF EXISTS on_auth_user_phone_updated ON auth.users;
CREATE TRIGGER on_auth_user_phone_updated
  AFTER UPDATE OF phone ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.sync_auth_user_phone();

DROP TRIGGER IF EXISTS on_public_user_phone_updated ON public.users;
CREATE TRIGGER on_public_user_phone_updated
  AFTER UPDATE OF phone_number ON public.users
  FOR EACH ROW EXECUTE FUNCTION public.sync_public_user_phone();

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT EXECUTE ON FUNCTION public.handle_new_auth_user() TO authenticated;
GRANT EXECUTE ON FUNCTION public.sync_auth_user_phone() TO authenticated;
GRANT EXECUTE ON FUNCTION public.sync_public_user_phone() TO authenticated;