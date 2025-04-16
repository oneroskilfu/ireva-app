import { 
  users, type User, type InsertUser, 
  properties, type Property, type InsertProperty, 
  investments, type Investment, type InsertInvestment,
  notifications, type Notification, type InsertNotification,
  directMessages, type DirectMessage, type InsertDirectMessage,
  educationalResources, type EducationalResource, type InsertEducationalResource,
  paymentTransactions, type PaymentTransaction, type InsertPaymentTransaction,
  achievementBadges, type AchievementBadge, type InsertAchievementBadge,
  userAchievements, type UserAchievement, type InsertUserAchievement,
  type KycDocument, type KycStatus
} from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";
import { db, pool } from "./db";
import connectPg from "connect-pg-simple";
import { and, eq } from "drizzle-orm";
import * as schema from "@shared/schema";

const MemoryStore = createMemoryStore(session);
const PostgresSessionStore = connectPg(session);

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserPhone(userId: number, phoneNumber: string, isVerified: boolean): Promise<User>;
  updateUserKyc(userId: number, status: KycStatus, documents: KycDocument, submittedAt: Date): Promise<User>;
  updateUserKycStatus(userId: number, status: KycStatus, rejectionReason?: string, verifiedAt?: Date | null): Promise<User>;
  updateUserAccreditation(userId: number, level: string, documents?: any): Promise<User>;
  updateUserPreferences(userId: number, preferences: any): Promise<User>;
  updateUserReferralCode(userId: number, referralCode: string): Promise<User>;
  addUserRewardsPoints(userId: number, points: number): Promise<User>;
  updateUserProfile(userId: number, profile: Partial<User>): Promise<User>;
  
  // Property methods
  getProperty(id: number): Promise<Property | undefined>;
  getAllProperties(): Promise<Property[]>;
  getPropertiesByType(type: string): Promise<Property[]>;
  getPropertiesByLocation(location: string): Promise<Property[]>;
  getPropertiesByTier(tier: string): Promise<Property[]>;
  getPropertiesByAccreditationRequirement(accreditedOnly: boolean): Promise<Property[]>;
  searchProperties(search: string): Promise<Property[]>;
  createProperty(property: InsertProperty): Promise<Property>;
  updateProperty(id: number, property: Partial<Property>): Promise<Property>;
  addPropertyUpdateOrImage(id: number, update: any): Promise<Property>;
  
  // Investment methods
  getInvestment(id: number): Promise<Investment | undefined>;
  getUserInvestments(userId: number): Promise<Investment[]>;
  getInvestmentsByProperty(propertyId: number): Promise<Investment[]>;
  createInvestment(investment: InsertInvestment): Promise<Investment>;
  updateInvestmentStatus(id: number, status: string): Promise<Investment>;
  updateInvestmentValue(id: number, currentValue: number): Promise<Investment>;
  updateInvestmentReturns(id: number, earnings: number, monthlyReturns: any): Promise<Investment>;
  
  // Notification methods
  createNotification(notification: InsertNotification): Promise<Notification>;
  getUserNotifications(userId: number): Promise<Notification[]>;
  markNotificationAsRead(id: number): Promise<Notification>;
  
  // Direct message methods
  createDirectMessage(message: InsertDirectMessage): Promise<DirectMessage>;
  getUserDirectMessages(userId: number): Promise<DirectMessage[]>;
  getConversation(user1Id: number, user2Id: number): Promise<DirectMessage[]>;
  markMessageAsRead(id: number): Promise<DirectMessage>;
  
  // Educational resource methods
  createEducationalResource(resource: InsertEducationalResource): Promise<EducationalResource>;
  getAllEducationalResources(): Promise<EducationalResource[]>;
  getEducationalResourcesByCategory(category: string): Promise<EducationalResource[]>;
  incrementResourceViewCount(id: number): Promise<EducationalResource>;
  likeResource(id: number): Promise<EducationalResource>;
  
  // Payment transaction methods
  createPaymentTransaction(transaction: InsertPaymentTransaction): Promise<PaymentTransaction>;
  getUserPaymentTransactions(userId: number): Promise<PaymentTransaction[]>;
  updateTransactionStatus(id: number, status: string, gatewayReference?: string): Promise<PaymentTransaction>;
  
  // Achievement methods
  createAchievementBadge(badge: InsertAchievementBadge): Promise<AchievementBadge>;
  getAllAchievementBadges(): Promise<AchievementBadge[]>;
  awardAchievementToUser(userId: number, badgeId: number): Promise<UserAchievement>;
  getUserAchievements(userId: number): Promise<UserAchievement[]>;
  
  // Session store
  sessionStore: session.Store;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private properties: Map<number, Property>;
  private investments: Map<number, Investment>;
  private notifications: Map<number, Notification>;
  private directMessages: Map<number, DirectMessage>;
  private educationalResources: Map<number, EducationalResource>;
  private paymentTransactions: Map<number, PaymentTransaction>;
  private achievementBadges: Map<number, AchievementBadge>;
  private userAchievements: Map<number, UserAchievement>;
  private userIdCounter: number;
  private propertyIdCounter: number;
  private investmentIdCounter: number;
  private notificationIdCounter: number;
  private directMessageIdCounter: number;
  private educationalResourceIdCounter: number;
  private paymentTransactionIdCounter: number;
  private achievementBadgeIdCounter: number;
  private userAchievementIdCounter: number;
  sessionStore: session.Store;

  constructor() {
    this.users = new Map();
    this.properties = new Map();
    this.investments = new Map();
    this.notifications = new Map();
    this.directMessages = new Map();
    this.educationalResources = new Map();
    this.paymentTransactions = new Map();
    this.achievementBadges = new Map();
    this.userAchievements = new Map();
    this.userIdCounter = 1;
    this.propertyIdCounter = 1;
    this.investmentIdCounter = 1;
    this.notificationIdCounter = 1;
    this.directMessageIdCounter = 1;
    this.educationalResourceIdCounter = 1;
    this.paymentTransactionIdCounter = 1;
    this.achievementBadgeIdCounter = 1;
    this.userAchievementIdCounter = 1;
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000 // prune expired entries every 24h
    });
    
    // Seed properties
    this.seedProperties();
    this.seedTestUser();
  }
  
  // Create a test user with a known password for testing
  private async seedTestUser() {
    // Create a simple test user for login testing
    try {
      const testUser = await this.createUser({
        username: 'testuser',
        password: '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8', // This is 'password' hashed using SHA-256
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        phoneNumber: '08012345678'
      });
      
      // Update the user to have admin role
      const user = this.users.get(testUser.id);
      if (user) {
        user.role = 'admin';
        this.users.set(user.id, user);
        console.log('Created test admin user:', testUser.username);
      } else {
        console.log('Created test user:', testUser.username);
      }
    } catch (error) {
      console.error('Error creating test user:', error);
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

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const user: User = { 
      id, 
      ...insertUser, 
      // Set default role to "user" for regular registrations
      role: "user", 
      createdAt: new Date(),
      isPhoneVerified: false,
      kycStatus: "not_started",
      kycDocuments: null,
      kycRejectionReason: null,
      kycSubmittedAt: null,
      kycVerifiedAt: null,
      lastLoginAt: null,
      accreditationLevel: null,
      accreditationDocuments: null,
      accreditationVerifiedAt: null,
      referralCode: null,
      referredBy: null,
      rewardsPoints: 0,
      preferences: null
    };
    this.users.set(id, user);
    return user;
  }

  async updateUserPhone(userId: number, phoneNumber: string, isVerified: boolean): Promise<User> {
    const user = await this.getUser(userId);
    if (!user) {
      throw new Error(`User with ID ${userId} not found`);
    }
    
    const updatedUser = {
      ...user,
      phoneNumber,
      isPhoneVerified: isVerified
    };
    
    this.users.set(userId, updatedUser);
    
    return updatedUser;
  }

  async updateUserKyc(userId: number, status: KycStatus, documents: KycDocument, submittedAt: Date): Promise<User> {
    const user = await this.getUser(userId);
    if (!user) {
      throw new Error(`User with ID ${userId} not found`);
    }
    
    const updatedUser = {
      ...user,
      kycStatus: status,
      kycDocuments: documents,
      kycSubmittedAt: submittedAt,
      kycRejectionReason: null
    };
    
    this.users.set(userId, updatedUser);
    
    return updatedUser;
  }

  async updateUserKycStatus(userId: number, status: KycStatus, rejectionReason?: string, verifiedAt?: Date | null): Promise<User> {
    const user = await this.getUser(userId);
    if (!user) {
      throw new Error(`User with ID ${userId} not found`);
    }
    
    const updatedUser = {
      ...user,
      kycStatus: status,
      kycRejectionReason: rejectionReason || null,
      kycVerifiedAt: verifiedAt || null
    };
    
    this.users.set(userId, updatedUser);
    
    return updatedUser;
  }

  // Property methods
  async getProperty(id: number): Promise<Property | undefined> {
    return this.properties.get(id);
  }

  async getAllProperties(): Promise<Property[]> {
    return Array.from(this.properties.values());
  }

  async getPropertiesByType(type: string): Promise<Property[]> {
    return Array.from(this.properties.values()).filter(
      (property) => property.type === type,
    );
  }

  async getPropertiesByLocation(location: string): Promise<Property[]> {
    return Array.from(this.properties.values()).filter(
      (property) => property.location.toLowerCase().includes(location.toLowerCase()),
    );
  }

  async searchProperties(search: string): Promise<Property[]> {
    const lowerSearch = search.toLowerCase();
    return Array.from(this.properties.values()).filter(
      (property) => 
        property.name.toLowerCase().includes(lowerSearch) || 
        property.description.toLowerCase().includes(lowerSearch) || 
        property.location.toLowerCase().includes(lowerSearch)
    );
  }

  async createProperty(property: InsertProperty): Promise<Property> {
    const id = this.propertyIdCounter++;
    const newProperty: Property = { id, ...property };
    this.properties.set(id, newProperty);
    return newProperty;
  }

  // Investment methods
  async getInvestment(id: number): Promise<Investment | undefined> {
    return this.investments.get(id);
  }

  async getUserInvestments(userId: number): Promise<Investment[]> {
    return Array.from(this.investments.values()).filter(
      (investment) => investment.userId === userId,
    );
  }

  async createInvestment(investment: InsertInvestment): Promise<Investment> {
    const id = this.investmentIdCounter++;
    const newInvestment: Investment = { id, ...investment, date: new Date() };
    this.investments.set(id, newInvestment);
    
    // Update property funding
    const property = await this.getProperty(investment.propertyId);
    if (property) {
      const updatedProperty = {
        ...property,
        currentFunding: property.currentFunding + investment.amount,
        numberOfInvestors: property.numberOfInvestors + 1
      };
      this.properties.set(property.id, updatedProperty);
    }
    
    return newInvestment;
  }
  
  // Notification methods
  async createNotification(notification: InsertNotification): Promise<Notification> {
    const id = this.notificationIdCounter++;
    const newNotification: Notification = { 
      id, 
      ...notification, 
      isRead: false,
      createdAt: new Date(),
      readAt: null
    };
    this.notifications.set(id, newNotification);
    return newNotification;
  }
  
  async getUserNotifications(userId: number): Promise<Notification[]> {
    return Array.from(this.notifications.values())
      .filter(notification => notification.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()); // Sort by newest first
  }
  
  async updateInvestmentReturns(id: number, earnings: number, monthlyReturns: any): Promise<Investment> {
    const investment = this.investments.get(id);
    if (!investment) {
      throw new Error(`Investment with ID ${id} not found`);
    }
    
    const updatedInvestment = {
      ...investment,
      earnings,
      monthlyReturns,
      lastUpdated: new Date()
    };
    
    this.investments.set(id, updatedInvestment);
    return updatedInvestment;
  }
  
  async markNotificationAsRead(id: number): Promise<Notification> {
    const notification = this.notifications.get(id);
    if (!notification) {
      throw new Error(`Notification with ID ${id} not found`);
    }
    
    const updatedNotification = {
      ...notification,
      isRead: true,
      readAt: new Date()
    };
    
    this.notifications.set(id, updatedNotification);
    
    return updatedNotification;
  }

  // Seed properties
  private seedProperties() {
    const properties: Omit<Property, 'id'>[] = [
      {
        name: "Skyline Apartments",
        location: "Lagos",
        description: "Modern apartment complex in Ikoyi with 120 units and premium amenities.",
        type: "residential",
        imageUrl: "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
        targetReturn: 12.5,
        minimumInvestment: 100000,
        term: 36,
        totalFunding: 5000000,
        currentFunding: 3200000,
        numberOfInvestors: 180,
        size: "120 Units",
        builtYear: "2020",
        occupancy: "92%",
        cashFlow: "₦450,000,000/year",
        daysLeft: 28
      },
      {
        name: "Westfield Retail Center",
        location: "Lagos",
        description: "Shopping center with 45 retail units in Lekki with high foot traffic.",
        type: "commercial",
        imageUrl: "https://images.unsplash.com/photo-1577415124269-fc1140a69e91?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
        targetReturn: 9.8,
        minimumInvestment: 250000,
        term: 60,
        totalFunding: 900000000,
        currentFunding: 740000000,
        numberOfInvestors: 120,
        size: "45 Units",
        builtYear: "2015",
        occupancy: "88%",
        cashFlow: "₦780,000,000/year",
        daysLeft: 45
      },
      {
        name: "Logistics Hub",
        location: "Abuja",
        description: "100,000 sq ft distribution center with modern facilities and transportation access in Jabi District.",
        type: "industrial",
        imageUrl: "https://images.unsplash.com/photo-1554435493-93422e8d1c89?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
        targetReturn: 10.2,
        minimumInvestment: 500000,
        term: 48,
        totalFunding: 1200000000,
        currentFunding: 540000000,
        numberOfInvestors: 95,
        size: "100,000 sq ft",
        builtYear: "2018",
        occupancy: "95%",
        cashFlow: "₦1,100,000,000/year",
        daysLeft: 60
      },
      {
        name: "Ocean View Residences",
        location: "Lagos",
        description: "Luxury Victoria Island property with 65 premium condos and exclusive amenities.",
        type: "residential",
        imageUrl: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
        targetReturn: 14.5,
        minimumInvestment: 200000,
        term: 36,
        totalFunding: 2000000000,
        currentFunding: 1840000000,
        numberOfInvestors: 210,
        size: "65 Units",
        builtYear: "2021",
        occupancy: "85%",
        cashFlow: "₦2,500,000,000/year",
        daysLeft: 15
      },
      {
        name: "Tech Hub Offices",
        location: "Abuja",
        description: "Class A office space in the Central Business District with flexible floor plans and modern facilities.",
        type: "commercial",
        imageUrl: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
        targetReturn: 11.2,
        minimumInvestment: 500000,
        term: 60,
        totalFunding: 1500000000,
        currentFunding: 570000000,
        numberOfInvestors: 75,
        size: "80,000 sq ft",
        builtYear: "2019",
        occupancy: "90%",
        cashFlow: "₦1,800,000,000/year",
        daysLeft: 30
      },
      {
        name: "Urban Village",
        location: "Lagos",
        description: "Mixed-use development in Ikeja with retail spaces and 85 residential units in a walkable community.",
        type: "mixed-use",
        imageUrl: "https://images.unsplash.com/photo-1523192193543-6e7296d960e4?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
        targetReturn: 13.0,
        minimumInvestment: 150000,
        term: 48,
        totalFunding: 1200000000,
        currentFunding: 900000000,
        numberOfInvestors: 150,
        size: "85 Residential / 20 Retail",
        builtYear: "2020",
        occupancy: "93%",
        cashFlow: "₦1,400,000,000/year",
        daysLeft: 20
      }
    ];

    // Add to the map
    properties.forEach(property => {
      const id = this.propertyIdCounter++;
      this.properties.set(id, { id, ...property });
    });
  }
}

