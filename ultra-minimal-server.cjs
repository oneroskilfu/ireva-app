/**
 * Ultra-minimal server for Replit webview (CommonJS version)
 * This is specifically designed to bind to port 3000 immediately
 * and redirect to the main application on port 5001
 */

const http = require('http');
const url = require('url');

// Get Replit environment information
function getReplitInfo() {
  try {
    // Try to get the Replit ID and slug from environment variables
    const replId = process.env.REPL_ID;
    const replSlug = process.env.REPL_SLUG;
    
    // Log what we found for debugging
    console.log('REPL_ID:', replId);
    console.log('REPL_SLUG:', replSlug);
    
    // Extract hostname information for better domain construction
    const hostname = process.env.HOSTNAME || '';
    console.log('HOSTNAME:', hostname);
    
    // New approach: use a simpler ID structure for URL construction
    let shortId = 'replit';
    
    // If we have a full Replit ID, use the first 8 characters
    if (replId && replId.length > 8) {
      shortId = replId.substring(0, 8);
    } 
    // If we have a hostname, try to extract an identifier
    else if (hostname) {
      shortId = hostname.substring(0, 8);
    }
    
    return {
      replId: shortId,
      fullId: replId || '',
      hostname: hostname,
      slug: replSlug || 'workspace',
      isReplit: true
    };
  } catch (error) {
    console.error('Failed to get Replit info:', error);
    return { isReplit: false };
  }
}

// Generate URLs for the different ports
function generateUrls(replInfo) {
  if (!replInfo.isReplit) return null;
  
  // Use multiple URL formats to increase chances of success
  const domainFormats = [
    'replit.app',     // Most common modern format
    'replit.dev',     // Alternative common format
    'repl.co',        // Shorter alternative format
    'repl.run'        // Legacy format but sometimes works
  ];
  
  // Best domain based on hostname pattern
  let bestDomain = 'replit.app';
  
  // Extract domain from hostname if available
  if (replInfo.hostname && replInfo.hostname.includes('.')) {
    const parts = replInfo.hostname.split('.');
    if (parts.length >= 2) {
      // Try to use the domain from hostname, but fallback to standard domains
      parts.shift(); // Remove the first part (hostname/id)
      const extractedDomain = parts.join('.');
      if (extractedDomain.includes('replit') || extractedDomain.includes('repl.')) {
        bestDomain = extractedDomain;
      }
    }
  }
  
  console.log('Using primary domain:', bestDomain);
  
  // Format 1: Primary domain with short ID (most likely to work)
  const primaryUrls = {
    main: `https://${replInfo.slug}.${bestDomain}/`,  // Try slug.domain format first
    directShort: `https://${replInfo.replId}-5001.${bestDomain}/`, // Try id-port format
    directSlug: `https://${replInfo.slug}-5001.${bestDomain}/`,    // Try slug-port format
    webview: `https://${replInfo.slug}.${bestDomain}/`  // Fallback to slug.domain
  };
  
  console.log('Generated primary URLs:', primaryUrls);
  
  // Format 2: Alternative domains (try all domain variants)
  const alternativeDomains = {};
  
  // Generate URLs for each alternative domain format
  domainFormats.forEach(domain => {
    if (domain !== bestDomain) { // Skip the primary domain we already used
      alternativeDomains[domain] = {
        main: `https://${replInfo.slug}.${domain}/`,
        direct: `https://${replInfo.replId}-5001.${domain}/`,
        proxy: `https://${replInfo.replId}-3000.${domain}/`
      };
    }
  });
  
  // Format 3: Generic localhost with ports (will work locally)
  const localUrls = {
    main: `http://localhost:5001/`,
    direct: `http://localhost:5000/`,
    proxy: `http://localhost:3000/`
  };
  
  // Return all formats, prioritizing the current domain format
  return {
    main: primaryUrls.main,  // Use the slug.domain format as main
    direct: primaryUrls.directShort,
    proxy: `https://${replInfo.slug}.${bestDomain}/`,
    alternateFormats: {
      primary: primaryUrls,
      alternative: alternativeDomains,
      local: localUrls
    }
  };
}

