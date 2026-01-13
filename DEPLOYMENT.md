# 🚀 Deployment Guide - FoodPrint Web3

## Table of Contents
1. [Quick Deployment (Easiest)](#quick-deployment-easiest)
2. [Production Deployment Options](#production-deployment-options)
3. [Pre-Deployment Checklist](#pre-deployment-checklist)
4. [Step-by-Step Deployment](#step-by-step-deployment)
5. [Post-Deployment Configuration](#post-deployment-configuration)
6. [Domain & SSL Setup](#domain--ssl-setup)
7. [Monitoring & Maintenance](#monitoring--maintenance)

---

## Quick Deployment (Easiest)

### Option 1: Render (Free Tier) ⭐ **RECOMMENDED FOR BEGINNERS**

**Cost:** Free  
**Time:** 10-15 minutes  
**Good for:** Testing, demos, small projects

#### Step-by-Step:

1. **Create a Render Account**
   - Go to https://render.com
   - Sign up with GitHub (connects automatically)

2. **Create a New Web Service**
   - Dashboard → "New +" → "Web Service"
   - Connect your GitHub repository: `foodprint-web3`
   - Render will detect it's a Node.js app

3. **Configure Settings**
   ```
   Name: foodprint-web3
   Environment: Node
   Build Command: npm install
   Start Command: npm start
   Plan: Free
   ```

4. **Add Environment Variables**
   ```
   NODE_ENV=production
   PORT=3000
   DATABASE_URL=sqlite:./foodprint.sqlite
   SESSION_SECRET=your-secret-here-change-this
   ```

5. **Deploy**
   - Click "Create Web Service"
   - Render will automatically deploy
   - You'll get a URL like: `https://foodprint-web3.onrender.com`

**⚠️ Note:** Free tier sleeps after 15 mins of inactivity. First request takes ~30 seconds to wake up.

---

### Option 2: Railway (Free Trial) 🚂

**Cost:** $5 credit free, then ~$5-10/month  
**Time:** 10 minutes  
**Good for:** Production-ready, always on

#### Step-by-Step:

1. **Create Railway Account**
   - Go to https://railway.app
   - Sign up with GitHub

2. **Create New Project**
   - Dashboard → "New Project" → "Deploy from GitHub repo"
   - Select `foodprint-web3`

3. **Add PostgreSQL Database** (Optional but recommended)
   - In your project → "New" → "Database" → "Add PostgreSQL"
   - Railway will auto-create `DATABASE_URL` variable

4. **Configure Environment**
   - Click on your service → "Variables" tab
   ```
   NODE_ENV=production
   SESSION_SECRET=your-secret-here
   ```

5. **Deploy**
   - Railway auto-deploys on push
   - Get your URL from the "Deployments" tab
   - Format: `https://foodprint-web3.up.railway.app`

---

### Option 3: Vercel (Serverless) ⚡

**Cost:** Free  
**Time:** 5 minutes  
**Good for:** Static + API, global CDN

#### Step-by-Step:

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Login**
   ```bash
   vercel login
   ```

3. **Deploy**
   ```bash
   cd /Users/karthikvangapandu/Downloads/foodprint-master
   vercel
   ```

4. **Follow Prompts**
   - Setup and deploy? Yes
   - Which scope? Your account
   - Link to existing project? No
   - Project name: foodprint-web3
   - Directory: ./
   - Override settings? No

5. **Add Environment Variables**
   ```bash
   vercel env add NODE_ENV
   vercel env add SESSION_SECRET
   ```

---

## Production Deployment Options

### Option 4: DigitalOcean App Platform 🌊

**Cost:** $5/month  
**Time:** 15 minutes  
**Good for:** Professional deployment, scalable

#### Prerequisites:
- DigitalOcean account
- Credit card (for $5/month charge)

#### Steps:

1. **Create App**
   - Go to https://cloud.digitalocean.com/apps
   - Click "Create App"
   - Choose "GitHub" as source
   - Select `foodprint-web3` repository

2. **Configure App**
   ```yaml
   Name: foodprint-web3
   Region: Choose closest to you
   Branch: main
   Build Command: npm install
   Run Command: npm start
   HTTP Port: 3000
   ```

3. **Add Database**
   - In the app page → "Create" → "Database"
   - Choose PostgreSQL
   - Plan: $7/month (Development DB)

4. **Environment Variables**
   - Go to "Settings" → "App-Level Environment Variables"
   ```
   NODE_ENV=production
   DATABASE_URL=${db.DATABASE_URL}
   SESSION_SECRET=generate-random-string
   ```

5. **Deploy**
   - Click "Deploy"
   - Get URL: `https://foodprint-web3-xxxxx.ondigitalocean.app`

---

### Option 5: AWS Elastic Beanstalk ☁️

**Cost:** ~$10-20/month  
**Time:** 30 minutes  
**Good for:** Enterprise-grade, highly scalable

#### Prerequisites:
- AWS account
- AWS CLI installed
- EB CLI installed

#### Steps:

1. **Install EB CLI**
   ```bash
   pip install awsebcli
   ```

2. **Initialize**
   ```bash
   cd /Users/karthikvangapandu/Downloads/foodprint-master
   eb init -p node.js-18 foodprint-web3
   ```

3. **Create Environment**
   ```bash
   eb create foodprint-production
   ```

4. **Set Environment Variables**
   ```bash
   eb setenv NODE_ENV=production SESSION_SECRET=your-secret
   ```

5. **Deploy**
   ```bash
   eb deploy
   ```

6. **Open App**
   ```bash
   eb open
   ```

---

### Option 6: Heroku 💜

**Cost:** $7/month (Eco Dyno)  
**Time:** 10 minutes  
**Good for:** Quick deployment, popular choice

#### Steps:

1. **Install Heroku CLI**
   ```bash
   brew tap heroku/brew && brew install heroku
   ```

2. **Login**
   ```bash
   heroku login
   ```

3. **Create App**
   ```bash
   cd /Users/karthikvangapandu/Downloads/foodprint-master
   heroku create foodprint-web3
   ```

4. **Add PostgreSQL** (Optional)
   ```bash
   heroku addons:create heroku-postgresql:mini
   ```

5. **Set Environment Variables**
   ```bash
   heroku config:set NODE_ENV=production
   heroku config:set SESSION_SECRET=your-secret-here
   ```

6. **Deploy**
   ```bash
   git push heroku main
   ```

7. **Open App**
   ```bash
   heroku open
   ```

---

## Pre-Deployment Checklist

Before deploying, ensure these are ready:

### ✅ Code Preparation

- [ ] All dependencies in `package.json`
- [ ] `npm install` runs without errors
- [ ] `npm start` works locally
- [ ] No hardcoded localhost URLs
- [ ] All secrets in environment variables (not in code)

### ✅ Database

- [ ] SQLite for development (included)
- [ ] PostgreSQL for production (recommended)
- [ ] Migrations tested
- [ ] Seed data ready (optional)

### ✅ Environment Variables

Create a `.env.production` file with:

```env
# Server
NODE_ENV=production
PORT=3000

# Database (change for production)
DATABASE_URL=postgresql://user:pass@host:5432/foodprint

# Session
SESSION_SECRET=change-this-to-random-string-min-32-chars

# Optional Services
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_SENDER_NUMBER=

DIGITALOCEAN_BUCKET_NAME=
DIGITALOCEAN_BUCKET_REGION=
DIGITALOCEAN_BUCKET_ENDPOINT=
DIGITALOCEAN_BUCKET_KEY=
DIGITALOCEAN_BUCKET_SECRET=

ACCOUNT1_MNEMONIC=
ACCOUNT2_MNEMONIC=

EMAIL_USER=
EMAIL_PASSWORD=
```

### ✅ Security

- [ ] SESSION_SECRET is strong and unique
- [ ] Database credentials are secure
- [ ] No API keys in code
- [ ] HTTPS enabled (automatic on most platforms)
- [ ] CORS configured properly

### ✅ Performance

- [ ] Database indexes added
- [ ] Static files served efficiently
- [ ] Compression enabled (gzip)
- [ ] Caching headers set

---

## Step-by-Step Deployment (Render - Recommended)

Let's do a complete walkthrough using **Render** (free and easy):

### Step 1: Prepare Your Code

```bash
cd /Users/karthikvangapandu/Downloads/foodprint-master

# Ensure package.json has start script
cat package.json | grep "start"
# Should show: "start": "node server.js"
```

### Step 2: Update Database Config for Production

Create `config/db/production.js`:

```javascript
module.exports = {
  use_env_variable: 'DATABASE_URL',
  dialect: 'postgres',
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false
    }
  },
  logging: false
};
```

### Step 3: Update `server.js` for Production

Ensure PORT is from environment:

```javascript
const PORT = process.env.PORT || 3000;
```

### Step 4: Create `render.yaml` (Optional)

```yaml
services:
  - type: web
    name: foodprint-web3
    env: node
    buildCommand: npm install
    startCommand: npm start
    envVars:
      - key: NODE_ENV
        value: production
      - key: DATABASE_URL
        value: sqlite:./foodprint.sqlite
      - key: SESSION_SECRET
        generateValue: true
```

### Step 5: Commit Changes

```bash
git add .
git commit -m "chore: Prepare for production deployment"
git push origin main
```

### Step 6: Deploy on Render

1. Go to https://dashboard.render.com
2. Click "New +" → "Web Service"
3. Connect GitHub account (if not already)
4. Select `foodprint-web3` repository
5. Configure:
   - **Name:** foodprint-web3
   - **Environment:** Node
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Plan:** Free

6. Add Environment Variables:
   - `NODE_ENV` = `production`
   - `SESSION_SECRET` = (click Generate)

7. Click "Create Web Service"

### Step 7: Wait for Deployment

- Initial deployment takes 2-5 minutes
- Watch the logs in real-time
- Look for: "Server running on port 3000"

### Step 8: Test Your Deployment

```bash
# Your app will be at:
https://foodprint-web3.onrender.com

# Test endpoints:
curl https://foodprint-web3.onrender.com
curl https://foodprint-web3.onrender.com/app/auth/login
```

---

## Post-Deployment Configuration

### 1. Test MetaMask Connection

- Navigate to your deployed URL
- Click "Login with Wallet"
- MetaMask should work (no code changes needed)

### 2. Test All Features

- [ ] Login with MetaMask
- [ ] Create harvest
- [ ] Add to blockchain (sign with MetaMask)
- [ ] Create storage entry
- [ ] Create handover
- [ ] Verify QR code

### 3. Add Custom Domain (Optional)

**On Render:**
1. Go to your service → "Settings"
2. Scroll to "Custom Domain"
3. Add your domain: `foodprint.yoursite.com`
4. Update DNS records at your domain provider

**DNS Records:**
```
Type: CNAME
Name: foodprint
Value: foodprint-web3.onrender.com
```

### 4. Enable Auto-Deploy

- In Render dashboard → "Settings"
- Enable "Auto-Deploy"
- Now every push to `main` branch auto-deploys

---

## Domain & SSL Setup

### Get a Free Domain

1. **Freenom** (Free .tk, .ml, .ga domains)
   - https://www.freenom.com

2. **Namecheap** (.com for ~$10/year)
   - https://www.namecheap.com

### SSL Certificate

✅ **Automatic on all platforms:**
- Render: Free SSL (auto-configured)
- Railway: Free SSL (auto-configured)
- Vercel: Free SSL (auto-configured)
- Heroku: Free SSL (auto-configured)

---

## Monitoring & Maintenance

### Monitor Your App

#### **1. Render Dashboard**
- Real-time logs
- Deployment history
- Performance metrics

#### **2. UptimeRobot** (Free monitoring)
```
https://uptimerobot.com
- Monitor: https://your-app.onrender.com
- Alert: Email/SMS when down
- Check interval: Every 5 minutes
```

#### **3. Sentry** (Error tracking)
```bash
npm install @sentry/node

# In server.js
const Sentry = require('@sentry/node');
Sentry.init({ dsn: 'your-sentry-dsn' });
```

### Logging

Add structured logging:

```bash
npm install winston

# Create logger.js
const winston = require('winston');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.Console()
  ]
});

module.exports = logger;
```

### Backup Database

**For SQLite (Development):**
```bash
# Download from Render
render ssh
cp foodprint.sqlite /tmp/
exit
# Download via SFTP
```

**For PostgreSQL (Production):**
```bash
# Railway: Automatic backups
# Render: Manual export via dashboard
```

---

## Deployment Comparison

| Platform | Cost | Setup Time | Auto-Deploy | Database | SSL | Best For |
|----------|------|------------|-------------|----------|-----|----------|
| **Render** | Free* | 10 min | ✅ | SQLite | ✅ | Demos, testing |
| **Railway** | $5/mo | 10 min | ✅ | PostgreSQL | ✅ | Production |
| **Vercel** | Free | 5 min | ✅ | External | ✅ | Serverless |
| **DigitalOcean** | $5/mo | 15 min | ✅ | PostgreSQL | ✅ | Professional |
| **Heroku** | $7/mo | 10 min | ✅ | PostgreSQL | ✅ | Popular choice |
| **AWS EB** | $10-20/mo | 30 min | ✅ | RDS | ✅ | Enterprise |

*Render Free: Sleeps after 15 min inactivity

---

## Troubleshooting

### Common Issues

#### 1. **App crashes on startup**
```bash
# Check logs
render logs
# or
railway logs

# Common fix: Check NODE_ENV
echo $NODE_ENV
```

#### 2. **Database connection error**
```bash
# Verify DATABASE_URL
echo $DATABASE_URL

# Test connection
psql $DATABASE_URL
```

#### 3. **MetaMask not working**
- Ensure HTTPS is enabled (should be automatic)
- Check browser console for errors
- Clear MetaMask cache

#### 4. **502 Bad Gateway**
- Check if app is running: `render logs`
- Verify PORT variable is set correctly
- Check start command

#### 5. **Build fails**
```bash
# Test locally first
npm install
npm start

# Check Node version
node --version
# Should be 16+ (specified in package.json)
```

---

## Cost Optimization

### Free Tier Limits

**Render Free:**
- ✅ 750 hours/month (enough for 1 app)
- ✅ 100GB bandwidth
- ❌ Sleeps after 15 min
- ✅ 512MB RAM

**Railway Trial:**
- ✅ $5 free credit
- ✅ Always on
- ✅ 512MB RAM
- After trial: ~$5-10/month

**Vercel Free:**
- ✅ 100GB bandwidth
- ✅ Always on
- ✅ Global CDN
- ⚠️ Serverless (cold starts)

### Recommendation

1. **For Testing/Demos**: Render (Free)
2. **For Production**: Railway ($5-10/mo) or DigitalOcean ($5/mo)
3. **For High Traffic**: AWS or DigitalOcean with scaling

---

## Next Steps After Deployment

### 1. Share Your App
```
🌐 Live URL: https://foodprint-web3.onrender.com
📱 QR Code: Generate at qr-code-generator.com
📧 Email: Share with users/testers
```

### 2. Analytics
```bash
# Add Google Analytics
# Add Mixpanel
# Track user journeys
```

### 3. SEO
```html
<!-- In views/partials/head.ejs -->
<meta name="description" content="Blockchain-based food traceability">
<meta property="og:title" content="FoodPrint Web3">
<meta property="og:image" content="your-logo-url">
```

### 4. Mobile Optimization
- Test on mobile devices
- Ensure responsive design
- Add PWA support (future)

---

## Support & Resources

- **Render Docs**: https://render.com/docs
- **Railway Docs**: https://docs.railway.app
- **Vercel Docs**: https://vercel.com/docs
- **Node.js Best Practices**: https://github.com/goldbergyoni/nodebestpractices

---

## Summary

✅ **Easiest**: Render (10 min, free)  
✅ **Best for Production**: Railway ($5-10/mo)  
✅ **Most Scalable**: AWS Elastic Beanstalk  

**Recommended Path:**
1. Deploy on Render (free) for testing
2. If satisfied, upgrade to Railway for production
3. Add custom domain
4. Enable monitoring
5. Share with users!

---

**Your FoodPrint Web3 app is ready to go live! Choose a platform and deploy in the next 10 minutes!** 🚀

---

*Last Updated: December 21, 2025*


