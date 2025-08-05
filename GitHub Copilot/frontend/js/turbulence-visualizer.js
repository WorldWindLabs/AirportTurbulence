/**
 * Web WorldWind Turbulence Visualizer
 */

class TurbulenceVisualizer {
    constructor(canvasId) {
        this.wwd = new WorldWind.WorldWindow(canvasId);
        this.turbulenceLayer = null;
        this.placemarks = [];
        this.selectedAirport = null;
        
        this.initializeGlobe();
    }

    initializeGlobe() {
        // Add basic Earth layers
        this.wwd.addLayer(new WorldWind.BMNGOneImageLayer());
        this.wwd.addLayer(new WorldWind.BMNGLandsatLayer());
        this.wwd.addLayer(new WorldWind.BingAerialWithLabelsLayer(null));
        
        // Add StarField layer first (requires dark background), then Atmosphere
        // This order is crucial for proper day/night display
        const starFieldLayer = new WorldWind.StarFieldLayer();
        const atmosphereLayer = new WorldWind.AtmosphereLayer();
        
        // Set current time for both layers to enable day/night cycle
        const now = new Date();
        starFieldLayer.time = now;
        atmosphereLayer.time = now;
        
        this.wwd.addLayer(starFieldLayer);
        this.wwd.addLayer(atmosphereLayer);
        
        // Store references for updates
        this.starFieldLayer = starFieldLayer;
        this.atmosphereLayer = atmosphereLayer;
        
        // Create turbulence layer
        this.turbulenceLayer = new WorldWind.RenderableLayer("Turbulence Data");
        this.wwd.addLayer(this.turbulenceLayer);
        
        // Add UI layers on top
        this.wwd.addLayer(new WorldWind.CompassLayer());
        this.wwd.addLayer(new WorldWind.CoordinatesDisplayLayer(this.wwd));
        this.wwd.addLayer(new WorldWind.ViewControlsLayer(this.wwd));

        // Create turbulence layer
        this.turbulenceLayer = new WorldWind.RenderableLayer("Turbulence Data");
        this.wwd.addLayer(this.turbulenceLayer);

        // Set initial camera position (centered over US)
        this.wwd.navigator.lookAtLocation.latitude = 39.8283;
        this.wwd.navigator.lookAtLocation.longitude = -98.5795;
        this.wwd.navigator.range = 8000000; // 8000 km
        
        this.wwd.redraw();

        // Add click handler
        this.setupClickHandler();
        
        // Start atmospheric layer updates
        this.startAtmosphereUpdates();
    }

    startAtmosphereUpdates() {
        // Update atmospheric layers with current time every 5 minutes
        setInterval(() => {
            const now = new Date();
            if (this.starFieldLayer) {
                this.starFieldLayer.time = now;
            }
            if (this.atmosphereLayer) {
                this.atmosphereLayer.time = now;
            }
            this.wwd.redraw();
        }, 300000); // 5 minutes
    }

    setupClickHandler() {
        this.wwd.addEventListener('click', (event) => {
            const pickList = this.wwd.pick(this.wwd.canvasCoordinates(event.clientX, event.clientY));
            
            if (pickList.objects.length > 0) {
                for (let i = 0; i < pickList.objects.length; i++) {
                    const pickedObject = pickList.objects[i];
                    if (pickedObject.userObject && pickedObject.userObject.airportCode) {
                        this.selectAirport(pickedObject.userObject.airportCode);
                        break;
                    }
                }
            }
        });
    }

    createElevatedTurbulenceCircle(lat, lon, turbulenceIndex, airportCode) {
        // Create a simple elevated circle that's always visible above terrain
        const elevationMeters = 5000 + (turbulenceIndex * 5000); // 5-10km above ground based on intensity
        const positions = this.generateCirclePositions(lat, lon, 50000, elevationMeters); // 50km radius
        
        // Determine color based on turbulence index
        const color = this.getTurbulenceColor(turbulenceIndex);
        
        // Create polygon
        const polygon = new WorldWind.Polygon(positions, null);
        polygon.altitudeMode = WorldWind.RELATIVE_TO_GROUND;
        polygon.extrude = false;
        
        // Style the polygon with intensity-based appearance
        const polygonAttributes = new WorldWind.ShapeAttributes(null);
        const intensity = Math.min(1.0, turbulenceIndex);
        polygonAttributes.interiorColor = new WorldWind.Color(
            color.r, color.g, color.b, 0.3 + (intensity * 0.3) // More opaque for higher turbulence
        );
        polygonAttributes.outlineColor = new WorldWind.Color(
            color.r, color.g, color.b, 0.8
        );
        polygonAttributes.outlineWidth = 2 + (intensity * 2);
        polygonAttributes.drawOutline = true;
        polygonAttributes.drawInterior = true;
        
        polygon.attributes = polygonAttributes;
        
        // Highlight attributes for selection
        const highlightAttributes = new WorldWind.ShapeAttributes(polygonAttributes);
        highlightAttributes.outlineColor = new WorldWind.Color(1, 1, 1, 1);
        highlightAttributes.outlineWidth = 4;
        polygon.highlightAttributes = highlightAttributes;
        
        // Add user data
        polygon.userObject = { 
            airportCode: airportCode,
            turbulenceIndex: turbulenceIndex,
            type: 'elevated'
        };
        
        return polygon;
    }

