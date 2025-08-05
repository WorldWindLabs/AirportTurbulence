from flask import Flask, jsonify, request
from flask_cors import CORS
import sqlite3
import json
from datetime import datetime, timedelta
import os

app = Flask(__name__)
CORS(app)  # Enable CORS for frontend

DATABASE_PATH = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'data', 'turbulence.db')

def get_db_connection():
    """Get database connection."""
    conn = sqlite3.connect(DATABASE_PATH)
    conn.row_factory = sqlite3.Row
    return conn

@app.route('/api/health')
def health_check():
    """Health check endpoint."""
    return jsonify({"status": "healthy", "timestamp": datetime.now().isoformat()})

@app.route('/api/turbulence')
def get_all_turbulence():
    """Get current turbulence data for all airports."""
    conn = get_db_connection()
    
    # Get latest reading for each airport
    query = """
    SELECT airport_code, latitude, longitude, turbulence_index, 
           wind_speed, temperature, pressure, humidity, color,
           timestamp
    FROM turbulence_data 
    WHERE (airport_code, timestamp) IN (
        SELECT airport_code, MAX(timestamp) 
        FROM turbulence_data 
        GROUP BY airport_code
    )
    ORDER BY airport_code
    """
    
    results = conn.execute(query).fetchall()
    conn.close()
    
    turbulence_data = []
    for row in results:
        turbulence_data.append({
            "airport_code": row["airport_code"],
            "latitude": row["latitude"],
            "longitude": row["longitude"],
            "turbulence_index": row["turbulence_index"],
            "wind_speed": row["wind_speed"],
            "temperature": row["temperature"],
            "pressure": row["pressure"],
            "humidity": row["humidity"],
            "color": row["color"],
            "timestamp": row["timestamp"]
        })
    
    return jsonify({
        "data": turbulence_data,
        "count": len(turbulence_data),
        "timestamp": datetime.now().isoformat()
    })

@app.route('/api/turbulence/<airport_code>')
def get_airport_turbulence(airport_code):
    """Get current turbulence data for a specific airport."""
    conn = get_db_connection()
    
    query = """
    SELECT * FROM turbulence_data 
    WHERE airport_code = ? 
    ORDER BY timestamp DESC 
    LIMIT 1
    """
    
    result = conn.execute(query, (airport_code.upper(),)).fetchone()
    conn.close()
    
    if result:
        return jsonify({
            "airport_code": result["airport_code"],
            "latitude": result["latitude"],
            "longitude": result["longitude"],
            "turbulence_index": result["turbulence_index"],
            "wind_speed": result["wind_speed"],
            "temperature": result["temperature"],
            "pressure": result["pressure"],
            "humidity": result["humidity"],
            "color": result["color"],
            "timestamp": result["timestamp"]
        })
    else:
        return jsonify({"error": "Airport not found"}), 404

@app.route('/api/history/<airport_code>')
def get_airport_history(airport_code):
    """Get historical turbulence data for a specific airport."""
    hours = request.args.get('hours', 24, type=int)
    
    conn = get_db_connection()
    
    query = """
    SELECT * FROM turbulence_data 
    WHERE airport_code = ? 
    AND timestamp >= datetime('now', '-{} hours')
    ORDER BY timestamp DESC
    """.format(hours)
    
    results = conn.execute(query, (airport_code.upper(),)).fetchall()
    conn.close()
    
    history_data = []
    for row in results:
        history_data.append({
            "airport_code": row["airport_code"],
            "turbulence_index": row["turbulence_index"],
            "wind_speed": row["wind_speed"],
            "temperature": row["temperature"],
            "pressure": row["pressure"],
            "humidity": row["humidity"],
            "timestamp": row["timestamp"]
        })
    
    return jsonify({
        "airport_code": airport_code.upper(),
        "data": history_data,
        "count": len(history_data),
        "hours": hours
    })

@app.route('/api/airports')
def get_airports():
    """Get list of monitored airports."""
    airports = [
        {"code": "KSFO", "name": "San Francisco International", "city": "San Francisco, CA"},
        {"code": "KJFK", "name": "John F. Kennedy International", "city": "New York, NY"},
        {"code": "KDFW", "name": "Dallas/Fort Worth International", "city": "Dallas, TX"}
    ]
    return jsonify({"airports": airports})

@app.route('/api/docs')
def api_docs():
    """API documentation."""
    docs = {
        "title": "Airport Turbulence API",
        "version": "1.0.0",
        "endpoints": {
            "/api/health": "Health check",
            "/api/turbulence": "Get current turbulence data for all airports",
            "/api/turbulence/{airport_code}": "Get current turbulence data for specific airport",
            "/api/history/{airport_code}?hours=24": "Get historical data for airport",
            "/api/airports": "Get list of monitored airports"
        },
        "turbulence_scale": {
            "0.0-0.2": "Light (Green)",
            "0.2-0.4": "Light-Moderate (Cyan)",
            "0.4-0.6": "Moderate (Blue)",
            "0.6-0.8": "Moderate-Severe (Dark Blue)",
            "0.8+": "Severe (Purple)"
        }
    }
    return jsonify(docs)

if __name__ == '__main__':
    # Ensure data directory exists
    data_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'data')
    os.makedirs(data_dir, exist_ok=True)
    
    app.run(debug=True, host='0.0.0.0', port=5000)
