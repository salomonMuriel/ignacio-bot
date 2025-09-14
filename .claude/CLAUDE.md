## Ignacio Bot Description
Ignacio is a chat assistant that helps users in the development of their project, which they are building as part of an education program.

they are part of the Action Lab, an innovative education program that teaches people how to build projects.

Their project is typically a new company, a new NGO or foundation, a company spinoff, or a new project inside a company that will allow it to grow to a new level.

Ignacio is accessible through both WhatsApp and a web interface.

Users can message Ignacio through any of these channels, and Ignacio will respond according to its saved information about the user, their project and any other information the system has provided Ignacio.

## Features

Normal Users:
* Users should be able to chat with Ignacio using Whatsapp or a Web interface.
* Any images, videos or audio files sent to Ignacio should be saved in that user's folder in Supabase Storage.
* Users should be able to upload any other kind of file to Ignacio (documents, PDFs, presentations, etc). Ignacio should be able to pull these into context when it needs to.
* Ignacio should respond to the user according to their questions on the project. Prompts for these interactions should be tailored to the response at hand. Example, if the user asks about a marketing problem, Ignacio should act as a marketing expert.
* Users should login to use Ignacio from the web platform. If they use Whatsapp, their number should be stored as the number of a created user for Ignacio to respond positively.
* Users shouldn't be able to create a new account. Accounts are created by administrators manually.
* In order to login, users get a OTP code to their stored WhatsApp numbers. They login using their WhatsApp number.

Administrators:
* Some users are administrators. They have permission to see Ignacio's conversations with anyone in a special tab.
* These users can create, delete or edit other users.
* They can only be created by another admin user.


## Tech Stack

The backend is built in Python, using FastAPI.
The web frontend is built with React 19.1, using TypeScript and Tailwind CSS.
The database is in Supabase. Ignacio should save its chat memory of each user in this Supabase Database.
Any stored media (images, audio files, anything else) is saved in Supabase Storage.


## About your workflow

Always plan your steps, and keep track of your plans in PLAN.md.
After planning, keep track of your TODO list for your current task in TODO.md.
Always check steps as done in your TODO.md file as you complete them.
Never interact with the database destructively (changing schemas, deleting rows or tables, etc.) without explicit approval.
Always commit your work after each file edit.
Always mark steps of your PLAN.md file done as you finish them.
While going through the PLAN.md, stop after each subphase or phase.

## Development Setup

The backend uses `uv` as the package manager for Python dependencies.
- Run `export PATH="$HOME/.local/bin:$PATH" && uv sync` to install dependencies
- Use `uv run python -m app.core.migrations` to check database migration status
- Database migrations are applied manually via Supabase SQL Editor
- Environment variables are configured in `backend/.env.local`

### Running the Backend
- `export PATH="$HOME/.local/bin:$PATH" && uv run uvicorn app.main:app --reload` to start dev server
- Backend runs on `http://localhost:8000`
- API documentation available at `http://localhost:8000/docs`

### Testing
- `uv run pytest tests/` to run the test suite
- `uv run pytest tests/ --cov=app` to run with coverage
- `uv run python test_agent.py` to run end-to-end Agent SDK integration tests
- 96 comprehensive tests covering database, AI service, and API endpoints
- Complete Agent SDK integration testing with database persistence verification

## Code Styling

Code formatting is automatically enforced via pre-commit hooks:
- **Backend**: Black, isort, Ruff, and MyPy handle all Python formatting and type checking
- **Frontend**: Prettier handles JS/TS/CSS/MD formatting
- Manual linting is no longer required - pre-commit handles everything automatically
- All components, classes, models, and functions are properly typed in both Python and TypeScript

## Current Development Status (2025-09-14)

### ✅ **Multi-Project Architecture - COMPLETED**

**Major Milestone Achieved**: Full multi-project support with project-centric workflow

#### **Core Project Architecture**
- **Multiple Projects per User**: Users can create/manage multiple independent projects
- **Project-Conversation Association**: Each conversation links to specific project for context
- **Project-Specific Context**: AI uses relevant project context automatically
- **Complete Project CRUD**: Create, read, update, delete projects with full validation

