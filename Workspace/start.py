#!/usr/bin/env python3
"""
Quick start script for the Airport Turbulence Visualization System
"""

import os
import sys
import subprocess
import time
from pathlib import Path

def run_command(command, cwd=None):
    """Run a command and return the result."""
    try:
        result = subprocess.run(command, shell=True, cwd=cwd, capture_output=True, text=True)
        return result.returncode == 0, result.stdout, result.stderr
    except Exception as e:
        return False, "", str(e)

def check_python():
    """Check if Python is available."""
    success, stdout, stderr = run_command("python --version")
    if not success:
        success, stdout, stderr = run_command("python3 --version")
    return success

def install_requirements():
    """Install Python requirements."""
    print("📦 Installing Python requirements...")
    success, stdout, stderr = run_command("pip install -r requirements.txt")
    if not success:
        print(f"❌ Failed to install requirements: {stderr}")
        return False
    print("✅ Requirements installed successfully")
    return True

def initialize_database():
    """Initialize the SQLite database."""
    print("🗄️  Initializing database...")
    success, stdout, stderr = run_command("python backend/init_db.py")
    if not success:
        print(f"❌ Failed to initialize database: {stderr}")
        return False
    print("✅ Database initialized successfully")
    return True

def fetch_initial_data():
    """Fetch initial weather data."""
    print("🌤️  Fetching initial weather data...")
    success, stdout, stderr = run_command("python backend/weather.py")
    if success:
        print("✅ Initial data fetched successfully")
    else:
        print(f"⚠️  Warning: Could not fetch initial data: {stderr}")
        print("   The app will still work, but may have no data initially.")
    return True

def start_backend():
    """Start the Flask backend server."""
    print("🚀 Starting backend server...")
    print("   Backend will be available at: http://localhost:5000")
    print("   API documentation at: http://localhost:5000/api/docs")
    
    # Start backend in background
    subprocess.Popen([sys.executable, "backend/app.py"], cwd=os.getcwd())
    
    # Wait a moment for server to start
    time.sleep(3)
    return True

def start_frontend():
    """Start the frontend server."""
    print("🌐 Starting frontend server...")
    print("   Frontend will be available at: http://localhost:8080")
    
    # Change to frontend directory and start server
    frontend_path = Path("frontend")
    subprocess.Popen([sys.executable, "-m", "http.server", "8080"], cwd=frontend_path)
    
    return True

def main():
    """Main setup and start function."""
    print("🌪️  Airport Turbulence Visualization System - Quick Start")
    print("=" * 60)
    
    # Check Python
    if not check_python():
        print("❌ Python is not available. Please install Python 3.7+ and try again.")
        return False
    
    # Install requirements
    if not install_requirements():
        return False
    
    # Initialize database
    if not initialize_database():
        return False
    
    # Fetch initial data
    fetch_initial_data()
    
    # Start backend
    if not start_backend():
        return False
    
    # Start frontend
    if not start_frontend():
        return False
    
    print("\n🎉 Setup complete!")
    print("\n📱 Access the application:")
    print("   • Frontend: http://localhost:8080")
    print("   • Backend API: http://localhost:5000")
    print("   • API Docs: http://localhost:5000/api/docs")
    print("\n🔄 The system will automatically fetch new weather data every 30 minutes.")
    print("\n⚠️  Note: Keep this terminal open to keep the servers running.")
    print("   Press Ctrl+C to stop all servers.")
    
    try:
        # Keep script running
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        print("\n\n🛑 Shutting down servers...")
        print("✅ Servers stopped. Thank you for using the Turbulence Visualization System!")

if __name__ == "__main__":
    main()
