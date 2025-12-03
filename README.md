# NFL Spread Betting Platform

A full-stack application for creating private leagues where users can make spread picks on NFL games (expandable to AFL/NRL).

## Features

- ✅ User authentication (register/login)
- ✅ Create private leagues with invite codes
- ✅ Customizable pick formats (5 games, all games, primetime only)
- ✅ Automatic odds scraping and updates (hourly)
- ✅ Live leaderboards
- ✅ Pick tracking and scoring
- ✅ Multi-sport support (NFL, AFL, NRL)

## Tech Stack

**Backend:**
- Node.js + Express + TypeScript
- PostgreSQL (Prisma ORM)
- JWT Authentication
- Node-cron for scheduled tasks

**Frontend:**
- React + TypeScript
- Tailwind CSS
- React Query

**Deployment:**
- Railway (Backend + Database)
- GitHub (Version Control)

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL 14+
- npm or yarn

### Backend Setup

1. **Clone the repository:**
```bash
git clone <your-repo-url>
cd nfl-spread-betting/backend
```

2. **Install dependencies:**
```bash
npm install
```

3. **Set up environment variables:**
```bash
cp .env.example .env
# Edit .env with your database credentials and API keys
```

4. **Set up the database:**
```bash
npm run prisma:generate
npm run prisma:migrate
```

5. **Run the development server:**
```bash
npm run dev
```

The backend will be running at `http://localhost:3000`

## Odds Scraping Options

You have several options for getting odds data:

### Option 1: The Odds API (Recommended for getting started)
- Sign up at https://the-odds-api.com/
- Get a free API key (500 requests/month)
- Add to `.env`: `ODDS_API_KEY=your-key-here`

### Option 2: Self-Hosted Scraper
Use one of these open-source scrapers:

**OddsHarvester (Recommended):**
```bash
git clone https://github.com/jordantete/OddsHarvester
# Follow their setup instructions
# Deploy to Railway or another service
# Point your ODDS_API_URL to your deployed scraper
```

**Sportsbook Odds Scraper:**
```bash
git clone https://github.com/declanwalpole/sportsbook-odds-scraper
# Follow their setup instructions
```

### Option 3: Build Your Own
The `oddsScraper.ts` service provides a template for integrating any odds source.

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Leagues
- `POST /api/leagues` - Create new league
- `POST /api/leagues/join` - Join league with invite code
- `GET /api/leagues` - Get user's leagues
- `GET /api/leagues/:leagueId` - Get league details
- `GET /api/leagues/:leagueId/leaderboard` - Get league leaderboard

### Weeks & Games
- `POST /api/weeks` - Create week (admin only)
- `GET /api/leagues/:leagueId/weeks` - Get all weeks for league
- `GET /api/weeks/:weekId/games` - Get games for week

### Picks
- `POST /api/picks` - Make or update a pick
- `GET /api/picks/user` - Get user's picks

### Admin
- `POST /api/admin/odds/update` - Manually trigger odds update
- `POST /api/admin/games/:gameId/results` - Update game results

## Database Schema

### Core Models:
- **User** - Authentication and user data
- **League** - Private leagues with customizable settings
- **LeagueSettings** - Pick format, scoring rules, etc.
- **LeagueMembership** - User-League relationship with points
- **Week** - Weekly periods for picks
- **Game** - NFL games with spreads
- **Pick** - User picks on games

## Deployment to Railway

### Step 1: Set up Railway Project

1. Install Railway CLI:
```bash
npm install -g @railway/cli
```

2. Login to Railway:
```bash
railway login
```

3. Initialize project:
```bash
railway init
```

### Step 2: Add PostgreSQL Database

```bash
railway add --database postgresql
```

Railway will automatically create a `DATABASE_URL` environment variable.

### Step 3: Set Environment Variables

In Railway dashboard, add these environment variables:
- `JWT_SECRET`
- `ODDS_API_KEY` (if using The Odds API)
- `NODE_ENV=production`

### Step 4: Deploy

```bash
railway up
```

Railway will:
1. Build your application
2. Run Prisma migrations
3. Start your server

### Step 5: Get Your URL

```bash
railway domain
```

## GitHub Setup

1. **Create a new repository on GitHub**

2. **Push your code:**
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin <your-github-repo-url>
git push -u origin main
```

3. **Connect to Railway:**
- Go to Railway dashboard
- Click "Deploy from GitHub repo"
- Select your repository
- Railway will automatically deploy on every push to main

## Automatic Deployments

Once connected to GitHub, Railway will:
- ✅ Deploy on every push to main
- ✅ Run tests (if configured)
- ✅ Apply database migrations
- ✅ Rollback on failure

## Cron Jobs

The application automatically runs these scheduled tasks:

- **Hourly Odds Update**: Updates all game odds every hour
- **Game Day Updates**: Updates every 15 minutes on Thu/Sun/Mon (NFL game days)

## Customization

### Pick Formats

Modify in `LeagueSettings`:
- `numGamesPerWeek`: Number of games users must pick
- `pickPrimeTimeOnly`: Only allow primetime games
- `pickAllGames`: Allow all games

### Scoring

Default scoring (customizable per league):
- Win: +1 point
- Loss: -1 point
- Push: 0 points

### Adding Sports

1. Add sport to enum in `schema.prisma`:
```prisma
enum Sport {
  NFL
  AFL
  NRL
  NBA  // Add new sport
}
```

2. Update odds scraper to handle new sport

3. Add sport-specific logic (seasons, weeks, etc.)

## Monitoring

### Logs
```bash
railway logs
```

### Database
```bash
railway run npx prisma studio
```

## Testing

```bash
npm test
```

## Troubleshooting

### Database Connection Issues
- Verify `DATABASE_URL` in Railway dashboard
- Check if database is running: `railway run npx prisma db push`

### Odds Not Updating
- Check cron logs in Railway
- Verify API key is correct
- Test manually: `POST /api/admin/odds/update`

### Deployment Fails
- Check build logs in Railway
- Ensure all dependencies are in `package.json`
- Verify environment variables are set

## Future Enhancements

- [ ] Email notifications for pick deadlines
- [ ] Live game scores integration
- [ ] Mobile app
- [ ] Survivor pools
- [ ] Confidence points
- [ ] Weekly prizes
- [ ] Social features (comments, chat)
- [ ] Advanced statistics

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

MIT

## Support

For issues and questions:
- Open an issue on GitHub
- Check Railway docs: https://docs.railway.app
- Prisma docs: https://www.prisma.io/docs
