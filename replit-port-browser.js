/**
 * Replit Port Browser Helper
 *
 * This script helps debug port issues on Replit by scanning various
 * common port combinations and checking which ones are accessible.
 * It's particularly useful for finding the correct URL format for
 * accessing different services running in a Replit environment.
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');
const dns = require('dns');

// Configuration
const TIMEOUT_MS = 3000;
const DEFAULT_PORTS = [3000, 5000, 5001, 8080, 8000];
const REPLIT_DOMAINS = ['replit.app', 'replit.dev', 'repl.co', 'id.repl.co', 'repl.run'];

function log(message) {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${message}`);
}

// Get Replit information from environment
function getReplitInfo() {
  const replId = process.env.REPL_ID || '';
  const replSlug = process.env.REPL_SLUG || '';
  const replOwner = process.env.REPL_OWNER || '';
  
  log(`Replit info: id=${replId}, slug=${replSlug}, owner=${replOwner}`);
  return { replId, replSlug, replOwner };
}

// Generate possible URLs
function generatePossibleUrls(replInfo) {
  const { replId, replSlug } = replInfo;
  const urls = [];
  
  if (!replSlug) {
    log('No REPL_SLUG found in environment, using fallback detection');
    // Try to detect from current directory
    const currentDir = path.basename(process.cwd());
    const possibleSlug = currentDir.replace(/[^a-zA-Z0-9-]/g, '-').toLowerCase();
    log(`Using detected slug: ${possibleSlug}`);
    
    for (const domain of REPLIT_DOMAINS) {
      for (const port of DEFAULT_PORTS) {
        urls.push(`https://${possibleSlug}-${port}.${domain}`);
      }
    }
    return urls;
  }
  
  // Generate URLs with different port combinations
  for (const domain of REPLIT_DOMAINS) {
    for (const port of DEFAULT_PORTS) {
      urls.push(`https://${replSlug}-${port}.${domain}`);
    }
  }
  
  return urls;
}

// Check if a URL is accessible
async function checkUrl(url, timeout = TIMEOUT_MS) {
  return new Promise((resolve) => {
    const parsedUrl = new URL(url);
    const options = {
      hostname: parsedUrl.hostname,
      port: parsedUrl.port || (parsedUrl.protocol === 'https:' ? 443 : 80),
      path: parsedUrl.pathname || '/',
      method: 'HEAD',
      timeout: timeout,
    };
    
    const protocol = parsedUrl.protocol === 'https:' ? https : http;
    
    const req = protocol.request(options, (res) => {
      log(`Checked ${url}: Status Code: ${res.statusCode}`);
      resolve({
        url,
        status: res.statusCode,
        accessible: res.statusCode >= 200 && res.statusCode < 500
      });
    });
    
    req.on('error', (e) => {
      log(`Error checking ${url}: ${e.message}`);
      resolve({
        url,
        status: 0,
        accessible: false,
        error: e.message
      });
    });
    
    req.on('timeout', () => {
      log(`Timeout checking ${url}`);
      req.destroy();
      resolve({
        url,
        status: 0,
        accessible: false,
        error: 'Timeout'
      });
    });
    
    req.end();
  });
}

// Main function to run the port check
async function runPortCheck() {
  log('Starting Replit Port Browser Check');
  
  const replInfo = getReplitInfo();
  const urls = generatePossibleUrls(replInfo);
  
  log(`Generated ${urls.length} URLs to test. This may take a few minutes...`);
  
  const results = [];
  for (const url of urls) {
    results.push(await checkUrl(url));
  }
  
  // Filter and sort results
  const accessibleUrls = results
    .filter(r => r.accessible)
    .sort((a, b) => a.url.localeCompare(b.url));
  
  log('\n===== RESULTS =====');
  if (accessibleUrls.length === 0) {
    log('No accessible URLs found.');
  } else {
    log(`Found ${accessibleUrls.length} accessible URLs:`);
    accessibleUrls.forEach(r => log(`  ${r.url} (Status: ${r.status})`));
  }
  
  // Generate HTML report
  generateHtmlReport(results, replInfo);
  
  log('\nPort scan completed. See port-report.html for full results.');
}

// Generate an HTML report of the results
function generateHtmlReport(results, replInfo) {
  const accessibleUrls = results.filter(r => r.accessible);
  const inaccessibleUrls = results.filter(r => !r.accessible);
  
  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Replit Port Browser Results</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
      line-height: 1.6;
    }
    h1, h2, h3 {
      color: #0F172A;
    }
    .container {
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      padding: 20px;
      margin-bottom: 20px;
      background-color: #fff;
    }
    .success {
      background-color: #ECFDF5;
      border-left: 4px solid #10B981;
    }
    .failure {
      background-color: #FEF2F2;
      border-left: 4px solid #EF4444;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 20px 0;
    }
    th, td {
      padding: 12px;
      text-align: left;
      border-bottom: 1px solid #E5E7EB;
    }
    th {
      background-color: #F9FAFB;
      font-weight: 600;
    }
    tr:hover {
      background-color: #F9FAFB;
    }
    .status {
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 0.875rem;
    }
    .status-success {
      background-color: #D1FAE5;
      color: #047857;
    }
    .status-error {
      background-color: #FEE2E2;
      color: #B91C1C;
    }
    .repl-info {
      background-color: #EFF6FF;
      border-left: 4px solid #3B82F6;
      padding: 10px 15px;
      margin-bottom: 20px;
    }
    .url-list {
      margin: 0;
      padding: 0;
      list-style-type: none;
    }
    .url-list li {
      padding: 8px 0;
      display: flex;
      justify-content: space-between;
      border-bottom: 1px solid #E5E7EB;
    }
  </style>
</head>
<body>
  <h1>Replit Port Browser Results</h1>
  
  <div class="repl-info">
    <h3>Replit Information</h3>
    <p><strong>REPL_ID:</strong> ${replInfo.replId || 'Not available'}</p>
    <p><strong>REPL_SLUG:</strong> ${replInfo.replSlug || 'Not available'}</p>
    <p><strong>REPL_OWNER:</strong> ${replInfo.replOwner || 'Not available'}</p>
    <p><strong>Scan Time:</strong> ${new Date().toISOString()}</p>
  </div>
  
  <div class="container ${accessibleUrls.length > 0 ? 'success' : 'failure'}">
    <h2>Found ${accessibleUrls.length} Accessible URLs</h2>
    
    ${accessibleUrls.length > 0 ? `
    <table>
      <thead>
        <tr>
          <th>URL</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody>
        ${accessibleUrls.map(r => `
        <tr>
          <td><a href="${r.url}" target="_blank">${r.url}</a></td>
          <td><span class="status status-success">${r.status}</span></td>
        </tr>
        `).join('')}
      </tbody>
    </table>
    ` : '<p>No accessible URLs found during the scan.</p>'}
  </div>
  
  <div class="container">
    <h2>All Tested URLs (${results.length})</h2>
    <table>
      <thead>
        <tr>
          <th>URL</th>
          <th>Status</th>
          <th>Result</th>
        </tr>
      </thead>
      <tbody>
        ${results.map(r => `
        <tr>
          <td>${r.url}</td>
          <td>${r.status || 'N/A'}</td>
          <td>
            ${r.accessible 
              ? '<span class="status status-success">Accessible</span>' 
              : `<span class="status status-error">${r.error || 'Not accessible'}</span>`
            }
          </td>
        </tr>
        `).join('')}
      </tbody>
    </table>
  </div>
  
  <div class="container">
    <h3>Recommendations</h3>
    ${accessibleUrls.length > 0 
      ? `<p>The following URL appears to be the best option for accessing your application:</p>
         <p><strong><a href="${accessibleUrls[0].url}" target="_blank">${accessibleUrls[0].url}</a></strong></p>`
      : `<p>No accessible URLs were found. Common issues:</p>
         <ul>
           <li>Your server might not be running</li>
           <li>The server might be binding to localhost (127.0.0.1) instead of 0.0.0.0</li>
           <li>The application might be using a non-standard port</li>
           <li>There might be a firewall or CORS issue</li>
         </ul>`
    }
  </div>
  
  <footer>
    <p>Generated by Replit Port Browser at ${new Date().toISOString()}</p>
  </footer>
</body>
</html>
  `;
  
  try {
    fs.writeFileSync('port-report.html', html);
    log('Generated HTML report: port-report.html');
  } catch (e) {
    log(`Error generating HTML report: ${e.message}`);
  }
}

// Run the port check when this script is executed directly
if (require.main === module) {
  runPortCheck().catch(error => {
    log(`Error in port check: ${error.message}`);
  });
}

module.exports = {
  runPortCheck,
  checkUrl,
  getReplitInfo,
  generatePossibleUrls
};