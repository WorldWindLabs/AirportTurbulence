/**
 * Static Demo App Controller
 * Manages the application without backend dependencies
 */

class StaticDemoApp {
    constructor() {
        this.visualizer = null;
        this.api = window.api;
        this.selectedAirport = null;
        this.isLoading = false;
        this.autoRefreshInterval = null;
        
        console.log('Static Demo App initialized');
    }

    async initialize() {
        try {
            this.showLoadingState(true);
            
            // Wait for WorldWind to be available
            if (!window.WorldWind) {
                console.log('Waiting for WorldWind to load...');
                await this.waitForWorldWind();
            }
            
            console.log('WorldWind available, initializing visualizer...');
            
            // Initialize the 3D visualizer
            this.visualizer = new TurbulenceVisualizer('globe');
            console.log('Visualizer created');
            
            // Set up event listeners
            this.setupEventListeners();
            
            // Load initial data
            await this.loadTurbulenceData();
            
            // Start real-time updates
            this.startAutoRefresh();
            this.api.startRealTimeUpdates();
            
            // Update connection status
            this.updateConnectionStatus('Static Demo Ready', 'demo');
            
            this.showLoadingState(false);
            
            console.log('Static demo app ready!');
            
        } catch (error) {
            console.error('Failed to initialize static demo app:', error);
            this.updateConnectionStatus('Initialization failed', 'error');
            this.showLoadingState(false);
        }
    }
    
    waitForWorldWind(timeout = 10000) {
        return new Promise((resolve, reject) => {
            if (window.WorldWind) {
                resolve();
                return;
            }
            
            const startTime = Date.now();
            const checkInterval = setInterval(() => {
                if (window.WorldWind) {
                    clearInterval(checkInterval);
                    resolve();
                } else if (Date.now() - startTime > timeout) {
                    clearInterval(checkInterval);
                    reject(new Error('WorldWind failed to load within timeout'));
                }
            }, 100);
        });
    }

    async loadTurbulenceData() {
        try {
            this.isLoading = true;
            this.updateStatus('Loading turbulence data...');
            
            const response = await this.api.getTurbulenceData();
            
            if (response.success) {
                // Update the visualizer
                this.visualizer.updateTurbulenceData(response.data);
                
                // Update the airport list
                this.updateAirportList(response.data);
                
                // Update status
                this.updateStatus(`Updated: ${new Date().toLocaleTimeString()}`);
                
                console.log(`Loaded data for ${response.data.length} airports`);
            }
            
        } catch (error) {
            console.error('Failed to load turbulence data:', error);
            this.updateStatus('Failed to load data');
        } finally {
            this.isLoading = false;
        }
    }

    updateAirportList(airports) {
        const airportList = document.getElementById('airport-list');
        if (!airportList) return;

        airportList.innerHTML = '';
        
        // Sort by turbulence level (highest first)
        const sortedAirports = airports.sort((a, b) => b.turbulence_index - a.turbulence_index);
        
        sortedAirports.forEach(airport => {
            const listItem = document.createElement('div');
            listItem.className = 'airport-item';
            listItem.onclick = () => this.selectAirport(airport.code);
            
            const severity = this.getTurbulenceSeverity(airport.turbulence_index);
            
            listItem.innerHTML = `
                <div class="airport-code">${airport.code}</div>
                <div class="airport-name">${airport.name}</div>
                <div class="airport-turbulence ${severity.class}">
                    ${severity.label}: ${(airport.turbulence_index * 100).toFixed(0)}%
                </div>
            `;
            
            airportList.appendChild(listItem);
        });
    }

    getTurbulenceSeverity(index) {
        if (index >= 0.6) return { class: 'severe', label: 'Severe' };
        if (index >= 0.4) return { class: 'moderate', label: 'Moderate' };  
        if (index >= 0.2) return { class: 'light', label: 'Light' };
        return { class: 'minimal', label: 'Minimal' };
    }

    async selectAirport(airportCode) {
        try {
            this.selectedAirport = airportCode;
            
            // Get detailed airport data
            const response = await this.api.getAirportDetails(airportCode);
            
            if (response.success) {
                this.displayAirportDetails(response.data);
                
                // Highlight on globe
                this.visualizer.selectAirport(airportCode);
            }
            
        } catch (error) {
            console.error('Failed to select airport:', error);
            this.displayAirportDetails(null);
        }
    }

