import { test, expect } from '@playwright/test'

/**
 * E2E tests that verify frontend pages load and make API calls
 * to the CORRECT backend paths (not 404s).
 *
 * We intercept network requests and check:
 * 1. Pages load without crashes
 * 2. API calls go to correct URLs (no /api/v1 duplication, correct prefixes)
 * 3. Backend returns non-404 status codes
 */

const BACKEND = 'https://dothack.ainative.studio'

// Helper: collect all API requests made during page load
async function collectApiRequests(page: any, url: string, waitMs = 3000) {
  const requests: { url: string; status: number; method: string }[] = []

  page.on('response', (response: any) => {
    const reqUrl = response.url()
    if (reqUrl.startsWith(BACKEND)) {
      requests.push({
        url: reqUrl,
        status: response.status(),
        method: response.request().method(),
      })
    }
  })

  await page.goto(url, { waitUntil: 'networkidle', timeout: 15000 }).catch(() => {
    // Some pages may not fully settle, that's ok
  })
  // Wait for any lazy API calls
  await page.waitForTimeout(waitMs)

  return requests
}

// Helper: check that no requests got 404
function assertNo404s(requests: { url: string; status: number; method: string }[], pageName: string) {
  const notFound = requests.filter(r => r.status === 404)
  if (notFound.length > 0) {
    const details = notFound.map(r => `  ${r.method} ${r.url} -> 404`).join('\n')
    throw new Error(`${pageName}: Found ${notFound.length} 404 API calls:\n${details}`)
  }
}

// ---- LOGIN FIRST ----
// We need to be logged in for most pages. We'll set the auth token via localStorage.

