# CrashLens Deployment Guide

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Cloud Platform Deployment](#cloud-platform-deployment)
3. [Database Setup](#database-setup)
4. [Environment Configuration](#environment-configuration)
5. [CI/CD Setup](#cicd-setup)
6. [Monitoring](#monitoring)

## Prerequisites

### Required Accounts
- [ ] GitHub account (for code hosting)
- [ ] Supabase account (database)
- [ ] HERE Developer account (traffic API)
- [ ] Cloud hosting platform account (choose one):
  - Railway
  - Render
  - Digital Ocean
  - Vercel (frontend only)
  - Fly.io

### Required Tools
- Docker & Docker Compose
- Git
- Node.js 18+
- Python 3.11+

## Cloud Platform Deployment

### Option 1: Railway (Recommended)

**Backend Deployment:**
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Initialize project
cd crashlens/backend
railway init

# Add environment variables via Railway dashboard
railway variables set HERE_API_KEY=your_key
railway variables set STORAGE_URL=your_supabase_url
railway variables set STORAGE_KEY=your_supabase_key

# Deploy
railway up
```

**Frontend Deployment:**
```bash
cd crashlens/frontend
railway init
railway variables set VITE_API_URL=https://your-backend.railway.app
railway up
```

### Option 2: Vercel (Frontend) + Railway/Render (Backend)

**Frontend to Vercel:**
```bash
# Install Vercel CLI
npm install -g vercel

cd crashlens/frontend
vercel --prod

# Set environment variables in Vercel dashboard
# VITE_API_URL=https://your-backend-url.com
```

**Backend to Render:**
1. Connect GitHub repository to Render
2. Create new Web Service
3. Select `backend` directory
4. Set build command: `pip install -r requirements.txt`
5. Set start command: `uvicorn app:app --host 0.0.0.0 --port $PORT`
6. Add environment variables

### Option 3: Digital Ocean App Platform

1. Create new app in Digital Ocean
2. Connect GitHub repository
3. Configure components:
   - **Backend**: Python app, port 8000
   - **Frontend**: Node.js static site
   - **Redis**: Add managed Redis database (optional)
4. Set environment variables
5. Deploy

### Option 4: Docker on VPS

**Setup on Ubuntu/Debian VPS:**
```bash
# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Install Docker Compose
sudo apt-get install docker-compose-plugin

# Clone repository
git clone https://github.com/your-username/crashlens.git
cd crashlens

# Configure environment
cp .env.example .env
nano .env  # Edit with your values

# Start services
docker-compose up -d

# Setup NGINX reverse proxy (optional)
sudo apt install nginx
sudo nano /etc/nginx/sites-available/crashlens
```

**NGINX Configuration:**
```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:5173;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    location /api {
        proxy_pass http://localhost:8000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

## Database Setup

### Supabase Setup (Recommended)

1. **Create Project:**
   - Go to [supabase.com](https://supabase.com)
   - Create new project
   - Note your project URL and anon key

2. **Run Schema:**
   - Go to SQL Editor in Supabase dashboard
   - Copy contents of `database-schema.sql`
   - Execute the SQL

3. **Configure RLS (Row Level Security):**
   - Enable RLS on incidents table
   - Add appropriate policies for your use case

4. **Get Connection Details:**
   - Project URL: `https://xxxxx.supabase.co`
   - Anon Key: From Settings > API

### Firebase Setup (Alternative)

1. **Create Project:**
   - Go to [Firebase Console](https://console.firebase.google.com)
   - Create new project
   - Enable Firestore

2. **Generate Service Account:**
   - Project Settings > Service Accounts
   - Generate new private key
   - Save as `firebase-credentials.json`

3. **Firestore Collections:**
   - Create `incidents` collection
   - Add indexes for: latitude, longitude, start_time, criticality

## Environment Configuration

### Backend Environment Variables

**Required:**
```env
HERE_API_KEY=your_here_api_key
STORAGE_TYPE=supabase
STORAGE_URL=https://xxxxx.supabase.co
STORAGE_KEY=your_supabase_anon_key
```

**Optional but Recommended:**
```env
PORT=8000
ALLOWED_ORIGINS=https://your-frontend.com
REDIS_URL=redis://redis:6379
SENTRY_DSN=your_sentry_dsn
ENVIRONMENT=production
```

### Frontend Environment Variables

```env
VITE_API_URL=https://your-backend-api.com
```

## CI/CD Setup

### GitHub Actions

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy CrashLens

on:
  push:
    branches: [main]

jobs:
  deploy-backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Deploy to Railway
        run: |
          npm install -g @railway/cli
          railway link ${{ secrets.RAILWAY_PROJECT_ID }}
          cd backend && railway up
        env:
          RAILWAY_TOKEN: ${{ secrets.RAILWAY_TOKEN }}

  deploy-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Deploy to Vercel
        run: |
          npm install -g vercel
          cd frontend && vercel --prod --token=${{ secrets.VERCEL_TOKEN }}
```

### Secrets to Add

In GitHub Settings > Secrets:
- `RAILWAY_TOKEN`
- `RAILWAY_PROJECT_ID`
- `VERCEL_TOKEN`
- `HERE_API_KEY`
- `STORAGE_URL`
- `STORAGE_KEY`

## Monitoring

### Sentry Setup (Error Tracking)

1. Create Sentry project at [sentry.io](https://sentry.io)
2. Get DSN from project settings
3. Add to backend environment:
   ```env
   SENTRY_DSN=https://xxx@sentry.io/xxx
   ```

### Uptime Monitoring

Use one of these services:
- [UptimeRobot](https://uptimerobot.com) (Free)
- [Pingdom](https://www.pingdom.com)
- [StatusCake](https://www.statuscake.com)

Monitor these endpoints:
- `https://your-api.com/health`
- `https://your-frontend.com`

### Application Monitoring

**Backend (FastAPI):**
```python
# Already included in app.py
# Check /health endpoint for status
```

**Log Management:**
- Railway: Built-in logs
- Digital Ocean: App Platform logs
- VPS: Use `docker-compose logs -f`

## Performance Optimization

### Redis Caching

**Cloud Redis Options:**
- Railway: Built-in Redis addon
- Upstash: Serverless Redis
- Redis Cloud: Free tier available

**Configure:**
```env
REDIS_URL=redis://your-redis-url:6379
```

### CDN Setup

For frontend static assets:
1. Use Vercel (CDN built-in)
2. Or configure Cloudflare CDN
3. Or use AWS CloudFront

## Security Checklist

- [ ] Use HTTPS everywhere
- [ ] Set proper CORS origins
- [ ] Enable Supabase RLS policies
- [ ] Use environment variables for secrets
- [ ] Set up API rate limiting
- [ ] Enable security headers
- [ ] Regular dependency updates
- [ ] Monitor for vulnerabilities

## Backup Strategy

### Supabase Backups
- Automatic daily backups (paid plans)
- Manual backup: Database > Backups
- Export to CSV for long-term storage

### Code Backups
- GitHub repository (always up to date)
- Multiple deployment environments

## Scaling Considerations

### Horizontal Scaling
- Railway: Automatic scaling available
- Digital Ocean: App Platform auto-scaling
- VPS: Use load balancer + multiple instances

### Database Scaling
- Supabase automatically scales
- Add read replicas if needed
- Consider partitioning for large datasets

## Troubleshooting

### Backend Issues
```bash
# Check logs
railway logs
# or
docker-compose logs backend

# Test API directly
curl https://your-api.com/health
```

### Frontend Issues
```bash
# Check build logs
vercel logs

# Test locally with production API
VITE_API_URL=https://your-api.com npm run dev
```

### Database Issues
```bash
# Check Supabase connection
# Go to Supabase Dashboard > Database > Connection pooler
# Test connection string
```

## Cost Estimates

### Free Tier Deployment
- Supabase: Free (up to 500MB, 2GB bandwidth)
- Vercel: Free (hobby plan)
- Railway: $5/month credit (then pay as you go)
- **Total: ~$0-10/month**

### Production Deployment
- Supabase Pro: $25/month
- Railway: ~$10-20/month
- Redis: $5-10/month (optional)
- **Total: ~$40-55/month**

## Support & Resources

- [FastAPI Docs](https://fastapi.tiangolo.com)
- [React Docs](https://react.dev)
- [Supabase Docs](https://supabase.com/docs)
- [HERE API Docs](https://developer.here.com/documentation)

---

Ready to deploy! 🚀
