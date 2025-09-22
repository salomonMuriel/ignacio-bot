-- Create RLS policies for auth integration
-- Migration: 012_create_rls_policies
-- Date: 2025-09-22

-- Enable RLS on public.users if not already enabled
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for public.users
DROP POLICY IF EXISTS "Users can view their own profile" ON public.users;
CREATE POLICY "Users can view their own profile" ON public.users
  FOR SELECT USING (auth_user_id = auth.uid());

DROP POLICY IF EXISTS "Users can update their own profile" ON public.users;
CREATE POLICY "Users can update their own profile" ON public.users
  FOR UPDATE USING (auth_user_id = auth.uid());

DROP POLICY IF EXISTS "Admins can view all users" ON public.users;
CREATE POLICY "Admins can view all users" ON public.users
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users admin_user
      WHERE admin_user.auth_user_id = auth.uid()
      AND admin_user.is_admin = true
      AND admin_user.is_active = true
    )
  );

DROP POLICY IF EXISTS "Admins can manage all users" ON public.users;
CREATE POLICY "Admins can manage all users" ON public.users
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users admin_user
      WHERE admin_user.auth_user_id = auth.uid()
      AND admin_user.is_admin = true
      AND admin_user.is_active = true
    )
  );

-- Helper function to check if current user is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.users
    WHERE auth_user_id = auth.uid()
    AND is_admin = true
    AND is_active = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;