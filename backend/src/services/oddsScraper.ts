import axios from 'axios';
import { PrismaClient, Sport } from '@prisma/client';

const prisma = new PrismaClient();

interface OddsData {
  gameId: string;
  homeTeam: string;
  awayTeam: string;
  homeSpread: number;
  awaySpread: number;
  gameTime: Date;
  sport: Sport;
}

export class OddsScraper {
  private apiUrl: string;
  
  constructor() {
    // You can configure this to use different scraper APIs
    this.apiUrl = process.env.ODDS_API_URL || '';
  }

  /**
   * Fetch odds from external source
   * This is a template - adapt based on your chosen scraper's API
   */
  async fetchOdds(sport: Sport = Sport.NFL): Promise<OddsData[]> {
    try {
      // Option 1: Use a public API like The Odds API
      // const response = await axios.get(`https://api.the-odds-api.com/v4/sports/${sport.toLowerCase()}/odds`, {
      //   params: {
      //     apiKey: process.env.ODDS_API_KEY,
      //     regions: 'us',
      //     markets: 'spreads',
      //   }
      // });

      // Option 2: Self-hosted scraper (using the GitHub scrapers you mentioned)
      // You would deploy one of those scrapers and call its endpoint
      const response = await axios.get(`${this.apiUrl}/odds/${sport.toLowerCase()}`);
      
      return this.parseOddsData(response.data, sport);
    } catch (error) {
      console.error('Error fetching odds:', error);
      return [];
    }
  }

  /**
   * Parse odds data into standardized format
   * Adapt this based on your scraper's response format
   */
  private parseOddsData(data: any, sport: Sport): OddsData[] {
    // This is a template - adjust based on actual API response
    return data.map((game: any) => ({
      gameId: game.id,
      homeTeam: game.home_team,
      awayTeam: game.away_team,
      homeSpread: game.bookmakers?.[0]?.markets?.[0]?.outcomes?.[0]?.point || 0,
      awaySpread: game.bookmakers?.[0]?.markets?.[0]?.outcomes?.[1]?.point || 0,
      gameTime: new Date(game.commence_time),
      sport: sport,
    }));
  }

  /**
   * Update database with fresh odds
   */
  async updateOdds(sport: Sport = Sport.NFL): Promise<void> {
    const oddsData = await this.fetchOdds(sport);
    
    for (const odds of oddsData) {
      try {
        // Check if game exists
        const existingGame = await prisma.game.findUnique({
          where: { externalId: odds.gameId }
        });

        if (existingGame) {
          // Update existing game odds
          await prisma.game.update({
            where: { externalId: odds.gameId },
            data: {
              homeSpread: odds.homeSpread,
              awaySpread: odds.awaySpread,
            }
          });
          console.log(`Updated odds for game: ${odds.homeTeam} vs ${odds.awayTeam}`);
        } else {
          // Create new game if it doesn't exist
          // Note: You'll need to associate it with a week
          const currentWeek = await this.getCurrentWeek(sport);
          
          if (currentWeek) {
            await prisma.game.create({
              data: {
                externalId: odds.gameId,
                weekId: currentWeek.id,
                homeTeam: odds.homeTeam,
                awayTeam: odds.awayTeam,
                homeSpread: odds.homeSpread,
                awaySpread: odds.awaySpread,
                gameTime: odds.gameTime,
                sport: odds.sport,
                isPrimeTime: this.isPrimeTime(odds.gameTime),
              }
            });
            console.log(`Created new game: ${odds.homeTeam} vs ${odds.awayTeam}`);
          }
        }
      } catch (error) {
        console.error(`Error updating game ${odds.gameId}:`, error);
      }
    }
  }

  /**
   * Determine if a game is prime time
   */
  private isPrimeTime(gameTime: Date): boolean {
    const hour = gameTime.getHours();
    const day = gameTime.getDay();
    
    // Thursday Night Football
    if (day === 4 && hour >= 20) return true;
    
    // Sunday Night Football
    if (day === 0 && hour >= 20) return true;
    
    // Monday Night Football
    if (day === 1 && hour >= 20) return true;
    
    return false;
  }

  /**
   * Get current week for a sport
   */
  private async getCurrentWeek(sport: Sport) {
    const now = new Date();
    
    return await prisma.week.findFirst({
      where: {
        startDate: { lte: now },
        endDate: { gte: now },
        league: { sport }
      }
    });
  }

  /**
   * Update game results and calculate pick outcomes
   */
  async updateGameResults(gameId: string, homeScore: number, awayScore: number): Promise<void> {
    const game = await prisma.game.findUnique({
      where: { id: gameId },
      include: { picks: true }
    });

    if (!game) {
      throw new Error('Game not found');
    }

    // Update game with final score
    await prisma.game.update({
      where: { id: gameId },
      data: {
        homeScore,
        awayScore,
        isFinished: true,
      }
    });

    // Calculate results for all picks
    for (const pick of game.picks) {
      const result = this.calculatePickResult(
        pick.pickedTeam,
        game.homeTeam,
        game.awayTeam,
        homeScore,
        awayScore,
        pick.spread
      );

      const points = this.getPointsForResult(result);

      await prisma.pick.update({
        where: { id: pick.id },
        data: { result, points }
      });

      // Update user's league points
      await this.updateUserPoints(pick.userId, points);
    }
  }

  private calculatePickResult(
    pickedTeam: string,
    homeTeam: string,
    awayTeam: string,
    homeScore: number,
    awayScore: number,
    spread: number
  ): 'WIN' | 'LOSS' | 'PUSH' {
    const isHomeTeam = pickedTeam === homeTeam;
    const scoreDiff = isHomeTeam ? homeScore - awayScore : awayScore - homeScore;
    const adjustedDiff = scoreDiff + spread;

    if (adjustedDiff === 0) return 'PUSH';
    return adjustedDiff > 0 ? 'WIN' : 'LOSS';
  }

  private getPointsForResult(result: string): number {
    // Default scoring - can be customized per league
    switch (result) {
      case 'WIN': return 1;
      case 'LOSS': return -1;
      case 'PUSH': return 0;
      default: return 0;
    }
  }

  private async updateUserPoints(userId: string, points: number): Promise<void> {
    const memberships = await prisma.leagueMembership.findMany({
      where: { userId }
    });

    for (const membership of memberships) {
      await prisma.leagueMembership.update({
        where: { id: membership.id },
        data: { points: { increment: points } }
      });
    }
  }
}

export default new OddsScraper();
