import { type ChatMessage, type InsertChatMessage, type Document, type InsertDocument, type AiEdit, type InsertAiEdit } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // Chat messages
  getChatMessages(): Promise<ChatMessage[]>;
  addChatMessage(message: InsertChatMessage): Promise<ChatMessage>;
  clearChatHistory(): Promise<void>;

  // Documents
  getDocument(id: string): Promise<Document | undefined>;
  createDocument(document: InsertDocument): Promise<Document>;
  updateDocument(id: string, content: any): Promise<Document | undefined>;
  getDefaultDocument(): Promise<Document>;

  // AI Edits
  createAiEdit(edit: InsertAiEdit): Promise<AiEdit>;
  getAiEdit(id: string): Promise<AiEdit | undefined>;
  updateAiEditStatus(id: string, applied: string): Promise<AiEdit | undefined>;
}

export class MemStorage implements IStorage {
  private chatMessages: Map<string, ChatMessage>;
  private documents: Map<string, Document>;
  private aiEdits: Map<string, AiEdit>;
  private defaultDocumentId: string;

  constructor() {
    this.chatMessages = new Map();
    this.documents = new Map();
    this.aiEdits = new Map();
    
    // Create default document
    this.defaultDocumentId = randomUUID();
    const defaultDoc: Document = {
      id: this.defaultDocumentId,
      title: "AI Collaborative Editor Demo",
      content: {
        type: "doc",
        content: [
          {
            type: "heading",
            attrs: { level: 1 },
            content: [{ type: "text", text: "Project Proposal: AI-Powered Content Management System" }]
          },
          {
            type: "paragraph",
            content: [{ 
              type: "text", 
              text: "This document outlines our comprehensive approach to developing a next-generation content management system that leverages artificial intelligence to streamline content creation, editing, and optimization processes." 
            }]
          },
          {
            type: "heading",
            attrs: { level: 2 },
            content: [{ type: "text", text: "Executive Summary" }]
          },
          {
            type: "paragraph",
            content: [{ 
              type: "text", 
              text: "In today's digital landscape, organizations struggle with managing large volumes of content efficiently. Our proposed AI-powered CMS addresses these challenges by providing intelligent content suggestions, automated editing capabilities, and real-time collaboration features." 
            }]
          }
        ]
      },
      lastModified: new Date(),
    };
    this.documents.set(this.defaultDocumentId, defaultDoc);

    // Add initial AI welcome message
    const welcomeMessage: ChatMessage = {
      id: randomUUID(),
      content: "Hello! I'm your AI writing assistant. I can help you edit text, improve grammar, and even search for information to add to your document. How can I assist you today?",
      role: "assistant",
      timestamp: new Date(),
      metadata: null,
    };
    this.chatMessages.set(welcomeMessage.id, welcomeMessage);
  }

  async getChatMessages(): Promise<ChatMessage[]> {
    return Array.from(this.chatMessages.values()).sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
  }

  async addChatMessage(insertMessage: InsertChatMessage): Promise<ChatMessage> {
    const id = randomUUID();
    const message: ChatMessage = {
      ...insertMessage,
      id,
      timestamp: new Date(),
      metadata: insertMessage.metadata || null,
    };
    this.chatMessages.set(id, message);
    return message;
  }

  async clearChatHistory(): Promise<void> {
    this.chatMessages.clear();
  }

  async getDocument(id: string): Promise<Document | undefined> {
    return this.documents.get(id);
  }

  async createDocument(insertDocument: InsertDocument): Promise<Document> {
    const id = randomUUID();
    const document: Document = {
      ...insertDocument,
      id,
      lastModified: new Date(),
    };
    this.documents.set(id, document);
    return document;
  }

  async updateDocument(id: string, content: any): Promise<Document | undefined> {
    const document = this.documents.get(id);
    if (document) {
      const updated: Document = {
        ...document,
        content,
        lastModified: new Date(),
      };
      this.documents.set(id, updated);
      return updated;
    }
    return undefined;
  }

  async getDefaultDocument(): Promise<Document> {
    return this.documents.get(this.defaultDocumentId)!;
  }

  async createAiEdit(insertEdit: InsertAiEdit): Promise<AiEdit> {
    const id = randomUUID();
    const edit: AiEdit = {
      ...insertEdit,
      id,
      applied: 'pending',
      timestamp: new Date(),
    };
    this.aiEdits.set(id, edit);
    return edit;
  }

  async getAiEdit(id: string): Promise<AiEdit | undefined> {
    return this.aiEdits.get(id);
  }

  async updateAiEditStatus(id: string, applied: string): Promise<AiEdit | undefined> {
    const edit = this.aiEdits.get(id);
    if (edit) {
      const updated: AiEdit = {
        ...edit,
        applied,
      };
      this.aiEdits.set(id, updated);
      return updated;
    }
    return undefined;
  }
}

export const storage = new MemStorage();
