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

### Testing the Agent System
- **Quick Test**: `uv run python quick_test.py` - Fast validation (30 seconds)
- **Comprehensive Test**: `uv run python test_agent_system.py` - Full system validation (2 minutes)
- **Handoff Test**: `uv run python test_handoff_hooks.py` - Lifecycle hooks validation

## Code Styling

Code formatting is automatically enforced via pre-commit hooks:
- **Backend**: Ruff for formatting only.
- **Frontend**: Prettier handles JS/TS/CSS/MD formatting
- All components, classes, models, and functions are properly typed in both Python and TypeScript


#### **API Endpoints (✅ WITH AUTHENTICATION)**
**Project Management:**
- `GET /project/` - List current user's projects (authenticated)
- `GET/POST /project/by_user/{user_id}` - List/create projects for user (admin or self)
- `GET/PUT/DELETE /project/{id}` - Manage specific projects (owner verification)
- `GET /project/conversations/{id}` - Project conversations
- `GET/PUT /project/{id}/context` - Project-specific context

**Enhanced Chat:**
- `POST /chat/messages` - Unified message endpoint (authenticated users only)
- `GET /chat/conversations` - List user's conversations (authenticated)
- `GET /chat/conversations/{id}` - Get conversation with ownership verification
- `PUT /chat/conversations/{id}/project` - Associate conversation with project
- `PUT /chat/conversations/{id}` - Update conversation details

**Admin User Management:**
- `GET/POST /admin/users` - List/create users (admin only)
- `GET/PUT/DELETE /admin/users/{id}` - Manage specific users (admin only)
- `POST /admin/users/{id}/invite` - Send user invites (admin only)

#### **AI Service Architecture (REFACTORED - September 2025)**
- **Multi-Agent System**: 8 specialized domain experts + main Ignacio coordinator
- **Domain Experts**: Marketing, Technology, Finance, Sustainability, Legal/Compliance, Operations, Product/Design, Sales
- **Smart Context Loading**: Automatically loads project-specific context for conversations
- **Domain-Specific Instructions**: Each expert has researched tool recommendations and specialized knowledge
- **Project-Aware Agents**: All agents use relevant project context with base personality + domain expertise
- **Handoff Monitoring**: Comprehensive lifecycle hooks track agent interactions and tool usage
- **Fallback Support**: Backwards compatible with non-project conversations


### **Technical Architecture**
- **Backend**: FastAPI + OpenAI Agent SDK + Supabase (OPERATIONAL) + **Supabase Auth Integration**
- **Frontend**: React 19.1 + Vite + TypeScript + Tailwind CSS (CHAT INTEGRATION COMPLETE)
- **Authentication**: Supabase Auth + JWT validation + RLS policies + Admin management
- **State Management**: React Context API with Auth, Projects, Conversations, Global contexts
- **Agent Framework**: Multi-agent with specialized expertise domains
- **File Processing**: Vector stores + content search + metadata extraction
- **Session Management**: OpenAI conversation sessions with persistent context
- **Project Context**: Dynamic user project tracking and context injection
- **API Integration**: Complete TypeScript-first client with working chat flow

### **Active Development Environment**
- **Frontend**: http://localhost:3000 (Vite dev server)
- **Backend**: http://localhost:8000 (FastAPI + uvicorn)