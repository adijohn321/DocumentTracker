import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import multer from "multer";
import path from "path";
import { randomBytes } from "crypto";
import fs from "fs";
import { 
  insertDepartmentSchema, 
  insertDocumentTypeSchema, 
  insertDocumentSchema,
  insertDocumentHistorySchema
} from "@shared/schema";

// Configure multer for file uploads
const storage_dir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(storage_dir)) {
  fs.mkdirSync(storage_dir, { recursive: true });
}

const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, storage_dir);
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = `${Date.now()}-${randomBytes(8).toString("hex")}`;
      cb(null, `${uniqueSuffix}-${file.originalname}`);
    },
  }),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Simple test endpoint that doesn't require auth
  app.get("/api/test", (req, res) => {
    res.json({ message: "API is working!" });
  });
  
  // Set up authentication routes and get the requireAuth middleware
  const { requireAuth } = setupAuth(app);
  
  // Department routes
  app.get("/api/departments", async (req, res) => {
    try {
      const departments = await storage.getAllDepartments();
      res.json(departments);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch departments" });
    }
  });
  
  app.get("/api/departments/:id", async (req, res) => {
    try {
      const departmentId = parseInt(req.params.id);
      const department = await storage.getDepartment(departmentId);
      
      if (!department) {
        return res.status(404).json({ message: "Department not found" });
      }
      
      res.json(department);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch department" });
    }
  });
  
  app.post("/api/departments", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const parseResult = insertDepartmentSchema.safeParse(req.body);
      if (!parseResult.success) {
        return res.status(400).json({ message: "Invalid department data", errors: parseResult.error.errors });
      }
      
      const department = await storage.createDepartment(parseResult.data);
      res.status(201).json(department);
    } catch (error) {
      res.status(500).json({ message: "Failed to create department" });
    }
  });
  
  // Document Type routes
  app.get("/api/document-types", async (req, res) => {
    try {
      const documentTypes = await storage.getAllDocumentTypes();
      res.json(documentTypes);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch document types" });
    }
  });
  
  app.get("/api/document-types/:id", async (req, res) => {
    try {
      const documentTypeId = parseInt(req.params.id);
      const documentType = await storage.getDocumentType(documentTypeId);
      
      if (!documentType) {
        return res.status(404).json({ message: "Document type not found" });
      }
      
      res.json(documentType);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch document type" });
    }
  });
  
  app.post("/api/document-types", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const parseResult = insertDocumentTypeSchema.safeParse({
        ...req.body,
        createdBy: req.user.id
      });
      
      if (!parseResult.success) {
        return res.status(400).json({ message: "Invalid document type data", errors: parseResult.error.errors });
      }
      
      const documentType = await storage.createDocumentType(parseResult.data);
      res.status(201).json(documentType);
    } catch (error) {
      res.status(500).json({ message: "Failed to create document type" });
    }
  });
  
  // Document routes
  app.get("/api/documents", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const status = req.query.status as string | undefined;
      const department = req.query.department ? parseInt(req.query.department as string) : undefined;
      
      let documents;
      
      if (status) {
        documents = await storage.getDocumentsByStatus(status);
      } else if (department) {
        documents = await storage.getDocumentsByDepartment(department);
      } else {
        documents = await storage.getAllDocuments();
      }
      
      res.json(documents);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch documents" });
    }
  });
  
  app.get("/api/documents/recent", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 5;
      const documents = await storage.getRecentDocuments(limit);
      
      // Enrich documents with department names
      const enrichedDocuments = await Promise.all(
        documents.map(async (doc) => {
          const department = doc.currentDepartmentId 
            ? await storage.getDepartment(doc.currentDepartmentId)
            : undefined;
          
          const documentType = doc.documentTypeId
            ? await storage.getDocumentType(doc.documentTypeId)
            : undefined;
          
          return {
            ...doc,
            departmentName: department?.name || "Unassigned",
            documentTypeName: documentType?.name || "Unknown"
          };
        })
      );
      
      res.json(enrichedDocuments);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch recent documents" });
    }
  });
  
  app.get("/api/documents/:id", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const documentId = parseInt(req.params.id);
      const document = await storage.getDocument(documentId);
      
      if (!document) {
        return res.status(404).json({ message: "Document not found" });
      }
      
      // Get related entities
      const department = document.currentDepartmentId 
        ? await storage.getDepartment(document.currentDepartmentId)
        : undefined;
      
      const documentType = document.documentTypeId
        ? await storage.getDocumentType(document.documentTypeId)
        : undefined;
      
      const creator = document.createdBy
        ? await storage.getUser(document.createdBy)
        : undefined;
      
      // Don't send password in the response
      const creatorWithoutPassword = creator 
        ? { ...creator, password: undefined }
        : undefined;
      
      const enrichedDocument = {
        ...document,
        department,
        documentType,
        creator: creatorWithoutPassword
      };
      
      res.json(enrichedDocument);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch document" });
    }
  });
  
  app.post("/api/documents/upload", upload.single("file"), async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }
      
      // Return the file path
      res.status(201).json({ filePath: req.file.path });
    } catch (error) {
      res.status(500).json({ message: "Failed to upload file" });
    }
  });
  
  app.post("/api/documents", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      // Generate a unique document ID
      const documentPrefix = req.body.documentTypeId 
        ? (await storage.getDocumentType(req.body.documentTypeId))?.name?.substring(0, 3).toUpperCase() || "DOC"
        : "DOC";
      
      const year = new Date().getFullYear();
      const random = Math.floor(1000 + Math.random() * 9000);
      const documentId = `${documentPrefix}-${year}-${random}`;
      
      const parseResult = insertDocumentSchema.safeParse({
        ...req.body,
        documentId,
        createdBy: req.user.id
      });
      
      if (!parseResult.success) {
        return res.status(400).json({ message: "Invalid document data", errors: parseResult.error.errors });
      }
      
      const document = await storage.createDocument(parseResult.data);
      
      // Add initial history record if the document has a department
      if (document.currentDepartmentId) {
        await storage.addDocumentHistory({
          documentId: document.id,
          fromDepartmentId: null,
          toDepartmentId: document.currentDepartmentId,
          statusChange: document.status,
          notes: "Document created",
          changedBy: req.user.id
        });
      }
      
      res.status(201).json(document);
    } catch (error) {
      res.status(500).json({ message: "Failed to create document" });
    }
  });
  
  app.put("/api/documents/:id", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const documentId = parseInt(req.params.id);
      const document = await storage.getDocument(documentId);
      
      if (!document) {
        return res.status(404).json({ message: "Document not found" });
      }
      
      // Record history if department or status is changing
      if (
        (req.body.currentDepartmentId && req.body.currentDepartmentId !== document.currentDepartmentId) ||
        (req.body.status && req.body.status !== document.status)
      ) {
        const historyEntry = {
          documentId: document.id,
          fromDepartmentId: document.currentDepartmentId,
          toDepartmentId: req.body.currentDepartmentId || document.currentDepartmentId,
          statusChange: req.body.status || document.status,
          notes: req.body.notes || "Document updated",
          changedBy: req.user.id
        };
        
        const parseHistoryResult = insertDocumentHistorySchema.safeParse(historyEntry);
        if (parseHistoryResult.success) {
          await storage.addDocumentHistory(parseHistoryResult.data);
        }
      }
      
      const updatedDocument = await storage.updateDocument(documentId, req.body);
      res.json(updatedDocument);
    } catch (error) {
      res.status(500).json({ message: "Failed to update document" });
    }
  });
  
  app.get("/api/documents/:id/history", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const documentId = parseInt(req.params.id);
      const document = await storage.getDocument(documentId);
      
      if (!document) {
        return res.status(404).json({ message: "Document not found" });
      }
      
      const history = await storage.getDocumentHistory(documentId);
      
      // Enrich history with department and user names
      const enrichedHistory = await Promise.all(
        history.map(async (entry) => {
          const fromDepartment = entry.fromDepartmentId 
            ? await storage.getDepartment(entry.fromDepartmentId)
            : undefined;
          
          const toDepartment = entry.toDepartmentId
            ? await storage.getDepartment(entry.toDepartmentId)
            : undefined;
          
          const changedByUser = entry.changedBy
            ? await storage.getUser(entry.changedBy)
            : undefined;
          
          return {
            ...entry,
            fromDepartmentName: fromDepartment?.name || "None",
            toDepartmentName: toDepartment?.name || "None",
            changedByName: changedByUser?.name || "Unknown"
          };
        })
      );
      
      res.json(enrichedHistory);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch document history" });
    }
  });
  
  // Analytics routes
  app.get("/api/analytics/dashboard", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const stats = await storage.getDashboardStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch dashboard statistics" });
    }
  });
  
  app.get("/api/analytics/departments", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const metrics = await storage.getDocumentsByDepartment();
      res.json(metrics);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch department metrics" });
    }
  });
  
  app.get("/api/analytics/processing-time", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const metrics = await storage.getProcessingTimeByDocumentType();
      res.json(metrics);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch processing time metrics" });
    }
  });
  
  // Document types routes
  app.get("/api/document-types", async (req, res) => {
    try {
      const documentTypes = await storage.getAllDocumentTypes();
      res.json(documentTypes);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch document types" });
    }
  });

  app.post("/api/document-types", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const { name, description, workflowConfig } = req.body;
      
      // Validate required fields
      if (!name) {
        return res.status(400).json({ message: "Name is required" });
      }
      
      // Create document type
      const documentType = await storage.createDocumentType({
        name,
        description: description || "",
        workflowConfig: workflowConfig ? JSON.stringify(workflowConfig) : null,
      });
      
      res.status(201).json(documentType);
    } catch (error) {
      console.error("Error creating document type:", error);
      res.status(500).json({ message: "Failed to create document type" });
    }
  });
  
  app.get("/api/document-types/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid ID" });
      }
      
      const documentType = await storage.getDocumentType(id);
      if (!documentType) {
        return res.status(404).json({ message: "Document type not found" });
      }
      
      res.json(documentType);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch document type" });
    }
  });
  
  const httpServer = createServer(app);
  return httpServer;
}
