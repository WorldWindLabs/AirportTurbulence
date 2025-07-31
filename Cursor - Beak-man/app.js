// NASA WorldWind Turbulence Visualization App
class TurbulenceVisualizer {
    constructor() {
        this.wwd = null;
        this.currentPlacemark = null;
        this.airportData = {
            'KSFO': { name: 'San Francisco International', lat: 37.6189, lon: -122.3750 },
            'KJFK': { name: 'John F. Kennedy International', lat: 40.6413, lon: -73.7781 },
            'KDFW': { name: 'Dallas/Fort Worth International', lat: 32.8968, lon: -97.0380 }
        };
        
        this.weights = {
            windSpeed: 0.4,
            temperature: 0.3,
            pressure: 0.2,
            humidity: 0.1
        };
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.setupWorldWind();
    }

    setupWorldWind() {
        // Wait for WorldWind to be available
        const checkWorldWind = () => {
            if (typeof WorldWind !== 'undefined' || typeof window.WorldWind !== 'undefined') {
                try {
                                         // Check if canvas element exists
                     const canvas = document.getElementById('wwd-canvas');
                     if (!canvas) {
                         throw new Error('Canvas element not found');
                     }

                     // Try different WorldWind APIs
                     let WorldWindAPI = WorldWind || window.WorldWind;
                     
                     // Initialize WorldWind with canvas ID string
                     this.wwd = new WorldWindAPI.WorldWindow("wwd-canvas");
                    
                                         // Add high-resolution Landsat layer as the primary layer
                     try {
                         const landsatLayer = new WorldWindAPI.BMNGLandsatLayer();
                         this.wwd.addLayer(landsatLayer);
                         console.log('BMNGLandsatLayer added successfully');
                     } catch (e) {
                         console.log('BMNGLandsatLayer not available, trying alternative layers:', e);
                         
                         // Try different high-resolution layers
                         const highResLayers = [
                             { name: 'LandsatLayer', constructor: WorldWindAPI.LandsatLayer },
                             { name: 'BMNGWMSLayer', constructor: WorldWindAPI.BMNGWMSLayer },
                             { name: 'BMNGOneImageLayer', constructor: WorldWindAPI.BMNGOneImageLayer }
                         ];
                         
                         let layerAdded = false;
                         for (const layer of highResLayers) {
                             try {
                                 this.wwd.addLayer(new layer.constructor());
                                 console.log(`${layer.name} added successfully`);
                                 layerAdded = true;
                                 break;
                             } catch (e2) {
                                 console.log(`${layer.name} not available:`, e2);
                             }
                         }
                         
                         if (!layerAdded) {
                             console.log('No layers available, adding basic BMNGOneImageLayer');
                             this.wwd.addLayer(new WorldWindAPI.BMNGOneImageLayer());
                         }
                     }
                     
                     // Add StarField layer first (background)
                     try {
                         const starFieldLayer = new WorldWindAPI.StarFieldLayer();
                         const now = new Date();
                         starFieldLayer.time = now;
                         this.wwd.addLayer(starFieldLayer);
                         console.log('StarField layer added successfully');
                     } catch (e) {
                         console.log('StarField layer not available:', e);
                     }
                     
                     // Add Atmosphere layer after the imagery layers
                     try {
                         const atmosphereLayer = new WorldWindAPI.AtmosphereLayer();
                         const now = new Date();
                         atmosphereLayer.time = now;
                         this.wwd.addLayer(atmosphereLayer);
                         console.log('Atmosphere layer added successfully');
                     } catch (e) {
                         console.log('Atmosphere layer not available:', e);
                     }
                     
                     // Add view controls and other UI elements
                     this.wwd.addLayer(new WorldWindAPI.ViewControlsLayer(this.wwd));
                     
                     // Try to add compass and coordinates if available
                     try {
                         this.wwd.addLayer(new WorldWindAPI.CompassLayer());
                     } catch (e) {
                         console.log('Compass layer not available');
                     }
                     
                     try {
                         this.wwd.addLayer(new WorldWindAPI.CoordinatesDisplayLayer(this.wwd));
                     } catch (e) {
                         console.log('Coordinates display layer not available');
                     }
                    
                    // Set initial view
                    this.wwd.navigator.lookAtLocation.latitude = 39.8283;
                    this.wwd.navigator.lookAtLocation.longitude = -98.5795;
                    this.wwd.navigator.range = 5000000; // 5000 km

                                         console.log('WorldWind initialized successfully');
                     
                     // Start time update for day/night cycle
                     this.startTimeUpdate();
                     
                     // Load initial data after WorldWind is ready
                     this.loadInitialData();
                } catch (error) {
                    console.error('Error initializing WorldWind:', error);
                    this.showError('Failed to initialize 3D globe: ' + error.message);
                }
            } else {
                // Try again in 100ms
                setTimeout(checkWorldWind, 100);
            }
        };
        
        checkWorldWind();
    }

