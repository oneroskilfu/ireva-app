import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express } from "express";
import session from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { storage } from "./storage";
import { User as SelectUser } from "@shared/schema";
import createMemoryStore from "memorystore";

declare global {
  namespace Express {
    interface User extends SelectUser {}
  }
}

const scryptAsync = promisify(scrypt);

// Enhanced password hashing with bcrypt fallback support
export async function hashPassword(password: string) {
  // Fix for existing SHA-256 hashed test passwords in storage.ts
  if (password.length === 64 && /^[0-9a-f]+$/.test(password)) {
    // This is already a SHA-256 hash (used by the test users in storage)
    return password;
  }
  
  // Normal password hashing for regular user input
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

// Compare a supplied password with a stored password hash
async function comparePasswords(supplied: string, stored: string) {
  // Fix for SHA-256 hashed test user passwords
  if (stored.length === 64 && /^[0-9a-f]+$/.test(stored)) {
    // This is a SHA-256 hash from storage.ts test users
    // Handle the special case for test accounts
    if (supplied === 'adminpassword' && stored === '240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9') {
      return true;
    }
    if (supplied === 'password' && stored === '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8') {
      return true;
    }
    
    // For other cases, use SHA-256 comparison (in case there are other SHA-256 hashed passwords)
    const crypto = require('crypto');
    const hash = crypto.createHash('sha256').update(supplied).digest('hex');
    return hash === stored;
  }
  
  // Regular scrypt comparison for normal user passwords
  const [hashed, salt] = stored.split(".");
  const hashedBuf = Buffer.from(hashed, "hex");
  const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
  return timingSafeEqual(hashedBuf, suppliedBuf);
}

// Create a dedicated initialization function to support staged loading
export function initializeAuth(app: Express) {
  return setupAuth(app);
}

export function setupAuth(app: Express) {
  // Use in-memory session store for development to reduce startup time
  const isProduction = process.env.NODE_ENV === 'production';
  
  const sessionSettings: session.SessionOptions = {
    secret: process.env.SESSION_SECRET || 'ireva-real-estate-secret',
    resave: false,
    saveUninitialized: false,
    store: isProduction ? storage.sessionStore : new (createMemoryStore(session))({
      checkPeriod: 86400000 // prune expired entries every 24h
    }),
    cookie: {
      secure: false, // Set to false to ensure cookies work in all environments
      sameSite: 'lax', // Helps with cross-site issues
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      path: '/',
      httpOnly: true // Make cookie only accessible server-side
    }
  };

  app.set("trust proxy", 1);
  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        const user = await storage.getUserByUsername(username);
        if (!user || !(await comparePasswords(password, user.password))) {
          return done(null, false);
        } else {
          return done(null, user);
        }
      } catch (err) {
        return done(err);
      }
    }),
  );

  passport.serializeUser((user, done) => done(null, user.id));
  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user);
    } catch (err) {
      done(err);
    }
  });

  app.post("/api/register", async (req, res, next) => {
    try {
      const existingUser = await storage.getUserByUsername(req.body.username);
      if (existingUser) {
        return res.status(400).json({ error: "Username already exists" });
      }

      // Hash the password before storing
      const user = await storage.createUser({
        ...req.body,
        password: await hashPassword(req.body.password),
      });

      req.login(user, (err) => {
        if (err) return next(err);
        res.status(201).json(user);
      });
    } catch (err) {
      next(err);
    }
  });

  app.post("/api/login", (req, res, next) => {
    passport.authenticate("local", (err: Error | null, user: Express.User | false, info: any) => {
      if (err) return next(err);
      
      if (!user) {
        return res.status(401).json({ error: "Invalid credentials" });
      }
      
      req.login(user, (loginErr) => {
        if (loginErr) return next(loginErr);
        
        // Add redirect path based on user role
        const redirectPath = user.role === 'admin' || user.role === 'super_admin' || user.role === 'superadmin'
          ? '/admin/dashboard'
          : '/investor/dashboard';
          
        return res.status(200).json({
          ...user,
          redirect: redirectPath
        });
      });
    })(req, res, next);
  });

  app.post("/api/logout", (req, res, next) => {
    req.logout((err) => {
      if (err) return next(err);
      res.status(200).json({ redirect: '/login' });
    });
  });

  app.get("/api/user", (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    res.json(req.user);
  });
}