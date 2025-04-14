import { 
  users, type User, type InsertUser, 
  properties, type Property, type InsertProperty, 
  investments, type Investment, type InsertInvestment,
  forumPosts, type ForumPost, type InsertForumPost,
  qaQuestions, type QAQuestion, type InsertQAQuestion,
  qaAnswers, type QAAnswer, type InsertQAAnswer,
  supportTickets, type SupportTicket, type InsertSupportTicket,
  supportMessages, type SupportMessage, type InsertSupportMessage,
  supportFaqs, type SupportFaq, type InsertSupportFaq
} from "@shared/schema";
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
  
  // Forum methods
  getForumPost(id: number): Promise<ForumPost | undefined>;
  getForumPostsByProperty(propertyId: number): Promise<ForumPost[]>;
  getForumPostsByUser(userId: number): Promise<ForumPost[]>;
  getForumThreads(parentId: number): Promise<ForumPost[]>;
  getRecentForumPosts(limit?: number): Promise<ForumPost[]>;
  createForumPost(post: InsertForumPost): Promise<ForumPost>;
  updateForumPost(id: number, postData: Partial<InsertForumPost>): Promise<ForumPost | undefined>;
  deleteForumPost(id: number): Promise<boolean>;
  
  // Q&A methods
  getQuestion(id: number): Promise<QAQuestion | undefined>;
  getQuestionsByProperty(propertyId: number): Promise<QAQuestion[]>;
  getQuestionsByUser(userId: number): Promise<QAQuestion[]>;
  getAnswers(questionId: number): Promise<QAAnswer[]>;
  getRecentQuestions(limit?: number): Promise<QAQuestion[]>;
  createQuestion(question: InsertQAQuestion): Promise<QAQuestion>;
  createAnswer(answer: InsertQAAnswer): Promise<QAAnswer>;
  markQuestionAsAnswered(id: number, isAnswered: boolean): Promise<QAQuestion | undefined>;
  markAnswerAsAccepted(id: number, isAccepted: boolean): Promise<QAAnswer | undefined>;
  
  // Customer Support methods
  getSupportTicket(id: number): Promise<SupportTicket | undefined>;
  getUserSupportTickets(userId: number): Promise<SupportTicket[]>;
  getAllSupportTickets(): Promise<SupportTicket[]>;
  getSupportTicketsByStatus(status: string): Promise<SupportTicket[]>;
  createSupportTicket(ticket: InsertSupportTicket): Promise<SupportTicket>;
  updateSupportTicket(id: number, ticketData: Partial<InsertSupportTicket>): Promise<SupportTicket | undefined>;
  deleteSupportTicket(id: number): Promise<boolean>;
  getSupportMessages(ticketId: number): Promise<SupportMessage[]>;
  createSupportMessage(message: InsertSupportMessage): Promise<SupportMessage>;
  getSupportFaqs(category?: string): Promise<SupportFaq[]>;
  createSupportFaq(faq: InsertSupportFaq): Promise<SupportFaq>;
  updateSupportFaq(id: number, faqData: Partial<InsertSupportFaq>): Promise<SupportFaq | undefined>;
  deleteSupportFaq(id: number): Promise<boolean>;
  
  // Session store
  sessionStore: any; // Using any for session store to avoid type issues
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private properties: Map<number, Property>;
  private investments: Map<number, Investment>;
  private forumPosts: Map<number, ForumPost>;
  private qaQuestions: Map<number, QAQuestion>;
  private qaAnswers: Map<number, QAAnswer>;
  private supportTickets: Map<number, SupportTicket>;
  private supportMessages: Map<number, SupportMessage>;
  private supportFaqs: Map<number, SupportFaq>;
  private userIdCounter: number;
  private propertyIdCounter: number;
  private investmentIdCounter: number;
  private forumPostIdCounter: number;
  private qaQuestionIdCounter: number;
  private qaAnswerIdCounter: number;
  private supportTicketIdCounter: number;
  private supportMessageIdCounter: number;
  private supportFaqIdCounter: number;
  sessionStore: any; // Using any for the session store type

  constructor() {
    this.users = new Map();
    this.properties = new Map();
    this.investments = new Map();
    this.forumPosts = new Map();
    this.qaQuestions = new Map();
    this.qaAnswers = new Map();
    this.supportTickets = new Map();
    this.supportMessages = new Map();
    this.supportFaqs = new Map();
    this.userIdCounter = 1;
    this.propertyIdCounter = 1;
    this.investmentIdCounter = 1;
    this.forumPostIdCounter = 1;
    this.qaQuestionIdCounter = 1;
    this.qaAnswerIdCounter = 1;
    this.supportTicketIdCounter = 1;
    this.supportMessageIdCounter = 1;
    this.supportFaqIdCounter = 1;
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
  
  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email === email,
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

  // Forum methods
  async getForumPost(id: number): Promise<ForumPost | undefined> {
    return this.forumPosts.get(id);
  }

  async getForumPostsByProperty(propertyId: number): Promise<ForumPost[]> {
    return Array.from(this.forumPosts.values()).filter(
      (post) => post.propertyId === propertyId
    );
  }

  async getForumPostsByUser(userId: number): Promise<ForumPost[]> {
    return Array.from(this.forumPosts.values()).filter(
      (post) => post.userId === userId
    );
  }

  async getForumThreads(parentId: number): Promise<ForumPost[]> {
    return Array.from(this.forumPosts.values()).filter(
      (post) => post.parentId === parentId
    );
  }

  async getRecentForumPosts(limit: number = 10): Promise<ForumPost[]> {
    return Array.from(this.forumPosts.values())
      .filter(post => !post.parentId) // Only get top-level posts
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, limit);
  }

  async createForumPost(post: InsertForumPost): Promise<ForumPost> {
    const id = this.forumPostIdCounter++;
    const newPost: ForumPost = {
      id,
      title: post.title,
      content: post.content,
      userId: post.userId,
      propertyId: post.propertyId || null,
      parentId: post.parentId || null,
      status: post.status || "published",
      isPinned: post.isPinned || false,
      isAnnouncement: post.isAnnouncement || false,
      likes: 0,
      views: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.forumPosts.set(id, newPost);
    return newPost;
  }

  async updateForumPost(id: number, postData: Partial<InsertForumPost>): Promise<ForumPost | undefined> {
    const post = await this.getForumPost(id);
    if (!post) return undefined;

    const updatedPost: ForumPost = {
      ...post,
      ...postData,
      id: post.id,
      createdAt: post.createdAt,
      updatedAt: new Date(),
      likes: post.likes,
      views: post.views
    };

    this.forumPosts.set(id, updatedPost);
    return updatedPost;
  }

  async deleteForumPost(id: number): Promise<boolean> {
    // Also delete any child posts (replies)
    const replies = await this.getForumThreads(id);
    for (const reply of replies) {
      await this.deleteForumPost(reply.id);
    }
    
    return this.forumPosts.delete(id);
  }

  // Q&A methods
  async getQuestion(id: number): Promise<QAQuestion | undefined> {
    return this.qaQuestions.get(id);
  }

  async getQuestionsByProperty(propertyId: number): Promise<QAQuestion[]> {
    return Array.from(this.qaQuestions.values()).filter(
      (question) => question.propertyId === propertyId
    );
  }

  async getQuestionsByUser(userId: number): Promise<QAQuestion[]> {
    return Array.from(this.qaQuestions.values()).filter(
      (question) => question.userId === userId
    );
  }

  async getAnswers(questionId: number): Promise<QAAnswer[]> {
    return Array.from(this.qaAnswers.values()).filter(
      (answer) => answer.questionId === questionId
    );
  }

  async getRecentQuestions(limit: number = 10): Promise<QAQuestion[]> {
    return Array.from(this.qaQuestions.values())
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, limit);
  }

  async createQuestion(question: InsertQAQuestion): Promise<QAQuestion> {
    const id = this.qaQuestionIdCounter++;
    const newQuestion: QAQuestion = {
      id,
      question: question.question,
      details: question.details || null,
      userId: question.userId,
      propertyId: question.propertyId,
      isAnswered: false,
      isFeatured: false,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.qaQuestions.set(id, newQuestion);
    return newQuestion;
  }

  async createAnswer(answer: InsertQAAnswer): Promise<QAAnswer> {
    const id = this.qaAnswerIdCounter++;
    const newAnswer: QAAnswer = {
      id,
      answer: answer.answer,
      userId: answer.userId,
      questionId: answer.questionId,
      isAccepted: false,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.qaAnswers.set(id, newAnswer);
    
    // Check if there are any answers for this question
    const question = await this.getQuestion(answer.questionId);
    if (question && !question.isAnswered) {
      // Mark the question as answered when the first answer is created
      await this.markQuestionAsAnswered(answer.questionId, true);
    }
    
    return newAnswer;
  }

  async markQuestionAsAnswered(id: number, isAnswered: boolean): Promise<QAQuestion | undefined> {
    const question = await this.getQuestion(id);
    if (!question) return undefined;

    const updatedQuestion: QAQuestion = {
      ...question,
      isAnswered,
      updatedAt: new Date()
    };

    this.qaQuestions.set(id, updatedQuestion);
    return updatedQuestion;
  }

  async markAnswerAsAccepted(id: number, isAccepted: boolean): Promise<QAAnswer | undefined> {
    const answer = this.qaAnswers.get(id);
    if (!answer) return undefined;

    // If we're marking this answer as accepted, first unmark any other accepted answers
    if (isAccepted) {
      const otherAnswers = Array.from(this.qaAnswers.values()).filter(
        a => a.questionId === answer.questionId && a.id !== id && a.isAccepted
      );
      
      for (const otherAnswer of otherAnswers) {
        const updatedAnswer: QAAnswer = {
          ...otherAnswer,
          isAccepted: false,
          updatedAt: new Date()
        };
        this.qaAnswers.set(otherAnswer.id, updatedAnswer);
      }
    }

    const updatedAnswer: QAAnswer = {
      ...answer,
      isAccepted,
      updatedAt: new Date()
    };

    this.qaAnswers.set(id, updatedAnswer);
    return updatedAnswer;
  }
  
  // Customer Support methods
  async getSupportTicket(id: number): Promise<SupportTicket | undefined> {
    return this.supportTickets.get(id);
  }

  async getUserSupportTickets(userId: number): Promise<SupportTicket[]> {
    return Array.from(this.supportTickets.values()).filter(
      (ticket) => ticket.userId === userId
    );
  }

  async getAllSupportTickets(): Promise<SupportTicket[]> {
    return Array.from(this.supportTickets.values());
  }

  async getSupportTicketsByStatus(status: string): Promise<SupportTicket[]> {
    return Array.from(this.supportTickets.values()).filter(
      (ticket) => ticket.status === status
    );
  }

  async createSupportTicket(ticket: InsertSupportTicket): Promise<SupportTicket> {
    const id = this.supportTicketIdCounter++;
    const newTicket: SupportTicket = {
      id,
      userId: ticket.userId,
      subject: ticket.subject,
      description: ticket.description,
      priority: ticket.priority || "medium",
      status: ticket.status || "new",
      category: ticket.category,
      channel: ticket.channel || "in_app",
      propertyId: ticket.propertyId || null,
      investmentId: ticket.investmentId || null,
      assignedToUserId: ticket.assignedToUserId || null,
      createdAt: new Date(),
      updatedAt: new Date(),
      resolvedAt: null
    };
    this.supportTickets.set(id, newTicket);
    return newTicket;
  }

  async updateSupportTicket(id: number, ticketData: Partial<InsertSupportTicket> & { status?: string }): Promise<SupportTicket | undefined> {
    const ticket = await this.getSupportTicket(id);
    if (!ticket) return undefined;
    
    // Check if we're resolving the ticket
    let resolvedAt = ticket.resolvedAt;
    if (ticketData.status === "resolved" && ticket.status !== "resolved") {
      resolvedAt = new Date();
    }

    const updatedTicket: SupportTicket = {
      ...ticket,
      ...ticketData,
      id: ticket.id,
      createdAt: ticket.createdAt,
      updatedAt: new Date(),
      resolvedAt: resolvedAt
    };
    
    this.supportTickets.set(id, updatedTicket);
    return updatedTicket;
  }

  async deleteSupportTicket(id: number): Promise<boolean> {
    // First delete all associated messages
    const messages = await this.getSupportMessages(id);
    for (const message of messages) {
      this.supportMessages.delete(message.id);
    }
    
    return this.supportTickets.delete(id);
  }

  async getSupportMessages(ticketId: number): Promise<SupportMessage[]> {
    return Array.from(this.supportMessages.values())
      .filter(message => message.ticketId === ticketId)
      .sort((a, b) => (a.createdAt?.getTime() || 0) - (b.createdAt?.getTime() || 0));
  }

  async createSupportMessage(message: InsertSupportMessage): Promise<SupportMessage> {
    const id = this.supportMessageIdCounter++;
    const newMessage: SupportMessage = {
      id,
      ticketId: message.ticketId,
      userId: message.userId,
      content: message.content,
      isFromStaff: message.isFromStaff || false,
      attachmentUrl: message.attachmentUrl || null,
      createdAt: new Date()
    };
    
    this.supportMessages.set(id, newMessage);
    
    // Update the ticket status if needed (reopening a closed ticket)
    const ticket = await this.getSupportTicket(message.ticketId);
    if (ticket && (ticket.status === "closed" || ticket.status === "resolved")) {
      await this.updateSupportTicket(ticket.id, { status: "open" });
    }
    
    return newMessage;
  }

  async getSupportFaqs(category?: string): Promise<SupportFaq[]> {
    let faqs = Array.from(this.supportFaqs.values())
      .filter(faq => faq.isPublished)
      .sort((a, b) => (a.order || 0) - (b.order || 0));
    
    if (category) {
      faqs = faqs.filter(faq => faq.category === category);
    }
    
    return faqs;
  }
  
  async getSupportFaq(id: number): Promise<SupportFaq | undefined> {
    return this.supportFaqs.get(id);
  }

  async createSupportFaq(faq: InsertSupportFaq): Promise<SupportFaq> {
    const id = this.supportFaqIdCounter++;
    const newFaq: SupportFaq = {
      id,
      question: faq.question,
      answer: faq.answer,
      category: faq.category,
      order: faq.order || 0,
      isPublished: faq.isPublished !== undefined ? faq.isPublished : true,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    this.supportFaqs.set(id, newFaq);
    return newFaq;
  }

  async updateSupportFaq(id: number, faqData: Partial<InsertSupportFaq>): Promise<SupportFaq | undefined> {
    const faq = this.supportFaqs.get(id);
    if (!faq) return undefined;
    
    const updatedFaq: SupportFaq = {
      ...faq,
      ...faqData,
      id: faq.id,
      createdAt: faq.createdAt,
      updatedAt: new Date()
    };
    
    this.supportFaqs.set(id, updatedFaq);
    return updatedFaq;
  }

  async deleteSupportFaq(id: number): Promise<boolean> {
    return this.supportFaqs.delete(id);
  }

  // Seed properties
  private seedProperties() {
    const properties: Omit<Property, 'id'>[] = [
      {
        name: "Premium Abuja Land",
        location: "Abuja",
        description: "Prime land investment opportunity in a rapidly developing area of Abuja. This 2-hectare plot offers excellent potential for residential or commercial development with all necessary approvals in place. Located in a strategic growth corridor with strong appreciation potential.",
        type: "land",
        imageUrl: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
        additionalImages: JSON.stringify([
          "https://images.unsplash.com/photo-1554254648-2d58a1bc3fd5?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
          "https://images.unsplash.com/photo-1543872084-c7bd3822856f?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
          "https://images.unsplash.com/photo-1504681869696-d977211a5db4?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
          "https://images.unsplash.com/photo-1532404943945-2c8496bat5ff?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"
        ]),
        videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
        virtualTourUrl: "https://my.matterport.com/show/?m=YAG8dwjKqDV",
        
        // Financial details
        targetReturn: "15.5",
        minimumInvestment: 500000,
        term: 48,
        totalFunding: 10000000,
        currentFunding: 7500000,
        
        // Project metrics
        numberOfInvestors: 45,
        size: "20000 sq m",
        builtYear: "N/A",
        occupancy: "N/A",
        cashFlow: "N/A",
        daysLeft: 15,
        
        // Detailed location information
        address: "Phase 4, Jabi District",
        city: "Abuja",
        state: "FCT",
        zipCode: "900108",
        latitude: "9.0765",
        longitude: "7.3986",
        neighborhoodDescription: "Located in a rapidly developing district with new infrastructure projects, commercial centers, and residential developments in progress.",
        
        // Developer/Sponsor information
        developerName: "Terra Developers Ltd",
        developerDescription: "Terra Developers Ltd is a leading land development company in Nigeria with over 15 years of experience in property acquisition and development.",
        developerLogoUrl: "https://randomuser.me/api/portraits/men/42.jpg",
        
        // Project timeline
        acquisitionDate: new Date("2023-10-15"),
        constructionStartDate: new Date("2024-03-01"),
        estimatedCompletionDate: new Date("2025-04-30"),
        
        // Due diligence
        documentUrls: JSON.stringify([
          "https://example.com/landsurvey.pdf",
          "https://example.com/approvals.pdf",
          "https://example.com/title.pdf"
        ]),
        riskRating: "medium",
        riskDescription: "Land investments in developing areas carry moderate risk, with potential for delays in infrastructure development and market fluctuations.",
        
        // Detailed financial projections
        projectedIrr: "18.5",
        projectedCashYield: "0",
        projectedAppreciation: "20.5",
        projectedTotalReturn: "39.0",
        
        // Property features & amenities
        features: JSON.stringify([
          "Prime location",
          "All approvals and permits in place",
          "Clear title",
          "Access to utilities",
          "Strategic growth area"
        ]),
        amenities: JSON.stringify([
          "Nearby shopping centers",
          "Proximity to schools",
          "Access to public transportation",
          "Well-developed road network"
        ])
      },
      {
        name: "Skyline Apartments",
        location: "Lagos",
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
        cashFlow: "₦45,000,000/year",
        daysLeft: 28,
        
        // Detailed location information
        address: "123 High Rise Avenue",
        city: "Lagos",
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
        location: "Abuja",
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
        cashFlow: "₦78,000,000/year",
        daysLeft: 45,
        
        // Detailed location information
        address: "456 Retail Row",
        city: "Abuja",
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
        location: "Lagos",
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
        cashFlow: "₦110,000,000/year",
        daysLeft: 60
      },
      {
        name: "Ocean View Residences",
        location: "Abuja",
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
        cashFlow: "₦250,000,000/year",
        daysLeft: 15
      },
      {
        name: "Tech Hub Offices",
        location: "Lagos",
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
        cashFlow: "₦180,000,000/year",
        daysLeft: 30
      },
      {
        name: "Urban Village",
        location: "Abuja",
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
        cashFlow: "₦140,000,000/year",
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