    setupEventListeners() {
        const airportSelect = document.getElementById('airport-select');
        const refreshBtn = document.getElementById('refresh-btn');

        airportSelect.addEventListener('change', () => {
            this.loadTurbulenceData(airportSelect.value);
        });

        refreshBtn.addEventListener('click', () => {
            this.loadTurbulenceData(airportSelect.value);
        });
    }

    async loadInitialData() {
        if (this.wwd) {
            const airportSelect = document.getElementById('airport-select');
            await this.loadTurbulenceData(airportSelect.value);
        }
    }

    showLoading(show) {
        const loadingOverlay = document.getElementById('loading-overlay');
        if (show) {
            loadingOverlay.classList.add('active');
        } else {
            loadingOverlay.classList.remove('active');
        }
    }

    async loadTurbulenceData(airportCode) {
        this.showLoading(true);
        
        try {
            const data = await this.fetchMETARData(airportCode);
            if (data) {
                const turbulenceData = this.calculateTurbulenceIndex(data);
                this.updateUI(turbulenceData, data);
                this.updateWorldWindVisualization(turbulenceData, data);
            } else {
                this.showError('Failed to load turbulence data');
            }
        } catch (error) {
            console.error('Error loading turbulence data:', error);
            this.showError('Error loading data: ' + error.message);
        } finally {
            this.showLoading(false);
        }
    }

         async fetchMETARData(airportCode) {
         // Use the Python server as a proxy to avoid CORS issues
         const url = `http://localhost:8000/proxy-metar?airport=${airportCode}`;

         try {
             const response = await fetch(url);
             
             if (!response.ok) {
                 throw new Error(`HTTP error! status: ${response.status}`);
             }
             
             const xmlText = await response.text();
             return this.parseMETARXML(xmlText);
         } catch (error) {
             console.error('Error fetching METAR data:', error);
             throw error;
         }
     }

    parseMETARXML(xmlText) {
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(xmlText, "text/xml");
        
        const metarNode = xmlDoc.querySelector("METAR");
        if (!metarNode) {
            throw new Error("No METAR data found");
        }

        const rawText = metarNode.querySelector("raw_text")?.textContent;
        const latitude = parseFloat(metarNode.querySelector("latitude")?.textContent);
        const longitude = parseFloat(metarNode.querySelector("longitude")?.textContent);

        if (!rawText || isNaN(latitude) || isNaN(longitude)) {
            throw new Error("Invalid METAR data");
        }

        return this.parseMETARText(rawText, latitude, longitude);
    }

         parseMETARText(rawText, latitude, longitude) {
         console.log('Parsing METAR text:', rawText);
         
         // Parse METAR text format
         const parts = rawText.split(' ');
         let windSpeed = 0;
         let temperature = 0;
         let pressure = 1013.25; // Default pressure
         let dewPoint = 0;

         for (let i = 0; i < parts.length; i++) {
             const part = parts[i];
             console.log(`Parsing part ${i}: "${part}"`);
             
             // Parse wind (e.g., "27015KT" or "27015G25KT")
             if (/^\d{5}KT$/.test(part)) {
                 windSpeed = parseInt(part.substring(3, 5));
                 console.log(`Found wind speed: ${windSpeed} KT`);
             } else if (/^\d{5}G\d{2,3}KT$/.test(part)) {
                 // Handle gusting winds
                 windSpeed = parseInt(part.substring(3, 5));
                 console.log(`Found wind speed with gusts: ${windSpeed} KT`);
             }
             
             // Parse temperature and dew point (e.g., "15/10" or "M15/M10")
             if (/^-?\d+\/-?\d+$/.test(part)) {
                 const tempParts = part.split('/');
                 temperature = parseInt(tempParts[0]);
                 dewPoint = parseInt(tempParts[1]);
                 console.log(`Found temperature: ${temperature}°C, dew point: ${dewPoint}°C`);
             } else if (/^M\d+\/M\d+$/.test(part)) {
                 // Handle negative temperatures (M = minus)
                 const tempParts = part.split('/');
                 temperature = -parseInt(tempParts[0].substring(1));
                 dewPoint = -parseInt(tempParts[1].substring(1));
                 console.log(`Found negative temperature: ${temperature}°C, dew point: ${dewPoint}°C`);
             }
             
             // Parse pressure (e.g., "A2992" or "Q1013")
             if (part.startsWith('A')) {
                 pressure = parseInt(part.substring(1)) / 10;
                 console.log(`Found pressure (A): ${pressure} mb`);
             } else if (part.startsWith('Q')) {
                 pressure = parseInt(part.substring(1));
                 console.log(`Found pressure (Q): ${pressure} mb`);
             }
         }

         // Validate the parsed data
         if (isNaN(windSpeed)) windSpeed = 0;
         if (isNaN(temperature)) temperature = 0;
         if (isNaN(pressure)) pressure = 1013.25;
         if (isNaN(dewPoint)) dewPoint = 0;

         console.log('Parsed METAR data:', {
             windSpeed,
             temperature,
             pressure,
             dewPoint,
             latitude,
             longitude
         });

         return {
             windSpeed,
             temperature,
             pressure,
             dewPoint,
             latitude,
             longitude,
             rawText
         };
     }

