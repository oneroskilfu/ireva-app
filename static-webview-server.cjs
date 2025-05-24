/**
 * Static Webview Server for Replit
 * 
 * This server directly serves the iREVA homepage on port 3000 for the Replit webview.
 * The server is optimized to be exposed on external port 80 (standard HTTP)
 * for maximum compatibility with Replit's webview and external access.
 * 
 * Key features:
 * - Fast initial response time (< 100ms)
 * - Proper HTTP headers for caching and content type
 * - Support for Replit's health check endpoints
 * - Direct embedding of all assets (no external dependencies)
 */

const http = require('http');
const fs = require('fs');
const path = require('path');

// Log server activity with timestamps
function log(message) {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${message}`);
}

// Create the static HTML content with the embedded React application
const generateHtml = () => {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>iREVA Platform</title>
      <style>
        body, html {
          margin: 0;
          padding: 0;
          height: 100%;
          width: 100%;
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          background-color: #f8fafc;
        }
        
        /* Navbar styles */
        .navbar {
          background: linear-gradient(90deg, #2563eb, #3b82f6);
          color: white;
          padding: 1rem 2rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }
        
        .logo {
          font-size: 1.5rem;
          font-weight: bold;
          color: white;
          text-decoration: none;
        }
        
        .logo span {
          color: #e2e8f0;
        }
        
        .nav-links {
          display: flex;
          gap: 1.5rem;
        }
        
        .nav-link {
          color: white;
          text-decoration: none;
        }
        
        /* Hero section */
        .hero {
          padding: 4rem 2rem;
          text-align: center;
          background: linear-gradient(45deg, #1e40af 0%, #3b82f6 100%);
          color: white;
        }
        
        .hero h1 {
          font-size: 2.5rem;
          margin-bottom: 1rem;
        }
        
        .hero p {
          font-size: 1.25rem;
          max-width: 800px;
          margin: 0 auto 2rem;
        }
        
        .cta-button {
          background-color: white;
          color: #2563eb;
          font-weight: bold;
          padding: 0.75rem 1.5rem;
          border-radius: 0.375rem;
          text-decoration: none;
          display: inline-block;
          transition: all 0.2s;
          border: none;
          font-size: 1rem;
          cursor: pointer;
        }
        
        .cta-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }
        
        /* Features section */
        .features {
          padding: 4rem 2rem;
          background-color: white;
        }
        
        .section-heading {
          text-align: center;
          margin-bottom: 3rem;
        }
        
        .feature-grid {
          display: flex;
          flex-wrap: wrap;
          gap: 2rem;
          justify-content: center;
          max-width: 1200px;
          margin: 0 auto;
        }
        
        .feature-card {
          background-color: white;
          border-radius: 0.5rem;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
          padding: 2rem;
          flex: 1 1 300px;
          max-width: 350px;
          transition: all 0.3s;
        }
        
        .feature-card:hover {
          transform: translateY(-10px);
          box-shadow: 0 12px 20px rgba(0, 0, 0, 0.1);
        }
        
        .feature-icon {
          font-size: 2rem;
          color: #2563eb;
          margin-bottom: 1rem;
        }
        
        .feature-title {
          font-size: 1.25rem;
          margin-bottom: 1rem;
          color: #1e293b;
        }
        
        .feature-description {
          color: #64748b;
        }
        
        /* Footer */
        .footer {
          background-color: #1e293b;
          color: #e2e8f0;
          padding: 3rem 2rem;
          text-align: center;
        }
        
        .footer-links {
          display: flex;
          justify-content: center;
          gap: 2rem;
          margin-top: 1rem;
        }
        
        .footer-link {
          color: #e2e8f0;
          text-decoration: none;
        }
        
        .footer-link:hover {
          text-decoration: underline;
        }
        
        /* Responsive adjustments */
        @media (max-width: 768px) {
          .nav-links {
            display: none;
          }
          
          .hero h1 {
            font-size: 2rem;
          }
          
          .hero p {
            font-size: 1rem;
          }
          
          .feature-grid {
            gap: 1.5rem;
          }
        }
      </style>
    </head>
    <body>
      <!-- Top banner for clear user guidance -->
      <div style="background-color: #fef3c7; color: #92400e; padding: 0.75rem; text-align: center; font-weight: bold; border-bottom: 1px solid #f59e0b;">
        This is a preview. For full functionality, use the "Go to Full Application" button below.
      </div>
      
      <header class="navbar">
        <a href="#" class="logo">i<span>REVA</span></a>
        <nav class="nav-links">
          <a href="#features" class="nav-link">Features</a>
          <a href="#how-it-works" class="nav-link">How It Works</a>
          <a href="/open-app" class="nav-link">Investor Dashboard</a>
          <a href="/open-app" class="nav-link">Sign In</a>
        </nav>
      </header>
      
      <section class="hero">
        <h1>Invest in Real Estate with Confidence</h1>
        <p>iREVA provides secure, accessible real estate investment opportunities with blockchain technology and smart contracts.</p>
        <a href="/open-app" class="cta-button">Start Investing</a>
      </section>
      
      <section class="features" id="features">
        <div class="section-heading">
          <h2>Why Choose iREVA</h2>
        </div>
        
        <div class="feature-grid">
          <div class="feature-card">
            <div class="feature-icon">📈</div>
            <h3 class="feature-title">High Returns</h3>
            <p class="feature-description">Earn competitive returns on your real estate investments with our carefully curated properties.</p>
          </div>
          
          <div class="feature-card">
            <div class="feature-icon">🔒</div>
            <h3 class="feature-title">Blockchain Security</h3>
            <p class="feature-description">Your investments are secured with blockchain technology and smart contracts for maximum transparency.</p>
          </div>
          
          <div class="feature-card">
            <div class="feature-icon">💳</div>
            <h3 class="feature-title">Multiple Payment Options</h3>
            <p class="feature-description">Invest using traditional payment methods or cryptocurrencies including USDC and USDT.</p>
          </div>
          
          <div class="feature-card">
            <div class="feature-icon">🏦</div>
            <h3 class="feature-title">Tiered Opportunities</h3>
            <p class="feature-description">Access different investment levels based on your accreditation status and investment goals.</p>
          </div>
          
          <div class="feature-card">
            <div class="feature-icon">📄</div>
            <h3 class="feature-title">Comprehensive KYC</h3>
            <p class="feature-description">Our thorough verification process ensures compliance and security for all investors.</p>
          </div>
          
          <div class="feature-card">
            <div class="feature-icon">🏠</div>
            <h3 class="feature-title">Quality Properties</h3>
            <p class="feature-description">We select only the best properties with strong growth potential for our investment portfolio.</p>
          </div>
        </div>
      </section>
      
      <section class="cta-section" id="how-it-works" style="background-color: #f8fafc; padding: 4rem 2rem; text-align: center;">
        <h2>Ready to Start Your Investment Journey?</h2>
        <p style="max-width: 600px; margin: 0 auto 2rem;">Join thousands of investors who are already growing their wealth with iREVA.</p>
        <a href="/open-app" class="cta-button" style="background-color: #2563eb; color: white;">Create Account</a>
      </section>
      
      <footer class="footer">
        <p>© 2025 iREVA. All rights reserved.</p>
        <div class="footer-links">
          <a href="/open-app" class="footer-link">About</a>
          <a href="/open-app" class="footer-link">Terms of Service</a>
          <a href="/open-app" class="footer-link">Privacy Policy</a>
          <a href="/open-app" class="footer-link">Contact</a>
        </div>
      </footer>
      
      <div style="background-color: #f1f5f9; padding: 1rem; text-align: center; border-top: 1px solid #e2e8f0;">
        <p style="margin-bottom: 0.5rem; font-weight: bold; color: #334155;">Access Full iREVA Platform</p>
        <p style="margin-bottom: 1rem; color: #64748b;">This is a preview of the iREVA platform. For the complete experience with all features:</p>
        <div style="display: flex; justify-content: center; gap: 10px; flex-wrap: wrap;">
          <a href="/direct" style="display: inline-block; background-color: #2563eb; color: white; padding: 0.5rem 1rem; border-radius: 0.375rem; text-decoration: none; font-weight: bold;">Open Main Application</a>
          <a href="/open-app" style="display: inline-block; background-color: #4f46e5; color: white; padding: 0.5rem 1rem; border-radius: 0.375rem; text-decoration: none; font-weight: bold;">Get Direct Link</a>
        </div>
        <p style="margin-top: 0.75rem; font-size: 0.8rem; color: #64748b;">
          If one option doesn't work, please try the other.
        </p>
      </div>
      
      <script>
        // After page loads, set up the application links
        document.addEventListener('DOMContentLoaded', function() {
          // Get the current URL information
          const hostname = window.location.hostname;
          const protocol = window.location.protocol;
          let mainAppUrl = '';
          
          // Function to update all links
          function updateLinks(url) {
            // Update the main app link button
            const appButtons = document.querySelectorAll('.cta-button');
            appButtons.forEach(button => {
              // If it's an application link, update it
              if (button.textContent.includes('Go to Full') || 
                  button.textContent.includes('Start Investing') ||
                  button.textContent.includes('Create Account')) {
                button.href = url;
                // Add target="_blank" to open in a new tab
                button.setAttribute('target', '_blank');
              }
            });
            
            // Update navigation links
            const navLinks = document.querySelectorAll('.nav-link');
            navLinks.forEach(link => {
              const path = link.getAttribute('href');
              if (path && path.startsWith('/')) {
                link.href = url + path;
                link.setAttribute('target', '_blank');
              }
            });
            
            // Add link info to footer
            const footer = document.querySelector('.footer');
            if (footer) {
              const noteContainer = document.createElement('div');
              noteContainer.style.marginTop = '2rem';
              noteContainer.style.fontSize = '0.875rem';
              noteContainer.style.color = '#94a3b8';
              
              noteContainer.innerHTML = 'Direct application link: <a href="' + 
                url + '" style="color: #94a3b8; text-decoration: underline;">' + 
                url + '</a>';
              
              footer.appendChild(noteContainer);
            }
          }
          
          // Try different approaches to generate the correct URL
          
          // Method 1: Parse hostname for specific Replit patterns
          if (hostname.includes('.')) {
            const parts = hostname.split('.');
            if (parts.length >= 2) {
              let replSlug;
              
              if (parts[0].includes('-')) {
                // Extract the base slug without any port suffix
                // For example: "my-repl-3000" -> "my-repl"
                const portMatch = parts[0].match(/^(.+?)(?:-\d+)?$/);
                replSlug = portMatch ? portMatch[1] : parts[0];
              } else {
                replSlug = parts[0];
              }
              
              // Get the domain (replit.app, repl.co, etc.)
              const replDomain = parts.slice(1).join('.');
              
              // Construct the URL for port 5001
              mainAppUrl = protocol + '//' + replSlug + '-5001.' + replDomain;
            }
          }
          
          // Method 2: Try a simpler approach with direct port replacement
          if (!mainAppUrl && hostname.includes('-')) {
            // Directly replace any port number in hostname with 5001
            const newHost = hostname.replace(/-\d+\./, '-5001.');
            
            // If no port was found, add the port
            if (newHost === hostname) {
              // Add port before the first dot
              const parts = hostname.split('.');
              parts[0] = parts[0] + '-5001';
              mainAppUrl = protocol + '//' + parts.join('.');
            } else {
              mainAppUrl = protocol + '//' + newHost;
            }
          }
          
          // Method 3: Fallback to a simple port suffix if other methods fail
          if (!mainAppUrl) {
            if (hostname.includes('.')) {
              const parts = hostname.split('.');
              parts[0] = parts[0] + '-5001';
              mainAppUrl = protocol + '//' + parts.join('.');
            } else {
              // Absolute fallback
              mainAppUrl = protocol + '//' + hostname + '-5001.replit.app';
            }
          }
          
          // Update all links with our discovered URL
          if (mainAppUrl) {
            console.log('Using application URL:', mainAppUrl);
            updateLinks(mainAppUrl);
          }
        });
      </script>
    </body>
    </html>
  `;
};

