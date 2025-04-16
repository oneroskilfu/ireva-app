import { Router, Request, Response, NextFunction } from 'express';
import { storage } from '../storage';
import { scrypt, randomBytes, timingSafeEqual } from 'crypto';
import { promisify } from 'util';
import jwt from 'jsonwebtoken';
import { User } from '@shared/schema';

const authRouter = Router();
const scryptAsync = promisify(scrypt);

// JWT secret - in production this should be an environment variable
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key';
const JWT_EXPIRATION = '24h';

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString('hex');
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString('hex')}.${salt}`;
}

async function comparePasswords(supplied: string, stored: string) {
  const [hashed, salt] = stored.split('.');
  const hashedBuf = Buffer.from(hashed, 'hex');
  const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
  return timingSafeEqual(hashedBuf, suppliedBuf);
}

function generateToken(user: User) {
  return jwt.sign(
    { 
      id: user.id, 
      username: user.username,
      role: user.role
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRATION }
  );
}

// Register a new user
authRouter.post('/register', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const existingUser = await storage.getUserByUsername(req.body.username);
    if (existingUser) {
      return res.status(400).json({ message: "Username already exists" });
    }

    const user = await storage.createUser({
      ...req.body,
      password: await hashPassword(req.body.password),
    });

    // Generate JWT token
    const token = generateToken(user);

    res.status(201).json({ 
      user,
      token 
    });
  } catch (error) {
    res.status(500).json({ message: "Error registering user", error: String(error) });
  }
});

// Login user
authRouter.post('/login', async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;

    // Find user
    const user = await storage.getUserByUsername(username);
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Validate password
    const isPasswordValid = await comparePasswords(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Generate JWT token
    const token = generateToken(user);

    // Update last login timestamp
    await storage.updateUserProfile(user.id, { lastLoginAt: new Date() });

    res.status(200).json({ 
      user,
      token 
    });
  } catch (error) {
    res.status(500).json({ message: "Error logging in", error: String(error) });
  }
});

// Get current user
authRouter.get('/user', async (req: Request, res: Response) => {
  try {
    // Extract token from authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: "No token provided" });
    }

    const token = authHeader.split(' ')[1];

    // Verify token
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { id: number };
      const user = await storage.getUser(decoded.id);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Don't send the password
      const { password, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      return res.status(401).json({ message: "Invalid token" });
    }
  } catch (error) {
    res.status(500).json({ message: "Error getting user", error: String(error) });
  }
});

export default authRouter;