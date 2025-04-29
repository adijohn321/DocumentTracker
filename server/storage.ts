import { users, departments, documentTypes, documents, documentHistory } from "@shared/schema";
import type { 
  User, InsertUser, 
  Department, InsertDepartment,
  DocumentType, InsertDocumentType,
  Document, InsertDocument,
  DocumentHistory, InsertDocumentHistory,
  DashboardStats, 
  DepartmentMetric,
  ProcessingTimeMetric
} from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";
import connectPg from "connect-pg-simple";
import { db } from "./db";
import { pool } from "./db";
import { eq, desc, and, sql, asc } from "drizzle-orm";

const MemoryStore = createMemoryStore(session);
const PostgresSessionStore = connectPg(session);

// Interface defining all storage operations
export interface IStorage {
  // Session store
  sessionStore: session.SessionStore;
  
  // User management
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Department management
  getDepartment(id: number): Promise<Department | undefined>;
  getDepartmentByName(name: string): Promise<Department | undefined>;
  getAllDepartments(): Promise<Department[]>;
  createDepartment(department: InsertDepartment): Promise<Department>;
  
  // Document type management
  getDocumentType(id: number): Promise<DocumentType | undefined>;
  getDocumentTypeByName(name: string): Promise<DocumentType | undefined>;
  getAllDocumentTypes(): Promise<DocumentType[]>;
  createDocumentType(documentType: InsertDocumentType): Promise<DocumentType>;
  
  // Document management
  getDocument(id: number): Promise<Document | undefined>;
  getDocumentByDocumentId(documentId: string): Promise<Document | undefined>;
  getDocumentsByStatus(status: string): Promise<Document[]>;
  getDocumentsByCreator(userId: number): Promise<Document[]>;
  getDocumentsByDepartment(departmentId: number): Promise<Document[]>;
  getAllDocuments(): Promise<Document[]>;
  getRecentDocuments(limit: number): Promise<Document[]>;
  createDocument(document: InsertDocument): Promise<Document>;
  updateDocument(id: number, updates: Partial<Document>): Promise<Document | undefined>;
  
  // Document history management
  getDocumentHistory(documentId: number): Promise<DocumentHistory[]>;
  addDocumentHistory(history: InsertDocumentHistory): Promise<DocumentHistory>;
  
  // Analytics and metrics
  getDashboardStats(): Promise<DashboardStats>;
  getDocumentsByDepartment(): Promise<DepartmentMetric[]>;
  getProcessingTimeByDocumentType(): Promise<ProcessingTimeMetric[]>;
}

// In-memory implementation of the storage interface
export class MemStorage implements IStorage {
  private usersMap: Map<number, User>;
  private departmentsMap: Map<number, Department>;
  private documentTypesMap: Map<number, DocumentType>;
  private documentsMap: Map<number, Document>;
  private documentHistoryMap: Map<number, DocumentHistory>;
  
  public sessionStore: session.SessionStore;
  
  private userId: number;
  private departmentId: number;
  private documentTypeId: number;
  private documentId: number;
  private historyId: number;
  
