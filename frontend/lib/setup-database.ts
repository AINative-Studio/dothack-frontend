/**
 * Database Setup Script for ZeroDB
 *
 * This script creates all required tables for the hackathon platform
 * according to PRD Section 5.1.
 *
 * Run this once during project initialization.
 */

const ZERODB_API_BASE = process.env.NEXT_PUBLIC_ZERODB_API_BASE || 'https://api.zerodb.io'
const ZERODB_PROJECT_ID = process.env.NEXT_PUBLIC_ZERODB_PROJECT_ID || ''
const ZERODB_API_KEY = process.env.NEXT_PUBLIC_ZERODB_API_KEY || ''

interface TableSchema {
  table_name: string
  description: string
  schema: {
    fields: Record<string, TableField>
    indexes?: string[]
  }
}

interface TableField {
  type: 'UUID' | 'TEXT' | 'TIMESTAMP' | 'REAL'
  nullable?: boolean
  unique?: boolean
  default?: string
  description?: string
}

/**
 * All table schemas according to PRD Section 5.1
 */
const TABLE_SCHEMAS: TableSchema[] = [
  {
    table_name: 'hackathons',
    description: 'Core hackathon metadata',
    schema: {
      fields: {
        hackathon_id: {
          type: 'UUID',
          nullable: false,
          description: 'Primary key'
        },
        name: {
          type: 'TEXT',
          nullable: false,
          description: 'Hackathon name'
        },
        description: {
          type: 'TEXT',
          nullable: false,
          description: 'Hackathon description'
        },
        status: {
          type: 'TEXT',
          nullable: false,
          description: 'DRAFT | LIVE | CLOSED'
        },
        start_at: {
          type: 'TIMESTAMP',
          nullable: false,
          description: 'Start timestamp'
        },
        end_at: {
          type: 'TIMESTAMP',
          nullable: false,
          description: 'End timestamp'
        },
        created_at: {
          type: 'TIMESTAMP',
          nullable: false,
          default: 'NOW()',
          description: 'Creation timestamp'
        }
      },
      indexes: ['hackathon_id', 'status', 'created_at']
    }
  },
  {
    table_name: 'tracks',
    description: 'Hackathon tracks/categories',
    schema: {
      fields: {
        track_id: {
          type: 'UUID',
          nullable: false,
          description: 'Primary key'
        },
        hackathon_id: {
          type: 'UUID',
          nullable: false,
          description: 'Foreign key to hackathons'
        },
        name: {
          type: 'TEXT',
          nullable: false,
          description: 'Track name'
        },
        description: {
          type: 'TEXT',
          nullable: false,
          description: 'Track description'
        }
      },
      indexes: ['track_id', 'hackathon_id']
    }
  },
  {
    table_name: 'participants',
    description: 'User registry',
    schema: {
      fields: {
        participant_id: {
          type: 'UUID',
          nullable: false,
          description: 'Primary key'
        },
        name: {
          type: 'TEXT',
          nullable: false,
          description: 'Participant name'
        },
        email: {
          type: 'TEXT',
          nullable: false,
          unique: true,
          description: 'Participant email (unique)'
        },
        org: {
          type: 'TEXT',
          nullable: true,
          description: 'Organization (optional)'
        },
        created_at: {
          type: 'TIMESTAMP',
          nullable: false,
          default: 'NOW()',
          description: 'Creation timestamp'
        }
      },
      indexes: ['participant_id', 'email']
    }
  },
  {
    table_name: 'hackathon_participants',
    description: 'Join table for hackathon enrollment',
    schema: {
      fields: {
        hackathon_id: {
          type: 'UUID',
          nullable: false,
          description: 'Foreign key to hackathons'
        },
        participant_id: {
          type: 'UUID',
          nullable: false,
          description: 'Foreign key to participants'
        },
        role: {
          type: 'TEXT',
          nullable: false,
          description: 'BUILDER | ORGANIZER | JUDGE | MENTOR'
        }
      },
      indexes: ['hackathon_id', 'participant_id']
    }
  },
  {
    table_name: 'teams',
    description: 'Team records',
    schema: {
      fields: {
        team_id: {
          type: 'UUID',
          nullable: false,
          description: 'Primary key'
        },
        hackathon_id: {
          type: 'UUID',
          nullable: false,
          description: 'Foreign key to hackathons'
        },
        name: {
          type: 'TEXT',
          nullable: false,
          description: 'Team name'
        },
        track_id: {
          type: 'UUID',
          nullable: true,
          description: 'Foreign key to tracks (optional)'
        },
        created_at: {
          type: 'TIMESTAMP',
          nullable: false,
          default: 'NOW()',
          description: 'Creation timestamp'
        }
      },
      indexes: ['team_id', 'hackathon_id', 'track_id']
    }
  },
  {
    table_name: 'team_members',
    description: 'Team membership',
    schema: {
      fields: {
        team_id: {
          type: 'UUID',
          nullable: false,
          description: 'Foreign key to teams'
        },
        participant_id: {
          type: 'UUID',
          nullable: false,
          description: 'Foreign key to participants'
        },
        role: {
          type: 'TEXT',
          nullable: false,
          description: 'LEAD | MEMBER'
        }
      },
      indexes: ['team_id', 'participant_id']
    }
  },
  {
    table_name: 'projects',
    description: 'Project metadata',
    schema: {
      fields: {
        project_id: {
          type: 'UUID',
          nullable: false,
          description: 'Primary key'
        },
        hackathon_id: {
          type: 'UUID',
          nullable: false,
          description: 'Foreign key to hackathons'
        },
        team_id: {
          type: 'UUID',
          nullable: false,
          description: 'Foreign key to teams'
        },
        title: {
          type: 'TEXT',
          nullable: false,
          description: 'Project title'
        },
        one_liner: {
          type: 'TEXT',
          nullable: false,
          description: 'Project one-liner description'
        },
        status: {
          type: 'TEXT',
          nullable: false,
          description: 'IDEA | BUILDING | SUBMITTED'
        },
        repo_url: {
          type: 'TEXT',
          nullable: true,
          description: 'Repository URL (optional)'
        },
        demo_url: {
          type: 'TEXT',
          nullable: true,
          description: 'Demo URL (optional)'
        },
        created_at: {
          type: 'TIMESTAMP',
          nullable: false,
          default: 'NOW()',
          description: 'Creation timestamp'
        }
      },
      indexes: ['project_id', 'hackathon_id', 'team_id', 'status']
    }
  },
  {
    table_name: 'submissions',
    description: 'Final submissions',
    schema: {
      fields: {
        submission_id: {
          type: 'UUID',
          nullable: false,
          description: 'Primary key'
        },
        project_id: {
          type: 'UUID',
          nullable: false,
          description: 'Foreign key to projects'
        },
        submitted_at: {
          type: 'TIMESTAMP',
          nullable: false,
          description: 'Submission timestamp'
        },
        submission_text: {
          type: 'TEXT',
          nullable: false,
          description: 'The canonical narrative'
        },
        artifact_links_json: {
          type: 'TEXT',
          nullable: true,
          description: 'JSON string of artifact links'
        },
        namespace: {
          type: 'TEXT',
          nullable: false,
          description: 'Used for embeddings storage namespace'
        }
      },
      indexes: ['submission_id', 'project_id']
    }
  },
  {
    table_name: 'rubrics',
    description: 'Judging criteria',
    schema: {
      fields: {
        rubric_id: {
          type: 'UUID',
          nullable: false,
          description: 'Primary key'
        },
        hackathon_id: {
          type: 'UUID',
          nullable: false,
          description: 'Foreign key to hackathons'
        },
        title: {
          type: 'TEXT',
          nullable: false,
          description: 'Rubric title'
        },
        criteria_json: {
          type: 'TEXT',
          nullable: false,
          description: 'Criteria weights stored as JSON string'
        }
      },
      indexes: ['rubric_id', 'hackathon_id']
    }
  },
  {
    table_name: 'scores',
    description: 'Judge scores and feedback',
    schema: {
      fields: {
        score_id: {
          type: 'UUID',
          nullable: false,
          description: 'Primary key'
        },
        submission_id: {
          type: 'UUID',
          nullable: false,
          description: 'Foreign key to submissions'
        },
        judge_participant_id: {
          type: 'UUID',
          nullable: false,
          description: 'Foreign key to participants (judge)'
        },
        score_json: {
          type: 'TEXT',
          nullable: false,
          description: 'JSON string: criteria → numeric'
        },
        total_score: {
          type: 'REAL',
          nullable: false,
          description: 'Calculated total score'
        },
        feedback: {
          type: 'TEXT',
          nullable: true,
          description: 'Judge feedback'
        }
      },
      indexes: ['score_id', 'submission_id', 'judge_participant_id']
    }
  }
]

