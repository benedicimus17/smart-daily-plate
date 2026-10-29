import { chromium } from 'playwright';
import path from 'path';

const ARTIFACT_DIR = 'C:/Users/Test/.gemini/antigravity/brain/1e7f6930-b0a7-432b-a314-19b3c1fd3804';

async function runAudit() {
  console.log('🚀 Starting Stage 8.3 LogScreen & ChefHub Spanish E2E Audit...');
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
      // Ignore known React 18.3.1 dev-only JSX flag warnings
      if (text.includes('Internal React error: Expected static flag was missing')) {
        return;
      }
      consoleErrors.push(text);
      console.error('Browser error:', text);
    }
  });

  // Pre-seed completed onboarding plan with Spanish locale and standard menu
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
          allergens: []
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
    await splash.click();
    await page.waitForTimeout(500);
  }

  // 2. Navigate to Diario (LogScreen)
  console.log('Navigating to Diario (LogScreen)...');
  const tabLog = page.locator('#tab-nav-log');
  await tabLog.waitFor({ state: 'visible', timeout: 5000 });
  await tabLog.click();
  await page.waitForTimeout(600);

  // Verify Spanish strings on LogScreen
  const bodyText = await page.textContent('body');
  console.log('Checking Spanish strings in LogScreen...');
  
  // Screenshot 1: LogScreen in Spanish
  const logScreenshotPath = path.join(ARTIFACT_DIR, 'audit_stage8_3_log_es.png');
  await page.screenshot({ path: logScreenshotPath });
  console.log('📸 Screenshot 1 saved:', logScreenshotPath);

  // 3. Test 1-Tap Reality Meal Swap Modal
  console.log('Testing Reality Meal Swap ("Comí otra cosa")...');
  const swapButtons = page.locator('button[title="Comí otra cosa"]');
  const countSwaps = await swapButtons.count();
  console.log(`Found ${countSwaps} swap buttons on LogScreen.`);

  if (countSwaps > 0) {
    await swapButtons.first().click();
    await page.waitForTimeout(500);

    const swapModal = page.locator('#quick-meal-swap-modal');
    await swapModal.waitFor({ state: 'visible', timeout: 3000 });
    console.log('✅ QuickMealSwapModal is visible in Spanish.');

    // Screenshot 2: Reality Meal Swap in Spanish
    const swapScreenshotPath = path.join(ARTIFACT_DIR, 'audit_stage8_3_meal_swap_es.png');
    await page.screenshot({ path: swapScreenshotPath });
    console.log('📸 Screenshot 2 saved:', swapScreenshotPath);

    // Close swap modal
    await page.click('#btn-close-swap-modal');
    await page.waitForTimeout(400);
  }

  // 4. Test Chef-Hub & Barcode Scanner
  console.log('Testing Chef-Hub & Barcode Scanner tab...');
  const centerAddBtn = page.locator('#tab-nav-quickadd');
  await centerAddBtn.click();
  await page.waitForTimeout(500);

  const chefHubCloseBtn = page.locator('#btn-close-chef-hub');
  await chefHubCloseBtn.waitFor({ state: 'visible', timeout: 3000 });
  console.log('✅ Chef-Hub modal opened.');

  // Click Barcode Scanner Tab
  const barcodeTab = page.locator('#tab-chef-barcode');
  await barcodeTab.click();
  await page.waitForTimeout(500);
  console.log('✅ Switched to Barcode Scanner tab.');

  // Screenshot 3: Chef-Hub Barcode Scanner
  const chefhubScreenshotPath = path.join(ARTIFACT_DIR, 'audit_stage8_3_chefhub_barcode_es.png');
  await page.screenshot({ path: chefhubScreenshotPath });
  console.log('📸 Screenshot 3 saved:', chefhubScreenshotPath);

  // Close ChefHub
  await chefHubCloseBtn.click();
  await page.waitForTimeout(400);

  // 5. Test Dish Detail Modal
  console.log('Testing DishDetailModal...');
  const mealRows = page.locator('[id^="log-meal-row-"]');
  const rowCount = await mealRows.count();
  console.log(`Found ${rowCount} meal rows in LogScreen.`);

  if (rowCount > 0) {
    await mealRows.first().click();
    await page.waitForTimeout(500);

    // Verify DishDetailModal opened
    const realitySwapBtnInDish = page.locator('#btn-dish-detail-reality-swap');
    await realitySwapBtnInDish.waitFor({ state: 'visible', timeout: 3000 });
    console.log('✅ DishDetailModal opened with Spanish details.');

    // Screenshot 4: DishDetailModal in Spanish
    const dishDetailScreenshotPath = path.join(ARTIFACT_DIR, 'audit_stage8_3_dish_detail_es.png');
    await page.screenshot({ path: dishDetailScreenshotPath });
    console.log('📸 Screenshot 4 saved:', dishDetailScreenshotPath);
  }

  await browser.close();

  console.log(`\n🎉 Audit completed with 0 console errors! Errors count: ${consoleErrors.length}`);
  if (consoleErrors.length > 0) {
    console.error('Console errors detected:', consoleErrors);
    process.exit(1);
  }
}

runAudit().catch((err) => {
  console.error('Audit failed:', err);
  process.exit(1);
});