export class DatabaseStorage implements IStorage {
  sessionStore: session.Store;

  constructor() {
    this.sessionStore = new PostgresSessionStore({
      pool,
      createTableIfMissing: true
    });
    
    // Ensure schema tables exist in the database
    this.initializeDatabase();
  }

  private async initializeDatabase() {
    try {
      // Run a simple query to check if tables exist 
      const usersExist = await db.query.users.findFirst();
      
      if (!usersExist) {
        console.log("Initializing database tables and sample data...");
        await this.seedTestUser();
      }
    } catch (error) {
      console.error("Error initializing database:", error);
    }
  }

  // Create a test admin user for development
  private async seedTestUser() {
    try {
      const existingUser = await this.getUserByUsername('testuser');
      
      if (!existingUser) {
        const testUser = await this.createUser({
          username: 'testuser',
          password: '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8', // 'password' hashed
          email: 'test@example.com',
          firstName: 'Test',
          lastName: 'User',
          phoneNumber: '08012345678',
          role: 'admin'
        });
        
        console.log('Created test admin user:', testUser.username);
      }
    } catch (error) {
      console.error('Error creating test user:', error);
    }
  }

  // ===== User Methods =====
  async getUser(id: number): Promise<User | undefined> {
    return await db.query.users.findFirst({
      where: eq(schema.users.id, id)
    });
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return await db.query.users.findFirst({
      where: eq(schema.users.username, username)
    });
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(schema.users)
      .values(insertUser)
      .returning();
    return user;
  }

