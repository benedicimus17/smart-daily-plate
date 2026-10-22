@echo off
set ART=C:\Users\Test\.gemini\antigravity\brain\e14186d0-286e-4a77-87b9-a0b6fcb4a34f

call npx.cmd agent-browser set viewport 390 844
call npx.cmd agent-browser open https://smart-daily-plate.vercel.app
call npx.cmd agent-browser wait 2500

echo === 1. Click Center Dock to open Chef Hub ===
call npx.cmd agent-browser click #tab-nav-quickadd
call npx.cmd agent-browser wait 800
call npx.cmd agent-browser screenshot %ART%\qa_v7_08_chef_hub_locked_pro.png

echo === 2. Close Chef Hub ===
call npx.cmd agent-browser click #btn-close-chef-hub
call npx.cmd agent-browser wait 500

echo === 3. Click Header PRO Status Pill to open ProSubscriptionModal ===
call npx.cmd agent-browser click #btn-header-pro-status
call npx.cmd agent-browser wait 700
call npx.cmd agent-browser screenshot %ART%\qa_v7_09_pro_paywall_modal.png

echo === 4. Click Activate PRO Test Mode ===
call npx.cmd agent-browser click #btn-activate-pro-test
call npx.cmd agent-browser wait 2200

echo === 5. Click Center Dock to open Chef Hub again ===
call npx.cmd agent-browser click #tab-nav-quickadd
call npx.cmd agent-browser wait 800
call npx.cmd agent-browser screenshot %ART%\qa_v7_10_chef_hub_unlocked_pro.png

echo === 6. Check errors and close ===
call npx.cmd agent-browser errors
call npx.cmd agent-browser close

echo === Freemium test finished ===
