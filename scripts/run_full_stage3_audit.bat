@echo off
set ART=C:\Users\Test\.gemini\antigravity\brain\e14186d0-286e-4a77-87b9-a0b6fcb4a34f

echo === 1. Launch Mobile Viewport 390x844 & Open App ===
call npx.cmd agent-browser set viewport 390 844
call npx.cmd agent-browser open https://smart-daily-plate.vercel.app
call npx.cmd agent-browser wait 2800

echo === 2. Step 1: Goal ===
call npx.cmd agent-browser screenshot %ART%\qa_v7_01_wizard_step1.png
call npx.cmd agent-browser click #wizard-step1-next
call npx.cmd agent-browser wait 600

echo === 3. Step 2: Gender and Age ===
call npx.cmd agent-browser screenshot %ART%\qa_v7_02_wizard_step2.png
call npx.cmd agent-browser click #wizard-step2-next
call npx.cmd agent-browser wait 600

echo === 4. Step 3: Body Metrics (Weight / Height / BMR) ===
call npx.cmd agent-browser screenshot %ART%\qa_v7_03_wizard_step3.png
call npx.cmd agent-browser click #wizard-step2-next
call npx.cmd agent-browser wait 600

echo === 5. Step 4: Activity & Protein Supplement ===
call npx.cmd agent-browser screenshot %ART%\qa_v7_04_wizard_step4_protein.png
call npx.cmd agent-browser click #wizard-step4-next
call npx.cmd agent-browser wait 600

echo === 6. Step 5: Eating Rhythm (3 vs 5) & Pace & Yo-Yo Advice ===
call npx.cmd agent-browser screenshot %ART%\qa_v7_05_wizard_step5_rhythm.png
call npx.cmd agent-browser click #wizard-step5-next
call npx.cmd agent-browser wait 800

echo === 7. Step 6: 4 Macro Columns & Relaxed Registration Gate ===
call npx.cmd agent-browser screenshot %ART%\qa_v7_06_wizard_step6_relaxed_gate.png
call npx.cmd agent-browser fill #wizard-email-input "тестовий юзер"
call npx.cmd agent-browser wait 400
call npx.cmd agent-browser click #wizard-submit-btn
call npx.cmd agent-browser wait 1200

echo === 8. Home Dashboard After Relaxed Registration ===
call npx.cmd agent-browser screenshot %ART%\qa_v7_07_home_after_registration.png

echo === 9. Open Chef Hub via Dock Quick Add Button ===
call npx.cmd agent-browser click #btn-dock-quick-add
call npx.cmd agent-browser wait 800
call npx.cmd agent-browser screenshot %ART%\qa_v7_08_chef_hub_locked_pro.png

echo === 10. Open PRO Paywall Modal ===
call npx.cmd agent-browser click "button[title*='Ресторанна']"
call npx.cmd agent-browser wait 700
call npx.cmd agent-browser screenshot %ART%\qa_v7_09_pro_paywall_modal.png

echo === 11. Activate NUTRIQ PRO (Test Mode) ===
call npx.cmd agent-browser click "button:has-text('Оформити NUTRIQ PRO')"
call npx.cmd agent-browser wait 800
call npx.cmd agent-browser click "button:has-text('Активувати NUTRIQ PRO')"
call npx.cmd agent-browser wait 2200

echo === 12. Chef Hub Unlocked With Restaurant Dishes ===
call npx.cmd agent-browser screenshot %ART%\qa_v7_10_chef_hub_unlocked_pro.png

echo === 13. Check Console Errors & Close ===
call npx.cmd agent-browser errors
call npx.cmd agent-browser close

echo === Finished Stage 3.4 Full Audit ===