  async updateUserPhone(userId: number, phoneNumber: string, isVerified: boolean): Promise<User> {
    const [updatedUser] = await db.update(schema.users)
      .set({ 
        phoneNumber,
        isPhoneVerified: isVerified 
      })
      .where(eq(schema.users.id, userId))
      .returning();
    
    return updatedUser;
  }

  async updateUserKyc(userId: number, status: KycStatus, documents: KycDocument, submittedAt: Date): Promise<User> {
    const [updatedUser] = await db.update(schema.users)
      .set({
        kycStatus: status,
        kycDocuments: documents,
        kycSubmittedAt: submittedAt,
        kycRejectionReason: null
      })
      .where(eq(schema.users.id, userId))
      .returning();
    
    return updatedUser;
  }

  async updateUserKycStatus(userId: number, status: KycStatus, rejectionReason?: string, verifiedAt?: Date | null): Promise<User> {
    const [updatedUser] = await db.update(schema.users)
      .set({
        kycStatus: status,
        kycRejectionReason: rejectionReason || null,
        kycVerifiedAt: verifiedAt || null
      })
      .where(eq(schema.users.id, userId))
      .returning();
    
    return updatedUser;
  }

  async updateUserAccreditation(userId: number, level: string, documents?: any): Promise<User> {
    const [updatedUser] = await db.update(schema.users)
      .set({
        accreditationLevel: level as any,
        accreditationDocuments: documents || null,
        accreditationVerifiedAt: new Date()
      })
      .where(eq(schema.users.id, userId))
      .returning();
    
    return updatedUser;
  }

