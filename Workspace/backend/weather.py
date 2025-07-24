import requests
import math
import sqlite3
import os
import re
from datetime import datetime
from xml.etree import ElementTree as ET

# Constants
EARTH_RADIUS_KM = 6371.0
DATABASE_PATH = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'data', 'turbulence.db')

# Turbulence calculation weights
WIND_SPEED_WEIGHT = 0.4
TEMPERATURE_WEIGHT = 0.3
PRESSURE_WEIGHT = 0.2
RELATIVE_HUMIDITY_WEIGHT = 0.1

class SimpleMetarParser:
    """Simple METAR parser for basic weather data extraction."""
    
    def __init__(self, raw_metar):
        self.raw_metar = raw_metar
        self.wind_speed = None
        self.temp = None
        self.dewpt = None
        self.press = None
        self._parse()
    
    def _parse(self):
        """Parse METAR string for basic weather data."""
        try:
            parts = self.raw_metar.split()
            
            for part in parts:
                # Wind: format like "24008KT" (direction + speed + unit)
                wind_match = re.match(r'(\d{3})(\d{2,3})(KT|MPS)', part)
                if wind_match:
                    self.wind_speed = SimpleValue(int(wind_match.group(2)), 'KT')
                
                # Temperature/Dewpoint: format like "M04/M10" or "15/08"
                temp_match = re.match(r'(M?\d{1,2})/(M?\d{1,2})', part)
                if temp_match:
                    temp_str = temp_match.group(1).replace('M', '-')
                    dewpt_str = temp_match.group(2).replace('M', '-')
                    self.temp = SimpleValue(int(temp_str), 'C')
                    self.dewpt = SimpleValue(int(dewpt_str), 'C')
                
                # Pressure: format like "A3015" (inches) or "Q1013" (millibars)
                press_match = re.match(r'[AQ](\d{4})', part)
                if press_match:
                    press_val = int(press_match.group(1))
                    if part.startswith('A'):
                        # Convert inches Hg to millibars
                        press_val = press_val / 100 * 33.863886667
                    else:
                        # Already in millibars
                        pass
                    self.press = SimpleValue(press_val, 'MB')
                    
        except Exception as e:
            print(f"Error parsing METAR: {e}")

class SimpleValue:
    """Simple value container with unit conversion."""
    
    def __init__(self, val, unit):
        self.val = val
        self.unit = unit
    
    def value(self, units=None):
        """Return value in specified units."""
        if units is None or units == self.unit:
            return self.val
        
        # Temperature conversions
        if self.unit == 'C' and units == 'F':
            return (self.val * 9/5) + 32
        elif self.unit == 'F' and units == 'C':
            return (self.val - 32) * 5/9
        
        # Wind speed conversions
        elif self.unit == 'KT' and units == 'MPS':
            return self.val * 0.514444
        elif self.unit == 'MPS' and units == 'KT':
            return self.val / 0.514444
        
        # Pressure conversions
        elif self.unit == 'MB' and units == 'INHG':
            return self.val / 33.863886667
        elif self.unit == 'INHG' and units == 'MB':
            return self.val * 33.863886667
            
        return self.val

def get_metar_data(airport_code):
    """Fetch METAR data for a specific airport."""
    url = f"https://aviationweather.gov/api/data/metar?ids={airport_code}"
    params = {
        'dataSource': 'metars',
        'requestType': 'retrieve',
        'format': 'xml',
        'stationString': airport_code,
        'hoursBeforeNow': 1
    }

    try:
        response = requests.get(url, params=params, timeout=10)
        
        if response.status_code == 200:
            root = ET.fromstring(response.text)
            metar_node = root.find(".//METAR")
            
            if metar_node is not None:
                raw_metar = metar_node.findtext("raw_text")
                lat_text = metar_node.findtext("latitude")
                lon_text = metar_node.findtext("longitude")

                if raw_metar and lat_text and lon_text:
                    try:
                        latitude = float(lat_text)
                        longitude = float(lon_text)
                        decoded = SimpleMetarParser(raw_metar)
                        return decoded, latitude, longitude, raw_metar
                    except Exception as e:
                        print(f"Failed to parse METAR for {airport_code}: {e}")
                else:
                    print(f"Missing METAR data for {airport_code}")
            else:
                print(f"No METAR element found for {airport_code}")
        else:
            print(f"API Error for {airport_code}: {response.status_code}")
    
    except Exception as e:
        print(f"Request failed for {airport_code}: {e}")
    
    return None, None, None, None

