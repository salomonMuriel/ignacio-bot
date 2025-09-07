-- Migration: Create temporary user for Phase 2 testing
-- This creates a temporary user with UUID 00000000-0000-0000-0000-000000000000
-- Used for testing file uploads before authentication is fully implemented

INSERT INTO users (
    id,
    phone_number,
    name,
    is_admin,
    is_active,
    created_at,
    updated_at
) VALUES (
    '00000000-0000-0000-0000-000000000000',
    '+1234567890',
    'Temporary Test User',
    false,
    true,
    NOW(),
    NOW()
) ON CONFLICT (id) DO NOTHING;