  async updateUserPreferences(userId: number, preferences: any): Promise<User> {
    const [updatedUser] = await db.update(schema.users)
      .set({ preferences })
      .where(eq(schema.users.id, userId))
      .returning();
    
    return updatedUser;
  }

  async updateUserReferralCode(userId: number, referralCode: string): Promise<User> {
    const [updatedUser] = await db.update(schema.users)
      .set({ referralCode })
      .where(eq(schema.users.id, userId))
      .returning();
    
    return updatedUser;
  }

  async addUserRewardsPoints(userId: number, points: number): Promise<User> {
    // First get current points
    const user = await this.getUser(userId);
    if (!user) {
      throw new Error(`User with ID ${userId} not found`);
    }

    const currentPoints = user.rewardsPoints || 0;
    
    const [updatedUser] = await db.update(schema.users)
      .set({ rewardsPoints: currentPoints + points })
      .where(eq(schema.users.id, userId))
      .returning();
    
    return updatedUser;
  }

  async updateUserProfile(userId: number, profile: Partial<User>): Promise<User> {
    const [updatedUser] = await db.update(schema.users)
      .set(profile)
      .where(eq(schema.users.id, userId))
      .returning();
    
    return updatedUser;
  }

  // ===== Property Methods =====
  async getProperty(id: number): Promise<Property | undefined> {
    return await db.query.properties.findFirst({
      where: eq(schema.properties.id, id)
    });
  }

