@echo off
echo ============================================
echo   MARSQUAKE SIMULATOR - STARTING SERVICES
echo ============================================
echo.

REM Check Python installation
python --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Python is not installed or not in PATH!
    pause
    exit /b 1
)

REM Check Node.js installation
node --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Node.js is not installed or not in PATH!
    pause
    exit /b 1
)

REM Create directories
echo Creating necessary directories...
if not exist "data\synthetic" mkdir data\synthetic
if not exist "outputs\plots" mkdir outputs\plots
if not exist "outputs\models" mkdir outputs\models

REM Install Python dependencies
echo.
echo Installing Python dependencies...
pip install -q -r requirements-api.txt

REM Install Node.js dependencies
echo.
echo Installing Node.js dependencies...
cd marsquake-ui
call npm install
cd ..

REM Start backend server
echo.
echo Starting backend API server...
start "Marsquake Backend" cmd /k python api_server.py

REM Wait for backend
echo Waiting for backend to initialize...
timeout /t 5 /nobreak > nul

REM Check backend status
curl -s http://localhost:8000 >nul 2>&1
if errorlevel 1 (
    echo ERROR: Backend failed to start!
    pause
    exit /b 1
)

echo Backend API ready at http://localhost:8000

REM Start frontend
echo.
echo Starting frontend application...
cd marsquake-ui
start "Marsquake Frontend" cmd /k npm run dev
cd ..

echo.
echo ============================================
echo   MARSQUAKE SIMULATOR IS RUNNING!
echo ============================================
echo.
echo Backend API: http://localhost:8000
echo Frontend UI: http://localhost:3000
echo API Docs:    http://localhost:8000/docs
echo.
echo Close both command windows to stop services
echo.
pause