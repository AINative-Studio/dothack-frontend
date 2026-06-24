import { chromium } from 'playwright';

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext();
const page = await context.newPage();

const results = [];
function log(test, status, detail = '') {
  results.push({ test, status, detail });
  console.log(`${status === 'PASS' ? '✓' : '✗'} ${test}${detail ? ' - ' + detail : ''}`);
}

console.log('=== MARKETING PAGES ===');
for (const [name, path] of [
  ['Landing', '/'], ['Features', '/features'], ['Pricing', '/pricing'],
  ['Docs', '/docs'], ['Contact', '/contact'], ['Privacy', '/privacy'], ['Terms', '/terms'],
]) {
  try {
    const res = await page.goto(`http://localhost:3000${path}`, { waitUntil: 'domcontentloaded', timeout: 10000 });
    log(name, res.status() === 200 ? 'PASS' : 'FAIL', `${res.status()}`);
  } catch (e) { log(name, 'FAIL', e.message.slice(0, 80)); }
}

console.log('\n=== AUTH PAGES ===');
for (const [name, path] of [['Login', '/login'], ['Signup', '/signup']]) {
  try {
    const res = await page.goto(`http://localhost:3000${path}`, { waitUntil: 'domcontentloaded', timeout: 10000 });
    log(name, res.status() === 200 ? 'PASS' : 'FAIL', `${res.status()}`);
  } catch (e) { log(name, 'FAIL', e.message.slice(0, 80)); }
}

console.log('\n=== API KEY LOGIN ===');
await page.goto('http://localhost:3000/login', { waitUntil: 'networkidle', timeout: 15000 });
await page.waitForTimeout(1000);
// Click API KEY tab - try multiple selectors
const apiTab = page.locator('button', { hasText: /api key/i });
if (await apiTab.count() > 0) {
  await apiTab.first().click();
  await page.waitForTimeout(500);
}
// Find the API key input
const apiInput = page.locator('input[id="login-apikey"], input[placeholder*="API"], input[placeholder*="api"], input[type="text"][autocomplete="off"]');
if (await apiInput.count() > 0) {
  await apiInput.first().fill('sk_nLI6DrYP9h7qrac9t876Wj4e3iV-zsk5YXUv0S-ttkM');
  await page.click('button[type="submit"]');
  await page.waitForTimeout(5000);
  log('API Key Login', page.url().includes('/hackathons') ? 'PASS' : 'FAIL', page.url());
} else {
  log('API Key Login', 'FAIL', 'Could not find API key input');
}

console.log('\n=== AUTHENTICATED PAGES ===');
for (const [name, path] of [
  ['Dashboard', '/hackathons'], ['API Settings', '/api-settings'],
  ['Featured', '/featured'], ['Themes', '/themes'],
]) {
  try {
    const res = await page.goto(`http://localhost:3000${path}`, { waitUntil: 'domcontentloaded', timeout: 15000 });
    await page.waitForTimeout(1500);
    const finalUrl = page.url();
    const passed = res.status() === 200 && !finalUrl.includes('/login');
    log(name, passed ? 'PASS' : 'FAIL', `${res.status()} ${finalUrl}`);
  } catch (e) { log(name, 'FAIL', e.message.slice(0, 80)); }
}

console.log('\n=== BACKEND API ===');
try {
  const res = await (await fetch('https://dothack.ainative.studio/health')).json();
  log('Backend Health', res.status === 'healthy' ? 'PASS' : 'FAIL', res.status);
} catch (e) { log('Backend Health', 'FAIL', e.message.slice(0, 60)); }

try {
  const spec = await (await fetch('https://dothack.ainative.studio/openapi.json')).json();
  log('OpenAPI Spec', Object.keys(spec.paths).length >= 60 ? 'PASS' : 'FAIL', `${Object.keys(spec.paths).length} endpoints`);
} catch (e) { log('OpenAPI Spec', 'FAIL', e.message.slice(0, 60)); }

console.log('\n=== SUMMARY ===');
const passed = results.filter(r => r.status === 'PASS').length;
const failed = results.filter(r => r.status === 'FAIL').length;
console.log(`${passed} PASSED, ${failed} FAILED out of ${results.length} tests`);

await browser.close();
process.exit(failed > 0 ? 1 : 0);
