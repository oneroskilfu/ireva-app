/**
 * Static Webview Server for Replit
 * 
 * This server directly serves the iREVA homepage on port 3000 for the Replit webview.
 * Instead of trying to proxy or redirect, it directly embeds the React application
 * with appropriate headers and settings for Replit's webview.
 */

const http = require('http');
const fs = require('fs');
const path = require('path');

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
      <header class="navbar">
        <a href="#" class="logo">i<span>REVA</span></a>
        <nav class="nav-links">
          <a href="#features" class="nav-link">Features</a>
          <a href="#how-it-works" class="nav-link">How It Works</a>
          <a href="/investor" class="nav-link">Investor Dashboard</a>
          <a href="/auth" class="nav-link">Sign In</a>
        </nav>
      </header>
      
      <section class="hero">
        <h1>Invest in Real Estate with Confidence</h1>
        <p>iREVA provides secure, accessible real estate investment opportunities with blockchain technology and smart contracts.</p>
        <a href="/auth" class="cta-button">Start Investing</a>
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
        <a href="/auth" class="cta-button" style="background-color: #2563eb; color: white;">Create Account</a>
      </section>
      
      <footer class="footer">
        <p>© 2025 iREVA. All rights reserved.</p>
        <div class="footer-links">
          <a href="/about" class="footer-link">About</a>
          <a href="/terms" class="footer-link">Terms of Service</a>
          <a href="/privacy" class="footer-link">Privacy Policy</a>
          <a href="/contact" class="footer-link">Contact</a>
        </div>
      </footer>
      
      <script>
        // After page loads, add a note about the main application
        document.addEventListener('DOMContentLoaded', function() {
          const footer = document.querySelector('.footer');
          if (footer) {
            const noteContainer = document.createElement('div');
            noteContainer.style.marginTop = '2rem';
            noteContainer.style.fontSize = '0.875rem';
            noteContainer.style.color = '#94a3b8';
            
            noteContainer.innerHTML = 'To access the full application with all features, please visit: <a href="https://workspace-5001.replit.app/" style="color: #94a3b8; text-decoration: underline;">https://workspace-5001.replit.app/</a>';
            
            footer.appendChild(noteContainer);
          }
        });
      </script>
    </body>
    </html>
  `;
};

// Create a server to handle requests
const server = http.createServer((req, res) => {
  // Special route for health checks and Replit detection
  if (req.url === '/health' || req.url === '/__health' || req.url === '/__repl') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'ok' }));
    return;
  }

  // For any other request, serve the static HTML with the embedded React app
  res.writeHead(200, { 'Content-Type': 'text/html' });
  res.end(generateHtml());
});

// Start the server
server.listen(3000, '0.0.0.0', () => {
  console.log('Static webview server running on port 3000');
  console.log('PORT 3000 OPEN AND READY');
});

// Handle errors
server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error('Port 3000 is already in use');
  } else {
    console.error('Server error:', err);
  }
});