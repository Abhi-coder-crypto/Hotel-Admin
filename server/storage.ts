import { type User, type InsertUser, type ServiceRequest, type InsertServiceRequest } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  createServiceRequest(request: InsertServiceRequest): Promise<ServiceRequest>;
  getServiceRequests(): Promise<ServiceRequest[]>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private serviceRequests: Map<string, ServiceRequest>;

  constructor() {
    this.users = new Map();
    this.serviceRequests = new Map();
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async createServiceRequest(insertRequest: InsertServiceRequest): Promise<ServiceRequest> {
    const id = randomUUID();
    const serviceRequest: ServiceRequest = { 
      ...insertRequest, 
      id, 
      notes: insertRequest.notes || null,
      createdAt: new Date()
    };
    this.serviceRequests.set(id, serviceRequest);
    return serviceRequest;
  }

  async getServiceRequests(): Promise<ServiceRequest[]> {
    return Array.from(this.serviceRequests.values());
  }
}

export const storage = new MemStorage();
