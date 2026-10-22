import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const tmpDir = path.resolve('C:/Projects/Antigravity/Smart_Daily_Plate/.tmp');
if (!fs.existsSync(tmpDir)) {
  fs.mkdirSync(tmpDir, { recursive: true });
}
const artifactDir = 'C:\\Users\\Test\\.gemini\\antigravity\\brain\\e14186d0-286e-4a77-87b9-a0b6fcb4a34f';

const runCommand = (cmd) => {
  console.log(`> agent-browser ${cmd}`);
  try {
    const out = execSync(`npx.cmd agent-browser ${cmd}`, { encoding: 'utf-8', shell: 'cmd.exe' });
    if (out.trim()) console.log(out.trim());
    return out;
  } catch (err) {
    console.error(`Command failed: ${cmd}`);
    if (err.stdout) console.log('STDOUT:', err.stdout);
    if (err.stderr) console.error('STDERR:', err.stderr);
    throw err;
  }
};

async function main() {
  console.log('--- Starting Stage 3.4 QA Audit: Onboarding Wizard, Relaxed Registration & Freemium PRO ---');

  runCommand('open https://smart-daily-plate.vercel.app/?v=audit_v7_' + Date.now());
  runCommand('set viewport 390 844');
  runCommand('wait 2000');

  // 1. Reset user state to trigger fresh onboarding
  runCommand('click #btn-header-reset-test');
  runCommand('wait 1000');
  runCommand('screenshot C:\\Projects\\Antigravity\\Smart_Daily_Plate\\.tmp\\qa_v7_01_wizard_step1.png');

  // 2. Step 1: Goal -> Next
  runCommand('click #wizard-step1-next');
  runCommand('wait 600');
  runCommand('screenshot C:\\Projects\\Antigravity\\Smart_Daily_Plate\\.tmp\\qa_v7_02_wizard_step2.png');

  // 3. Step 2: Gender / Age -> Next
  runCommand('click #wizard-step2-next');
  runCommand('wait 600');
  runCommand('screenshot C:\\Projects\\Antigravity\\Smart_Daily_Plate\\.tmp\\qa_v7_03_wizard_step3.png');

  // 4. Step 3: Weight / Height -> Next
  runCommand('click #wizard-step2-next');
  runCommand('wait 600');
  runCommand('screenshot C:\\Projects\\Antigravity\\Smart_Daily_Plate\\.tmp\\qa_v7_04_wizard_step4_protein.png');

  // 5. Step 4: Activity & Protein -> Next
  runCommand('click #wizard-step4-next');
  runCommand('wait 600');
  runCommand('screenshot C:\\Projects\\Antigravity\\Smart_Daily_Plate\\.tmp\\qa_v7_05_wizard_step5_rhythm.png');

  // 6. Step 5: Eating Rhythm & Pace -> Step 6 (Calculations & Registration Gate)
  runCommand('click #wizard-step5-next');
  runCommand('wait 800');
  runCommand('screenshot C:\\Projects\\Antigravity\\Smart_Daily_Plate\\.tmp\\qa_v7_06_wizard_step6_relaxed_gate.png');

  // 7. Test relaxed registration: Enter arbitrary words "тестовий юзер" without email validation error
  runCommand('fill #wizard-email-input "тестовий юзер"');
  runCommand('wait 400');
  runCommand('click #wizard-submit-btn');
  runCommand('wait 1200');
  runCommand('screenshot C:\\Projects\\Antigravity\\Smart_Daily_Plate\\.tmp\\qa_v7_07_home_after_registration.png');

  // 8. Test Freemium & PRO Paywall
  // Open ChefHub via [+] Center dock button
  runCommand('click #btn-dock-quick-add');
  runCommand('wait 800');
  runCommand('screenshot C:\\Projects\\Antigravity\\Smart_Daily_Plate\\.tmp\\qa_v7_08_chef_hub_locked_pro.png');

  // Click on a locked PRO dish or lock button
  runCommand('click "button[title*=\'Ресторанна\']", "span:has-text(\'PRO •\')"');
  runCommand('wait 700');
  runCommand('screenshot C:\\Projects\\Antigravity\\Smart_Daily_Plate\\.tmp\\qa_v7_09_pro_paywall_modal.png');

  // Activate PRO in 1 click
  runCommand('click "button:has-text(\'Оформити NUTRIQ PRO\')"');
  runCommand('wait 800');
  runCommand('click "button:has-text(\'Активувати NUTRIQ PRO\')"');
  runCommand('wait 2000');
  runCommand('screenshot C:\\Projects\\Antigravity\\Smart_Daily_Plate\\.tmp\\qa_v7_10_chef_hub_unlocked_pro.png');

  // 9. Check console errors
  runCommand('errors');
  runCommand('close');

  // Copy screenshots to artifact directory
  const files = [
    'qa_v7_01_wizard_step1.png',
    'qa_v7_02_wizard_step2.png',
    'qa_v7_03_wizard_step3.png',
    'qa_v7_04_wizard_step4_protein.png',
    'qa_v7_05_wizard_step5_rhythm.png',
    'qa_v7_06_wizard_step6_relaxed_gate.png',
    'qa_v7_07_home_after_registration.png',
    'qa_v7_08_chef_hub_locked_pro.png',
    'qa_v7_09_pro_paywall_modal.png',
    'qa_v7_10_chef_hub_unlocked_pro.png'
  ];

  for (const f of files) {
    const src = path.join(tmpDir, f);
    const dst = path.join(artifactDir, f);
    if (fs.existsSync(src)) {
      fs.copyFileSync(src, dst);
      console.log(`Copied ${f} to artifacts directory.`);
    }
  }

  console.log('--- Stage 3.4 QA Audit Completed Successfully ---');
}

main().catch(err => {
  console.error('QA Audit failed:', err);
  process.exit(1);
});
