# Database Migrations Log

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