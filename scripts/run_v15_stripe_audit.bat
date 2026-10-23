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

echo === 2. Open PRO Subscription Modal ===
call agent-browser click #btn-open-pro-modal
call agent-browser wait 1000
call agent-browser screenshot %ART%\audit_stage5_2_01_pro_subscription_modal.png

echo === 3. Click Simulator Activation ===
call agent-browser click #btn-activate-pro-simulator
call agent-browser wait 2000

echo === 4. Re-open PRO Modal to inspect Active Verified Status ===
call agent-browser click #btn-open-pro-modal
call agent-browser wait 1000
call agent-browser screenshot %ART%\audit_stage5_2_02_pro_active_status.png

call agent-browser close
echo === V15 STRIPE AUDIT COMPLETE ===
