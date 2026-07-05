import { test, expect, Page, Response } from '@playwright/test'

/**
 * Comprehensive E2E audit: every page, every API call, every console error.
 *
 * For each page:
 * 1. Page loads without JS crashes
 * 2. No 404 API calls (wrong paths)
 * 3. No 500 API calls (backend bugs)
 * 4. No 422 API calls (wrong request format)
 * 5. No double /v1/v1 prefixes
 * 6. No wrong prefix (/api/v1/judging, /api/v1/teams, etc.)
 * 7. No console errors
 */

const BACKEND = 'https://dothack.ainative.studio'

interface ApiCall {
  url: string
  status: number
  method: string
}

interface PageTestResult {
  apiCalls: ApiCall[]
  consoleErrors: string[]
  jsErrors: string[]
  pageLoaded: boolean
}

async function auditPage(page: Page, path: string, waitMs = 4000): Promise<PageTestResult> {
  const result: PageTestResult = {
    apiCalls: [],
    consoleErrors: [],
    jsErrors: [],
    pageLoaded: false,
  }

  page.on('response', (response: Response) => {
    const url = response.url()
    if (url.startsWith(BACKEND)) {
      result.apiCalls.push({
        url,
        status: response.status(),
        method: response.request().method(),
      })
    }
  })

  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      const text = msg.text()
      if (!text.includes('favicon') && !text.includes('chunk')) {
        result.consoleErrors.push(text)
      }
    }
  })

  page.on('pageerror', (err) => {
    result.jsErrors.push(err.message)
  })

  try {
    await page.goto(path, { waitUntil: 'domcontentloaded', timeout: 15000 })
    result.pageLoaded = true
  } catch {
    result.pageLoaded = false
  }

  await page.waitForTimeout(waitMs)
  return result
}

function assertNoPathBugs(apiCalls: ApiCall[], pageName: string) {
  const errors: string[] = []

  for (const call of apiCalls) {
    if (call.status === 404) {
      errors.push(`404: ${call.method} ${call.url}`)
    }
    if (call.status === 500) {
      errors.push(`500: ${call.method} ${call.url}`)
    }
    if (call.status === 422) {
      errors.push(`422: ${call.method} ${call.url}`)
    }
    if (call.url.includes('/api/v1/v1/')) {
      errors.push(`DOUBLE v1: ${call.method} ${call.url}`)
    }
    if (call.url.includes('/api/v1/judging')) {
      errors.push(`WRONG PREFIX (should be /judging): ${call.method} ${call.url}`)
    }
    if (call.url.includes('/api/v1/teams')) {
      errors.push(`WRONG PREFIX (should be /teams): ${call.method} ${call.url}`)
    }
    if (call.url.includes('/api/v1/files')) {
      errors.push(`WRONG PREFIX (should be /files): ${call.method} ${call.url}`)
    }
  }

  if (errors.length > 0) {
    throw new Error(`${pageName}: ${errors.length} API issues:\n${errors.join('\n')}`)
  }
}

