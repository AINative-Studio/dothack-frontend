# DotHack Frontend - Quick Start Guide

Get up and running with the DotHack platform in under 5 minutes.

## Prerequisites

- Node.js 18+
- npm or yarn
- ZeroDB account (https://zerodb.io)

## 1. Clone and Install

```bash
# Clone the repository
git clone https://github.com/AINative-Studio/dothack-frontend.git
cd dothack-frontend/frontend

# Install dependencies
npm install
```

## 2. Configure ZeroDB

### Create ZeroDB Project

**Option A: Via Dashboard** (Recommended)
1. Go to https://zerodb.io
2. Create new project: "dothack-hackathons"
3. Enable database features
4. Copy your Project UUID and API Key

**Option B: Via API**
```bash
curl -X POST https://api.zerodb.io/v1/public/projects \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "name": "dothack-hackathons",
    "database_enabled": true
  }'
```

### Configure Environment

```bash
# Copy example env file
cp .env.example .env.local

# Edit .env.local and add your credentials:
# NEXT_PUBLIC_ZERODB_PROJECT_ID=your-project-uuid
# NEXT_PUBLIC_ZERODB_API_KEY=your-api-key
```

## 3. Verify Connection

```bash
npm run verify-zerodb
```

Expected output:
```
✅ All verification checks passed!
🎉 ZeroDB connection is properly configured!
```

## 4. Create Database Tables

```bash
npm run setup-db
```

This creates 10 tables for hackathon management.

## 5. Verify Setup

```bash
npm run setup-db verify
```

Expected: `✅ Existing: 10/10`

## 6. Start Development

```bash
npm run dev
```

Open http://localhost:3000

## 🎉 You're Ready!

Your DotHack platform is now set up and ready to use.

## What's Next?

### Test the Platform

1. Navigate to http://localhost:3000/hackathons
2. Create your first hackathon
3. Add tracks, participants, and teams
4. Test submissions and judging

### Development Workflow

```bash
# Run type checking
npm run typecheck

# Build for production
npm run build

# Start production server
npm start
```

## Project Structure

```
frontend/
├── app/                    # Next.js app directory
│   ├── (app)/             # Main application routes
│   └── layout.tsx         # Root layout
├── lib/
│   ├── api/               # API functions (9 modules)
│   ├── zerodb.ts          # ZeroDB client
│   ├── error-handling.ts  # Error utilities
│   └── validation.ts      # Request validation
├── hooks/                 # React Query hooks (9 modules)
├── components/            # React components
└── scripts/               # Setup and utility scripts
```

## Key Features Implemented

✅ **Database Layer**
- 10 tables for complete hackathon management
- ZeroDB integration with Tables API
- Embeddings for semantic search

✅ **API Integration**
- Full CRUD operations for all entities
- Type-safe API functions
- Comprehensive error handling

✅ **State Management**
- React Query for server state
- Optimistic updates
- Automatic cache invalidation

✅ **Type Safety**
- Full TypeScript coverage
- Type-safe API calls
- Validated requests

## Common Issues

### "Missing environment variables"
→ Make sure `.env.local` exists and contains all three ZeroDB variables

### "Invalid project ID"
→ Check that your project UUID is correct in `.env.local`

### "Unauthorized"
→ Verify your API key is correct and has database permissions

### "Table already exists"
→ Tables are already created. This is normal!

## Documentation

- **ZERODB_SETUP.md** - Detailed ZeroDB setup guide
- **DATABASE_SETUP.md** - Database schema documentation
- **PRD.md** - Product requirements (in parent directory)

## NPM Scripts Reference

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm start` | Start production server |
| `npm run typecheck` | Run TypeScript type checking |
| `npm run setup-db` | Create database tables |
| `npm run setup-db verify` | Verify tables exist |
| `npm run setup-db schemas` | Show table schemas |
| `npm run verify-zerodb` | Test ZeroDB connection |

## Support

- GitHub Issues: https://github.com/AINative-Studio/dothack-frontend/issues
- ZeroDB Docs: https://docs.zerodb.io

---

**Ready to build something amazing? Let's go! 🚀**
