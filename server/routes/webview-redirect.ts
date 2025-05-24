/**
 * Special route handler for redirecting webview requests to the correct port
 */
import express from 'express';

const router = express.Router();

// Handler for serving a direct redirect page for the webview
router.get('/webview-redirect', (req, res) => {
  // Send a redirect page that will work across domains
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>iREVA Platform - Loading</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          text-align: center;
          margin: 0;
          padding: 40px 20px;
          background-color: #f5f7fa;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 90vh;
        }
        .logo {
          font-size: 2.5rem;
          font-weight: bold;
          color: #2563eb;
          margin-bottom: 10px;
        }
        .loader {
          display: inline-block;
          width: 50px;
          height: 50px;
          border: 5px solid rgba(37, 99, 235, 0.2);
          border-radius: 50%;
          border-top-color: #2563eb;
          animation: spin 1s ease-in-out infinite;
          margin: 30px 0;
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        .container {
          background-color: white;
          border-radius: 10px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
          padding: 40px;
          max-width: 500px;
          width: 100%;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="logo">iREVA</div>
        <p>Real Estate Investment Platform</p>
        <div class="loader"></div>
        <p>Redirecting you to the platform...</p>
      </div>

      <script>
        // Redirect to the homepage after a brief delay
        setTimeout(() => {
          window.location.href = "/";
        }, 1500);
      </script>
    </body>
    </html>
  `);
});

// Route handler for the root URL (main homepage)
router.get('/', (req, res, next) => {
  // Check if it's a Replit webview request with port 3001
  const host = req.headers.host || '';
  if (host.includes(':3001')) {
    console.log('Detected Replit webview request on port 3001, redirecting...');
    return res.redirect('/webview-redirect');
  }
  
  // Continue with regular request handling for the homepage
  next();
});

export default router;