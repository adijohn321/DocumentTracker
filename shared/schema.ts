import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  department: text("department"),
  role: text("role").default("user"),
  createdAt: timestamp("created_at").defaultNow()
});

// Departments table
export const departments = pgTable("departments", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow()
});

// Document Types table
export const documentTypes = pgTable("document_types", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  description: text("description"),
  workflow: jsonb("workflow").notNull(),
  strictMode: boolean("strict_mode").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  createdBy: integer("created_by").references(() => users.id)
});

// Documents table
export const documents = pgTable("documents", {
  id: serial("id").primaryKey(),
  documentId: text("document_id").notNull().unique(), // External ID (e.g., PTR-2023-0587)
  title: text("title").notNull(),
  content: text("content"),
  filePath: text("file_path"),
  documentTypeId: integer("document_type_id").references(() => documentTypes.id),
  currentDepartmentId: integer("current_department_id").references(() => departments.id),
  status: text("status").default("pending"), // pending, in_progress, completed, rejected
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  createdBy: integer("created_by").references(() => users.id)
});

// Document History table
export const documentHistory = pgTable("document_history", {
  id: serial("id").primaryKey(),
  documentId: integer("document_id").references(() => documents.id),
  fromDepartmentId: integer("from_department_id").references(() => departments.id),
  toDepartmentId: integer("to_department_id").references(() => departments.id),
  statusChange: text("status_change"),
  notes: text("notes"),
  changedBy: integer("changed_by").references(() => users.id),
  changedAt: timestamp("changed_at").defaultNow()
});

// Schemas for inserting data
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  name: true,
  email: true,
  department: true,
  role: true
});

export const insertDepartmentSchema = createInsertSchema(departments).pick({
  name: true,
  description: true
});

export const insertDocumentTypeSchema = createInsertSchema(documentTypes).pick({
  name: true,
  description: true,
  workflow: true,
  strictMode: true,
  createdBy: true
});

export const insertDocumentSchema = createInsertSchema(documents).pick({
  documentId: true,
  title: true,
  content: true,
  filePath: true,
  documentTypeId: true,
  currentDepartmentId: true,
  status: true,
  createdBy: true
});

export const insertDocumentHistorySchema = createInsertSchema(documentHistory).pick({
  documentId: true,
  fromDepartmentId: true,
  toDepartmentId: true,
  statusChange: true,
  notes: true,
  changedBy: true
});

// Types based on schemas
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertDepartment = z.infer<typeof insertDepartmentSchema>;
export type Department = typeof departments.$inferSelect;

export type InsertDocumentType = z.infer<typeof insertDocumentTypeSchema>;
export type DocumentType = typeof documentTypes.$inferSelect;

export type InsertDocument = z.infer<typeof insertDocumentSchema>;
export type Document = typeof documents.$inferSelect;

export type InsertDocumentHistory = z.infer<typeof insertDocumentHistorySchema>;
export type DocumentHistory = typeof documentHistory.$inferSelect;

// Custom types for the frontend
export type DocumentWithRelations = Document & {
  type?: DocumentType;
  department?: Department;
  creator?: User;
};

export type DocumentWorkflowStep = {
  departmentId: number;
  name: string;
  description?: string;
  order: number;
  isOptional: boolean;
};

export type WorkflowConfiguration = {
  steps: DocumentWorkflowStep[];
  allowSkip: boolean;
};

export type DashboardStats = {
  totalDocuments: number;
  activeDocuments: number;
  avgProcessingTime: string;
  pendingApprovals: number;
};

export type PerformanceMetric = {
  name: string;
  value: number;
};

export type DepartmentMetric = {
  departmentId: number;
  departmentName: string;
  count: number;
};

export type ProcessingTimeMetric = {
  documentTypeId: number;
  documentTypeName: string;
  avgProcessingTime: number;
};
