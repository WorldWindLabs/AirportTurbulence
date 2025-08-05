# Airport Turbulence Visualization - NASA WorldWind

A modern web application that visualizes real-time airport turbulence data using NASA WorldWind. This application retrieves METAR (Meteorological Terminal Air Report) data from the Aviation Weather API and calculates turbulence indices based on wind speed, temperature, pressure, and humidity.

## Features

- 🌍 **3D Globe Visualization**: Interactive 3D Earth using NASA WorldWind
- 🌪️ **Real-time Turbulence Data**: Live METAR data from major US airports
- 📊 **Turbulence Index Calculation**: Scientific algorithm based on weather parameters
- 🎨 **Color-coded Visualization**: Intuitive color scheme for turbulence intensity levels
- 📱 **Responsive Design**: Works on desktop and mobile devices
- 🔄 **Auto-refresh**: Manual refresh capability for updated data

## Supported Airports

- **KSFO** - San Francisco International Airport
- **KJFK** - John F. Kennedy International Airport  
- **KDFW** - Dallas/Fort Worth International Airport

## Turbulence Categories

| Category | Index Range | Color | Description |
|----------|-------------|-------|-------------|
| Low | 0.0 - 0.2 | Green (#1cfc03) | Minimal turbulence |
| Moderate | 0.2 - 0.4 | Cyan (#00fff2) | Light turbulence |
| High | 0.4 - 0.6 | Blue (#00b3ff) | Moderate turbulence |
| Severe | 0.6 - 0.8 | Dark Blue (#0015ff) | Strong turbulence |
| Extreme | 0.8+ | Purple (#61024c) | Very strong turbulence |

## How to Use

1. **Open the Application**: Open `index.html` in a modern web browser
2. **Select Airport**: Choose an airport from the dropdown menu
3. **View Data**: The application will automatically load and display:
   - Current turbulence index and category
   - Weather parameters (temperature, wind speed, pressure, humidity)
   - 3D visualization on the globe
4. **Refresh Data**: Click the refresh button to get the latest data
5. **Navigate**: Use mouse controls to zoom, pan, and rotate the 3D globe

## Technical Details

### Turbulence Index Calculation

The turbulence index is calculated using weighted contributions from:

- **Wind Speed** (40% weight): Higher wind speeds increase turbulence
- **Temperature** (30% weight): Temperature extremes contribute to turbulence
- **Pressure** (20% weight): Pressure variations indicate atmospheric instability
- **Humidity** (10% weight): Moisture content affects air density

### API Integration

The application fetches METAR data from the Aviation Weather API:
```
https://aviationweather.gov/api/data/metar?ids={AIRPORT_CODE}
```

### NASA WorldWind Features

- **3D Globe Rendering**: High-resolution Earth visualization
- **Atmospheric Effects**: Realistic sky and atmosphere rendering
- **Navigation Controls**: Built-in zoom, pan, and rotation controls
- **Layer Management**: Multiple data layers for comprehensive visualization

## File Structure

```
├── index.html          # Main HTML file
├── styles.css          # CSS styling and responsive design
├── app.js             # Main JavaScript application logic
├── test3.py           # Original Python reference implementation
└── README.md          # This documentation
```

## Browser Requirements

- Modern web browser with WebGL support
- Internet connection for API data and WorldWind resources
- Recommended: Chrome, Firefox, Safari, or Edge (latest versions)

## Installation

No installation required! Simply:

1. Download all files to a local directory
2. Open `index.html` in a web browser
3. The application will load automatically

## API Limitations

- The Aviation Weather API has rate limits
- Data is updated approximately every hour
- Some airports may have limited data availability

## Troubleshooting

### Common Issues

1. **No data displayed**: Check internet connection and API availability
2. **3D globe not loading**: Ensure WebGL is enabled in your browser
3. **Slow performance**: Close other browser tabs to free up memory

### Browser Console

Open browser developer tools (F12) to view:
- API request/response logs
- JavaScript error messages
- Performance metrics

## Development

### Adding New Airports

To add support for additional airports:

1. Add airport data to the `airportData` object in `app.js`
2. Add the airport option to the select dropdown in `index.html`
3. Ensure the airport has METAR data available from the API

### Customizing Turbulence Algorithm

Modify the `calculateTurbulenceIndex()` method in `app.js` to adjust:
- Weight factors for different weather parameters
- Threshold values for turbulence categories
- Additional weather parameters

## License

This project is open source and available under the MIT License.

## Acknowledgments

- **NASA WorldWind**: 3D globe visualization technology
- **Aviation Weather API**: Real-time meteorological data
- **METAR Standards**: International aviation weather reporting format

## Support

For questions or issues, please check the browser console for error messages and ensure all files are properly loaded. 