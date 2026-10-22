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
call agent-browser screenshot %ART%\audit_stage4_01_profile_legal_section.png

echo === 2. Open Privacy Policy Modal ===
call agent-browser click #btn-open-privacy-policy
call agent-browser wait 800
call agent-browser screenshot %ART%\audit_stage4_02_privacy_policy_modal.png

echo === 3. Switch to Terms of Service ===
call agent-browser eval "(() => { const btns = Array.from(document.querySelectorAll('button')); const t = btns.find(b => b.innerText && b.innerText.includes('Умови використання')); if (t) t.click(); })()"
call agent-browser wait 800
call agent-browser screenshot %ART%\audit_stage4_03_terms_of_service_modal.png

echo === 4. Close Legal Modal ===
call agent-browser click #btn-close-legal-modal
call agent-browser wait 600

echo === 5. Open Delete Account Confirmation Dialog ===
call agent-browser click #btn-delete-all-data
call agent-browser wait 800
call agent-browser screenshot %ART%\audit_stage4_04_delete_account_dialog.png

call agent-browser close
echo === V13 AUDIT COMPLETE ===
