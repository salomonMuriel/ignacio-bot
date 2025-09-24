# Ignacio Bot - Deployment Guide

This comprehensive guide covers multiple deployment options for the Ignacio Bot application, from local development to production deployment on various cloud providers.

## Table of Contents

- [Quick Start](#quick-start)
- [Environment Setup](#environment-setup)
- [Local Development](#local-development)
- [Docker Deployment](#docker-deployment)
- [Cloud Deployment](#cloud-deployment)
- [Coolify Deployment](#coolify-deployment-recommended)
- [Environment Variables](#environment-variables)
- [Troubleshooting](#troubleshooting)

---

## Quick Start

### Prerequisites

- **Docker & Docker Compose** (recommended)
- **Node.js 20+** and **Python 3.12+** (for local development)
- **uv** (Python package manager)
- Access to:
  - **Supabase** project
  - **Auth0** tenant
  - **OpenAI API** key
  - **Meta WhatsApp API** (optional)

### 1-Minute Docker Setup

```bash
# 1. Clone and navigate
git clone <your-repo-url>
cd ignacio-bot

# 2. Copy and configure environment
cp .env.example .env
# Edit .env with your actual values

# 3. Deploy with Docker
docker-compose -f docker-compose.prod.yml up -d
```

Your app will be available at:
- **Frontend**: http://localhost (port 80)
- **Backend**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs

---

## Environment Setup

The application uses a **two-tier environment system**:

1. **Root `.env`** - Shared variables for deployment orchestration
2. **Service-specific `.env.local`** files - Individual service configuration

### Copy Template Files

```bash
# Root environment (shared config)
cp .env.example .env

# Backend environment
cp backend/.env.example backend/.env.local

# Frontend environment
cp frontend/.env.example frontend/.env.local
```

### Required External Services

Before deployment, ensure you have:

#### 1. Supabase Project
```bash
# Get these from your Supabase dashboard
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
```

#### 2. Auth0 Tenant
```bash
# Get these from your Auth0 dashboard
AUTH0_DOMAIN=your-tenant.auth0.com
AUTH0_CLIENT_ID=your_client_id
AUTH0_AUDIENCE=ignacio-backend
```

#### 3. OpenAI API Key
```bash
OPENAI_API_KEY=sk-proj-your_api_key
```

#### 4. WhatsApp API (Optional)
```bash
WHATSAPP_ACCESS_TOKEN=your_token
WHATSAPP_PHONE_NUMBER_ID=your_phone_id
WHATSAPP_WEBHOOK_VERIFY_TOKEN=your_verify_token
```

---

## Local Development

### Option A: Native Development

**Backend Setup:**
```bash
cd backend

# Install dependencies with uv
export PATH="$HOME/.local/bin:$PATH"
uv sync

# Run development server
uv run uvicorn app.main:app --reload --port 8000
```

**Frontend Setup:**
```bash
cd frontend

# Install dependencies
npm ci

# Run development server
npm run dev
```

### Option B: Docker Development

```bash
# Start development environment
docker-compose up --build

# Access applications
# Frontend: http://localhost:3000
# Backend: http://localhost:8000
```

---

## Docker Deployment

### Production Deployment

```bash
# Build and deploy production containers
docker-compose -f docker-compose.prod.yml up -d --build

# View logs
docker-compose -f docker-compose.prod.yml logs -f

# Stop services
docker-compose -f docker-compose.prod.yml down
```

### Development Deployment

```bash
# Start development environment
docker-compose up -d --build

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### Available Docker Compose Files

- **`docker-compose.yml`** - Development with hot reloading
- **`docker-compose.prod.yml`** - Production optimized

---

## Cloud Deployment

### General Cloud Deployment Steps

1. **Choose your cloud provider** (AWS, GCP, Azure, DigitalOcean, etc.)
2. **Set up container registry** (Docker Hub, AWS ECR, etc.)
3. **Configure environment variables** in your cloud platform
4. **Deploy containers** using your provider's container service

### Platform-Specific Guides

#### AWS (ECS/Fargate)

```bash
# 1. Build and tag images
docker build -t ignacio-backend ./backend
docker build -t ignacio-frontend ./frontend

# 2. Tag for ECR
docker tag ignacio-backend:latest YOUR_ACCOUNT.dkr.ecr.REGION.amazonaws.com/ignacio-backend:latest
docker tag ignacio-frontend:latest YOUR_ACCOUNT.dkr.ecr.REGION.amazonaws.com/ignacio-frontend:latest

# 3. Push to ECR
docker push YOUR_ACCOUNT.dkr.ecr.REGION.amazonaws.com/ignacio-backend:latest
docker push YOUR_ACCOUNT.dkr.ecr.REGION.amazonaws.com/ignacio-frontend:latest

# 4. Create ECS service using AWS CLI or console
```

#### Google Cloud Run

```bash
# 1. Build and deploy backend
gcloud run deploy ignacio-backend \
    --source ./backend \
    --region us-central1 \
    --set-env-vars "$(cat backend/.env.local | tr '\n' ',' | sed 's/,$//')"

# 2. Build and deploy frontend
gcloud run deploy ignacio-frontend \
    --source ./frontend \
    --region us-central1 \
    --set-env-vars "$(cat frontend/.env.local | tr '\n' ',' | sed 's/,$//')"
```

#### DigitalOcean App Platform

Create `app.yaml`:

```yaml
name: ignacio-bot
services:
- name: backend
  source_dir: /backend
  github:
    repo: your-username/ignacio-bot
    branch: main
  run_command: uvicorn app.main:app --host 0.0.0.0 --port 8000
  environment_slug: python
  instance_count: 1
  instance_size_slug: basic-xxs
  envs:
  - key: SUPABASE_URL
    value: ${SUPABASE_URL}
  # ... other env vars

- name: frontend
  source_dir: /frontend
  github:
    repo: your-username/ignacio-bot
    branch: main
  run_command: npm start
  environment_slug: node-js
  instance_count: 1
  instance_size_slug: basic-xxs
  envs:
  - key: VITE_API_BASE_URL
    value: ${backend.PUBLIC_URL}
```

---

## Coolify Deployment (Recommended)

Coolify provides the easiest deployment experience with minimal configuration.

### Prerequisites

- Coolify instance running
- Domain name configured
- Git repository access

### Step-by-Step Coolify Deployment

#### 1. Prepare Your Repository

Ensure your repo has these files (already included):
- `Dockerfile` in backend and frontend directories
- `docker-compose.prod.yml` for orchestration
- `.env.example` files

#### 2. Create New Application in Coolify

1. **Login to Coolify Dashboard**
2. **Click "New Application"**
3. **Select "Git Repository"**
4. **Enter repository URL**: `https://github.com/your-username/ignacio-bot`
5. **Select branch**: `main`

#### 3. Configure Build Settings

**Backend Service:**
```yaml
# In Coolify application settings
Name: ignacio-backend
Port: 8000
Dockerfile: backend/Dockerfile
Build Command: (leave empty)
Start Command: uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 4
```

**Frontend Service:**
```yaml
# Add second service
Name: ignacio-frontend
Port: 80
Dockerfile: frontend/Dockerfile
Build Command: (leave empty)
Start Command: (leave empty - uses Dockerfile CMD)
```

#### 4. Configure Environment Variables

In Coolify, add these environment variables for **each service**:

**Backend Variables:**
```bash
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
OPENAI_API_KEY=sk-proj-your_key
AUTH0_DOMAIN=your-domain.auth0.com
AUTH0_AUDIENCE=ignacio-backend
JWT_SECRET_KEY=your_32_char_secret
APP_ENV=production
DEBUG=False
CORS_ORIGINS=https://your-domain.com
```

**Frontend Variables:**
```bash
VITE_API_BASE_URL=https://api.your-domain.com
VITE_AUTH0_DOMAIN=your-domain.auth0.com
VITE_AUTH0_CLIENT_ID=your_client_id
VITE_AUTH0_AUDIENCE=ignacio-backend
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key
VITE_APP_ENV=production
```

#### 5. Configure Domains

1. **Backend Domain**: `api.your-domain.com`
2. **Frontend Domain**: `your-domain.com`
3. **Enable SSL** (automatic with Coolify)

#### 6. Deploy

1. Click **"Deploy"** in Coolify
2. Monitor build logs
3. Verify deployment health

#### 7. Coolify Docker Compose Alternative

You can also use docker-compose with Coolify:

1. **Select "Docker Compose"** deployment type
2. **Use this docker-compose.coolify.yml**:

```yaml
# docker-compose.coolify.yml
version: '3.8'

services:
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    environment:
      - SUPABASE_URL=${SUPABASE_URL}
      - SUPABASE_ANON_KEY=${SUPABASE_ANON_KEY}
      - SUPABASE_SERVICE_ROLE_KEY=${SUPABASE_SERVICE_ROLE_KEY}
      - OPENAI_API_KEY=${OPENAI_API_KEY}
      - AUTH0_DOMAIN=${AUTH0_DOMAIN}
      - AUTH0_AUDIENCE=${AUTH0_AUDIENCE}
      - JWT_SECRET_KEY=${JWT_SECRET_KEY}
      - APP_ENV=production
      - DEBUG=False
      - CORS_ORIGINS=${FRONTEND_URL}
    networks:
      - ignacio-network
    restart: unless-stopped
    labels:
      - "coolify.managed=true"

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    environment:
      - VITE_API_BASE_URL=${BACKEND_URL}
      - VITE_AUTH0_DOMAIN=${AUTH0_DOMAIN}
      - VITE_AUTH0_CLIENT_ID=${AUTH0_CLIENT_ID}
      - VITE_AUTH0_AUDIENCE=${AUTH0_AUDIENCE}
      - VITE_SUPABASE_URL=${SUPABASE_URL}
      - VITE_SUPABASE_ANON_KEY=${SUPABASE_ANON_KEY}
      - VITE_APP_ENV=production
    networks:
      - ignacio-network
    depends_on:
      - backend
    restart: unless-stopped
    labels:
      - "coolify.managed=true"

networks:
  ignacio-network:
    driver: bridge
```

### Coolify Environment Variable Management

**Benefit**: Set environment variables **once** in Coolify's interface, and they'll be available to all services.

**Recommended Coolify Environment Variables:**
```bash
# Set these in Coolify's global environment
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
OPENAI_API_KEY=sk-proj-your_key
AUTH0_DOMAIN=your-domain.auth0.com
AUTH0_CLIENT_ID=your_client_id
AUTH0_AUDIENCE=ignacio-backend
JWT_SECRET_KEY=your_32_char_secret
FRONTEND_URL=https://your-domain.com
BACKEND_URL=https://api.your-domain.com
```

---

## Environment Variables

### Complete Environment Variable Reference

#### Backend Required Variables
```bash
SUPABASE_URL                    # Your Supabase project URL
SUPABASE_ANON_KEY              # Supabase anonymous key
SUPABASE_SERVICE_ROLE_KEY      # Supabase service role key
OPENAI_API_KEY                 # OpenAI API key
AUTH0_DOMAIN                   # Auth0 domain
AUTH0_AUDIENCE                 # Auth0 API identifier
JWT_SECRET_KEY                 # 32+ character secret key
```

#### Frontend Required Variables
```bash
VITE_API_BASE_URL              # Backend API URL
VITE_AUTH0_DOMAIN              # Auth0 domain (same as backend)
VITE_AUTH0_CLIENT_ID           # Auth0 client ID
VITE_AUTH0_AUDIENCE            # Auth0 API identifier (same as backend)
```

#### Optional Variables
```bash
# WhatsApp Integration
WHATSAPP_ACCESS_TOKEN
WHATSAPP_PHONE_NUMBER_ID
WHATSAPP_WEBHOOK_VERIFY_TOKEN

# Performance & Security
UVICORN_WORKERS=4              # Number of worker processes
RATE_LIMIT_PER_MINUTE=60       # API rate limiting
SECURE_SSL_REDIRECT=true       # Force HTTPS in production

# Analytics & Monitoring
VITE_GOOGLE_ANALYTICS_ID
VITE_SENTRY_DSN
```

### Environment-Specific Configurations

#### Development
```bash
APP_ENV=development
DEBUG=True
LOG_LEVEL=DEBUG
CORS_ORIGINS=http://localhost:3000
```

#### Production
```bash
APP_ENV=production
DEBUG=False
LOG_LEVEL=INFO
CORS_ORIGINS=https://your-domain.com
SECURE_SSL_REDIRECT=true
UVICORN_WORKERS=4
```

---

## Troubleshooting

### Common Issues

#### 1. CORS Errors
**Problem**: Frontend can't connect to backend
**Solution**:
```bash
# Ensure CORS_ORIGINS includes your frontend URL
CORS_ORIGINS=https://your-frontend-domain.com,http://localhost:3000
```

#### 2. Auth0 Issues
**Problem**: Authentication fails
**Solutions**:
- Verify Auth0 domain and client ID
- Ensure Auth0 application is configured for your domain
- Check redirect URLs in Auth0 dashboard

#### 3. Database Connection Issues
**Problem**: Backend can't connect to Supabase
**Solutions**:
- Verify Supabase URL and keys
- Check Supabase project status
- Ensure service role key has correct permissions

#### 4. Build Failures
**Problem**: Docker builds fail
**Solutions**:
```bash
# Clear Docker cache
docker system prune -a

# Rebuild without cache
docker-compose build --no-cache

# Check individual service builds
docker build -t test-backend ./backend
docker build -t test-frontend ./frontend
```

#### 5. Environment Variable Issues
**Problem**: Variables not loading correctly
**Solutions**:
- Ensure `.env.local` files exist in backend/frontend directories
- Verify Vite variables start with `VITE_`
- Check for trailing whitespace in `.env` files
- Restart containers after environment changes

### Health Checks

Both services include health checks:

```bash
# Check backend health
curl http://localhost:8000/health

# Check frontend health (when using Docker)
curl http://localhost/health
```

### Viewing Logs

```bash
# Docker Compose logs
docker-compose logs -f backend
docker-compose logs -f frontend

# Individual container logs
docker logs ignacio-bot_backend_1 -f
```

### Database Migrations

```bash
# Run from backend directory
cd backend
export PATH="$HOME/.local/bin:$PATH"
uv run python -m app.core.migrations
```

---

## Production Checklist

Before deploying to production:

### Security
- [ ] Change all default passwords and secrets
- [ ] Use strong JWT secret key (32+ characters)
- [ ] Enable HTTPS/SSL
- [ ] Configure proper CORS origins
- [ ] Set `DEBUG=False`
- [ ] Review Auth0 configuration

### Performance
- [ ] Set appropriate number of workers (`UVICORN_WORKERS=4`)
- [ ] Configure rate limiting
- [ ] Enable gzip compression (already in nginx config)
- [ ] Set up monitoring/logging

### External Services
- [ ] Verify Supabase project configuration
- [ ] Test Auth0 authentication flow
- [ ] Confirm OpenAI API quota
- [ ] Test WhatsApp integration (if enabled)

### Infrastructure
- [ ] Set up domain names and SSL certificates
- [ ] Configure load balancers (if needed)
- [ ] Set up backup strategies
- [ ] Configure monitoring and alerting

---

## Support

For deployment issues:

1. **Check logs** first (see troubleshooting section)
2. **Verify environment variables** are correctly set
3. **Test individual services** separately
4. **Check external service status** (Auth0, Supabase, OpenAI)

---

*This deployment guide covers multiple scenarios. Choose the deployment method that best fits your infrastructure and requirements. Coolify is recommended for the simplest deployment experience.*