-- Agent SDK Enhancement Migration
-- Migration: 003_agent_sdk_enhancement.sql
-- Date: 2025-01-07
-- Description: Enhance database schema for OpenAI Agent SDK integration

-- Add Agent SDK fields to conversations table
ALTER TABLE conversations
ADD COLUMN openai_session_id TEXT DEFAULT NULL,
ADD COLUMN agent_state JSONB DEFAULT '{}',
ADD COLUMN project_context JSONB DEFAULT '{}',
ADD COLUMN language_preference VARCHAR(10) DEFAULT 'es';

-- Create unique index on openai_session_id
CREATE UNIQUE INDEX idx_conversations_openai_session_id ON conversations(openai_session_id) WHERE openai_session_id IS NOT NULL;

-- Create index on language preference for filtering
CREATE INDEX idx_conversations_language ON conversations(language_preference);

-- Create agent_interactions table for tracking agent usage
CREATE TABLE agent_interactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
    agent_name VARCHAR(100) NOT NULL,
    input_text TEXT,
    output_text TEXT,
    tools_used JSONB DEFAULT '[]',
    execution_time_ms INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for agent_interactions
CREATE INDEX idx_agent_interactions_conversation_id ON agent_interactions(conversation_id);
CREATE INDEX idx_agent_interactions_agent_name ON agent_interactions(agent_name);
CREATE INDEX idx_agent_interactions_created_at ON agent_interactions(created_at DESC);

-- Create user_projects table for project context management
CREATE TABLE user_projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    project_name VARCHAR(255) NOT NULL,
    project_type VARCHAR(100) CHECK (project_type IN ('startup', 'ngo', 'foundation', 'spinoff', 'internal', 'other')),
    description TEXT,
    current_stage VARCHAR(100) CHECK (current_stage IN ('ideation', 'research', 'validation', 'development', 'testing', 'launch', 'growth', 'mature')),
    target_audience TEXT,
    problem_statement TEXT,
    solution_approach TEXT,
    business_model TEXT,
    context_data JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for user_projects
CREATE INDEX idx_user_projects_user_id ON user_projects(user_id);
CREATE INDEX idx_user_projects_type ON user_projects(project_type);
CREATE INDEX idx_user_projects_stage ON user_projects(current_stage);
CREATE INDEX idx_user_projects_created_at ON user_projects(created_at DESC);

-- Add trigger for user_projects updated_at
CREATE TRIGGER update_user_projects_updated_at
    BEFORE UPDATE ON user_projects
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Enhance user_files table with additional fields for Agent SDK
ALTER TABLE user_files
ADD COLUMN content_preview TEXT DEFAULT NULL,
ADD COLUMN metadata JSONB DEFAULT '{}',
ADD COLUMN vector_store_id TEXT DEFAULT NULL;

-- Update existing constraint to include new valid sync statuses
ALTER TABLE user_files
DROP CONSTRAINT IF EXISTS chk_openai_sync_status;

ALTER TABLE user_files
ADD CONSTRAINT chk_openai_sync_status
CHECK (openai_sync_status IN ('pending', 'syncing', 'synced', 'failed', 'expired', 'removed'));

-- Add index on vector_store_id for user-specific vector stores
CREATE INDEX idx_user_files_vector_store_id ON user_files(vector_store_id) WHERE vector_store_id IS NOT NULL;

-- Comments for new fields and tables
COMMENT ON COLUMN conversations.openai_session_id IS 'OpenAI Agent SDK session ID for conversation continuity';
COMMENT ON COLUMN conversations.agent_state IS 'Current agent context and state (JSONB)';
COMMENT ON COLUMN conversations.project_context IS 'User project information relevant to conversation';
COMMENT ON COLUMN conversations.language_preference IS 'User preferred language for responses';

COMMENT ON TABLE agent_interactions IS 'Tracking table for agent usage and tool calls';
COMMENT ON COLUMN agent_interactions.agent_name IS 'Name of the agent that handled the interaction';
COMMENT ON COLUMN agent_interactions.tools_used IS 'Array of tools called during interaction (JSON array)';
COMMENT ON COLUMN agent_interactions.execution_time_ms IS 'Time taken for agent to process and respond';

COMMENT ON TABLE user_projects IS 'Project context storage for Action Lab participants';
COMMENT ON COLUMN user_projects.project_type IS 'Type: startup, ngo, foundation, spinoff, internal, other';
COMMENT ON COLUMN user_projects.current_stage IS 'Stage: ideation, research, validation, development, testing, launch, growth, mature';
COMMENT ON COLUMN user_projects.context_data IS 'Additional flexible project context (JSONB)';

COMMENT ON COLUMN user_files.content_preview IS 'First 500 characters of file content for quick reference';
COMMENT ON COLUMN user_files.metadata IS 'Additional file metadata (JSONB)';
COMMENT ON COLUMN user_files.vector_store_id IS 'User-specific vector store ID (different from shared vector stores)';