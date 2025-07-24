# Data Directory

This directory contains the SQLite database for storing turbulence data.

## Files
- `turbulence.db` - Main SQLite database (created automatically)

## Database Schema

### turbulence_data table
- `id` - Primary key
- `airport_code` - Airport ICAO code (KSFO, KJFK, KDFW)
- `latitude` - Airport latitude
- `longitude` - Airport longitude  
- `turbulence_index` - Calculated turbulence index (0.0-1.0+)
- `wind_speed` - Wind speed in knots
- `temperature` - Temperature in Celsius
- `pressure` - Atmospheric pressure in millibars
- `humidity` - Relative humidity percentage
- `color` - Hex color code for visualization
- `raw_metar` - Raw METAR string
- `timestamp` - Data timestamp
- `created_at` - Record creation time

### airports table
- `code` - Airport ICAO code (primary key)
- `name` - Airport full name
- `city` - City and state
- `latitude` - Airport coordinates
- `longitude` - Airport coordinates
- `active` - Whether airport is being monitored
