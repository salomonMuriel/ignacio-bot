-- Add OpenAI integration fields to user_files table
-- Migration: 003_add_openai_fields_to_user_files.sql
-- Date: 2025-01-07
-- Description: Add fields to track OpenAI file uploads, vector store IDs, and sync status

ALTER TABLE user_files
ADD COLUMN openai_file_id TEXT DEFAULT NULL,
ADD COLUMN openai_vector_store_id TEXT DEFAULT NULL,
ADD COLUMN openai_uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,
ADD COLUMN openai_sync_status TEXT DEFAULT 'pending';

-- Add index on openai_file_id for faster lookups
CREATE INDEX idx_user_files_openai_file_id ON user_files(openai_file_id) WHERE openai_file_id IS NOT NULL;

-- Add index on sync status for background job queries
CREATE INDEX idx_user_files_sync_status ON user_files(openai_sync_status);

-- Add check constraint for valid sync statuses
ALTER TABLE user_files
ADD CONSTRAINT chk_openai_sync_status
CHECK (openai_sync_status IN ('pending', 'synced', 'failed', 'expired'));

-- Comments
COMMENT ON COLUMN user_files.openai_file_id IS 'OpenAI file ID from files.create API';
COMMENT ON COLUMN user_files.openai_vector_store_id IS 'OpenAI vector store ID where file is stored';
COMMENT ON COLUMN user_files.openai_uploaded_at IS 'Timestamp when file was uploaded to OpenAI';
COMMENT ON COLUMN user_files.openai_sync_status IS 'Sync status: pending, synced, failed, expired';