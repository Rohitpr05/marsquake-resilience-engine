@echo off
echo ============================================
echo   MARSQUAKE SIMULATOR - DIAGNOSTICS
echo ============================================
echo.

echo [1] Checking Python Installation...
py -3.13 --version 2>nul
if errorlevel 1 (
    echo ✗ Python 3.13 NOT found
    py --version 2>nul
    if errorlevel 1 (
        echo ✗ No Python found at all!
    )
) else (
    echo ✓ Python 3.13 found
)

echo.
echo [2] Checking Node.js Installation...
node --version 2>nul
if errorlevel 1 (
    echo ✗ Node.js NOT found
) else (
    echo ✓ Node.js found
)

echo.
echo [3] Checking npm Installation...
npm --version 2>nul
if errorlevel 1 (
    echo ✗ npm NOT found
) else (
    echo ✓ npm found
)

echo.
echo [4] Checking Python Packages...
py -3.13 -c "import fastapi; print('✓ fastapi installed')" 2>nul || echo ✗ fastapi NOT installed
py -3.13 -c "import uvicorn; print('✓ uvicorn installed')" 2>nul || echo ✗ uvicorn NOT installed
py -3.13 -c "import numpy; print('✓ numpy installed')" 2>nul || echo ✗ numpy NOT installed
py -3.13 -c "import pandas; print('✓ pandas installed')" 2>nul || echo ✗ pandas NOT installed

echo.
echo [5] Checking Project Files...
if exist "api_server.py" (echo ✓ api_server.py found) else (echo ✗ api_server.py MISSING)
if exist "config.py" (echo ✓ config.py found) else (echo ✗ config.py MISSING)
if exist "marsquake-ui" (echo ✓ marsquake-ui folder found) else (echo ✗ marsquake-ui folder MISSING)
if exist "marsquake-ui\package.json" (echo ✓ package.json found) else (echo ✗ package.json MISSING)
if exist "marsquake-ui\.env.local" (echo ✓ .env.local found) else (echo ✗ .env.local MISSING - will create)

echo.
echo [6] Checking Data Directories...
if exist "data\synthetic" (echo ✓ data\synthetic exists) else (
    echo ✗ data\synthetic missing - creating...
    mkdir data\synthetic 2>nul
    echo ✓ Created data\synthetic
)
if exist "outputs\plots" (echo ✓ outputs\plots exists) else (
    echo ✗ outputs\plots missing - creating...
    mkdir outputs\plots 2>nul
    echo ✓ Created outputs\plots
)

echo.
echo [7] Testing Backend Port...
netstat -an | findstr "8000" >nul
if errorlevel 1 (
    echo ✓ Port 8000 is available
) else (
    echo ⚠ Port 8000 is in use - backend may already be running
)

echo.
echo [8] Testing Frontend Port...
netstat -an | findstr "3000" >nul
if errorlevel 1 (
    echo ✓ Port 3000 is available
) else (
    echo ⚠ Port 3000 is in use - frontend may already be running
)

echo.
echo [9] Testing Backend Connection...
curl -s http://localhost:8000 >nul 2>&1
if errorlevel 1 (
    echo ✗ Backend NOT responding at http://localhost:8000
    echo   Start it with: py -3.13 api_server.py
) else (
    echo ✓ Backend is responding at http://localhost:8000
)

echo.
echo ============================================
echo   DIAGNOSTIC COMPLETE
echo ============================================
echo.
echo If you see ✗ symbols above, fix those issues first.
echo Then run: START_COMPLETE.bat
echo.
pause