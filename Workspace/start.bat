@echo off
echo 🌪️ Airport Turbulence Visualization System - Quick Start
echo ==========================================================

echo.
echo 📦 Installing Python requirements...
pip install flask requests flask-cors python-dotenv

echo.
echo 🗄️ Initializing database...
python backend/init_db.py

echo.
echo 🌤️ Fetching initial weather data...
python backend/weather.py

echo.
echo 🚀 Starting backend server...
echo    Backend API: http://localhost:5000
echo    API Docs: http://localhost:5000/api/docs
start /B python backend/app_with_scheduler.py

echo.
echo 🌐 Starting frontend server...
echo    Frontend: http://localhost:8080
cd frontend
start /B python -m http.server 8080
cd ..

echo.
echo 🎉 Setup complete!
echo.
echo 📱 Access the application:
echo    • Frontend: http://localhost:8080
echo    • Backend API: http://localhost:5000
echo    • API Docs: http://localhost:5000/api/docs
echo.
echo 🔄 The system will automatically fetch new weather data every 30 minutes.
echo.
echo ⚠️ Keep this window open to keep servers running.
echo    Press any key to stop all servers...

pause > nul

echo.
echo 🛑 Shutting down servers...
taskkill /F /IM python.exe 2>nul
echo ✅ Servers stopped. Thank you for using the Turbulence Visualization System!