    displayAirportDetails(airport) {
        const detailsContainer = document.getElementById('airport-details');
        if (!detailsContainer) return;

        if (!airport) {
            detailsContainer.innerHTML = '<p>Click on an airport to see details</p>';
            return;
        }

        const severity = this.getTurbulenceSeverity(airport.turbulence_index);
        const lastUpdated = new Date(airport.last_updated).toLocaleString();
        
        detailsContainer.innerHTML = `
            <div class="airport-header">
                <h3>${airport.code}</h3>
                <h4>${airport.name}</h4>
            </div>
            
            <div class="weather-summary">
                <div class="turbulence-indicator ${severity.class}">
                    <strong>Turbulence: ${severity.label}</strong>
                    <span>${(airport.turbulence_index * 100).toFixed(0)}%</span>
                </div>
            </div>
            
            <div class="weather-details">
                <div class="weather-row">
                    <span>Temperature:</span>
                    <span>${airport.temperature.toFixed(1)}°C</span>
                </div>
                <div class="weather-row">
                    <span>Wind:</span>
                    <span>${airport.wind_speed} kt @ ${airport.wind_direction}°</span>
                </div>
                <div class="weather-row">
                    <span>Pressure:</span>
                    <span>${airport.pressure.toFixed(1)} mb</span>
                </div>
                <div class="weather-row">
                    <span>Humidity:</span>
                    <span>${airport.humidity}%</span>
                </div>
                <div class="weather-row">
                    <span>Visibility:</span>
                    <span>${airport.visibility.toFixed(1)} mi</span>
                </div>
                <div class="weather-row">
                    <span>Conditions:</span>
                    <span>${airport.weather_conditions}</span>
                </div>
            </div>
            
            ${airport.weather_alerts && airport.weather_alerts.length > 0 ? `
                <div class="weather-alerts">
                    <h4>Weather Alerts</h4>
                    ${airport.weather_alerts.map(alert => `
                        <div class="alert ${alert.level}">
                            <strong>${alert.level.toUpperCase()}:</strong> ${alert.message}
                        </div>
                    `).join('')}
                </div>
            ` : ''}
            
            <div class="demo-info">
                <small>📊 Demo Mode - Data updates automatically</small>
                <small>🕒 Last Updated: ${lastUpdated}</small>
            </div>
        `;
    }

    setupEventListeners() {
        // Refresh button
        const refreshBtn = document.getElementById('refresh-data-btn');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => {
                this.loadTurbulenceData();
            });
        }

        // Reset view button  
        const resetBtn = document.getElementById('reset-view-btn');
        if (resetBtn) {
            resetBtn.addEventListener('click', () => {
                this.resetView();
            });
        }

        // Auto-refresh toggle
        const autoRefreshBtn = document.getElementById('auto-refresh-btn');
        if (autoRefreshBtn) {
            autoRefreshBtn.addEventListener('click', () => {
                this.toggleAutoRefresh();
            });
        }
    }

    resetView() {
        if (this.visualizer) {
            this.visualizer.resetView();
        }
        this.selectedAirport = null;
        document.getElementById('airport-details').innerHTML = 
            '<p>Click on an airport to see details</p>';
    }

    startAutoRefresh() {
        // Refresh data every 30 seconds
        this.autoRefreshInterval = setInterval(() => {
            if (!this.isLoading) {
                this.loadTurbulenceData();
            }
        }, 30000);
        
        console.log('Auto-refresh started (30 second interval)');
    }

    stopAutoRefresh() {
        if (this.autoRefreshInterval) {
            clearInterval(this.autoRefreshInterval);
            this.autoRefreshInterval = null;
        }
    }

    toggleAutoRefresh() {
        const btn = document.getElementById('auto-refresh-btn');
        if (this.autoRefreshInterval) {
            this.stopAutoRefresh();
            btn.textContent = '▶️ Start Auto-Refresh';
        } else {
            this.startAutoRefresh();
            btn.textContent = '⏸️ Stop Auto-Refresh';
        }
    }

    updateStatus(message) {
        const statusElement = document.getElementById('status-message');
        if (statusElement) {
            statusElement.textContent = message;
        }
    }

    updateConnectionStatus(status, type) {
        const statusElement = document.getElementById('connection-status');
        if (statusElement) {
            statusElement.textContent = status;
            statusElement.className = `connection-status ${type}`;
        }
    }

    showLoadingState(isLoading) {
        const loadingElement = document.getElementById('loading-overlay');
        if (loadingElement) {
            loadingElement.style.display = isLoading ? 'flex' : 'none';
        }
    }
}

// Initialize the app when the page loads
document.addEventListener('DOMContentLoaded', () => {
    window.demoApp = new StaticDemoApp();
    window.demoApp.initialize();
});

console.log('Static demo app controller loaded');