test.describe('Page loads and API path verification', () => {

  test.beforeEach(async ({ page }) => {
    // Navigate to login page first to set auth cookies/storage
    await page.goto('/login', { waitUntil: 'domcontentloaded', timeout: 10000 })

    // Set auth tokens in localStorage so pages think we're logged in
    await page.evaluate(() => {
      localStorage.setItem('dothack_access_token', 'test-playwright-token')
      localStorage.setItem('dothack_user', JSON.stringify({
        id: 'playwright-test-user',
        email: 'test@playwright.dev',
        name: 'Playwright Test',
      }))
      localStorage.setItem('auth_token', 'test-playwright-token')
      localStorage.setItem('auth_user', JSON.stringify({
        id: 'playwright-test-user',
        email: 'test@playwright.dev',
      }))
    })
    // Set auth cookie
    await page.context().addCookies([{
      name: 'auth_token',
      value: 'test-playwright-token',
      domain: 'hack.ainative.studio',
      path: '/',
    }])
  })

  test('Login page loads', async ({ page }) => {
    // Clear auth so we actually see the login page
    await page.context().clearCookies()
    await page.goto('/login', { waitUntil: 'domcontentloaded' })
    // Page should load without crashing
    await expect(page.locator('body')).not.toBeEmpty()
  })

  test('Hackathons page - no 404s', async ({ page }) => {
    const requests = await collectApiRequests(page, '/hackathons')
    assertNo404s(requests, 'Hackathons')
    // Page should have rendered something
    await expect(page.locator('body')).not.toBeEmpty()
  })

  test('Participants page - no 404s', async ({ page }) => {
    const requests = await collectApiRequests(page, '/participants')
    assertNo404s(requests, 'Participants')
  })

  test('Submissions page - no 404s', async ({ page }) => {
    const requests = await collectApiRequests(page, '/submissions')
    assertNo404s(requests, 'Submissions')
    // Verify submissions calls use /v1/submissions (not /api/v1/v1/submissions)
    const submissionCalls = requests.filter(r => r.url.includes('submissions'))
    for (const call of submissionCalls) {
      expect(call.url).not.toContain('/api/v1/v1/')
    }
  })

  test('Judging page - no 404s, correct path', async ({ page }) => {
    const requests = await collectApiRequests(page, '/judging')
    assertNo404s(requests, 'Judging')
    // Verify judging calls do NOT have /api/v1/judging (should be /judging/)
    const judgingCalls = requests.filter(r => r.url.includes('judging'))
    for (const call of judgingCalls) {
      expect(call.url).not.toContain('/api/v1/judging')
      // Should be like https://dothack.ainative.studio/judging/...
    }
  })

  test('Leaderboard page - no 404s', async ({ page }) => {
    const requests = await collectApiRequests(page, '/leaderboard')
    assertNo404s(requests, 'Leaderboard')
  })

  test('Prizes page - no 404s', async ({ page }) => {
    const requests = await collectApiRequests(page, '/prizes')
    assertNo404s(requests, 'Prizes')
  })

  test('Search page - no 404s', async ({ page }) => {
    const requests = await collectApiRequests(page, '/search')
    assertNo404s(requests, 'Search')
  })

  test('Recommendations page - no 404s', async ({ page }) => {
    const requests = await collectApiRequests(page, '/recommendations')
    assertNo404s(requests, 'Recommendations')
  })

  test('API Settings page loads', async ({ page }) => {
    await page.goto('/api-settings', { waitUntil: 'domcontentloaded' })
    // Page should load without crashing
    await expect(page.locator('body')).not.toBeEmpty()
  })

  test('Payments page loads', async ({ page }) => {
    await page.goto('/payments', { waitUntil: 'domcontentloaded' })
    await expect(page.locator('body')).not.toBeEmpty()
  })

  test('Featured page - no 404s', async ({ page }) => {
    const requests = await collectApiRequests(page, '/featured')
    assertNo404s(requests, 'Featured')
  })

  test('Themes page - no 404s', async ({ page }) => {
    const requests = await collectApiRequests(page, '/themes')
    assertNo404s(requests, 'Themes')
  })

  // Test a specific hackathon detail page
  test('Hackathon detail page - no 404s', async ({ page }) => {
    const hackathonId = '1b919b8e-cc3f-4437-986a-938169f3500d'
    const requests = await collectApiRequests(page, `/hackathons/${hackathonId}`)
    assertNo404s(requests, 'Hackathon Detail')
  })

  test('Hackathon participants sub-page - no 404s', async ({ page }) => {
    const hackathonId = '1b919b8e-cc3f-4437-986a-938169f3500d'
    const requests = await collectApiRequests(page, `/hackathons/${hackathonId}/participants`)
    assertNo404s(requests, 'Hackathon Participants')
    // Verify participants endpoint returns 200, not 500
    const participantCalls = requests.filter(r => r.url.includes('participants'))
    for (const call of participantCalls) {
      expect(call.status).not.toBe(500)
    }
  })

  test('Hackathon submissions sub-page - no 404s', async ({ page }) => {
    const hackathonId = '1b919b8e-cc3f-4437-986a-938169f3500d'
    const requests = await collectApiRequests(page, `/hackathons/${hackathonId}/submissions`)
    assertNo404s(requests, 'Hackathon Submissions')
  })

  test('Hackathon judging sub-page - no 404s', async ({ page }) => {
    const hackathonId = '1b919b8e-cc3f-4437-986a-938169f3500d'
    const requests = await collectApiRequests(page, `/hackathons/${hackathonId}/judging`)
    assertNo404s(requests, 'Hackathon Judging')
  })

  test('Hackathon projects sub-page - no 404s', async ({ page }) => {
    const hackathonId = '1b919b8e-cc3f-4437-986a-938169f3500d'
    const requests = await collectApiRequests(page, `/hackathons/${hackathonId}/projects`)
    assertNo404s(requests, 'Hackathon Projects')
    // Verify projects calls use /v1/hackathons (not /api/v1/v1/hackathons)
    const projectCalls = requests.filter(r => r.url.includes('projects'))
    for (const call of projectCalls) {
      expect(call.url).not.toContain('/api/v1/v1/')
    }
  })

  test('Hackathon prizes sub-page - no 404s', async ({ page }) => {
    const hackathonId = '1b919b8e-cc3f-4437-986a-938169f3500d'
    const requests = await collectApiRequests(page, `/hackathons/${hackathonId}/prizes`)
    assertNo404s(requests, 'Hackathon Prizes')
  })

  test('Hackathon teams sub-page - no 404s', async ({ page }) => {
    const hackathonId = '1b919b8e-cc3f-4437-986a-938169f3500d'
    const requests = await collectApiRequests(page, `/hackathons/${hackathonId}/teams`)
    assertNo404s(requests, 'Hackathon Teams')
  })

  test('Hackathon leaderboard sub-page - no 404s', async ({ page }) => {
    const hackathonId = '1b919b8e-cc3f-4437-986a-938169f3500d'
    const requests = await collectApiRequests(page, `/hackathons/${hackathonId}/leaderboard`)
    assertNo404s(requests, 'Hackathon Leaderboard')
    // leaderboard results calls should go to /judging/hackathons/*/results (not /api/v1/judging)
    const judgingCalls = requests.filter(r => r.url.includes('judging'))
    for (const call of judgingCalls) {
      expect(call.url).not.toContain('/api/v1/judging')
    }
  })
})

test.describe('API path format verification', () => {
  test('No API calls should have double /v1/v1 in the path', async ({ page }) => {
    // Set auth
    await page.goto('/login', { waitUntil: 'domcontentloaded', timeout: 10000 })
    await page.evaluate(() => {
      localStorage.setItem('dothack_access_token', 'test-token')
      localStorage.setItem('auth_token', 'test-token')
      localStorage.setItem('dothack_user', JSON.stringify({ id: 'test', email: 'test@test.com' }))
    })
    await page.context().addCookies([{
      name: 'auth_token', value: 'test-token',
      domain: 'hack.ainative.studio', path: '/',
    }])

    const badRequests: string[] = []
    page.on('response', (response: any) => {
      const url = response.url()
      if (url.includes('/api/v1/v1/') || url.includes('/api/v1/judging') || url.includes('/api/v1/teams')) {
        badRequests.push(url)
      }
    })

    // Visit several pages
    for (const path of ['/hackathons', '/judging', '/submissions', '/participants']) {
      await page.goto(path, { waitUntil: 'domcontentloaded', timeout: 10000 }).catch(() => {})
      await page.waitForTimeout(2000)
    }

    if (badRequests.length > 0) {
      throw new Error(`Found ${badRequests.length} API calls with wrong prefix:\n${badRequests.join('\n')}`)
    }
  })
})
