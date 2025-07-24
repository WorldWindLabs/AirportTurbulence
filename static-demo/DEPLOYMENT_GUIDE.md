# 🚀 Static Demo Deployment Guide

This guide explains how to deploy your Airport Turbulence Visualization as a static demo using **surge.sh** or **GitHub Pages**.

## 📋 Prerequisites

- Node.js installed on your system
- Git (for GitHub Pages deployment)
- Basic command line knowledge

## 🌊 Option 1: Deploy with Surge.sh (Recommended)

Surge.sh is perfect for quick, static demos. It's free and incredibly simple.

### Step 1: Install Surge

```powershell
npm install -g surge
```

### Step 2: Navigate to Static Demo Directory

```bash
cd static-demo
```

### Step 3: Deploy to Surge

```bash
npm run deploy-surge
# or
surge
```

**First time setup:**
- You'll be asked to create a surge account (just provide email/password)
- Accept the default project path (should be current directory)
- Choose a domain name (e.g., `my-turbulence-demo.surge.sh`) or use the generated one

**Output example:**
```
Welcome to surge! (surge.sh)
Login (or create surge account) by entering email & password.

    email: your.email@example.com
    password: [hidden]

    project: C:\Users\cyber\Repositories\WorldWindLabs\AirportTurbulenceAnalysis\Workspace\static-demo\
    domain: airport-turbulence-demo.surge.sh

    Success! - Published to airport-turbulence-demo.surge.sh
```

### Step 4: Share Your Demo

Your demo will be live at: `https://your-chosen-domain.surge.sh`

### Updating Your Demo

To update the demo after making changes:

```bash
cd static-demo
npm run deploy-surge
```

Surge remembers your domain, so it will update the existing deployment.

---

## 📱 Option 2: Deploy with GitHub Pages

Perfect for portfolio integration and version control.

### Step 1: Create GitHub Repository

1. Go to GitHub and create a new repository
2. Name it something like `airport-turbulence-visualization`
3. Make it public (required for free GitHub Pages)

### Step 2: Initialize Git and Push

```powershell
cd "C:\Users\cyber\Repositories\WorldWindLabs\AirportTurbulenceAnalysis\Workspace\static-demo"

# Initialize git repository
git init

# Add all files
git add .

# Create initial commit
git commit -m "Initial commit: Airport Turbulence Visualization Static Demo"

# Add your GitHub repository as origin
git remote add origin https://github.com/YOUR_USERNAME/airport-turbulence-visualization.git

# Push to GitHub
git branch -M main
git push -u origin main
```

### Step 3: Enable GitHub Pages

1. Go to your repository on GitHub
2. Click **Settings** tab
3. Scroll down to **Pages** section
4. Under **Source**, select **Deploy from a branch**
5. Choose **main** branch and **/ (root)** folder
6. Click **Save**

### Step 4: Access Your Demo

Your demo will be live at: `https://YOUR_USERNAME.github.io/airport-turbulence-visualization`

*Note: It may take a few minutes for the site to become available.*

---

## 🎯 Demo Features

Your static demo includes:

### ✅ **What Works**
- **Full 3D Visualization**: Interactive globe with NASA World Wind
- **Simulated Real-time Data**: 8 major airports with realistic turbulence variations
- **Auto-refresh**: Data updates every 30 seconds with new simulated values
- **Interactive Controls**: Click airports, refresh data, reset view
- **Atmospheric Effects**: Beautiful space-like atmosphere rendering
- **Responsive Design**: Works on desktop, tablet, and mobile
- **No Backend Required**: Runs entirely in the browser

### 🔄 **Simulated Data**
- **Airports**: LAX, JFK, ORD, DFW, ATL, SFO, SEA, MIA
- **Weather Conditions**: Temperature, wind speed, visibility, pressure
- **Turbulence Levels**: Realistic variations based on weather patterns
- **METAR-style Reports**: Properly formatted aviation weather data

### 🎨 **Visual Indicators**
- **Green**: Minimal turbulence (0-20%)
- **Yellow**: Light turbulence (20-40%)
- **Orange**: Moderate turbulence (40-60%)
- **Red**: Severe turbulence (60%+)

---

## 🛠️ Customization Options

### Change Update Frequency

Edit `static-demo-app.js`, line ~15:
```javascript
// Change from 30 seconds to 60 seconds
this.updateInterval = 60000;
```

### Modify Airport List

Edit `mock-data.js` to add/remove airports or change their properties.

### Adjust Turbulence Calculation

Edit the `simulateRealtimeData()` function in `mock-data.js` to change how turbulence is calculated.

### Update Styling

Edit `css/demo-style.css` to change colors, layout, or add custom branding.

---

## 📊 Performance Notes

- **Load Time**: ~2-3 seconds (depends on NASA World Wind CDN)
- **Memory Usage**: ~50-100MB (typical for 3D applications)
- **Browser Requirements**: Modern browser with WebGL support
- **Mobile Performance**: Optimized for mobile devices

---

## 🔧 Troubleshooting

### Demo Won't Load
1. Check browser console for errors (F12 → Console)
2. Ensure you have a stable internet connection (loads NASA World Wind from CDN)
3. Try a different browser (Chrome, Firefox, Safari, Edge)

### 3D Globe Not Rendering
1. Verify WebGL support: Visit `https://get.webgl.org/`
2. Update your graphics drivers
3. Try disabling browser extensions

### Deployment Issues

**Surge.sh:**
- Make sure you're in the correct directory
- Check that all files are present (`index.html`, `css/`, `js/`)
- Try `surge --domain your-domain.surge.sh` to specify domain

**GitHub Pages:**
- Ensure repository is public
- Check that Pages is enabled in repository settings
- Allow 5-10 minutes for initial deployment

---

## 🎓 Educational Use

This demo is perfect for:

- **Student Projects**: Showcase 3D web development skills
- **Portfolio Pieces**: Demonstrate full-stack capabilities
- **Presentations**: Professional-looking aviation technology demo
- **Learning Tool**: Understand weather visualization and 3D graphics
- **Prototyping**: Test ideas before building full backend systems

---

## 📞 Support

If you encounter issues:

1. **Check the browser console** for error messages
2. **Test in different browsers** to isolate browser-specific issues  
3. **Review the README.md** in the main project directory
4. **Check GitHub Issues** for known problems and solutions

---

## 🔗 Related Resources

- [NASA World Wind Documentation](https://worldwind.arc.nasa.gov/)
- [Surge.sh Documentation](https://surge.sh/help/)
- [GitHub Pages Documentation](https://docs.github.com/en/pages)
- [Aviation Weather Center](https://aviationweather.gov/)

---

**Happy Deploying! ✈️🌍**

*Your Airport Turbulence Visualization static demo is ready to share with the world!*
