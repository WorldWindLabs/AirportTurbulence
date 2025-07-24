# 📋 Quick Reference Card - Airport Turbulence App

*Print this out and keep it handy while setting up!*

---

## 🚀 Quick Start Commands

### 1. Check Python Installation
```bash
python --version
```

### 2. Install Required Libraries
```bash
pip install flask flask-cors requests
```

### 3. Set Up Database
```bash
python backend/init_db.py
```

### 4. Get Weather Data
```bash
python backend/weather.py
```

### 5. Start Backend Server (Terminal 1)
```bash
python backend/app.py
```

### 6. Start Frontend Server (Terminal 2)
```bash
cd frontend
python -m http.server 8080
```

### 7. Open in Browser
```
http://localhost:8080
```

---

## 🆘 Emergency Troubleshooting

| Problem | Solution |
|---------|----------|
| `python not recognized` | Reinstall Python, check "Add to PATH" |
| `pip not recognized` | Try `python -m pip install ...` |
| Permission errors (Mac/Linux) | Try `pip3` instead of `pip` |
| Website won't load | Check both servers are running |
| No turbulence circles | Run `python backend/weather.py` again |
| Blank page | Press F12, check Console for errors |

---

## 🌐 Important URLs

- **Application**: http://localhost:8080
- **Backend API**: http://localhost:5000
- **Health Check**: http://localhost:5000/health

---

## 📁 Key File Locations

```
AirportTurbulenceAnalysis/Workspace/
├── backend/
│   ├── app.py          ← Main server
│   ├── weather.py      ← Data fetcher
│   └── init_db.py      ← Database setup
├── frontend/
│   ├── index.html      ← Web page
│   └── js/             ← 3D visualization
└── STUDENT_SETUP_GUIDE.md ← Full instructions
```

---

## 🎯 Success Indicators

✅ **Backend Working**: See `Running on http://127.0.0.1:5000`  
✅ **Frontend Working**: See `Serving HTTP on 0.0.0.0 port 8080`  
✅ **App Working**: 3D globe loads with colored airport circles  

---

## 🔄 Restart Sequence (if things break)

1. **Close both terminal windows**
2. **Open new terminal**
3. **Navigate to project folder**
4. **Run backend**: `python backend/app.py`
5. **Open second terminal**
6. **Navigate to frontend folder**: `cd frontend`
7. **Run frontend**: `python -m http.server 8080`
8. **Refresh browser**

---

*Keep this handy - you've got this! 🚀*
