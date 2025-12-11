# CrashLens Setup Guide

Complete step-by-step instructions for getting your API keys and setting up accounts.

## 📋 Table of Contents
1. [HERE API Key Setup](#here-api-key-setup)
2. [Supabase Account Setup](#supabase-account-setup)
3. [Environment Configuration](#environment-configuration)
4. [Verification](#verification)

---

## 🗺️ HERE API Key Setup

### Step 1: Create HERE Account

1. **Go to HERE Developer Portal**
   - Visit: https://developer.here.com/
   - Click **"Get Started for Free"** or **"Sign Up"** in the top right

2. **Register Your Account**
   - Choose **"Sign up with Email"**
   - Or use GitHub/Google sign-in for faster registration
   - Fill in:
     - Full Name
     - Email Address
     - Password
     - Country
   - Accept the Terms and Conditions
   - Click **"Register"**

3. **Verify Your Email**
   - Check your email inbox
   - Click the verification link sent by HERE
   - You'll be redirected to the HERE Platform

### Step 2: Create a Project

1. **Access the Dashboard**
   - After login, you'll see the HERE Platform dashboard
   - Click on **"Projects"** in the left sidebar
   - Or go directly to: https://platform.here.com/admin/projects

2. **Create New Project**
   - Click **"Create new project"**
   - Enter project details:
     - **Project Name**: "CrashLens" (or any name you prefer)
     - **Description**: "Traffic incident monitoring application"
   - Click **"Create"**

### Step 3: Generate API Key

1. **Generate REST API Key**
   - In your project, click **"Generate App"**
   - Or click **"REST"** under API Keys
   - Click **"Create API Key"**

2. **Configure API Key**
   - **Name**: "CrashLens API Key"
   - **Type**: Select **"REST"**
   - Click **"Generate"**

3. **Copy Your API Key**
   - ⚠️ **IMPORTANT**: Copy the API key immediately
   - It will look like: `YOUR_KEY_HERE_abcdef123456789`
   - Store it securely - you won't see it again
   - Click **"Close"**

### Step 4: Enable Required APIs

1. **Go to API Settings**
   - In your project dashboard
   - Click on your API key to view details

2. **Verify These APIs are Enabled**:
   - ✅ **Traffic API v7** (Required)
   - ✅ **Positioning API** (Helpful)
   - ✅ **Routing API v8** (Optional, for future features)

3. **Check Usage Limits**
   - Free tier includes:
     - 250,000 transactions per month
     - Traffic API: Real-time incident data
   - For more: https://developer.here.com/pricing

### Step 5: Test Your API Key

Run this in PowerShell to verify:

```powershell
$apiKey = "IVD4-6gQI3Agxr9tEOirxnWwuPUqZfTVCL1jsDV-7Yg"
$url = "https://data.traffic.hereapi.com/v7/incidents?in=bbox:-86.8,36.1,-86.7,36.2&apiKey=$apiKey"
Invoke-RestMethod -Uri $url -Method Get
```

If successful, you'll see traffic incident data!

---

## 🗄️ Supabase Account Setup

### Step 1: Create Supabase Account

1. **Go to Supabase**
   - Visit: https://supabase.com/
   - Click **"Start your project"** or **"Sign Up"**

2. **Sign Up**
   - Choose **"Continue with GitHub"** (recommended)
   - Or use email/password
   - Authorize Supabase to access your GitHub (if using GitHub)

3. **Complete Registration**
   - Verify your email if using email signup
   - You'll be redirected to the Supabase dashboard

### Step 2: Create a New Project

1. **Create Organization (First Time Only)**
   - Click **"New organization"**
   - **Organization Name**: Your name or company
   - **Pricing Plan**: Select **"Free"** ($0/month)
     - Includes: 500MB database, 2GB bandwidth
     - Perfect for development and testing
   - Click **"Create organization"**

2. **Create Project**
   - Click **"New project"**
   - Fill in project details:
     - **Name**: `crashlens` (or `crashlens-dev`)
     - **Database Password**: Generate a strong password
       - ⚠️ **SAVE THIS PASSWORD** - you'll need it later
       - Use a password manager
     - **Region**: Choose closest to your users
       - US East (Ohio) - `us-east-1`
       - US West (Oregon) - `us-west-1`
       - Europe (Frankfurt) - `eu-central-1`
       - Asia Pacific (Singapore) - `ap-southeast-1`
     - **Pricing Plan**: Free
   - Click **"Create new project"**

3. **Wait for Setup**
   - Project creation takes 1-2 minutes
   - You'll see "Setting up project..." status
   - Wait for "Project is ready" message

### Step 3: Set Up Database Schema

1. **Open SQL Editor**
   - In your project dashboard, click **"SQL Editor"** in the left sidebar
   - Or click the **"Database"** icon, then **"SQL Editor"**

2. **Create Incidents Table**
   - Click **"New query"**
   - Copy and paste this SQL:

```sql
-- Create incidents table
CREATE TABLE IF NOT EXISTS incidents (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL,
  description TEXT,
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  severity INTEGER,
  criticality TEXT CHECK (criticality IN ('critical', 'major', 'minor', 'low')),
  start_time TIMESTAMP NOT NULL,
  end_time TIMESTAMP,
  road_name TEXT,
  length DOUBLE PRECISION,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_incidents_location ON incidents (latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_incidents_time ON incidents (start_time DESC);
CREATE INDEX IF NOT EXISTS idx_incidents_criticality ON incidents (criticality);
CREATE INDEX IF NOT EXISTS idx_incidents_created ON incidents (created_at DESC);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_incidents_updated_at 
    BEFORE UPDATE ON incidents
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create analytics view
CREATE OR REPLACE VIEW incident_analytics AS
SELECT 
  DATE_TRUNC('hour', start_time) as hour,
  criticality,
  COUNT(*) as incident_count,
  AVG(severity) as avg_severity
FROM incidents
WHERE start_time >= NOW() - INTERVAL '24 hours'
GROUP BY DATE_TRUNC('hour', start_time), criticality
ORDER BY hour DESC;
```

3. **Run the Query**
   - Click **"Run"** (or press Ctrl+Enter)
   - You should see: "Success. No rows returned"
   - This created your database tables

4. **Verify Tables Created**
   - Click **"Table Editor"** in the left sidebar
   - You should see the **"incidents"** table
   - Click on it to view the structure

### Step 4: Configure Security (Row Level Security)

1. **Enable RLS**
   - In **Table Editor**, select **"incidents"** table
   - Click the **shield icon** or **"RLS"** tab
   - Toggle **"Enable RLS"** to ON

2. **Add Policies**
   - Click **"New Policy"**
   - Choose **"Create a policy from scratch"**

3. **Policy 1: Allow Public Read**
   ```sql
   CREATE POLICY "Enable read access for all users" 
   ON incidents FOR SELECT 
   USING (true);
   ```
   - **Policy name**: "Public read access"
   - **Allowed operation**: SELECT
   - **USING expression**: `true`
   - Click **"Review"** then **"Save policy"**

4. **Policy 2: Allow Authenticated Insert** (Optional)
   ```sql
   CREATE POLICY "Enable insert for authenticated users only" 
   ON incidents FOR INSERT 
   WITH CHECK (auth.role() = 'authenticated');
   ```
   - Only add this if you plan to add authentication later

### Step 5: Get API Keys

1. **Access Settings**
   - Click **"Settings"** (gear icon) in the left sidebar
   - Click **"API"** under Project Settings

2. **Copy Connection Details**
   You'll see several important values:

   **Project URL:**
   ```
   https://abcdefghijk.supabase.co
   ```
   ⚠️ **Copy this** - This is your `STORAGE_URL`

   **API Keys:**
   - **anon public**: `eyJhbG...` (long string)
     - ⚠️ **Copy this** - This is your `STORAGE_KEY`
     - This is safe to use in frontend code
     - Used for Row Level Security
   
   - **service_role**: `eyJhbG...` (different long string)
     - ⚠️ **Keep this SECRET** - Never expose in frontend
     - Only use in backend if you need admin access

3. **Save These Values**
   Store in a secure location:
   ```
   STORAGE_URL=https://abcdefghijk.supabase.co
   STORAGE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

### Step 6: Test Connection

1. **Go to API Docs**
   - In Settings > API
   - Scroll down to **"API URL"**
   - Click **"Get started"** or view documentation

2. **Test in PowerShell**:
   ```powershell
   $apiUrl = "https://YOUR_PROJECT.supabase.co"
   $apiKey = "YOUR_ANON_KEY"
   
   $headers = @{
       "apikey" = $apiKey
       "Authorization" = "Bearer $apiKey"
   }
   
   Invoke-RestMethod -Uri "$apiUrl/rest/v1/incidents?select=*&limit=10" -Headers $headers
   ```

   If successful, you'll see an empty array `[]` (since no data yet)

---

## ⚙️ Environment Configuration

### Step 1: Create .env File

1. **Navigate to crashlens folder**:
   ```powershell
   cd "c:\Users\demar\WORKING_PROJECTS\TrafficWiz-MTSU FINAL COPY\crashlens"
   ```

2. **Copy the example file**:
   ```powershell
   Copy-Item .env.example .env
   ```

3. **Edit the .env file**:
   ```powershell
   notepad .env
   ```

### Step 2: Add Your Credentials

Replace the placeholder values with your actual keys:

```env
# HERE API Configuration
HERE_API_KEY=YOUR_HERE_API_KEY_FROM_STEP_1

# Storage Configuration (Supabase)
STORAGE_TYPE=supabase
STORAGE_URL=https://YOUR_PROJECT_ID.supabase.co
STORAGE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.YOUR_ANON_KEY

# Redis Cache (Optional - skip for now)
# REDIS_URL=redis://localhost:6379
```

**Example with real values:**
```env
HERE_API_KEY=Ab1Cd2Ef3Gh4Ij5Kl6Mn7Op8Qr9St0Uv1Wx2Yz3
STORAGE_TYPE=supabase
STORAGE_URL=https://xyzabcdefghijk.supabase.co
STORAGE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh5emFiY2RlZmdoaWprIiwicm9sZSI6ImFub24iLCJpYXQiOjE2MzA1MDAwMDAsImV4cCI6MTk0NTk5OTk5OX0.SIGNATURE_HERE
```

### Step 3: Configure Backend

```powershell
cd backend
Copy-Item .env.example .env
notepad .env
```

Add the same credentials plus any backend-specific settings.

### Step 4: Configure Frontend

```powershell
cd ..\frontend
Copy-Item .env.example .env
notepad .env
```

Edit:
```env
VITE_API_URL=http://localhost:8000
```

For production, change to your deployed backend URL.

---

## ✅ Verification

### Test Backend Connection

1. **Install dependencies**:
   ```powershell
   cd c:\Users\demar\WORKING_PROJECTS\TrafficWiz-MTSU FINAL COPY\crashlens\backend
   python -m venv venv
   .\venv\Scripts\activate
   pip install -r requirements.txt
   ```

2. **Run the backend**:
   ```powershell
   python app.py
   ```

3. **Test in browser**:
   - Open: http://localhost:8000/health
   - Should see:
     ```json
     {
       "status": "healthy",
       "checks": {
         "api": "ok",
         "here_api": "ok",
         "storage": "ok",
         "cache": "disabled"
       }
     }
     ```

### Test Frontend

1. **Install dependencies**:
   ```powershell
   cd ..\frontend
   npm install
   ```

2. **Run the frontend**:
   ```powershell
   npm run dev
   ```

3. **Open in browser**:
   - Go to: http://localhost:5173
   - You should see the CrashLens dashboard
   - Map should load
   - Try moving the map around

### Test Full Integration

1. **With both backend and frontend running**:
   - Move the map around
   - Check the incident list updates
   - Click on a map marker
   - Check browser console for any errors

2. **Check Supabase Data**:
   - Go to Supabase dashboard
   - Click **"Table Editor"**
   - Select **"incidents"** table
   - After moving the map, you should see incident data appear

---

## 🎉 You're Done!

Your CrashLens application is now fully configured with:
- ✅ HERE API for traffic data
- ✅ Supabase for cloud storage
- ✅ Backend running on port 8000
- ✅ Frontend running on port 5173

### Next Steps:

1. **Explore the Application**
   - Try different areas on the map
   - View the analytics dashboard
   - Check incident details

2. **Deploy to Production**
   - See [DEPLOYMENT.md](./DEPLOYMENT.md) for deployment guides
   - Choose a hosting platform (Railway, Vercel, etc.)

3. **Customize**
   - Modify the UI in `frontend/src`
   - Add features to `backend/app.py`
   - Adjust map center in `frontend/src/lib/config.js`

### 🆘 Troubleshooting

**"HERE API key invalid"**
- Verify the key is correct in `.env`
- Check the key hasn't expired
- Ensure Traffic API v7 is enabled

**"Supabase connection failed"**
- Verify STORAGE_URL and STORAGE_KEY are correct
- Check project is active in Supabase dashboard
- Ensure RLS policies are configured

**"No incidents showing"**
- Check the map is over an area with traffic
- Open browser DevTools > Network tab
- Look for API call errors
- Verify backend is running on port 8000

**Need Help?**
- Check the [README.md](./README.md) for detailed documentation
- Review [DEPLOYMENT.md](./DEPLOYMENT.md) for deployment help
- Open an issue on GitHub

---

**Happy Coding! 🚀**
