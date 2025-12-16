/**
 * cPanel Standalone Server Entry Point
 * This file runs the Next.js standalone build on cPanel
 */

const { createServer } = require('http');
const { parse } = require('url');
const path = require('path');

// Set production environment
process.env.NODE_ENV = 'production';

// Get port from environment or default to 3000
const port = process.env.PORT || 3000;
const hostname = process.env.HOSTNAME || 'localhost';

// Path to standalone server
const standaloneDir = path.join(__dirname, 'standalone');
const nextServer = require(path.join(standaloneDir, 'server.js'));

console.log('Starting Next.js standalone server...');
console.log(`Port: ${port}`);
console.log(`Hostname: ${hostname}`);
console.log(`Directory: ${standaloneDir}`);

// Start the server
const server = createServer(nextServer);

server.listen(port, hostname, (err) => {
  if (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
  console.log(`> Ready on http://${hostname}:${port}`);
  console.log(`> Environment: ${process.env.NODE_ENV}`);
});

server.on('error', (err) => {
  console.error('Server error:', err);
  process.exit(1);
});
