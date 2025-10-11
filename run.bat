@echo off
echo ============================================
echo   MARSQUAKE SIMULATOR - STARTING
echo ============================================
echo.

cd /d "C:\Users\rprtu\desktop\marsquake-resilience-engine"

echo Installing required Python packages...
py -3 -m pip install flask flask-cors numpy pandas scipy scikit-learn perlin-noise

echo.
echo Starting Backend Server...
start "Marsquake Backend" cmd /k "py -3 flask_server.py"

echo Waiting for backend to start...
timeout /t 5 /nobreak > nul

echo.
echo Starting Frontend...
cd marsquake-ui
start "Marsquake Frontend" cmd /k "npm run dev"
cd ..

echo.
echo ============================================
echo   SERVICES RUNNING!
echo ============================================
echo.
echo Backend API: http://localhost:8000
echo Frontend UI: http://localhost:3000
echo.
echo Close both windows to stop services
echo.
pause