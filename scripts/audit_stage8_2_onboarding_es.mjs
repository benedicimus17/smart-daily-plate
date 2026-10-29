import { chromium } from 'playwright';
import path from 'path';

const ARTIFACT_DIR = 'C:/Users/Test/.gemini/antigravity/brain/1e7f6930-b0a7-432b-a314-19b3c1fd3804';

async function runAudit() {
  console.log('🚀 Starting Stage 8.2 Onboarding Spanish & Polishing E2E Audit...');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15 Mobile/15E148',
    locale: 'es-ES'
  });

  const page = await context.newPage();
  
  const consoleErrors = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
      console.error('Browser error:', msg.text());
    }
  });

  // Reset local storage to guarantee fresh onboarding wizard launch in Spanish
  await page.addInitScript(() => {
    window.localStorage.clear();
    // Default Spanish locale
    window.localStorage.setItem('nutriq-locale-storage-v1', JSON.stringify({
      state: { currentLanguage: 'es' },
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
    await page.waitForTimeout(600);
  }

  // Verify wizard is visible
  const wizardSwitcher = page.locator('#wizard-language-switcher');
  await wizardSwitcher.waitFor({ state: 'visible', timeout: 5000 });
  console.log('✅ Wizard language switcher is visible on top bar.');

  // Screenshot Step 1 in Spanish
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'audit_stage8_2_wizard_step1_es.png') });
  console.log('📸 Step 1 (Spanish) screenshot taken.');

  // Verify Spanish text on Step 1
  const step1Title = await page.locator('h2').first().textContent();
  console.log('Step 1 Title in Spanish:', step1Title);

  // Test Language Switcher: switch to EN then back to ES
  const btnEn = page.locator('#wizard-lang-en');
  await btnEn.click();
  await page.waitForTimeout(400);
  const step1TitleEn = await page.locator('h2').first().textContent();
  console.log('Step 1 Title in English after switcher click:', step1TitleEn);

  const btnEs = page.locator('#wizard-lang-es');
  await btnEs.click();
  await page.waitForTimeout(400);

  // Step 1: Click "Perder peso"
  console.log('Selecting goal: lose_weight...');
  await page.click('#goal-lose_weight');
  await page.waitForTimeout(400);

  // Step 2: Gender -> Click "Mujer"
  console.log('Selecting gender: female...');
  await page.click('#gender-female');
  await page.waitForTimeout(400);

  // Step 3: Age -> Click continue
  console.log('Step 3: Age...');
  await page.fill('#wizard-age-input', '28');
  await page.click('#wizard-age-next');
  await page.waitForTimeout(400);

  // Step 4: Weight & Height
  console.log('Step 4: Body metrics...');
  await page.fill('#wizard-weight-input', '62');
  await page.fill('#wizard-height-input', '168');
  await page.click('#wizard-body-next');
  await page.waitForTimeout(400);

  // Step 5: Activity
  console.log('Step 5: Activity level...');
  await page.click('#activity-light');
  await page.waitForTimeout(400);

  // Step 6: Takes protein
  console.log('Step 6: Takes protein...');
  await page.click('#protein-yes');
  await page.waitForTimeout(400);

  // Step 7: Rhythm
  console.log('Step 7: Rhythm...');
  await page.click('#rhythm-3meals');
  await page.waitForTimeout(400);

  // Step 8: Pace
  console.log('Step 8: Pace (steady)...');
  await page.click('#pace-steady');
  await page.waitForTimeout(400);

  // Step 9: Dietary & Allergies
  console.log('Step 9: Dietary & Allergies...');
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'audit_stage8_2_wizard_dietary_es.png') });
  await page.click('#wizard-allergen-lactose'); // Exclude lactose
  await page.waitForTimeout(300);
  await page.click('#wizard-dietary-continue-btn');
  await page.waitForTimeout(500);

  // Step 10: Summary & Registration
  console.log('Step 10: Summary in Spanish...');
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'audit_stage8_2_wizard_step10_es.png') });

  // Finish via guest skip or registration
  console.log('Completing registration as guest...');
  await page.click('#wizard-guest-btn');
  await page.waitForTimeout(800);

  // Verify Dashboard loaded
  console.log('Verifying Dashboard loaded with Spanish menu...');
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'audit_stage8_2_dashboard_es.png') });

  await browser.close();

  console.log(`\nAudit completed! Console errors: ${consoleErrors.length}`);
  if (consoleErrors.length > 0) {
    console.error('Console errors detected:', consoleErrors);
    process.exit(1);
  }
}

runAudit().catch((err) => {
  console.error('Audit failed:', err);
  process.exit(1);
});
