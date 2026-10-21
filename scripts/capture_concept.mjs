import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const tmpDir = path.resolve('C:/Projects/Antigravity/Smart_Daily_Plate/.tmp');
const artifactDir = 'C:\\Users\\Test\\.gemini\\antigravity\\brain\\e14186d0-286e-4a77-87b9-a0b6fcb4a34f';

const commands = [
  'open https://smart-daily-plate.vercel.app/?v=concept2',
  'set viewport 390 844',
  'wait 2500',
  'click #btn-recipe',
  'wait 500',
  'screenshot C:\\Projects\\Antigravity\\Smart_Daily_Plate\\.tmp\\concept_home_recipe_modal.png',
  'click #tab-log',
  'wait 600',
  'screenshot C:\\Projects\\Antigravity\\Smart_Daily_Plate\\.tmp\\concept_log_meals.png',
  'close'
];

const cmdChain = commands.map(c => `npx.cmd agent-browser ${c}`).join(' && ');

console.log('Capturing Recipe modal and Log screen with agent-browser...');
try {
  execSync(cmdChain, { encoding: 'utf-8', shell: 'cmd.exe', stdio: 'inherit' });
  
  const files = [
    'concept_home_recipe_modal.png',
    'concept_log_meals.png'
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
