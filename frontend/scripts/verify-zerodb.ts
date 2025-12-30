#!/usr/bin/env tsx

/**
 * ZeroDB Connection Verification Script
 *
 * This script verifies that your ZeroDB project is properly configured
 * and the API connection is working.
 *
 * Usage:
 *   npm run verify-zerodb
 */

const ZERODB_API_BASE = process.env.NEXT_PUBLIC_ZERODB_API_BASE || ''
const ZERODB_PROJECT_ID = process.env.NEXT_PUBLIC_ZERODB_PROJECT_ID || ''
const ZERODB_API_KEY = process.env.NEXT_PUBLIC_ZERODB_API_KEY || ''

interface VerificationResult {
  step: string
  success: boolean
  message: string
  details?: any
}

async function verifyEnvironmentVariables(): Promise<VerificationResult> {
  const requiredVars = {
    'NEXT_PUBLIC_ZERODB_API_BASE': ZERODB_API_BASE,
    'NEXT_PUBLIC_ZERODB_PROJECT_ID': ZERODB_PROJECT_ID,
    'NEXT_PUBLIC_ZERODB_API_KEY': ZERODB_API_KEY
  }

  const missing = Object.entries(requiredVars)
    .filter(([_, value]) => !value)
    .map(([key]) => key)

  if (missing.length > 0) {
    return {
      step: 'Environment Variables',
      success: false,
      message: `Missing required variables: ${missing.join(', ')}`,
      details: missing
    }
  }

  return {
    step: 'Environment Variables',
    success: true,
    message: 'All required variables are set'
  }
}

async function verifyAPIConnection(): Promise<VerificationResult> {
  try {
    // Try to list tables (this validates the connection, project ID, and API key)
    const url = `${ZERODB_API_BASE}/v1/public/${ZERODB_PROJECT_ID}/database/tables`

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': ZERODB_API_KEY
      }
    })

    if (response.ok) {
      const data = await response.json()
      return {
        step: 'API Connection',
        success: true,
        message: 'Successfully connected to ZeroDB API',
        details: {
          status: response.status,
          tables: Array.isArray(data) ? data.length : 'N/A'
        }
      }
    } else if (response.status === 401) {
      return {
        step: 'API Connection',
        success: false,
        message: 'Unauthorized - Invalid API key',
        details: { status: 401 }
      }
    } else if (response.status === 404) {
      return {
        step: 'API Connection',
        success: false,
        message: 'Project not found - Invalid project ID',
        details: { status: 404 }
      }
    } else {
      const errorText = await response.text().catch(() => 'Unknown error')
      return {
        step: 'API Connection',
        success: false,
        message: `HTTP ${response.status}: ${response.statusText}`,
        details: { status: response.status, error: errorText }
      }
    }
  } catch (error: any) {
    return {
      step: 'API Connection',
      success: false,
      message: `Network error: ${error.message}`,
      details: { error: error.message }
    }
  }
}

async function verifyProjectExists(): Promise<VerificationResult> {
  try {
    // Validate project ID format (should be a UUID)
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

    if (!uuidRegex.test(ZERODB_PROJECT_ID)) {
      return {
        step: 'Project Validation',
        success: false,
        message: 'Invalid project ID format (expected UUID)',
        details: { project_id: ZERODB_PROJECT_ID }
      }
    }

    return {
      step: 'Project Validation',
      success: true,
      message: `Project ID validated: ${ZERODB_PROJECT_ID.substring(0, 8)}...`,
      details: { project_id: ZERODB_PROJECT_ID }
    }
  } catch (error: any) {
    return {
      step: 'Project Validation',
      success: false,
      message: error.message,
      details: { error: error.message }
    }
  }
}

