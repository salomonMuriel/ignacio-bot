# Ignacio Bot

Ignacio is an AI chat assistant that helps users develop their projects as part of the Action Lab education program. Users can interact with Ignacio through both WhatsApp and a modern web interface to receive expert guidance tailored to their specific project needs.

## 🎯 Project Overview

Ignacio Bot serves participants of the Action Lab education program, helping them build:
- New companies and startups
- NGOs and foundations
- Company spinoffs
- Internal projects for business growth

The system provides personalized assistance by understanding each user's project context and responding with specialized expertise (marketing, technical, strategic, etc.).

## 🏗️ Architecture

### Tech Stack

**Backend:**
- **Python 3.12** with **FastAPI** for REST API
- **OpenAI Agents SDK** for AI-powered conversations
- **Supabase** for database and file storage
- **uv** for dependency management

**Frontend:**
- **React 19.1** with **TypeScript**
- **Vite** for build tooling and development server
- **Tailwind CSS** for styling
- **React Router** for navigation

**Infrastructure:**
- **Docker** for containerization
- **Nginx** for production web serving
- **Supabase** for PostgreSQL database and storage
- **Coolify.io** for deployment orchestration

### Project Structure

```
ignacio-bot/
├── backend/                    # FastAPI Python backend
│   ├── app/
│   │   ├── core/              # Configuration and utilities
│   │   ├── models/            # Database models
│   │   ├── routers/           # API route handlers
│   │   ├── services/          # Business logic and AI services
│   │   └── main.py            # FastAPI application entry
│   ├── migrations/            # Database migration files
│   ├── pyproject.toml         # Python dependencies and config
│   └── Dockerfile             # Backend container config
├── frontend/                   # React TypeScript frontend
│   ├── src/
│   │   ├── components/        # React components
│   │   ├── contexts/          # React Context providers
│   │   ├── hooks/             # Custom React hooks
│   │   ├── pages/             # Page components
│   │   ├── services/          # API client services
│   │   └── types/             # TypeScript type definitions
│   ├── package.json           # Node.js dependencies
│   ├── vite.config.ts         # Vite configuration
│   ├── Dockerfile             # Frontend container config
│   └── nginx.conf             # Production nginx config
├── docker-compose.prod.yml     # Production container orchestration
├── DEPLOYMENT.md              # Deployment guide
└── README.md                  # This file
```

## 🚀 Development Setup

### Prerequisites

- **Python 3.12+**
- **Node.js 18+** and **npm**
- **uv** for Python dependency management
- **Supabase** account and project

### Backend Setup

1. **Install uv** (Python package manager):
```bash
curl -LsSf https://astral.sh/uv/install.sh | sh
export PATH="$HOME/.local/bin:$PATH"
```

2. **Install backend dependencies**:
```bash
cd backend
uv sync
```

3. **Configure environment**:
```bash
cp .env.local.example .env.local
# Edit .env.local with your Supabase and OpenAI credentials
```

4. **Run backend server**:
```bash
uv run uvicorn app.main:app --reload
# Backend runs on http://localhost:8000
# API docs available at http://localhost:8000/docs
```

### Frontend Setup

1. **Install frontend dependencies**:
```bash
cd frontend
npm install
```

2. **Configure environment**:
```bash
# Create .env.local file with:
VITE_API_URL=http://localhost:8000
```

3. **Run frontend server**:
```bash
npm run dev
# Frontend runs on http://localhost:3000
```

## 🔧 Key Features

### User Management
- **No self-registration** - accounts created by administrators
- **WhatsApp OTP authentication** for secure login
- **Role-based access** (users vs administrators)

### Chat Interface
- **Multi-channel support** - WhatsApp and web interface
- **Project-aware conversations** - context from user's project data
- **Specialized AI agents** - marketing, technical, strategic expertise
- **File upload support** - documents, images, presentations
- **Message history** with persistent sessions

### Administrative Features
- **User management** - create, edit, delete user accounts
- **Conversation monitoring** - view all user interactions
- **Project tracking** - associate conversations with specific projects

### AI Capabilities
- **8 specialized agents** with domain expertise
- **Context-aware responses** using project-specific information
- **File processing** - analyze uploaded documents and media
- **Vector search** for relevant context retrieval

