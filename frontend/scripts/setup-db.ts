#!/usr/bin/env tsx

/**
 * Database Setup CLI Tool
 *
 * This script initializes the ZeroDB database by creating all required tables.
 *
 * Usage:
 *   npm run setup-db           # Create all tables
 *   npm run setup-db verify    # Verify tables exist
 *
 * Environment Variables Required:
 *   NEXT_PUBLIC_ZERODB_API_BASE - ZeroDB API base URL
 *   NEXT_PUBLIC_ZERODB_PROJECT_ID - Your ZeroDB project UUID
 *   NEXT_PUBLIC_ZERODB_API_KEY - Your ZeroDB API key
 */

import { setupDatabase, verifyTables, getTableSchemas } from '../lib/setup-database'

const command = process.argv[2] || 'setup'

async function main() {
  console.log('🎯 ZeroDB Database Setup Tool\n')

  // Check environment variables
  const requiredEnvVars = [
    'NEXT_PUBLIC_ZERODB_API_BASE',
    'NEXT_PUBLIC_ZERODB_PROJECT_ID',
    'NEXT_PUBLIC_ZERODB_API_KEY'
  ]

  const missingEnvVars = requiredEnvVars.filter(name => !process.env[name])

  if (missingEnvVars.length > 0) {
    console.error('❌ Missing required environment variables:')
    missingEnvVars.forEach(name => console.error(`   - ${name}`))
    console.error('\nPlease set these in your .env.local file')
    process.exit(1)
  }

  console.log('✅ Environment variables verified\n')

  if (command === 'verify') {
    const result = await verifyTables()
    process.exit(result.success ? 0 : 1)
  } else if (command === 'schemas') {
    const schemas = getTableSchemas()
    console.log('📋 Table Schemas:\n')
    schemas.forEach(schema => {
      console.log(`\n${schema.table_name}:`)
      console.log(`  Description: ${schema.description}`)
      console.log(`  Fields:`)
      Object.entries(schema.schema.fields).forEach(([name, field]) => {
        const nullable = field.nullable ? 'NULL' : 'NOT NULL'
        const unique = field.unique ? ' UNIQUE' : ''
        const defaultVal = field.default ? ` DEFAULT ${field.default}` : ''
        console.log(`    - ${name}: ${field.type} ${nullable}${unique}${defaultVal}`)
      })
    })
    process.exit(0)
  } else if (command === 'setup' || command === 'create') {
    const result = await setupDatabase()
    process.exit(result.success ? 0 : 1)
  } else {
    console.error(`❌ Unknown command: ${command}`)
    console.error('\nUsage:')
    console.error('  npm run setup-db           # Create all tables')
    console.error('  npm run setup-db verify    # Verify tables exist')
    console.error('  npm run setup-db schemas   # Show table schemas')
    process.exit(1)
  }
}

main().catch(error => {
  console.error('❌ Unexpected error:', error)
  process.exit(1)
})
