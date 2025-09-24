-- Add auth_user_id column to users table for Auth0 integration
-- This allows mapping between Auth0 users and internal users

-- Add the auth_user_id column
ALTER TABLE users ADD COLUMN auth_user_id VARCHAR(255);

-- Create unique index for auth_user_id (should be unique per Auth0 user)
CREATE UNIQUE INDEX idx_users_auth_user_id ON users(auth_user_id) WHERE auth_user_id IS NOT NULL;

-- Add comment for clarity
COMMENT ON COLUMN users.auth_user_id IS 'Auth0 user ID from JWT token sub claim';