import { users, type User, type InsertUser, properties, type Property, type InsertProperty, investments, type Investment, type InsertInvestment } from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";

const MemoryStore = createMemoryStore(session);

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getAllUsers(): Promise<User[]>;
  updateUser(id: number, userData: Partial<InsertUser>): Promise<User | undefined>;
  deleteUser(id: number): Promise<boolean>;
  
  // Property methods
  getProperty(id: number): Promise<Property | undefined>;
  getAllProperties(): Promise<Property[]>;
  getPropertiesByType(type: string): Promise<Property[]>;
  getPropertiesByLocation(location: string): Promise<Property[]>;
  searchProperties(search: string): Promise<Property[]>;
  createProperty(property: InsertProperty): Promise<Property>;
  updateProperty(id: number, propertyData: Partial<InsertProperty>): Promise<Property | undefined>;
  deleteProperty(id: number): Promise<boolean>;
  
  // Investment methods
  getInvestment(id: number): Promise<Investment | undefined>;
  getUserInvestments(userId: number): Promise<Investment[]>;
  getAllInvestments(): Promise<Investment[]>;
  createInvestment(investment: InsertInvestment): Promise<Investment>;
  updateInvestment(id: number, investmentData: Partial<InsertInvestment>): Promise<Investment | undefined>;
  deleteInvestment(id: number): Promise<boolean>;
  
  // Session store
  sessionStore: any; // Using any for session store to avoid type issues
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private properties: Map<number, Property>;
  private investments: Map<number, Investment>;
  private userIdCounter: number;
  private propertyIdCounter: number;
  private investmentIdCounter: number;
  sessionStore: any; // Using any for the session store type

  constructor() {
    this.users = new Map();
    this.properties = new Map();
    this.investments = new Map();
    this.userIdCounter = 1;
    this.propertyIdCounter = 1;
    this.investmentIdCounter = 1;
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000 // prune expired entries every 24h
    });
    
    // Seed properties
    this.seedProperties();
    
    // Create admin user if it doesn't exist
    this.seedAdminUser();
  }
  
  private async seedAdminUser() {
    // Check if admin user already exists
    const adminUser = await this.getUserByUsername("admin");
    if (!adminUser) {
      // Create an admin user with a known password for testing
      // Instead of importing hashPassword, we'll create a simple hash directly 
      // This is only for the admin seed user - real users will use the proper hash function
      const hashedPassword = "adminpassword_hashed_with_salt";
      
      await this.createUser({
        username: "admin",
        email: "admin@investproperty.com",
        password: hashedPassword,
        firstName: "Admin",
        lastName: "User",
        isAdmin: true
      });
      console.log("Admin user created. Username: admin, Password: adminpassword");
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
    const user: User = { id, ...insertUser, createdAt: new Date() };
    this.users.set(id, user);
    return user;
  }
  
  async getAllUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }
  
  async updateUser(id: number, userData: Partial<InsertUser>): Promise<User | undefined> {
    const user = await this.getUser(id);
    if (!user) return undefined;
    
    const updatedUser: User = {
      ...user,
      ...userData,
      // Don't update the ID or creation timestamp
      id: user.id,
      createdAt: user.createdAt
    };
    
    this.users.set(id, updatedUser);
    return updatedUser;
  }
  
  async deleteUser(id: number): Promise<boolean> {
    // Delete user's investments first
    const userInvestments = await this.getUserInvestments(id);
    for (const investment of userInvestments) {
      await this.deleteInvestment(investment.id);
    }
    
    return this.users.delete(id);
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
  
  async updateProperty(id: number, propertyData: Partial<InsertProperty>): Promise<Property | undefined> {
    const property = await this.getProperty(id);
    if (!property) return undefined;
    
    const updatedProperty: Property = {
      ...property,
      ...propertyData,
      id: property.id
    };
    
    this.properties.set(id, updatedProperty);
    return updatedProperty;
  }
  
  async deleteProperty(id: number): Promise<boolean> {
    // First check if there are investments for this property
    const investments = Array.from(this.investments.values()).filter(
      inv => inv.propertyId === id
    );
    
    // If there are investments, don't allow deletion
    if (investments.length > 0) {
      return false;
    }
    
    return this.properties.delete(id);
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

  async getAllInvestments(): Promise<Investment[]> {
    return Array.from(this.investments.values());
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
        numberOfInvestors: property.numberOfInvestors ? property.numberOfInvestors + 1 : 1
      };
      this.properties.set(property.id, updatedProperty);
    }
    
    return newInvestment;
  }
  
  async updateInvestment(id: number, investmentData: Partial<InsertInvestment>): Promise<Investment | undefined> {
    const investment = await this.getInvestment(id);
    if (!investment) return undefined;
    
    // Update the investment
    const updatedInvestment: Investment = {
      ...investment,
      ...investmentData,
      id: investment.id,
      date: investment.date
    };
    
    this.investments.set(id, updatedInvestment);
    return updatedInvestment;
  }
  
  async deleteInvestment(id: number): Promise<boolean> {
    const investment = await this.getInvestment(id);
    if (!investment) return false;
    
    // Update property funding
    const property = await this.getProperty(investment.propertyId);
    if (property) {
      const updatedProperty = {
        ...property,
        currentFunding: Math.max(0, property.currentFunding - investment.amount),
        numberOfInvestors: property.numberOfInvestors && property.numberOfInvestors > 0 
          ? property.numberOfInvestors - 1 
          : 0
      };
      this.properties.set(property.id, updatedProperty);
    }
    
    return this.investments.delete(id);
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
