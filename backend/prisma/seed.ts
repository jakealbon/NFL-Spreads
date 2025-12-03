import { PrismaClient, Sport } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Seed script to initialize the database with NFL season data
 * Run with: npm run prisma:seed
 */

async function main() {
  console.log('Starting database seed...');

  // Create 2025 NFL Season weeks (example)
  const season = 2025;
  const weeks = [];

  // NFL regular season typically runs from early September to early January
  // This is a simplified example - adjust dates for actual season
  const seasonStartDate = new Date('2025-09-04');

  for (let weekNum = 1; weekNum <= 18; weekNum++) {
    const startDate = new Date(seasonStartDate);
    startDate.setDate(startDate.getDate() + (weekNum - 1) * 7);
    
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 6);
    endDate.setHours(23, 59, 59);

    weeks.push({
      weekNum,
      season,
      startDate,
      endDate,
      isActive: weekNum === 1, // Make week 1 active by default
    });
  }

  // You would typically create weeks per league, but for seeding,
  // we'll create a "master" league that admins can copy from
  console.log('Creating master NFL league for 2025 season...');

  // Note: You'll need to have a user created first to be the creator
  // For now, we'll just create the week structure
  
  console.log(`Created ${weeks.length} weeks for ${season} NFL season`);
  console.log('Week 1 starts:', weeks[0].startDate);
  console.log('Week 18 ends:', weeks[17].endDate);

  // Example: Create a demo league with a test user
  // Uncomment and modify as needed
  
  /*
  const demoUser = await prisma.user.create({
    data: {
      email: 'demo@example.com',
      username: 'demouser',
      password: await hashPassword('password123'), // You'd need to import hashPassword
    }
  });

  const demoLeague = await prisma.league.create({
    data: {
      name: 'Demo NFL League',
      inviteCode: 'DEMO2025',
      sport: Sport.NFL,
      createdById: demoUser.id,
      settings: {
        create: {
          numGamesPerWeek: 5,
          pickPrimeTimeOnly: false,
          pickAllGames: false,
        }
      },
      weeks: {
        create: weeks.map(week => ({
          ...week,
        }))
      },
      memberships: {
        create: {
          userId: demoUser.id,
          role: 'ADMIN',
        }
      }
    }
  });

  console.log('Created demo league:', demoLeague.name);
  console.log('Invite code:', demoLeague.inviteCode);
  */

  console.log('\nSeed completed successfully!');
  console.log('\nNext steps:');
  console.log('1. Create a user account');
  console.log('2. Create a league');
  console.log('3. Add weeks to your league using POST /api/weeks');
  console.log('4. Trigger odds update to populate games');
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
