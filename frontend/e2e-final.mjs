import { chromium } from 'playwright';

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();
let passed = 0, failed = 0;

function check(name, ok) {
  if (ok) { console.log(`✓ ${name}`); passed++; }
  else { console.log(`✗ ${name}`); failed++; }
}

// === MARKETING PAGES ===
console.log('=== MARKETING ===');
for (const [name, path] of [['Landing','/'],['Features','/features'],['Pricing','/pricing'],['Login','/login'],['Signup','/signup'],['Docs','/docs'],['Contact','/contact']]) {
  const res = await page.goto(`http://localhost:3000${path}`, { waitUntil: 'domcontentloaded', timeout: 10000 });
  check(name, res.status() === 200);
}

// === LOGIN ===
console.log('\n=== LOGIN ===');
await page.goto('http://localhost:3000/login', { waitUntil: 'networkidle', timeout: 15000 });
await page.waitForTimeout(1500);

// Click API KEY tab
const apiTab = page.locator('button', { hasText: /api key/i });
if (await apiTab.count() > 0) await apiTab.first().click();
await page.waitForTimeout(500);

// Fill key
const inputs = await page.locator('input:visible').all();
for (const inp of inputs) {
  const ac = await inp.getAttribute('autocomplete');
  const type = await inp.getAttribute('type');
  if (ac === 'off' || (type === 'text' && !(await inp.getAttribute('id'))?.includes('email'))) {
    await inp.fill('sk_nLI6DrYP9h7qrac9t876Wj4e3iV-zsk5YXUv0S-ttkM');
    break;
  }
}

await page.click('button[type="submit"]');
await page.waitForTimeout(5000);
check('API Key Login → /hackathons', page.url().includes('/hackathons'));

// === AUTHENTICATED PAGES ===
console.log('\n=== APP PAGES ===');
for (const [name, path] of [
  ['Dashboard','/hackathons'],['Participants','/participants'],['Submissions','/submissions'],
  ['Judging','/judging'],['Leaderboard','/leaderboard'],['Prizes','/prizes'],
  ['Recommendations','/recommendations'],['Search','/search'],
  ['API Keys','/api-settings'],['Payments','/payments'],['Featured','/featured'],['Themes','/themes']
]) {
  const res = await page.goto(`http://localhost:3000${path}`, { waitUntil: 'domcontentloaded', timeout: 10000 });
  await page.waitForTimeout(1000);
  const notRedirected = !page.url().includes('/login');
  check(`${name} (${path})`, res.status() === 200 && notRedirected);
}

// === BACKEND ===
console.log('\n=== BACKEND ===');
const health = await (await fetch('https://dothack.ainative.studio/health')).json();
check('Backend Health', health.status === 'healthy');

console.log(`\n=== ${passed} PASSED, ${failed} FAILED ===`);
await browser.close();
process.exit(failed > 0 ? 1 : 0);