def saturation_vapor_pressure(temp_c):
    """Calculate saturation vapor pressure."""
    return 6.11 * 10 ** (7.5 * temp_c / (237.7 + temp_c))

def calculate_relative_humidity(temp_c, dew_point_c):
    """Calculate relative humidity from temperature and dew point."""
    e_t = saturation_vapor_pressure(temp_c)
    e_td = saturation_vapor_pressure(dew_point_c)
    rh = 100 * (e_td / e_t)
    return round(rh, 1)

def calculate_turbulence_index(decoded_metar):
    """Calculate turbulence index from METAR data."""
    try:
        # Extract weather parameters
        wind_speed_kt = decoded_metar.wind_speed.value('KT') if decoded_metar.wind_speed else 0
        temp_c = decoded_metar.temp.value('C') if decoded_metar.temp else 15
        pressure_mb = decoded_metar.press.value('MB') if decoded_metar.press else 1013.25
        dew_point_c = decoded_metar.dewpt.value('C') if decoded_metar.dewpt else 10
        
        # Calculate relative humidity
        rh = calculate_relative_humidity(temp_c, dew_point_c)
        
        # Calculate turbulence index using weighted factors
        turbulence_index = 0
        turbulence_index += ((wind_speed_kt / 50) * WIND_SPEED_WEIGHT)
        turbulence_index += ((abs(temp_c) / 40) * TEMPERATURE_WEIGHT)  # Use absolute temp
        turbulence_index += ((abs(pressure_mb - 1013.25) / 50) * PRESSURE_WEIGHT)
        turbulence_index += ((rh / 100) * RELATIVE_HUMIDITY_WEIGHT)
        
        return {
            'turbulence_index': round(turbulence_index, 3),
            'wind_speed': wind_speed_kt,
            'temperature': temp_c,
            'pressure': pressure_mb,
            'humidity': rh
        }
        
    except Exception as e:
        print(f"Error calculating turbulence index: {e}")
        return None

def get_color_for_turbulence(turbulence_index):
    """Get color code for turbulence level."""
    if turbulence_index <= 0.2:
        return "ff1cfc03"  # Green - Light
    elif turbulence_index <= 0.4:
        return "ff00fff2"  # Cyan - Light-Moderate
    elif turbulence_index <= 0.6:
        return "ff00b3ff"  # Blue - Moderate
    elif turbulence_index <= 0.8:
        return "ff0015ff"  # Dark Blue - Moderate-Severe
    else:
        return "ff61024c"  # Purple - Severe

def save_turbulence_data(airport_code, latitude, longitude, turbulence_data, raw_metar):
    """Save turbulence data to database."""
    try:
        conn = sqlite3.connect(DATABASE_PATH)
        cursor = conn.cursor()
        
        color = get_color_for_turbulence(turbulence_data['turbulence_index'])
        
        cursor.execute('''
        INSERT INTO turbulence_data 
        (airport_code, latitude, longitude, turbulence_index, wind_speed, 
         temperature, pressure, humidity, color, raw_metar, timestamp)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            airport_code,
            latitude,
            longitude,
            turbulence_data['turbulence_index'],
            turbulence_data['wind_speed'],
            turbulence_data['temperature'],
            turbulence_data['pressure'],
            turbulence_data['humidity'],
            color,
            raw_metar,
            datetime.now().isoformat()
        ))
        
        conn.commit()
        conn.close()
        
        print(f"✓ Saved turbulence data for {airport_code}: TI={turbulence_data['turbulence_index']:.3f}")
        
    except Exception as e:
        print(f"Error saving data for {airport_code}: {e}")

def fetch_all_airport_data():
    """Fetch and save data for all monitored airports."""
    airports = ['KSFO', 'KJFK', 'KDFW']
    
    print(f"🌤️  Fetching weather data at {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    
    for airport in airports:
        print(f"   Fetching {airport}...")
        
        decoded, lat, lon, raw_metar = get_metar_data(airport)
        
        if decoded and lat and lon:
            turbulence_data = calculate_turbulence_index(decoded)
            
            if turbulence_data:
                save_turbulence_data(airport, lat, lon, turbulence_data, raw_metar)
            else:
                print(f"✗ Failed to calculate turbulence for {airport}")
        else:
            print(f"✗ Failed to fetch data for {airport}")
    
    print("📊 Data fetch completed\n")

if __name__ == '__main__':
    # Test the weather fetching
    fetch_all_airport_data()
