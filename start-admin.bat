@echo off
echo Starting Number Game Application...
echo.

echo Starting Backend Server...
cd /d "%~dp0backend"
start cmd /k "npm run dev"

echo.
echo Waiting for backend to start...
timeout /t 5 /nobreak >nul

echo Starting Admin Panel...
cd /d "%~dp0admin"
start cmd /k "npm start"

echo.
echo Both services are starting...
echo Backend: http://localhost:5000
echo Admin Panel: http://localhost:3000
echo.
echo Default Admin Login:
echo Email: admin@numbergame.com
echo Password: Admin@123
echo.
pause
