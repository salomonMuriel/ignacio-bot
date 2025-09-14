# Ignacio Bot - Technical Specifications

## 1. System Architecture Overview

### High-Level Architecture
- **Backend**: Python FastAPI REST API with OpenAI Agent SDK
- **Frontend**: React 19.1 with TypeScript and Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **Storage**: Supabase Storage with OpenAI Vector Stores
- **External Integrations**: WhatsApp Business API, OpenAI API
- **Authentication**: OTP-based authentication via WhatsApp

### System Components
1. **Web Frontend** - React 19.1 application with global state management
2. **REST API Backend** - FastAPI Python application
3. **WhatsApp Service** - Integration service for WhatsApp Business API
4. **AI Processing Service** - OpenAI Agent SDK with 8 specialized agents
5. **File Processing Service** - Media, document handling, and vector store integration
6. **Authentication Service** - OTP and session management
7. **Project Management Service** - Multi-project context management

## 2. Multi-Project Architecture

### Project Management
- **Multiple Projects per User**: Users can create and manage multiple independent projects
- **Project Types**: Startup, NGO, Foundation, Spinoff, Internal, Other
- **Project Stages**: Ideation, Research, Validation, Development, Testing, Launch, Growth, Mature
- **Project Context**: Each project maintains independent context for AI conversations

### Conversation-Project Association
- **Project-Specific Conversations**: Each conversation can be associated with a specific project
- **Dynamic Context Loading**: AI automatically uses relevant project context
- **Cross-Project Support**: Users can switch between projects seamlessly

## 3. API Architecture

### Project Management Endpoints
- `GET/POST /project/projects` - List/create user projects
- `GET/PUT/DELETE /project/projects/{id}` - Manage specific projects
- `GET /project/projects/{id}/conversations` - Get project conversations
- `GET/PUT /project/projects/{id}/context` - Manage project-specific context
- `GET /project/types` - Available project types
- `GET /project/stages` - Available project stages

### Enhanced Chat Endpoints
- `POST /api/chat/conversations/start` - Create conversation (with optional project_id)
- `PUT /api/chat/conversations/{id}/project` - Associate conversation with project
- `GET/PUT /api/chat/conversations/{id}` - Manage conversations with project info
- `POST /api/chat/files/{id}/integrate` - Integrate files into AI context

## 4. Database Schema

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