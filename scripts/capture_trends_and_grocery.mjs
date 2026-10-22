import { chromium } from 'playwright';
import path from 'path';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  
  const artifactDir = 'C:/Users/Test/.gemini/antigravity/brain/e14186d0-286e-4a77-87b9-a0b6fcb4a34f';

  await page.goto('http://localhost:5173');
  await page.evaluate(() => {
    sessionStorage.setItem('nutriq_splash_shown', '1');
  });
  await page.reload();
  await page.waitForTimeout(1000);

  // If splash overlay exists, click it
  const splash = await page.$('#splash-screen-overlay');
  if (splash) {
    await splash.click().catch(() => {});
    await page.waitForTimeout(500);
  }

  // 1. Go to Trends tab
  const trendsTab = await page.$('#tab-nav-trends');
  if (trendsTab) {
    await trendsTab.click();
    await page.waitForTimeout(500);
    await page.screenshot({ path: path.join(artifactDir, 'audit_trends_01_true_fat_trend.png') });
  }

  // 2. Switch to Grocery List subtab
  const grocerySubTab = await page.$('#tab-sub-grocery');
  if (grocerySubTab) {
    await grocerySubTab.click();
    await page.waitForTimeout(500);
    await page.screenshot({ path: path.join(artifactDir, 'audit_trends_02_smart_grocery_list.png') });
  }

  // 3. Go to Log tab
  const logTab = await page.$('#tab-nav-log');
  if (logTab) {
    await logTab.click();
    await page.waitForTimeout(500);
    await page.screenshot({ path: path.join(artifactDir, 'audit_trends_03_log_with_pot_button.png') });

    // Click Cook-Loss button
    const potBtn = await page.getByRole('button', { name: /Уварка/i }).first();
    if (potBtn) {
      await potBtn.click();
      await page.waitForTimeout(500);
      await page.screenshot({ path: path.join(artifactDir, 'audit_trends_04_cook_loss_modal.png') });
    }
  }

  await browser.close();
  console.log('Done capturing audit screens!');
})();
