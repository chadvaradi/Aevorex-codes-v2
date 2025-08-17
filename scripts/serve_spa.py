import http.server
import socketserver
import os

PORT = 8083
DIRECTORY = "shared/frontend/dist"

class SPAHttpRequestHandler(http.server.SimpleHTTPRequestHandler):
    def do_GET(self):
        # Get the path of the requested file
        path = self.translate_path(self.path)
        
        # If the file does not exist, serve index.html
        if not os.path.exists(path):
            self.path = '/index.html'
        
        return http.server.SimpleHTTPRequestHandler.do_GET(self)

# Change working directory to the SPA's dist folder so that all assets are served correctly
project_root = os.path.join(os.path.dirname(__file__), '..')
dist_dir = os.path.join(project_root, DIRECTORY)

# Ensure the dist directory exists – if not, alert the user early.
if not os.path.isdir(dist_dir):
    raise FileNotFoundError(
        f"Dist directory not found at '{dist_dir}'. Run 'pnpm build' in shared/frontend first."
    )

# Serve from the dist directory
os.chdir(dist_dir)

class MyTCPServer(socketserver.TCPServer):
    def __init__(self, server_address, RequestHandlerClass):
        self.allow_reuse_address = True
        super().__init__(server_address, RequestHandlerClass)

handler = SPAHttpRequestHandler

# Set up the server
httpd = MyTCPServer(("", PORT), handler)

print(f"Serving {DIRECTORY} at http://localhost:{PORT}")
httpd.serve_forever() 