import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import dotenv from "dotenv";
import { authenticateJWT } from "./middlewares/auth";
import { warmupDatabase } from "./db";

// Load environment variables from .env file
dotenv.config();

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Apply different middleware approaches based on route type
app.use('/api', (req, res, next) => {
  // Public routes that don't need authentication
  if (req.path.startsWith('/api/auth/jwt') || req.method === 'GET') {
    return next();
  }
  
  // Apply auth middleware to protected routes
  authenticateJWT(req, res, next);
});

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // Always serve the app on port 5000 since that's what the workflow system expects
  // this serves both the API and the client.
  const port = process.env.PORT || 5000;
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true,
  }, () => {
    log(`serving on port ${port}`);
    
    // Delay heavy initialization tasks to ensure server starts properly
    setTimeout(async () => {
      // Heavy initialization tasks go here
      log('Running delayed initialization tasks...');
      
      try {
        // Measure database connection time
        console.time("DB connection");
        // Warm up database connection
        await warmupDatabase();
        console.timeEnd("DB connection");
        
        // Measure cache warming time
        console.time("Cache warming");
        // Add any additional cache warming here if needed
        console.timeEnd("Cache warming");
        
        // Add more performance timing as needed
        
        log('Delayed initialization completed successfully');
      } catch (error) {
        console.error('Error during delayed initialization:', error);
      }
    }, 2000); // 2 second delay
  });
})();
