import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { PrismaClient, Sport, PickFormat } from '@prisma/client';
import { 
  authenticateToken, 
  AuthRequest, 
  hashPassword, 
  comparePasswords, 
  generateToken,
  generateInviteCode 
} from './middleware/auth';
import cronScheduler from './services/cronScheduler';
import oddsScraper from './services/oddsScraper';

dotenv.config();

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 3000;

// FIXED: Enable CORS for all origins
app.use(cors({
  origin: '*',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// ============================================
// AUTH ROUTES
// ============================================

app.post('/api/auth/register', async (req: Request, res: Response) => {
  try {
    const { email, username, password } = req.body;
    
    const existingUser = await prisma.user.findFirst({
      where: { OR: [{ email }, { username }] }
    });

    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    const hashedPassword = await hashPassword(password);
    const user = await prisma.user.create({
      data: { email, username, password: hashedPassword }
    });

    const token = generateToken(user.id);
    res.json({ token, user: { id: user.id, email, username } });
  } catch (error) {
    res.status(500).json({ error: 'Registration failed' });
  }
});

app.post('/api/auth/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const validPassword = await comparePasswords(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = generateToken(user.id);
    res.json({ 
      token, 
      user: { id: user.id, email: user.email, username: user.username } 
    });
  } catch (error) {
    res.status(500).json({ error: 'Login failed' });
  }
});

// ============================================
// LEAGUE ROUTES
// ============================================

app.post('/api/leagues', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { name, sport, pickFormat, numGamesPerWeek, pickPrimeTimeOnly, pickAllGames } = req.body;
    
    const inviteCode = generateInviteCode();
    
    const league = await prisma.league.create({
      data: {
        name,
        inviteCode,
        sport: sport || Sport.NFL,
        pickFormat: pickFormat || PickFormat.FIVE_GAMES,
        createdById: req.userId!,
        settings: {
          create: {
            numGamesPerWeek: numGamesPerWeek || 5,
            pickPrimeTimeOnly: pickPrimeTimeOnly || false,
            pickAllGames: pickAllGames || false,
          }
        },
        memberships: {
          create: {
            userId: req.userId!,
            role: 'ADMIN'
          }
        }
      },
      include: { settings: true }
    });

    res.json(league);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create league' });
  }
});

app.post('/api/leagues/join', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { inviteCode } = req.body;
    
    const league = await prisma.league.findUnique({
      where: { inviteCode }
    });

    if (!league) {
      return res.status(404).json({ error: 'Invalid invite code' });
    }

    const existingMembership = await prisma.leagueMembership.findUnique({
      where: {
        userId_leagueId: {
          userId: req.userId!,
          leagueId: league.id
        }
      }
    });

    if (existingMembership) {
      return res.status(400).json({ error: 'Already a member of this league' });
    }

    const membership = await prisma.leagueMembership.create({
      data: {
        userId: req.userId!,
        leagueId: league.id,
        role: 'MEMBER'
      },
      include: { league: true }
    });

    res.json(membership);
  } catch (error) {
    res.status(500).json({ error: 'Failed to join league' });
  }
});

app.get('/api/leagues', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const memberships = await prisma.leagueMembership.findMany({
      where: { userId: req.userId! },
      include: { 
        league: { 
          include: { 
            settings: true,
            _count: { select: { memberships: true } }
          } 
        } 
      }
    });

    res.json(memberships);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch leagues' });
  }
});

app.get('/api/leagues/:leagueId', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { leagueId } = req.params;
    
    const membership = await prisma.leagueMembership.findUnique({
      where: {
        userId_leagueId: {
          userId: req.userId!,
          leagueId
        }
      }
    });

    if (!membership) {
      return res.status(403).json({ error: 'Not a member of this league' });
    }

    const league = await prisma.league.findUnique({
      where: { id: leagueId },
      include: { 
        settings: true,
        memberships: {
          include: { user: { select: { id: true, username: true, email: true } } },
          orderBy: { points: 'desc' }
        }
      }
    });

    res.json(league);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch league' });
  }
});

// ============================================
// WEEK ROUTES
// ============================================

app.post('/api/weeks', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { leagueId, weekNum, season, startDate, endDate } = req.body;
    
    const membership = await prisma.leagueMembership.findUnique({
      where: {
        userId_leagueId: {
          userId: req.userId!,
          leagueId
        }
      }
    });

    if (!membership || membership.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Only league admins can create weeks' });
    }

    const week = await prisma.week.create({
      data: {
        leagueId,
        weekNum,
        season,
        startDate: new Date(startDate),
        endDate: new Date(endDate)
      }
    });

    res.json(week);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create week' });
  }
});

app.get('/api/leagues/:leagueId/weeks', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { leagueId } = req.params;
    
    const weeks = await prisma.week.findMany({
      where: { leagueId },
      include: {
        games: {
          include: {
            picks: {
              where: { userId: req.userId! }
            }
          }
        }
      },
      orderBy: { weekNum: 'asc' }
    });

    res.json(weeks);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch weeks' });
  }
});

app.get('/api/weeks/:weekId/games', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { weekId } = req.params;
    
    const games = await prisma.game.findMany({
      where: { weekId },
      include: {
        picks: {
          where: { userId: req.userId! }
        }
      },
      orderBy: { gameTime: 'asc' }
    });

    res.json(games);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch games' });
  }
});

// ============================================
// PICK ROUTES
// ============================================

app.post('/api/picks', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { gameId, pickedTeam, spread } = req.body;
    
    const game = await prisma.game.findUnique({ where: { id: gameId } });
    if (!game) {
      return res.status(404).json({ error: 'Game not found' });
    }

    if (new Date() >= game.gameTime) {
      return res.status(400).json({ error: 'Cannot pick after game has started' });
    }

    const pick = await prisma.pick.upsert({
      where: {
        userId_gameId: {
          userId: req.userId!,
          gameId
        }
      },
      update: { pickedTeam, spread },
      create: {
        userId: req.userId!,
        gameId,
        pickedTeam,
        spread
      }
    });

    res.json(pick);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create pick' });
  }
});

app.get('/api/picks/user', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const picks = await prisma.pick.findMany({
      where: { userId: req.userId! },
      include: { 
        game: {
          include: {
            week: true
          }
        } 
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(picks);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch picks' });
  }
});

// ============================================
// ADMIN ROUTES
// ============================================

app.post('/api/admin/odds/update', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { sport } = req.body;
    await oddsScraper.updateOdds(sport || Sport.NFL);
    res.json({ message: 'Odds updated successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update odds' });
  }
});

app.post('/api/admin/games/:gameId/results', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { gameId } = req.params;
    const { homeScore, awayScore } = req.body;
    
    await oddsScraper.updateGameResults(gameId, homeScore, awayScore);
    res.json({ message: 'Game results updated successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update game results' });
  }
});

// ============================================
// LEADERBOARD ROUTES
// ============================================

app.get('/api/leagues/:leagueId/leaderboard', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { leagueId } = req.params;
    
    const leaderboard = await prisma.leagueMembership.findMany({
      where: { leagueId },
      include: { 
        user: { 
          select: { username: true, id: true } 
        } 
      },
      orderBy: { points: 'desc' }
    });

    res.json(leaderboard);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch leaderboard' });
  }
});

// ============================================
// START SERVER
// ============================================

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  
  // Start cron jobs
  if (process.env.NODE_ENV !== 'test') {
    cronScheduler.startAll();
  }
});

export default app;