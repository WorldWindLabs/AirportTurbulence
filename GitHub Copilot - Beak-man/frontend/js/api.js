/**
 * API client for Airport Turbulence Backend
 */

class TurbulenceAPI {
    constructor(baseUrl = 'http://localhost:5000/api') {
        this.baseUrl = baseUrl;
        this.lastUpdate = null;
    }

    async makeRequest(endpoint) {
        try {
            const response = await fetch(`${this.baseUrl}${endpoint}`);
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            return await response.json();
        } catch (error) {
            console.error(`API request failed for ${endpoint}:`, error);
            throw error;
        }
    }

    async getAllTurbulenceData() {
        const data = await this.makeRequest('/turbulence');
        this.lastUpdate = new Date();
        return data;
    }

    async getAirportTurbulence(airportCode) {
        return await this.makeRequest(`/turbulence/${airportCode}`);
    }

    async getAirportHistory(airportCode, hours = 24) {
        return await this.makeRequest(`/history/${airportCode}?hours=${hours}`);
    }

    async getAirports() {
        return await this.makeRequest('/airports');
    }

    async healthCheck() {
        return await this.makeRequest('/health');
    }

    getLastUpdateTime() {
        return this.lastUpdate;
    }

    formatTimestamp(timestamp) {
        if (!timestamp) return 'Never';
        const date = new Date(timestamp);
        return date.toLocaleTimeString();
    }

    getTurbulenceLevel(index) {
        if (index <= 0.2) return 'Light';
        if (index <= 0.4) return 'Light-Moderate';
        if (index <= 0.6) return 'Moderate';
        if (index <= 0.8) return 'Moderate-Severe';
        return 'Severe';
    }

    getTurbulenceColor(index) {
        if (index <= 0.2) return '#03fc1c';
        if (index <= 0.4) return '#f2ff00';
        if (index <= 0.6) return '#ffb300';
        if (index <= 0.8) return '#ff1500';
        return '#4c0261';
    }
}

// Export for use in other modules
window.TurbulenceAPI = TurbulenceAPI;
