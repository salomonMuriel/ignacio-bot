-- Agent SDK Data Migration
-- Migration: 004_agent_sdk_data_migration.sql
-- Date: 2025-01-07
-- Description: Migrate existing data to work with Agent SDK enhancements

-- Update existing conversations with default Agent SDK values
UPDATE conversations
SET
    agent_state = '{}',
    project_context = '{}',
    language_preference = 'es'
WHERE
    agent_state IS NULL
    OR project_context IS NULL
    OR language_preference IS NULL;

-- Update existing user files with default metadata and sync status
UPDATE user_files
SET
    metadata = '{}',
    openai_sync_status = 'pending'
WHERE
    metadata IS NULL
    OR openai_sync_status NOT IN ('pending', 'syncing', 'synced', 'failed', 'expired', 'removed');

-- Create a default project for existing users who have conversations but no projects
-- This helps maintain context for existing conversations
INSERT INTO user_projects (user_id, project_name, project_type, current_stage, description, context_data)
SELECT DISTINCT
    c.user_id,
    'My Action Lab Project',
    'startup',
    'ideation',
    'Project created during system migration to Agent SDK',
    jsonb_build_object(
        'migrated', true,
        'migration_date', NOW()::text,
        'original_conversations', (
            SELECT COUNT(*)
            FROM conversations c2
            WHERE c2.user_id = c.user_id
        )
    )
FROM conversations c
LEFT JOIN user_projects up ON up.user_id = c.user_id
WHERE up.id IS NULL;

-- Create temporary admin project for admin users
INSERT INTO user_projects (user_id, project_name, project_type, current_stage, description, context_data)
SELECT
    u.id,
    'Admin Management Project',
    'internal',
    'mature',
    'Administrative project for system management',
    jsonb_build_object(
        'admin_project', true,
        'created_at', NOW()::text
    )
FROM users u
LEFT JOIN user_projects up ON up.user_id = u.id
WHERE u.is_admin = true AND up.id IS NULL;

-- Update project context in conversations based on user projects
UPDATE conversations
SET project_context = (
    SELECT jsonb_build_object(
        'project_id', up.id,
        'project_name', up.project_name,
        'project_type', up.project_type,
        'current_stage', up.current_stage,
        'last_updated', up.updated_at
    )
    FROM user_projects up
    WHERE up.user_id = conversations.user_id
    LIMIT 1
)
WHERE project_context = '{}';

-- Add sample agent interactions for existing conversations with messages
-- This helps with analytics and provides baseline data
INSERT INTO agent_interactions (conversation_id, agent_name, input_text, output_text, tools_used, execution_time_ms)
SELECT
    m.conversation_id,
    CASE
        WHEN m.is_from_user = false THEN 'Legacy AI System'
        ELSE 'User Input'
    END,
    CASE WHEN m.is_from_user = true THEN m.content ELSE NULL END,
    CASE WHEN m.is_from_user = false THEN m.content ELSE NULL END,
    '[]'::jsonb,
    1000
FROM messages m
WHERE m.content IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM agent_interactions ai
      WHERE ai.conversation_id = m.conversation_id
  );

-- Create indexes for better performance on new data
CREATE INDEX IF NOT EXISTS idx_conversations_project_context
ON conversations USING GIN (project_context) WHERE project_context != '{}';

CREATE INDEX IF NOT EXISTS idx_user_files_metadata
ON user_files USING GIN (metadata) WHERE metadata != '{}';

-- Update table statistics for query optimization
ANALYZE conversations;
ANALYZE user_projects;
ANALYZE agent_interactions;
ANALYZE user_files;

-- Log migration completion
INSERT INTO agent_interactions (conversation_id, agent_name, input_text, output_text, tools_used, execution_time_ms)
SELECT
    c.id,
    'System Migration',
    'Agent SDK Migration Completed',
    'Successfully migrated to OpenAI Agent SDK with enhanced capabilities',
    '["migration", "agent_sdk"]'::jsonb,
    0
FROM conversations c
LIMIT 1;
