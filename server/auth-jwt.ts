import { Express, Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { storage } from "./storage";
import { User as SelectUser } from "@shared/schema";

// JWT Secret key - in production, use environment variable
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-in-production";
const JWT_EXPIRES_IN = "7d"; // Token expires in 7 days

// Type for decoded JWT token
interface JwtPayload {
  id: number;
  username: string;
  role: string;
  iat: number;
  exp: number;
}

declare global {
  namespace Express {
    interface User extends SelectUser {}
    interface Request {
      jwtPayload?: JwtPayload;
    }
  }
}

const scryptAsync = promisify(scrypt);

// Password hashing and validation
async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function comparePasswords(supplied: string, stored: string) {
  const [hashed, salt] = stored.split(".");
  const hashedBuf = Buffer.from(hashed, "hex");
  const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
  return timingSafeEqual(hashedBuf, suppliedBuf);
}

// Generate JWT token
function generateToken(user: SelectUser) {
  const payload = {
    id: user.id,
    username: user.username,
    role: user.role
  };
  
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

// Verify JWT token middleware
export function verifyToken(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  
  if (!authHeader) {
    return res.status(401).json({ error: "No token provided" });
  }
  
  // Get token from Bearer header
  const parts = authHeader.split(" ");
  if (parts.length !== 2 || parts[0] !== "Bearer") {
    return res.status(401).json({ error: "Token error" });
  }
  
  const token = parts[1];
  
  try {
    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
    req.jwtPayload = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: "Invalid token" });
  }
}

// Middleware to check admin role
export function ensureAdmin(req: Request, res: Response, next: NextFunction) {
  // First verify the token is valid
  verifyToken(req, res, async () => {
    const payload = req.jwtPayload;
    
    if (!payload) {
      return res.status(401).json({ error: "Authentication required" });
    }
    
    if (payload.role !== 'admin' && payload.role !== 'super_admin') {
      return res.status(403).json({ error: "Admin access required" });
    }
    
    // Token is valid and user is admin, fetch full user data
    const user = await storage.getUser(payload.id);
    if (!user) {
      return res.status(401).json({ error: "User not found" });
    }
    
    // Set the user object
    req.user = user;
    next();
  });
}

// Middleware to check super admin role
export function ensureSuperAdmin(req: Request, res: Response, next: NextFunction) {
  // First verify the token is valid
  verifyToken(req, res, async () => {
    const payload = req.jwtPayload;
    
    if (!payload) {
      return res.status(401).json({ error: "Authentication required" });
    }
    
    if (payload.role !== 'super_admin') {
      return res.status(403).json({ error: "Super Admin access required" });
    }
    
    // Token is valid and user is super admin, fetch full user data
    const user = await storage.getUser(payload.id);
    if (!user) {
      return res.status(401).json({ error: "User not found" });
    }
    
    // Set the user object
    req.user = user;
    next();
  });
}

// Setup auth routes
export function setupJwtAuth(app: Express) {
  // Register new user
  app.post("/api/auth/register", async (req, res) => {
    try {
      const { username, password, email, firstName, lastName, phoneNumber } = req.body;
      
      // Check if user already exists
      const existingUser = await storage.getUserByUsername(username);
      if (existingUser) {
        return res.status(400).json({ error: "Username already exists" });
      }
      
      // Create the user with hashed password
      const user = await storage.createUser({
        username,
        password: await hashPassword(password),
        email,
        firstName,
        lastName,
        phoneNumber
      });
      
      // Generate JWT token
      const token = generateToken(user);
      
      // Return user data and token (excluding password)
      const { password: _, ...userWithoutPassword } = user;
      res.status(201).json({ 
        user: userWithoutPassword,
        token 
      });
    } catch (error) {
      console.error("Registration error:", error);
      res.status(500).json({ error: "Registration failed" });
    }
  });
  
  // Login
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { username, password } = req.body;
      
      // Find user by username
      const user = await storage.getUserByUsername(username);
      if (!user) {
        return res.status(401).json({ error: "Invalid username or password" });
      }
      
      // Verify password
      const isPasswordValid = await comparePasswords(password, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({ error: "Invalid username or password" });
      }
      
      // Generate JWT token
      const token = generateToken(user);
      
      // Update last login timestamp
      const updatedUser = await storage.updateUserProfile(user.id, {
        lastLoginAt: new Date()
      });
      
      // Return user data and token (excluding password)
      const { password: _, ...userWithoutPassword } = updatedUser;
      res.json({ 
        user: userWithoutPassword,
        token 
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ error: "Login failed" });
    }
  });
  
  // Get current user
  app.get("/api/user", verifyToken, async (req, res) => {
    try {
      const payload = req.jwtPayload;
      
      if (!payload) {
        return res.status(401).json({ error: "Authentication required" });
      }
      
      // Get user from database
      const user = await storage.getUser(payload.id);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      
      // Return user without password
      const { password, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      console.error("Get user error:", error);
      res.status(500).json({ error: "Failed to get user data" });
    }
  });
  
  // Logout (token invalidation would require a token blacklist/database which is beyond the scope)
  app.post("/api/auth/logout", (req, res) => {
    // For JWT, client-side logout is sufficient (removing the token)
    // Server could implement token blacklisting for complete security
    res.json({ message: "Logged out successfully" });
  });
  
  // Refresh token (optional)
  app.post("/api/auth/refresh", verifyToken, async (req, res) => {
    try {
      const payload = req.jwtPayload;
      
      if (!payload) {
        return res.status(401).json({ error: "Authentication required" });
      }
      
      // Get fresh user data
      const user = await storage.getUser(payload.id);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      
      // Generate new token
      const token = generateToken(user);
      
      // Return user without password and new token
      const { password, ...userWithoutPassword } = user;
      res.json({ 
        user: userWithoutPassword,
        token 
      });
    } catch (error) {
      console.error("Refresh token error:", error);
      res.status(500).json({ error: "Failed to refresh token" });
    }
  });
}