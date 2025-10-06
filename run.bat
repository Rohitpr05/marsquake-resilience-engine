@echo off
echo ============================================
echo   MARSQUAKE SIMULATOR
echo ============================================
echo.
echo Checking dependencies...
C:\Python312\python.exe -m pip install -q -r requirements.txt
echo.
echo Starting simulation...
echo.
C:\Python312\python.exe main.py
echo.
pause