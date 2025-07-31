#!/usr/bin/env python3
"""
Simple HTTP server for the Airport Turbulence Visualization web app.
This server helps avoid CORS issues when testing the application locally.
"""

import http.server
import socketserver
import os
import sys
import urllib.request
import urllib.parse
from urllib.parse import urlparse

class CORSHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        # Add CORS headers to allow cross-origin requests
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        super().end_headers()
    
    def do_OPTIONS(self):
        # Handle preflight requests
        self.send_response(200)
        self.end_headers()

    def do_GET(self):
        if self.path.startswith('/proxy-metar'):
            self.handle_metar_proxy()
        else:
            super().do_GET()

    def handle_metar_proxy(self):
        try:
            # Parse the airport code from the query string
            query_components = urllib.parse.parse_qs(urllib.parse.urlparse(self.path).query)
            airport_code = query_components.get('airport', ['KSFO'])[0]
            
            # Construct the aviation weather API URL
            api_url = f"https://aviationweather.gov/api/data/metar?ids={airport_code}"
            params = {
                'dataSource': 'metars',
                'requestType': 'retrieve',
                'format': 'xml',
                'stationString': airport_code,
                'hoursBeforeNow': 1
            }
            
            # Add parameters to URL
            full_url = api_url + '&' + urllib.parse.urlencode(params)
            
            # Make the request to the aviation weather API
            req = urllib.request.Request(full_url)
            with urllib.request.urlopen(req) as response:
                data = response.read()
                
                # Send the response back to the client
                self.send_response(200)
                self.send_header('Content-Type', 'application/xml')
                self.end_headers()
                self.wfile.write(data)
                
        except Exception as e:
            print(f"Error in METAR proxy: {e}")
            self.send_response(500)
            self.send_header('Content-Type', 'text/plain')
            self.end_headers()
            self.wfile.write(f"Error: {str(e)}".encode())

def main():
    # Get the directory where this script is located
    script_dir = os.path.dirname(os.path.abspath(__file__))
    os.chdir(script_dir)
    
    # Set up the server
    PORT = 8000
    
    try:
        with socketserver.TCPServer(("", PORT), CORSHTTPRequestHandler) as httpd:
            print(f"🚀 Server started at http://localhost:{PORT}")
            print(f"📁 Serving files from: {script_dir}")
            print(f"🌐 Open your browser and navigate to: http://localhost:{PORT}")
            print("Press Ctrl+C to stop the server")
            httpd.serve_forever()
    except KeyboardInterrupt:
        print("\n🛑 Server stopped by user")
    except OSError as e:
        if e.errno == 48:  # Address already in use
            print(f"❌ Port {PORT} is already in use. Try a different port:")
            print(f"   python server.py --port 8001")
        else:
            print(f"❌ Error starting server: {e}")
    except Exception as e:
        print(f"❌ Unexpected error: {e}")

if __name__ == "__main__":
    # Check for port argument
    if len(sys.argv) > 1 and sys.argv[1] == "--port":
        try:
            PORT = int(sys.argv[2])
        except (IndexError, ValueError):
            print("Usage: python server.py [--port PORT_NUMBER]")
            sys.exit(1)
    else:
        PORT = 8000
    
    main() 