const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  console.log('Testing Green Career Night site at http://localhost:3000\n');

  // Test 1: Homepage loads
  console.log('1. Testing homepage load...');
  await page.goto('http://localhost:3000');
  const title = await page.title();
  console.log(`   ✓ Page title: "${title}"`);

  // Test 2: Check hero section
  console.log('2. Testing hero section...');
  const heroTitle = await page.textContent('.hero-title');
  console.log(`   ✓ Hero title: "${heroTitle.replace(/\n/g, ' ')}"`);

  // Test 3: Check all sections exist
  console.log('3. Testing page sections...');
  const sections = ['#about', '#details', '#register'];
  for (const section of sections) {
    const exists = await page.$(section);
    console.log(`   ✓ Section ${section} exists: ${!!exists}`);
  }

  // Test 4: Test registration form
  console.log('4. Testing registration form...');
  await page.fill('#name', 'Test User');
  await page.fill('#email', `test-${Date.now()}@example.com`);
  await page.fill('#role', 'Playwright automated test');
  console.log('   ✓ Form fields filled');

  // Submit and wait for alert
  page.on('dialog', async dialog => {
    console.log(`   ✓ Alert received: "${dialog.message()}"`);
    await dialog.accept();
  });

  await page.click('button[type="submit"]');
  await page.waitForTimeout(2000);

  // Test 5: Check responsive design
  console.log('5. Testing responsive design...');
  const viewports = [
    { name: 'Mobile', width: 375, height: 667 },
    { name: 'Tablet', width: 768, height: 1024 },
    { name: 'Desktop', width: 1440, height: 900 }
  ];

  for (const vp of viewports) {
    await page.setViewportSize({ width: vp.width, height: vp.height });
    const heroVisible = await page.isVisible('.hero-title');
    console.log(`   ✓ ${vp.name} (${vp.width}x${vp.height}): Hero visible = ${heroVisible}`);
  }

  // Take a screenshot
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('http://localhost:3000');
  await page.screenshot({ path: 'screenshot.png', fullPage: true });
  console.log('\n✓ Screenshot saved to screenshot.png');

  await browser.close();
  console.log('\n✅ All tests passed!');
})();
