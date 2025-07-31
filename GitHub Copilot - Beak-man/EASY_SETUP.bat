@echo off
echo ==========================================
echo Airport Turbulence Visualization Setup
echo ==========================================
echo.

echo [1/6] Checking Python installation...
python --version
if %errorlevel% neq 0 (
    echo ERROR: Python is not installed or not in PATH
    echo Please install Python from https://python.org/downloads/
    echo Make sure to check "Add Python to PATH" during installation
    pause
    exit /b 1
)

echo [2/6] Installing required libraries...
pip install flask flask-cors requests
if %errorlevel% neq 0 (
    echo ERROR: Failed to install libraries
    echo Try: python -m pip install flask flask-cors requests
    pause
    exit /b 1
)

echo [3/6] Setting up database...
python backend/init_db.py
if %errorlevel% neq 0 (
    echo ERROR: Database setup failed
    pause
    exit /b 1
)

echo [4/6] Fetching initial weather data...
python backend/weather.py
if %errorlevel% neq 0 (
    echo ERROR: Weather data fetch failed
    echo This might be due to network issues - you can try again later
)

echo [5/6] Starting backend server...
echo Opening backend server in new window...
start "Backend Server" cmd /k "python backend/app.py"

echo [6/6] Starting frontend server...
echo Opening frontend server in new window...
cd frontend
start "Frontend Server" cmd /k "python -m http.server 8080"

echo.
echo ==========================================
echo SUCCESS! Setup complete!
echo ==========================================
echo.
echo The application should now be running:
echo - Backend: http://localhost:5000
echo - Frontend: http://localhost:8080
echo.
echo Opening your web browser in 3 seconds...
timeout /t 3 /nobreak >nul
start http://localhost:8080

echo.
echo IMPORTANT: Keep both server windows open while using the app
echo Close this window when you're done
pause
