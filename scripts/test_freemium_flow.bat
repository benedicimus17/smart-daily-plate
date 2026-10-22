@echo off
set ART=C:\Users\Test\.gemini\antigravity\brain\e14186d0-286e-4a77-87b9-a0b6fcb4a34f

echo === 1. Click Center [+] to open Chef Hub ===
call npx.cmd agent-browser click #tab-nav-quickadd
call npx.cmd agent-browser wait 800
call npx.cmd agent-browser screenshot %ART%\qa_v7_08_chef_hub_locked_pro.png

echo === 2. Open PRO Subscription Modal via Header Pill ===
call npx.cmd agent-browser click "button[class*='absolute top-4 right-4']"
call npx.cmd agent-browser wait 500
call npx.cmd agent-browser click #btn-header-pro-status
call npx.cmd agent-browser wait 800
call npx.cmd agent-browser screenshot %ART%\qa_v7_09_pro_paywall_modal.png

echo === 3. Activate PRO in Test Mode ===
call npx.cmd agent-browser click "button:has-text('Активувати NUTRIQ PRO')"
call npx.cmd agent-browser wait 2200
call npx.cmd agent-browser screenshot %ART%\qa_v7_09b_home_pro_activated.png

echo === 4. Open Chef Hub again to verify Restaurant Dishes are Unlocked ===
call npx.cmd agent-browser click #tab-nav-quickadd
call npx.cmd agent-browser wait 1000
call npx.cmd agent-browser screenshot %ART%\qa_v7_10_chef_hub_unlocked_pro.png

echo === 5. Check Console Errors and Close ===
call npx.cmd agent-browser errors
call npx.cmd agent-browser close

echo === Freemium Flow Test Complete ===