// Read the open-main-app.html file
let openMainAppHtml = '';
try {
  openMainAppHtml = fs.readFileSync(path.join(process.cwd(), 'open-main-app.html'), 'utf8');
  log('Successfully loaded open-main-app.html');
} catch (error) {
  log(`ERROR: Failed to load open-main-app.html: ${error.message}`);
  // Create a minimal version if file can't be read
  openMainAppHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Opening iREVA Application</title>
      <meta charset="UTF-8">
      <meta http-equiv="refresh" content="0;url=https://REPL_NAME-5001.replit.app/">
    </head>
    <body>
      <p>Redirecting to full application...</p>
      <script>
        window.location.href = window.location.href.replace(/:\\/\\/([^-]+)(?:-\\d+)?/, "://$1-5001");
      </script>
    </body>
    </html>
  `;
}

// Read the open-app.js file
let openAppJs = '';
try {
  openAppJs = fs.readFileSync(path.join(process.cwd(), 'open-app.js'), 'utf8');
  log('Successfully loaded open-app.js');
} catch (error) {
  log(`ERROR: Failed to load open-app.js: ${error.message}`);
  // Create a minimal version if file can't be read
  openAppJs = `
    function generateMainAppUrl() {
      const origin = window.location.origin;
      const hostname = window.location.hostname;
      const protocol = window.location.protocol;
      
      // Simple URL manipulation to transform current URL to port 5001
      const parts = hostname.split('.');
      let replName = parts[0].replace(/-\\d+$/, '');
      return \`\${protocol}//\${replName}-5001.\${parts.slice(1).join('.')}\`;
    }
  `;
}

// Read the direct-app-access.html file
let directAppAccessHtml = '';
try {
  directAppAccessHtml = fs.readFileSync(path.join(process.cwd(), 'direct-app-access.html'), 'utf8');
  log('Successfully loaded direct-app-access.html');
} catch (error) {
  log(`ERROR: Failed to load direct-app-access.html: ${error.message}`);
  // We'll handle this in the server request handler
}

// Create a server to handle requests
const server = http.createServer((req, res) => {
  log(`Received request: ${req.method} ${req.url}`);
  
  // Special route for health checks and Replit detection
  if (req.url === '/health' || req.url === '/__health' || req.url === '/__repl') {
    log('Health check request detected');
    res.writeHead(200, { 
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Cache-Control': 'no-cache'
    });
    res.end(JSON.stringify({ 
      status: 'ok',
      port: 3000,
      timestamp: new Date().toISOString()
    }));
    return;
  }

  // Serve the open-app.js file for URL generation
  if (req.url === '/open-app.js') {
    log('Serving open-app.js file');
    res.writeHead(200, { 
      'Content-Type': 'application/javascript',
      'Cache-Control': 'no-cache',
      'Access-Control-Allow-Origin': '*'
    });
    res.end(openAppJs);
    return;
  }

  // Direct app access with iframe
  if (req.url === '/direct' || req.url === '/iframe' || req.url === '/direct-access') {
    log('Serving direct app access page with iframe');
    if (directAppAccessHtml) {
      res.writeHead(200, { 
        'Content-Type': 'text/html',
        'Cache-Control': 'no-cache',
        'Access-Control-Allow-Origin': '*'
      });
      res.end(directAppAccessHtml);
    } else {
      log('Direct app access HTML not available, redirecting to open-app page');
      res.writeHead(302, { 'Location': '/open-app' });
      res.end();
    }
    return;
  }

  // Main application redirect page
  if (req.url === '/open-app' || req.url === '/full-app' || req.url === '/redirect') {
    log('Serving application redirect page');
    res.writeHead(200, { 
      'Content-Type': 'text/html',
      'Cache-Control': 'no-cache',
      'Access-Control-Allow-Origin': '*'
    });
    res.end(openMainAppHtml);
    return;
  }
  
  // For any other request, serve the static HTML with the embedded React app
  res.writeHead(200, { 
    'Content-Type': 'text/html',
    'Cache-Control': 'public, max-age=600',
    'Access-Control-Allow-Origin': '*'
  });
  log('Serving static HTML');
  res.end(generateHtml());
});

// Start the server
log('Attempting to start server on port 3000...');
const startTime = Date.now();

server.listen(3000, '0.0.0.0', () => {
  const bindTime = Date.now() - startTime;
  log(`Static webview server running on port 3000 (bound in ${bindTime}ms)`);
  log('PORT 3000 OPEN AND READY');
  log('Server configured for external port 80 access via Replit');
  
  // Additional logging to help with Replit detection
  console.log('PORT 3000 OPEN AND READY');
  console.log('Server listening on http://0.0.0.0:3000');
  console.log('iREVA Platform webview server started');
});

// Handle errors
server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    log('ERROR: Port 3000 is already in use');
  } else {
    log(`ERROR: Server error: ${err.message}`);
  }
});