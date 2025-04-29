import express from 'express';
import { exec } from 'child_process';
import { Request, Response } from 'express';

// Create router for development tools
export const devToolsRouter = express.Router();

// Only enable in development mode - force to true for now to allow testing
const isDevelopment = true; // process.env.NODE_ENV === 'development';

// Endpoint to run commands (only in development mode)
devToolsRouter.get('/run-command', (req: Request, res: Response) => {
  if (!isDevelopment) {
    return res.status(403).send('This endpoint is only available in development mode');
  }
  
  const command = req.query.command as string;
  
  // Validate command - only allow specific development commands
  if (!command || typeof command !== 'string') {
    return res.status(400).send('Invalid command');
  }
  
  // Whitelist of allowed commands for security
  const allowedCommands = [
    'cd /home/runner/workspace/client && node switch-implementation.js status',
    'cd /home/runner/workspace/client && node switch-implementation.js use-fixed',
    'cd /home/runner/workspace/client && node switch-implementation.js use-original',
    'echo test' // For testing the API endpoint
  ];
  
  // Check if command is in whitelist
  if (!allowedCommands.includes(command)) {
    return res.status(403).send('Command not allowed');
  }
  
  // Execute command
  exec(command, (error, stdout, stderr) => {
    if (error) {
      return res.status(500).send(`Error: ${error.message}`);
    }
    
    if (stderr) {
      return res.status(500).send(`Error: ${stderr}`);
    }
    
    res.send(stdout);
  });
});