@echo off
set ART=C:\Users\Test\.gemini\antigravity\brain\e14186d0-286e-4a77-87b9-a0b6fcb4a34f

call agent-browser open http://localhost:5173/?nocache=12345
call agent-browser set viewport 390 844
call agent-browser wait 500
call agent-browser eval "if ('serviceWorker' in navigator) { navigator.serviceWorker.getRegistrations().then(rs => rs.forEach(r => r.unregister())); caches.keys().then(ks => ks.forEach(k => caches.delete(k))); }"
call agent-browser wait 500
call agent-browser eval "(() => { const s = document.querySelector('#splash-screen-overlay'); if (s) s.click(); })()"
call agent-browser wait 600
call agent-browser eval "(() => { const x = document.querySelector('#wizard-close-x-btn'); if (x) x.click(); })()"
call agent-browser wait 600

echo === 1. Open Chef Hub (+) ===
call agent-browser click #tab-nav-quickadd
call agent-browser wait 1000

echo === 2. Search "tortilla" (Spanish dish) ===
call agent-browser fill #chef-catalog-search-input "tortilla"
call agent-browser wait 800
call agent-browser screenshot %ART%\audit_stage5_3_01_search_tortilla.png

echo === 3. Search "croissant" (French dish) ===
call agent-browser fill #chef-catalog-search-input "croissant"
call agent-browser wait 800
call agent-browser screenshot %ART%\audit_stage5_3_02_search_croissant.png

echo === 4. Search "pasta e fagioli" (Italian dish) ===
call agent-browser fill #chef-catalog-search-input "pasta e fagioli"
call agent-browser wait 800
call agent-browser screenshot %ART%\audit_stage5_3_03_search_pasta_fagioli.png

echo === 5. Search "kurka" (Ukrainian/Latin searching for Chicken/Pollo) ===
call agent-browser fill #chef-catalog-search-input "kurka"
call agent-browser wait 800
call agent-browser screenshot %ART%\audit_stage5_3_04_search_kurka.png

call agent-browser close
echo === V16 CROSS-MARKET AUDIT COMPLETE ===
