import cron from 'node-cron';
import oddsScraper from './oddsScraper';
import { Sport } from '@prisma/client';

export class CronScheduler {
  /**
   * Schedule odds updates every hour
   */
  scheduleOddsUpdates() {
    // Run every hour
    cron.schedule('0 * * * *', async () => {
      console.log('Running hourly odds update...');
      try {
        await oddsScraper.updateOdds(Sport.NFL);
        console.log('Odds update completed successfully');
      } catch (error) {
        console.error('Error updating odds:', error);
      }
    });

    console.log('Odds update scheduler started (runs every hour)');
  }

  /**
   * Schedule more frequent updates during game days
   */
  scheduleGameDayUpdates() {
    // Run every 15 minutes on Thursday, Sunday, and Monday (NFL game days)
    cron.schedule('*/15 * * * *', async () => {
      const now = new Date();
      const day = now.getDay();
      
      // 0 = Sunday, 1 = Monday, 4 = Thursday
      if (day === 0 || day === 1 || day === 4) {
        console.log('Running game day odds update...');
        try {
          await oddsScraper.updateOdds(Sport.NFL);
          console.log('Game day odds update completed');
        } catch (error) {
          console.error('Error in game day update:', error);
        }
      }
    });

    console.log('Game day update scheduler started (runs every 15 min on Thu/Sun/Mon)');
  }

  /**
   * Start all scheduled tasks
   */
  startAll() {
    this.scheduleOddsUpdates();
    this.scheduleGameDayUpdates();
    
    // Run initial update on startup
    oddsScraper.updateOdds(Sport.NFL).catch(console.error);
  }
}

export default new CronScheduler();
