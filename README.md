# Ignacio Bot

Ignacio is an AI-powered chat assistant that helps users develop their projects as part of the Action Lab innovation education program. Through a sophisticated multi-agent system, users can interact with Ignacio via both WhatsApp and a modern web interface to receive expert guidance tailored to their specific project needs and goals.

## 🎯 Project Overview

**Action Lab Integration**: Ignacio Bot serves participants of the Action Lab education program, helping them develop:
- **Startups & New Companies** - From ideation to market entry
- **NGOs & Foundations** - Social impact organizations and missions
- **Company Spinoffs** - Innovation projects within existing organizations
- **Internal Projects** - Growth initiatives and business transformation

**Multi-Project Support**: Users can manage multiple independent projects simultaneously, with each maintaining its own context and conversation history.

## 🧠 AI Architecture (Multi-Agent System)

### Specialized Domain Experts

Ignacio employs **8 specialized AI agents** with domain-specific expertise:

1. **🎯 Marketing Expert** - Customer acquisition, growth strategies, digital marketing tools
2. **💻 Technology Expert** - Tech stack selection, development workflows, infrastructure
3. **💰 Finance Expert** - Business models, funding strategies, financial planning tools
4. **🌱 Sustainability Expert** - ESG strategies, impact measurement, environmental tools
5. **⚖️ Legal/Compliance Expert** - Business formation, contracts, regulatory compliance
6. **⚙️ Operations Expert** - Process optimization, supply chain, workflow automation
7. **🎨 Product/Design Expert** - UX/UI design, product development, user research
8. **📈 Sales Expert** - Sales strategy, pipeline management, CRM tools

### Intelligent Agent Coordination

- **Context-Aware Handoffs**: Main Ignacio coordinator intelligently routes conversations to appropriate specialists
- **Project Context Integration**: All agents automatically receive relevant project context and history
- **Tool Recommendations**: Each specialist suggests modern, relevant tools for their domain
- **Adaptive Mentoring**: Balance between Socratic questioning and direct practical assistance

## 🏗️ Technical Architecture

### Tech Stack

**Backend (FastAPI + OpenAI Agent SDK):**
- **Python 3.12** with **FastAPI** for REST API
- **OpenAI Agent SDK** for multi-agent AI system
- **Supabase** (PostgreSQL) for database and file storage
- **Auth0** for authentication and user management
- **uv** for Python dependency management

**Frontend (React 19.1 + TypeScript):**
- **React 19.1** with **TypeScript** for type safety
- **Vite** for build tooling and hot reloading
- **Tailwind CSS** for modern styling
- **Auth0 React SDK** for authentication flows

**Infrastructure & Deployment:**
- **Docker** multi-stage builds for production optimization
- **Nginx** for production web serving with compression
- **Coolify.io** for streamlined deployment orchestration
- **Supabase** for managed PostgreSQL and file storage

### Project Structure

```
ignacio-bot/
├── 📁 backend/                 # FastAPI Python backend
│   ├── app/
│   │   ├── core/              # Configuration, database, migrations
│   │   ├── models/            # SQLAlchemy database models
│   │   ├── routers/           # FastAPI route handlers
│   │   ├── services/          # Business logic and AI agent system
│   │   └── main.py            # FastAPI application entry
│   ├── pyproject.toml         # Python dependencies (uv managed)
│   ├── Dockerfile             # Production backend container
│   └── .env.example           # Backend environment template
├── 📁 frontend/                # React TypeScript frontend
│   ├── src/
│   │   ├── components/        # React components
│   │   ├── contexts/          # React Context providers (Auth, Projects, etc.)
│   │   ├── hooks/             # Custom React hooks (useApi, etc.)
│   │   ├── pages/             # Page components and routing
│   │   ├── services/          # API client services
│   │   └── types/             # TypeScript type definitions
│   ├── package.json           # Node.js dependencies
│   ├── vite.config.ts         # Vite configuration
│   ├── Dockerfile             # Production frontend container (Nginx)
│   ├── Dockerfile.dev         # Development container
│   ├── nginx.conf             # Production nginx configuration
│   └── .env.example           # Frontend environment template
├── 📁 .claude/                 # Project documentation
│   ├── CLAUDE.md              # Development guidelines and status
│   └── SPECS.md               # Technical specifications
├── docker-compose.yml         # Development environment
├── docker-compose.prod.yml    # Production deployment
├── .env.example               # Root environment template
├── DEPLOYMENT.md              # Comprehensive deployment guide
└── README.md                  # This file
```

## 🚀 Development Setup

### Prerequisites

- **Python 3.12+** and **uv** (Python package manager)
- **Node.js 20+** and **npm**
- **Auth0** tenant with application configured
- **Supabase** project with database and storage
- **OpenAI API** key with GPT-4 access

### Quick Start (Recommended)

```bash
# 1. Clone repository
git clone <repository-url>
cd ignacio-bot

# 2. Set up environment files
cp .env.example .env
cp backend/.env.example backend/.env.local
cp frontend/.env.example frontend/.env.local

# 3. Configure your credentials (see Environment Configuration below)

# 4. Start with Docker (easiest)
docker-compose up --build
```

