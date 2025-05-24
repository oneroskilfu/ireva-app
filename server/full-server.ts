import { type Request, Response, NextFunction, Application } from "express";
import { Server } from "http";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { authenticateJWT } from "./middlewares/auth";
import { warmupDatabase } from "./db";

// Initialize the full server with all features
export async function initializeFullServer(app: Application, server: Server) {
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

  try {
    // Register routes
    await registerRoutes(app);
    
    // Add error handling middleware
    app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
      const status = err.status || err.statusCode || 500;
      const message = err.message || "Internal Server Error";
  
      res.status(status).json({ message });
      throw err;
    });
  
    // Setup vite or static serving
    if (app.get("env") === "development") {
      await setupVite(app, server);
    } else {
      serveStatic(app);
    }
    
    // Perform delayed initialization
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
      
      log('Full server initialization completed successfully');
    } catch (error) {
      console.error('Error during delayed initialization:', error);
    }
  } catch (error) {
    console.error('Error during full server initialization:', error);
  }
}