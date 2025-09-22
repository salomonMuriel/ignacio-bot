# Authentication Implementation TODO

## Overview
Implementing Supabase Auth + FastAPI JWT validation with passwordless OTP login and WhatsApp phone number authentication.

## Phase 1: Database Setup ✅ COMPLETED
- [x] Add auth linking field to public.users table
  - ✅ Added `auth_user_id UUID REFERENCES auth.users(id)` with unique constraint
  - ✅ Migration: `001_add_auth_user_id_to_public_users.sql`
- [x] Create database triggers for user sync
  - ✅ Auto-create `public.users` record when auth user signs up
  - ✅ Sync phone number changes between tables
  - ✅ Migration: `011_create_user_sync_triggers.sql`
- [x] Add admin user management functions
  - ✅ RLS policies for user access control
  - ✅ Helper function `is_admin()` for permission checking
  - ✅ Migration: `012_create_rls_policies.sql`

## Phase 2: Backend Authentication ✅ COMPLETED
- [x] Install and configure JWT validation
  - ✅ Added `python-jose[cryptography]` dependency
  - ✅ Added `supabase_jwt_secret` to config
  - ✅ Created auth middleware in `app/core/auth.py`
- [x] Create auth service layer
  - ✅ JWT token verification with Supabase
  - ✅ User dependency injection (`get_current_user`, `get_current_admin_user`)
  - ✅ Phone number utilities for WhatsApp
  - ✅ Added `get_user_by_auth_id` to database service
- [x] Update all existing endpoints
  - ✅ Updated chat router to use authenticated users
  - ✅ Updated project router with user ownership verification
  - ✅ Replaced TEMP_USER_ID with current_user.id
  - ✅ Added access control for user-owned resources
- [x] Create admin user management endpoints
  - ✅ Created `app/routers/admin_users.py`
  - ✅ `GET/POST /admin/users` - List/create users (admin only)
  - ✅ `GET/PUT/DELETE /admin/users/{id}` - Manage specific users
  - ✅ Supabase Auth Admin API integration
- [ ] Implement WhatsApp authentication
  - 🔄 **IN PROGRESS** - Phone number lookup in webhook handler
  - ⏳ Link to authenticated user sessions

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
- [ ] **CRITICAL: Migrate existing mock data**
  - Create auth.users for existing public.users
  - Link accounts via phone numbers
  - Preserve user relationships (projects, conversations)
  - Script: Create migration script to handle existing data
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

## Current Implementation Status

### ✅ Completed (Commit: f36b4f6)
- Database schema with auth integration
- JWT validation middleware
- Protected API endpoints
- Admin user management system
- User ownership verification

### 🔄 Next Session Priority
1. **WhatsApp Authentication** - Add phone number lookup endpoint
2. **Frontend Auth Implementation** - Replace mock auth with Supabase
3. **Data Migration** - Handle existing users without breaking system
4. **Environment Setup** - Add `SUPABASE_JWT_SECRET` to env files

### 🔧 Technical Context
- **Auth Flow**: Supabase Auth → JWT → FastAPI middleware → User lookup
- **Database**: `auth.users` linked to `public.users` via `auth_user_id`
- **Admin System**: Full CRUD via `/admin/users` endpoints
- **Files**: All migrations in `backend/migrations/` for reference

### ⚠️ Critical Dependencies
- Frontend needs `@supabase/supabase-js` installation
- Environment needs `SUPABASE_JWT_SECRET` configuration
- Existing users need migration to auth system
- WhatsApp webhook needs phone number authentication