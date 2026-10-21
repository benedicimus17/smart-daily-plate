import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const tmpDir = path.resolve('C:/Projects/Antigravity/Smart_Daily_Plate/.tmp');
const artifactDir = 'C:\\Users\\Test\\.gemini\\antigravity\\brain\\e14186d0-286e-4a77-87b9-a0b6fcb4a34f';

const commands = [
  'open https://smart-daily-plate.vercel.app/?v=log_test_1',
  'set viewport 390 844',
  'wait 2500',
  'click #tab-log',
  'wait 700',
  'screenshot C:\\Projects\\Antigravity\\Smart_Daily_Plate\\.tmp\\concept_screen2_log.png',
  'click #btn-open-balancer',
  'wait 500',
  'screenshot C:\\Projects\\Antigravity\\Smart_Daily_Plate\\.tmp\\concept_screen2_balancer_modal.png',
  'click "button:has-text(\'✕\')", "button[class*=\'absolute\']"',
  'click #tab-log',
  'wait 500',
  'close'
];

// We can run separate commands to be robust
const cmd1 = [
  'open https://smart-daily-plate.vercel.app/?v=log_test_2',
  'set viewport 390 844',
  'wait 2500',
  'click #tab-log',
  'wait 800',
  'screenshot C:\\Projects\\Antigravity\\Smart_Daily_Plate\\.tmp\\concept_screen2_log.png',
  'click #btn-open-balancer',
  'wait 600',
  'screenshot C:\\Projects\\Antigravity\\Smart_Daily_Plate\\.tmp\\concept_screen2_balancer_modal.png',
  'close'
].map(c => `npx.cmd agent-browser ${c}`).join(' && ');

console.log('Capturing Screen 2 concepts...');
try {
  execSync(cmd1, { encoding: 'utf-8', shell: 'cmd.exe', stdio: 'inherit' });
  
  const files = [
    'concept_screen2_log.png',
    'concept_screen2_balancer_modal.png'
  ];
  for (const f of files) {
    const src = path.join(tmpDir, f);
    const dst = path.join(artifactDir, f);
    if (fs.existsSync(src)) {
      fs.copyFileSync(src, dst);
      console.log(`Copied ${f} to artifact directory.`);
    }
  }
} catch (err) {
  console.error('Error during capture:', err);
  process.exit(1);
}
