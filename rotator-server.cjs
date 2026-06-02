/**
 * Small Terminal Server for tadericson.com Video Concept / Media Rotator
 * 
 * Run with: node rotator-server.cjs
 * Or: npm run rotator-server (after adding to package.json scripts)
 *
 * Serves the built PWA (dist/) on http://localhost:8080
 * Logs like a terminal for the "video concept" - rotating high-res images/videos/gifs.
 * 
 * For testing/deploy: 
 * 1. npm run build
 * 2. node rotator-server.cjs
 * 
 * To use your high-res media:
 * - Place files in dist/media/ (or update the media list in src/App.tsx to use your URLs)
 * - The rotator in the /video section will cycle them.
 * - "deploy" command in the in-browser terminal simulates deploying to this server.
 *
 * Future: add WebSocket control from the browser terminal to this server for real deployment.
 */

const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 8080;
const DIST_DIR = path.join(__dirname, 'dist');

console.log('[TERMINAL SERVER] Starting small terminal server for media rotator...');
console.log(`[SERVER] Listening on http://localhost:${PORT}`);
console.log('[SERVER] Serving built PWA from ./dist');
console.log('[SERVER] Video concept active: rotate through high-res images/videos/gifs.');
console.log('[SERVER] For testing: open http://localhost:8080 , go to VIDEO section, use terminal commands like "activate", "deploy".');
console.log('[SERVER] Add high-res media via local files or update mediaItems in code.');
console.log('[SERVER] Press Ctrl+C to stop.');

const server = http.createServer((req, res) => {
  let filePath = path.join(DIST_DIR, req.url === '/' ? 'index.html' : req.url);

  // Fallback for SPA routes (like /video)
  if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
    filePath = path.join(DIST_DIR, 'index.html');
  }

  const ext = path.extname(filePath);
  const contentType = {
    '.html': 'text/html',
    '.js': 'text/javascript',
    '.css': 'text/css',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpg',
    '.gif': 'image/gif',
    '.mp4': 'video/mp4',
  }[ext] || 'text/plain';

  fs.readFile(filePath, (err, content) => {
    if (err) {
      if (err.code === 'ENOENT') {
        res.writeHead(404);
        res.end('Not found. Run "npm run build" first?');
      } else {
        res.writeHead(500);
        res.end('Server error');
      }
    } else {
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content, 'utf-8');
    }
  });
});

server.listen(PORT, () => {
  console.log(`[SERVER] Terminal server ready at http://localhost:${PORT}`);
  console.log('[SERVER] Deploy your rotator here for local high-res media testing.');
});
