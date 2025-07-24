/**
 * Mock WorldWind for demo purposes when CDN is not available
 * This provides a basic fallback to ensure the demo works offline
 */

// Only create mock if WorldWind is not available
if (typeof WorldWind === 'undefined') {
    console.log('WorldWind CDN not available, using mock implementation for demo...');
    
    window.WorldWind = {
        WorldWindow: class {
            constructor(canvasId) {
                this.canvas = document.getElementById(canvasId);
                this.layers = [];
                this.navigator = {
                    lookAtLocation: { latitude: 39.8283, longitude: -98.5795 },
                    range: 8000000
                };
                this.setupCanvas();
            }
            
            addEventListener(event, handler) {
                // Mock event listener - store for later use if needed
                this.canvas.addEventListener(event, handler);
            }
            
            setupCanvas() {
                const ctx = this.canvas.getContext('2d');
                this.drawEarth(ctx);
            }
            
            drawEarth(ctx) {
                const width = this.canvas.width = this.canvas.clientWidth;
                const height = this.canvas.height = this.canvas.clientHeight;
                
                // Simple Earth representation
                const centerX = width / 2;
                const centerY = height / 2;
                const radius = Math.min(width, height) / 3;
                
                // Earth background
                ctx.fillStyle = '#1e3a8a';
                ctx.fillRect(0, 0, width, height);
                
                // Earth circle
                ctx.beginPath();
                ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
                ctx.fillStyle = '#2563eb';
                ctx.fill();
                ctx.strokeStyle = '#3b82f6';
                ctx.lineWidth = 2;
                ctx.stroke();
                
                // Simple continents representation
                ctx.fillStyle = '#059669';
                
                // North America (rough shape)
                ctx.beginPath();
                ctx.ellipse(centerX - radius * 0.3, centerY - radius * 0.2, radius * 0.4, radius * 0.3, 0, 0, 2 * Math.PI);
                ctx.fill();
                
                // Europe/Africa
                ctx.beginPath();
                ctx.ellipse(centerX + radius * 0.1, centerY, radius * 0.2, radius * 0.4, 0, 0, 2 * Math.PI);
                ctx.fill();
                
                // Title
                ctx.fillStyle = '#ffffff';
                ctx.font = '24px Arial';
                ctx.textAlign = 'center';
                ctx.fillText('Airport Turbulence Visualization', centerX, 50);
                ctx.font = '16px Arial';
                ctx.fillText('(Demo Mode - WorldWind Mock)', centerX, 75);
                
                // Store context for later use
                this.ctx = ctx;
                this.centerX = centerX;
                this.centerY = centerY;
                this.radius = radius;
            }
            
            addLayer(layer) {
                this.layers.push(layer);
                if (layer.renderables) {
                    this.renderLayer(layer);
                }
            }
            
            renderLayer(layer) {
                if (!this.ctx) return;
                
                layer.renderables.forEach(renderable => {
                    if (renderable.position) {
                        this.drawAirport(renderable);
                    }
                });
            }
            
            drawAirport(renderable) {
                const lat = renderable.position.latitude;
                const lon = renderable.position.longitude;
                
                // Simple projection (not accurate, just for demo)
                const x = this.centerX + (lon / 180) * this.radius;
                const y = this.centerY - (lat / 90) * this.radius;
                
                // Check if point is within Earth circle
                const dist = Math.sqrt((x - this.centerX) ** 2 + (y - this.centerY) ** 2);
                if (dist > this.radius) return;
                
                // Draw airport marker
                this.ctx.beginPath();
                this.ctx.arc(x, y, 8, 0, 2 * Math.PI);
                this.ctx.fillStyle = renderable.attributes.color || '#ef4444';
                this.ctx.fill();
                this.ctx.strokeStyle = '#ffffff';
                this.ctx.lineWidth = 2;
                this.ctx.stroke();
                
                // Draw airport code
                this.ctx.fillStyle = '#ffffff';
                this.ctx.font = '12px Arial';
                this.ctx.textAlign = 'center';
                this.ctx.fillText(renderable.label || 'Airport', x, y - 15);
            }
            
            redraw() {
                if (this.ctx) {
                    this.drawEarth(this.ctx);
                    this.layers.forEach(layer => {
                        if (layer.renderables) {
                            this.renderLayer(layer);
                        }
                    });
                }
            }
        },
        
        RenderableLayer: class {
            constructor(name) {
                this.displayName = name;
                this.renderables = [];
            }
            
            addRenderable(renderable) {
                this.renderables.push(renderable);
            }
            
            removeAllRenderables() {
                this.renderables = [];
            }
        },
        
        Position: class {
            constructor(latitude, longitude, altitude = 0) {
                this.latitude = latitude;
                this.longitude = longitude;
                this.altitude = altitude;
            }
        },
        
        Location: class {
            constructor(latitude, longitude) {
                this.latitude = latitude;
                this.longitude = longitude;
            }
        },
        
        Polygon: class {
            constructor(positions, attributes) {
                this.boundaries = [positions];
                this.attributes = attributes;
                this.altitudeMode = WorldWind.RELATIVE_TO_GROUND;
                this.userObject = null;
            }
        },
        
        SurfacePolygon: class {  
            constructor(positions, attributes) {
                this.boundaries = [positions];
                this.attributes = attributes;
                this.userObject = null;
            }
        },
        
        Placemark: class {
            constructor(position, eyeDistanceScaling = true, attributes = null) {
                this.position = position;
                this.eyeDistanceScaling = eyeDistanceScaling;
                this.attributes = attributes || {};
                this.highlightAttributes = null;
                this.altitudeMode = WorldWind.RELATIVE_TO_GROUND;
                this.label = '';
                this.userObject = null;
            }
        },
        
        PlacemarkAttributes: class {
            constructor(attributes) {
                this.imageColor = [1, 1, 1, 1];
                this.imageScale = 1;
                this.imageSource = null;
                this.imageOffset = null;
                this.labelAttributes = new WorldWind.TextAttributes();
                this.depthTest = true;
                this.eyeDistanceScaling = false;
                this.eyeDistanceScalingLabelThreshold = 2000000;
            }
        },
        
        ShapeAttributes: class {
            constructor() {
                this.outlineColor = [1, 1, 1, 1];
                this.interiorColor = [1, 1, 1, 1];
                this.outlineWidth = 1;
                this.drawOutline = true;
                this.drawInterior = true;
                this.enableLighting = false;
            }
        },
        
        TextAttributes: class {
            constructor() {
                this.color = [1, 1, 1, 1];
                this.font = null;
                this.offset = null;
            }
        },
        
        Font: class {
            constructor(size, style = 'normal') {
                this.size = size;
                this.style = style;
            }
        },
        
        Offset: class {
            constructor(x, xUnits, y, yUnits) {
                this.x = x;
                this.xUnits = xUnits;
                this.y = y;
                this.yUnits = yUnits;
            }
        },
        
        Color: class {
            constructor(r, g, b, a = 1) {
                this.red = r;
                this.green = g;
                this.blue = b;
                this.alpha = a;
                // Also store as array for compatibility
                this[0] = r;
                this[1] = g;
                this[2] = b;
                this[3] = a;
            }
            
            static get WHITE() { return [1, 1, 1, 1]; }
            static get RED() { return [1, 0, 0, 1]; }
            static get GREEN() { return [0, 1, 0, 1]; }
            static get BLUE() { return [0, 0, 1, 1]; }
            static get YELLOW() { return [1, 1, 0, 1]; }
            static get TRANSPARENT() { return [0, 0, 0, 0]; }
        },
        
        // Constants
        RELATIVE_TO_GROUND: 'RELATIVE_TO_GROUND',
        OFFSET_FRACTION: 'OFFSET_FRACTION',
        CLICK: 'click',
        
        // Mock layers that don't do anything but don't cause errors
        BMNGOneImageLayer: class { constructor() {} },
        BMNGLandsatLayer: class { constructor() {} },
        BingAerialWithLabelsLayer: class { constructor() {} },
        StarFieldLayer: class { constructor() { this.time = new Date(); } },
        AtmosphereLayer: class { constructor() { this.time = new Date(); } },
        CompassLayer: class { constructor() {} },
        CoordinatesDisplayLayer: class { constructor() {} },
        ViewControlsLayer: class { constructor() {} }
    };
    
    console.log('WorldWind mock initialized');
}