  async getAllProperties(): Promise<Property[]> {
    return await db.query.properties.findMany();
  }

  async getPropertiesByType(type: string): Promise<Property[]> {
    return await db.query.properties.findMany({
      where: eq(schema.properties.type, type as any)
    });
  }

  async getPropertiesByLocation(location: string): Promise<Property[]> {
    // This is simplified - would ideally use a more robust text search
    return await db.query.properties.findMany({
      where: eq(schema.properties.location, location)
    });
  }

  async getPropertiesByTier(tier: string): Promise<Property[]> {
    return await db.query.properties.findMany({
      where: eq(schema.properties.tier, tier as any)
    });
  }

  async getPropertiesByAccreditationRequirement(accreditedOnly: boolean): Promise<Property[]> {
    return await db.query.properties.findMany({
      where: eq(schema.properties.accreditedOnly, accreditedOnly)
    });
  }

  async searchProperties(search: string): Promise<Property[]> {
    // Simple implementation - would be better with full-text search
    return await db.query.properties.findMany({
      where: eq(schema.properties.name, search)
    });
  }

  async createProperty(property: InsertProperty): Promise<Property> {
    const [newProperty] = await db.insert(schema.properties)
      .values(property)
      .returning();
    
    return newProperty;
  }

  async updateProperty(id: number, property: Partial<Property>): Promise<Property> {
    const [updatedProperty] = await db.update(schema.properties)
      .set(property)
      .where(eq(schema.properties.id, id))
      .returning();
    
    return updatedProperty;
  }

