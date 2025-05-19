import { 
  users, type User, type InsertUser 
} from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";
import { db, pool } from "./db";
import connectPg from "connect-pg-simple";
import { eq } from "drizzle-orm";

const MemoryStore = createMemoryStore(session);
const PostgresSessionStore = connectPg(session);

// Simplified storage interface focused on authentication
export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getAllUsers(): Promise<User[]>;
  createUser(user: InsertUser): Promise<User>;
  
  // Session store for authentication
  sessionStore: session.Store;
}

// In-memory storage implementation
export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private userIdCounter: number;
  sessionStore: session.Store;

  constructor() {
    this.users = new Map();
    this.userIdCounter = 1;
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000 // prune expired entries every 24h
    });
    
    // Seed test users
    this.seedTestUsers();
  }
  
  // Create test users with known passwords for testing
  private async seedTestUsers() {
    try {
      // Create a regular test user
      const testUser = await this.createUser({
        username: 'testuser',
        password: '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8', // This is 'password' hashed using SHA-256
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        phoneNumber: '08012345678',
        role: 'admin'
      });
      
      // Create an admin user
      const adminUser = await this.createUser({
        username: 'admin',
        password: '240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9', // This is 'adminpassword' hashed using SHA-256
        email: 'admin@ireva.com',
        firstName: 'Admin',
        lastName: 'User',
        phoneNumber: '08012345678',
        role: 'super_admin'
      });
      
      console.log('Created test users for development');
    } catch (error) {
      console.error('Error creating test users:', error);
    }
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }
  
  async getAllUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    // Ensure all required fields are present and have default values if missing
    const user: User = { 
      id, 
      username: insertUser.username,
      password: insertUser.password,
      email: insertUser.email,
      role: insertUser.role || 'user',
      firstName: insertUser.firstName || null,
      lastName: insertUser.lastName || null,
      phoneNumber: insertUser.phoneNumber || null,
      profileImage: insertUser.profileImage || null,
      bio: insertUser.bio || null,
      createdAt: new Date()
    };
    this.users.set(id, user);
    return user;
  }
}

// Database storage implementation
export class DatabaseStorage implements IStorage {
  sessionStore: session.Store;

  constructor() {
    // For faster startup, use memory store in development initially
    if (process.env.NODE_ENV === 'development' && process.env.STAGED_LOADING === 'true') {
      // Use in-memory session store for faster startup during development
      this.sessionStore = new MemoryStore({
        checkPeriod: 86400000 // prune expired entries every 24h
      });
      
      // Initialize database immediately but don't block server startup
      this.initializeDatabase().then(() => {
        console.log("Database initialization completed successfully");
        // Only switch to PostgreSQL session store in production
        if (process.env.NODE_ENV === 'production') {
          this.sessionStore = new PostgresSessionStore({
            pool,
            createTableIfMissing: true
          });
        }
      }).catch((error) => {
        console.error("Failed to initialize database:", error);
      });
    } else {
      // In production, use PostgreSQL session store from the start
      this.sessionStore = new PostgresSessionStore({
        pool,
        createTableIfMissing: true
      });
      
      // Initialize the database when storage is created
      this.initializeDatabase().then(() => {
        console.log("Database initialization completed successfully");
      }).catch((error) => {
        console.error("Failed to initialize database:", error);
      });
    }
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    try {
      const [user] = await db.select().from(users).where(eq(users.id, id));
      return user;
    } catch (error) {
      console.error("Error in getUser:", error);
      return undefined;
    }
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    try {
      const [user] = await db.select().from(users).where(eq(users.username, username));
      return user;
    } catch (error) {
      console.error("Error in getUserByUsername:", error);
      return undefined;
    }
  }
  
  async getAllUsers(): Promise<User[]> {
    try {
      return await db.select().from(users);
    } catch (error) {
      console.error("Error in getAllUsers:", error);
      return [];
    }
  }
  
  async createUser(insertUser: InsertUser): Promise<User> {
    try {
      const [user] = await db.insert(users).values(insertUser).returning();
      return user;
    } catch (error) {
      console.error("Error in createUser:", error);
      throw error;
    }
  }
  
  // Optimized database initialization
  private async initializeDatabase() {
    try {
      // Skip extensive checks if we're in minimal startup mode
      if (process.env.MINIMAL_STARTUP === 'true') {
        // Just validate connection and defer seeding
        await db.select({ value: db.sql`1` }).limit(1);
        
        // Schedule user seeding to happen after startup is complete
        setTimeout(() => this.seedTestUserAsync(), 2000);
        return;
      }
      
      // Standard initialization path
      try {
        const result = await db.select().from(users).limit(1);
        if (result.length === 0) {
          await this.seedTestUser();
        }
      } catch (error) {
        // Table might not exist or has a different schema
        // Attempt to create test users anyway
        await this.seedTestUser();
      }
    } catch (error) {
      console.error("Database initialization error:", error);
    }
  }
  
  // Non-blocking seed operation for minimal startup mode
  private seedTestUserAsync() {
    this.seedTestUser().then(() => {
      console.log('Test users created asynchronously');
    }).catch(error => {
      console.error('Async test user creation error:', error);
    });
  }
  
  // Create test users with known passwords for testing
  private async seedTestUser() {
    try {
      // Use a simpler approach to inserting test users
      // First check if they exist with a single query
      const existingUsers = await db.select({
        username: users.username
      }).from(users).where(db.or(
        db.eq(users.username, 'testuser'),
        db.eq(users.username, 'admin')
      ));
      
      const usersToCreate: InsertUser[] = [];
      const existingUsernames = new Set(existingUsers.map((u: { username: string }) => u.username));
      
      // Only create users that don't exist
      if (!existingUsernames.has('testuser')) {
        usersToCreate.push({
          username: 'testuser',
          password: '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8', // 'password' hashed with SHA-256
          email: 'test@example.com',
          firstName: 'Test',
          lastName: 'User',
          phoneNumber: '08012345678',
          role: 'admin'
        });
      }
      
      if (!existingUsernames.has('admin')) {
        usersToCreate.push({
          username: 'admin',
          password: '240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9', // 'adminpassword' hashed with SHA-256
          email: 'admin@ireva.com',
          firstName: 'Admin',
          lastName: 'User',
          phoneNumber: '08012345678',
          role: 'super_admin'
        });
      }
      
      // Create all needed users in a single batch
      if (usersToCreate.length > 0) {
        await db.insert(users).values(usersToCreate);
        console.log(`Created ${usersToCreate.length} test users`);
      }
    } catch (error) {
      console.error('Error creating test users:', error);
      throw error;
    }
  }
}

// Use DatabaseStorage by default
export const storage = new DatabaseStorage();