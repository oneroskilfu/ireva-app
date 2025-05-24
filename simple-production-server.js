const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 5000;

// Simple middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, 'dist', 'public')));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'healthy', message: 'iREVA Platform is running' });
});

// Serve your beautiful iREVA homepage for all routes
app.get('*', (req, res) => {
  const indexPath = path.join(__dirname, 'dist', 'public', 'index.html');
  
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.status(404).send(`
      <h1>iREVA Platform</h1>
      <p>Build files not found. Please run: npm run build</p>
      <p>Looking for: ${indexPath}</p>
    `);
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🏠 iREVA Platform running on port ${PORT}`);
  console.log(`✅ Ready to serve your beautiful real estate investment platform!`);
});