/**
 * Create a single table in ZeroDB
 */
async function createTable(schema: TableSchema): Promise<{success: boolean, error?: string}> {
  try {
    const url = `${ZERODB_API_BASE}/v1/public/${ZERODB_PROJECT_ID}/database/tables`

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': ZERODB_API_KEY
      },
      body: JSON.stringify(schema)
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      return {
        success: false,
        error: errorData.error || `HTTP ${response.status}: ${response.statusText}`
      }
    }

    const data = await response.json()
    return { success: true }
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Unknown error'
    }
  }
}

/**
 * Create all tables in ZeroDB
 *
 * This function creates all 10 required tables for the hackathon platform.
 * It handles duplicate table errors gracefully.
 */
export async function setupDatabase(): Promise<{
  success: boolean
  results: Array<{table: string, success: boolean, error?: string}>
}> {
  console.log('🚀 Starting database setup...')
  console.log(`📊 Creating ${TABLE_SCHEMAS.length} tables...`)

  const results: Array<{table: string, success: boolean, error?: string}> = []

  for (const schema of TABLE_SCHEMAS) {
    console.log(`\n📝 Creating table: ${schema.table_name}...`)

    const result = await createTable(schema)

    results.push({
      table: schema.table_name,
      success: result.success,
      error: result.error
    })

    if (result.success) {
      console.log(`✅ Table ${schema.table_name} created successfully`)
    } else {
      if (result.error?.includes('already exists')) {
        console.log(`⚠️  Table ${schema.table_name} already exists (skipping)`)
      } else {
        console.error(`❌ Failed to create table ${schema.table_name}:`, result.error)
      }
    }
  }

  const successCount = results.filter(r => r.success).length
  const failureCount = results.length - successCount

  console.log('\n' + '='.repeat(50))
  console.log(`📊 Database setup complete!`)
  console.log(`✅ Successful: ${successCount}/${results.length}`)
  console.log(`❌ Failed: ${failureCount}/${results.length}`)
  console.log('='.repeat(50))

  return {
    success: failureCount === 0 || results.every(r => r.error?.includes('already exists')),
    results
  }
}