async function testDatabaseOperation(): Promise<VerificationResult> {
  try {
    // Try a simple operation - list tables
    const url = `${ZERODB_API_BASE}/v1/public/${ZERODB_PROJECT_ID}/database/tables`

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': ZERODB_API_KEY
      }
    })

    if (response.ok) {
      const tables = await response.json()
      const tableCount = Array.isArray(tables) ? tables.length : 0

      return {
        step: 'Database Operations',
        success: true,
        message: `Database features working (${tableCount} tables found)`,
        details: {
          table_count: tableCount,
          tables: Array.isArray(tables) ? tables : []
        }
      }
    } else {
      return {
        step: 'Database Operations',
        success: false,
        message: 'Database features may not be enabled',
        details: { status: response.status }
      }
    }
  } catch (error: any) {
    return {
      step: 'Database Operations',
      success: false,
      message: error.message,
      details: { error: error.message }
    }
  }
}

async function main() {
  console.log('🔍 Verifying ZeroDB Connection...\n')
  console.log('=' .repeat(60))

  const results: VerificationResult[] = []

  // Step 1: Verify environment variables
  console.log('\n📋 Step 1: Checking environment variables...')
  const envResult = await verifyEnvironmentVariables()
  results.push(envResult)

  if (envResult.success) {
    console.log('✅', envResult.message)
  } else {
    console.error('❌', envResult.message)
    if (envResult.details) {
      console.error('   Missing:', envResult.details.join(', '))
    }
    console.error('\n❌ Setup incomplete. Please configure .env.local file.')
    console.error('   See ZERODB_SETUP.md for instructions.\n')
    process.exit(1)
  }

  // Step 2: Verify project ID format
  console.log('\n🔑 Step 2: Validating project ID...')
  const projectResult = await verifyProjectExists()
  results.push(projectResult)

  if (projectResult.success) {
    console.log('✅', projectResult.message)
  } else {
    console.error('❌', projectResult.message)
    console.error('\n❌ Invalid project ID. Please check your .env.local file.\n')
    process.exit(1)
  }

  // Step 3: Test API connection
  console.log('\n🌐 Step 3: Testing API connection...')
  const apiResult = await verifyAPIConnection()
  results.push(apiResult)

  if (apiResult.success) {
    console.log('✅', apiResult.message)
    if (apiResult.details?.tables !== undefined) {
      console.log(`   Found ${apiResult.details.tables} existing tables`)
    }
  } else {
    console.error('❌', apiResult.message)
    console.error('\n❌ Connection failed. Please check:')
    console.error('   - API base URL is correct')
    console.error('   - API key is valid')
    console.error('   - Project exists and is active')
    console.error('   - Network connection is working\n')
    process.exit(1)
  }

  // Step 4: Test database operations
  console.log('\n💾 Step 4: Testing database operations...')
  const dbResult = await testDatabaseOperation()
  results.push(dbResult)

  if (dbResult.success) {
    console.log('✅', dbResult.message)
  } else {
    console.error('⚠️ ', dbResult.message)
    console.error('   Note: This may be expected if tables haven\'t been created yet')
  }

  // Summary
  console.log('\n' + '='.repeat(60))
  const successCount = results.filter(r => r.success).length
  const totalCount = results.length

  if (successCount === totalCount) {
    console.log('\n✅ All verification checks passed!')
    console.log('\n🎉 ZeroDB connection is properly configured!')

    if (dbResult.details?.table_count === 0) {
      console.log('\n📝 Next step: Create database tables')
      console.log('   Run: npm run setup-db')
    } else if (dbResult.details?.table_count > 0 && dbResult.details?.table_count < 10) {
      console.log('\n⚠️  Warning: Expected 10 tables, found', dbResult.details.table_count)
      console.log('   Run: npm run setup-db verify')
    } else {
      console.log('\n✅ All systems ready!')
      console.log('   Start development: npm run dev')
    }
  } else {
    console.log(`\n⚠️  ${successCount}/${totalCount} checks passed`)
    console.log('\n❌ Some checks failed. Please review errors above.')
    process.exit(1)
  }

  console.log('\n' + '='.repeat(60))
  console.log('')
}

main().catch(error => {
  console.error('\n❌ Unexpected error during verification:', error.message)
  console.error(error)
  process.exit(1)
})
