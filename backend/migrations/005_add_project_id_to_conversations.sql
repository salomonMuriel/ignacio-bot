-- Migration 005: Add project_id column to conversations table
-- This migration adds support for associating conversations with specific projects

-- Add project_id column to conversations table
ALTER TABLE conversations 
ADD COLUMN project_id UUID REFERENCES user_projects(id) ON DELETE SET NULL;

-- Add index for better query performance
CREATE INDEX idx_conversations_project_id ON conversations(project_id);

-- Add index for user_id + project_id combination (common query pattern)
CREATE INDEX idx_conversations_user_project ON conversations(user_id, project_id);

-- Comments for documentation
COMMENT ON COLUMN conversations.project_id IS 'References the project this conversation belongs to. NULL means no specific project association.';