/**
 * Verify all tables exist in ZeroDB
 */
export async function verifyTables(): Promise<{
  success: boolean
  existingTables: string[]
  missingTables: string[]
}> {
  console.log('🔍 Verifying table existence...')

  const existingTables: string[] = []
  const missingTables: string[] = []

  for (const schema of TABLE_SCHEMAS) {
    try {
      const url = `${ZERODB_API_BASE}/v1/public/${ZERODB_PROJECT_ID}/database/tables/${schema.table_name}/rows?limit=1`

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': ZERODB_API_KEY
        }
      })

      if (response.ok) {
        existingTables.push(schema.table_name)
        console.log(`✅ Table ${schema.table_name} exists`)
      } else if (response.status === 404) {
        missingTables.push(schema.table_name)
        console.log(`❌ Table ${schema.table_name} not found`)
      } else {
        missingTables.push(schema.table_name)
        console.log(`⚠️  Unable to verify table ${schema.table_name}`)
      }
    } catch (error) {
      missingTables.push(schema.table_name)
      console.error(`❌ Error checking table ${schema.table_name}:`, error)
    }
  }

  console.log('\n' + '='.repeat(50))
  console.log(`📊 Table verification complete!`)
  console.log(`✅ Existing: ${existingTables.length}/${TABLE_SCHEMAS.length}`)
  console.log(`❌ Missing: ${missingTables.length}/${TABLE_SCHEMAS.length}`)
  console.log('='.repeat(50))

  return {
    success: missingTables.length === 0,
    existingTables,
    missingTables
  }
}

/**
 * Get table schemas for documentation or reference
 */
export function getTableSchemas(): TableSchema[] {
  return TABLE_SCHEMAS
}