  async addPropertyUpdateOrImage(id: number, update: any): Promise<Property> {
    const property = await this.getProperty(id);
    if (!property) {
      throw new Error(`Property with ID ${id} not found`);
    }

    // Implementation depends on property schema - this is a simplified version
    const [updatedProperty] = await db.update(schema.properties)
      .set({
        // Update with the provided changes
        ...update
      })
      .where(eq(schema.properties.id, id))
      .returning();
    
    return updatedProperty;
  }

  // ===== Investment Methods =====
  async getInvestment(id: number): Promise<Investment | undefined> {
    return await db.query.investments.findFirst({
      where: eq(schema.investments.id, id) 
    });
  }

  async getUserInvestments(userId: number): Promise<Investment[]> {
    return await db.query.investments.findMany({
      where: eq(schema.investments.userId, userId)
    });
  }

  async getInvestmentsByProperty(propertyId: number): Promise<Investment[]> {
    return await db.query.investments.findMany({
      where: eq(schema.investments.propertyId, propertyId)
    });
  }

  async createInvestment(investment: InsertInvestment): Promise<Investment> {
    const [newInvestment] = await db.insert(schema.investments)
      .values({
        ...investment,
        date: new Date()
      })
      .returning();
    
    // Update property funding data
    const property = await this.getProperty(investment.propertyId);
    if (property) {
      await this.updateProperty(property.id, {
        currentFunding: (property.currentFunding || 0) + investment.amount,
        numberOfInvestors: (property.numberOfInvestors || 0) + 1
      });
    }
    
    return newInvestment;
  }

  async updateInvestmentStatus(id: number, status: string): Promise<Investment> {
    const [updatedInvestment] = await db.update(schema.investments)
      .set({ status: status as any })
      .where(eq(schema.investments.id, id))
      .returning();
    
    return updatedInvestment;
  }

  async updateInvestmentValue(id: number, currentValue: number): Promise<Investment> {
    const [updatedInvestment] = await db.update(schema.investments)
      .set({ currentValue })
      .where(eq(schema.investments.id, id))
      .returning();
    
    return updatedInvestment;
  }

  async updateInvestmentReturns(id: number, earnings: number, monthlyReturns: any): Promise<Investment> {
    const [updatedInvestment] = await db.update(schema.investments)
      .set({ 
        earnings,
        monthlyReturns,
        lastUpdated: new Date()
      })
      .where(eq(schema.investments.id, id))
      .returning();
    
    return updatedInvestment;
  }

  // ===== Notification Methods =====
  async createNotification(notification: InsertNotification): Promise<Notification> {
    const [newNotification] = await db.insert(schema.notifications)
      .values({
        ...notification,
        isRead: false,
        createdAt: new Date(),
        readAt: null
      })
      .returning();
    
    return newNotification;
  }

  async getUserNotifications(userId: number): Promise<Notification[]> {
    return await db.query.notifications.findMany({
      where: eq(schema.notifications.userId, userId),
      orderBy: (notifications, { desc }) => [desc(notifications.createdAt)]
    });
  }

  async markNotificationAsRead(id: number): Promise<Notification> {
    const [updatedNotification] = await db.update(schema.notifications)
      .set({ 
        isRead: true,
        readAt: new Date()
      })
      .where(eq(schema.notifications.id, id))
      .returning();
    
    return updatedNotification;
  }

  // ===== Direct Message Methods =====
  async createDirectMessage(message: InsertDirectMessage): Promise<DirectMessage> {
    const [newMessage] = await db.insert(schema.directMessages)
      .values({
        ...message,
        isRead: false,
        createdAt: new Date()
      })
      .returning();
    
    return newMessage;
  }

  async getUserDirectMessages(userId: number): Promise<DirectMessage[]> {
    return await db.query.directMessages.findMany({
      where: eq(schema.directMessages.recipientId, userId)
    });
  }

