import { users, type User, type InsertUser, properties, type Property, type InsertProperty, investments, type Investment, type InsertInvestment } from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";

const MemoryStore = createMemoryStore(session);

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
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
      // In a real application, we'd use the proper hash function
      // For testing, we're using a simple format that our comparePasswords function can verify
      const hashedPassword = "5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8.112233445566";
      
      await this.createUser({
        username: "admin",
        email: "admin@investproperty.com",
        password: hashedPassword,
        firstName: "Admin",
        lastName: "User",
        isAdmin: true
      });
      console.log("Admin user created. Username: admin, Password: password");
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
      username: insertUser.username,
      password: insertUser.password,
      email: insertUser.email,
      firstName: insertUser.firstName || null,
      lastName: insertUser.lastName || null,
      isAdmin: insertUser.isAdmin || false,
      createdAt: new Date(),
      walletBalance: insertUser.walletBalance || 0,
      phoneNumber: insertUser.phoneNumber || null,
      bankName: insertUser.bankName || null,
      bankAccountNumber: insertUser.bankAccountNumber || null,
      bankAccountName: insertUser.bankAccountName || null,
      kycStatus: insertUser.kycStatus || "not_started",
      kycIdType: insertUser.kycIdType || null,
      kycIdNumber: insertUser.kycIdNumber || null,
      kycVerificationDate: insertUser.kycVerificationDate || null,
      // MFA fields
      mfaEnabled: insertUser.mfaEnabled || false,
      mfaPrimaryMethod: insertUser.mfaPrimaryMethod || "none",
      mfaSecondaryMethod: insertUser.mfaSecondaryMethod || null,
      mfaSecret: insertUser.mfaSecret || null,
      mfaBackupCodes: insertUser.mfaBackupCodes || null,
      mfaLastVerified: insertUser.mfaLastVerified || null,
    };
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
    const newProperty: Property = { 
      id, 
      name: property.name,
      description: property.description,
      location: property.location,
      type: property.type,
      imageUrl: property.imageUrl,
      targetReturn: property.targetReturn,
      minimumInvestment: property.minimumInvestment,
      term: property.term,
      totalFunding: property.totalFunding,
      currentFunding: property.currentFunding,
      numberOfInvestors: property.numberOfInvestors || 0,
      size: property.size || null,
      builtYear: property.builtYear || null,
      occupancy: property.occupancy || null,
      cashFlow: property.cashFlow || null,
      daysLeft: property.daysLeft || null,
    };
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
    const newInvestment: Investment = { 
      id, 
      userId: investment.userId,
      propertyId: investment.propertyId,
      amount: investment.amount,
      currentValue: investment.currentValue,
      date: new Date(),
      status: investment.status || "active",
      completedDate: investment.completedDate || null,
      earnings: investment.earnings || 0,
      returns: investment.returns || 0,
      paymentReference: investment.paymentReference || null
    };
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
        description: "Luxury residential apartment complex with 120 units, rooftop amenities, and prime location in the heart of Manhattan. The property features high-end finishes, smart home technology, and stunning city views.",
        type: "residential",
        imageUrl: "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
        additionalImages: JSON.stringify([
          "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
          "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
          "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
          "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"
        ]),
        videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
        virtualTourUrl: "https://my.matterport.com/show/?m=YAG8dwjKqDV",
        
        // Financial details
        targetReturn: "12.5",
        minimumInvestment: 1000,
        term: 36,
        totalFunding: 5000000,
        currentFunding: 3200000,
        
        // Project metrics
        numberOfInvestors: 180,
        size: "120 Units, 85,000 sq ft",
        builtYear: "2020",
        occupancy: "92%",
        cashFlow: "$450,000/year",
        daysLeft: 28,
        
        // Detailed location information
        address: "123 High Rise Avenue",
        city: "New York",
        state: "NY",
        zipCode: "10001",
        latitude: "40.7128",
        longitude: "-74.0060",
        neighborhoodDescription: "Located in the vibrant Chelsea neighborhood, this property is just steps away from the High Line, Chelsea Market, and numerous dining and entertainment options. The area has seen significant appreciation over the past decade and continues to be one of Manhattan's most desirable neighborhoods.",
        
        // Developer/Sponsor information
        developerName: "Skyline Developers LLC",
        developerDescription: "Skyline Developers has over 25 years of experience in luxury residential developments with a portfolio of over $2 billion in completed projects. Their properties consistently outperform market averages in both appreciation and rental yields.",
        developerLogoUrl: "https://placehold.co/200x100?text=Skyline+Developers",
        
        // Project timeline
        acquisitionDate: new Date("2020-06-15").toISOString(),
        constructionStartDate: new Date("2020-08-01").toISOString(),
        estimatedCompletionDate: new Date("2023-12-31").toISOString(),
        
        // Due diligence
        documentUrls: JSON.stringify([
          { title: "Property Appraisal", url: "https://example.com/docs/appraisal.pdf" },
          { title: "Financial Projections", url: "https://example.com/docs/financial-projections.pdf" },
          { title: "Market Analysis", url: "https://example.com/docs/market-analysis.pdf" },
          { title: "Legal Structure", url: "https://example.com/docs/legal-structure.pdf" }
        ]),
        riskRating: "Low",
        riskDescription: "This investment is considered low risk due to the property's prime location, strong pre-leasing activity, and experienced development team. The debt-to-equity ratio is conservative at 65%, providing a cushion against market fluctuations.",
        
        // Detailed financial projections
        projectedIrr: "14.5",
        projectedCashYield: "6.8",
        projectedAppreciation: "3.5",
        projectedTotalReturn: "24.8",
        
        // Property features & amenities
        features: JSON.stringify([
          "Floor-to-ceiling windows",
          "Hardwood flooring",
          "Quartz countertops",
          "Stainless steel appliances",
          "Smart home technology",
          "In-unit washer/dryer"
        ]),
        amenities: JSON.stringify([
          "Rooftop pool and lounge",
          "24/7 concierge service",
          "State-of-the-art fitness center",
          "Pet spa",
          "Coworking space",
          "Package room with cold storage"
        ])
      },
      {
        name: "Westfield Retail Center",
        location: "Los Angeles",
        description: "Prime shopping center with 45 retail units in an upscale area with consistent high foot traffic. Features modern architecture, spacious common areas, and convenient parking.",
        type: "commercial",
        imageUrl: "https://images.unsplash.com/photo-1577415124269-fc1140a69e91?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
        additionalImages: JSON.stringify([
          "https://images.unsplash.com/photo-1519501025264-65ba15a82390?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
          "https://images.unsplash.com/photo-1555447408-4a1c608e41fd?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
          "https://images.unsplash.com/photo-1611079830811-0803f2157b0e?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"
        ]),
        videoUrl: "https://www.youtube.com/embed/jNQXAC9IVRw",
        virtualTourUrl: "https://my.matterport.com/show/?m=RizJDmybZ3y",
        
        // Financial details
        targetReturn: "9.8",
        minimumInvestment: 2500,
        term: 60,
        totalFunding: 9000000,
        currentFunding: 7400000,
        
        // Project metrics
        numberOfInvestors: 120,
        size: "45 Units, 125,000 sq ft",
        builtYear: "2015",
        occupancy: "88%",
        cashFlow: "$780,000/year",
        daysLeft: 45,
        
        // Detailed location information
        address: "456 Retail Row",
        city: "Los Angeles",
        state: "CA",
        zipCode: "90210",
        latitude: "34.0522",
        longitude: "-118.2437",
        neighborhoodDescription: "Located in a prime retail district with high-income demographics and excellent visibility from major thoroughfares. The area features complementary businesses that drive consistent foot traffic throughout the week and increased weekend visits.",
        
        // Developer/Sponsor information
        developerName: "Westfield Commercial Properties",
        developerDescription: "Westfield Commercial Properties specializes in retail developments in premium locations. With a 30-year track record, they've developed over 3 million square feet of successful retail space across the western United States.",
        developerLogoUrl: "https://placehold.co/200x100?text=Westfield+Properties",
        
        // Project timeline
        acquisitionDate: new Date("2014-03-10").toISOString(),
        constructionStartDate: new Date("2014-05-15").toISOString(),
        estimatedCompletionDate: new Date("2025-08-30").toISOString(),
        
        // Due diligence
        documentUrls: JSON.stringify([
          { title: "Property Appraisal", url: "https://example.com/docs/westfield-appraisal.pdf" },
          { title: "Tenant Mix Analysis", url: "https://example.com/docs/westfield-tenant-mix.pdf" },
          { title: "Market Study", url: "https://example.com/docs/westfield-market-study.pdf" }
        ]),
        riskRating: "Medium",
        riskDescription: "This investment carries medium risk due to evolving retail trends and competitive market conditions. Mitigating factors include the prime location, diverse tenant mix, and experienced property management.",
        
        // Detailed financial projections
        projectedIrr: "11.3",
        projectedCashYield: "5.8",
        projectedAppreciation: "2.9",
        projectedTotalReturn: "20.0",
        
        // Property features & amenities
        features: JSON.stringify([
          "Modern storefront designs",
          "High visibility retail spaces",
          "Digital signage throughout",
          "Energy-efficient HVAC systems",
          "24/7 security monitoring"
        ]),
        amenities: JSON.stringify([
          "Abundant parking (500+ spaces)",
          "Food court with 8 vendors",
          "Children's play area",
          "Public WiFi",
          "Electric vehicle charging stations"
        ])
      },
      {
        name: "Logistics Hub",
        location: "Chicago",
        description: "100,000 sq ft distribution center with modern facilities and transportation access.",
        type: "industrial",
        imageUrl: "https://images.unsplash.com/photo-1554435493-93422e8d1c89?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
        targetReturn: "10.2",
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
        targetReturn: "14.5",
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
        targetReturn: "11.2",
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
        targetReturn: "13.0",
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