  constructor() {
    this.usersMap = new Map();
    this.departmentsMap = new Map();
    this.documentTypesMap = new Map();
    this.documentsMap = new Map();
    this.documentHistoryMap = new Map();
    
    this.userId = 1;
    this.departmentId = 1;
    this.documentTypeId = 1;
    this.documentId = 1;
    this.historyId = 1;
    
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000 // Clear expired sessions every 24h
    });
    
    // Initialize with some departments
    this.initializeDepartments();
  }
  
  private initializeDepartments() {
    const departments = [
      { name: "Reception", description: "Document registration and initial processing" },
      { name: "Cardiology", description: "Medical review and processing for cardiac patients" },
      { name: "Laboratory", description: "Lab tests and results processing" },
      { name: "Pharmacy", description: "Medication orders and dispensing" },
      { name: "Radiology", description: "Imaging studies and reports" },
      { name: "Nursing", description: "Patient care coordination" },
      { name: "Administration", description: "Final approval and document archiving" }
    ];
    
    departments.forEach(dept => {
      this.createDepartment(dept);
    });
  }
  
  // User management methods
  async getUser(id: number): Promise<User | undefined> {
    return this.usersMap.get(id);
  }
  
  async getUserByUsername(username: string): Promise<User | undefined> {
    for (const user of this.usersMap.values()) {
      if (user.username === username) {
        return user;
      }
    }
    return undefined;
  }
  
  async createUser(user: InsertUser): Promise<User> {
    const id = this.userId++;
    const newUser: User = { ...user, id, createdAt: new Date() };
    this.usersMap.set(id, newUser);
    return newUser;
  }
  
  // Department management methods
  async getDepartment(id: number): Promise<Department | undefined> {
    return this.departmentsMap.get(id);
  }
  
  async getDepartmentByName(name: string): Promise<Department | undefined> {
    for (const department of this.departmentsMap.values()) {
      if (department.name === name) {
        return department;
      }
    }
    return undefined;
  }
  
  async getAllDepartments(): Promise<Department[]> {
    return Array.from(this.departmentsMap.values());
  }
  
  async createDepartment(department: InsertDepartment): Promise<Department> {
    const id = this.departmentId++;
    const newDepartment: Department = { ...department, id, createdAt: new Date() };
    this.departmentsMap.set(id, newDepartment);
    return newDepartment;
  }
  
  // Document type management methods
  async getDocumentType(id: number): Promise<DocumentType | undefined> {
    return this.documentTypesMap.get(id);
  }
  
  async getDocumentTypeByName(name: string): Promise<DocumentType | undefined> {
    for (const documentType of this.documentTypesMap.values()) {
      if (documentType.name === name) {
        return documentType;
      }
    }
    return undefined;
  }
  
  async getAllDocumentTypes(): Promise<DocumentType[]> {
    return Array.from(this.documentTypesMap.values());
  }
  
  async createDocumentType(documentType: InsertDocumentType): Promise<DocumentType> {
    const id = this.documentTypeId++;
    const newDocumentType: DocumentType = { ...documentType, id, createdAt: new Date() };
    this.documentTypesMap.set(id, newDocumentType);
    return newDocumentType;
  }
  
  // Document management methods
  async getDocument(id: number): Promise<Document | undefined> {
    return this.documentsMap.get(id);
  }
  
  async getDocumentByDocumentId(documentId: string): Promise<Document | undefined> {
    for (const document of this.documentsMap.values()) {
      if (document.documentId === documentId) {
        return document;
      }
    }
    return undefined;
  }
  
  async getDocumentsByStatus(status: string): Promise<Document[]> {
    return Array.from(this.documentsMap.values()).filter(doc => doc.status === status);
  }
  
  async getDocumentsByCreator(userId: number): Promise<Document[]> {
    return Array.from(this.documentsMap.values()).filter(doc => doc.createdBy === userId);
  }
  
  async getDocumentsByDepartment(departmentId: number): Promise<Document[]> {
    return Array.from(this.documentsMap.values()).filter(doc => doc.currentDepartmentId === departmentId);
  }
  
  async getAllDocuments(): Promise<Document[]> {
    return Array.from(this.documentsMap.values());
  }
  
  async getRecentDocuments(limit: number): Promise<Document[]> {
    return Array.from(this.documentsMap.values())
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, limit);
  }
  
  async createDocument(document: InsertDocument): Promise<Document> {
    const id = this.documentId++;
    const now = new Date();
    const newDocument: Document = { 
      ...document, 
      id, 
      createdAt: now,
      updatedAt: now
    };
    this.documentsMap.set(id, newDocument);
    return newDocument;
  }
  
  async updateDocument(id: number, updates: Partial<Document>): Promise<Document | undefined> {
    const document = this.documentsMap.get(id);
    if (!document) {
      return undefined;
    }
    
    const updatedDocument: Document = { 
      ...document, 
      ...updates,
      updatedAt: new Date()
    };
    this.documentsMap.set(id, updatedDocument);
    return updatedDocument;
  }
  
  // Document history management methods
  async getDocumentHistory(documentId: number): Promise<DocumentHistory[]> {
    return Array.from(this.documentHistoryMap.values())
      .filter(history => history.documentId === documentId)
      .sort((a, b) => b.changedAt.getTime() - a.changedAt.getTime());
  }
  
  async addDocumentHistory(history: InsertDocumentHistory): Promise<DocumentHistory> {
    const id = this.historyId++;
    const newHistory: DocumentHistory = { ...history, id, changedAt: new Date() };
    this.documentHistoryMap.set(id, newHistory);
    return newHistory;
  }
  
  // Analytics and metrics methods
  async getDashboardStats(): Promise<DashboardStats> {
    const allDocs = Array.from(this.documentsMap.values());
    const activeDocs = allDocs.filter(doc => doc.status === 'in_progress');
    
    // Calculate average processing time (mock data for now)
    const avgProcessingHours = allDocs.length > 0 ? 4.2 : 0;
    
    // Count pending approvals
    const pendingApprovals = allDocs.filter(doc => doc.status === 'pending').length;
    
    return {
      totalDocuments: allDocs.length,
      activeDocuments: activeDocs.length,
      avgProcessingTime: `${avgProcessingHours.toFixed(1)} hrs`,
      pendingApprovals
    };
  }
  
  async getDocumentsByDepartment(): Promise<DepartmentMetric[]> {
    const metrics: DepartmentMetric[] = [];
    const departments = await this.getAllDepartments();
    
    for (const department of departments) {
      const count = (await this.getDocumentsByDepartment(department.id)).length;
      metrics.push({
        departmentId: department.id,
        departmentName: department.name,
        count
      });
    }
    
    return metrics;
  }
  
  async getProcessingTimeByDocumentType(): Promise<ProcessingTimeMetric[]> {
    const metrics: ProcessingTimeMetric[] = [];
    const documentTypes = await this.getAllDocumentTypes();
    
    // Mock data for now - would calculate from actual processing times
    for (const docType of documentTypes) {
      metrics.push({
        documentTypeId: docType.id,
        documentTypeName: docType.name,
        avgProcessingTime: Math.floor(Math.random() * 10) + 1 // Random 1-10 hours
      });
    }
    
    return metrics;
  }
}

