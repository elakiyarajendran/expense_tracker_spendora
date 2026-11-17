@echo off
title Spendora Launcher
echo ==========================================================
echo     SPENDORA - Smart Expense Tracker (React + Django)     
echo ==========================================================

cd /d %~dp0backend
echo [1/3] Preparing Database...
python manage.py migrate
python manage.py seed_data

echo [2/3] Starting Django Backend on port 8000...
start "Spendora Backend (Django)" cmd /k "python manage.py runserver 8000"

cd /d %~dp0frontend
echo [3/3] Starting React Frontend on port 5173...
start "Spendora Frontend (React)" cmd /k "npm run dev"

echo ==========================================================
echo Application launched!
echo Open http://localhost:5173 in your browser.
echo Login: elakiya@spendora.app / password123
echo ==========================================================
pause
