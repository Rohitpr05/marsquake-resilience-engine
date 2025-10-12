@echo off
echo ============================================
echo   TESTING BACKEND CONNECTION
echo ============================================
echo.

echo Testing backend API at http://localhost:8000...
curl -s http://localhost:8000 || echo ERROR: Backend not responding!

echo.
echo Testing API endpoints:

echo - Events endpoint...
curl -s http://localhost:8000/api/events | findstr "timestamp" || echo No events

echo - Metrics endpoint...
curl -s http://localhost:8000/api/metrics | findstr "mars_sol" || echo No metrics

echo - Structures endpoint...
curl -s http://localhost:8000/api/structures | findstr "name" || echo No structures

echo.
echo ============================================
echo If you see JSON data above, backend is working!
echo If you see errors, make sure to run: py -3.13 api_server.py
echo ============================================
pause