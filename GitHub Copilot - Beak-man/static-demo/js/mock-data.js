/**
 * Mock Turbulence Data for Static Demo
 * Simulates real-time airport turbulence data without backend
 */

window.MOCK_TURBULENCE_DATA = {
    airports: [
        {
            code: "KSFO",
            name: "San Francisco International Airport",
            latitude: 37.6213,
            longitude: -122.3790,
            turbulence_index: 0.25,
            temperature: 18.5,
            wind_speed: 12,
            wind_direction: 280,
            pressure: 1013.2,
            humidity: 65,
            visibility: 10.0,
            weather_conditions: "Clear",
            last_updated: "2025-07-24T15:30:00Z",
            raw_metar: "KSFO 241530Z 28012KT 10SM CLR 19/12 A2993"
        },
        {
            code: "KJFK", 
            name: "John F. Kennedy International Airport",
            latitude: 40.6413,
            longitude: -73.7781,
            turbulence_index: 0.65,
            temperature: 22.1,
            wind_speed: 18,
            wind_direction: 250,
            pressure: 1008.5,
            humidity: 78,
            visibility: 8.0,
            weather_conditions: "Light Rain",
            last_updated: "2025-07-24T15:30:00Z",
            raw_metar: "KJFK 241530Z 25018G25KT 8SM -RA BKN020 OVC040 22/18 A2975"
        },
        {
            code: "KDFW",
            name: "Dallas/Fort Worth International Airport", 
            latitude: 32.8968,
            longitude: -97.0380,
            turbulence_index: 0.15,
            temperature: 28.3,
            wind_speed: 8,
            wind_direction: 180,
            pressure: 1018.7,
            humidity: 45,
            visibility: 15.0,
            weather_conditions: "Clear",
            last_updated: "2025-07-24T15:30:00Z",
            raw_metar: "KDFW 241530Z 18008KT 15SM CLR 28/15 A3008"
        },
        {
            code: "KORD",
            name: "Chicago O'Hare International Airport",
            latitude: 41.9742,
            longitude: -87.9073,
            turbulence_index: 0.45,
            temperature: 15.2,
            wind_speed: 22,
            wind_direction: 290,
            pressure: 1005.8,
            humidity: 82,
            visibility: 6.0,
            weather_conditions: "Thunderstorms",
            last_updated: "2025-07-24T15:30:00Z",
            raw_metar: "KORD 241530Z 29022G30KT 6SM TSRA SCT025 BKN040 CB 15/12 A2970"
        },
        {
            code: "KLAX",
            name: "Los Angeles International Airport",
            latitude: 33.9425,
            longitude: -118.4081,
            turbulence_index: 0.20,
            temperature: 24.5,
            wind_speed: 10,
            wind_direction: 240,
            pressure: 1015.3,
            humidity: 70,
            visibility: 12.0,
            weather_conditions: "Partly Cloudy",
            last_updated: "2025-07-24T15:30:00Z",
            raw_metar: "KLAX 241530Z 24010KT 12SM SCT015 24/18 A2996"
        },
        {
            code: "KDEN",
            name: "Denver International Airport",
            latitude: 39.8561,
            longitude: -104.6737,
            turbulence_index: 0.55,
            temperature: 12.8,
            wind_speed: 25,
            wind_direction: 270,
            pressure: 1012.1,
            humidity: 35,
            visibility: 9.0,
            weather_conditions: "Windy",
            last_updated: "2025-07-24T15:30:00Z",
            raw_metar: "KDEN 241530Z 27025G35KT 9SM BKN030 13/01 A2990"
        },
        {
            code: "KMIA",
            name: "Miami International Airport",
            latitude: 25.7957,
            longitude: -80.2906,
            turbulence_index: 0.35,
            temperature: 29.8,
            wind_speed: 15,
            wind_direction: 110,
            pressure: 1019.5,
            humidity: 85,
            visibility: 10.0,
            weather_conditions: "Scattered Clouds",
            last_updated: "2025-07-24T15:30:00Z",
            raw_metar: "KMIA 241530Z 11015KT 10SM SCT025 30/26 A3010"
        },
        {
            code: "KSEA",
            name: "Seattle-Tacoma International Airport",
            latitude: 47.4502,
            longitude: -122.3088,
            turbulence_index: 0.40,
            temperature: 16.7,
            wind_speed: 16,
            wind_direction: 200,
            pressure: 1010.2,
            humidity: 88,
            visibility: 7.0,
            weather_conditions: "Light Rain",
            last_updated: "2025-07-24T15:30:00Z",
            raw_metar: "KSEA 241530Z 20016KT 7SM -RA OVC015 17/15 A2983"
        }
    ],
    
    // Simulation parameters
    updateInterval: 30000, // 30 seconds
    varianceRange: 0.1,    // ±10% variation
    
    // Weather condition presets for dynamic changes
    weatherPresets: [
        { conditions: "Clear", turbulence_boost: 0, visibility_min: 10 },
        { conditions: "Partly Cloudy", turbulence_boost: 0.05, visibility_min: 8 },
        { conditions: "Light Rain", turbulence_boost: 0.15, visibility_min: 6 },
        { conditions: "Thunderstorms", turbulence_boost: 0.25, visibility_min: 3 },
        { conditions: "Windy", turbulence_boost: 0.20, visibility_min: 9 }
    ]
};

/**
 * Generate realistic variations in the data
 */
window.addDataVariation = function(airport) {
    const variance = () => (Math.random() - 0.5) * 2 * window.MOCK_TURBULENCE_DATA.varianceRange;
    
    return {
        ...airport,
        turbulence_index: Math.max(0, Math.min(1, airport.turbulence_index + variance())),
        wind_speed: Math.max(0, airport.wind_speed + variance() * 10),
        temperature: airport.temperature + variance() * 5,
        pressure: airport.pressure + variance() * 5,
        humidity: Math.max(0, Math.min(100, airport.humidity + variance() * 10)),
        visibility: Math.max(1, airport.visibility + variance() * 3),
        last_updated: new Date().toISOString()
    };
};

// Add timestamp for demo purposes
window.DEMO_START_TIME = new Date().toISOString();

console.log("Mock turbulence data loaded for static demo");
