import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const chatMessages = pgTable("chat_messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  content: text("content").notNull(),
  role: text("role").notNull(), // 'user' or 'assistant'
  timestamp: timestamp("timestamp").defaultNow().notNull(),
  metadata: json("metadata"), // for storing additional AI response data
});

export const documents = pgTable("documents", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  content: json("content").notNull(), // TipTap JSON content
  lastModified: timestamp("last_modified").defaultNow().notNull(),
});

export const aiEdits = pgTable("ai_edits", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  originalText: text("original_text").notNull(),
  suggestedText: text("suggested_text").notNull(),
  operation: text("operation").notNull(), // 'shorten', 'lengthen', 'table', 'edit'
  applied: text("applied").notNull().default('pending'), // 'pending', 'applied', 'rejected'
  timestamp: timestamp("timestamp").defaultNow().notNull(),
});

export const insertChatMessageSchema = createInsertSchema(chatMessages).pick({
  content: true,
  role: true,
  metadata: true,
});

export const insertDocumentSchema = createInsertSchema(documents).pick({
  title: true,
  content: true,
});

export const insertAiEditSchema = createInsertSchema(aiEdits).pick({
  originalText: true,
  suggestedText: true,
  operation: true,
});

export type InsertChatMessage = z.infer<typeof insertChatMessageSchema>;
export type ChatMessage = typeof chatMessages.$inferSelect;

export type InsertDocument = z.infer<typeof insertDocumentSchema>;
export type Document = typeof documents.$inferSelect;

export type InsertAiEdit = z.infer<typeof insertAiEditSchema>;
export type AiEdit = typeof aiEdits.$inferSelect;
