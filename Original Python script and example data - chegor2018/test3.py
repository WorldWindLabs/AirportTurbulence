import requests
import math
from xml.etree import ElementTree as ET
from metar.Metar import Metar

EARTH_RADIUS_KM = 6371.0

def get_newest_data_KSFO():
    url = "https://aviationweather.gov/api/data/metar?ids=KSFO"
    params = {
        'dataSource': 'metars',
        'requestType': 'retrieve',
        'format': 'xml',
        'stationString': 'KSFO',
        'hoursBeforeNow': 1
    }

    response = requests.get(url, params=params)

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
                    decoded = Metar(raw_metar)
                    return decoded, latitude, longitude
                except Exception as e:
                    print("Failed to parse METAR or coordinates:", e)
            else:
                print("Missing raw METAR, latitude, or longitude.")
        else:
            print("No METAR element found.")
    else:
        print("Error:", response.status_code, response.text)

    return None, None, None

data1, lat1, lon1 = get_newest_data_KSFO()

def get_newest_data_KJFK():
    url = "https://aviationweather.gov/api/data/metar?ids=KJFK"
    params = {
        'dataSource': 'metars',
        'requestType': 'retrieve',
        'format': 'xml',
        'stationString': 'KJFK',
        'hoursBeforeNow': 1
    }

    response = requests.get(url, params=params)

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
                    decoded = Metar(raw_metar)
                    return decoded, latitude, longitude
                except Exception as e:
                    print("Failed to parse METAR or coordinates:", e)
            else:
                print("Missing raw METAR, latitude, or longitude.")
        else:
            print("No METAR element found.")
    else:
        print("Error:", response.status_code, response.text)

    return None, None, None

data2, lat2, lon2 = get_newest_data_KJFK()

def get_newest_data_KDFW():
    url = "https://aviationweather.gov/api/data/metar?ids=KDFW"
    params = {
        'dataSource': 'metars',
        'requestType': 'retrieve',
        'format': 'xml',
        'stationString': 'KDFW',
        'hoursBeforeNow': 1
    }

    response = requests.get(url, params=params)

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
                    decoded = Metar(raw_metar)
                    return decoded, latitude, longitude
                except Exception as e:
                    print("Failed to parse METAR or coordinates:", e)
            else:
                print("Missing raw METAR, latitude, or longitude.")
        else:
            print("No METAR element found.")
    else:
        print("Error:", response.status_code, response.text)

    return None, None, None

data3, lat3, lon3 = get_newest_data_KDFW()

wind_speed_weight = 0.4
temperature_weight = 0.3
pressure_weight = 0.2
relative_humidity_weight = 0.1

def saturation_vapor_pressure(t):
    return 6.11 * 10 ** (7.5 * t / (237.7 + t))

def calculate_relative_humidity(temp, dew_point):
    e_t = saturation_vapor_pressure(temp)
    e_td = saturation_vapor_pressure(dew_point)
    rh = 100 * (e_td / e_t)
    return round(rh, 1)

def generate_circle_coordinates(lat, lon, radius_km=5.0, num_points=36):
    coords = []
    for angle in range(0, 360, int(360 / num_points)):
        angle_rad = math.radians(-angle)
        d_lat = (radius_km / EARTH_RADIUS_KM) * math.cos(angle_rad)
        d_lon = (radius_km / (EARTH_RADIUS_KM * math.cos(math.radians(lat)))) * math.sin(angle_rad)
        lat_point = lat + math.degrees(d_lat)
        lon_point = lon + math.degrees(d_lon)
        coords.append(f"{lon_point},{lat_point},0")
    coords.append(coords[0])
    return coords

def get_color_for_turbulence(ti):
    if ti <= 0.2:
        return "ff1cfc03"
    elif ti <= 0.4:
        return "ff00fff2"
    elif ti <= 0.6:
        return "ff00b3ff"
    elif ti <= 0.8:
        return "ff0015ff"
    else:
        return "ff61024c"

def calculate_and_export_heatmap_kml(d,lat,lon):
    if not d or lat is None or lon is None:
        print("Missing data; can't export.")
        return

    wind_speed_kt = d.wind_speed.value(units='KT') if d.wind_speed else 0
    temp_c = d.temp.value(units='C')
    pressure_mb = d.press.value(units='MB')
    dew_point_c = d.dewpt.value(units='C')
    rh = calculate_relative_humidity(temp_c, dew_point_c)

    turbulence_index = 0
    turbulence_index += ((wind_speed_kt / 50) * wind_speed_weight)
    turbulence_index += ((temp_c / 40) * temperature_weight)
    turbulence_index += ((pressure_mb - 980) / 50 * pressure_weight)
    turbulence_index += (rh / 100 * relative_humidity_weight)

    category_color = get_color_for_turbulence(turbulence_index)
    circle_coords = generate_circle_coordinates(lat, lon)


    kml = f"""<?xml version="1.0" encoding="UTF-8"?>
<kml xmlns="http://www.opengis.net/kml/2.2">
  <Document>
    <name>Turbulence Heatmap</name>
    <Style id="circleStyle">
      <PolyStyle>
        <color>{category_color}</color>
      </PolyStyle>
    </Style>
    <Placemark>
      <name>Turbulence Index: {round(turbulence_index, 2)}</name>
      <description><![CDATA[
<b>Category:</b> {round(turbulence_index, 2)}<br/>
<b>Temp:</b> {temp_c} C<br/>
<b>RH:</b> {rh}%<br/>
<b>Wind:</b> {wind_speed_kt} KT<br/>
<b>Pressure:</b> {pressure_mb} mb
      ]]></description>
      <styleUrl>#circleStyle</styleUrl>
      <Polygon>
        <outerBoundaryIs>
          <LinearRing>
            <coordinates>
              {' '.join(circle_coords)}
            </coordinates>
          </LinearRing>
        </outerBoundaryIs>
      </Polygon>
    </Placemark>
  </Document>
</kml>
"""
    return kml
def print_file_1():
    with open("ksfo_turbulence_heatmap.kml", "w", encoding="utf-8") as f:
        f.write(calculate_and_export_heatmap_kml(data1,lat1,lon1))
    print("Heatmap KML file written: ksfo_turbulence_heatmap.kml")
def print_file_2():
    with open("kjfk_turbulence_heatmap.kml", "w", encoding="utf-8") as f:
        f.write(calculate_and_export_heatmap_kml(data2,lat2,lon2))
    print("Heatmap KML file written: kjfk_turbulence_heatmap.kml")
def print_file_3():
    with open("kdfw_turbulence_heatmap.kml", "w", encoding="utf-8") as f:
        f.write(calculate_and_export_heatmap_kml(data3,lat3,lon3))
    print("Heatmap KML file written: kdfw_turbulence_heatmap.kml")
print_file_1()
print_file_2()
print_file_3()