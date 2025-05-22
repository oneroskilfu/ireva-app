#!/usr/bin/env node

// Ultra-simple server to display your beautiful iREVA homepage immediately
import http from 'http';

const PORT = 3000;

const homepageHTML = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>iREVA - Building Wealth Together</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: 'Inter', system-ui, -apple-system, sans-serif;
            min-height: 100vh;
            background: linear-gradient(135deg, #1e3a8a 0%, #3730a3 100%);
            color: white;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 20px;
            text-align: center;
        }
        h1 {
            font-size: 3rem;
            font-weight: bold;
            margin-bottom: 20px;
            line-height: 1.2;
        }
        .subtitle {
            font-size: 1.5rem;
            margin-bottom: 30px;
            max-width: 800px;
            opacity: 0.9;
        }
        .buttons {
            display: flex;
            gap: 20px;
            flex-wrap: wrap;
            justify-content: center;
            margin-bottom: 60px;
        }
        .btn {
            padding: 15px 30px;
            border: none;
            border-radius: 8px;
            font-size: 1.1rem;
            font-weight: bold;
            cursor: pointer;
            text-decoration: none;
            transition: all 0.3s ease;
        }
        .btn-primary {
            background: #10b981;
            color: white;
        }
        .btn-secondary {
            background: transparent;
            color: white;
            border: 2px solid white;
        }
        .btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 25px rgba(0,0,0,0.3);
        }
        .features {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 30px;
            max-width: 1200px;
            width: 100%;
        }
        .feature {
            background: rgba(255,255,255,0.1);
            padding: 30px;
            border-radius: 12px;
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255,255,255,0.2);
        }
        .feature h3 {
            font-size: 1.5rem;
            margin-bottom: 15px;
        }
        .feature p {
            opacity: 0.9;
            line-height: 1.6;
        }
        .stats {
            margin-top: 40px;
            display: flex;
            gap: 40px;
            flex-wrap: wrap;
            justify-content: center;
        }
        .stat {
            text-align: center;
        }
        .stat-number {
            font-size: 2rem;
            font-weight: bold;
            color: #10b981;
        }
        .stat-label {
            opacity: 0.8;
        }
        @media (max-width: 768px) {
            h1 { font-size: 2rem; }
            .subtitle { font-size: 1.2rem; }
            .buttons { flex-direction: column; align-items: center; }
            .stats { flex-direction: column; gap: 20px; }
        }
    </style>
</head>
<body>
    <h1>Building Wealth Together: Real Estate, Reimagined</h1>
    <p class="subtitle">
        Join 5,000+ investors transforming the real estate investment landscape through innovative technology and transparent processes.
    </p>
    
    <div class="buttons">
        <a href="/auth" class="btn btn-primary">Start Investing</a>
        <a href="/auth" class="btn btn-secondary">Learn More</a>
    </div>
    
    <div class="features">
        <div class="feature">
            <h3>🏢 Premium Properties</h3>
            <p>Carefully vetted real estate opportunities with verified returns and transparent reporting.</p>
        </div>
        <div class="feature">
            <h3>💎 Crypto-Enabled</h3>
            <p>Seamless cryptocurrency integration for modern investment strategies.</p>
        </div>
        <div class="feature">
            <h3>📊 AI Insights</h3>
            <p>Advanced analytics and AI-powered market predictions to optimize your portfolio.</p>
        </div>
    </div>
    
    <div class="stats">
        <div class="stat">
            <div class="stat-number">5,000+</div>
            <div class="stat-label">Active Investors</div>
        </div>
        <div class="stat">
            <div class="stat-number">$50M+</div>
            <div class="stat-label">Assets Under Management</div>
        </div>
        <div class="stat">
            <div class="stat-number">12.5%</div>
            <div class="stat-label">Average Annual Returns</div>
        </div>
    </div>
</body>
</html>
`;

const server = http.createServer((req, res) => {
    console.log(`[${Date.now()}] Request: ${req.method} ${req.url}`);
    
    res.writeHead(200, {
        'Content-Type': 'text/html',
        'Cache-Control': 'no-cache'
    });
    res.end(homepageHTML);
});

server.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 iREVA homepage server running on port ${PORT}`);
    console.log(`✨ Your beautiful homepage is now available!`);
});

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down iREVA homepage server...');
    server.close(() => {
        process.exit(0);
    });
});