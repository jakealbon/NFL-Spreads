# 🚀 Deployment Checklist

Use this checklist to ensure a smooth deployment to production.

## Pre-Deployment

### Code & Repository
- [ ] All code committed to GitHub
- [ ] `.env` files not committed (check `.gitignore`)
- [ ] README.md is up to date
- [ ] Dependencies are properly listed in `package.json`
- [ ] TypeScript compiles without errors (`npm run build`)

### Configuration
- [ ] Strong JWT_SECRET generated (use: `openssl rand -base64 32`)
- [ ] Database connection string ready
- [ ] Odds API key obtained (if using The Odds API)
- [ ] All required environment variables documented

### Testing
- [ ] Backend runs locally without errors
- [ ] Database migrations run successfully
- [ ] API endpoints tested (auth, leagues, picks)
- [ ] Cron jobs tested locally
- [ ] Odds scraper tested

## Railway Setup

### Project Creation
- [ ] Railway account created
- [ ] New project initialized
- [ ] GitHub repo connected to Railway
- [ ] PostgreSQL database added to project

### Environment Variables Set
Backend service variables:
- [ ] `NODE_ENV=production`
- [ ] `JWT_SECRET=<your-secret>`
- [ ] `ODDS_API_KEY=<your-key>` (if applicable)
- [ ] `ODDS_API_URL=<api-url>`
- [ ] `PORT=3000`
- [ ] `DATABASE_URL` (auto-set by Railway)

### Service Configuration
- [ ] Root directory set to `backend`
- [ ] Build command: `npm run prisma:generate && npm run build`
- [ ] Start command: `npm run prisma:push && npm start`
- [ ] Domain generated for backend

### Database
- [ ] PostgreSQL provisioned
- [ ] Connection verified
- [ ] Migrations applied
- [ ] Can connect to Prisma Studio

## Post-Deployment

### Verification
- [ ] Backend URL accessible
- [ ] Health check passes (if implemented)
- [ ] Can register a user
- [ ] Can create a league
- [ ] Can join a league
- [ ] Odds update works
- [ ] Cron jobs running (check logs)

### Monitoring
- [ ] Railway logs accessible
- [ ] No errors in startup logs
- [ ] Cron jobs executing on schedule
- [ ] Database queries working
- [ ] API response times acceptable

### Security
- [ ] Strong JWT secret in use (not default)
- [ ] Database password is strong
- [ ] API keys stored in env variables (not code)
- [ ] CORS configured correctly
- [ ] HTTPS enabled (automatic with Railway)

## Frontend Deployment (If Applicable)

### Vercel/Railway
- [ ] Frontend repository/service set up
- [ ] `VITE_API_URL` points to backend domain
- [ ] Build succeeds
- [ ] Frontend URL accessible
- [ ] Can connect to backend API

## Optional Enhancements

### Monitoring & Logging
- [ ] Error tracking (Sentry, LogRocket)
- [ ] Analytics (Google Analytics, Plausible)
- [ ] Uptime monitoring (UptimeRobot, Better Stack)

### Backups
- [ ] Database backup schedule verified
- [ ] Manual backup taken
- [ ] Backup restore process tested

### Documentation
- [ ] User guide created
- [ ] Admin documentation written
- [ ] API documentation published (optional)

### Performance
- [ ] Response times tested under load
- [ ] Database queries optimized
- [ ] Caching strategy (if needed)

## Week 1 Preparation

Before your first NFL week:
- [ ] NFL schedule loaded (weeks created)
- [ ] Odds scraper pulling data successfully
- [ ] Test league created with real users
- [ ] Picks tested end-to-end
- [ ] Scoring logic verified
- [ ] Leaderboard working

## Launch Day

- [ ] All systems operational
- [ ] Invite codes distributed
- [ ] Users can register and join
- [ ] Picks submission working
- [ ] Support channel ready (Discord/email)
- [ ] Monitoring active

## Week 1 Monitoring

After first games:
- [ ] Game results processed correctly
- [ ] Picks scored accurately
- [ ] Leaderboard updated
- [ ] No user-reported issues
- [ ] Cron jobs completed successfully

## Issue Response

If problems occur:
- [ ] Check Railway logs first
- [ ] Verify database connection
- [ ] Test API endpoints manually
- [ ] Check environment variables
- [ ] Review recent code changes
- [ ] Check external services (odds API)

## Rollback Plan

If critical issues:
- [ ] Previous deployment can be restored
- [ ] Database can be rolled back
- [ ] Users notified of issues
- [ ] Incident documented

## Success Metrics

Track these to measure success:
- [ ] User registration rate
- [ ] League creation rate
- [ ] Picks submission rate
- [ ] API uptime (target: 99%+)
- [ ] Average response time (target: <500ms)
- [ ] Cron job success rate (target: 100%)
- [ ] User satisfaction/feedback

## Communication

- [ ] Users informed of launch
- [ ] Support email/channel established
- [ ] Feedback mechanism in place
- [ ] Social media/community set up

## Legal & Compliance

- [ ] Terms of Service published
- [ ] Privacy Policy published
- [ ] Age verification (if required)
- [ ] Gambling regulations reviewed (consult lawyer)
- [ ] Data protection compliance (GDPR if applicable)

---

## Quick Commands Reference

```bash
# Railway
railway login
railway logs
railway run npx prisma studio
railway variables

# Git
git status
git add .
git commit -m "message"
git push

# Local testing
npm run dev
npm run build
npm test
```

## Emergency Contacts

- Railway Support: support@railway.app
- Odds API Support: [Your provider]
- Team Members: [Add contacts]

---

## Notes

Use this section for deployment-specific notes:

**Date:** ___________
**Deployed by:** ___________
**Backend URL:** ___________
**Frontend URL:** ___________
**Database:** ___________
**Issues:** ___________

---

**Remember:** It's better to deploy gradually and test thoroughly than to rush and fix issues in production!