         calculateTurbulenceIndex(data) {
         console.log('Calculating turbulence index for data:', data);
         
         const windSpeedContribution = (data.windSpeed / 50) * this.weights.windSpeed;
         const temperatureContribution = (Math.abs(data.temperature) / 40) * this.weights.temperature;
         const pressureContribution = Math.abs((data.pressure - 980) / 50) * this.weights.pressure;
         
         // Calculate relative humidity
         const rh = this.calculateRelativeHumidity(data.temperature, data.dewPoint);
         const humidityContribution = (rh / 100) * this.weights.humidity;

         console.log('Turbulence contributions:', {
             windSpeed: windSpeedContribution,
             temperature: temperatureContribution,
             pressure: pressureContribution,
             humidity: humidityContribution,
             rh: rh
         });

         const turbulenceIndex = windSpeedContribution + temperatureContribution + 
                                pressureContribution + humidityContribution;

         console.log('Final turbulence index:', turbulenceIndex);

         return {
             index: Math.min(turbulenceIndex, 1.0), // Cap at 1.0
             windSpeed: data.windSpeed,
             temperature: data.temperature,
             pressure: data.pressure,
             humidity: rh,
             category: this.getTurbulenceCategory(turbulenceIndex)
         };
     }

         calculateRelativeHumidity(temp, dewPoint) {
         console.log(`Calculating RH: temp=${temp}°C, dewPoint=${dewPoint}°C`);
         
         const saturationVaporPressure = (t) => 6.11 * Math.pow(10, (7.5 * t) / (237.7 + t));
         
         const eT = saturationVaporPressure(temp);
         const eTd = saturationVaporPressure(dewPoint);
         const rh = 100 * (eTd / eT);
         
         console.log(`RH calculation: eT=${eT}, eTd=${eTd}, RH=${rh}%`);
         
         return Math.round(rh * 10) / 10;
     }

    getTurbulenceCategory(index) {
        if (index <= 0.2) return 'Low';
        if (index <= 0.4) return 'Moderate';
        if (index <= 0.6) return 'High';
        if (index <= 0.8) return 'Severe';
        return 'Extreme';
    }

    getColorForTurbulence(index) {
        let WorldWindAPI = WorldWind || window.WorldWind;
        if (index <= 0.2) return new WorldWindAPI.Color(0.11, 0.99, 0.01, 0.8); // #1cfc03
        if (index <= 0.4) return new WorldWindAPI.Color(0.0, 1.0, 0.95, 0.8);   // #00fff2
        if (index <= 0.6) return new WorldWindAPI.Color(0.0, 0.70, 1.0, 0.8);   // #00b3ff
        if (index <= 0.8) return new WorldWindAPI.Color(0.0, 0.08, 1.0, 0.8);   // #0015ff
        return new WorldWindAPI.Color(0.38, 0.01, 0.30, 0.8);                   // #61024c
    }

    updateUI(turbulenceData, metarData) {
        // Update turbulence index
        const turbulenceIndexEl = document.getElementById('turbulence-index');
        const turbulenceCategoryEl = document.getElementById('turbulence-category');
        
        turbulenceIndexEl.textContent = turbulenceData.index.toFixed(2);
        turbulenceCategoryEl.textContent = turbulenceData.category;
        
        // Update color based on category
        turbulenceIndexEl.className = `turbulence-value turbulence-${turbulenceData.category.toLowerCase()}`;
        
        // Update weather data
        document.getElementById('temperature').textContent = `${turbulenceData.temperature}°C`;
        document.getElementById('wind-speed').textContent = `${turbulenceData.windSpeed} KT`;
        document.getElementById('pressure').textContent = `${turbulenceData.pressure} mb`;
        document.getElementById('humidity').textContent = `${turbulenceData.humidity}%`;
    }

