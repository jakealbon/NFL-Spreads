# 👥 User Flow & Features Guide

## User Journey

### 1. New User Registration Flow

```
User visits site
    ↓
Clicks "Register"
    ↓
Enters: email, username, password
    ↓
POST /api/auth/register
    ↓
Receives JWT token
    ↓
Redirected to Dashboard
```

### 2. Creating a League Flow

```
User clicks "Create League"
    ↓
Fills out form:
    - League name
    - Sport (NFL/AFL/NRL)
    - Pick format (5 games/all/primetime)
    - Games per week (if custom)
    ↓
POST /api/leagues
    ↓
System generates unique invite code
    ↓
League created with user as ADMIN
    ↓
User sees league dashboard with invite code
```

### 3. Joining a League Flow

```
User receives invite code from friend
    ↓
Clicks "Join League"
    ↓
Enters invite code (e.g., "ABC12345")
    ↓
POST /api/leagues/join
    ↓
System validates code
    ↓
User added as MEMBER
    ↓
User sees league dashboard
```

### 4. Making Picks Flow

```
User navigates to current week
    ↓
System shows available games:
    - Home vs Away team
    - Current spread
    - Game time
    - Lock status
    ↓
User selects team to pick
    ↓
User sees locked-in spread
    ↓
POST /api/picks
    ↓
Pick saved with current spread
    ↓
Pick locked at game time
```

### 5. Scoring & Results Flow

```
Game finishes
    ↓
Admin/System updates final score
    ↓
POST /api/admin/games/:id/results
    ↓
System calculates each pick:
    - Did picked team cover spread?
    - WIN: +1 point
    - LOSS: -1 point
    - PUSH: 0 points
    ↓
User points updated
    ↓
Leaderboard refreshed
```

## Feature Breakdown

### 🔐 Authentication Features

**Register:**
- Email validation
- Unique username check
- Password hashing (bcrypt)
- JWT token generation

**Login:**
- Email/password validation
- Token generation
- 7-day expiration

**Security:**
- Password hashing
- JWT verification
- Protected routes
- Token refresh (can be added)

### 🏆 League Features

**Creation:**
- Custom league names
- Unique invite codes (8 characters)
- Sport selection (NFL/AFL/NRL)
- Pick format configuration
- Creator becomes admin

**Settings:**
```javascript
{
  numGamesPerWeek: 5,          // Required picks
  pickPrimeTimeOnly: false,    // Limit to primetime
  pickAllGames: false,         // Must pick all games
  pointsPerWin: 1,            // Win scoring
  pointsPerLoss: -1,          // Loss scoring
  pointsPerPush: 0            // Push scoring
}
```

**Membership:**
- Admin role (creator)
- Member role (joiners)
- Points tracking per member
- Join via invite code only

**Leaderboard:**
- Real-time standings
- Total points
- Username display
- Sortable by points

### 🎯 Pick Features

**Making Picks:**
- Select any team
- Spread locked at pick time
- One pick per game
- Can update before game starts
- Automatically locked at game time

**Pick Types:**
```
FIVE_GAMES:
  - Pick exactly 5 games per week
  - Most common format

ALL_GAMES:
  - Pick every game in the week
  - Higher volume

PRIMETIME_ONLY:
  - Only Thu/Sun/Mon night games
  - Fewer picks, bigger games

CUSTOM:
  - Administrator-defined rules
```

**Pick Validation:**
- Can't pick after game starts
- Must pick required number of games
- One pick per game maximum
- Spread recorded at time of pick

**Pick Display:**
- User's picks
- Current spread
- Game time
- Lock status
- Result (when finished)
- Points earned/lost

### 📊 Game Features

**Game Data:**
```javascript
{
  homeTeam: "Kansas City Chiefs",
  awayTeam: "Buffalo Bills",
  homeSpread: -2.5,           // Chiefs favored by 2.5
  awaySpread: +2.5,           // Bills underdogs by 2.5
  gameTime: "2025-01-15T18:00:00Z",
  isPrimeTime: true,
  isFinished: false,
  homeScore: null,            // Set when game ends
  awayScore: null
}
```

**Odds Updates:**
- Automatic hourly updates
- Game-day rapid updates (15 min)
- Historical spread tracking
- Line movement tracking (can be added)

**Prime Time Detection:**
- Thursday Night Football (8PM+)
- Sunday Night Football (8PM+)
- Monday Night Football (8PM+)

### 📅 Week Management

**Week Structure:**
```javascript
{
  weekNum: 1,                  // Week 1-18 (NFL regular)
  season: 2025,               // Year
  startDate: "2025-09-04",    // Week start
  endDate: "2025-09-10",      // Week end
  isActive: true,             // Current week
  games: []                   // All games this week
}
```

