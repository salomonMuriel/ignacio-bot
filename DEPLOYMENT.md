# Deployment Guide: Ignacio Bot to Hetzner VPS with Coolify.io

## ✅ Files Created/Modified

### New Files:
- `frontend/Dockerfile` - Production multi-stage build for React app
- `frontend/nginx.conf` - Nginx configuration with SPA routing and API proxy
- `docker-compose.prod.yml` - Production-ready docker-compose configuration
- `.env.production.example` - Production environment variables template
- `DEPLOYMENT.md` - This deployment guide

### Modified Files:
- `backend/Dockerfile` - Updated for production (removed --reload, added health check)
- `frontend/vite.config.ts` - Added production build optimizations and environment handling

## 🚀 Deployment Steps

### Step 1: Prepare Your Hetzner VPS

1. **Set up Coolify.io** on your Hetzner VPS:
   ```bash
   curl -fsSL https://coolify.io/install.sh | bash
   ```

2. **Configure Domain DNS**:
   - Point `ignacio.ignia.lat` A record to your Hetzner VPS IP
   - Wait for DNS propagation (can take up to 24 hours)

### Step 2: Prepare Production Environment

**Environment Configuration**: The backend is now environment-aware and automatically loads the appropriate .env file based on the `APP_ENV` environment variable:
- `APP_ENV=development` → loads `.env.local`
- `APP_ENV=production` → loads `.env.production`
- `APP_ENV=test` → loads `.env.test`

1. **Create production environment file**:
   ```bash
   cp .env.production.example .env.production
   ```

2. **Configure your production variables** in `.env.production`:
   ```env
   # Update these with your actual production values:
   SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_ANON_KEY=your_actual_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_actual_service_role_key
   OPENAI_API_KEY=your_actual_openai_key
   JWT_SECRET_KEY=generate_a_strong_random_secret_key

   # Domain-specific settings:
   CORS_ORIGINS=https://ignacio.ignia.lat
   VITE_API_URL=https://ignacio.ignia.lat/api
   ALLOWED_HOSTS=ignacio.ignia.lat,www.ignacio.ignia.lat
   ```

### Step 3: Deploy with Coolify.io

1. **In Coolify.io Dashboard**:
   - Create a new Project
   - Choose "Docker Compose" deployment
   - Connect your Git repository

2. **Configure Deployment Settings**:
   - **Repository**: Point to your Git repo
   - **Branch**: `main` (or your production branch)
   - **Docker Compose File**: `docker-compose.prod.yml`
   - **Environment File**: Upload your `.env.production` file

3. **Domain Configuration**:
   - **Primary Domain**: `ignacio.ignia.lat`
   - **SSL Certificate**: Enable automatic SSL via Let's Encrypt
   - **Port Mapping**: Map port 80 from frontend service

4. **Health Check Configuration**:
   - **Frontend Health Check**: `http://ignacio.ignia.lat/health`
   - **Backend Health Check**: `http://ignacio.ignia.lat/api/health`

### Step 4: Environment Variables in Coolify.io

Upload these environment variables in Coolify.io:

```env
# Core Application
APP_ENV=production
DEBUG=False
PYTHONPATH=/app

# Database (Supabase)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_actual_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_actual_service_role_key

# OpenAI
OPENAI_API_KEY=your_actual_openai_key

# JWT Security
JWT_SECRET_KEY=your_strong_production_jwt_secret
JWT_ALGORITHM=HS256
JWT_ACCESS_TOKEN_EXPIRE_MINUTES=1440

# Domain Configuration
CORS_ORIGINS=https://ignacio.ignia.lat
VITE_API_URL=https://ignacio.ignia.lat/api
ALLOWED_HOSTS=ignacio.ignia.lat,www.ignacio.ignia.lat

# Performance
UVICORN_WORKERS=4
LOG_LEVEL=INFO
```

### Step 5: Deploy and Verify

1. **Deploy the Application**:
   - Click "Deploy" in Coolify.io dashboard
   - Monitor build logs for any issues

2. **Verify Deployment**:
   ```bash
   # Check frontend
   curl -f https://ignacio.ignia.lat/health

   # Check backend API
   curl -f https://ignacio.ignia.lat/api/health
   ```

3. **Test Functionality**:
   - Visit `https://ignacio.ignia.lat`
   - Verify login functionality
   - Test chat functionality
   - Check API connectivity

## 🔧 Production Optimizations Included

### Frontend (React + Nginx):
- ✅ Multi-stage Docker build (Node.js build → Nginx serve)
- ✅ Gzip compression enabled
- ✅ Static asset caching (1 year)
- ✅ Security headers configured
- ✅ SPA routing support
- ✅ API proxy to backend
- ✅ Health check endpoint

### Backend (FastAPI):
- ✅ Production uvicorn configuration (4 workers)
- ✅ No development reload flag
- ✅ Health check endpoint
- ✅ Environment-aware configuration (auto-detects .env files)
- ✅ Configurable security headers and ALLOWED_HOSTS
- ✅ Production logging configuration (LOG_LEVEL, LOG_FORMAT)
- ✅ Configurable JWT token expiration (24 hours default)
- ✅ Rate limiting and performance settings ready

### Infrastructure:
- ✅ Restart policies (unless-stopped)
- ✅ Health check monitoring
- ✅ Network isolation
- ✅ No local database (uses Supabase)
- ✅ SSL/HTTPS ready
- ✅ Environment-based configuration

## 🛠 Troubleshooting

### Common Issues:

1. **Build Fails**:
   - Check that all environment variables are set
   - Verify Docker build logs in Coolify.io
   - Ensure `.env.production` is properly configured

2. **SSL Certificate Issues**:
   - Verify DNS is pointing to correct IP
   - Check domain configuration in Coolify.io
   - Wait for DNS propagation (up to 24 hours)

3. **API Connection Issues**:
   - Verify backend health check: `/api/health`
   - Check CORS configuration in environment
   - Verify Supabase connection settings

4. **Frontend Not Loading**:
   - Check nginx configuration
   - Verify static files are built correctly
   - Check browser console for errors

5. **Environment Configuration Issues**:
   - Verify `APP_ENV=production` is set in docker-compose.prod.yml
   - Ensure `.env.production` file exists and has correct values
   - Check that environment variables match between .env.production.example and actual .env.production
   - Verify the backend container can access the .env.production file

### Logs and Debugging:
- **Coolify.io Dashboard**: View application logs
- **Docker Logs**: `docker logs <container_name>`
- **Health Checks**: Monitor `/health` endpoints

## 🔄 Updates and Maintenance

To deploy updates:
1. Push changes to your Git repository
2. Coolify.io will automatically rebuild and redeploy
3. Monitor deployment logs for any issues

## 🚧 Next Steps (Optional)

1. **API Subdomain**: Consider setting up `api.ignacio.ignia.lat` for the backend
2. **Monitoring**: Add application monitoring (e.g., Sentry)
3. **Backup**: Set up automated backups for Supabase data
4. **CDN**: Consider CloudFlare for additional performance/security
5. **Redis**: Uncomment Redis service in docker-compose.prod.yml if needed for caching

Your Ignacio Bot is now ready for production deployment! 🎉