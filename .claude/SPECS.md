# Ignacio Bot - Technical Specifications

## 1. System Architecture Overview

### High-Level Architecture
- **Backend**: Python FastAPI REST API with OpenAI Agent SDK
- **Frontend**: React 19.1 with TypeScript and Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **Storage**: Supabase Storage with OpenAI Vector Stores
- **Authentication**: SuperTokens with passwordless OTP authentication
- **External Integrations**: WhatsApp Business API, OpenAI API

### System Components
1. **Web Frontend** - React 19.1 application with global state management
2. **REST API Backend** - FastAPI Python application
3. **WhatsApp Service** - Integration service for WhatsApp Business API
4. **AI Processing Service** - OpenAI Agent SDK with 8 specialized domain experts and handoff monitoring
5. **File Processing Service** - Media, document handling, and vector store integration
6. **Authentication Service** - SuperTokens OTP and session management with role-based access control
7. **Project Management Service** - Multi-project context management

## 2. Authentication & Security Architecture

### SuperTokens Implementation
- **Authentication Method**: Passwordless OTP via email/phone
- **Session Management**: JWT-based sessions with automatic refresh
- **Multi-Factor Authentication**: OTP verification with account linking
- **Role-Based Access Control**: Admin and user roles with granular permissions
- **Admin Dashboard**: Built-in SuperTokens admin interface at `/auth/dashboard`

### Security Features
- **Session-Based Authentication**: All user endpoints require valid SuperTokens session
- **Ownership Validation**: Users can only access their own data (conversations, files, projects)
- **Role-Based Admin Access**: Admin operations require verified admin role
- **Audit Logging**: Comprehensive logging for admin actions and security events
- **CORS Protection**: Properly configured CORS with SuperTokens headers

### Protected Endpoints (28 total)
- **Chat Operations**: All conversation management requires authentication
- **File Management**: Upload, download, and file operations with ownership validation
- **Project Management**: Full project CRUD with user ownership verification
- **Admin Operations**: User management and system administration with role verification

### Public Endpoints (16 total)
- **Health Checks**: System status and database connectivity
- **Authentication Routes**: SuperTokens login/signup flows
- **Reference Data**: Project types and stages (read-only)

## 3. Multi-Project Architecture

### Project Management
- **Multiple Projects per User**: Users can create and manage multiple independent projects
- **Project Types**: Startup, NGO, Foundation, Spinoff, Internal, Other
- **Project Stages**: Ideation, Research, Validation, Development, Testing, Launch, Growth, Mature
- **Project Context**: Each project maintains independent context for AI conversations

### Conversation-Project Association
- **Project-Specific Conversations**: Each conversation can be associated with a specific project
- **Dynamic Context Loading**: AI automatically uses relevant project context
- **Cross-Project Support**: Users can switch between projects seamlessly

## 4. API Architecture

### Authentication Endpoints
- `GET /api/auth/sessioninfo` - Get current session information
- `GET /auth/*` - SuperTokens authentication flows (login, signup, etc.)
- `GET /auth/dashboard` - SuperTokens admin dashboard

### Project Management Endpoints (Protected)
- `GET /project/by_user/me` - List authenticated user's projects
- `POST /project/` - Create new project for authenticated user
- `GET/PUT/DELETE /project/{id}` - Manage specific projects (ownership validated)
- `GET /project/conversations/{id}` - Get project conversations (ownership validated)
- `GET/PUT /project/{id}/context` - Manage project-specific context (ownership validated)
- `GET /project/types` - Available project types (public)
- `GET /project/stages` - Available project stages (public)

### Enhanced Chat Endpoints (Protected)
- `GET /chat/conversations` - Get authenticated user's conversations
- `POST /chat/messages` - Unified message endpoint with session-based user identification
- `GET /chat/conversations/{conversation_id}` - Get conversation with messages (ownership validated)
- `PUT /chat/conversations/{conversation_id}` - Update conversation details (ownership validated)
- `PUT /chat/conversations/{conversation_id}/project` - Associate conversation with user's project
- `GET /chat/conversations/{conversation_id}/messages` - Get conversation messages (ownership validated)
- `DELETE /chat/conversations/{conversation_id}` - Delete conversation (ownership validated)
- `GET /chat/conversations/{conversation_id}/summary` - Get conversation summary (ownership validated)
- `GET /chat/conversations/{conversation_id}/interactions` - Get agent interactions (ownership validated)

