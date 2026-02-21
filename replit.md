# GoTravel - Thailand Travel Planning App

## Overview
GoTravel is a full-stack travel planning application for Thailand. It helps users compare flights, hotels, and transport options across Thai destinations like Chiang Mai, Bangkok, Phuket, and Krabi.

## Project Architecture
- **Frontend**: React + Vite + Tailwind CSS v4 + shadcn/ui components
- **Backend**: Express.js + tRPC (served from same process)
- **Database**: MySQL via Drizzle ORM (optional - app runs without DB)
- **Language**: TypeScript throughout
- **Package Manager**: pnpm

## Directory Structure
```
client/           - React frontend (Vite)
  src/            - React components, hooks, pages
  public/         - Static assets
server/           - Express backend
  _core/          - Core server utilities (auth, vite, trpc, etc.)
  routers.ts      - tRPC router definitions
  transport.ts    - Transport search logic
  db.ts           - Database connection & queries
shared/           - Shared types/constants between client and server
drizzle/          - Database schema and migrations
patches/          - pnpm patches
scripts/          - Utility scripts
```

## Key Configuration
- The server entry point is `server/_core/index.ts`
- In development, the server runs Vite as middleware (single port)
- PORT is set to 5000 for Replit compatibility
- Server binds to 0.0.0.0 for external access
- Vite config allows all hosts for Replit proxy

## Scripts
- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm start` - Run production server
- `pnpm db:push` - Generate and run database migrations

## Environment Variables
- `PORT` - Server port (default: 5000)
- `DATABASE_URL` - MySQL connection string (optional)
- `GEMINI_API_KEY` - Google Gemini API key for chat features
- `JWT_SECRET` - Cookie/session secret
- `OAUTH_SERVER_URL` - OAuth server URL for authentication
- Various `VITE_*` variables for frontend analytics
