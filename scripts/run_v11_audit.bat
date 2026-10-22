@echo off
set ART=C:\Users\Test\.gemini\antigravity\brain\e14186d0-286e-4a77-87b9-a0b6fcb4a34f

call agent-browser open http://localhost:5173
call agent-browser set viewport 390 844
call agent-browser wait 500
call agent-browser eval "(() => { const s = document.querySelector('#splash-screen-overlay'); if (s) s.click(); })()"
call agent-browser wait 600
call agent-browser eval "(() => { const x = document.querySelector('#wizard-close-x-btn'); if (x) x.click(); })()"
call agent-browser wait 600

echo === 1. Open Chef Hub and search pizza in English ===
call agent-browser click #tab-nav-quickadd
call agent-browser wait 800
call agent-browser fill #chef-catalog-search-input "pizza"
call agent-browser wait 800
call agent-browser screenshot %ART%\qa_v11_01_search_pizza_english.png

echo === 2. Open locked PRO Pizza modal ===
call agent-browser eval "(() => { const cards = Array.from(document.querySelectorAll('div')).filter(d => d.innerText && d.innerText.includes('Quattro Formaggi')); if (cards[0]) { const btn = cards[0].querySelector('button') || cards[0]; btn.click(); } })()"
call agent-browser wait 800
call agent-browser screenshot %ART%\qa_v11_02_pro_modal_single_button.png

echo === 3. Close modals and go to Log screen ===
call agent-browser eval "(() => { const b = document.querySelector('#chef-hub-locked-dish-backdrop'); if (b) b.click(); })()"
call agent-browser wait 500
call agent-browser eval "(() => { const b2 = document.querySelector('#chef-hub-backdrop'); if (b2) b2.click(); })()"
call agent-browser wait 500

call agent-browser click #tab-nav-log
call agent-browser wait 1000
call agent-browser screenshot %ART%\qa_v11_03_log_with_align_button.png

echo === 4. Click auto-align menu button ===
call agent-browser click #btn-auto-align-menu
call agent-browser wait 1000
call agent-browser screenshot %ART%\qa_v11_04_menu_auto_aligned_to_targets.png

call agent-browser close
echo === AUDIT COMPLETE ===
