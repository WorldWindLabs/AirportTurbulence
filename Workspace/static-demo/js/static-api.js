/**
 * Static API Layer - Replaces backend calls with mock data
 * Simulates the same API interface as the real backend
 */

class StaticAPI {
    constructor() {
        this.baseUrl = ''; // No backend needed
        this.demoMode = true;
        this.updateCount = 0;
        
        // Initialize with base data
        this.currentData = window.MOCK_TURBULENCE_DATA.airports.map(airport => ({...airport}));
        
        console.log('Static API initialized for demo mode');
    }

    /**
     * Simulate backend health check
     */
    async checkHealth() {
        await this.simulateDelay(200);
        return {
            status: 'healthy',
            message: 'Static demo mode - no backend required',
            timestamp: new Date().toISOString(),
            mode: 'demo'
        };
    }

    /**
     * Get current turbulence data with realistic variations
     */
    async getTurbulenceData() {
        await this.simulateDelay(500);
        
        // Add realistic variations to simulate live data
        this.currentData = this.currentData.map(airport => window.addDataVariation(airport));
        this.updateCount++;
        
        return {
            success: true,
            data: this.currentData,
            timestamp: new Date().toISOString(),
            update_count: this.updateCount,
            demo_mode: true
        };
    }

    /**
     * Get historical data (simulated)
     */
    async getHistoricalData(airport = null, hours = 24) {
        await this.simulateDelay(300);
        
        const historicalPoints = [];
        const now = new Date();
        
        // Generate realistic historical data points
        for (let i = hours; i >= 0; i--) {
            const timestamp = new Date(now.getTime() - (i * 60 * 60 * 1000));
            const baseAirport = this.findAirport(airport) || this.currentData[0];
            
            historicalPoints.push({
                timestamp: timestamp.toISOString(),
                airport_code: baseAirport.code,
                turbulence_index: Math.max(0, Math.min(1, 
                    baseAirport.turbulence_index + (Math.random() - 0.5) * 0.3
                )),
                temperature: baseAirport.temperature + (Math.random() - 0.5) * 10,
                wind_speed: Math.max(0, baseAirport.wind_speed + (Math.random() - 0.5) * 15),
                pressure: baseAirport.pressure + (Math.random() - 0.5) * 10
            });
        }

        return {
            success: true,
            data: historicalPoints,
            airport: airport,
            hours: hours,
            demo_mode: true
        };
    }

    /**
     * Get list of all airports
     */
    async getAirports() {
        await this.simulateDelay(200);
        
        return {
            success: true,
            data: this.currentData.map(airport => ({
                code: airport.code,
                name: airport.name,
                latitude: airport.latitude,
                longitude: airport.longitude,
                current_turbulence: airport.turbulence_index,
                last_updated: airport.last_updated
            })),
            demo_mode: true
        };
    }

    /**
     * Get detailed info for specific airport
     */
    async getAirportDetails(airportCode) {
        await this.simulateDelay(300);
        
        const airport = this.findAirport(airportCode);
        if (!airport) {
            throw new Error(`Airport ${airportCode} not found in demo data`);
        }

        // Add some additional demo details
        return {
            success: true,
            data: {
                ...airport,
                nearby_airports: this.getNearbyAirports(airport),
                turbulence_trend: this.generateTrend(),
                weather_alerts: this.generateAlerts(airport),
                demo_mode: true
            }
        };
    }

    /**
     * Helper methods
     */
    findAirport(code) {
        return this.currentData.find(airport => 
            airport.code.toLowerCase() === code?.toLowerCase()
        );
    }

    getNearbyAirports(targetAirport) {
        return this.currentData
            .filter(airport => airport.code !== targetAirport.code)
            .map(airport => {
                const distance = this.calculateDistance(
                    targetAirport.latitude, targetAirport.longitude,
                    airport.latitude, airport.longitude
                );
                return { ...airport, distance };
            })
            .sort((a, b) => a.distance - b.distance)
            .slice(0, 3);
    }

    calculateDistance(lat1, lon1, lat2, lon2) {
        const R = 3959; // Earth's radius in miles
        const dLat = this.toRadians(lat2 - lat1);
        const dLon = this.toRadians(lon2 - lon1);
        const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) *
                Math.sin(dLon/2) * Math.sin(dLon/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        return R * c;
    }

    toRadians(degrees) {
        return degrees * (Math.PI / 180);
    }

    generateTrend() {
        const trends = ['increasing', 'decreasing', 'stable'];
        return trends[Math.floor(Math.random() * trends.length)];
    }

    generateAlerts(airport) {
        const alerts = [];
        
        if (airport.turbulence_index > 0.6) {
            alerts.push({
                level: 'warning',
                message: 'High turbulence conditions detected',
                type: 'turbulence'
            });
        }
        
        if (airport.wind_speed > 20) {
            alerts.push({
                level: 'caution',
                message: 'Strong wind conditions',
                type: 'wind'
            });
        }
        
        if (airport.visibility < 5) {
            alerts.push({
                level: 'notice',
                message: 'Reduced visibility conditions',
                type: 'visibility'
            });
        }
        
        return alerts;
    }

    async simulateDelay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * Start automatic data updates to simulate real-time behavior
     */
    startRealTimeUpdates() {
        setInterval(() => {
            // Gradually vary the data to simulate changing conditions
            this.currentData = this.currentData.map(airport => {
                const variation = window.addDataVariation(airport);
                
                // Occasionally trigger bigger changes to simulate weather fronts
                if (Math.random() < 0.1) {
                    const preset = window.MOCK_TURBULENCE_DATA.weatherPresets[
                        Math.floor(Math.random() * window.MOCK_TURBULENCE_DATA.weatherPresets.length)
                    ];
                    variation.weather_conditions = preset.conditions;
                    variation.turbulence_index = Math.min(1, 
                        variation.turbulence_index + preset.turbulence_boost
                    );
                    variation.visibility = Math.max(preset.visibility_min, variation.visibility);
                }
                
                return variation;
            });
        }, window.MOCK_TURBULENCE_DATA.updateInterval);
        
        console.log('Real-time updates started for static demo');
    }
}

// Create global API instance
window.api = new StaticAPI();

// Add demo info to console
console.log(`
🌍 Airport Turbulence Visualization - Static Demo Mode
====================================================
• ${window.MOCK_TURBULENCE_DATA.airports.length} airports with simulated data
• Real-time variations every ${window.MOCK_TURBULENCE_DATA.updateInterval/1000} seconds
• No backend required - perfect for surge.sh deployment
• Demo started at: ${window.DEMO_START_TIME}
`);
