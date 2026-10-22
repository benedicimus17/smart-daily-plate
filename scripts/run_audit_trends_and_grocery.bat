@echo off
set ART=C:\Users\Test\.gemini\antigravity\brain\e14186d0-286e-4a77-87b9-a0b6fcb4a34f

call agent-browser open http://localhost:5173
call agent-browser set viewport 390 844
call agent-browser wait 500
call agent-browser eval "(() => { const s = document.querySelector('#splash-screen-overlay'); if (s) s.click(); })()"
call agent-browser wait 600
call agent-browser eval "(() => { const x = document.querySelector('#wizard-close-x-btn'); if (x) x.click(); })()"
call agent-browser wait 600

echo === 1. Go to Trends tab (True Fat Trend) ===
call agent-browser click #tab-nav-trends
call agent-browser wait 1000
call agent-browser screenshot %ART%\audit_trends_01_true_fat_trend.png

echo === 2. Switch to Smart Grocery List subtab ===
call agent-browser click #tab-sub-grocery
call agent-browser wait 1000
call agent-browser screenshot %ART%\audit_trends_02_smart_grocery_list.png

echo === 3. Go to Log tab ===
call agent-browser click #tab-nav-log
call agent-browser wait 1000
call agent-browser screenshot %ART%\audit_trends_03_log_with_pot_button.png

echo === 4. Click Cook-Loss pot button ===
call agent-browser eval "(() => { const btns = Array.from(document.querySelectorAll('button')); const pot = btns.find(b => b.innerText && b.innerText.includes('Уварка')); if (pot) pot.click(); })()"
call agent-browser wait 1000
call agent-browser screenshot %ART%\audit_trends_04_cook_loss_modal.png

call agent-browser close
echo === AUDIT COMPLETE ===
