# ZeroDB Project Setup Guide

This guide walks you through initializing a ZeroDB project for the DotHack platform.

## Prerequisites

- Node.js 18+ installed
- npm installed
- Access to ZeroDB API (https://api.zerodb.io)

## Step 1: Get ZeroDB API Access

### Option A: Use Existing Project

If you already have a ZeroDB project:

1. Log in to your ZeroDB dashboard
2. Find your project
3. Copy your:
   - Project UUID (e.g., `abc123-def456-...`)
   - API Key (e.g., `zdb_...`)

Skip to Step 3.

### Option B: Create New Project via API

You can create a project programmatically:

```bash
curl -X POST https://api.zerodb.io/v1/public/projects \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCOUNT_TOKEN" \
  -d '{
    "name": "dothack-hackathons",
    "description": "DotHack hackathon management platform",
    "database_enabled": true
  }'
```

Response:
```json
{
  "project_id": "your-project-uuid",
  "name": "dothack-hackathons",
  "database_enabled": true,
  "created_at": "2025-12-31T00:00:00Z"
}
```

Save your `project_id` - you'll need it for configuration.

### Option C: Create Project via Dashboard

1. Visit https://zerodb.io (or your ZeroDB dashboard URL)
2. Click "Create New Project"
3. Fill in:
   - Name: `dothack-hackathons`
   - Description: `Hackathon management platform`
   - Enable Database: ✅ Yes
4. Click "Create Project"
5. Copy your Project UUID and API Key

## Step 2: Configure Environment Variables

1. Copy the example environment file:
   ```bash
   cp .env.example .env.local
   ```

2. Edit `.env.local` and fill in your ZeroDB credentials:
   ```bash
   # ZeroDB Configuration
   NEXT_PUBLIC_ZERODB_API_BASE=https://api.zerodb.io
   NEXT_PUBLIC_ZERODB_PROJECT_ID=your-project-uuid-here
   NEXT_PUBLIC_ZERODB_API_KEY=your-api-key-here
   ```

3. Save the file

## Step 3: Verify Connection

Test your ZeroDB connection:

```bash
npm run verify-zerodb
```

This script will:
- ✅ Validate environment variables are set
- ✅ Test API connection
- ✅ Verify project exists
- ✅ Check database features are enabled

Expected output:
```
🔍 Verifying ZeroDB connection...

✅ Environment variables configured
✅ API connection successful
✅ Project ID: abc123-def456-...
✅ Database features enabled
✅ Connection verified!

Ready to create database tables.
```

## Step 4: Create Database Tables

Once connection is verified, create all required tables:

```bash
npm run setup-db
```

This will create 10 tables:
1. hackathons
2. tracks
3. participants
4. hackathon_participants
5. teams
6. team_members
7. projects
8. submissions
9. rubrics
10. scores

Expected output:
```
🚀 Starting database setup...
📊 Creating 10 tables...

📝 Creating table: hackathons...
✅ Table hackathons created successfully

📝 Creating table: tracks...
✅ Table tracks created successfully

... (8 more tables)

==================================================
📊 Database setup complete!
✅ Successful: 10/10
❌ Failed: 0/10
==================================================
```

## Step 5: Verify Tables Exist

Verify all tables were created successfully:

```bash
npm run setup-db verify
```

Expected output:
```
🔍 Verifying table existence...

✅ Table hackathons exists
✅ Table tracks exists
✅ Table participants exists
... (7 more tables)

==================================================
📊 Table verification complete!
✅ Existing: 10/10
❌ Missing: 0/10
==================================================
```

## Step 6: Test API Integration

Create a test hackathon to verify everything works:

```bash
npm run test-api
```

Or test manually in your app:

```typescript
import { createHackathon } from '@/lib/api/hackathons'

const hackathon = await createHackathon({
  name: 'Test Hackathon',
  description: 'Testing the setup',
  start_at: '2025-01-15T00:00:00Z',
  end_at: '2025-01-17T00:00:00Z'
})

console.log('Created hackathon:', hackathon)
```

## Troubleshooting

### Error: "Missing environment variables"

**Problem:** One or more required environment variables are not set.

**Solution:**
1. Check that `.env.local` exists
2. Verify all three variables are set:
   - `NEXT_PUBLIC_ZERODB_API_BASE`
   - `NEXT_PUBLIC_ZERODB_PROJECT_ID`
   - `NEXT_PUBLIC_ZERODB_API_KEY`
3. Restart your Next.js dev server

### Error: "Invalid project ID"

**Problem:** The project UUID is incorrect or doesn't exist.

**Solution:**
1. Double-check the project UUID from your ZeroDB dashboard
2. Ensure it's a valid UUID format (e.g., `abc123-def456-...`)
3. Verify the project exists and is active

### Error: "Unauthorized" (401)

**Problem:** The API key is invalid or missing permissions.

**Solution:**
1. Verify your API key is correct
2. Check that the API key has database access permissions
3. Generate a new API key if needed

### Error: "Table already exists"

**Problem:** You've already created the tables.

**Solution:** This is not actually an error! The setup script handles this gracefully. If you need to recreate tables, you'll need to delete them first via the ZeroDB API or dashboard.

### Error: "Network error"

**Problem:** Cannot connect to ZeroDB API.

**Solution:**
1. Check your internet connection
2. Verify the API base URL is correct
3. Check if ZeroDB service is operational
4. Try accessing the API directly in your browser or via curl

### Error: "Database features not enabled"

**Problem:** The project doesn't have database features enabled.

**Solution:**
1. Recreate the project with `database_enabled: true`
2. Or enable database features via the dashboard
3. Contact ZeroDB support if the option is not available

## Next Steps

After successful setup:

1. ✅ Start the dev server: `npm run dev`
2. ✅ Navigate to http://localhost:3000
3. ✅ Begin creating hackathons!

## Project Structure

After setup, your project will have:

```
frontend/
├── .env.local                    # Your ZeroDB credentials (gitignored)
├── lib/
│   ├── zerodb.ts                 # ZeroDB client
│   ├── setup-database.ts         # Table schemas and setup
│   ├── api/                      # API functions
│   │   ├── hackathons.ts
│   │   ├── tracks.ts
│   │   └── ... (9 files total)
│   └── hooks/
│       ├── use-hackathons.ts
│       ├── use-tracks.ts
│       └── ... (9 files total)
└── scripts/
    ├── setup-db.ts               # Database setup CLI
    └── verify-zerodb.ts          # Connection verification

```

## Environment Variables Reference

| Variable | Description | Example |
|----------|-------------|---------|
| `NEXT_PUBLIC_ZERODB_API_BASE` | ZeroDB API base URL | `https://api.zerodb.io` |
| `NEXT_PUBLIC_ZERODB_PROJECT_ID` | Your project UUID | `abc123-def456-...` |
| `NEXT_PUBLIC_ZERODB_API_KEY` | Your API authentication key | `zdb_...` |

## Security Notes

⚠️ **IMPORTANT:**

1. **Never commit `.env.local`** - It's in `.gitignore` by default
2. **Never share your API key** - Treat it like a password
3. **Rotate keys regularly** - Generate new keys periodically
4. **Use different keys for dev/prod** - Never use production keys in development
5. **Restrict key permissions** - Only grant necessary permissions

## Support

- ZeroDB Documentation: https://docs.zerodb.io
- DotHack Issues: https://github.com/AINative-Studio/dothack-frontend/issues
- Database Schema: See `DATABASE_SETUP.md`
- API Reference: See individual files in `lib/api/`

## Checklist

- [ ] ZeroDB project created
- [ ] Environment variables configured in `.env.local`
- [ ] Connection verified (`npm run verify-zerodb`)
- [ ] Database tables created (`npm run setup-db`)
- [ ] Tables verified (`npm run setup-db verify`)
- [ ] Test API call successful
- [ ] Dev server running
- [ ] Ready to build!

---

**Last Updated:** 2025-12-31
**Version:** 1.0.0