// Auto-refresh HTML that will check if the main app is ready
function generateHtml(replInfo) {
  const urls = generateUrls(replInfo);
  const mainUrl = urls ? urls.main : 'http://localhost:5001';
  const directUrl = urls ? urls.direct : 'http://localhost:5000';
  const proxyUrl = urls ? urls.proxy : 'http://localhost:3000';
  
  // Generate manual access links with all alternative formats
  let manualLinks = '';
  if (urls) {
    // Get alternative format URLs
    const primaryUrls = urls.alternateFormats?.primary || {};
    const alternativeDomains = urls.alternateFormats?.alternative || {};
    const localUrls = urls.alternateFormats?.local || {};
    
    // Function to create a link row for each URL format
    const createLinkRow = (label, url) => {
      return `
        <div class="link-row">
          <span class="link-label">${label}:</span>
          <a href="${url}" class="alt-link">${url}</a>
        </div>
      `;
    };
    
    // Create links for all domain variants
    let alternativeLinks = '';
    Object.keys(alternativeDomains).forEach(domain => {
      const domainUrls = alternativeDomains[domain];
      if (domainUrls && domainUrls.main) {
        alternativeLinks += createLinkRow(`${domain} Main Format`, domainUrls.main);
      }
    });
    
    manualLinks = `
      <div class="manual-access">
        <h3>Access Options</h3>
        <p>If auto-redirect doesn't work, try these direct links:</p>
        
        <div class="access-section">
          <h4>Primary Access URLs</h4>
          <div class="link-list">
            ${createLinkRow('Main Application URL', mainUrl)}
            ${createLinkRow('Direct Port Access', primaryUrls.directShort || directUrl)}
            ${createLinkRow('Alternate Format', primaryUrls.directSlug || directUrl)}
          </div>
        </div>
        
        <div class="access-section">
          <h4>Alternative Domain Formats</h4>
          <div class="link-list">
            ${alternativeLinks}
            ${createLinkRow('Local Development', localUrls.main || 'http://localhost:5001')}
          </div>
        </div>
        
        <div class="access-section debug-info">
          <h4>Technical Details</h4>
          <div class="details-grid">
            <div class="detail-item">
              <span class="detail-label">Short ID:</span>
              <span class="detail-value">${replInfo.replId}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Slug:</span>
              <span class="detail-value">${replInfo.slug}</span>
            </div>
            <div class="detail-item" style="grid-column: span 2;">
              <span class="detail-label">Full ID:</span>
              <span class="detail-value" style="word-break: break-all;">${replInfo.fullId}</span>
            </div>
          </div>
        </div>
      </div>
    `;
  }
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <title>iREVA Platform</title>
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body { 
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
          text-align: center; 
          padding: 0; 
          margin: 0;
          background-color: #f5f7fa; 
          overflow: hidden;
          height: 100vh;
          width: 100vw;
        }
        #app-container {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          z-index: 1;
        }
        .container { 
          max-width: 800px; 
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          background-color: white; 
          padding: 30px; 
          border-radius: 10px; 
          box-shadow: 0 4px 6px rgba(0,0,0,0.1); 
        }
        .logo { font-size: 2rem; font-weight: bold; color: #2563eb; margin-bottom: 20px; }
        .logo span { color: #64748b; }
        .loader { border: 8px solid #f3f3f3; border-top: 8px solid #2563eb; border-radius: 50%; width: 60px; height: 60px; animation: spin 2s linear infinite; margin: 20px auto; }
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        .link { display: inline-block; margin-top: 20px; background-color: #2563eb; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold; }
        .manual-access { margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0; }
        .link-grid { display: flex; flex-wrap: wrap; justify-content: center; gap: 10px; margin-top: 15px; }
        .alt-link { background-color: #f1f5f9; color: #0f172a; text-decoration: none; padding: 8px 16px; border-radius: 4px; border: 1px solid #cbd5e1; }
        
        /* Link list styling */
        .link-list { display: flex; flex-direction: column; gap: 8px; margin-top: 15px; }
        .link-row { display: flex; flex-direction: column; align-items: flex-start; text-align: left; background-color: #f8fafc; padding: 10px; border-radius: 6px; }
        .link-label { font-weight: bold; color: #64748b; margin-bottom: 5px; }
        .link-row .alt-link { margin-top: 5px; word-break: break-all; max-width: 100%; display: inline-block; }
        
        /* Technical details styling */
        .access-section { margin-top: 20px; }
        .access-section h4 { margin-bottom: 10px; color: #475569; }
        .details-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; text-align: left; margin-top: 10px; }
        .debug-info { background-color: #f8fafc; padding: 15px; border-radius: 6px; margin-top: 25px; }
        .detail-item { padding: 8px; background-color: white; border-radius: 4px; border: 1px solid #e2e8f0; }
        .detail-label { font-weight: bold; color: #64748b; margin-right: 5px; }
        .detail-value { font-family: monospace; color: #334155; }
        
        /* Embedded iframe styling */
        iframe {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          border: none;
          z-index: 1000;
        }
        
        /* Fade-in animation for iframe */
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        .fade-in {
          animation: fadeIn 0.5s ease-in-out;
        }
      </style>
      <script>
        // Check if the main app is ready
        function checkMainApp() {
          const mainUrl = "${mainUrl}";
          console.log("Checking if main app is ready at: " + mainUrl);
          
          // Use fetch with no-cors to check if the server is responding
          fetch(mainUrl, { mode: 'no-cors' })
            .then(() => {
              console.log("Main app is responding! Redirecting...");
              
              // Create iframe instead of redirecting
              const container = document.getElementById('app-container');
              if (container) {
                console.log("Creating iframe for seamless experience");
                container.innerHTML = '';
                const iframe = document.createElement('iframe');
                iframe.src = mainUrl;
                iframe.className = 'fade-in';
                iframe.style.width = '100%';
                iframe.style.height = '100vh';
                iframe.style.border = 'none';
                iframe.style.position = 'fixed';
                iframe.style.top = '0';
                iframe.style.left = '0';
                iframe.style.zIndex = '9999';
                document.body.style.margin = '0';
                document.body.style.padding = '0';
                document.body.style.overflow = 'hidden';
                
                // Add loading feedback
                const loadingOverlay = document.createElement('div');
                loadingOverlay.id = 'iframe-loading-overlay';
                loadingOverlay.style.position = 'fixed';
                loadingOverlay.style.top = '0';
                loadingOverlay.style.left = '0';
                loadingOverlay.style.width = '100%';
                loadingOverlay.style.height = '100%';
                loadingOverlay.style.backgroundColor = 'rgba(255,255,255,0.8)';
                loadingOverlay.style.display = 'flex';
                loadingOverlay.style.justifyContent = 'center';
                loadingOverlay.style.alignItems = 'center';
                loadingOverlay.style.zIndex = '10001';
                loadingOverlay.innerHTML = '<div style="text-align: center;"><div class="loader"></div><p>Loading iREVA Platform...</p></div>';
                document.body.appendChild(loadingOverlay);
                
                // Hide loading overlay when iframe is loaded
                iframe.onload = function() {
                  const overlay = document.getElementById('iframe-loading-overlay');
                  if (overlay) {
                    overlay.style.opacity = '0';
                    overlay.style.transition = 'opacity 0.5s ease-in-out';
                    setTimeout(() => {
                      overlay.style.display = 'none';
                    }, 500);
                  }
                };
                
                container.appendChild(iframe);
                
                // Hide loading elements
                const loader = document.getElementById('loader-container');
                if (loader) {
                  loader.style.display = 'none';
                }
                
                // Hide manual links section
                const manualLinks = document.getElementById('manual-links-section');
                if (manualLinks) {
                  manualLinks.style.display = 'none';
                }
                
                // Add direct link as fallback
                const fallbackLink = document.createElement('div');
                fallbackLink.innerHTML = 
                  '<div style="position: fixed; bottom: 10px; right: 10px; z-index: 10000; background: rgba(255,255,255,0.8); padding: 5px; border-radius: 4px;">' +
                  '<a href="' + mainUrl + '" target="_blank" style="color: #2563eb; font-size: 12px;">Open in new tab</a></div>';
                document.body.appendChild(fallbackLink);
              } else {
                // Fallback to redirect if container not found
                window.location.href = mainUrl;
              }
            })
            .catch(error => {
              console.log("Main app not ready yet, will check again: " + error);
              setTimeout(checkMainApp, 2000); // Check again in 2 seconds
            });
        }
        
        // Run the check when the page loads
        window.onload = function() {
          // Wait a moment then check
          setTimeout(checkMainApp, 2000);
          
          // Add Replit info to the debug box
          const debugInfo = document.getElementById('debug-info');
          if (debugInfo) {
            debugInfo.textContent = 'Detected ID: ${replInfo.replId || "unknown"}';
          }
        };
      </script>
    </head>
    <body>
      <div id="app-container" style="width:100%;height:100vh;position:relative;">
        <div id="loader-container" class="container">
          <div class="logo">i<span>REVA</span></div>
          <h1>Welcome to iREVA Platform</h1>
          <div class="loader"></div>
          <p>The application is initializing...</p>
          <p>You will be automatically redirected to the main application when it's ready.</p>
          <a href="${mainUrl}" class="link">Click here if not redirected</a>
          
          <div id="manual-links-section">
            ${manualLinks}
          </div>
          
          <div style="margin-top: 30px; font-size: 12px; color: #94a3b8;">
            <p>Is this the right URL? <span id="debug-info">Checking...</span></p>
            <p>Your access URL: <script>document.write(window.location.href)</script></p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
}

// Create the server
const server = http.createServer((req, res) => {
  // Get Replit info
  const replInfo = getReplitInfo();

  // Special routes for Replit detection
  if (req.url === '/health' || req.url === '/__health' || req.url === '/__repl') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'ok' }));
    return;
  }
  
  // Serve HTML with auto-refresh
  res.writeHead(200, { 'Content-Type': 'text/html' });
  res.end(generateHtml(replInfo));
});

// Bind to port 3000 immediately
server.listen(3000, '0.0.0.0', () => {
  console.log('Server running on port 3000');
  console.log('PORT 3000 OPEN AND READY');
  
  // Log special messages for Replit
  console.log('Webview server started successfully');
  console.log('PORT BINDING SUCCESSFUL');
});

// Handle errors
server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error('Port 3000 is already in use');
  } else {
    console.error('Server error:', err);
  }
});