**Access URLs:**
- **Frontend**: http://localhost:3000
- **Backend**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs

### Manual Setup (Alternative)

#### Backend Setup

```bash
# 1. Install uv (Python package manager)
curl -LsSf https://astral.sh/uv/install.sh | sh
export PATH="$HOME/.local/bin:$PATH"

# 2. Install backend dependencies
cd backend
uv sync

# 3. Run development server
uv run uvicorn app.main:app --reload --port 8000
```

#### Frontend Setup

```bash
# 1. Install dependencies
cd frontend
npm ci

# 2. Run development server
npm run dev
```

## ✨ Core Capabilities

### 🔐 Authentication & User Management
- **Auth0 Integration**: Secure JWT-based authentication for web platform
- **User Sync**: Automatic user synchronization between Auth0 and internal database
- **WhatsApp Integration**: Phone number validation against Auth0 profiles
- **Role-Based Access**: User and administrator permissions with proper isolation

### 💬 Multi-Channel Chat Interface
- **Web Interface**: Modern React-based chat with real-time messaging
- **WhatsApp Integration**: Native WhatsApp Business API integration (planned)
- **Conversation Persistence**: Full message history and session management
- **Cross-Platform Sync**: Seamless experience across web and messaging platforms

### 📋 Advanced Project Management
- **Multi-Project Support**: Users can manage multiple independent projects
- **Project Types**: Startups, NGOs, Foundations, Spinoffs, Internal projects
- **Project Stages**: Ideation → Research → Validation → Development → Launch → Growth → Mature
- **Context Association**: Conversations automatically linked to relevant projects
- **Smart Context Loading**: AI agents receive project-specific context automatically

### 📁 Comprehensive File Management System
- **File Upload Modal**: Two-tab interface (Upload New / Previous Files)
- **File Types Supported**: Images, PDFs, documents, presentations (20MB limit)
- **File Library**: Search, filter by type, sort by date/name/size
- **File Reuse**: Attach previously uploaded files to new conversations
- **Supabase Storage**: Secure cloud storage with metadata tracking

### 🤖 Multi-Agent AI System
- **8 Specialized Experts**: Each with domain-specific knowledge and tool recommendations
- **Intelligent Routing**: Main coordinator agent routes conversations to appropriate specialists
- **Project-Aware**: All agents automatically receive relevant project context
- **Tool Integration**: Each expert suggests modern, relevant tools for their domain
- **Lifecycle Monitoring**: Comprehensive tracking of agent interactions and handoffs

### 👥 Administrative Features
- **User Management**: Create, edit, delete user accounts (admin only)
- **Conversation Monitoring**: View all user interactions across the platform
- **Project Oversight**: Track projects and their associated conversations
- **Admin-Only Creation**: New administrators can only be created by existing admins

## 🔗 API Architecture

### Key Endpoint Categories

#### 🔐 **Authentication & User Management**
```bash
GET  /users/me                          # Current user profile
GET  /users                             # List all users (admin)
POST /users                             # Create user (admin)
PUT  /users/{id}                        # Update user (admin)
DELETE /users/{id}                      # Delete user (admin)
```

#### 📋 **Project Management**
```bash
GET  /project/by_user/me                # Current user's projects
POST /project/                          # Create new project
GET  /project/{id}                      # Get project details
PUT  /project/{id}                      # Update project
DELETE /project/{id}                    # Delete project
GET  /project/conversations/{id}        # Project conversations
GET/PUT /project/{id}/context           # Project context management
GET  /project/types                     # Available project types
GET  /project/stages                    # Available project stages
```

#### 💬 **Enhanced Chat System**
```bash
GET  /chat/conversations                # User's conversations
POST /chat/messages                     # Send message (unified endpoint)
GET  /chat/conversations/{id}           # Get conversation with messages
PUT  /chat/conversations/{id}           # Update conversation details
PUT  /chat/conversations/{id}/project   # Associate conversation with project
GET  /chat/conversations/{id}/summary   # Get conversation summary
GET  /chat/conversations/{id}/interactions # Agent interaction history
DELETE /chat/conversations/{id}         # Delete conversation
```

#### 📁 **File Management System**
```bash
POST /files/upload                      # Upload file
GET  /files/user/me                     # Current user's files
GET  /files/{id}                        # Get file metadata
GET  /files/{id}/download               # Download file content
GET  /files/{id}/url                    # Get signed URL for file access
GET  /files/conversation/{id}           # Files for specific conversation
POST /files/{id}/reuse                  # Reuse file in new conversation
GET  /files/user/me/with-conversations  # Files with conversation usage
DELETE /files/{id}                      # Delete file
```

#### 🤖 **AI Agent System**
```bash
GET  /chat/conversations/{id}/interactions # Track agent handoffs and tool usage
# Agent system works transparently through chat endpoints
# with automatic routing to appropriate specialists
```

## 🚀 Production Deployment

The project includes comprehensive deployment support for multiple cloud providers, with **Coolify.io** as the recommended platform for streamlined deployment.

### 🎯 1-Minute Quick Deploy

