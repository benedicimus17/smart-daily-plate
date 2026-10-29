@echo off
set ART=C:\Users\Test\.gemini\antigravity\brain\1e7f6930-b0a7-432b-a314-19b3c1fd3804

echo === 1. Launching agent-browser ===
call agent-browser open http://localhost:5173
call agent-browser set viewport 390 844
call agent-browser wait 600

echo === 2. Setting Spanish as default and resetting onboarding state ===
call agent-browser eval "(() => { window.localStorage.clear(); window.localStorage.setItem('nutriq-locale-storage-v1', JSON.stringify({ state: { currentLanguage: 'es' }, version: 0 })); location.reload(); })()"
call agent-browser wait 1200

echo === 3. Dismissing Splash Screen if visible ===
call agent-browser eval "(() => { const s = document.querySelector('#splash-screen-overlay'); if (s) s.click(); })()"
call agent-browser wait 800

echo === 4. Screenshot Step 1 (Spanish Onboarding) ===
call agent-browser screenshot %ART%\audit_stage8_2_wizard_step1_es.png
call agent-browser wait 400

echo === 5. Testing Language Switcher (Switch to English) ===
call agent-browser click #wizard-lang-en
call agent-browser wait 600
call agent-browser screenshot %ART%\audit_stage8_2_wizard_step1_en.png

echo === 6. Switch back to Spanish for Spain Launch ===
call agent-browser click #wizard-lang-es
call agent-browser wait 600

echo === 7. Step 1: Goal -> Lose Weight ===
call agent-browser click #goal-lose_weight
call agent-browser wait 500

echo === 8. Step 2: Gender -> Female ===
call agent-browser click #gender-female
call agent-browser wait 500

echo === 9. Step 3: Age ===
call agent-browser fill #wizard-age-input 28
call agent-browser wait 300
call agent-browser click #wizard-age-next
call agent-browser wait 500

echo === 10. Step 4: Weight & Height ===
call agent-browser fill #wizard-weight-input 62
call agent-browser fill #wizard-height-input 168
call agent-browser wait 300
call agent-browser click #wizard-body-next
call agent-browser wait 500

echo === 11. Step 5: Activity ===
call agent-browser click #activity-light
call agent-browser wait 500

echo === 12. Step 6: Protein ===
call agent-browser click #protein-yes
call agent-browser wait 500

echo === 13. Step 7: Rhythm ===
call agent-browser click #rhythm-3meals
call agent-browser wait 500

echo === 14. Step 8: Pace ===
call agent-browser click #pace-steady
call agent-browser wait 500

echo === 15. Step 9: Dietary & Allergies (Screenshot) ===
call agent-browser click #wizard-allergen-lactose
call agent-browser wait 400
call agent-browser screenshot %ART%\audit_stage8_2_wizard_dietary_es.png
call agent-browser click #wizard-dietary-continue-btn
call agent-browser wait 600

echo === 16. Step 10: Summary & Calculations (Screenshot) ===
call agent-browser screenshot %ART%\audit_stage8_2_wizard_step10_es.png
call agent-browser wait 400

echo === 17. Guest Login to Dashboard ===
call agent-browser click #wizard-guest-btn
call agent-browser wait 1200

echo === 18. Dashboard in Spanish (Screenshot) ===
call agent-browser screenshot %ART%\audit_stage8_2_dashboard_es.png
call agent-browser wait 500

call agent-browser close
echo === STAGE 8.2 AUDIT COMPLETE ===