#### **Enhanced Database Schema**  
- **conversations.project_id**: Links conversations to specific projects (Migration 005)
- **user_projects**: Full project management (name, type, stage, context)
- **agent_interactions**: Comprehensive tracking of agent usage and tools
- **user_files**: Vector store integration with OpenAI file sync

#### **API Endpoints**
**Project Management:**
- `GET/POST /project/by_user/{user_id}` - List/create projects for user
- `GET/PUT/DELETE /project/{id}` - Manage specific projects
- `GET /project/conversations/{id}` - Project conversations
- `GET/PUT /project/{id}/context` - Project-specific context

**Enhanced Chat:**
- `POST /chat/messages` - Unified message endpoint (new/continue conversations)
- `PUT /chat/conversations/{id}/project` - Associate conversation with project
- `PUT /chat/conversations/{id}` - Update conversation details

#### **AI Service Enhancements**
- **Smart Context Loading**: Automatically loads project-specific context for conversations
- **Project-Aware Agents**: All 8 agents use relevant project context
- **Fallback Support**: Backwards compatible with non-project conversations

### ✅ **React 19.1 Frontend Rewrite - PHASE 2 COMPLETED**

**Major Milestone Achieved**: Complete frontend rewrite with modern React 19.1 architecture

#### **Core Architecture & State Management**
- **Vite + React 19.1**: Fast development with modern React patterns
- **TypeScript Integration**: Full type safety matching backend Pydantic models
- **React Context State Management**: AuthContext, ProjectsContext, ConversationsContext, GlobalContext
- **API Service Layer**: Complete HTTP client with mocked authentication (Phase 2)
- **Optimistic Updates**: Comprehensive optimistic UI for better user experience

#### **React 19.1 Modern Patterns Implemented**
- **useActionState**: Enhanced form handling with pending states and error management
- **useOptimistic**: Optimistic updates for messages, conversations, and projects
- **useAsync**: Advanced data fetching with caching, error handling, and retries
- **Custom Hooks**: Project-specific hooks for common operations and state management

#### **Technical Implementation**
- **API Integration**: TypeScript-first API calls matching all backend endpoints
- **Mock Authentication**: Test user system ready for Phase 4 OTP implementation
- **Project-First Workflow**: Users must create project before accessing chat
- **Real-time Chat State**: Message sending, conversation management, file uploads
- **Utility Systems**: Notifications, theme management, offline detection, feature flags

#### **Development Environment**
- **Vite Development Server**: Running on `http://localhost:3000`
- **TypeScript Strict Mode**: All types properly defined and validated
- **ESLint + Prettier**: Code quality and formatting automated
- **Project Structure**: Organized and scalable component architecture


### **Current Workflow (Phase 2 Complete)**
1. **Backend APIs** - Multi-project endpoints with chat integration fully operational
2. **Frontend Architecture** - React 19.1 state management and API integration complete
3. **Development Environment** - Vite development server running with hot reload
4. **Next Phase Ready** - UI components implementation can begin (Phase 3)

### **Technical Architecture**
- **Backend**: FastAPI + OpenAI Agent SDK + Supabase (OPERATIONAL)
- **Frontend**: React 19.1 + Vite + TypeScript + Tailwind CSS (PHASE 2 COMPLETE)
- **State Management**: React Context API with Auth, Projects, Conversations, Global contexts
- **Agent Framework**: Multi-agent with specialized expertise domains
- **File Processing**: Vector stores + content search + metadata extraction
- **Session Management**: OpenAI conversation sessions with persistent context
- **Project Context**: Dynamic user project tracking and context injection
- **API Integration**: Complete TypeScript-first client with optimistic updates

### **Immediate Next Steps (Phase 3)**
1. **Landing Page Implementation** - Hero section and project introduction UI
2. **Project Creation Flow** - First-time user onboarding with project creation modal
3. **Chat Interface** - Real-time conversation UI with message history and file uploads
4. **Project Management** - Multi-project dashboard with CRUD operations UI
5. **Navigation & Routing** - React Router implementation with project-first guards
