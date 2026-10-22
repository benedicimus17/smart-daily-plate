@echo off
call npx.cmd agent-browser set viewport 390 844
call npx.cmd agent-browser open https://smart-daily-plate.vercel.app
call npx.cmd agent-browser wait 3000
call npx.cmd agent-browser screenshot C:\Users\Test\.gemini\antigravity\brain\e14186d0-286e-4a77-87b9-a0b6fcb4a34f\test_step1.png
call npx.cmd agent-browser click #wizard-step1-next
call npx.cmd agent-browser wait 800
call npx.cmd agent-browser screenshot C:\Users\Test\.gemini\antigravity\brain\e14186d0-286e-4a77-87b9-a0b6fcb4a34f\test_step2.png
call npx.cmd agent-browser close
