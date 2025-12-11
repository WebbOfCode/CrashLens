# 🆓 Free Platform Deployment Guide

**Launch CrashLens on 100% Free Platforms**

This guide provides complete step-by-step instructions for deploying CrashLens using only free tier services. Perfect for students, developers, and small projects.

## 📋 Table of Contents

1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Option 1: Render (Recommended for Beginners)](#option-1-render-recommended-for-beginners)
4. [Option 2: Railway (Free $5 Credit)](#option-2-railway-free-5-credit)
5. [Option 3: Vercel + Render Combo](#option-3-vercel--render-combo)
6. [Cost Breakdown](#cost-breakdown)
7. [Troubleshooting](#troubleshooting)

---

## 🎯 Overview

### What You'll Deploy

- **Backend API**: FastAPI application running on a free cloud platform
- **Frontend**: React application with interactive maps
- **Database**: Supabase (free tier)
- **External API**: HERE Traffic API (free tier)

### Total Monthly Cost: $0

All platforms used offer generous free tiers perfect for development and small-scale production use.

---

## ✅ Prerequisites

Before starting, you'll need:

### Required Accounts (All Free)

1. ✅ **GitHub Account** - [Sign up](https://github.com/join)
2. ✅ **Supabase Account** - [Sign up](https://supabase.com/)
3. ✅ **HERE Developer Account** - [Sign up](https://developer.here.com/)
4. ✅ Choose one hosting platform:
   - **Render** - [Sign up](https://render.com/)
   - **Railway** - [Sign up](https://railway.app/)
   - **Vercel** - [Sign up](https://vercel.com/)

### API Keys Setup

If you haven't already, follow [SETUP_GUIDE.md](./SETUP_GUIDE.md) to get:
- HERE API Key
- Supabase URL and API Key

---

## 🚀 Option 1: Render (Recommended for Beginners)

**Why Render?**
- ✅ Completely free tier (750 hours/month)
- ✅ No credit card required
- ✅ Automatic HTTPS
- ✅ Easy deployment from GitHub
- ✅ Built-in environment variables management

### Step 1: Prepare Your Repository

1. **Fork the Repository** (if you haven't already)
   - Go to: https://github.com/WebbOfCode/CrashLens
   - Click **"Fork"** in the top right
   - This creates your own copy

2. **Clone Your Fork**
   ```bash
   git clone https://github.com/YOUR_USERNAME/CrashLens.git
   cd CrashLens
   ```

### Step 2: Deploy Backend to Render

1. **Log in to Render**
   - Go to: https://dashboard.render.com/
   - Sign in with GitHub

2. **Create New Web Service**
   - Click **"New +"** button
   - Select **"Web Service"**

3. **Connect Repository**
   - Click **"Connect account"** if needed
   - Find and select your `CrashLens` repository
   - Click **"Connect"**

4. **Configure Service**
   Fill in the following settings:

   - **Name**: `crashlens-backend` (or any name you like)
   - **Region**: Choose closest to you
   - **Branch**: `main`
   - **Root Directory**: `backend`
   - **Runtime**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn app:app --host 0.0.0.0 --port $PORT`
   - **Instance Type**: `Free`

5. **Add Environment Variables**
   
   Click **"Advanced"** and add these environment variables:

   | Key | Value | Example |
   |-----|-------|---------|
   | `HERE_API_KEY` | Your HERE API key | `Ab1Cd2Ef3Gh4...` |
   | `STORAGE_TYPE` | `supabase` | `supabase` |
   | `STORAGE_URL` | Your Supabase URL | `https://abc.supabase.co` |
   | `STORAGE_KEY` | Your Supabase anon key | `eyJhbGc...` |
   | `ALLOWED_ORIGINS` | `*` (for now) | `*` |

6. **Deploy**
   - Click **"Create Web Service"**
   - Wait 2-5 minutes for deployment
   - You'll see build logs in real-time

7. **Get Your Backend URL**
   - Once deployed, you'll see a URL like: `https://crashlens-backend.onrender.com`
   - **Copy this URL** - you'll need it for the frontend

8. **Test Your Backend**
   - Open: `https://YOUR-BACKEND-URL.onrender.com/health`
   - You should see a JSON response with `"status": "healthy"`

### Step 3: Deploy Frontend to Render

1. **Create Another Web Service**
   - Click **"New +"** → **"Web Service"**
   - Select your `CrashLens` repository again

2. **Configure Frontend Service**

   - **Name**: `crashlens-frontend`
   - **Region**: Same as backend
   - **Branch**: `main`
   - **Root Directory**: `frontend`
   - **Runtime**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npx serve -s dist -l $PORT`
   - **Instance Type**: `Free`

3. **Add Environment Variables**

   | Key | Value |
   |-----|-------|
   | `VITE_API_URL` | Your backend URL (from Step 2.7) |

   Example: `https://crashlens-backend.onrender.com`

4. **Deploy Frontend**
   - Click **"Create Web Service"**
   - Wait 3-5 minutes for build and deployment

5. **Access Your App**
   - Once deployed, you'll get a URL like: `https://crashlens-frontend.onrender.com`
   - Open it in your browser
   - You should see the CrashLens dashboard!

### Step 4: Configure CORS (Important!)

1. **Update Backend Environment**
   - Go to your backend service in Render
   - Click **"Environment"** tab
   - Update `ALLOWED_ORIGINS` to your frontend URL:
     ```
     https://crashlens-frontend.onrender.com
     ```
   - Click **"Save Changes"**
   - Backend will automatically redeploy

### Step 5: Verify Deployment

✅ **Backend Health Check**
- Visit: `https://YOUR-BACKEND.onrender.com/health`
- Should return: `{"status": "healthy"}`

✅ **API Documentation**
- Visit: `https://YOUR-BACKEND.onrender.com/docs`
- You should see FastAPI interactive docs

✅ **Frontend**
- Visit: `https://YOUR-FRONTEND.onrender.com`
- Map should load
- Try moving around the map
- Incidents should appear

✅ **Database**
- Go to your Supabase dashboard
- Check the `incidents` table
- Data should appear as you interact with the app

### 🎉 Success!

Your CrashLens application is now live on 100% free infrastructure!

**Share Your Links:**
- Frontend: `https://crashlens-frontend.onrender.com`
- API Docs: `https://crashlens-backend.onrender.com/docs`

---

## 🚂 Option 2: Railway (Free $5 Credit)

**Why Railway?**
- ✅ $5 free credit per month (enough for small projects)
- ✅ Simpler than Render
- ✅ Automatic SSL
- ✅ Built-in metrics

### Step 1: Install Railway CLI

```bash
# Using npm
npm install -g @railway/cli

# Or using curl (Linux/Mac)
curl -fsSL https://railway.app/install.sh | sh
```

### Step 2: Login to Railway

```bash
railway login
```

This will open a browser window to authenticate.

### Step 3: Deploy Backend

```bash
cd CrashLens/backend
railway init
```

When prompted:
- **Project name**: `crashlens-backend`
- **Environment**: `production`

Add environment variables:

```bash
railway variables set HERE_API_KEY=your_here_api_key
railway variables set STORAGE_TYPE=supabase
railway variables set STORAGE_URL=https://your-project.supabase.co
railway variables set STORAGE_KEY=your_supabase_anon_key
railway variables set ALLOWED_ORIGINS="*"
```

Deploy:

```bash
railway up
```

Get your backend URL:

```bash
railway domain
```

This creates a public URL like: `crashlens-backend-production.up.railway.app`

### Step 4: Deploy Frontend

```bash
cd ../frontend
railway init
```

When prompted:
- **Project name**: `crashlens-frontend`
- **Environment**: `production`

Add environment variable:

```bash
railway variables set VITE_API_URL=https://YOUR-BACKEND-URL.up.railway.app
```

Deploy:

```bash
railway up
railway domain
```

### Step 5: Update CORS

```bash
cd ../backend
railway variables set ALLOWED_ORIGINS=https://YOUR-FRONTEND-URL.up.railway.app
```

### Step 6: Verify

Visit your frontend URL and test the application!

---

## 🔷 Option 3: Vercel + Render Combo

**Why This Combo?**
- ✅ Vercel has excellent frontend performance (CDN)
- ✅ Render is great for backend
- ✅ Both completely free
- ✅ Best performance option

### Step 1: Deploy Backend to Render

Follow [Option 1, Steps 1-2](#step-2-deploy-backend-to-render) to deploy the backend.

### Step 2: Deploy Frontend to Vercel

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Deploy Frontend**
   ```bash
   cd CrashLens/frontend
   vercel
   ```

   When prompted:
   - **Set up and deploy?**: `Y`
   - **Which scope?**: Your account
   - **Link to existing project?**: `N`
   - **Project name**: `crashlens`
   - **Directory**: `./`
   - **Override settings?**: `N`

4. **Set Environment Variable**
   ```bash
   vercel env add VITE_API_URL
   ```
   
   When prompted, enter your Render backend URL:
   ```
   https://crashlens-backend.onrender.com
   ```

5. **Deploy to Production**
   ```bash
   vercel --prod
   ```

6. **Get Your URL**
   You'll receive a URL like: `https://crashlens.vercel.app`

### Step 3: Update Backend CORS

Go to your Render backend → Environment → Update `ALLOWED_ORIGINS`:
```
https://crashlens.vercel.app
```

---

## 💰 Cost Breakdown

### Completely Free Setup

| Service | Free Tier | What It Covers | Limits |
|---------|-----------|----------------|---------|
| **Supabase** | Free forever | Database, Auth, Storage | 500MB database, 2GB bandwidth/month |
| **HERE API** | Free forever | Traffic data | 250,000 requests/month |
| **Render** | Free forever | Backend + Frontend hosting | 750 hours/month (enough for 1 service 24/7) |
| **Vercel** | Free forever | Frontend hosting | 100GB bandwidth/month |
| **Railway** | $5 credit/month | Backend hosting | ~$5 worth of usage/month |

### When You'll Need to Upgrade

You'll only need paid plans if:
- Database grows beyond 500MB (Supabase Pro: $25/month)
- Traffic exceeds 250K requests/month (HERE: contact sales)
- Backend needs 24/7 uptime on multiple services (Render: $7/month per service)
- Bandwidth exceeds free tiers

For most student projects and MVPs, free tiers are more than enough!

---

## 🎨 Custom Domain (Optional)

### Using Render

1. Buy domain from Namecheap, Google Domains, etc.
2. In Render dashboard:
   - Go to your service
   - Click "Settings" → "Custom Domain"
   - Add your domain
   - Update DNS records as shown

### Using Vercel

1. In Vercel dashboard:
   - Go to project
   - Settings → Domains
   - Add your domain
   - Follow DNS instructions

---

## 🔧 Troubleshooting

### Backend Won't Deploy

**Error: "Missing environment variables"**
- ✅ Solution: Go to Environment tab and add all required variables
- Check spelling of variable names

**Error: "Build failed"**
- ✅ Solution: Check `requirements.txt` is present in backend folder
- Verify Python version (3.11+)

**Error: "Port already in use"**
- ✅ Solution: Make sure start command uses `$PORT` variable
- Render/Railway automatically assign ports

### Frontend Won't Deploy

**Error: "Build failed - vite not found"**
- ✅ Solution: Ensure `npm install` runs before build
- Check `package.json` exists

**Error: "API calls failing (CORS)"**
- ✅ Solution: Update backend `ALLOWED_ORIGINS` to match frontend URL
- Use exact URL (no trailing slash)

**Map not loading**
- ✅ Check browser console for errors
- Verify `VITE_API_URL` is set correctly
- Test backend health endpoint

### Database Issues

**"Supabase connection failed"**
- ✅ Verify `STORAGE_URL` and `STORAGE_KEY` are correct
- Check Supabase project is active
- Run the database schema SQL if not done

**"No data showing"**
- ✅ Check Supabase Table Editor for `incidents` table
- Verify RLS policies allow public read
- Try different map locations (some areas have more incidents)

### Platform-Specific Issues

**Render: "Service keeps sleeping"**
- ✅ Free tier services sleep after 15 min of inactivity
- First request after sleep takes ~30 seconds
- Upgrade to paid plan for 24/7 uptime

**Railway: "Ran out of credits"**
- ✅ Free $5 credit usually renews monthly
- Check usage in dashboard
- Optimize to reduce resource usage

**Vercel: "Build timeout"**
- ✅ Free tier has 45-second build limit
- Frontend build should complete in ~30 seconds
- If not, check for large dependencies

---

## 📱 Testing Your Deployment

### 1. Health Check
```bash
curl https://YOUR-BACKEND-URL/health
```

Expected response:
```json
{
  "status": "healthy",
  "checks": {
    "api": "ok",
    "here_api": "ok",
    "storage": "ok"
  }
}
```

### 2. Test Traffic API
```bash
curl "https://YOUR-BACKEND-URL/api/incidents?bbox=-86.8,36.1,-86.7,36.2"
```

Should return array of incidents (may be empty if no incidents in area).

### 3. Frontend Test
- Open your frontend URL
- Move map to major city (Los Angeles, New York, etc.)
- Check for incident markers
- Click on a marker to see details

---

## 🚀 Next Steps

After successful deployment:

1. **Add Custom Domain**
   - Make it more professional
   - See [Custom Domain](#custom-domain-optional) section

2. **Enable Monitoring**
   - Set up [UptimeRobot](https://uptimerobot.com) (free)
   - Get alerts if site goes down

3. **Optimize Performance**
   - Add caching with Upstash Redis (free tier)
   - Enable Vercel Analytics (free)

4. **Add Features**
   - Implement user authentication
   - Add email notifications
   - Create mobile app

5. **Share Your Project**
   - Add to your portfolio
   - Share on social media
   - Submit to showcases

---

## 📞 Support

### Getting Help

- **Documentation**: Check [README.md](./README.md) and [SETUP_GUIDE.md](./SETUP_GUIDE.md)
- **Platform Docs**:
  - [Render Docs](https://render.com/docs)
  - [Railway Docs](https://docs.railway.app)
  - [Vercel Docs](https://vercel.com/docs)
- **Community**: Open an issue on GitHub

### Useful Resources

- [FastAPI Deployment Guide](https://fastapi.tiangolo.com/deployment/)
- [Vite Deployment Guide](https://vitejs.dev/guide/static-deploy.html)
- [Supabase Quick Start](https://supabase.com/docs/guides/getting-started)

---

## ✅ Checklist

Before marking as complete, verify:

- [ ] Backend deployed and accessible
- [ ] Frontend deployed and accessible
- [ ] Database connection working
- [ ] HERE API returning data
- [ ] Map loads correctly
- [ ] Incidents display on map
- [ ] CORS configured properly
- [ ] No console errors
- [ ] Mobile responsive (test on phone)
- [ ] Share your success! 🎉

---

**Built with ❤️ for students and developers**

Need more help? Open an issue or check the main [README.md](./README.md)
