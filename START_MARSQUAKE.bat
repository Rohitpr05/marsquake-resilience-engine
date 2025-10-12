@echo off
echo ============================================
echo   MARSQUAKE SIMULATOR - COMPLETE SETUP
echo ============================================
echo.

REM Check if we're in the right directory
if not exist "api_server.py" (
    echo ERROR: Please run this script from the marsquake-resilience-engine directory!
    pause
    exit /b 1
)

REM Create necessary directories
echo [1/6] Creating directories...
if not exist "data\synthetic" mkdir data\synthetic
if not exist "outputs\plots" mkdir outputs\plots
if not exist "outputs\models" mkdir outputs\models

REM Install Python dependencies
echo.
echo [2/6] Installing Python dependencies...
python -m pip install --quiet --upgrade pip
pip install --quiet -r requirements-api.txt
if errorlevel 1 (
    echo ERROR: Failed to install Python dependencies!
    pause
    exit /b 1
)

REM Install Node.js dependencies
echo.
echo [3/6] Installing Node.js dependencies...
cd marsquake-ui
call npm install --silent
if errorlevel 1 (
    echo ERROR: Failed to install Node.js dependencies!
    cd ..
    pause
    exit /b 1
)
cd ..

REM Start backend server
echo.
echo [4/6] Starting Python backend...
start "Marsquake Backend API" cmd /k "python api_server.py"

REM Wait for backend to initialize
echo.
echo [5/6] Waiting for backend to initialize...
timeout /t 8 /nobreak > nul

REM Verify backend is running
curl -s http://localhost:8000 > nul 2>&1
if errorlevel 1 (
    echo WARNING: Backend may not have started correctly
    echo Check the "Marsquake Backend API" window for errors
) else (
    echo Backend API ready at http://localhost:8000
)

REM Start frontend
echo.
echo [6/6] Starting Next.js frontend...
cd marsquake-ui
start "Marsquake Frontend UI" cmd /k "npm run dev"
cd ..

REM Wait for frontend
echo.
echo Waiting for frontend to compile...
timeout /t 10 /nobreak > nul

echo.
echo ============================================
echo   MARSQUAKE SIMULATOR IS RUNNING!
echo ============================================
echo.
echo Backend API:  http://localhost:8000
echo Frontend UI:  http://localhost:3000
echo API Docs:     http://localhost:8000/docs
echo.
echo USAGE:
echo 1. Open http://localhost:3000 in your browser
echo 2. Click the START button to begin simulation
echo 3. Watch seismic data animate in real-time
echo 4. Drag floating windows to rearrange
echo.
echo To stop: Close both command windows
echo.
echo Press any key to open the application in your browser...
pause > nul

REM Open browser
start http://localhost:3000

echo.
echo Application opened in browser!
echo Keep this window and the two service windows open.
echo.
pause