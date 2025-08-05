# 🚀 Student Setup Guide: Airport Turbulence Visualization System

*A complete guide for high school students to get the project running on their computers*

---

## 🎯 What You'll Build

By the end of this guide, you'll have a **3D interactive globe** showing real-time airport turbulence data running on your computer! You'll be able to:
- See turbulence levels at major airports around the world
- Click on airports to get detailed weather information
- Watch the beautiful 3D Earth with atmospheric effects
- Understand how modern web applications work

---

## 📋 What You Need Before Starting

- **A computer** (Windows, Mac, or Linux)
- **Internet connection** (for downloading software and getting weather data)
- **1-2 hours** of time
- **Curiosity and patience** 😊

---

## 🛠️ Step 1: Install Python (The Programming Language)

### What is Python?
Python is a programming language that's easy to learn and widely used. Our weather data processing runs on Python.

### For Windows Users:
1. **Go to** https://www.python.org/downloads/
2. **Click** the big yellow "Download Python 3.12.x" button
3. **Run the installer** when it downloads
4. **⚠️ IMPORTANT:** Check the box that says "Add Python to PATH" during installation
5. **Click** "Install Now"
6. **Wait** for installation to complete (2-3 minutes)

### For Mac Users:
1. **Go to** https://www.python.org/downloads/
2. **Download** the macOS installer
3. **Open** the downloaded .pkg file
4. **Follow** the installation wizard
5. **Open Terminal** (press Cmd+Space, type "Terminal", press Enter)

### For Linux Users:
Most Linux systems have Python pre-installed. Open a terminal and check:
```bash
python3 --version
```

### ✅ Test Your Python Installation
1. **Open Command Prompt** (Windows) or **Terminal** (Mac/Linux)
   - Windows: Press Win+R, type `cmd`, press Enter
   - Mac: Press Cmd+Space, type "Terminal", press Enter
   - Linux: Press Ctrl+Alt+T
2. **Type:** `python --version` and press Enter
3. **You should see:** Something like "Python 3.12.x"

**🚨 If this doesn't work:** Ask for help! This is the most important step.

---

## 📁 Step 2: Download the Project Files

### Option A: Download ZIP (Easier)
1. **Go to** the project page on GitHub
2. **Click** the green "Code" button
3. **Click** "Download ZIP"
4. **Extract** the ZIP file to your Desktop
5. **Rename** the folder to `AirportTurbulenceAnalysis` (easier to type)

### Option B: Use Git (If you know how)
```bash
git clone https://github.com/WorldWindLabs/AirportTurbulenceAnalysis.git
cd AirportTurbulenceAnalysis
```

---

## 🔧 Step 3: Install Python Libraries

### What are Python Libraries?
Libraries are like "toolboxes" that contain pre-written code for specific tasks. We need libraries for:
- **Flask**: Creating a web server
- **Requests**: Getting weather data from the internet
- **Flask-CORS**: Allowing our web page to talk to our server

### Install the Libraries:
1. **Open Command Prompt/Terminal**
2. **Navigate to your project folder:**
   ```bash
   cd Desktop/AirportTurbulenceAnalysis/Workspace
   ```
   *Note: Adjust the path if you put the folder somewhere else*

3. **Install the required libraries:**
   ```bash
   pip install flask flask-cors requests
   ```
   
4. **Wait** for installation (1-2 minutes)
   - You'll see lots of text scrolling by - this is normal!
   - Don't worry if you see some warnings

### 🚨 Troubleshooting Installation Issues:

**If you get "pip is not recognized":**
- Try `python -m pip install flask flask-cors requests`

**If you get permission errors on Mac/Linux:**
- Try `pip3 install flask flask-cors requests`

**If you get "Python is not recognized":**
- You need to reinstall Python and make sure to check "Add to PATH"

---

## 🗄️ Step 4: Set Up the Database

### What is a Database?
A database stores information. Ours will store airport information and weather data history.

### Create the Database:
1. **In your Command Prompt/Terminal** (still in the project folder):
   ```bash
   python backend/init_db.py
   ```

2. **You should see:**
   ```
   Database initialized successfully!
   Sample airports added.
   ```

3. **If you see an error:** Double-check you're in the right folder and Python is working.

---

## ☁️ Step 5: Get Initial Weather Data

### Fetch Weather Information:
1. **Run the weather data fetcher:**
   ```bash
   python backend/weather.py
   ```

2. **You should see:**
   ```
   Fetching weather data for airports...
   Weather data updated successfully for X airports.
   ```

3. **This might take 30-60 seconds** - be patient! It's downloading real weather data from the internet.

---

## 🌐 Step 6: Start the Backend Server

### What is a Backend Server?
The backend is like a waiter in a restaurant - it takes requests for data and serves the information back to the website.

### Start the Server:
1. **Open a NEW Command Prompt/Terminal window** (keep the old one open too)
2. **Navigate to your project folder again:**
   ```bash
   cd Desktop/AirportTurbulenceAnalysis/Workspace
   ```

3. **Start the server:**
   ```bash
   python backend/app.py
   ```

4. **You should see something like:**
   ```
   * Running on http://127.0.0.1:5000
   * Debug mode: on
   ```

5. **🎉 Success!** Your backend server is now running!

**⚠️ IMPORTANT:** 
- Don't close this window while using the app
- This window will show activity when the website requests data

---

## 🖥️ Step 7: Start the Frontend Website

