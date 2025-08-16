import {
  users,
  hotels,
  customers,
  serviceRequests,
  type User,
  type UpsertUser,
  type Hotel,
  type InsertHotel,
  type Customer,
  type InsertCustomer,
  type ServiceRequest,
  type InsertServiceRequest,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, count, sql } from "drizzle-orm";

// Interface for storage operations
export interface IStorage {
  // User operations (IMPORTANT: mandatory for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Hotel operations
  getUserHotel(userId: string): Promise<Hotel | undefined>;
  createHotel(hotel: InsertHotel): Promise<Hotel>;
  updateHotel(id: string, data: Partial<InsertHotel>): Promise<Hotel>;
  
  // Customer operations
  getCustomers(hotelId: string): Promise<Customer[]>;
  getCustomer(id: string): Promise<Customer | undefined>;
  createCustomer(customer: InsertCustomer): Promise<Customer>;
  updateCustomer(id: string, data: Partial<InsertCustomer>): Promise<Customer>;
  deleteCustomer(id: string): Promise<void>;
  
  // Service request operations
  getServiceRequests(hotelId: string): Promise<ServiceRequest[]>;
  getServiceRequest(id: string): Promise<ServiceRequest | undefined>;
  createServiceRequest(request: InsertServiceRequest): Promise<ServiceRequest>;
  updateServiceRequest(id: string, data: Partial<InsertServiceRequest>): Promise<ServiceRequest>;
  
  // Analytics
  getHotelStats(hotelId: string): Promise<{
    totalCustomers: number;
    activeCustomers: number;
    pendingRequests: number;
    occupancyRate: number;
  }>;
}

export class DatabaseStorage implements IStorage {
  // User operations (IMPORTANT: mandatory for Replit Auth)
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Hotel operations
  async getUserHotel(userId: string): Promise<Hotel | undefined> {
    const [hotel] = await db.select().from(hotels).where(eq(hotels.ownerId, userId));
    return hotel;
  }

  async createHotel(hotel: InsertHotel): Promise<Hotel> {
    const [newHotel] = await db.insert(hotels).values(hotel).returning();
    return newHotel;
  }

  async updateHotel(id: string, data: Partial<InsertHotel>): Promise<Hotel> {
    const [hotel] = await db
      .update(hotels)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(hotels.id, id))
      .returning();
    return hotel;
  }

  // Customer operations
  async getCustomers(hotelId: string): Promise<Customer[]> {
    return await db
      .select()
      .from(customers)
      .where(eq(customers.hotelId, hotelId))
      .orderBy(desc(customers.createdAt));
  }

  async getCustomer(id: string): Promise<Customer | undefined> {
    const [customer] = await db.select().from(customers).where(eq(customers.id, id));
    return customer;
  }

  async createCustomer(customer: InsertCustomer): Promise<Customer> {
    const [newCustomer] = await db.insert(customers).values(customer).returning();
    return newCustomer;
  }

  async updateCustomer(id: string, data: Partial<InsertCustomer>): Promise<Customer> {
    const [customer] = await db
      .update(customers)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(customers.id, id))
      .returning();
    return customer;
  }

  async deleteCustomer(id: string): Promise<void> {
    await db.delete(customers).where(eq(customers.id, id));
  }

  // Service request operations
  async getServiceRequests(hotelId: string): Promise<ServiceRequest[]> {
    return await db
      .select()
      .from(serviceRequests)
      .where(eq(serviceRequests.hotelId, hotelId))
      .orderBy(desc(serviceRequests.requestedAt));
  }

  async getServiceRequest(id: string): Promise<ServiceRequest | undefined> {
    const [request] = await db.select().from(serviceRequests).where(eq(serviceRequests.id, id));
    return request;
  }

  async createServiceRequest(request: InsertServiceRequest): Promise<ServiceRequest> {
    const [newRequest] = await db.insert(serviceRequests).values(request).returning();
    return newRequest;
  }

  async updateServiceRequest(id: string, data: Partial<InsertServiceRequest>): Promise<ServiceRequest> {
    const [request] = await db
      .update(serviceRequests)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(serviceRequests.id, id))
      .returning();
    return request;
  }

  // Analytics
  async getHotelStats(hotelId: string): Promise<{
    totalCustomers: number;
    activeCustomers: number;
    pendingRequests: number;
    occupancyRate: number;
  }> {
    const [totalCustomersResult] = await db
      .select({ count: count() })
      .from(customers)
      .where(eq(customers.hotelId, hotelId));

    const [activeCustomersResult] = await db
      .select({ count: count() })
      .from(customers)
      .where(and(eq(customers.hotelId, hotelId), eq(customers.isActive, true)));

    const [pendingRequestsResult] = await db
      .select({ count: count() })
      .from(serviceRequests)
      .where(and(eq(serviceRequests.hotelId, hotelId), eq(serviceRequests.status, "pending")));

    const [hotelData] = await db.select().from(hotels).where(eq(hotels.id, hotelId));

    const occupancyRate = hotelData?.totalRooms 
      ? Math.round((activeCustomersResult.count / hotelData.totalRooms) * 100)
      : 0;

    return {
      totalCustomers: totalCustomersResult.count,
      activeCustomers: activeCustomersResult.count,
      pendingRequests: pendingRequestsResult.count,
      occupancyRate,
    };
  }
}

export const storage = new DatabaseStorage();
