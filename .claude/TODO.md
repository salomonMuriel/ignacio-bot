# Authentication Implementation TODO

## Overview
Implementing Supabase Auth + FastAPI JWT validation with passwordless OTP login and WhatsApp phone number authentication.

## Phase 1: Database Setup
- [x] Add auth linking field to public.users table
  - Add `auth_user_id UUID REFERENCES auth.users(id)`
  - Add unique constraint on `auth_user_id`
- [x] Create database triggers for user sync
  - Auto-create `public.users` record when auth user signs up
  - Sync phone number changes between tables
- [ ] Add admin user management functions
  - Function to invite users (creates auth.users record)
  - Function to deactivate users
  - RLS policies for admin operations

## Phase 2: Backend Authentication
- [ ] Install and configure JWT validation
  - Add `python-jose[cryptography]` dependency
  - Create auth middleware with Supabase JWT secret
  - Add user dependency injection
- [ ] Create auth service layer
  - User lookup by auth.users.id
  - Admin permission checking
  - Phone number utilities for WhatsApp
- [ ] Update all existing endpoints
  - Add auth dependency to protected routes
  - Replace mock user ID with authenticated user
  - Add admin-only decorators where needed
- [ ] Create admin user management endpoints
  - `POST /admin/users` - Create new user (admin only)
  - `PUT /admin/users/{id}` - Update user (admin only)
  - `DELETE /admin/users/{id}` - Deactivate user (admin only)
- [ ] Implement WhatsApp authentication
  - Phone number lookup in webhook handler
  - Link to authenticated user sessions

## Phase 3: Frontend Authentication
- [ ] Replace mock auth with Supabase Auth
  - Install `@supabase/supabase-js`
  - Configure Supabase client
  - Implement auth context/state management
- [ ] Implement OTP login flow
  - Phone number input component
  - OTP verification component
  - Error handling and loading states
- [ ] Update API service layer
  - Add JWT token to all requests
  - Handle auth failures and token refresh
  - Update type definitions
- [ ] Add auth guards and routing
  - Protected route components
  - Redirect logic for unauthenticated users
  - Admin-only UI components

## Phase 4: Data Migration & Testing
- [ ] Migrate existing mock data
  - Create auth.users for existing public.users
  - Link accounts via phone numbers
  - Preserve user relationships (projects, conversations)
- [ ] Comprehensive testing
  - Unit tests for auth middleware
  - Integration tests for login flow
  - WhatsApp authentication testing
  - Admin operations testing

## Phase 5: Production Readiness
- [ ] Security hardening
  - Rate limiting on auth endpoints
  - Secure token storage strategy
  - CORS configuration update
  - Environment variable validation
- [ ] Monitoring and logging
  - Auth event logging
  - Failed login attempt tracking
  - User activity monitoring

## Critical Notes
- **Database Integration**: Link `auth.users` and `public.users` via `auth_user_id` field
- **Security**: Use Supabase JWT secret for token validation
- **Admin Users**: Only admins can create/manage other users
- **WhatsApp**: Phone number lookup for user identification
- **Migration**: Preserve existing user data and relationships