### What is a Frontend?
The frontend is the part you see and interact with - the 3D globe and controls.

### Start the Website Server:
1. **Open ANOTHER Command Prompt/Terminal window** (so you have 3 total now)
2. **Navigate to the frontend folder:**
   ```bash
   cd Desktop/AirportTurbulenceAnalysis/Workspace/frontend
   ```

3. **Start the web server:**
   ```bash
   python -m http.server 8080
   ```

4. **You should see:**
   ```
   Serving HTTP on 0.0.0.0 port 8080...
   ```

---

## 🌍 Step 8: Open the Application

### View Your Creation:
1. **Open your web browser** (Chrome, Firefox, Safari, Edge)
2. **Go to:** `http://localhost:8080`
3. **Wait for the globe to load** (10-15 seconds for the first time)

### 🎉 You should see:
- A beautiful 3D Earth with stars and atmosphere
- Colored circles showing turbulence at different airports
- A control panel on the right side
- Airport information when you click on locations

---

## 🎮 How to Use the Application

### Understanding the Interface:
- **🌍 3D Globe**: Drag to rotate, scroll to zoom
- **🔴 Red Circles**: High turbulence (avoid flying here!)
- **🟡 Yellow Circles**: Moderate turbulence (bumpy flight)
- **🟢 Green Circles**: Light turbulence (smooth sailing)
- **📍 Airport Codes**: Click for detailed weather info

### Navigation Controls:
- **Left Click + Drag**: Rotate the globe
- **Mouse Wheel**: Zoom in/out
- **Right Panel**: Shows airport details and controls
- **Reset View Button**: Returns to default position

---

## 🔧 Troubleshooting Common Issues

### "The website won't load"
**Check that both servers are running:**
- Backend server: Should show `Running on http://127.0.0.1:5000`
- Frontend server: Should show `Serving HTTP on 0.0.0.0 port 8080`

### "I see a blank page"
**Check your browser's developer console:**
1. Press F12 in your browser
2. Look for error messages in the Console tab
3. Most common issue: Backend server not running

### "No turbulence circles appear"
**The weather data might not have loaded:**
1. Run `python backend/weather.py` again
2. Wait 30 seconds, then refresh your browser

### "Permission denied" errors
**Try these commands instead:**
- Use `python3` instead of `python`
- Use `pip3` instead of `pip`
- On Mac/Linux, try adding `sudo` before commands

---

## 📚 Understanding What You Built

### The Architecture:
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Your Browser  │◄──►│  Frontend       │◄──►│   Backend       │
│   (Displays)    │    │  (Website)      │    │  (Data Server)  │
│                 │    │  Port 8080      │    │  Port 5000      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                                        │
                                               ┌─────────────────┐
                                               │  Weather APIs   │
                                               │  (Internet)     │
                                               └─────────────────┘
```

### The Files You're Running:
- **`backend/app.py`**: The main server that provides weather data
- **`backend/weather.py`**: Gets real weather data from aviation websites
- **`frontend/index.html`**: The web page you see
- **`frontend/js/turbulence-visualizer.js`**: Creates the 3D globe
- **`backend/turbulence.db`**: Stores the weather data

---

## 🎯 Beta Testing Checklist

As beta testers, here's what to try and report back:

### ✅ Basic Functionality:
- [ ] Can you see the 3D globe?
- [ ] Do colored circles appear at airports?
- [ ] Can you click on airports for details?
- [ ] Does the globe rotate smoothly?

### ✅ Performance Testing:
- [ ] How long does it take to load initially?
- [ ] Is navigation smooth or laggy?
- [ ] Does it work on your browser/computer?

### ✅ Bug Hunting:
- [ ] Any error messages in the browser console?
- [ ] Do all the buttons work?
- [ ] Is the weather data realistic?
- [ ] Any visual glitches or weird behavior?

### 📝 What to Report:
1. **Your computer specs** (Windows/Mac/Linux, browser used)
2. **Any error messages** (copy the exact text)
3. **Performance observations** (fast/slow/laggy)
4. **Cool features you discovered**
5. **Suggestions for improvement**

---

## 🚨 Getting Help

### If You Get Stuck:
1. **Read the error message carefully** - often it tells you what's wrong
2. **Check that all steps were followed exactly**
3. **Make sure both servers are running**
4. **Try restarting both servers**
5. **Ask for help!** Include:
   - What step you're on
   - The exact error message
   - What operating system you're using
   - Screenshots if helpful

### Remember:
- **It's normal to run into issues** - software setup can be tricky!
- **Every developer deals with these problems** - you're learning valuable skills
- **The satisfaction of getting it working is amazing** 🎉

---

## 🏆 Congratulations!

If you've made it this far and have the application running, you've successfully:
- ✅ Set up a complete development environment
- ✅ Installed and configured multiple software components
- ✅ Deployed a full-stack web application
- ✅ Connected to real-time aviation weather APIs
- ✅ Created a professional-grade data visualization

**This is seriously impressive work!** You've just built something that many professional developers would be proud of.

---

## 🔮 What's Next?

Now that you have it running, you could explore:
- **Adding new airports** to the database
- **Customizing the colors** and appearance
- **Understanding the weather calculation algorithms**
- **Learning about the Web WorldWind 3D graphics library**
- **Exploring the real-time data APIs**

Welcome to the world of full-stack development! 🚀

---

*Happy coding and happy testing! 🛩️*
