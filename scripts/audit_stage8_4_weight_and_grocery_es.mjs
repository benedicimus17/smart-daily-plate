import { chromium } from 'playwright';
import path from 'path';

const ARTIFACT_DIR = 'C:/Users/Test/.gemini/antigravity/brain/1e7f6930-b0a7-432b-a314-19b3c1fd3804';

async function runAudit() {
  console.log('🚀 Starting Stage 8.4 Weight Trend & Smart Grocery List Spanish E2E Audit...');
  const browser = await chromium.launch({ headless: true, channel: 'chrome' });
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15 Mobile/15E148',
    locale: 'es-ES'
  });

  const page = await context.newPage();
  
  const consoleErrors = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      const text = msg.text();
      if (text.includes('Internal React error: Expected static flag was missing')) {
        return;
      }
      consoleErrors.push(text);
      console.error('Browser error:', text);
    }
  });

  // Pre-seed completed onboarding plan with Spanish locale
  await page.addInitScript(() => {
    window.localStorage.clear();
    window.localStorage.setItem('nutriq-locale-storage-v1', JSON.stringify({
      state: { currentLanguage: 'es' },
      version: 0
    }));
    window.localStorage.setItem('nutriq-user-store-v2', JSON.stringify({
      state: {
        user: {
          id: 'test-audit-user-es',
          name: 'Carlos',
          email: 'carlos.test@madrid.es',
          hasCompletedPlan: true,
          isPro: false,
          currentDayOffset: 0,
          eatingRhythm: '3_meals',
          dietType: 'standard',
          allergens: [],
          weightKg: 74
        }
      },
      version: 0
    }));
  });

  await page.goto('http://localhost:5173', { waitUntil: 'networkidle' });
  await page.waitForTimeout(600);

  // 1. Dismiss splash screen if visible
  const splash = page.locator('#splash-screen-overlay');
  if (await splash.isVisible()) {
    console.log('Dismissing splash screen...');
    await page.click('#splash-screen-overlay');
    await page.waitForTimeout(400);
  }

  // 2. Navigate to Trends / Groceries tab (Bottom Nav item 4: tab-nav-trends)
  console.log('Navigating to Trends tab...');
  await page.click('#tab-nav-trends');
  await page.waitForTimeout(500);

  // By default, trendSubTab is 'trend' (TrueFatTrend: Mi peso)
  console.log('Verifying TrueFatTrend (Mi peso)...');
  await page.waitForSelector('#input-morning-weight');
  
  // Fill in new morning weight
  await page.fill('#input-morning-weight', '73.4');
  await page.click('#btn-record-weight');
  await page.waitForTimeout(300);

  const weightScreenshotPath = path.join(ARTIFACT_DIR, 'audit_stage8_4_weight_trend_es.png');
  await page.screenshot({ path: weightScreenshotPath, fullPage: true });
  console.log(`Saved screenshot: ${weightScreenshotPath}`);

  // 3. Switch to Grocery List sub-tab (tab-sub-grocery)
  console.log('Navigating to Smart Grocery List sub-tab...');
  await page.click('#tab-sub-grocery');
  await page.waitForTimeout(500);

  await page.waitForSelector('#btn-add-custom-grocery');

  const groceryListScreenshotPath = path.join(ARTIFACT_DIR, 'audit_stage8_4_grocery_list_es.png');
  await page.screenshot({ path: groceryListScreenshotPath, fullPage: true });
  console.log(`Saved screenshot: ${groceryListScreenshotPath}`);

  // 4. Open Add Custom Grocery Item form
  console.log('Opening Add Custom Grocery form...');
  await page.click('#btn-add-custom-grocery');
  await page.waitForTimeout(400);
  await page.waitForSelector('#input-grocery-name');

  // Fill in a Spanish product
  await page.fill('#input-grocery-name', 'Aguacates Hass Mercadona');
  await page.fill('#input-grocery-amount', '3 uds (~400 g)');
  await page.fill('#input-grocery-note', 'Para ensaladas y tostadas');

  const groceryAddFormScreenshotPath = path.join(ARTIFACT_DIR, 'audit_stage8_4_grocery_add_form_es.png');
  await page.screenshot({ path: groceryAddFormScreenshotPath, fullPage: true });
  console.log(`Saved screenshot: ${groceryAddFormScreenshotPath}`);

  // Submit new item
  await page.click('#btn-submit-grocery-item');
  await page.waitForTimeout(400);

  // 5. Test Copy List action
  console.log('Testing Copy List button...');
  await page.click('#btn-copy-groceries');
  await page.waitForTimeout(300);

  const groceryCopiedScreenshotPath = path.join(ARTIFACT_DIR, 'audit_stage8_4_grocery_copied_es.png');
  await page.screenshot({ path: groceryCopiedScreenshotPath, fullPage: true });
  console.log(`Saved screenshot: ${groceryCopiedScreenshotPath}`);

  console.log(`\nAudit Complete! Console errors: ${consoleErrors.length}`);
  if (consoleErrors.length > 0) {
    console.error('Console errors encountered:', consoleErrors);
  }

  await browser.close();
  return {
    consoleErrorsCount: consoleErrors.length,
    consoleErrors
  };
}

runAudit()
  .then((res) => {
    if (res.consoleErrorsCount > 0) {
      process.exit(1);
    } else {
      process.exit(0);
    }
  })
  .catch((err) => {
    console.error('Audit script failed:', err);
    process.exit(1);
  });
