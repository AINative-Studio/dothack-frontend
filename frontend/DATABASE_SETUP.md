# Database Setup Guide

This guide explains how to initialize the ZeroDB database for the DotHack platform.

## Prerequisites

1. ZeroDB Project Created
   - Visit https://api.zerodb.io or use the ZeroDB API
   - Create a new project with `database_enabled: true`
   - Save your project UUID and API key

2. Environment Variables
   - Copy `.env.example` to `.env.local`
   - Fill in your ZeroDB credentials:
     ```bash
     NEXT_PUBLIC_ZERODB_API_BASE=https://api.zerodb.io
     NEXT_PUBLIC_ZERODB_PROJECT_ID=your-project-uuid
     NEXT_PUBLIC_ZERODB_API_KEY=your-api-key
     ```

## Database Schema

The platform uses 10 tables as defined in PRD Section 5.1:

1. **hackathons** - Core hackathon metadata
2. **tracks** - Hackathon tracks/categories
3. **participants** - User registry
4. **hackathon_participants** - Join table for hackathon enrollment
5. **teams** - Team records
6. **team_members** - Team membership
7. **projects** - Project metadata
8. **submissions** - Final submissions
9. **rubrics** - Judging criteria
10. **scores** - Judge scores and feedback

## Setup Instructions

### Option 1: Using npm script (Recommended)

```bash
# Create all tables
npm run setup-db

# Verify tables exist
npm run setup-db verify

# Show table schemas
npm run setup-db schemas
```

### Option 2: Using the API directly

```typescript
import { setupDatabase, verifyTables } from '@/lib/setup-database'

// Create all tables
const result = await setupDatabase()
console.log('Setup result:', result)

// Verify tables exist
const verification = await verifyTables()
console.log('Verification:', verification)
```

### Option 3: Manual API calls

See `lib/setup-database.ts` for the exact table schemas and use the ZeroDB API:

```bash
POST https://api.zerodb.io/v1/public/{project_id}/database/tables
Content-Type: application/json
X-API-Key: your-api-key

{
  "table_name": "hackathons",
  "description": "Core hackathon metadata",
  "schema": {
    "fields": {
      "hackathon_id": { "type": "UUID", "nullable": false },
      "name": { "type": "TEXT", "nullable": false },
      ...
    }
  }
}
```

## Table Details

### hackathons
Core hackathon information:
- `hackathon_id` (UUID) - Primary key
- `name` (TEXT) - Hackathon name
- `description` (TEXT) - Hackathon description
- `status` (TEXT) - DRAFT | LIVE | CLOSED
- `start_at` (TIMESTAMP) - Start date/time
- `end_at` (TIMESTAMP) - End date/time
- `created_at` (TIMESTAMP) - Creation timestamp

### tracks
Hackathon categories/themes:
- `track_id` (UUID) - Primary key
- `hackathon_id` (UUID) - Foreign key to hackathons
- `name` (TEXT) - Track name
- `description` (TEXT) - Track description

### participants
User/participant registry:
- `participant_id` (UUID) - Primary key
- `name` (TEXT) - Participant name
- `email` (TEXT UNIQUE) - Participant email
- `org` (TEXT NULL) - Organization (optional)
- `created_at` (TIMESTAMP) - Creation timestamp

### hackathon_participants
Join table for enrollment:
- `hackathon_id` (UUID) - Foreign key to hackathons
- `participant_id` (UUID) - Foreign key to participants
- `role` (TEXT) - BUILDER | ORGANIZER | JUDGE | MENTOR

### teams
Team information:
- `team_id` (UUID) - Primary key
- `hackathon_id` (UUID) - Foreign key to hackathons
- `name` (TEXT) - Team name
- `track_id` (UUID NULL) - Foreign key to tracks (optional)
- `created_at` (TIMESTAMP) - Creation timestamp

### team_members
Team membership:
- `team_id` (UUID) - Foreign key to teams
- `participant_id` (UUID) - Foreign key to participants
- `role` (TEXT) - LEAD | MEMBER

### projects
Project metadata:
- `project_id` (UUID) - Primary key
- `hackathon_id` (UUID) - Foreign key to hackathons
- `team_id` (UUID) - Foreign key to teams
- `title` (TEXT) - Project title
- `one_liner` (TEXT) - Brief description
- `status` (TEXT) - IDEA | BUILDING | SUBMITTED
- `repo_url` (TEXT NULL) - Repository URL (optional)
- `demo_url` (TEXT NULL) - Demo URL (optional)
- `created_at` (TIMESTAMP) - Creation timestamp

### submissions
Final project submissions:
- `submission_id` (UUID) - Primary key
- `project_id` (UUID) - Foreign key to projects
- `submitted_at` (TIMESTAMP) - Submission timestamp
- `submission_text` (TEXT) - Canonical narrative
- `artifact_links_json` (TEXT NULL) - JSON string of links
- `namespace` (TEXT) - Embeddings namespace

### rubrics
Judging criteria:
- `rubric_id` (UUID) - Primary key
- `hackathon_id` (UUID) - Foreign key to hackathons
- `title` (TEXT) - Rubric title
- `criteria_json` (TEXT) - JSON string of criteria

### scores
Judge scores and feedback:
- `score_id` (UUID) - Primary key
- `submission_id` (UUID) - Foreign key to submissions
- `judge_participant_id` (UUID) - Foreign key to participants
- `score_json` (TEXT) - JSON string of criteria scores
- `total_score` (REAL) - Calculated total
- `feedback` (TEXT NULL) - Judge feedback

## Troubleshooting

### Error: "Table already exists"
This is normal if you've already run the setup. The script will skip existing tables.

### Error: "Invalid project ID"
Check that your `NEXT_PUBLIC_ZERODB_PROJECT_ID` is a valid UUID and the project exists.

### Error: "Unauthorized"
Verify your `NEXT_PUBLIC_ZERODB_API_KEY` is correct and has the necessary permissions.

### Error: "Network error"
Check that:
- You have internet connectivity
- The `NEXT_PUBLIC_ZERODB_API_BASE` URL is correct
- ZeroDB service is operational

## Next Steps

After database setup:
1. Verify tables with `npm run setup-db verify`
2. Test API integration with sample data
3. Begin implementing application features

## Reference

- PRD: `../prd.md` Section 5.1
- ZeroDB Client: `lib/zerodb.ts`
- API Functions: `lib/api/*.ts`
- React Query Hooks: `hooks/use-*.ts`
