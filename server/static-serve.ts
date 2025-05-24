import express, { type Express } from "express";
import path from "path";
import fs from "fs";

export function setupStaticServing(app: Express) {
  // Serve static files from the built frontend
  const staticPath = path.resolve(process.cwd(), "dist", "public");
  
  console.log(`Setting up static serving from: ${staticPath}`);
  
  // Check if the build directory exists
  if (fs.existsSync(staticPath)) {
    // Serve static files
    app.use(express.static(staticPath));
    
    // Fallback to index.html for client-side routing
    app.get('*', (req, res) => {
      const indexPath = path.join(staticPath, 'index.html');
      if (fs.existsSync(indexPath)) {
        res.sendFile(indexPath);
      } else {
        res.status(404).send('Build files not found. Please run: npm run build');
      }
    });
    
    console.log('✅ Static file serving configured successfully');
  } else {
    console.log('❌ Build directory not found. Run npm run build first.');
    
    // Serve a helpful development message
    app.get('*', (req, res) => {
      res.send(`
        <h1>iREVA Platform - Build Required</h1>
        <p>The application needs to be built for production.</p>
        <p>Please run: <code>npm run build</code></p>
        <p>Build directory expected at: ${staticPath}</p>
      `);
    });
  }
}