// Database implementation of the storage interface
export class DatabaseStorage implements IStorage {
  public sessionStore: session.SessionStore;

  constructor() {
    this.sessionStore = new PostgresSessionStore({ 
      pool, 
      createTableIfMissing: true 
    });
    
    // Initialize with default departments if none exist
    this.initializeDepartments();
  }
  
  private async initializeDepartments() {
    const existingDepartments = await this.getAllDepartments();
    
    if (existingDepartments.length === 0) {
      const departmentsList = [
        { name: "Reception", description: "Document receiving and initial processing" },
        { name: "Medical Records", description: "Patient records management" },
        { name: "Finance", description: "Financial documents and billing" },
        { name: "Administration", description: "Hospital administration documents" },
        { name: "Laboratory", description: "Lab test results and documentation" },
        { name: "Pharmacy", description: "Medication orders and inventory" },
        { name: "Radiology", description: "Imaging reports and documentation" },
      ];
      
      for (const dept of departmentsList) {
        await this.createDepartment(dept);
      }
    }
  }

  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(user: InsertUser): Promise<User> {
    const [newUser] = await db.insert(users).values(user).returning();
    return newUser;
  }

  async getDepartment(id: number): Promise<Department | undefined> {
    const [department] = await db.select().from(departments).where(eq(departments.id, id));
    return department;
  }

  async getDepartmentByName(name: string): Promise<Department | undefined> {
    const [department] = await db.select().from(departments).where(eq(departments.name, name));
    return department;
  }

  async getAllDepartments(): Promise<Department[]> {
    return await db.select().from(departments);
  }

  async createDepartment(department: InsertDepartment): Promise<Department> {
    const [newDepartment] = await db.insert(departments).values(department).returning();
    return newDepartment;
  }

  async getDocumentType(id: number): Promise<DocumentType | undefined> {
    const [documentType] = await db.select().from(documentTypes).where(eq(documentTypes.id, id));
    return documentType;
  }

  async getDocumentTypeByName(name: string): Promise<DocumentType | undefined> {
    const [documentType] = await db.select().from(documentTypes).where(eq(documentTypes.name, name));
    return documentType;
  }

  async getAllDocumentTypes(): Promise<DocumentType[]> {
    return await db.select().from(documentTypes);
  }

  async createDocumentType(documentType: InsertDocumentType): Promise<DocumentType> {
    const [newDocumentType] = await db.insert(documentTypes).values(documentType).returning();
    return newDocumentType;
  }

  async getDocument(id: number): Promise<Document | undefined> {
    const [document] = await db.select().from(documents).where(eq(documents.id, id));
    return document;
  }

  async getDocumentByDocumentId(documentId: string): Promise<Document | undefined> {
    const [document] = await db.select().from(documents).where(eq(documents.documentId, documentId));
    return document;
  }

  async getDocumentsByStatus(status: string): Promise<Document[]> {
    return await db.select().from(documents).where(eq(documents.status, status));
  }

  async getDocumentsByCreator(userId: number): Promise<Document[]> {
    return await db.select().from(documents).where(eq(documents.createdBy, userId));
  }

  async getDocumentsByDepartment(departmentId: number): Promise<Document[]> {
    return await db.select().from(documents).where(eq(documents.departmentId, departmentId));
  }

