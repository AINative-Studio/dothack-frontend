import { chromium } from 'playwright';

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();

// Capture all console and network
page.on('console', msg => {
  if (msg.text().includes('[AUTH]') || msg.type() === 'error')
    console.log(`CONSOLE [${msg.type()}]: ${msg.text()}`);
});
page.on('response', res => {
  if (res.url().includes('/auth/'))
    console.log(`NETWORK: ${res.status()} ${res.request().method()} ${res.url()}`);
});

console.log('=== TEST: API Key Login ===');
await page.goto('http://localhost:3000/login');
await page.waitForLoadState('networkidle');
console.log('Page loaded:', page.url());

// Click API KEY tab
await page.click('button:has-text("API KEY")');
await page.waitForTimeout(500);

// Fill API key
const input = page.locator('#login-apikey');
await input.fill('sk_nLI6DrYP9h7qrac9t876Wj4e3iV-zsk5YXUv0S-ttkM');
await page.waitForTimeout(300);

// Screenshot before click
await page.screenshot({ path: '/tmp/dothack-screenshots/pw-before-submit.png' });

// Click submit
await page.click('button[type="submit"]');
console.log('Clicked submit, waiting...');

// Wait for navigation or error
await page.waitForTimeout(6000);

// Screenshot after
await page.screenshot({ path: '/tmp/dothack-screenshots/pw-after-submit.png' });
console.log('FINAL URL:', page.url());

// Check for error message on page
const errorEl = await page.$('[role="alert"]');
if (errorEl) {
  const errorText = await errorEl.textContent();
  console.log('ERROR ON PAGE:', errorText);
}

// Check if we made it to /hackathons
if (page.url().includes('/hackathons')) {
  console.log('SUCCESS - redirected to hackathons!');
} else {
  console.log('FAILED - still on:', page.url());
}

await browser.close();
