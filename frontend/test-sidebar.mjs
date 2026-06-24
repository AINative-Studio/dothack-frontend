import { chromium } from 'playwright';
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();

// Login first
await page.goto('http://localhost:3000/login', { waitUntil: 'networkidle', timeout: 15000 });
await page.waitForTimeout(1000);
const tabs = await page.locator('button').all();
for (const t of tabs) { const txt = await t.textContent(); if (txt?.match(/api key/i)) { await t.click(); break; } }
await page.waitForTimeout(300);
const inputs = await page.locator('input:visible').all();
for (const inp of inputs) { const ac = await inp.getAttribute('autocomplete'); if (ac === 'off') { await inp.fill('sk_nLI6DrYP9h7qrac9t876Wj4e3iV-zsk5YXUv0S-ttkM'); break; } }
await page.click('button[type="submit"]');
await page.waitForTimeout(5000);
console.log('Login:', page.url().includes('/hackathons') ? 'OK' : 'FAILED');

// Now test every sidebar route
const routes = [
  ['/hackathons', 'Dashboard'],
  ['/participants', 'Participants'],
  ['/submissions', 'Submissions'],
  ['/judging', 'Judging'],
  ['/leaderboard', 'Leaderboard'],
  ['/prizes', 'Prizes'],
  ['/recommendations', 'AI Recommendations'],
  ['/search', 'Semantic Search'],
  ['/api-settings', 'API Keys'],
  ['/payments', 'Payments'],
  ['/featured', 'Featured'],
  ['/themes', 'Themes'],
];

console.log('\n=== SIDEBAR MENU TEST ===');
let passed = 0, failed = 0;
for (const [path, name] of routes) {
  try {
    const res = await page.goto(`http://localhost:3000${path}`, { waitUntil: 'domcontentloaded', timeout: 10000 });
    await page.waitForTimeout(1500);
    const url = page.url();
    const status = res.status();
    const body = await page.textContent('body');
    const hasContent = body && body.trim().length > 100;
    const redirectedToLogin = url.includes('/login');
    
    if (status === 200 && hasContent && !redirectedToLogin) {
      console.log(`  ✓ ${name} (${path}) -> ${status} OK`);
      passed++;
    } else {
      console.log(`  ✗ ${name} (${path}) -> ${status} ${redirectedToLogin ? 'REDIRECT TO LOGIN' : 'FAILED'}`);
      failed++;
    }
  } catch (e) {
    console.log(`  ✗ ${name} (${path}) -> ERROR: ${e.message.slice(0, 60)}`);
    failed++;
  }
}

console.log(`\n${passed} PASSED, ${failed} FAILED out of ${routes.length}`);
await browser.close();
