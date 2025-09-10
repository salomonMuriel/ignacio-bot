-- Migration 006: Add conversation_id to user_files table for conversation-based file association
-- This enables files to be associated with specific conversations instead of just users

-- Add conversation_id column to user_files table
ALTER TABLE user_files 
ADD COLUMN conversation_id UUID REFERENCES conversations(id) ON DELETE SET NULL;

-- Create index for faster queries by conversation_id
CREATE INDEX idx_user_files_conversation_id ON user_files(conversation_id);

-- Create index for compound queries (user + conversation)
CREATE INDEX idx_user_files_user_conversation ON user_files(user_id, conversation_id);

-- Add comment to document the change
COMMENT ON COLUMN user_files.conversation_id IS 'Links file to specific conversation for conversation-based vector stores and storage organization';

-- Migration notes:
-- 1. Existing files will have conversation_id = NULL (backwards compatible)
-- 2. New files uploaded via conversation endpoints will have conversation_id set
-- 3. File storage path changes from users/{user_id}/files/ to users/{user_id}/conversations/{conversation_id}/
-- 4. Vector stores change from user-based to conversation-based naming