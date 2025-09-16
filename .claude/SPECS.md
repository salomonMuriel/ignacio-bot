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

### Enhanced Chat Endpoints (IMPLEMENTED & WORKING)
- `GET /chat/conversations` - Get user's conversations
- `POST /chat/messages` - Unified message endpoint (handles both new/continue conversations)
- `GET /chat/conversations/{conversation_id}` - Get conversation with messages
- `PUT /chat/conversations/{conversation_id}` - Update conversation details
- `PUT /chat/conversations/{conversation_id}/project` - Associate conversation with project
- `GET /chat/conversations/{conversation_id}/messages` - Get conversation messages
- `DELETE /chat/conversations/{conversation_id}` - Delete conversation

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
- Users → Files (one-to-many)
- Files → Conversations (many-to-many via file_conversations table)

## 5. File Management System

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

### File API Endpoints
- `GET /files/user/{user_id}` - Get user's files
- `GET /files/{file_id}` - Get file metadata
- `GET /files/{file_id}/url` - Get signed URL for file access
- `GET /files/conversation/{conversation_id}` - Get files for conversation
- `GET /files/{file_id}/conversations` - Get conversation history for file
- `POST /files/{file_id}/reuse` - Reuse file in new conversation
- `DELETE /files/{file_id}` - Delete file
- `GET /files/{file_id}/download` - Download file content

### File Reuse System
- **Storage Efficiency**: Single storage object with multiple metadata records
- **Conversation Linking**: Many-to-many relationship between files and conversations
- **Usage Tracking**: Track file reuse patterns and conversation associations
- **Database Schema**: Junction table `file_conversations` for many-to-many relationships