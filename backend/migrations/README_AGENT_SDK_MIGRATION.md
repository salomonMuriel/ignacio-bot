# Agent SDK Migration Guide

## Overview
This guide documents the database migration from the basic AI service to the enhanced OpenAI Agent SDK integration.

## Migration Files

### 003_agent_sdk_enhancement.sql
**Purpose**: Adds new tables and columns for Agent SDK functionality
**Changes**:
- Enhanced `conversations` table with Agent SDK fields
- New `agent_interactions` table for tracking agent usage
- New `user_projects` table for project context
- Enhanced `user_files` table with additional metadata
- New indexes for performance optimization

### 004_agent_sdk_data_migration.sql
**Purpose**: Migrates existing data to work with new schema
**Changes**:
- Updates existing conversations with default Agent SDK values
- Creates default projects for existing users
- Populates agent_interactions with legacy data
- Updates project context in conversations
- Adds performance indexes

## How to Apply Migrations

### Development Environment
```bash
# Navigate to backend directory
cd backend

# Apply migrations via Supabase SQL Editor or psql
# Copy and paste the SQL from each migration file in order:
# 1. 003_agent_sdk_enhancement.sql
# 2. 004_agent_sdk_data_migration.sql
```

### Production Environment
**⚠️ Important**: Test thoroughly in staging before applying to production

1. **Backup Database**
   ```bash
   pg_dump -h [host] -U [user] [database] > backup_before_agent_sdk.sql
   ```

2. **Apply Migrations During Low Traffic**
   - Apply migrations during maintenance window
   - Monitor performance during migration
   - Verify data integrity after completion

3. **Verify Migration Success**
   ```sql
   -- Check new tables exist
   SELECT tablename FROM pg_tables WHERE schemaname = 'public'
   AND tablename IN ('agent_interactions', 'user_projects');

   -- Check new columns exist
   SELECT column_name FROM information_schema.columns
   WHERE table_name = 'conversations'
   AND column_name IN ('openai_session_id', 'agent_state', 'project_context');

   -- Check data migration
   SELECT COUNT(*) FROM agent_interactions;
   SELECT COUNT(*) FROM user_projects;
   ```

## New Schema Features

### Enhanced Conversations
- `openai_session_id`: Links to OpenAI Agent SDK sessions
- `agent_state`: Stores current agent context (JSONB)
- `project_context`: User's project information for context
- `language_preference`: User's preferred response language

### Agent Interactions Tracking
- Tracks which agent handled each interaction
- Records tools used (file_search, web_search, etc.)
- Measures execution time for performance monitoring
- Stores input/output for debugging and analytics

### User Projects Context
- Comprehensive project information storage
- Supports different project types (startup, NGO, etc.)
- Tracks project stages (ideation to mature)
- Flexible context_data field for additional information

### Enhanced File Management
- Content previews for quick reference
- Metadata storage for file-specific information
- User-specific vector store management
- Enhanced sync status tracking

## Post-Migration Tasks

1. **Update AI Service Code**
   - Replace existing AI service with Agent SDK implementation
   - Update API endpoints to use new response models
   - Test agent routing and tool integration

2. **Update Frontend**
   - Enhance UI to show agent information
   - Add project context management
   - Update file upload to handle new metadata

3. **Testing**
   - Run comprehensive test suite
   - Test multi-agent workflows
   - Verify file search integration
   - Test web search capabilities

4. **Monitoring**
   - Monitor agent_interactions for usage patterns
   - Track performance metrics
   - Monitor file sync status

## Rollback Plan

If issues occur, the migration can be rolled back:

```sql
-- Remove new tables
DROP TABLE IF EXISTS agent_interactions;
DROP TABLE IF EXISTS user_projects;

-- Remove new columns from conversations
ALTER TABLE conversations
DROP COLUMN IF EXISTS openai_session_id,
DROP COLUMN IF EXISTS agent_state,
DROP COLUMN IF EXISTS project_context,
DROP COLUMN IF EXISTS language_preference;

-- Remove new columns from user_files
ALTER TABLE user_files
DROP COLUMN IF EXISTS content_preview,
DROP COLUMN IF EXISTS metadata,
DROP COLUMN IF EXISTS vector_store_id;

-- Reset sync status constraint
ALTER TABLE user_files
DROP CONSTRAINT IF EXISTS chk_openai_sync_status;

ALTER TABLE user_files
ADD CONSTRAINT chk_openai_sync_status
CHECK (openai_sync_status IN ('pending', 'synced', 'failed', 'expired'));
```

**⚠️ Warning**: Rolling back will lose all Agent SDK enhancement data including agent interactions, project contexts, and file metadata.

## Expected Benefits

After migration completion:
- ✅ Multi-agent conversations with specialized expertise
- ✅ Document-aware AI responses via file search
- ✅ Current information via web search
- ✅ Project-context aware conversations
- ✅ Multi-language support with translation
- ✅ Enhanced analytics and monitoring
- ✅ Improved performance and reliability

## Support

If issues arise during migration:
1. Check migration logs and error messages
2. Verify all prerequisites are met
3. Test in isolated environment first
4. Have rollback plan ready
5. Monitor system performance post-migration