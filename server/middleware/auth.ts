import { Request, Response, NextFunction } from "express";
import { logger } from "../utils/logger";

// Middleware to check if user is authenticated
export function isAuthenticated(req: Request, res: Response, next: NextFunction) {
  if (req.isAuthenticated && req.isAuthenticated()) {
    return next();
  }
  
  // Also check if there is a jwtPayload which means JWT auth is being used
  if (req.jwtPayload && req.jwtPayload.id) {
    return next();
  }
  
  logger.warn("Unauthorized access attempt", { context: "auth-middleware" });
  return res.status(401).json({ error: "Authentication required" });
}

// Middleware to check if user is an admin
export function isAdmin(req: Request, res: Response, next: NextFunction) {
  // Check for session-based auth
  if (req.user && (req.user as any).role === "admin") {
    return next();
  }
  
  // Check for JWT-based auth
  if (req.jwtPayload && req.jwtPayload.role === "admin") {
    return next();
  }
  
  logger.warn("Unauthorized admin access attempt", { context: "auth-middleware" });
  return res.status(403).json({ error: "Admin privileges required" });
}

// Middleware to check if user is a super admin
export function isSuperAdmin(req: Request, res: Response, next: NextFunction) {
  // Check for session-based auth
  if (req.user && (req.user as any).role === "superadmin") {
    return next();
  }
  
  // Check for JWT-based auth
  if (req.jwtPayload && req.jwtPayload.role === "superadmin") {
    return next();
  }
  
  logger.warn("Unauthorized super admin access attempt", { context: "auth-middleware" });
  return res.status(403).json({ error: "Super admin privileges required" });
}