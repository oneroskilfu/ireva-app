import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function serveStatic(app: express.Application) {
  // Serve static files from the built frontend
  // In production: /app/dist/public, in development: relative to __dirname
  const staticPath = process.env.NODE_ENV === 'production' 
    ? path.join(process.cwd(), 'dist/public')
    : path.join(__dirname, '../client/dist');
  
  console.log(`Serving static files from: ${staticPath}`);
  app.use(express.static(staticPath));
  
  // Handle SPA routing - serve index.html for all non-API routes
  app.get('*', (req, res) => {
    // Skip API routes
    if (req.path.startsWith('/api/')) {
      return res.status(404).json({ error: 'API endpoint not found' });
    }
    
    // Serve index.html for all other routes (SPA routing)
    res.sendFile(path.join(staticPath, 'index.html'));
  });
}