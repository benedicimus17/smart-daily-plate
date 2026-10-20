import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const tmpDir = path.resolve('C:/Projects/Antigravity/Smart_Daily_Plate/.tmp');
if (!fs.existsSync(tmpDir)) {
  fs.mkdirSync(tmpDir, { recursive: true });
}

const commands = [
  'open https://smart-daily-plate.vercel.app/?v=8',
  'set viewport 390 844',
  'wait 2500',
  'screenshot C:\\Projects\\Antigravity\\Smart_Daily_Plate\\.tmp\\qa_01_home.png',
  'click #my-plan-banner',
  'wait 600',
  'screenshot C:\\Projects\\Antigravity\\Smart_Daily_Plate\\.tmp\\qa_02_wizard_step1.png',
  'click #wizard-step1-next',
  'wait 500',
  'screenshot C:\\Projects\\Antigravity\\Smart_Daily_Plate\\.tmp\\qa_03_wizard_step2.png',
  'click #wizard-step2-next',
  'wait 500',
  'screenshot C:\\Projects\\Antigravity\\Smart_Daily_Plate\\.tmp\\qa_04_wizard_step3.png',
  'click #wizard-step2-next',
  'wait 500',
  'screenshot C:\\Projects\\Antigravity\\Smart_Daily_Plate\\.tmp\\qa_05_wizard_step4.png',
  'click #wizard-step2-next',
  'wait 500',
  'screenshot C:\\Projects\\Antigravity\\Smart_Daily_Plate\\.tmp\\qa_06_wizard_step5_yoyo.png',
  'click #wizard-step2-next',
  'wait 600',
  'screenshot C:\\Projects\\Antigravity\\Smart_Daily_Plate\\.tmp\\qa_07_wizard_step6_columns.png',
  'fill #wizard-email-input anna.diet@gmail.com',
  'wait 300',
  'click #wizard-submit-btn',
  'wait 1200',
  'screenshot C:\\Projects\\Antigravity\\Smart_Daily_Plate\\.tmp\\qa_08_home_after_registration.png',
  'click #tab-profile',
  'wait 800',
  'screenshot C:\\Projects\\Antigravity\\Smart_Daily_Plate\\.tmp\\qa_09_profile_screen.png',
  'errors',
  'close'
];

const cmdChain = commands.map(c => `npx.cmd agent-browser ${c}`).join(' && ');

console.log('Running agent-browser QA audit pipeline with CSS ID selectors...');
try {
  const output = execSync(cmdChain, { encoding: 'utf-8', shell: 'cmd.exe', stdio: 'pipe' });
  console.log(output);
  console.log('QA audit pipeline completed successfully.');
} catch (err) {
  console.error('QA audit error:');
  if (err.stdout) console.log('STDOUT:\n', err.stdout);
  if (err.stderr) console.error('STDERR:\n', err.stderr);
  process.exit(1);
}