**Week Lifecycle:**
1. Admin creates week
2. Games auto-populate from odds
3. Users make picks
4. Games lock at start time
5. Results processed
6. Points awarded
7. Next week begins

### 🎮 Admin Features

**Manual Controls:**
- Trigger odds updates
- Update game results
- Create weeks
- Manage league settings
- View all picks
- Adjust points (can be added)

**Automated Tasks:**
- Hourly odds refresh
- Game-day rapid updates
- Automatic scoring
- Pick locking
- Leaderboard updates

## Usage Examples

### Example 1: 5-Game Format League

**Setup:**
```javascript
{
  name: "Office NFL Pool",
  pickFormat: "FIVE_GAMES",
  numGamesPerWeek: 5,
  pickAllGames: false,
  pickPrimeTimeOnly: false
}
```

**Rules:**
- Pick exactly 5 games each week
- Any games available
- +1 for wins, -1 for losses
- Most points at end wins

### Example 2: Primetime Only League

**Setup:**
```javascript
{
  name: "Primetime Pickers",
  pickFormat: "PRIMETIME_ONLY",
  pickPrimeTimeOnly: true,
  numGamesPerWeek: 3  // Typically 3 primetime games
}
```

**Rules:**
- Only Thu/Sun/Mon night games
- Pick all primetime games
- Simpler tracking
- Less time commitment

### Example 3: Full Season Survivor

**Setup:**
```javascript
{
  name: "Pick'em Champions",
  pickFormat: "ALL_GAMES",
  pickAllGames: true
}
```

**Rules:**
- Pick every game every week
- ~16 picks per week
- Most wins total
- For hardcore fans

## Data Flow Examples

### Successful Pick Flow

```
1. User makes pick:
   POST /api/picks
   {
     gameId: "game123",
     pickedTeam: "Kansas City Chiefs",
     spread: -2.5
   }

2. Stored in database:
   Pick {
     userId: "user123",
     gameId: "game123",
     pickedTeam: "Chiefs",
     spread: -2.5,
     result: null,
     points: null
   }

3. Game finishes:
   Final Score: Chiefs 24, Bills 21
   Spread result: 24-21 = 3 points > 2.5

4. Pick scored:
   Pick {
     result: "WIN",
     points: +1
   }

5. User points updated:
   LeagueMembership {
     points: 5 → 6
   }

6. Leaderboard updates automatically
```

### Failed Pick Flow

```
1. User makes pick:
   Picked: Bills +2.5

2. Game finishes:
   Final: Chiefs 24, Bills 21
   Bills points: 21 + 2.5 = 23.5
   Chiefs points: 24
   Bills covered? 23.5 < 24 = NO

3. Pick scored:
   result: "LOSS"
   points: -1

4. User loses a point
```

### Push (Tie) Flow

```
1. User makes pick:
   Picked: Chiefs -2.5

2. Game finishes:
   Final: Chiefs 24, Bills 21.5
   Spread result: Exactly 2.5

3. Pick scored:
   result: "PUSH"
   points: 0

4. No point change
```

## Mobile App Flow (Future)

When you build the mobile app, the flow would be:

```
App Launch
    ↓
Check for token
    ↓
If valid → Dashboard
If invalid → Login screen
    ↓
Dashboard shows:
    - Active leagues
    - Current week
    - Upcoming games
    - User record
    ↓
User taps league
    ↓
Shows:
    - Leaderboard
    - This week's picks
    - Available games
    ↓
User makes picks
    ↓
Push notifications:
    - Game starting soon
    - Pick deadline
    - Game results
    - Leaderboard updates
```

## Integration Points

### External Services:

**Odds API:**
```
oddsScraper.fetchOdds()
    ↓
External API call
    ↓
Parse response
    ↓
Update database
    ↓
Users see new odds
```

**Email Service (Future):**
```
User makes pick
    ↓
Send confirmation email
    ↓
Game starts in 1 hour
    ↓
Send reminder email
    ↓
Game finishes
    ↓
Send results email
```

**Push Notifications (Future):**
```
Schedule notification:
    - Pick deadline approaching
    - Game about to start
    - Your pick won!
    - Leaderboard position changed
```

## Summary

The platform provides:
1. **Complete user management** (register, login, profiles)
2. **Flexible league system** (private, customizable, admin controls)
3. **Reliable pick tracking** (locked spreads, automatic scoring)
4. **Real-time updates** (odds, scores, leaderboards)
5. **Scalable architecture** (multi-sport, multi-format)

Everything is built and ready to use! 🎉
