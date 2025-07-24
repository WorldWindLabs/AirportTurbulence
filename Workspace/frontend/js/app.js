/**
 * Main Application Controller
 */

class TurbulenceApp {
    constructor() {
        this.api = new TurbulenceAPI();
        this.visualizer = new TurbulenceVisualizer('globe');
        this.autoRefresh = true;
        this.refreshInterval = null;
        this.currentData = null;
        
        this.initializeApp();
    }

    async initializeApp() {
        try {
            // Check API health
            await this.checkAPIHealth();
            
            // Load initial data
            await this.loadTurbulenceData();
            
            // Setup UI event handlers
            this.setupEventHandlers();
            
            // Start auto-refresh
            this.startAutoRefresh();
            
            console.log('✅ Turbulence App initialized successfully');
        } catch (error) {
            console.error('❌ Failed to initialize app:', error);
            this.updateConnectionStatus('Offline', 'error');
        }
    }

    async checkAPIHealth() {
        try {
            await this.api.healthCheck();
            this.updateConnectionStatus('Connected', 'success');
        } catch (error) {
            this.updateConnectionStatus('API Unavailable', 'error');
            throw error;
        }
    }

    async loadTurbulenceData() {
        try {
            console.log('🔄 Loading turbulence data...');
            
            // Show loading state
            this.updateConnectionStatus('Loading...', 'loading');
            
            // Fetch data
            const data = await this.api.getAllTurbulenceData();
            this.currentData = data;
            
            // Update visualization
            this.visualizer.updateTurbulenceData(data);
            
            // Update UI
            this.updateAirportList(data.data);
            this.updateLastUpdateTime();
            this.updateConnectionStatus('Connected', 'success');
            
            console.log('✅ Data loaded successfully:', data);
        } catch (error) {
            console.error('❌ Failed to load data:', error);
            this.updateConnectionStatus('Error loading data', 'error');
        }
    }

    updateAirportList(airports) {
        const airportListEl = document.getElementById('airport-list');
        airportListEl.innerHTML = '';
        
        if (!airports || airports.length === 0) {
            airportListEl.innerHTML = '<p>No data available</p>';
            return;
        }
        
        airports.forEach(airport => {
            const airportEl = document.createElement('div');
            airportEl.className = 'airport-item';
            airportEl.dataset.airportCode = airport.airport_code;
            
            const turbulenceLevel = this.api.getTurbulenceLevel(airport.turbulence_index);
            const turbulenceColor = this.api.getTurbulenceColor(airport.turbulence_index);
            
            airportEl.innerHTML = `
                <div class="airport-code">
                    <span class="turbulence-indicator" style="background-color: ${turbulenceColor};"></span>
                    ${airport.airport_code}
                </div>
                <div class="airport-name">${this.getAirportName(airport.airport_code)}</div>
                <div style="font-size: 0.8rem; color: #ccc;">
                    TI: ${airport.turbulence_index.toFixed(3)} (${turbulenceLevel})
                </div>
            `;
            
            airportEl.addEventListener('click', () => {
                this.selectAirport(airport.airport_code);
            });
            
            airportListEl.appendChild(airportEl);
        });
    }

    selectAirport(airportCode) {
        // Update visualizer
        this.visualizer.selectAirport(airportCode);
        
        // Update UI
        this.updateAirportSelection(airportCode);
        this.showAirportDetails(airportCode);
    }

    updateAirportSelection(airportCode) {
        // Clear previous selection
        document.querySelectorAll('.airport-item').forEach(item => {
            item.classList.remove('active');
        });
        
        // Highlight selected airport
        const selectedItem = document.querySelector(`[data-airport-code="${airportCode}"]`);
        if (selectedItem) {
            selectedItem.classList.add('active');
        }
    }