```bash
# 1. Prepare environment
cp .env.example .env
# Edit .env with your production credentials

# 2. Deploy with Docker
docker-compose -f docker-compose.prod.yml up -d --build

# 3. Verify deployment
curl -f http://localhost/health              # Frontend health check
curl -f http://localhost:8000/health         # Backend health check
```

### 🌟 Coolify.io Deployment (Recommended)

**Benefits**: One-click deployment, automatic SSL, built-in monitoring, zero-downtime updates

1. **Connect Repository**: Link your Git repository to Coolify
2. **Environment Variables**: Set credentials once in Coolify interface
3. **Domain Configuration**: Automatic SSL with Let's Encrypt
4. **Deploy**: Single-click deployment with health monitoring

### 🌐 Multi-Cloud Support

The deployment system supports:
- **AWS** (ECS/Fargate, ECR)
- **Google Cloud** (Cloud Run, Container Registry)
- **DigitalOcean** (App Platform)
- **Azure** (Container Instances)
- **Self-hosted** (Any Docker-capable server)

### ✨ Production Features

- **🐳 Multi-stage Docker builds** - Optimized container images
- **🌐 Nginx reverse proxy** - Production web server with compression
- **🔒 SSL/HTTPS ready** - Automatic certificate management
- **💚 Health checks** - Application monitoring and restart policies
- **📊 Environment-aware** - Development/staging/production configurations
- **📝 Comprehensive logging** - Structured logging with multiple levels
- **🔄 Zero-downtime deployments** - Rolling updates with health validation

For detailed deployment instructions, see **[DEPLOYMENT.md](./DEPLOYMENT.md)**.

## 📋 Current Status & Roadmap

### ✅ **Completed Features (Fully Operational)**
- **Multi-Agent AI System**: 8 specialized domain experts with intelligent routing
- **Project Management**: Multi-project support with context awareness
- **File Management**: Upload, library, reuse system with Supabase Storage
- **Authentication**: Auth0 integration with JWT tokens and role-based access
- **Chat Interface**: Complete web-based chat with message persistence
- **API Architecture**: REST API with comprehensive endpoint coverage
- **Deployment System**: Production-ready Docker containers and deployment guides

### 🚧 **In Development**
- **WhatsApp Integration**: Business API integration for messaging platform
- **Real-time Features**: WebSocket support for live chat updates
- **Analytics Dashboard**: Usage metrics and conversation insights
- **Advanced File Processing**: OCR, document analysis, vector search

### 📊 **Development Status**
- **Backend**: ✅ Fully operational (FastAPI + OpenAI Agent SDK)
- **Frontend**: ✅ Complete web interface (React 19.1 + TypeScript)
- **Authentication**: ✅ Auth0 integration active
- **Database**: ✅ Supabase PostgreSQL with full schema
- **File System**: ✅ Complete upload/management system
- **AI Agents**: ✅ 8 specialists with lifecycle monitoring
- **Deployment**: ✅ Production-ready with multiple cloud options

## 🛠️ Development Workflow

### Code Standards
- **Type Safety**: All TypeScript and Python code properly typed
- **Code Formatting**: Automatic formatting via pre-commit hooks (Ruff + Prettier)
- **API Documentation**: OpenAPI/Swagger automatically generated at `/docs`
- **Git Conventions**: Conventional commits for clear change tracking

### Working with the Multi-Agent System
```bash
# Test individual agents
uv run python -c "from app.services.ai_service import AIService; ai = AIService(); print(ai.list_agents())"

# Monitor agent interactions
tail -f logs/agent_lifecycle.log

# Test agent handoffs
uv run python test_handoff_hooks.py
```

### Database Development
```bash
# Check current schema
uv run python -m app.core.migrations

# View database in Supabase Dashboard
# Access your project at: https://app.supabase.com/projects/your-project-id
```

## 🔗 Related Documentation

- **[DEPLOYMENT.md](./DEPLOYMENT.md)** - Complete deployment guide for all platforms
- **[.claude/CLAUDE.md](./.claude/CLAUDE.md)** - Development guidelines and project status
- **[.claude/SPECS.md](./.claude/SPECS.md)** - Detailed technical specifications

## 📞 Support & Contact

For technical questions or Action Lab program inquiries:
- **Development Team**: Technical implementation and deployment
- **Action Lab Program**: Educational content and curriculum integration
- **Ignia**: Strategic oversight and program administration

---

## 🎉 Quick Start Summary

```bash
# 🚀 Get Started in 3 Commands
git clone <repository-url> && cd ignacio-bot
cp .env.example .env && cp backend/.env.example backend/.env.local && cp frontend/.env.example frontend/.env.local
# Configure your Auth0, Supabase, and OpenAI credentials in the .env files
docker-compose up --build

# ✅ Access Your Application
# Web Interface: http://localhost:3000
# API Documentation: http://localhost:8000/docs
# Backend Health: http://localhost:8000/health
```

---

**Ignacio Bot** - Empowering Action Lab participants to build impactful projects through AI-powered guidance, multi-project management, and specialized domain expertise. 🌟