## 📊 API Endpoints

### Authentication
- `POST /auth/login` - WhatsApp OTP login
- `POST /auth/verify` - Verify OTP code
- `POST /auth/refresh` - Refresh access token

### User Management
- `GET /users/me` - Get current user profile
- `GET /users` - List all users (admin only)
- `POST /users` - Create new user (admin only)
- `PUT /users/{id}` - Update user (admin only)
- `DELETE /users/{id}` - Delete user (admin only)

### Project Management
- `GET/POST /project/by_user/{user_id}` - List/create user projects
- `GET/PUT/DELETE /project/{id}` - Manage specific projects
- `GET /project/conversations/{id}` - Project conversations
- `GET/PUT /project/{id}/context` - Project context

### Chat System
- `POST /chat/messages` - Send message and get AI response
- `PUT /chat/conversations/{id}/project` - Associate conversation with project
- `GET /chat/conversations` - List user conversations

## 🔒 Environment Configuration

### Backend Environment Variables

```bash
# Application Settings
APP_ENV=development                    # development|production|test
DEBUG=True
PYTHONPATH=/app

# Database (Supabase)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# AI Service
OPENAI_API_KEY=your_openai_api_key

# Security
JWT_SECRET_KEY=your_secret_key
JWT_ALGORITHM=HS256
JWT_ACCESS_TOKEN_EXPIRE_MINUTES=1440

# CORS and Security
CORS_ORIGINS=http://localhost:3000
ALLOWED_HOSTS=localhost,127.0.0.1
```

### Frontend Environment Variables

```bash
# API Configuration
VITE_API_URL=http://localhost:8000
```

## 🧪 Testing and Quality

### Backend Testing
```bash
cd backend
uv run pytest                     # Run tests
uv run black app/                # Format code
uv run isort app/                # Sort imports
uv run ruff check app/           # Lint code
uv run mypy app/                 # Type checking
```

### Frontend Testing
```bash
cd frontend
npm run lint                     # ESLint
npm run lint:fix                 # Fix ESLint issues
npm run format                   # Prettier formatting
npm run format:check             # Check formatting
npm run type-check               # TypeScript checking
npm run build                    # Production build
```

## 🚀 Production Deployment

The project is configured for deployment using Docker and Coolify.io on Hetzner VPS infrastructure.

### Quick Deploy Steps

1. **Prepare environment**:
```bash
cp .env.production.example .env.production
# Configure production values in .env.production
```

2. **Deploy with Coolify.io**:
   - Connect Git repository
   - Set environment variables
   - Configure domain and SSL
   - Deploy using `docker-compose.prod.yml`

3. **Verify deployment**:
```bash
curl -f https://your-domain.com/health        # Frontend health
curl -f https://your-domain.com/api/health    # Backend health
```

For detailed deployment instructions, see [DEPLOYMENT.md](./DEPLOYMENT.md).

### Production Features
- ✅ Multi-stage Docker builds
- ✅ Nginx reverse proxy with gzip compression
- ✅ SSL/HTTPS with Let's Encrypt
- ✅ Health check endpoints
- ✅ Environment-aware configuration
- ✅ Production logging and monitoring
- ✅ Automatic container restart policies

## 📝 Development Commands

### Backend Commands
```bash
# Development
./scripts/dev.sh                 # Start dev server
./scripts/lint.sh                # Run all linting

# Manual commands
uv run uvicorn app.main:app --reload
uv run python -m app.core.migrations    # Check migrations
```

### Frontend Commands
```bash
# Development
npm run dev                      # Start dev server
npm run build                    # Production build
npm run preview                  # Preview build

# Code quality
npm run lint                     # ESLint
npm run format                   # Prettier
```

## 🤝 Contributing

1. Follow existing code patterns and conventions
2. Use the configured linters and formatters
3. Write tests for new features
4. Update documentation for significant changes
5. Pre-commit hooks enforce code quality standards

## 📄 License

This project is developed for the Action Lab education program by Ignia.

---

**Ignacio Bot** - Empowering Action Lab participants to build impactful projects through AI-powered guidance and support.