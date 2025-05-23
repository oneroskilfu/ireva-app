const express = require('express');
const app = express();

// Simple HTML page that redirects to your main iREVA app
app.get('*', (req, res) => {
  res.send(`
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>iREVA - Real Estate Investment Platform</title>
    <style>
        body {
            margin: 0;
            padding: 0;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            text-align: center;
        }
        .container {
            max-width: 600px;
            padding: 40px;
            background: rgba(255, 255, 255, 0.1);
            border-radius: 20px;
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.2);
        }
        h1 {
            font-size: 3rem;
            margin-bottom: 1rem;
            font-weight: 700;
        }
        p {
            font-size: 1.2rem;
            margin-bottom: 2rem;
            opacity: 0.9;
        }
        .btn {
            display: inline-block;
            padding: 15px 30px;
            background: #4CAF50;
            color: white;
            text-decoration: none;
            border-radius: 10px;
            font-weight: 600;
            font-size: 1.1rem;
            transition: all 0.3s ease;
            border: none;
            cursor: pointer;
            margin: 10px;
        }
        .btn:hover {
            background: #45a049;
            transform: translateY(-2px);
        }
        .features {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 20px;
            margin: 30px 0;
        }
        .feature {
            padding: 20px;
            background: rgba(255, 255, 255, 0.1);
            border-radius: 10px;
        }
        .loading {
            animation: pulse 2s infinite;
        }
        @keyframes pulse {
            0% { opacity: 1; }
            50% { opacity: 0.7; }
            100% { opacity: 1; }
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🏠 Welcome to iREVA</h1>
        <p>Your Gateway to Real Estate Investment Opportunities</p>
        
        <div class="features">
            <div class="feature">
                <h3>💰 Fractional Ownership</h3>
                <p>Start investing with as little as ₦100,000</p>
            </div>
            <div class="feature">
                <h3>🚀 Crypto Enabled</h3>
                <p>Modern payment options for today's investors</p>
            </div>
            <div class="feature">
                <h3>🏘️ Premium Properties</h3>
                <p>Curated Nigerian real estate opportunities</p>
            </div>
        </div>
        
        <button class="btn" onclick="openMainApp()">🚀 Start Investing</button>
        <button class="btn" onclick="window.location.reload()" style="background: #2196F3;">🔄 Refresh</button>
        
        <div class="loading" style="margin-top: 20px; font-size: 0.9rem; opacity: 0.8;">
            iREVA Platform Loading...
        </div>
    </div>

    <script>
        function openMainApp() {
            // Try to open the main app on port 5000
            const mainAppUrl = window.location.origin.replace(':3000', ':5000');
            window.open(mainAppUrl, '_blank');
        }
        
        // Auto-refresh to check if main app is ready
        setTimeout(() => {
            fetch('/health-check')
                .then(() => openMainApp())
                .catch(() => console.log('Main app still loading...'));
        }, 3000);
    </script>
</body>
</html>
  `);
});

app.listen(3000, '0.0.0.0', () => {
  console.log('🌐 iREVA Webview Bridge running on port 3000');
  console.log('🎯 Your iREVA homepage is now visible in Replit webview!');
});