    createGroundTurbulenceArea(lat, lon, turbulenceIndex, airportCode) {
        // Create a surface-conforming polygon with multiple elevation points
        const positions = this.generateSurfaceConformingCircle(lat, lon, 50000); // 50km radius
        
        // Determine color based on turbulence index
        const color = this.getTurbulenceColor(turbulenceIndex);
        
        // Create polygon that follows terrain
        const polygon = new WorldWind.SurfacePolygon(positions, null);
        
        // Style the polygon with more transparency for ground layer
        const polygonAttributes = new WorldWind.ShapeAttributes(null);
        polygonAttributes.interiorColor = new WorldWind.Color(
            color.r, color.g, color.b, 0.3 // More transparent
        );
        polygonAttributes.outlineColor = new WorldWind.Color(
            color.r, color.g, color.b, 0.6
        );
        polygonAttributes.outlineWidth = 1;
        polygonAttributes.drawOutline = true;
        polygonAttributes.drawInterior = true;
        
        polygon.attributes = polygonAttributes;
        
        // Add user data
        polygon.userObject = { 
            airportCode: airportCode,
            turbulenceIndex: turbulenceIndex,
            type: 'ground'
        };
        
        return polygon;
    }

    generateSurfaceConformingCircle(centerLat, centerLon, radiusMeters, numPoints = 72) {
        const positions = [];
        const earthRadius = 6371000; // Earth radius in meters
        
        for (let i = 0; i <= numPoints; i++) {
            const angle = (i * 2 * Math.PI) / numPoints;
            
            const deltaLat = (radiusMeters * Math.cos(angle)) / earthRadius;
            const deltaLon = (radiusMeters * Math.sin(angle)) / 
                            (earthRadius * Math.cos(centerLat * Math.PI / 180));
            
            const lat = centerLat + (deltaLat * 180 / Math.PI);
            const lon = centerLon + (deltaLon * 180 / Math.PI);
            
            // Surface polygons don't need elevation - they conform to terrain
            positions.push(new WorldWind.Location(lat, lon));
        }
        
        return positions;
    }

    createAirportPlacemark(lat, lon, airportCode, turbulenceIndex) {
        const position = new WorldWind.Position(lat, lon, 1000);
        const placemark = new WorldWind.Placemark(position, false, null);
        
        // Create label
        placemark.label = airportCode;
        placemark.altitudeMode = WorldWind.RELATIVE_TO_GROUND;
        
        // Style the placemark
        const placemarkAttributes = new WorldWind.PlacemarkAttributes(null);
        placemarkAttributes.imageSource = this.createAirportIcon(turbulenceIndex);
        placemarkAttributes.imageScale = 0.8;
        placemarkAttributes.imageOffset = new WorldWind.Offset(
            WorldWind.OFFSET_FRACTION, 0.5,
            WorldWind.OFFSET_FRACTION, 0.0
        );
        placemarkAttributes.labelAttributes.color = WorldWind.Color.WHITE;
        placemarkAttributes.labelAttributes.font = new WorldWind.Font(14, "bold");
        placemarkAttributes.labelAttributes.offset = new WorldWind.Offset(
            WorldWind.OFFSET_FRACTION, 0.5,
            WorldWind.OFFSET_FRACTION, 1.5
        );
        
        // Ensure placemarks appear above other elements
        placemarkAttributes.depthTest = false;
        placemarkAttributes.eyeDistanceScaling = true;
        placemarkAttributes.eyeDistanceScalingLabelThreshold = 5000000;
        
        placemark.attributes = placemarkAttributes;
        
        // Highlight attributes
        const highlightAttributes = new WorldWind.PlacemarkAttributes(placemarkAttributes);
        highlightAttributes.imageScale = 1.2;
        placemark.highlightAttributes = highlightAttributes;
        
        // Add user data
        placemark.userObject = { 
            airportCode: airportCode,
            turbulenceIndex: turbulenceIndex 
        };
        
        return placemark;
    }

