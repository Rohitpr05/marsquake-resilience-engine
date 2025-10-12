@echo off
echo ============================================
echo   MARSQUAKE SIMULATOR - COMPLETE STARTUP
echo ============================================
echo.

echo [STEP 1] Checking Python...
py -3.13 --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Python 3.13 not found!
    echo Please install Python 3.13+ from python.org
    pause
    exit /b 1
)
echo ✓ Python found

echo.
echo [STEP 2] Checking Node.js...
node --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Node.js not found!
    echo Please install Node.js from nodejs.org
    pause
    exit /b 1
)
echo ✓ Node.js found

echo.
echo [STEP 3] Installing Python dependencies...
pip install -q fastapi uvicorn numpy pandas scipy scikit-learn perlin-noise
echo ✓ Python dependencies installed

echo.
echo [STEP 4] Installing Node.js dependencies...
cd marsquake-ui
if not exist "node_modules" (
    echo Installing npm packages... (this may take a minute)
    call npm install
)
cd ..
echo ✓ Node.js dependencies installed

echo.
echo [STEP 5] Creating configuration file...
echo NEXT_PUBLIC_API_URL=http://localhost:8000 > marsquake-ui\.env.local
echo ✓ Configuration file created

echo.
echo [STEP 6] Starting Backend API Server...
start "Marsquake Backend [PORT 8000]" cmd /k "py -3.13 api_server.py"
echo Waiting for backend to initialize...
timeout /t 5 /nobreak > nul

echo.
echo [STEP 7] Testing backend connection...
curl -s http://localhost:8000 >nul 2>&1
if errorlevel 1 (
    echo WARNING: Backend may not be ready yet
    echo If frontend doesn't work, restart this script
) else (
    echo ✓ Backend is responding
)

echo.
echo [STEP 8] Starting Frontend Application...
cd marsquake-ui
start "Marsquake Frontend [PORT 3000]" cmd /k "npm run dev"
cd ..

echo.
echo ============================================
echo   STARTUP COMPLETE!
echo ============================================
echo.
echo Backend API:  http://localhost:8000
echo Frontend UI:  http://localhost:3000
echo API Docs:     http://localhost:8000/docs
echo.
echo NEXT STEPS:
echo 1. Wait for "Ready" message in both windows
echo 2. Open http://localhost:3000 in your browser
echo 3. Click the START button to begin simulation
echo.
echo To STOP: Close both command windows
echo.
echo If you see errors, check RUNNING_GUIDE.md
echo.
pause