  async getConversation(user1Id: number, user2Id: number): Promise<DirectMessage[]> {
    // Get messages where either user is sender and the other is recipient
    const messages = await db.query.directMessages.findMany({
      where: (directMessages, { or, and }) => or(
        and(
          eq(directMessages.senderId, user1Id),
          eq(directMessages.recipientId, user2Id)
        ),
        and(
          eq(directMessages.senderId, user2Id),
          eq(directMessages.recipientId, user1Id)
        )
      ),
      orderBy: (directMessages, { asc }) => [asc(directMessages.createdAt)]
    });
    
    return messages;
  }

  async markMessageAsRead(id: number): Promise<DirectMessage> {
    const [updatedMessage] = await db.update(schema.directMessages)
      .set({ 
        isRead: true,
        readAt: new Date()
      })
      .where(eq(schema.directMessages.id, id))
      .returning();
    
    return updatedMessage;
  }

  // ===== Educational Resource Methods =====
  async createEducationalResource(resource: InsertEducationalResource): Promise<EducationalResource> {
    const [newResource] = await db.insert(schema.educationalResources)
      .values({
        ...resource,
        createdAt: new Date(),
        viewCount: 0,
        likeCount: 0
      })
      .returning();
    
    return newResource;
  }

  async getAllEducationalResources(): Promise<EducationalResource[]> {
    return await db.query.educationalResources.findMany();
  }

  async getEducationalResourcesByCategory(category: string): Promise<EducationalResource[]> {
    return await db.query.educationalResources.findMany({
      where: eq(schema.educationalResources.category, category as any)
    });
  }

  async incrementResourceViewCount(id: number): Promise<EducationalResource> {
    const resource = await db.query.educationalResources.findFirst({
      where: eq(schema.educationalResources.id, id)
    });
    
    if (!resource) {
      throw new Error(`Resource with ID ${id} not found`);
    }
    
    const [updatedResource] = await db.update(schema.educationalResources)
      .set({ viewCount: (resource.viewCount || 0) + 1 })
      .where(eq(schema.educationalResources.id, id))
      .returning();
    
    return updatedResource;
  }

  async likeResource(id: number): Promise<EducationalResource> {
    const resource = await db.query.educationalResources.findFirst({
      where: eq(schema.educationalResources.id, id)
    });
    
    if (!resource) {
      throw new Error(`Resource with ID ${id} not found`);
    }
    
    const [updatedResource] = await db.update(schema.educationalResources)
      .set({ likeCount: (resource.likeCount || 0) + 1 })
      .where(eq(schema.educationalResources.id, id))
      .returning();
    
    return updatedResource;
  }

  // ===== Payment Transaction Methods =====
  async createPaymentTransaction(transaction: InsertPaymentTransaction): Promise<PaymentTransaction> {
    const [newTransaction] = await db.insert(schema.paymentTransactions)
      .values({
        ...transaction,
        createdAt: new Date()
      })
      .returning();
    
    return newTransaction;
  }

  async getUserPaymentTransactions(userId: number): Promise<PaymentTransaction[]> {
    return await db.query.paymentTransactions.findMany({
      where: eq(schema.paymentTransactions.userId, userId)
    });
  }

  async updateTransactionStatus(id: number, status: string, gatewayReference?: string): Promise<PaymentTransaction> {
    const [updatedTransaction] = await db.update(schema.paymentTransactions)
      .set({ 
        status: status as any,
        gatewayReference: gatewayReference || null,
        updatedAt: new Date()
      })
      .where(eq(schema.paymentTransactions.id, id))
      .returning();
    
    return updatedTransaction;
  }

  // ===== Achievement Methods =====
  async createAchievementBadge(badge: InsertAchievementBadge): Promise<AchievementBadge> {
    const [newBadge] = await db.insert(schema.achievementBadges)
      .values(badge)
      .returning();
    
    return newBadge;
  }

  async getAllAchievementBadges(): Promise<AchievementBadge[]> {
    return await db.query.achievementBadges.findMany();
  }

  async awardAchievementToUser(userId: number, badgeId: number): Promise<UserAchievement> {
    const [newAchievement] = await db.insert(schema.userAchievements)
      .values({
        userId,
        badgeId,
        awardedAt: new Date()
      })
      .returning();
    
    return newAchievement;
  }

  async getUserAchievements(userId: number): Promise<UserAchievement[]> {
    return await db.query.userAchievements.findMany({
      where: eq(schema.userAchievements.userId, userId)
    });
  }
}

// Use DatabaseStorage instead of MemStorage for production
export const storage = new DatabaseStorage();
