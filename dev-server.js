import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();
const PORT = process.env.PORT || 5000;

console.log('🏠 Starting iREVA Platform in development mode (bypassing database)');

// Basic middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, 'dist', 'public')));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    message: 'iREVA Platform is running',
    mode: 'development-bypass'
  });
});

// Serve your beautiful iREVA homepage for all routes
app.get('*', (req, res) => {
  const indexPath = path.join(__dirname, 'dist', 'public', 'index.html');
  
  if (fs.existsSync(indexPath)) {
    console.log(`📄 Serving iREVA homepage from: ${indexPath}`);
    res.sendFile(indexPath);
  } else {
    res.status(404).send(`
      <h1>🏠 iREVA Real Estate Investment Platform</h1>
      <p>Build files not found. Please run: <strong>npm run build</strong></p>
      <p>Expected location: ${indexPath}</p>
      <p>This will generate your beautiful "Welcome to iREVA" homepage!</p>
    `);
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 iREVA Platform running on port ${PORT}`);
  console.log(`✅ Your real estate investment platform is now accessible!`);
  console.log(`🏠 Visit your platform to see fractional property investments from ₦100,000`);
});