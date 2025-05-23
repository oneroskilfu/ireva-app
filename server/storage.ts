import { 
  users, type User, type InsertUser 
} from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";
import { db, pool, getDatabase } from "./db";
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
  
  // Create test users with configurable passwords for testing
  private async seedTestUsers() {
    try {
      // Use environment variables for test credentials, with secure random defaults
      const testUserPassword = process.env.TEST_USER_PASSWORD || 
        Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
      const adminUserPassword = process.env.ADMIN_USER_PASSWORD || 
        Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
      
      // Create a regular test user
      const testUser = await this.createUser({
        username: 'testuser',
        password: testUserPassword,
        email: 'test@example.com',
        name: 'Test User',
        phone: '08012345678',
        role: 'admin'
      });
      
      // Create an admin user
      const adminUser = await this.createUser({
        username: 'admin',
        password: adminUserPassword,
        email: 'admin@ireva.com',
        name: 'Admin User',
        phone: '08012345678',
        role: 'super_admin'
      });
      
      console.log('Created test users for development');
      if (!process.env.TEST_USER_PASSWORD || !process.env.ADMIN_USER_PASSWORD) {
        console.log('⚠️  Using random passwords for test users. Set TEST_USER_PASSWORD and ADMIN_USER_PASSWORD env vars for consistent credentials.');
      }
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
      name: insertUser.name,
      role: insertUser.role || 'investor',
      phone: insertUser.phone || null,
      address: insertUser.address || null,
      profileImage: insertUser.profileImage || null,
      isActive: insertUser.isActive ?? true,
      isVerified: insertUser.isVerified ?? false,
      kycStatus: insertUser.kycStatus || 'pending',
      dateOfBirth: insertUser.dateOfBirth || null,
      preferences: insertUser.preferences || null,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.users.set(id, user);
    return user;
  }
}

// Database storage implementation
export class DatabaseStorage implements IStorage {
  sessionStore: session.Store;
  private databaseReady: boolean = false;

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
        // Simplified connection test
        const query = 'SELECT 1 as value';
        await pool.query(query);
        
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
      let existingUsers: Array<{username: string}>;
      
      // Use different approaches based on startup mode
      if (process.env.MINIMAL_STARTUP === 'true') {
        // In minimal startup mode, use direct SQL for better compatibility
        try {
          const { rows } = await pool.query(
            'SELECT username FROM users WHERE username IN ($1, $2)',
            ['testuser', 'admin']
          );
          existingUsers = rows;
        } catch (err) {
          console.log('Error querying users table, it may not exist yet:', err);
          // If table doesn't exist, assume no users
          existingUsers = [];
        }
      } else {
        // Standard ORM approach for normal mode (with safety check)
        try {
          // Ensure database is ready before attempting operations
          await this.ensureDatabase();
          
          existingUsers = await db.select({
            username: users.username
          }).from(users).where(db.or(
            db.eq(users.username, 'testuser'),
            db.eq(users.username, 'admin')
          ));
        } catch (error) {
          console.warn('Database not ready for user seeding, skipping...', error.message);
          return; // Skip user creation if database isn't ready
        }
      }
      
      const usersToCreate: InsertUser[] = [];
      const existingUsernames = new Set(existingUsers.map((u: { username: string }) => u.username));
      
      // Use environment variables for test credentials, with secure random defaults
      const testUserPassword = process.env.TEST_USER_PASSWORD || 
        Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
      const adminUserPassword = process.env.ADMIN_USER_PASSWORD || 
        Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

      // Only create users that don't exist
      if (!existingUsernames.has('testuser')) {
        usersToCreate.push({
          username: 'testuser',
          password: testUserPassword,
          email: 'test@example.com',
          name: 'Test User',
          phone: '08012345678',
          role: 'admin'
        });
      }
      
      if (!existingUsernames.has('admin')) {
        usersToCreate.push({
          username: 'admin',
          password: adminUserPassword,
          email: 'admin@ireva.com',
          name: 'Admin User',
          phone: '08012345678',
          role: 'super_admin'
        });
      }
      
      // Create all needed users
      if (usersToCreate.length > 0) {
        if (process.env.MINIMAL_STARTUP === 'true') {
          // In minimal mode, use direct SQL for user creation
          for (const user of usersToCreate) {
            try {
              await pool.query(
                'INSERT INTO users (username, password, email, name, role, phone) VALUES ($1, $2, $3, $4, $5, $6)',
                [
                  user.username,
                  user.password,
                  user.email,
                  user.name,
                  user.role || 'investor',
                  user.phone || null
                ]
              );
            } catch (err) {
              console.error(`Error creating user ${user.username}:`, err);
            }
          }
        } else {
          // Normal mode - use Drizzle ORM
          await db.insert(users).values(usersToCreate);
        }
        console.log(`Created ${usersToCreate.length} test users`);
      }
    } catch (error) {
      console.error('Error creating test users:', error);
      throw error;
    }
  }

  private async ensureDatabase() {
    if (!this.databaseReady) {
      try {
        await getDatabase();
        this.databaseReady = true;
      } catch (error: any) {
        console.warn('Database connection not available:', error.message);
        throw error;
      }
    }
  }
}

// Use DatabaseStorage by default
export const storage = new DatabaseStorage();