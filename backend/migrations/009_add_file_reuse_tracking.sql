-- Migration 009: Add file reuse tracking functionality
-- This migration adds support for file reuse across conversations

-- Create file_conversations junction table for many-to-many relationship
CREATE TABLE file_conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    file_id UUID REFERENCES user_files(id) ON DELETE CASCADE,
    conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(file_id, conversation_id)
);

-- Create indexes for performance
CREATE INDEX idx_file_conversations_file_id ON file_conversations(file_id);
CREATE INDEX idx_file_conversations_conversation_id ON file_conversations(conversation_id);

-- Migrate existing file-conversation relationships to the new junction table
-- All existing files with conversation_id should be added to file_conversations
INSERT INTO file_conversations (file_id, conversation_id, created_at)
SELECT id, conversation_id, created_at
FROM user_files
WHERE conversation_id IS NOT NULL;

-- Add comments for documentation
COMMENT ON TABLE file_conversations IS 'Junction table tracking which files are used in which conversations';

-- Migration notes:
-- 1. Existing files keep their conversation_id for backward compatibility
-- 2. New junction table enables many-to-many file-conversation relationships
-- 3. File reuse adds entries to file_conversations without duplicating user_files
-- 4. Same file can be used in multiple conversations efficiently