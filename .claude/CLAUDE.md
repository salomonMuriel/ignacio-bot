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
The web frontend is built in plain React, using Typescript.
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

## Current Development Status (2025-01-07)

### ✅ **Agent SDK Implementation - COMPLETED**

**Major Milestone Achieved**: Complete migration to OpenAI Agent SDK with multi-agent architecture

#### **Core Agent Architecture**
- **8 Specialized Agents**: Ignacio (Entry), Marketing, Sales, Technology, Finance, Leadership, Agile/PM, Design Thinking, Translation
- **Dynamic Agent Routing**: Automatic selection based on user query intent
- **Tool Integration**: File search, web search, conversation management
- **Multi-language Support**: Spanish/English with translation agent

#### **Enhanced Database Schema**
- **agent_interactions**: Comprehensive tracking of agent usage and tool calls
- **user_projects**: Project context management for Action Lab participants
- **Enhanced conversations**: OpenAI session tracking, agent state, project context
- **Enhanced user_files**: Vector store integration, content preview, metadata

#### **API Endpoints**
- **Agent-powered Chat**: `/conversations/start`, `/conversations/{id}/messages`
- **File Integration**: `/files/{id}/integrate` for document context
- **Project Management**: `/project/context` for user project updates
- **Analytics**: `/conversations/{id}/summary`, `/conversations/{id}/interactions`

#### **Vector Store Management**
- **User-specific Vector Stores**: Isolated file contexts per user
- **Automatic Sync**: File uploads automatically integrated into search context
- **Content Preview**: First 500 chars stored for quick reference

### **Technical Architecture**
- **Backend**: FastAPI + OpenAI Agent SDK + Supabase
- **Agent Framework**: Multi-agent with specialized expertise domains
- **File Processing**: Vector stores + content search + metadata extraction
- **Session Management**: OpenAI conversation sessions with persistent context
- **Project Context**: Dynamic user project tracking and context injection
