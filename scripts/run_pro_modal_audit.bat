@echo off
set ART=C:\Users\Test\.gemini\antigravity\brain\e14186d0-286e-4a77-87b9-a0b6fcb4a34f

call agent-browser open http://localhost:5173
call agent-browser set viewport 390 844
call agent-browser wait 500
call agent-browser eval "(() => { const s = document.querySelector('#splash-screen-overlay'); if (s) s.click(); })()"
call agent-browser wait 600
call agent-browser eval "(() => { const x = document.querySelector('#wizard-close-x-btn'); if (x) x.click(); })()"
call agent-browser wait 600

echo === Open PRO subscription modal ===
call agent-browser click #btn-header-pro-status
call agent-browser wait 800
call agent-browser screenshot %ART%\audit_pro_modal_euro_pricing.png

call agent-browser close
echo === DONE ===
