# 🌪️ Airport Turbulence Visualization System

A real-time 3D visualization system for airport turbulence conditions using Web WorldWind and Python Flask.

![Demo](https://img.shields.io/badge/Demo-Ready-brightgreen) ![Python](https://img.shields.io/badge/Python-3.7+-blue) ![License](https://img.shields.io/badge/License-MIT-green)

## ✨ Features

- **🌍 3D Globe Visualization**: Interactive Web WorldWind-based interface
- **🌪️ Real-time Turbulence Analysis**: Live METAR data from major airports 
- **🎨 Color-coded Severity**: Visual turbulence levels with intuitive colors
- **📊 Historical Data**: SQLite database stores past readings for analysis
- **⚡ Auto-refresh**: Background updates every 30 minutes
- **🔌 REST API**: Clean Flask backend with comprehensive endpoints

## 🚀 Quick Start

### Option 1: One-Command Setup (Recommended)
```bash
# Windows
start.bat

# or Python script
python start.py
```

### Option 2: Manual Setup
```bash
# 1. Install dependencies
pip install flask flask-cors requests python-dotenv

# 2. Initialize database
python backend/init_db.py

# 3. Fetch initial data
python backend/weather.py

# 4. Start backend (Terminal 1)
python backend/app.py

# 5. Start frontend (Terminal 2)
cd frontend
python -m http.server 8080
```

## 📱 Access the Application

| Service | URL | Description |
|---------|-----|-------------|
| **Frontend** | http://localhost:8080 | Main 3D visualization app |
| **Backend API** | http://localhost:5000 | REST API endpoints |
| **API Docs** | http://localhost:5000/api/docs | API documentation |

## 🗂️ Project Structure

```
📁 Airport Turbulence Visualization/
├── 📁 backend/              # Flask API server
│   ├── app.py              # Main Flask application  
│   ├── weather.py          # METAR data fetching
│   ├── init_db.py          # Database initialization
│   └── app_with_scheduler.py # Auto-updating version
├── 📁 frontend/             # Web WorldWind app
│   ├── index.html          # Main application page
│   ├── 📁 css/style.css    # Application styling
│   └── 📁 js/              # JavaScript modules
│       ├── api.js          # API client
│       ├── turbulence-visualizer.js # 3D visualization
│       └── app.js          # Main controller
├── 📁 data/                # SQLite database
├── requirements.txt        # Python dependencies
├── start.py               # Quick start script
└── start.bat              # Windows batch script
```

## 🌪️ Turbulence Scale

| Color | Range | Level | Description |
|-------|-------|-------|-------------|
| 🟢 Green | 0.0-0.2 | Light | Minimal turbulence |
| 🟡 Yellow | 0.2-0.4 | Light-Moderate | Noticeable movement |
| 🟠 Orange | 0.4-0.6 | Moderate | Uncomfortable conditions |
| 🔴 Red | 0.6-0.8 | Moderate-Severe | Significant turbulence |
| 🟣 Purple | 0.8+ | Severe | Dangerous conditions |

## 🛫 Monitored Airports

- **KSFO** - San Francisco International Airport
- **KJFK** - John F. Kennedy International Airport  
- **KDFW** - Dallas/Fort Worth International Airport

*Additional airports can be added by modifying the airport list in `backend/weather.py`*

## 🔧 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | System health check |
| GET | `/api/turbulence` | Current data for all airports |
| GET | `/api/turbulence/{code}` | Specific airport data |
| GET | `/api/history/{code}?hours=24` | Historical data |
| GET | `/api/airports` | List of monitored airports |

## 🎯 Demo Features

Perfect for showcasing:

### Interactive 3D Globe
- Pan, zoom, and rotate the Earth
- Click airports for detailed information
- Real-time color-coded turbulence circles

### Live Data Integration  
- Fetches from Aviation Weather Center API
- Automated 30-minute updates
- Historical trend analysis

### Modern Web Technologies
- Web WorldWind for 3D rendering
- Flask REST API backend
- Responsive design
- Real-time updates

## 🧪 Development

### Adding New Airports
1. Add airport code to `backend/weather.py`
2. Update airport list in `backend/app.py`
3. Restart the backend server

### Customizing Turbulence Calculation
Modify weights in `backend/weather.py`:
```python
WIND_SPEED_WEIGHT = 0.4      # 40% influence
TEMPERATURE_WEIGHT = 0.3     # 30% influence  
PRESSURE_WEIGHT = 0.2        # 20% influence
RELATIVE_HUMIDITY_WEIGHT = 0.1 # 10% influence
```

### Extending Visualization
- Add new layers to `frontend/js/turbulence-visualizer.js`
- Customize colors and styling in `frontend/css/style.css`
- Create new API endpoints in `backend/app.py`

## 📈 Performance Notes

- **Data Refresh**: Every 30 minutes (configurable)
- **Database**: SQLite for simplicity (easily upgradeable to PostgreSQL)
- **Concurrency**: Flask development server (production deployment needs WSGI)
- **Browser Support**: Modern browsers with WebGL support

## 🔗 Technologies Used

- **Backend**: Python, Flask, SQLite, Requests
- **Frontend**: HTML5, CSS3, JavaScript, Web WorldWind
- **Data Source**: Aviation Weather Center METAR API
- **3D Rendering**: NASA Web WorldWind

## 📝 License

MIT License - Feel free to modify and distribute!

---

**Perfect for:** Aviation weather analysis, educational demos, intern projects, real-time data visualization showcases
