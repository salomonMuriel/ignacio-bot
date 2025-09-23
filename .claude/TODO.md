# Supertokens Authentication Implementation Plan

## Overview
Replace our current mock authentication system with Supertokens for both backend (FastAPI) and frontend (React). Based on the example implementation at ~/git/supertokens-example-app/.

## Implementation Tasks

### Phase 1: Backend Integration ✅ COMPLETED
- [x] Add Supertokens Python dependency to backend
- [x] Create Supertokens configuration for backend
- [x] Integrate Supertokens middleware into FastAPI app
- [x] Update backend auth endpoints to use Supertokens
- [x] Create user management endpoints for admin functionality

### Phase 2: Frontend Integration ✅ COMPLETED
- [x] Add Supertokens React dependency to frontend
- [x] Create Supertokens configuration for frontend
- [x] Update React App.tsx to integrate Supertokens
- [x] Replace AuthContext with Supertokens session management
- [x] Update ProtectedRoute to use Supertokens SessionAuth
- [x] Update API client to handle Supertokens authentication
- [x] Replace LoginModal with Supertokens pre-built UI

### Phase 3: Configuration & Testing ✅ COMPLETED
- [x] Update environment variables and configuration
- [x] Test authentication flow end-to-end
- [x] Verify admin functionality works
- [x] Test OTP login flow
- [x] Ensure project/chat functionality works with new auth

## Key Implementation Details

### Backend Configuration
- Use passwordless authentication with OTP (email or phone)
- Configure multifactor auth for enhanced security
- Set up account linking for email/phone combinations
- Use development Supertokens core for now (https://try.supertokens.com)

### Frontend Configuration
- Integrate Supertokens pre-built UI components
- Configure auth routes (/auth)
- Set up session management
- Redirect authenticated users to /dashboard or /projects

### Authentication Flow
1. User enters phone number
2. Supertokens sends OTP via SMS/WhatsApp
3. User verifies OTP
4. Session is created and user is authenticated
5. User can access protected routes

### Migration Strategy
- Keep existing AuthContext initially for compatibility
- Gradually replace mock authentication calls
- Update API client to use Supertokens session tokens
- Remove mock authentication once everything is working

## Files to Modify

### Backend
- `backend/pyproject.toml` - Add supertokens-python dependency
- `backend/app/core/config.py` - Add Supertokens configuration
- `backend/app/main.py` - Integrate Supertokens middleware
- `backend/app/core/supertokens_config.py` - New Supertokens config file
- `backend/app/routers/auth.py` - New auth endpoints if needed

### Frontend
- `frontend/package.json` - Add supertokens-auth-react dependency
- `frontend/src/App.tsx` - Integrate Supertokens wrapper and routes
- `frontend/src/config/supertokens.tsx` - New Supertokens config file
- `frontend/src/contexts/AuthContext.tsx` - Update to use Supertokens
- `frontend/src/components/ProtectedRoute.tsx` - Use SessionAuth
- `frontend/src/services/api.ts` - Update to handle auth tokens
- `frontend/src/components/auth/LoginModal.tsx` - Remove or replace

## Environment Variables Needed
- `SUPERTOKENS_CONNECTION_URI` (https://try.supertokens.com for dev)
- `SUPERTOKENS_API_KEY` (if using managed core)
- Frontend needs to know backend auth endpoints