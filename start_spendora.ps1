Write-Host "==========================================================" -ForegroundColor Green
Write-Host "    SPENDORA - Smart Expense Tracker (React + Django)     " -ForegroundColor Yellow
Write-Host "==========================================================" -ForegroundColor Green

$backendPath = Join-Path $PSScriptRoot "backend"
$frontendPath = Join-Path $PSScriptRoot "frontend"

Write-Host "`n[1/3] Applying migrations and checking database..." -ForegroundColor Cyan
Set-Location $backendPath
python manage.py migrate
python manage.py seed_data

Write-Host "`n[2/3] Starting Django REST Backend on http://localhost:8000..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$backendPath'; python manage.py runserver 8000"

Write-Host "`n[3/3] Starting React Frontend on http://localhost:5173..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$frontendPath'; npm run dev"

Write-Host "`nSpendora is starting up!" -ForegroundColor Green
Write-Host "Open your browser at: http://localhost:5173" -ForegroundColor White
Write-Host "Demo Credentials: elakiya@spendora.app / password123 (or use 1-Click Demo Login)" -ForegroundColor Yellow
Write-Host "==========================================================" -ForegroundColor Green
