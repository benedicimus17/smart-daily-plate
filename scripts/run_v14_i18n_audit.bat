@echo off
set ART=C:\Users\Test\.gemini\antigravity\brain\e14186d0-286e-4a77-87b9-a0b6fcb4a34f

call agent-browser open http://localhost:5173
call agent-browser set viewport 390 844
call agent-browser wait 500
call agent-browser eval "(() => { const s = document.querySelector('#splash-screen-overlay'); if (s) s.click(); })()"
call agent-browser wait 600
call agent-browser eval "(() => { const x = document.querySelector('#wizard-close-x-btn'); if (x) x.click(); })()"
call agent-browser wait 600

echo === 1. Go to Profile Tab ===
call agent-browser click #tab-profile
call agent-browser wait 800

echo === 2. Open Language Selector ===
call agent-browser click #btn-open-language-selector
call agent-browser wait 800
call agent-browser screenshot %ART%\audit_stage5_01_language_selector_modal.png

echo === 3. Select Spanish (Espanol) ===
call agent-browser click #btn-lang-es
call agent-browser wait 800
call agent-browser screenshot %ART%\audit_stage5_02_profile_in_spanish.png

echo === 4. Go to Trends/Weight tab (Now in Spanish: Progreso / Mi peso) ===
call agent-browser click #tab-nav-trends
call agent-browser wait 800
call agent-browser screenshot %ART%\audit_stage5_03_weight_in_spanish.png

call agent-browser close
echo === V14 AUDIT COMPLETE ===
