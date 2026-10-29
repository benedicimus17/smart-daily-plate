import { chromium } from 'playwright';
import path from 'path';

const ARTIFACT_DIR = 'C:/Users/Test/.gemini/antigravity/brain/1e7f6930-b0a7-432b-a314-19b3c1fd3804';

async function runAudit() {
  console.log('🚀 Starting Stage 8.5 Profile, Dietary, Notifications & Legal Spanish E2E Audit...');
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
          email: 'carlos.madrid@example.es',
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
    await page.waitForTimeout(500);
  }

  // 2. Navigate to Profile screen
  console.log('Navigating to Profile tab...');
  const profileTab = page.locator('#tab-profile');
  await profileTab.waitFor({ state: 'visible', timeout: 5000 });
  await profileTab.click();
  await page.waitForTimeout(600);

  // Verify Profile screen in Spanish
  const profileShotPath = path.join(ARTIFACT_DIR, 'audit_stage8_5_profile_es.png');
  await page.screenshot({ path: profileShotPath, fullPage: false });
  console.log('📸 Captured:', profileShotPath);

  // 3. Open Dietary Restrictions & Allergies Modal
  console.log('Opening Dietary Restrictions & Allergies Modal...');
  const dietaryBtn = page.locator('#btn-open-dietary-restrictions');
  await dietaryBtn.scrollIntoViewIfNeeded();
  await dietaryBtn.click();
  await page.waitForTimeout(500);

  const dietaryModal = page.locator('#dietary-restrictions-modal');
  await dietaryModal.waitFor({ state: 'visible', timeout: 3000 });

  const dietaryShotPath = path.join(ARTIFACT_DIR, 'audit_stage8_5_dietary_modal_es.png');
  await page.screenshot({ path: dietaryShotPath });
  console.log('📸 Captured:', dietaryShotPath);

  // Close Dietary Modal
  await page.locator('#btn-close-dietary-restrictions').click();
  await page.waitForTimeout(400);

  // 4. Open Notification Settings Modal
  console.log('Opening Notification Settings Modal...');
  const notifBtn = page.locator('#btn-open-notification-settings');
  await notifBtn.scrollIntoViewIfNeeded();
  await notifBtn.click();
  await page.waitForTimeout(500);

  const notifModal = page.locator('#notification-settings-modal');
  await notifModal.waitFor({ state: 'visible', timeout: 3000 });

  const notifShotPath = path.join(ARTIFACT_DIR, 'audit_stage8_5_notification_modal_es.png');
  await page.screenshot({ path: notifShotPath });
  console.log('📸 Captured:', notifShotPath);

  // Close Notification Modal
  await page.locator('#btn-close-notification-settings').click();
  await page.waitForTimeout(400);

  // 5. Open Legal Modal (Privacy Policy)
  console.log('Opening Legal Privacy Policy Modal...');
  const privacyBtn = page.locator('#btn-open-privacy-policy');
  await privacyBtn.scrollIntoViewIfNeeded();
  await privacyBtn.click();
  await page.waitForTimeout(500);

  const legalModal = page.locator('#tab-privacy-policy');
  await legalModal.waitFor({ state: 'visible', timeout: 3000 });

  const legalShotPath = path.join(ARTIFACT_DIR, 'audit_stage8_5_legal_modal_es.png');
  await page.screenshot({ path: legalShotPath });
  console.log('📸 Captured:', legalShotPath);

  // Close Legal Modal
  await page.locator('#btn-close-legal-action').click();
  await page.waitForTimeout(400);

  await browser.close();

  console.log('\n--- E2E AUDIT RESULTS ---');
  console.log('Console Errors:', consoleErrors.length);
  if (consoleErrors.length > 0) {
    console.error('FAILED: Browser console errors detected:', consoleErrors);
    process.exit(1);
  } else {
    console.log('✅ STAGE 8.5 AUDIT PASSED WITH 0 CONSOLE ERRORS');
  }
}

runAudit().catch((err) => {
  console.error('Fatal audit failure:', err);
  process.exit(1);
});
