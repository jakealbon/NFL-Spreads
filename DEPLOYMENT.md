# Deployment Guide - Railway + GitHub

## Prerequisites

1. GitHub account
2. Railway account (sign up at https://railway.app)
3. Git installed locally

## Step-by-Step Deployment

### Part 1: GitHub Setup

1. **Create a new GitHub repository:**
   ```bash
   # Go to github.com and create a new repository
   # Name it: nfl-spread-betting (or your preferred name)
   ```

2. **Push your code to GitHub:**
   ```bash
   cd nfl-spread-betting
   git init
   git add .
   git commit -m "Initial commit: NFL spread betting platform"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/nfl-spread-betting.git
   git push -u origin main
   ```

### Part 2: Railway Backend Deployment

1. **Login to Railway:**
   - Go to https://railway.app
   - Click "Login with GitHub"
   - Authorize Railway to access your repositories

2. **Create New Project:**
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose your `nfl-spread-betting` repository
   - Railway will detect it's a Node.js project

3. **Add PostgreSQL Database:**
   - In your project dashboard, click "New"
   - Select "Database"
   - Choose "PostgreSQL"
   - Railway automatically creates a `DATABASE_URL` variable

4. **Configure Backend Service:**
   - Click on your backend service
   - Go to "Settings" tab
   - Set **Root Directory**: `backend`
   - Set **Build Command**: `npm run prisma:generate && npm run build`
   - Set **Start Command**: `npm run prisma:push && npm start`

5. **Add Environment Variables:**
   - Go to "Variables" tab
   - Add these variables:
     ```
     NODE_ENV=production
     JWT_SECRET=your-super-secret-jwt-key-make-this-long-and-random
     ODDS_API_KEY=your-odds-api-key (if using The Odds API)
     PORT=3000
     ```
   - `DATABASE_URL` should already be set automatically

6. **Generate Domain:**
   - Go to "Settings" tab
   - Under "Networking", click "Generate Domain"
   - Save this URL - you'll need it for the frontend

7. **Deploy:**
   - Railway automatically deploys on every push to main
   - Watch the deployment logs in the "Deployments" tab
   - Wait for "Success" status

### Part 3: Frontend Deployment (Optional - Railway or Vercel)

#### Option A: Deploy Frontend on Railway

1. **Add Frontend Service:**
   - In your Railway project, click "New"
   - Select "GitHub Repo"
   - Choose same repository
   - Railway will create a new service

2. **Configure Frontend Service:**
   - Set **Root Directory**: `frontend`
   - Set **Build Command**: `npm run build`
   - Set **Start Command**: `npm run preview`

3. **Add Environment Variables:**
   ```
   VITE_API_URL=https://your-backend-domain.railway.app/api
   ```

4. **Generate Domain** for frontend service

#### Option B: Deploy Frontend on Vercel (Recommended)

1. **Install Vercel CLI:**
   ```bash
   npm install -g vercel
   ```

2. **Deploy:**
   ```bash
   cd frontend
   vercel
   ```

3. **Set Environment Variables in Vercel:**
   - Go to Vercel dashboard
   - Select your project
   - Go to Settings → Environment Variables
   - Add: `VITE_API_URL=https://your-backend-domain.railway.app/api`

### Part 4: Set Up Odds Scraping

#### Option 1: Use The Odds API

1. Sign up at https://the-odds-api.com/
2. Get your API key
3. Add to Railway environment variables:
   ```
   ODDS_API_KEY=your-key-here
   ODDS_API_URL=https://api.the-odds-api.com/v4
   ```

#### Option 2: Deploy Your Own Scraper

1. **Fork/Clone a scraper repo:**
   ```bash
   git clone https://github.com/jordantete/OddsHarvester
   cd OddsHarvester
   ```

2. **Deploy scraper to Railway:**
   - Create new Railway project
   - Deploy from GitHub
   - Generate domain

3. **Update backend environment:**
   ```
   ODDS_API_URL=https://your-scraper-domain.railway.app/api
   ```

### Part 5: Verify Deployment

1. **Check Backend Health:**
   ```bash
   curl https://your-backend-domain.railway.app/api/health
   ```

2. **Check Database:**
   - In Railway, click on PostgreSQL service
   - Click "Query"
   - Run: `SELECT * FROM "User";`

3. **Test API:**
   ```bash
   # Register a user
   curl -X POST https://your-backend-domain.railway.app/api/auth/register \
     -H "Content-Type: application/json" \
     -d '{"email":"test@test.com","username":"testuser","password":"password123"}'
   ```

4. **Check Cron Jobs:**
   - Watch Railway logs
   - You should see "Running hourly odds update..." messages

### Part 6: Continuous Deployment

Now that everything is connected:

1. **Make changes locally:**
   ```bash
   git add .
   git commit -m "Your changes"
   git push
   ```

2. **Railway automatically:**
   - Detects the push
   - Builds the application
   - Runs migrations
   - Deploys the new version
   - Keeps old version running until new one is ready (zero-downtime)

### Part 7: Monitoring

#### View Logs:
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# View logs
railway logs
```

#### Database Management:
```bash
# Open Prisma Studio
railway run npx prisma studio
```

#### Metrics:
- Go to Railway dashboard
- Click on your service
- View CPU, Memory, Network usage

### Troubleshooting

#### Build Fails:
1. Check Railway logs
2. Verify all dependencies are in `package.json`
3. Ensure environment variables are set
4. Check `railway.json` configuration

#### Database Connection Issues:
```bash
# Test connection
railway run npx prisma db push
```

#### Cron Jobs Not Running:
1. Check environment: `NODE_ENV` should be `production`
2. View logs for errors
3. Manually trigger: `POST /api/admin/odds/update`

#### Frontend Can't Connect to Backend:
1. Verify `VITE_API_URL` is correct
2. Check CORS settings in backend
3. Ensure backend domain is accessible

### Costs

**Railway Free Tier:**
- $5 free credit per month
- Should cover small leagues
- Upgrade to $5/month for more resources

**The Odds API:**
- Free tier: 500 requests/month
- Should be sufficient for NFL season

### Security Checklist

- [ ] Change `JWT_SECRET` to a strong random value
- [ ] Never commit `.env` files
- [ ] Use environment variables for all secrets
- [ ] Enable Railway's automatic HTTPS
- [ ] Set up database backups
- [ ] Review Railway's security settings

### Scaling

When your app grows:

1. **Upgrade Railway Plan:**
   - More CPU/RAM
   - Better database performance

2. **Add Redis:**
   - Cache odds data
   - Reduce database queries

3. **Add CDN:**
   - Cloudflare for static assets
   - Faster global access

4. **Multiple Regions:**
   - Deploy to multiple Railway regions
   - Lower latency worldwide

### Backup Strategy

1. **Database Backups:**
   - Railway automatically backs up PostgreSQL
   - Download manual backups: Settings → Backup

2. **Code Backups:**
   - Already on GitHub
   - Create releases for stable versions

3. **Environment Variables:**
   - Keep secure backup of all env vars
   - Document what each variable does

---

## Quick Reference Commands

```bash
# Railway CLI
railway login
railway link                 # Link to existing project
railway up                   # Deploy current directory
railway logs                 # View logs
railway run [command]        # Run command in Railway environment
railway open                 # Open project in browser

# Database
railway run npx prisma studio           # Open Prisma Studio
railway run npx prisma db push          # Push schema changes
railway run npx prisma migrate deploy   # Deploy migrations

# Git
git add .
git commit -m "message"
git push                     # Auto-deploys to Railway
```

## Support

- Railway Docs: https://docs.railway.app
- Railway Discord: https://discord.gg/railway
- Railway Status: https://status.railway.app
