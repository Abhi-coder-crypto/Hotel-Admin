import {
  User,
  Hotel,
  RoomType,
  Customer,
  ServiceRequest,
  type UserType,
  type HotelType,
  type RoomTypeType,
  type CustomerType,
  type ServiceRequestType,
} from "./models";
import {
  type UpsertUser,
  type InsertHotel,
  type InsertCustomer,
  type InsertServiceRequest,
  insertRoomTypeSchema,
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
  
  // Room type operations
  getRoomTypes(hotelId: string): Promise<RoomTypeType[]>;
  getRoomType(id: string): Promise<RoomTypeType | undefined>;
  createRoomType(roomType: any): Promise<RoomTypeType>;
  updateRoomType(id: string, data: any): Promise<RoomTypeType>;
  deleteRoomType(id: string): Promise<void>;
  updateRoomAvailability(roomTypeId: string, change: number): Promise<void>;
  
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
    totalRevenue: number;
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
    
    // Create default room types for the hotel
    await this.createDefaultRoomTypes(hotel.id);
    
    return hotel.toObject() as HotelType;
  }

  private async createDefaultRoomTypes(hotelId: string): Promise<void> {
    const defaultRoomTypes = [
      {
        hotelId,
        name: "Standard Single",
        category: "standard" as const,
        type: "single" as const,
        amenities: ["WiFi", "TV", "AC"],
        price: 2500,
        totalRooms: 5,
        availableRooms: 5,
        description: "Comfortable single occupancy room"
      },
      {
        hotelId,
        name: "Deluxe Double",
        category: "deluxe" as const,
        type: "double" as const,
        amenities: ["WiFi", "TV", "AC", "Mini Bar", "Balcony"],
        price: 4500,
        totalRooms: 5,
        availableRooms: 5,
        description: "Spacious double room with premium amenities"
      },
      {
        hotelId,
        name: "Twin Room",
        category: "standard" as const,
        type: "twin" as const,
        amenities: ["WiFi", "TV", "AC"],
        price: 3500,
        totalRooms: 5,
        availableRooms: 5,
        description: "Room with two single beds"
      },
      {
        hotelId,
        name: "Executive Suite",
        category: "suite" as const,
        type: "executive_suite" as const,
        amenities: ["WiFi", "TV", "AC", "Mini Bar", "Living Area", "Premium View"],
        price: 8500,
        totalRooms: 5,
        availableRooms: 5,
        description: "Luxury suite with separate living area"
      }
    ];

    for (const roomType of defaultRoomTypes) {
      await this.createRoomType(roomType);
    }
  }

  // Room type operations
  async getRoomTypes(hotelId: string): Promise<RoomTypeType[]> {
    return await RoomType.find({ hotelId })
      .sort({ category: 1, price: 1 })
      .lean() as any;
  }

  async getRoomType(id: string): Promise<RoomTypeType | undefined> {
    const roomType = await RoomType.findOne({ id }).lean() as RoomTypeType | null;
    return roomType || undefined;
  }

  async createRoomType(roomTypeData: any): Promise<RoomTypeType> {
    const roomType = new RoomType({
      ...roomTypeData,
      id: new mongoose.Types.ObjectId().toString(),
      availableRooms: roomTypeData.totalRooms // Initialize available rooms to total rooms
    });
    await roomType.save();
    return roomType.toObject() as RoomTypeType;
  }

  async updateRoomType(id: string, data: any): Promise<RoomTypeType> {
    const roomType = await RoomType.findOneAndUpdate(
      { id },
      { ...data, updatedAt: new Date() },
      { new: true, lean: true }
    ) as RoomTypeType | null;
    if (!roomType) {
      throw new Error('Room type not found');
    }
    return roomType;
  }

  async deleteRoomType(id: string): Promise<void> {
    await RoomType.deleteOne({ id });
  }

  async updateRoomAvailability(roomTypeId: string, change: number): Promise<void> {
    await RoomType.findOneAndUpdate(
      { id: roomTypeId },
      { $inc: { availableRooms: change } }
    );
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
      .lean() as any;
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
    
    // Decrease room availability
    await this.updateRoomAvailability(customerData.roomTypeId, -1);
    
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
      .lean() as any;
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
    totalRevenue: number;
  }> {
    const totalCustomers = await Customer.countDocuments({ hotelId });
    const activeCustomers = await Customer.countDocuments({ hotelId, isActive: true });
    const pendingRequests = await ServiceRequest.countDocuments({ hotelId, status: 'pending' });
    
    // Calculate total revenue from all customers
    const customers = await Customer.find({ hotelId }).lean();
    const totalRevenue = customers.reduce((sum, customer) => sum + (customer.roomPrice || 0), 0);
    
    // Calculate occupancy rate based on room types
    const roomTypes = await RoomType.find({ hotelId }).lean();
    const totalRooms = roomTypes.reduce((sum, room) => sum + room.totalRooms, 0);
    const occupancyRate = totalRooms > 0 ? (activeCustomers / totalRooms) * 100 : 0;

    return {
      totalCustomers,
      activeCustomers,
      pendingRequests,
      occupancyRate: Math.round(occupancyRate * 100) / 100,
      totalRevenue,
    };
  }
}

export const storage = new DatabaseStorage();
