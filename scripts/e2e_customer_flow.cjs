const { chromium } = require('playwright');

(async () => {
  const base = 'https://welcometoalaskatours.com';
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  const steps = [];
  const ok = (step, detail='') => steps.push({ step, status: 'PASS', detail });
  const fail = (step, detail='') => { steps.push({ step, status: 'FAIL', detail }); throw new Error(`${step}: ${detail}`); };

  try {
    await page.goto(`${base}/ports/juneau`, { waitUntil: 'domcontentloaded' });
    if (/Application error|server-side exception/i.test(await page.locator('body').innerText())) fail('1. Open port page', 'SSR app error still present');
    ok('1. Open port page');

    await page.goto(`${base}/tours/beyondak/195602?date=2026-05-09`, { waitUntil: 'domcontentloaded' });
    ok('2. Open tour detail', page.url());

    const timeButton = page.locator('button').filter({ hasText: /\d{2}:\d{2}/ }).first();
    await timeButton.waitFor({ state: 'visible', timeout: 20000 });
    await timeButton.click();
    ok('3. Pick a time');

    const addBtn = page.getByRole('button', { name: /Add to Cart|Select a departure time|Select a date to begin|Added/i }).first();
    const addText = (await addBtn.innerText()).trim();
    if (await addBtn.isDisabled()) fail('4. Add to cart', `CTA disabled with text: ${addText}`);
    await addBtn.click();
    ok('4. Add to cart', `CTA text before click: ${addText}`);

    await page.goto(`${base}/checkout`, { waitUntil: 'domcontentloaded' });
    ok('5. Open checkout route');

    await page.waitForURL(/\/checkout/);
    await page.getByText(/Secure Checkout|Checkout/i).first().waitFor({ state: 'visible', timeout: 10000 });
    ok('6. Proceed to checkout', page.url());

    console.log('E2E RESULT: PASS');
    for (const s of steps) console.log(`${s.status} - ${s.step}${s.detail ? ` :: ${s.detail}` : ''}`);
  } catch (err) {
    console.log('E2E RESULT: FAIL');
    for (const s of steps) console.log(`${s.status} - ${s.step}${s.detail ? ` :: ${s.detail}` : ''}`);
    console.error(String(err && err.message ? err.message : err));
    process.exitCode = 1;
  } finally {
    await browser.close();
  }
})();
