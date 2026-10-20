# QA Audit Script for Smart Daily Plate (NutriQ)
$ErrorActionPreference = "Stop"

if (!(Test-Path "C:\Projects\Antigravity\Smart_Daily_Plate\.tmp")) {
    New-Item -ItemType Directory -Path "C:\Projects\Antigravity\Smart_Daily_Plate\.tmp" | Out-Null
}

$commands = @(
    "open https://smart-daily-plate.vercel.app/?v=8",
    "set viewport 390 844",
    "wait 2500",
    "screenshot C:\Projects\Antigravity\Smart_Daily_Plate\.tmp\qa_01_home.png",
    "click ""text=Налаштувати «Мій План»""",
    "wait 600",
    "screenshot C:\Projects\Antigravity\Smart_Daily_Plate\.tmp\qa_02_wizard_step1.png",
    "click ""text=Далі""",
    "wait 500",
    "screenshot C:\Projects\Antigravity\Smart_Daily_Plate\.tmp\qa_03_wizard_step2.png",
    "click ""text=Далі""",
    "wait 500",
    "screenshot C:\Projects\Antigravity\Smart_Daily_Plate\.tmp\qa_04_wizard_step3.png",
    "click ""text=Далі""",
    "wait 500",
    "screenshot C:\Projects\Antigravity\Smart_Daily_Plate\.tmp\qa_05_wizard_step4.png",
    "click ""text=Далі""",
    "wait 500",
    "screenshot C:\Projects\Antigravity\Smart_Daily_Plate\.tmp\qa_06_wizard_step5_yoyo.png",
    "click ""text=Переглянути розрахунок""",
    "wait 600",
    "screenshot C:\Projects\Antigravity\Smart_Daily_Plate\.tmp\qa_07_wizard_step6_columns.png",
    "fill ""input[type='email']"" ""anna.diet@gmail.com""",
    "wait 300",
    "click ""text=Зареєструватися та перейти до меню""",
    "wait 1200",
    "screenshot C:\Projects\Antigravity\Smart_Daily_Plate\.tmp\qa_08_home_after_registration.png",
    "click ""text=Profile""",
    "wait 800",
    "screenshot C:\Projects\Antigravity\Smart_Daily_Plate\.tmp\qa_09_profile_screen.png",
    "errors",
    "close"
)

$chain = ($commands | ForEach-Object { "npx.cmd agent-browser $_" }) -join " && "
Write-Host "Executing chained agent-browser audit..."
cmd /c $chain
