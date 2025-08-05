import sqlite3
import os

def create_database():
    """Create the SQLite database and tables."""
    # Ensure data directory exists
    data_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'data')
    os.makedirs(data_dir, exist_ok=True)
    
    db_path = os.path.join(data_dir, 'turbulence.db')
    
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    # Create turbulence_data table
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS turbulence_data (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        airport_code TEXT NOT NULL,
        latitude REAL NOT NULL,
        longitude REAL NOT NULL,
        turbulence_index REAL NOT NULL,
        wind_speed REAL,
        temperature REAL,
        pressure REAL,
        humidity REAL,
        color TEXT,
        raw_metar TEXT,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
    ''')
    
    # Create index for faster queries
    cursor.execute('''
    CREATE INDEX IF NOT EXISTS idx_airport_timestamp 
    ON turbulence_data(airport_code, timestamp)
    ''')
    
    # Create airports table for metadata
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS airports (
        code TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        city TEXT NOT NULL,
        latitude REAL,
        longitude REAL,
        active BOOLEAN DEFAULT 1
    )
    ''')
    
    # Insert default airports
    airports_data = [
        ('KSFO', 'San Francisco International', 'San Francisco, CA', 37.6213, -122.3790),
        ('KJFK', 'John F. Kennedy International', 'New York, NY', 40.6413, -73.7781),
        ('KDFW', 'Dallas/Fort Worth International', 'Dallas, TX', 32.8998, -97.0403)
    ]
    
    cursor.executemany('''
    INSERT OR IGNORE INTO airports (code, name, city, latitude, longitude)
    VALUES (?, ?, ?, ?, ?)
    ''', airports_data)
    
    conn.commit()
    conn.close()
    
    print(f"Database created successfully at: {db_path}")
    print("Tables created: turbulence_data, airports")
    print("Default airports added: KSFO, KJFK, KDFW")

if __name__ == '__main__':
    create_database()