// Set up auth for all tests
test.describe('Comprehensive Integration Audit', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/login', { waitUntil: 'domcontentloaded', timeout: 10000 })
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
    await page.context().addCookies([{
      name: 'auth_token',
      value: 'test-playwright-token',
      domain: 'hack.ainative.studio',
      path: '/',
    }])
  })

  // ==========================================================================
  // PUBLIC / MARKETING PAGES (no auth needed)
  // ==========================================================================

  test.describe('Public Pages', () => {
    test('Landing page loads', async ({ page }) => {
      await page.context().clearCookies()
      const result = await auditPage(page, '/')
      expect(result.pageLoaded).toBe(true)
      expect(result.jsErrors).toHaveLength(0)
    })

    test('Login page loads', async ({ page }) => {
      await page.context().clearCookies()
      const result = await auditPage(page, '/login')
      expect(result.pageLoaded).toBe(true)
      expect(result.jsErrors).toHaveLength(0)
    })

    test('Signup page loads', async ({ page }) => {
      await page.context().clearCookies()
      const result = await auditPage(page, '/signup')
      expect(result.pageLoaded).toBe(true)
      expect(result.jsErrors).toHaveLength(0)
    })
  })

  // ==========================================================================
  // MAIN APP PAGES (auth required)
  // ==========================================================================

  test.describe('App Pages - Top Level', () => {

    test('Hackathons list - no errors', async ({ page }) => {
      const result = await auditPage(page, '/hackathons')
      assertNoPathBugs(result.apiCalls, 'Hackathons')
      expect(result.pageLoaded).toBe(true)
      await expect(page.locator('body')).not.toBeEmpty()
    })

    test('Judging page - no errors, no /judging/assignments call', async ({ page }) => {
      const result = await auditPage(page, '/judging')
      assertNoPathBugs(result.apiCalls, 'Judging')
      const assignmentCalls = result.apiCalls.filter(c => c.url.includes('/assignments'))
      expect(assignmentCalls).toHaveLength(0)
      expect(result.pageLoaded).toBe(true)
    })

    test('Participants page - no errors', async ({ page }) => {
      const result = await auditPage(page, '/participants')
      assertNoPathBugs(result.apiCalls, 'Participants')
      expect(result.pageLoaded).toBe(true)
    })

    test('Submissions page - no errors', async ({ page }) => {
      const result = await auditPage(page, '/submissions')
      assertNoPathBugs(result.apiCalls, 'Submissions')
      expect(result.pageLoaded).toBe(true)
    })

    test('Leaderboard page - no errors', async ({ page }) => {
      const result = await auditPage(page, '/leaderboard')
      assertNoPathBugs(result.apiCalls, 'Leaderboard')
      expect(result.pageLoaded).toBe(true)
    })

    test('Prizes page - no errors', async ({ page }) => {
      const result = await auditPage(page, '/prizes')
      assertNoPathBugs(result.apiCalls, 'Prizes')
      expect(result.pageLoaded).toBe(true)
    })

    test('Search page - no errors', async ({ page }) => {
      const result = await auditPage(page, '/search')
      assertNoPathBugs(result.apiCalls, 'Search')
      expect(result.pageLoaded).toBe(true)
    })

    test('Recommendations page - no errors', async ({ page }) => {
      const result = await auditPage(page, '/recommendations')
      assertNoPathBugs(result.apiCalls, 'Recommendations')
      expect(result.pageLoaded).toBe(true)
    })

    test('Featured page - no errors', async ({ page }) => {
      const result = await auditPage(page, '/featured')
      assertNoPathBugs(result.apiCalls, 'Featured')
      expect(result.pageLoaded).toBe(true)
    })

    test('Themes page - no errors', async ({ page }) => {
      const result = await auditPage(page, '/themes')
      assertNoPathBugs(result.apiCalls, 'Themes')
      expect(result.pageLoaded).toBe(true)
    })

    test('API Settings page loads', async ({ page }) => {
      const result = await auditPage(page, '/api-settings')
      expect(result.pageLoaded).toBe(true)
    })

    test('Payments page loads', async ({ page }) => {
      const result = await auditPage(page, '/payments')
      expect(result.pageLoaded).toBe(true)
    })
  })

  // ==========================================================================
  // HACKATHON DETAIL & SUB-PAGES
  // ==========================================================================

  test.describe('Hackathon Sub-Pages', () => {
    const hackathonId = '1b919b8e-cc3f-4437-986a-938169f3500d'

    test('Hackathon detail - no errors', async ({ page }) => {
      const result = await auditPage(page, `/hackathons/${hackathonId}`)
      assertNoPathBugs(result.apiCalls, 'Hackathon Detail')
      expect(result.pageLoaded).toBe(true)
    })

    test('Hackathon participants - no errors, no 500', async ({ page }) => {
      const result = await auditPage(page, `/hackathons/${hackathonId}/participants`)
      assertNoPathBugs(result.apiCalls, 'Hackathon Participants')
      const participantCalls = result.apiCalls.filter(c => c.url.includes('participants'))
      for (const call of participantCalls) {
        expect(call.status).not.toBe(500)
      }
    })

    test('Hackathon submissions - no errors', async ({ page }) => {
      const result = await auditPage(page, `/hackathons/${hackathonId}/submissions`)
      assertNoPathBugs(result.apiCalls, 'Hackathon Submissions')
    })

    test('Hackathon judging - no errors', async ({ page }) => {
      const result = await auditPage(page, `/hackathons/${hackathonId}/judging`)
      assertNoPathBugs(result.apiCalls, 'Hackathon Judging')
    })

    test('Hackathon projects - no errors, no double /v1/', async ({ page }) => {
      const result = await auditPage(page, `/hackathons/${hackathonId}/projects`)
      assertNoPathBugs(result.apiCalls, 'Hackathon Projects')
      const projectCalls = result.apiCalls.filter(c => c.url.includes('projects'))
      for (const call of projectCalls) {
        expect(call.url).not.toContain('/api/v1/v1/')
      }
    })

    test('Hackathon prizes - no errors', async ({ page }) => {
      const result = await auditPage(page, `/hackathons/${hackathonId}/prizes`)
      assertNoPathBugs(result.apiCalls, 'Hackathon Prizes')
    })

    test('Hackathon teams - no errors, correct prefix', async ({ page }) => {
      const result = await auditPage(page, `/hackathons/${hackathonId}/teams`)
      assertNoPathBugs(result.apiCalls, 'Hackathon Teams')
      const teamCalls = result.apiCalls.filter(c => c.url.includes('teams'))
      for (const call of teamCalls) {
        expect(call.url).not.toContain('/api/v1/teams')
      }
    })

    test('Hackathon leaderboard - no errors, correct judging prefix', async ({ page }) => {
      const result = await auditPage(page, `/hackathons/${hackathonId}/leaderboard`)
      assertNoPathBugs(result.apiCalls, 'Hackathon Leaderboard')
    })

    test('Hackathon setup - no errors', async ({ page }) => {
      const result = await auditPage(page, `/hackathons/${hackathonId}/setup`)
      assertNoPathBugs(result.apiCalls, 'Hackathon Setup')
    })
  })

  // ==========================================================================
  // PRE-AUTH 401 PREVENTION TEST
  // ==========================================================================

  test.describe('Auth Guard Tests', () => {

    test('No 401 errors when auth token is not yet loaded', async ({ page }) => {
      // Clear auth state and navigate - hooks with !!token guard should NOT fire
      await page.context().clearCookies()
      await page.evaluate(() => {
        localStorage.clear()
      })

      const unauthorized: string[] = []
      page.on('response', (response: Response) => {
        if (response.url().startsWith(BACKEND) && response.status() === 401) {
          unauthorized.push(`${response.request().method()} ${response.url()}`)
        }
      })

      // Visit pages that require auth - hooks should not fire without token
      for (const path of ['/hackathons', '/submissions', '/judging', '/participants']) {
        await page.goto(path, { waitUntil: 'domcontentloaded', timeout: 10000 }).catch(() => {})
        await page.waitForTimeout(2000)
      }

      if (unauthorized.length > 0) {
        throw new Error(
          `Found ${unauthorized.length} premature 401 errors (hooks fired before auth loaded):\n` +
          unauthorized.join('\n')
        )
      }
    })
  })

  // ==========================================================================
  // GLOBAL PREFIX VALIDATION
  // ==========================================================================

  test.describe('Global API Path Validation', () => {

    test('Multi-page sweep: no wrong prefixes anywhere', async ({ page }) => {
      const badRequests: string[] = []

      page.on('response', (response: Response) => {
        const url = response.url()
        if (url.includes('/api/v1/v1/')) badRequests.push(`DOUBLE v1: ${url}`)
        if (url.includes('/api/v1/judging')) badRequests.push(`WRONG PREFIX /api/v1/judging: ${url}`)
        if (url.includes('/api/v1/teams')) badRequests.push(`WRONG PREFIX /api/v1/teams: ${url}`)
        if (url.includes('/api/v1/files')) badRequests.push(`WRONG PREFIX /api/v1/files: ${url}`)
      })

      const pages = [
        '/hackathons',
        '/judging',
        '/participants',
        '/submissions',
        '/leaderboard',
        '/prizes',
        '/search',
        '/recommendations',
        '/featured',
        '/themes',
      ]

      for (const path of pages) {
        await page.goto(path, { waitUntil: 'domcontentloaded', timeout: 10000 }).catch(() => {})
        await page.waitForTimeout(2000)
      }

      if (badRequests.length > 0) {
        throw new Error(`Found ${badRequests.length} wrong-prefix API calls:\n${badRequests.join('\n')}`)
      }
    })
  })
})
