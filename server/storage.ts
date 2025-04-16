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

const MemoryStore = createMemoryStore(session);

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
    this.userIdCounter = 1;
    this.propertyIdCounter = 1;
    this.investmentIdCounter = 1;
    this.notificationIdCounter = 1;
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000 // prune expired entries every 24h
    });
    
    // Seed properties
    this.seedProperties();
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
      createdAt: new Date(),
      isPhoneVerified: false,
      kycStatus: "not_started",
      kycDocuments: null,
      kycRejectionReason: null,
      kycSubmittedAt: null,
      kycVerifiedAt: null,
      lastLoginAt: null
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
        location: "New York",
        description: "Modern apartment complex in downtown with 120 units and premium amenities.",
        type: "residential",
        imageUrl: "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
        targetReturn: 12.5,
        minimumInvestment: 1000,
        term: 36,
        totalFunding: 5000000,
        currentFunding: 3200000,
        numberOfInvestors: 180,
        size: "120 Units",
        builtYear: "2020",
        occupancy: "92%",
        cashFlow: "$450,000/year",
        daysLeft: 28
      },
      {
        name: "Westfield Retail Center",
        location: "Los Angeles",
        description: "Shopping center with 45 retail units in a prime location with high foot traffic.",
        type: "commercial",
        imageUrl: "https://images.unsplash.com/photo-1577415124269-fc1140a69e91?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
        targetReturn: 9.8,
        minimumInvestment: 2500,
        term: 60,
        totalFunding: 9000000,
        currentFunding: 7400000,
        numberOfInvestors: 120,
        size: "45 Units",
        builtYear: "2015",
        occupancy: "88%",
        cashFlow: "$780,000/year",
        daysLeft: 45
      },
      {
        name: "Logistics Hub",
        location: "Chicago",
        description: "100,000 sq ft distribution center with modern facilities and transportation access.",
        type: "industrial",
        imageUrl: "https://images.unsplash.com/photo-1554435493-93422e8d1c89?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
        targetReturn: 10.2,
        minimumInvestment: 5000,
        term: 48,
        totalFunding: 12000000,
        currentFunding: 5400000,
        numberOfInvestors: 95,
        size: "100,000 sq ft",
        builtYear: "2018",
        occupancy: "95%",
        cashFlow: "$1,100,000/year",
        daysLeft: 60
      },
      {
        name: "Ocean View Residences",
        location: "Miami",
        description: "Luxury beachfront property with 65 premium condos and exclusive amenities.",
        type: "residential",
        imageUrl: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
        targetReturn: 14.5,
        minimumInvestment: 2000,
        term: 36,
        totalFunding: 20000000,
        currentFunding: 18400000,
        numberOfInvestors: 210,
        size: "65 Units",
        builtYear: "2021",
        occupancy: "85%",
        cashFlow: "$2,500,000/year",
        daysLeft: 15
      },
      {
        name: "Tech Hub Offices",
        location: "San Francisco",
        description: "Class A office space in technology district with flexible floor plans and modern facilities.",
        type: "commercial",
        imageUrl: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
        targetReturn: 11.2,
        minimumInvestment: 5000,
        term: 60,
        totalFunding: 15000000,
        currentFunding: 5700000,
        numberOfInvestors: 75,
        size: "80,000 sq ft",
        builtYear: "2019",
        occupancy: "90%",
        cashFlow: "$1,800,000/year",
        daysLeft: 30
      },
      {
        name: "Urban Village",
        location: "Austin",
        description: "Mixed-use development with retail spaces and 85 residential units in a walkable community.",
        type: "mixed-use",
        imageUrl: "https://images.unsplash.com/photo-1523192193543-6e7296d960e4?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
        targetReturn: 13.0,
        minimumInvestment: 1500,
        term: 48,
        totalFunding: 12000000,
        currentFunding: 9000000,
        numberOfInvestors: 150,
        size: "85 Residential / 20 Retail",
        builtYear: "2020",
        occupancy: "93%",
        cashFlow: "$1,400,000/year",
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

export const storage = new MemStorage();
