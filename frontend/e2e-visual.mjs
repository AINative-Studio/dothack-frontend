import { chromium } from 'playwright';

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();

page.on('pageerror', err => console.log(`PAGE ERROR on ${page.url()}: ${err.message}`));
page.on('console', msg => {
  if (msg.type() === 'error' && !msg.text().includes('metadataBase') && !msg.text().includes('Browserslist'))
    console.log(`CONSOLE ERROR: ${msg.text().slice(0, 120)}`);
});

const pages = [
  ['landing', '/'],
  ['features', '/features'],
  ['pricing', '/pricing'],
  ['login', '/login'],
  ['signup', '/signup'],
];

for (const [name, path] of pages) {
  try {
    await page.goto(`http://localhost:3000${path}`, { waitUntil: 'networkidle', timeout: 15000 });
    await page.waitForTimeout(1000);
    // Check if page has meaningful content (not blank)
    const bodyText = await page.textContent('body');
    const hasContent = bodyText && bodyText.trim().length > 50;
    await page.screenshot({ path: `/tmp/dothack-screenshots/verify-${name}.png` });
    console.log(`${hasContent ? '✓' : '✗'} ${name} - ${hasContent ? 'content loaded' : 'BLANK/EMPTY'} (${bodyText?.trim().length || 0} chars)`);
  } catch (e) {
    console.log(`✗ ${name} - ERROR: ${e.message.slice(0, 80)}`);
  }
}

// Now test login flow
console.log('\n=== LOGIN FLOW ===');
await page.goto('http://localhost:3000/login', { waitUntil: 'networkidle', timeout: 15000 });
await page.waitForTimeout(1000);

// Click API KEY tab
const tabs = await page.locator('button').all();
for (const tab of tabs) {
  const text = await tab.textContent();
  if (text && text.toLowerCase().includes('api key')) {
    await tab.click();
    break;
  }
}
await page.waitForTimeout(500);

// Find and fill API key input
const inputs = await page.locator('input').all();
for (const input of inputs) {
  const type = await input.getAttribute('type');
  const placeholder = await input.getAttribute('placeholder') || '';
  const autocomplete = await input.getAttribute('autocomplete') || '';
  if (type === 'text' && autocomplete === 'off') {
    await input.fill('kLPiP0bzgKJ0CnNYVt1wq3qxbs2QgDeF2XwyUnxBEOM');
    console.log('Filled API key input');
    break;
  }
}

await page.screenshot({ path: '/tmp/dothack-screenshots/verify-login-filled.png' });

// Submit
await page.click('button[type="submit"]');
await page.waitForTimeout(6000);

await page.screenshot({ path: '/tmp/dothack-screenshots/verify-after-login.png' });
console.log(`After login URL: ${page.url()}`);
console.log(page.url().includes('/hackathons') ? '✓ LOGIN SUCCESS' : '✗ LOGIN FAILED');

// If logged in, test dashboard pages
if (page.url().includes('/hackathons')) {
  for (const [name, path] of [
    ['dashboard', '/hackathons'],
    ['featured', '/featured'],
    ['themes', '/themes'],
  ]) {
    await page.goto(`http://localhost:3000${path}`, { waitUntil: 'domcontentloaded', timeout: 15000 });
    await page.waitForTimeout(2000);
    await page.screenshot({ path: `/tmp/dothack-screenshots/verify-${name}.png` });
    const bodyText = await page.textContent('body');
    console.log(`${bodyText.length > 50 ? '✓' : '✗'} ${name} - ${bodyText.trim().length} chars`);
  }
}

await browser.close();
