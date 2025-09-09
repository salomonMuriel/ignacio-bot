# Database Migrations Log

## Migration Status
**Last Applied**: Migration 004
**Date**: September 7, 2025

## Migration History

### 001_initial_schema.sql ✅
**Status**: Applied
**Description**: Initial database schema with core tables
- Created `users` table with phone number authentication
- Created `conversations` table for chat sessions
- Created `messages` table for chat history
- Created `user_sessions` table for authentication
- Created `otp_codes` table for WhatsApp verification
- Set up proper foreign key relationships and RLS policies

### 002_add_user_files_table.sql ✅
**Status**: Applied
**Description**: File management support
- Created `user_files` table for uploaded document tracking
- File metadata storage (name, path, type, size)
- Foreign key relationship to users
- Indexes for performance

### 003_add_openai_fields_to_user_files.sql ✅
**Status**: Applied
**Description**: OpenAI integration fields
- Added `openai_file_id` for OpenAI file references
- Added `openai_vector_store_id` for document search
- Added `openai_uploaded_at` timestamp tracking
- Added `openai_sync_status` for sync state management
- Indexes on OpenAI fields for query performance

### 004_create_temporary_user.sql ✅
**Status**: Applied
**Description**: Test user for Phase 2 development
- Created temporary user record with UUID `00000000-0000-0000-0000-000000000000`
- Phone number: `+0000000000`
- Name: `Temporary Test User`
- Used for file upload testing before authentication implementation
- Resolves foreign key constraint violations during development

## Database Schema Overview

### Current Tables
1. **users** - User accounts with WhatsApp phone numbers
2. **conversations** - Chat sessions between users and Ignacio
3. **messages** - Individual chat messages with file attachments
4. **user_files** - Uploaded file metadata with OpenAI sync status
5. **user_sessions** - Authentication session management
6. **otp_codes** - OTP verification for WhatsApp login

### Key Features
- Row Level Security (RLS) enabled on all tables
- Proper foreign key relationships
- Indexes for performance optimization
- UUID primary keys throughout
- Timestamp tracking (created_at, updated_at)

## Pending Migrations
None currently required.

## Migration Notes
- All migrations applied manually via Supabase SQL Editor. Ask user to apply them.
- Each migration includes proper error handling (IF NOT EXISTS, ON CONFLICT)
- Foreign key constraints properly maintained
- Indexes created for performance-critical queries

## Development Database State
- **Environment**: Development (Supabase)
- **Connection**: Working via environment variables in `backend/.env.local`
- **Test Data**: Temporary user created for testing
- **File Storage**: Connected to Supabase Storage bucket "user-files"
- **OpenAI Integration**: Schema ready, service implementation in progress