/**
 * iREVA Platform Webview Access Diagnostic Tool
 * 
 * This script checks accessibility of all three servers in the iREVA multi-server
 * architecture and validates that the application can be reached.
 */

const http = require('http');
const https = require('https');
const { JSDOM } = require('jsdom');

// Configuration
const HOSTNAME = process.env.REPL_SLUG ? `${process.env.REPL_SLUG}.${process.env.REPL_OWNER}.repl.co` : 'localhost';
const PORTS = [3000, 5000, 5001];
const TIMEOUT = 5000; // ms
const USE_HTTPS = process.env.REPL_SLUG ? true : false;

function log(message) {
  console.log(`[${new Date().toISOString()}] ${message}`);
}

// Check if a server is accessible
function checkServer(port, path = '/') {
  return new Promise((resolve) => {
    const protocol = USE_HTTPS ? https : http;
    const options = {
      hostname: HOSTNAME,
      port: port,
      path: path,
      method: 'GET',
      timeout: TIMEOUT,
      rejectUnauthorized: false // For self-signed certs in Replit
    };

    log(`Checking ${USE_HTTPS ? 'https' : 'http'}://${HOSTNAME}:${port}${path}`);
    
    const req = protocol.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        resolve({
          port,
          path,
          status: res.statusCode,
          headers: res.headers,
          data: data.length > 500 ? data.substring(0, 500) + '...' : data,
          working: res.statusCode >= 200 && res.statusCode < 400
        });
      });
    });
    
    req.on('error', (err) => {
      resolve({
        port,
        path,
        error: err.message,
        working: false
      });
    });
    
    req.on('timeout', () => {
      req.destroy();
      resolve({
        port,
        path,
        error: 'Connection timed out',
        working: false
      });
    });
    
    req.end();
  });
}

// Check if a port is accessible and analyze HTML content
async function checkHtmlContent(port, path = '/') {
  const result = await checkServer(port, path);
  
  if (result.working && result.data && result.data.includes('<!DOCTYPE html>')) {
    try {
      const dom = new JSDOM(result.data);
      const title = dom.window.document.title || 'No title';
      const h1 = dom.window.document.querySelector('h1')?.textContent || 'No h1';
      
      return {
        ...result,
        title,
        h1,
        isHtml: true
      };
    } catch (err) {
      return {
        ...result,
        parseError: err.message,
        isHtml: false
      };
    }
  }
  
  return {
    ...result,
    isHtml: false
  };
}

// Check main server health endpoints
async function checkHealth() {
  return await checkServer(5000, '/health');
}

// Check if main app is available
async function checkMainApp() {
  return await checkServer(5000, '/check-main-app');
}

// Check all servers
async function checkAllServers() {
  log('=== iREVA PLATFORM SERVER DIAGNOSTIC ===');
  log(`Testing on host: ${HOSTNAME}`);
  log(`Protocol: ${USE_HTTPS ? 'HTTPS' : 'HTTP'}`);
  
  // Check health first
  const healthResult = await checkHealth();
  log('Health check result:');
  console.log(healthResult);
  
  // Check main app availability
  const mainAppCheckResult = await checkMainApp();
  log('Main app check result:');
  console.log(mainAppCheckResult);
  
  // Check each port
  log('Checking all servers:');
  const results = await Promise.all(PORTS.map(port => checkHtmlContent(port)));
  
  results.forEach(result => {
    log(`Port ${result.port}: ${result.working ? 'ACCESSIBLE' : 'NOT ACCESSIBLE'}`);
    if (result.working) {
      log(`  Status: ${result.status}`);
      if (result.isHtml) {
        log(`  Title: ${result.title}`);
        log(`  H1: ${result.h1}`);
      }
    } else {
      log(`  Error: ${result.error || 'Unknown error'}`);
    }
    log('---');
  });
  
  // Provide recommendation
  const workingPorts = results.filter(r => r.working).map(r => r.port);
  
  if (workingPorts.length > 0) {
    log(`RECOMMENDATION: Use port ${workingPorts[0]} for accessing the application`);
    if (workingPorts.includes(5001)) {
      log('Direct access to port 5001 is available - this is the most reliable option');
      log(`URL: ${USE_HTTPS ? 'https' : 'http'}://${HOSTNAME}:5001/`);
    } else if (workingPorts.includes(3000)) {
      log('Access via the proxy on port 3000 is available');
      log(`URL: ${USE_HTTPS ? 'https' : 'http'}://${HOSTNAME}:3000/`);
    }
  } else {
    log('WARNING: None of the ports are accessible. Application may not be running.');
  }
}

// Run the diagnostic
checkAllServers().catch(err => {
  log(`Error running diagnostic: ${err.message}`);
});