    updateWorldWindVisualization(turbulenceData, metarData) {
        // Check if WorldWind is available
        if (!this.wwd || (typeof WorldWind === 'undefined' && typeof window.WorldWind === 'undefined')) {
            console.warn('WorldWind not available for visualization');
            return;
        }

        // Remove previous placemark
        if (this.currentPlacemark) {
            this.wwd.layers.forEach(layer => {
                if (layer.displayName === 'Turbulence Data') {
                    this.wwd.removeLayer(layer);
                }
            });
        }

        // Get WorldWind API
        let WorldWindAPI = WorldWind || window.WorldWind;

        // Create new layer for turbulence data
        const turbulenceLayer = new WorldWindAPI.RenderableLayer("Turbulence Data");
        
        // Create placemark
        const placemark = new WorldWindAPI.Placemark(
            new WorldWindAPI.Position(metarData.latitude, metarData.longitude, 0)
        );

                 // Create circle geometry for turbulence visualization
         const circleRadius = 5; // 5km radius (much smaller)
         const circlePositions = this.generateCirclePositions(
             metarData.latitude, 
             metarData.longitude, 
             circleRadius
         );

        const circleAttributes = new WorldWindAPI.ShapeAttributes(null);
        circleAttributes.interiorColor = this.getColorForTurbulence(turbulenceData.index);
        circleAttributes.outlineColor = WorldWindAPI.Color.WHITE;
        circleAttributes.outlineWidth = 2;

        const circle = new WorldWindAPI.SurfacePolygon(circlePositions, circleAttributes);
        circle.displayName = `Turbulence Index: ${turbulenceData.index.toFixed(2)} (${turbulenceData.category})`;
        
        // Add popup information
        circle.pickDelegate = () => {
            return {
                title: `${this.airportData[document.getElementById('airport-select').value].name}`,
                description: `
                    <strong>Turbulence Index:</strong> ${turbulenceData.index.toFixed(2)} (${turbulenceData.category})<br>
                    <strong>Temperature:</strong> ${turbulenceData.temperature}°C<br>
                    <strong>Wind Speed:</strong> ${turbulenceData.windSpeed} KT<br>
                    <strong>Pressure:</strong> ${turbulenceData.pressure} mb<br>
                    <strong>Humidity:</strong> ${turbulenceData.humidity}%<br>
                    <strong>Raw METAR:</strong> ${metarData.rawText}
                `
            };
        };

        turbulenceLayer.addRenderable(circle);
        this.wwd.addLayer(turbulenceLayer);

        // Fly to the location
        this.wwd.navigator.lookAtLocation.latitude = metarData.latitude;
        this.wwd.navigator.lookAtLocation.longitude = metarData.longitude;
        this.wwd.navigator.range = 100000; // 100km

        this.currentPlacemark = circle;
    }

    generateCirclePositions(centerLat, centerLon, radiusKm) {
        const positions = [];
        const numPoints = 36;
        const earthRadius = 6371.0; // km
        let WorldWindAPI = WorldWind || window.WorldWind;

        for (let i = 0; i <= numPoints; i++) {
            const angle = (i * 360 / numPoints) * (Math.PI / 180);
            const dLat = (radiusKm / earthRadius) * Math.cos(angle);
            const dLon = (radiusKm / (earthRadius * Math.cos(centerLat * Math.PI / 180))) * Math.sin(angle);
            
            const lat = centerLat + (dLat * 180 / Math.PI);
            const lon = centerLon + (dLon * 180 / Math.PI);
            
            positions.push(new WorldWindAPI.Position(lat, lon, 0));
        }

        return positions;
    }

         startTimeUpdate() {
         // Update the time for StarField and Atmosphere layers every minute
         setInterval(() => {
             if (this.wwd) {
                 const now = new Date();
                 this.wwd.layers.forEach(layer => {
                     if (layer.time !== undefined) {
                         layer.time = now;
                     }
                 });
                 this.wwd.redraw();
             }
         }, 60000); // Update every minute
     }

     showError(message) {
         console.error(message);
         // You could add a toast notification here
         alert(message);
     }
}

// Initialize the app when the page loads
document.addEventListener('DOMContentLoaded', () => {
    try {
        new TurbulenceVisualizer();
    } catch (error) {
        console.error('Failed to initialize TurbulenceVisualizer:', error);
        alert('Failed to initialize the application. Please refresh the page.');
    }
}); 