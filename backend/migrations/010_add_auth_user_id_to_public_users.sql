-- Add auth_user_id field to link public.users with auth.users
-- Migration: 001_add_auth_user_id_to_public_users
-- Date: 2025-09-22

-- Add auth_user_id field to link public.users with auth.users
ALTER TABLE public.users
ADD COLUMN auth_user_id UUID REFERENCES auth.users(id);

-- Add unique constraint to ensure one-to-one relationship
ALTER TABLE public.users
ADD CONSTRAINT users_auth_user_id_unique UNIQUE (auth_user_id);

-- Add index for performance
CREATE INDEX idx_users_auth_user_id ON public.users(auth_user_id);

-- Add comment to document the relationship
COMMENT ON COLUMN public.users.auth_user_id IS 'Links to auth.users.id - enables Supabase Auth integration while maintaining app-specific user data';