import {
  User,
  Hotel,
  Customer,
  ServiceRequest,
  type UserType,
  type HotelType,
  type CustomerType,
  type ServiceRequestType,
} from "./models";
import {
  type UpsertUser,
  type InsertHotel,
  type InsertCustomer,
  type InsertServiceRequest,
} from "@shared/types";
import "./db"; // Initialize MongoDB connection
import mongoose from "mongoose";

// Interface for storage operations
export interface IStorage {
  // User operations (IMPORTANT: mandatory for Replit Auth)
  getUser(id: string): Promise<UserType | undefined>;
  upsertUser(user: UpsertUser): Promise<UserType>;
  
  // Hotel operations
  getUserHotel(userId: string): Promise<HotelType | undefined>;
  createHotel(hotel: InsertHotel): Promise<HotelType>;
  updateHotel(id: string, data: Partial<InsertHotel>): Promise<HotelType>;
  
  // Customer operations
  getCustomers(hotelId: string): Promise<CustomerType[]>;
  getCustomer(id: string): Promise<CustomerType | undefined>;
  createCustomer(customer: InsertCustomer): Promise<CustomerType>;
  updateCustomer(id: string, data: Partial<InsertCustomer>): Promise<CustomerType>;
  deleteCustomer(id: string): Promise<void>;
  
  // Service request operations
  getServiceRequests(hotelId: string): Promise<ServiceRequestType[]>;
  getServiceRequest(id: string): Promise<ServiceRequestType | undefined>;
  createServiceRequest(request: InsertServiceRequest): Promise<ServiceRequestType>;
  updateServiceRequest(id: string, data: Partial<InsertServiceRequest>): Promise<ServiceRequestType>;
  
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
  async getUser(id: string): Promise<UserType | undefined> {
    const user = await User.findOne({ id }).lean() as UserType | null;
    return user || undefined;
  }

  async upsertUser(userData: UpsertUser): Promise<UserType> {
    const user = await User.findOneAndUpdate(
      { id: userData.id },
      { ...userData, updatedAt: new Date() },
      { new: true, upsert: true, lean: true }
    ) as UserType | null;
    if (!user) {
      throw new Error('Failed to create/update user');
    }
    return user;
  }

  // Hotel operations
  async getUserHotel(userId: string): Promise<HotelType | undefined> {
    const hotel = await Hotel.findOne({ ownerId: userId }).lean() as HotelType | null;
    return hotel || undefined;
  }

  async createHotel(hotelData: InsertHotel): Promise<HotelType> {
    const hotel = new Hotel({
      ...hotelData,
      id: new mongoose.Types.ObjectId().toString(),
    });
    await hotel.save();
    return hotel.toObject() as HotelType;
  }

  async updateHotel(id: string, data: Partial<InsertHotel>): Promise<HotelType> {
    const hotel = await Hotel.findOneAndUpdate(
      { id },
      { ...data, updatedAt: new Date() },
      { new: true, lean: true }
    ) as HotelType | null;
    if (!hotel) {
      throw new Error('Hotel not found');
    }
    return hotel;
  }

  // Customer operations
  async getCustomers(hotelId: string): Promise<CustomerType[]> {
    return await Customer.find({ hotelId })
      .sort({ createdAt: -1 })
      .lean() as CustomerType[];
  }

  async getCustomer(id: string): Promise<CustomerType | undefined> {
    const customer = await Customer.findOne({ id }).lean() as CustomerType | null;
    return customer || undefined;
  }

  async createCustomer(customerData: InsertCustomer): Promise<CustomerType> {
    const customer = new Customer({
      ...customerData,
      id: new mongoose.Types.ObjectId().toString(),
    });
    await customer.save();
    return customer.toObject() as CustomerType;
  }

  async updateCustomer(id: string, data: Partial<InsertCustomer>): Promise<CustomerType> {
    const customer = await Customer.findOneAndUpdate(
      { id },
      { ...data, updatedAt: new Date() },
      { new: true, lean: true }
    ) as CustomerType | null;
    if (!customer) {
      throw new Error('Customer not found');
    }
    return customer;
  }

  async deleteCustomer(id: string): Promise<void> {
    await Customer.deleteOne({ id });
  }

  // Service request operations
  async getServiceRequests(hotelId: string): Promise<ServiceRequestType[]> {
    return await ServiceRequest.find({ hotelId })
      .sort({ requestedAt: -1 })
      .lean() as ServiceRequestType[];
  }

  async getServiceRequest(id: string): Promise<ServiceRequestType | undefined> {
    const request = await ServiceRequest.findOne({ id }).lean() as ServiceRequestType | null;
    return request || undefined;
  }

  async createServiceRequest(requestData: InsertServiceRequest): Promise<ServiceRequestType> {
    const request = new ServiceRequest({
      ...requestData,
      id: new mongoose.Types.ObjectId().toString(),
    });
    await request.save();
    return request.toObject() as ServiceRequestType;
  }

  async updateServiceRequest(id: string, data: Partial<InsertServiceRequest>): Promise<ServiceRequestType> {
    const request = await ServiceRequest.findOneAndUpdate(
      { id },
      { ...data, updatedAt: new Date() },
      { new: true, lean: true }
    ) as ServiceRequestType | null;
    if (!request) {
      throw new Error('Service request not found');
    }
    return request;
  }

  // Analytics
  async getHotelStats(hotelId: string): Promise<{
    totalCustomers: number;
    activeCustomers: number;
    pendingRequests: number;
    occupancyRate: number;
  }> {
    const [totalCustomers, activeCustomers, pendingRequests, hotelData] = await Promise.all([
      Customer.countDocuments({ hotelId }),
      Customer.countDocuments({ hotelId, isActive: true }),
      ServiceRequest.countDocuments({ hotelId, status: 'pending' }),
      Hotel.findOne({ id: hotelId }).lean() as Promise<HotelType | null>
    ]);

    const occupancyRate = hotelData?.totalRooms 
      ? Math.round((activeCustomers / hotelData.totalRooms) * 100)
      : 0;

    return {
      totalCustomers,
      activeCustomers,
      pendingRequests,
      occupancyRate,
    };
  }
}

export const storage = new DatabaseStorage();
