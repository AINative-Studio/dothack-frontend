import { chromium } from 'playwright';

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();

const jsErrors = [];
const networkErrors = [];
const clickErrors = [];

page.on('pageerror', err => jsErrors.push({ url: page.url(), error: err.message }));
page.on('console', msg => {
  if (msg.type() === 'error' && !msg.text().includes('metadataBase') && !msg.text().includes('Browserslist') && !msg.text().includes('Warning:'))
    networkErrors.push({ url: page.url(), msg: msg.text().slice(0, 150) });
});

async function testPage(name, path, expectAuth = false) {
  try {
    const res = await page.goto(`http://localhost:3000${path}`, { waitUntil: 'networkidle', timeout: 15000 });
    await page.waitForTimeout(1500);
    
    const url = page.url();
    const status = res.status();
    
    // Check for error overlay (Next.js dev error)
    const errorOverlay = await page.$('nextjs-portal, [data-nextjs-dialog]');
    const hasError = !!errorOverlay;
    
    // Check for blank page
    const body = await page.textContent('body');
    const isBlank = !body || body.trim().length < 20;
    
    // Check for "unhandled runtime error"
    const errorText = await page.$('text=Unhandled Runtime Error');
    
    // Check all buttons/links are clickable
    const buttons = await page.locator('button:visible').count();
    const links = await page.locator('a:visible').count();
    
    if (hasError || errorText) {
      const errMsg = await page.textContent('[data-nextjs-dialog-body], .sc-logic-error, body');
      console.log(`✗ ${name} - RUNTIME ERROR: ${errMsg?.slice(0, 100)}`);
      await page.screenshot({ path: `/tmp/dothack-screenshots/bug-${name}.png` });
      return false;
    } else if (isBlank) {
      console.log(`✗ ${name} - BLANK PAGE`);
      await page.screenshot({ path: `/tmp/dothack-screenshots/bug-${name}.png` });
      return false;
    } else if (status !== 200 && !expectAuth) {
      console.log(`✗ ${name} - HTTP ${status}`);
      return false;
    } else {
      console.log(`✓ ${name} - OK (${buttons} buttons, ${links} links, ${body.trim().length} chars)`);
      return true;
    }
  } catch (e) {
    console.log(`✗ ${name} - TIMEOUT/ERROR: ${e.message.slice(0, 80)}`);
    await page.screenshot({ path: `/tmp/dothack-screenshots/bug-${name}.png` });
    return false;
  }
}

console.log('========== PUBLIC PAGES ==========');
await testPage('Landing', '/');
await testPage('Features', '/features');
await testPage('Pricing', '/pricing');
await testPage('Login', '/login');
await testPage('Signup', '/signup');
await testPage('Docs', '/docs');
await testPage('Contact', '/contact');

console.log('\n========== LOGIN WITH API KEY ==========');
await page.goto('http://localhost:3000/login', { waitUntil: 'networkidle', timeout: 15000 });
await page.waitForTimeout(1000);

// Find API KEY tab and click it
const allButtons = await page.locator('button').all();
let clickedTab = false;
for (const btn of allButtons) {
  const txt = await btn.textContent();
  if (txt && txt.match(/api\s*key/i)) {
    await btn.click();
    clickedTab = true;
    console.log('Clicked API KEY tab');
    break;
  }
}
if (!clickedTab) console.log('✗ Could not find API KEY tab');

await page.waitForTimeout(500);

// Find the text input for API key
const allInputs = await page.locator('input:visible').all();
let filledKey = false;
for (const input of allInputs) {
  const type = await input.getAttribute('type');
  const ac = await input.getAttribute('autocomplete');
  if (type === 'text' && ac === 'off') {
    await input.fill('kLPiP0bzgKJ0CnNYVt1wq3qxbs2QgDeF2XwyUnxBEOM');
    filledKey = true;
    console.log('Filled API key');
    break;
  }
}
if (!filledKey) {
  // Try any visible text input
  for (const input of allInputs) {
    const ph = await input.getAttribute('placeholder') || '';
    if (ph.toLowerCase().includes('api') || ph.toLowerCase().includes('key') || ph.toLowerCase().includes('paste')) {
      await input.fill('kLPiP0bzgKJ0CnNYVt1wq3qxbs2QgDeF2XwyUnxBEOM');
      filledKey = true;
      console.log('Filled API key (by placeholder)');
      break;
    }
  }
}

// Submit
const submitBtn = page.locator('button[type="submit"]');
if (await submitBtn.count() > 0) {
  await submitBtn.click();
  console.log('Clicked submit');
} else {
  console.log('✗ No submit button found');
}

await page.waitForTimeout(6000);
const afterLoginUrl = page.url();
console.log(`After login: ${afterLoginUrl}`);

if (afterLoginUrl.includes('/hackathons')) {
  console.log('✓ LOGIN SUCCESS');
} else {
  console.log('✗ LOGIN FAILED - still on: ' + afterLoginUrl);
  await page.screenshot({ path: '/tmp/dothack-screenshots/bug-login-failed.png' });
}

console.log('\n========== AUTHENTICATED PAGES ==========');
if (afterLoginUrl.includes('/hackathons')) {
  await testPage('Dashboard', '/hackathons');
  await testPage('Featured', '/featured');
  await testPage('Themes', '/themes');
  await testPage('API Settings', '/api-settings');
  
  console.log('\n========== CLICKING SIDEBAR LINKS ==========');
  // Go to dashboard and click each sidebar link
  await page.goto('http://localhost:3000/hackathons', { waitUntil: 'networkidle', timeout: 15000 });
  await page.waitForTimeout(2000);
  
  const sidebarLinks = await page.locator('aside a, nav a, [class*="sidebar"] a').all();
  console.log(`Found ${sidebarLinks.length} sidebar links`);
  
  for (const link of sidebarLinks) {
    const href = await link.getAttribute('href');
    const text = await link.textContent();
    if (href && !href.startsWith('http') && !href.startsWith('#')) {
      console.log(`  Clicking: ${text?.trim()} -> ${href}`);
    }
  }
}

console.log('\n========== JS ERRORS COLLECTED ==========');
if (jsErrors.length === 0) {
  console.log('No JavaScript errors!');
} else {
  for (const err of jsErrors.slice(0, 10)) {
    console.log(`  ✗ ${err.url}: ${err.error.slice(0, 100)}`);
  }
}

console.log('\n========== NETWORK ERRORS ==========');
const realErrors = networkErrors.filter(e => 
  !e.msg.includes('favicon') && !e.msg.includes('404') && !e.msg.includes('500')
);
if (realErrors.length === 0) {
  console.log('No critical network errors');
} else {
  for (const err of realErrors.slice(0, 10)) {
    console.log(`  ✗ ${err.msg}`);
  }
}

const apiCalls404 = networkErrors.filter(e => e.msg.includes('404'));
const apiCalls500 = networkErrors.filter(e => e.msg.includes('500'));
console.log(`API 404s: ${apiCalls404.length} (expected - no data yet)`);
console.log(`API 500s: ${apiCalls500.length}`);

await browser.close();
