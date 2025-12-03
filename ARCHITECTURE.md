# NFL Spread Betting Platform - Project Overview

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         Frontend                            │
│  (React + TypeScript + Tailwind + React Query)              │
│  - User Interface                                           │
│  - Pick Management                                          │
│  - Leaderboards                                             │
│  - League Management                                        │
└──────────────────┬──────────────────────────────────────────┘
                   │ HTTPS/REST API
                   ▼
┌─────────────────────────────────────────────────────────────┐
│                         Backend                             │
│        (Node.js + Express + TypeScript)                     │
│  ┌─────────────────────────────────────────────────────┐   │
│  │              API Routes                             │   │
│  │  - Auth (register, login)                           │   │
│  │  - Leagues (create, join, manage)                   │   │
│  │  - Picks (create, view, score)                      │   │
│  │  - Games (list, odds)                               │   │
│  │  - Admin (results, odds update)                     │   │
│  └─────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────┐   │
│  │           Services Layer                            │   │
│  │  - Odds Scraper                                     │   │
│  │  - Cron Scheduler                                   │   │
│  │  - Pick Calculator                                  │   │
│  │  - Scoring Engine                                   │   │
│  └─────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────┐   │
│  │              Middleware                             │   │
│  │  - JWT Authentication                               │   │
│  │  - CORS                                             │   │
│  │  - Error Handling                                   │   │
│  └─────────────────────────────────────────────────────┘   │
└──────────────────┬──────────────────────────────────────────┘
                   │ Prisma ORM
                   ▼
┌─────────────────────────────────────────────────────────────┐
│                    PostgreSQL Database                      │
│  - Users                                                    │
│  - Leagues & Settings                                       │
│  - Games & Odds                                             │
│  - Picks & Results                                          │
│  - Weeks & Seasons                                          │
└─────────────────────────────────────────────────────────────┘

External Services:
┌────────────────────┐
│  Odds API          │ ──► Hourly updates
│  (The Odds API or  │     (via cron jobs)
│   self-hosted)     │
└────────────────────┘