    generateCirclePositions(centerLat, centerLon, radiusMeters, elevationMeters = 5000, numPoints = 36) {
        const positions = [];
        const earthRadius = 6371000; // Earth radius in meters
        
        for (let i = 0; i <= numPoints; i++) {
            const angle = (i * 2 * Math.PI) / numPoints;
            
            const deltaLat = (radiusMeters * Math.cos(angle)) / earthRadius;
            const deltaLon = (radiusMeters * Math.sin(angle)) / 
                            (earthRadius * Math.cos(centerLat * Math.PI / 180));
            
            const lat = centerLat + (deltaLat * 180 / Math.PI);
            const lon = centerLon + (deltaLon * 180 / Math.PI);
            
            // Use elevation parameter for altitude
            positions.push(new WorldWind.Position(lat, lon, elevationMeters));
        }
        
        return positions;
    }

    getTurbulenceColor(turbulenceIndex) {
        if (turbulenceIndex <= 0.2) return { r: 0.11, g: 0.98, b: 0.11 }; // Green
        if (turbulenceIndex <= 0.4) return { r: 0.95, g: 1.0, b: 0.0 };   // Yellow
        if (turbulenceIndex <= 0.6) return { r: 1.0, g: 0.7, b: 0.0 };    // Orange
        if (turbulenceIndex <= 0.8) return { r: 1.0, g: 0.08, b: 0.0 };   // Red
        return { r: 0.3, g: 0.01, b: 0.38 }; // Purple
    }

    createAirportIcon(turbulenceIndex) {
        // Create a simple colored circle icon
        const canvas = document.createElement('canvas');
        canvas.width = 32;
        canvas.height = 32;
        const ctx = canvas.getContext('2d');
        
        const color = this.getTurbulenceColor(turbulenceIndex);
        
        // Draw circle
        ctx.beginPath();
        ctx.arc(16, 16, 12, 0, 2 * Math.PI);
        ctx.fillStyle = `rgb(${color.r * 255}, ${color.g * 255}, ${color.b * 255})`;
        ctx.fill();
        
        // Draw border
        ctx.strokeStyle = 'white';
        ctx.lineWidth = 2;
        ctx.stroke();
        
        // Draw airport symbol
        ctx.fillStyle = 'white';
        ctx.font = 'bold 14px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('✈', 16, 20);
        
        return canvas.toDataURL();
    }

    updateTurbulenceData(turbulenceData) {
        // Clear existing renderables
        this.turbulenceLayer.removeAllRenderables();
        this.placemarks = [];
        
        // Add new data
        if (turbulenceData && turbulenceData.data) {
            turbulenceData.data.forEach(airport => {
                // Add elevated turbulence circle (simplified approach)
                const elevatedCircle = this.createElevatedTurbulenceCircle(
                    airport.latitude,
                    airport.longitude,
                    airport.turbulence_index,
                    airport.airport_code
                );
                this.turbulenceLayer.addRenderable(elevatedCircle);
                
                // Add ground-level turbulence area for better visibility
                const groundArea = this.createGroundTurbulenceArea(
                    airport.latitude,
                    airport.longitude,
                    airport.turbulence_index,
                    airport.airport_code
                );
                this.turbulenceLayer.addRenderable(groundArea);
                
                // Add airport placemark
                const placemark = this.createAirportPlacemark(
                    airport.latitude,
                    airport.longitude,
                    airport.airport_code,
                    airport.turbulence_index
                );
                this.turbulenceLayer.addRenderable(placemark);
                this.placemarks.push(placemark);
            });
        }
        
        this.wwd.redraw();
    }

    selectAirport(airportCode) {
        this.selectedAirport = airportCode;
        
        // Reset all placemarks
        this.placemarks.forEach(placemark => {
            placemark.highlighted = false;
        });
        
        // Highlight selected airport
        const selectedPlacemark = this.placemarks.find(p => 
            p.userObject && p.userObject.airportCode === airportCode
        );
        
        if (selectedPlacemark) {
            selectedPlacemark.highlighted = true;
            
            // Center on airport
            this.wwd.navigator.lookAtLocation.latitude = selectedPlacemark.position.latitude;
            this.wwd.navigator.lookAtLocation.longitude = selectedPlacemark.position.longitude;
            this.wwd.navigator.range = 2000000; // 2000 km
        }
        
        this.wwd.redraw();
        
        // Trigger custom event
        const event = new CustomEvent('airportSelected', {
            detail: { airportCode: airportCode }
        });
        document.dispatchEvent(event);
    }

    resetView() {
        // Reset to initial view
        this.wwd.navigator.lookAtLocation.latitude = 39.8283;
        this.wwd.navigator.lookAtLocation.longitude = -98.5795;
        this.wwd.navigator.range = 8000000;
        
        // Clear selection
        this.selectedAirport = null;
        this.placemarks.forEach(placemark => {
            placemark.highlighted = false;
        });
        
        this.wwd.redraw();
    }

    redraw() {
        this.wwd.redraw();
    }
}

// Export for use in other modules
window.TurbulenceVisualizer = TurbulenceVisualizer;
