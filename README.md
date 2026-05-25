# my-project

Next.js app.

## Prerequisites
- Node.js 20+ (recommended)
- npm (built-in with Node) or pnpm

## Install
```bash
npm install

Run in development
npm run dev
Build for production
npm run build
Start production server
npm run start
Lint
npm run lint
Environment variables
Copy .env.example to .env.local
Fill values only in .env.local (never commit secrets)
Deployment
Recommended: Vercel (supports Next.js out of the box)
Before deploy, ensure:
npm run lint passes
npm run build passes
required env vars are set in hosting dashboard