### File Management Endpoints (Protected)
- `POST /files/upload` - Upload files for authenticated user
- `GET /files/user/me` - Get authenticated user's files
- `GET /files/{file_id}` - Get file metadata (ownership validated)
- `GET /files/{file_id}/download` - Download file content (ownership validated)
- `GET /files/{file_id}/url` - Get signed URL for file access (ownership validated)
- `GET /files/conversation/{conversation_id}` - Get files for conversation (ownership validated)
- `GET /files/{file_id}/conversations` - Get conversation history for file (ownership validated)
- `POST /files/{file_id}/reuse` - Reuse file in new conversation (ownership validated)
- `DELETE /files/{file_id}` - Delete file (ownership validated)
- `GET /files/user/me/with-conversations` - Get user's files with conversation data

### Admin Endpoints (Admin Role Required)
- `POST /api/admin/sync-files/{user_id}` - Trigger file sync for specific user
- `POST /api/admin/sync-all-files` - Sync files for all users (maintenance)
- `GET /api/admin/file-sync-status/{user_id}` - Get file synchronization status

## 5. Database Schema

### Core Tables
- **users** - User accounts and authentication
- **user_projects** - Project information and context
- **conversations** - Chat sessions with project associations
- **messages** - Individual chat messages
- **user_files** - File uploads with vector store integration
- **agent_interactions** - AI agent usage tracking

### Key Relationships
- Users → Projects (one-to-many)
- Projects → Conversations (one-to-many)
- Conversations → Messages (one-to-many)
- Conversations → Agent Interactions (one-to-many)
- Users → Files (one-to-many)
- Files → Conversations (many-to-many via file_conversations table)

## 6. File Management System

### File Storage Architecture
- **Storage Backend**: Supabase Storage for binary file data
- **Metadata Storage**: PostgreSQL `user_files` table for file metadata
- **File Validation**: 20MB size limit, images and PDFs only
- **Upload Flow**: FormData through `/chat/messages` endpoint

### File Modal Interface
- **Two-Tab System**: Upload New files or select from Previous Files
- **Upload Interface**: Drag & drop zone with file picker and validation
- **File Library**: Search, filter by type, sort by date/name/size
- **Enhanced UX**: Recent files section, file metadata display
- **File Reuse**: Ability to reuse files across multiple conversations


### File Reuse System
- **Storage Efficiency**: Single storage object with multiple metadata records
- **Conversation Linking**: Many-to-many relationship between files and conversations
- **Usage Tracking**: Track file reuse patterns and conversation associations
- **Database Schema**: Junction table `file_conversations` for many-to-many relationships

## 7. AI Agent System Architecture (REFACTORED - September 2025)

### Multi-Agent Framework
- **Main Coordinator**: Ignacio agent orchestrates specialist handoffs
- **8 Domain Experts**: Specialized agents with domain-specific instructions and tool knowledge
- **Project Context Integration**: All agents receive user project context automatically
- **Lifecycle Monitoring**: Comprehensive hooks track agent interactions and handoffs

### Domain Specialists
1. **Marketing Expert** - Customer acquisition, growth strategies, digital marketing tools
2. **Technology Expert** - Tech stack selection, development workflows, infrastructure
3. **Finance Expert** - Business models, funding strategies, financial planning tools
4. **Sustainability Expert** - ESG strategies, impact measurement, environmental tools
5. **Legal/Compliance Expert** - Business formation, contracts, regulatory compliance
6. **Operations Expert** - Process optimization, supply chain, workflow automation
7. **Product/Design Expert** - UX/UI design, product development, user research
8. **Sales Expert** - Sales strategy, pipeline management, CRM tools

### Agent Instruction System
- **Base Personality**: Shared entrepreneurial mentor characteristics across all agents
- **Domain-Specific Instructions**: Researched tool recommendations and specialized knowledge
- **Project Diversity Support**: NGOs, foundations, traditional companies, not just tech startups
- **Tech-Optimization Focus**: All agents suggest appropriate tools for automation and efficiency
- **Adaptive Mentoring**: Balance between Socratic questioning and direct assistance

### Monitoring and Logging
- **[PROJECT_CONTEXT]** - Agent creation and instruction generation
- **[AI_SERVICE]** - Service operations and agent setup
- **[AGENT_LIFECYCLE]** - Agent start/end events
- **[AGENT_HANDOFF]** - Inter-agent handoffs with context information
- **[AGENT_TOOL]** - Specialist tool usage and results

### Testing Infrastructure
- **Quick Test**: `uv run python quick_test.py` - 30-second system validation
- **Comprehensive Test**: `uv run python test_agent_system.py` - Full system validation
- **Handoff Test**: `uv run python test_handoff_hooks.py` - Lifecycle hooks validation