  async getAllDocuments(): Promise<Document[]> {
    return await db.select().from(documents);
  }

  async getRecentDocuments(limit: number): Promise<Document[]> {
    return await db.select()
      .from(documents)
      .orderBy(desc(documents.createdAt))
      .limit(limit);
  }

  async createDocument(document: InsertDocument): Promise<Document> {
    const [newDocument] = await db.insert(documents).values(document).returning();
    return newDocument;
  }

  async updateDocument(id: number, updates: Partial<Document>): Promise<Document | undefined> {
    const [updatedDocument] = await db
      .update(documents)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(documents.id, id))
      .returning();
    
    return updatedDocument;
  }

  async getDocumentHistory(documentId: number): Promise<DocumentHistory[]> {
    return await db
      .select()
      .from(documentHistory)
      .where(eq(documentHistory.documentId, documentId))
      .orderBy(desc(documentHistory.changedAt));
  }

  async addDocumentHistory(history: InsertDocumentHistory): Promise<DocumentHistory> {
    const [newHistory] = await db.insert(documentHistory).values(history).returning();
    return newHistory;
  }

  async getDashboardStats(): Promise<DashboardStats> {
    // Total documents count
    const [totalCountResult] = await db
      .select({ count: sql<number>`count(*)` })
      .from(documents);
    
    // Active documents count (not archived or completed)
    const [activeCountResult] = await db
      .select({ count: sql<number>`count(*)` })
      .from(documents)
      .where(sql`status != 'archived' AND status != 'completed'`);
    
    // Pending approvals count
    const [pendingApprovalsResult] = await db
      .select({ count: sql<number>`count(*)` })
      .from(documents)
      .where(eq(documents.status, 'pending_approval'));
    
    // Average processing time
    const [avgProcessingTimeResult] = await db
      .select({
        avgTime: sql<string>`
          CASE WHEN COUNT(*) > 0 
          THEN to_char(AVG(EXTRACT(epoch FROM ("completed_at" - "created_at")) / 86400), 'FM999990.0')
          ELSE '0'
          END
        `
      })
      .from(documents)
      .where(and(
        eq(documents.status, 'completed'),
        sql`"completed_at" IS NOT NULL`
      ));
    
    return {
      totalDocuments: totalCountResult.count || 0,
      activeDocuments: activeCountResult.count || 0,
      avgProcessingTime: avgProcessingTimeResult.avgTime || "0",
      pendingApprovals: pendingApprovalsResult.count || 0
    };
  }

  async getDocumentsByDepartment(): Promise<DepartmentMetric[]> {
    // Get all departments
    const allDepartments = await db.select().from(departments);
    
    // Count documents per department
    const departmentCounts = await db
      .select({
        departmentId: documents.departmentId,
        count: sql<number>`count(*)`
      })
      .from(documents)
      .where(sql`department_id IS NOT NULL`)
      .groupBy(documents.departmentId);
    
    // Create a map of department counts
    const countsMap = new Map<number, number>();
    departmentCounts.forEach(item => {
      countsMap.set(item.departmentId, item.count);
    });
    
    // Format results
    return allDepartments.map(dept => ({
      departmentId: dept.id,
      departmentName: dept.name,
      count: countsMap.get(dept.id) || 0
    }));
  }

  async getProcessingTimeByDocumentType(): Promise<ProcessingTimeMetric[]> {
    // Get all document types
    const allDocumentTypes = await db.select().from(documentTypes);
    
    // Calculate average processing time per document type
    const processingTimes = await db
      .select({
        documentTypeId: documents.typeId,
        avgProcessingTime: sql<number>`
          AVG(EXTRACT(epoch FROM ("completed_at" - "created_at")) / 3600)
        `
      })
      .from(documents)
      .where(and(
        eq(documents.status, 'completed'),
        sql`"completed_at" IS NOT NULL`,
        sql`"type_id" IS NOT NULL`
      ))
      .groupBy(documents.typeId);
    
    // Create a map of average processing times
    const timesMap = new Map<number, number>();
    processingTimes.forEach(item => {
      timesMap.set(item.documentTypeId, item.avgProcessingTime || 0);
    });
    
    // Format results
    return allDocumentTypes.map(type => ({
      documentTypeId: type.id,
      documentTypeName: type.name,
      avgProcessingTime: timesMap.get(type.id) || 0
    }));
  }
}

// Export an instance of the database storage implementation
export const storage = new DatabaseStorage();
