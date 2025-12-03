# Quick Start Guide

Get your NFL spread betting site running in 15 minutes!

## 1. Prerequisites

Install these if you haven't already:
- [Node.js](https://nodejs.org/) (v18 or higher)
- [PostgreSQL](https://www.postgresql.org/) (v14 or higher)
- [Git](https://git-scm.com/)

## 2. Local Setup (5 minutes)

```bash
# Clone the project
cd nfl-spread-betting

# Backend setup
cd backend
npm install

# Create .env file
cp .env.example .env

# Edit .env with your database credentials
# DATABASE_URL="postgresql://username:password@localhost:5432/nfl_betting"
# JWT_SECRET="your-secret-key-here"

# Set up database
npm run prisma:generate
npm run prisma:migrate

# Start backend
npm run dev
# Backend running at http://localhost:3000

# In a new terminal - Frontend setup
cd ../frontend
npm install

# Create .env file
echo "VITE_API_URL=http://localhost:3000/api" > .env

# Start frontend
npm run dev
# Frontend running at http://localhost:5173
```

## 3. Test It Out (2 minutes)

1. Open http://localhost:5173
2. Register a new account
3. Create a league
4. Copy the invite code
5. (Optional) Register another account and join with the code

## 4. Add Odds Data (3 minutes)

### Option A: Use The Odds API (Easiest)

1. Sign up at https://the-odds-api.com/ (free tier: 500 requests/month)
2. Get your API key
3. Add to backend/.env:
   ```
   ODDS_API_KEY=your-key-here
   ```
4. Restart backend
5. Trigger odds update:
   ```bash
   curl -X POST http://localhost:3000/api/admin/odds/update \
     -H "Authorization: Bearer YOUR_TOKEN"
   ```

### Option B: Mock Data (For testing)

Create a simple script to add test games:

```bash
cd backend
# Create test data script
npm run prisma:studio
# Manually add test games through Prisma Studio
```

## 5. Deploy to Railway (5 minutes)

See [DEPLOYMENT.md](./DEPLOYMENT.md) for full instructions.

Quick version:
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login and create project
railway login
railway init

# Add PostgreSQL
railway add --database postgresql

# Set environment variables
railway variables set JWT_SECRET=your-secret-key
railway variables set NODE_ENV=production

# Deploy
railway up
```

## Common Issues

### Database Connection Error
```bash
# Make sure PostgreSQL is running
pg_isready

# Check your DATABASE_URL in .env
# Should look like: postgresql://user:password@localhost:5432/dbname
```

### Port Already in Use
```bash
# Change PORT in backend/.env
PORT=3001

# Or kill the process using port 3000
lsof -ti:3000 | xargs kill -9
```

### Prisma Client Not Generated
```bash
cd backend
npm run prisma:generate
```

### Frontend Can't Connect to Backend
```bash
# Check VITE_API_URL in frontend/.env
# Should be: http://localhost:3000/api
```

## Next Steps

1. **Set up weekly schedules:**
   - Use the admin API to create weeks
   - Add games for each week

2. **Customize your league:**
   - Change pick format (5 games, all games, primetime)
   - Adjust scoring rules
   - Set up different sports

3. **Invite users:**
   - Share invite codes
   - Build your league

4. **Monitor:**
   - Check logs for errors
   - Verify cron jobs are running
   - Watch for odds updates

## Development Tips

### Useful Commands

```bash
# Backend
npm run dev          # Start dev server with hot reload
npm run build        # Build for production
npm run prisma:studio # Open database GUI

# Frontend  
npm run dev          # Start dev server
npm run build        # Build for production
npm run preview      # Preview production build

# Database
npx prisma migrate dev      # Create new migration
npx prisma db push          # Push schema without migration
npx prisma db seed          # Seed database (if configured)
```

### Project Structure

```
nfl-spread-betting/
├── backend/
│   ├── prisma/
│   │   └── schema.prisma      # Database schema
│   ├── src/
│   │   ├── index.ts           # Main server file
│   │   ├── middleware/
│   │   │   └── auth.ts        # Auth middleware
│   │   └── services/
│   │       ├── oddsScraper.ts # Odds scraping logic
│   │       └── cronScheduler.ts # Cron jobs
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   │   └── client.ts      # API client
│   │   ├── store/
│   │   │   └── authStore.ts   # State management
│   │   └── components/        # React components
│   └── package.json
└── README.md
```

## Need Help?

1. Check the [full README](./README.md)
2. Read [deployment guide](./DEPLOYMENT.md)
3. Review API endpoints in backend/src/index.ts
4. Check database schema in backend/prisma/schema.prisma

## Ready for Production?

Before going live:
- [ ] Change JWT_SECRET to a strong random value
- [ ] Set up proper odds API (not mock data)
- [ ] Configure CORS for your frontend domain
- [ ] Set up database backups
- [ ] Add error monitoring (e.g., Sentry)
- [ ] Set up analytics
- [ ] Test all features thoroughly
- [ ] Write documentation for users
