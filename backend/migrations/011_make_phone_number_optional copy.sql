-- Migration: Make phone_number optional for progressive profiling
-- This allows JIT user creation without requiring phone_number upfront

BEGIN;

-- Make phone_number column nullable in users table
ALTER TABLE users
ALTER COLUMN phone_number DROP NOT NULL;

-- Update the UNIQUE constraint to allow multiple NULL values
-- (PostgreSQL allows multiple NULL values in UNIQUE columns by default)

COMMIT;