    async showAirportDetails(airportCode) {
        const detailsEl = document.getElementById('airport-details');
        
        try {
            const airportData = await this.api.getAirportTurbulence(airportCode);
            
            const turbulenceLevel = this.api.getTurbulenceLevel(airportData.turbulence_index);
            const timestamp = new Date(airportData.timestamp).toLocaleString();
            
            detailsEl.innerHTML = `
                <div class="detail-row">
                    <span class="detail-label">Airport:</span>
                    <span class="detail-value">${airportData.airport_code}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Turbulence Index:</span>
                    <span class="detail-value">${airportData.turbulence_index.toFixed(3)}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Level:</span>
                    <span class="detail-value">${turbulenceLevel}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Wind Speed:</span>
                    <span class="detail-value">${airportData.wind_speed} kt</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Temperature:</span>
                    <span class="detail-value">${airportData.temperature}°C</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Pressure:</span>
                    <span class="detail-value">${airportData.pressure} mb</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Humidity:</span>
                    <span class="detail-value">${airportData.humidity}%</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Updated:</span>
                    <span class="detail-value">${timestamp}</span>
                </div>
            `;
        } catch (error) {
            detailsEl.innerHTML = '<p style="color: #ff6b6b;">Error loading airport details</p>';
        }
    }

    setupEventHandlers() {
        // Refresh button
        document.getElementById('refresh-btn').addEventListener('click', () => {
            this.loadTurbulenceData();
        });
        
        // Auto-refresh toggle
        const autoRefreshBtn = document.getElementById('auto-refresh-btn');
        autoRefreshBtn.addEventListener('click', () => {
            this.toggleAutoRefresh();
        });
        
        // Reset view button
        document.getElementById('reset-view-btn').addEventListener('click', () => {
            this.resetView();
        });
        
        // Listen for airport selection from visualizer
        document.addEventListener('airportSelected', (event) => {
            this.updateAirportSelection(event.detail.airportCode);
            this.showAirportDetails(event.detail.airportCode);
        });
    }

    toggleAutoRefresh() {
        this.autoRefresh = !this.autoRefresh;
        const btn = document.getElementById('auto-refresh-btn');
        
        if (this.autoRefresh) {
            btn.textContent = '🔄 Auto-refresh: ON';
            btn.dataset.active = 'true';
            this.startAutoRefresh();
        } else {
            btn.textContent = '🔄 Auto-refresh: OFF';
            btn.dataset.active = 'false';
            this.stopAutoRefresh();
        }
    }

    startAutoRefresh() {
        if (this.autoRefresh && !this.refreshInterval) {
            this.refreshInterval = setInterval(() => {
                this.loadTurbulenceData();
            }, 60000); // Refresh every minute
        }
    }

    stopAutoRefresh() {
        if (this.refreshInterval) {
            clearInterval(this.refreshInterval);
            this.refreshInterval = null;
        }
    }

    resetView() {
        this.visualizer.resetView();
        
        // Clear airport selection
        document.querySelectorAll('.airport-item').forEach(item => {
            item.classList.remove('active');
        });
        
        document.getElementById('airport-details').innerHTML = 
            '<p>Click on an airport to see details</p>';
    }

    updateConnectionStatus(status, type) {
        const statusEl = document.getElementById('connection-status');
        statusEl.textContent = status;
        
        statusEl.className = ''; // Reset classes
        if (type === 'error') {
            statusEl.style.color = '#ff6b6b';
        } else if (type === 'success') {
            statusEl.style.color = '#00ff88';
        } else if (type === 'loading') {
            statusEl.style.color = '#00d4ff';
        }
    }

    updateLastUpdateTime() {
        const lastUpdateEl = document.getElementById('last-update');
        const updateTime = this.api.getLastUpdateTime();
        lastUpdateEl.textContent = `Last update: ${this.api.formatTimestamp(updateTime)}`;
    }

    getAirportName(code) {
        const airportNames = {
            'KSFO': 'San Francisco International',
            'KJFK': 'John F. Kennedy International',
            'KDFW': 'Dallas/Fort Worth International'
        };
        return airportNames[code] || 'Unknown Airport';
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const app = new TurbulenceApp();
    window.turbulenceApp = app; // Make it globally available for debugging
});

// Handle window resize
window.addEventListener('resize', () => {
    if (window.turbulenceApp && window.turbulenceApp.visualizer) {
        window.turbulenceApp.visualizer.redraw();
    }
});
