/**
 * Storage Module (CommonJS)
 * 
 * Provides database access and storage implementations
 * with fallback to memory storage if database is unavailable
 */

// Database connectivity
let db;
let pool;

// Try to load database module
try {
  const dbModule = require('./db.cjs');
  db = dbModule.db;
  pool = dbModule.pool;
} catch (error) {
  console.warn('Database module not available:', error.message);
}

/**
 * DatabaseStorage implementation using PostgreSQL and Drizzle
 */
class DatabaseStorage {
  constructor() {
    // Verify we have database access
    if (!db || !pool) {
      throw new Error('Database connection not available');
    }
    
    // Initialize session store if needed
    try {
      const session = require('express-session');
      const connectPg = require('connect-pg-simple');
      const PostgresSessionStore = connectPg(session);
      
      this.sessionStore = new PostgresSessionStore({ 
        pool, 
        createTableIfMissing: true 
      });
    } catch (error) {
      console.warn('Could not initialize PostgreSQL session store:', error.message);
      
      // Create memory store as fallback
      const createMemoryStore = require('memorystore');
      const MemoryStore = createMemoryStore(session);
      
      this.sessionStore = new MemoryStore({
        checkPeriod: 86400000 // Prune expired entries every 24h
      });
    }
  }
  
  async getUser(id) {
    try {
      if (!db) throw new Error('Database not available');
      
      // This would use the actual schema in a real application
      // For now, provide a minimal implementation
      const [user] = await db.query('SELECT * FROM users WHERE id = $1', [id]);
      return user;
    } catch (error) {
      console.error('Database error in getUser:', error);
      return null;
    }
  }
  
  async getUserByUsername(username) {
    try {
      if (!db) throw new Error('Database not available');
      
      // This would use the actual schema in a real application
      const [user] = await db.query('SELECT * FROM users WHERE username = $1', [username]);
      return user;
    } catch (error) {
      console.error('Database error in getUserByUsername:', error);
      return null;
    }
  }
  
  async createUser(userData) {
    try {
      if (!db) throw new Error('Database not available');
      
      // This would use the actual schema in a real application
      const [user] = await db.query(
        'INSERT INTO users (username, password, name, email, role) VALUES ($1, $2, $3, $4, $5) RETURNING *',
        [userData.username, userData.password, userData.name, userData.email, userData.role || 'user']
      );
      
      return user;
    } catch (error) {
      console.error('Database error in createUser:', error);
      throw error;
    }
  }
}

/**
 * In-memory storage implementation for development and fallback
 */
class MemStorage {
  constructor() {
    // Initialize with test users
    this.users = {
      admin: {
        id: 1,
        username: 'admin',
        password: 'adminpassword', // This would be hashed in a real application
        role: 'admin',
        name: 'Admin User',
        email: 'admin@ireva.com'
      },
      testuser: {
        id: 2,
        username: 'testuser',
        password: 'password', // This would be hashed in a real application
        role: 'investor',
        name: 'Test Investor',
        email: 'investor@ireva.com'
      }
    };
    
    // Create memory session store
    try {
      const session = require('express-session');
      const createMemoryStore = require('memorystore');
      const MemoryStore = createMemoryStore(session);
      
      this.sessionStore = new MemoryStore({
        checkPeriod: 86400000 // Prune expired entries every 24h
      });
    } catch (error) {
      console.warn('Could not initialize memory session store:', error.message);
      this.sessionStore = null;
    }
  }
  
  async getUser(id) {
    return Object.values(this.users).find(user => user.id === parseInt(id));
  }
  
  async getUserByUsername(username) {
    return this.users[username];
  }
  
  async createUser(userData) {
    const id = Object.keys(this.users).length + 1;
    const newUser = { ...userData, id };
    this.users[userData.username] = newUser;
    return newUser;
  }
}

// Export both implementations and let the application choose
module.exports = {
  DatabaseStorage,
  MemStorage,
  storage: new MemStorage() // Default to memory storage
};