#!/usr/bin/env python3
"""
Airport Turbulence Visualization - Easy Setup Script
Automated setup for students and beta testers
"""

import subprocess
import sys
import os
import time
import webbrowser
from pathlib import Path

def run_command(command, description, critical=True):
    """Run a shell command and handle errors gracefully"""
    print(f"[SETUP] {description}...")
    try:
        result = subprocess.run(command, shell=True, check=True, capture_output=True, text=True)
        print(f"[SUCCESS] {description} completed")
        return True
    except subprocess.CalledProcessError as e:
        print(f"[ERROR] {description} failed:")
        print(f"Error: {e.stderr}")
        if critical:
            print("This is a critical step. Please fix the error and try again.")
            return False
        else:
            print("This step failed but isn't critical. Continuing...")
            return True

def check_python():
    """Check if Python is installed and accessible"""
    print("=" * 50)
    print("Airport Turbulence Visualization - Easy Setup")
    print("=" * 50)
    
    try:
        result = subprocess.run([sys.executable, "--version"], capture_output=True, text=True)
        print(f"[SUCCESS] Found Python: {result.stdout.strip()}")
        return True
    except:
        print("[ERROR] Python not found!")
        print("Please install Python from https://python.org/downloads/")
        print("Make sure to check 'Add Python to PATH' during installation")
        return False

def install_dependencies():
    """Install required Python packages"""
    packages = ["flask", "flask-cors", "requests"]
    command = f"{sys.executable} -m pip install {' '.join(packages)}"
    return run_command(command, "Installing Python libraries")

def setup_database():
    """Initialize the SQLite database"""
    return run_command(f"{sys.executable} backend/init_db.py", "Setting up database")

def fetch_weather_data():
    """Fetch initial weather data"""
    return run_command(f"{sys.executable} backend/weather.py", "Fetching weather data", critical=False)

def start_servers():
    """Start both backend and frontend servers"""
    print("\n[SETUP] Starting servers...")
    
    # Start backend server
    backend_cmd = f"{sys.executable} backend/app.py"
    print("[INFO] Starting backend server (port 5000)...")
    
    # Start frontend server
    frontend_cmd = f"{sys.executable} -m http.server 8080"
    print("[INFO] Starting frontend server (port 8080)...")
    
    if os.name == 'nt':  # Windows
        # Windows - open in new command windows
        subprocess.Popen(f'start "Backend Server" cmd /k "{backend_cmd}"', shell=True)
        os.chdir('frontend')
        subprocess.Popen(f'start "Frontend Server" cmd /k "{frontend_cmd}"', shell=True)
    else:  # Unix-like (Mac/Linux)
        # Unix - start in background
        with open('backend.log', 'w') as f:
            subprocess.Popen(backend_cmd.split(), stdout=f, stderr=f)
        
        os.chdir('frontend')
        with open('../frontend.log', 'w') as f:
            subprocess.Popen(frontend_cmd.split(), stdout=f, stderr=f)
    
    return True

def main():
    """Main setup function"""
    # Check current directory
    if not Path('backend').exists():
        print("[ERROR] Please run this script from the project root directory")
        print("The directory should contain 'backend' and 'frontend' folders")
        return False
    
    # Check Python installation
    if not check_python():
        return False
    
    # Install dependencies
    if not install_dependencies():
        return False
    
    # Setup database
    if not setup_database():
        return False
    
    # Fetch weather data
    fetch_weather_data()  # Non-critical, continues even if it fails
    
    # Start servers
    if not start_servers():
        return False
    
    # Success message
    print("\n" + "=" * 50)
    print("SUCCESS! Setup complete!")
    print("=" * 50)
    print("\nThe application should now be running:")
    print("- Backend:  http://localhost:5000")
    print("- Frontend: http://localhost:8080")
    
    print("\nOpening your web browser in 5 seconds...")
    print("IMPORTANT: Keep the server windows open while using the app")
    
    # Wait and open browser
    time.sleep(5)
    webbrowser.open('http://localhost:8080')
    
    print("\n[INFO] Setup complete! Enjoy your turbulence visualization!")
    return True

if __name__ == "__main__":
    success = main()
    if not success:
        print("\n[ERROR] Setup failed. Please check the error messages above.")
        print("For help, see STUDENT_SETUP_GUIDE.md")
        input("Press Enter to exit...")
        sys.exit(1)
    else:
        if os.name != 'nt':  # Not Windows
            print("\nPress Ctrl+C to stop the servers when you're done.")
            try:
                while True:
                    time.sleep(1)
            except KeyboardInterrupt:
                print("\n[INFO] Shutting down servers...")
                # Clean up processes if needed
