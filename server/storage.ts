import {
  User,
  HotelAdmin,
  Hotel,
  RoomType,
  Customer,
  ServiceRequest,
  AdminService,
  type UserType,
  type HotelAdminType,
  type HotelType,
  type RoomTypeType,
  type CustomerType,
  type ServiceRequestType,
  type AdminServiceType,
} from "../shared/schema";
import { Room, type RoomType as RoomModelType } from "./models";
import {
  type UpsertUser,
  type InsertHotel,
  type InsertHotelAdmin,
  type InsertRoom,
  type InsertCustomer,
  type InsertServiceRequest,
  type InsertAdminService,
  insertRoomTypeSchema,
} from "@shared/types";
import "./db"; // Initialize MongoDB connection
import mongoose from "mongoose";

// Interface for storage operations
export interface IStorage {
  // User operations (IMPORTANT: mandatory for Replit Auth)
  getUser(id: string): Promise<UserType | undefined>;
  upsertUser(user: UpsertUser): Promise<UserType>;
  
  // Hotel admin operations
  getHotelAdmin(id: string): Promise<HotelAdminType | undefined>;
  getHotelAdminById(id: string): Promise<HotelAdminType | undefined>;
  createHotelAdmin(admin: InsertHotelAdmin): Promise<HotelAdminType>;
  updateHotelAdmin(id: string, data: Partial<InsertHotelAdmin>): Promise<HotelAdminType>;
  
  // Hotel operations
  getUserHotel(userId: string): Promise<HotelType | undefined>;
  getHotelByAdminId(adminId: string): Promise<HotelType | undefined>;
  createHotel(hotel: InsertHotel): Promise<HotelType>;
  updateHotel(id: string, data: Partial<InsertHotel>): Promise<HotelType>;
  
  // Room type operations
  getRoomTypes(hotelId: string): Promise<RoomTypeType[]>;
  getRoomType(id: string): Promise<RoomTypeType | undefined>;
  createRoomType(roomType: any): Promise<RoomTypeType>;
  updateRoomType(id: string, data: any): Promise<RoomTypeType>;
  deleteRoomType(id: string): Promise<void>;
  updateRoomAvailability(roomTypeId: string, change: number): Promise<void>;
  createDefaultRoomTypesForHotel(hotelId: string): Promise<void>;
  createDefaultRoomTypes(hotelId: string): Promise<void>;
  getAvailableRoomNumbers(hotelId: string): Promise<{ [roomTypeId: string]: string[] }>;
  
  // Room operations
  getRooms(hotelId: string): Promise<RoomModelType[]>;
  getRoom(id: string): Promise<RoomModelType | undefined>;
  getRoomByNumber(hotelId: string, roomNumber: string): Promise<RoomModelType | undefined>;
  createRoom(room: InsertRoom): Promise<RoomModelType>;
  updateRoom(id: string, data: Partial<InsertRoom>): Promise<RoomModelType>;
  deleteRoom(id: string): Promise<void>;
  getRoomQRCodes(hotelId: string): Promise<Array<{ roomNumber: string; roomType: string; qrCode: string; qrCodeUrl: string }>>;
  
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
  
  // Admin service operations
  getAdminServices(hotelId: string): Promise<AdminServiceType[]>;
  createAdminService(serviceData: InsertAdminService): Promise<AdminServiceType>;
  updateAdminService(serviceRequestId: string, data: Partial<InsertAdminService>): Promise<AdminServiceType>;
  
  // Analytics operations
  getRoomAnalytics(hotelId: string): Promise<{
    mostBookedRoomTypes: Array<{ roomType: string; bookings: number; revenue: number }>;
    occupancyByRoomType: Array<{ roomType: string; occupancyRate: number; totalRooms: number; occupiedRooms: number }>;
    revenueByRoomType: Array<{ roomType: string; revenue: number; averagePrice: number }>;
  }>;
  getServiceRequestAnalytics(hotelId: string): Promise<{
    completionTimeframes: Array<{ assignedTo: string; avgCompletionHours: number; completedRequests: number }>;
    popularServices: Array<{ serviceType: string; count: number; completionRate: number }>;
    serviceStatusBreakdown: Array<{ status: string; count: number; percentage: number }>;
    staffPerformance: Array<{ staffMember: string; assignedRequests: number; completedRequests: number; avgTimeFrame: string }>;
  }>;
  
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

  // Hotel admin operations
  async getHotelAdmin(id: string): Promise<HotelAdminType | undefined> {
    const admin = await HotelAdmin.findOne({ id }).lean() as HotelAdminType | null;
    return admin || undefined;
  }

  async getHotelAdminById(id: string): Promise<HotelAdminType | undefined> {
    const admin = await HotelAdmin.findOne({ id }).lean() as HotelAdminType | null;
    return admin || undefined;
  }

  async createHotelAdmin(adminData: InsertHotelAdmin): Promise<HotelAdminType> {
    const admin = new HotelAdmin({
      ...adminData,
      id: new mongoose.Types.ObjectId().toString(),
    });
    await admin.save();
    return admin.toObject() as HotelAdminType;
  }

  async updateHotelAdmin(id: string, data: Partial<InsertHotelAdmin>): Promise<HotelAdminType> {
    const admin = await HotelAdmin.findOneAndUpdate(
      { id },
      { $set: data },
      { new: true }
    ).lean() as any;
    
    if (!admin) {
      throw new Error("Hotel admin not found");
    }
    
    return admin as HotelAdminType;
  }

  // Hotel operations
  async getUserHotel(userId: string): Promise<HotelType | undefined> {
    const hotel = await Hotel.findOne({ ownerId: userId }).lean() as HotelType | null;
    return hotel || undefined;
  }

  async getHotelByAdminId(adminId: string): Promise<HotelType | undefined> {
    const hotel = await Hotel.findOne({ ownerId: adminId }).lean() as HotelType | null;
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

  async createDefaultRoomTypesForHotel(hotelId: string): Promise<void> {
    return this.createDefaultRoomTypes(hotelId);
  }

  async createDefaultRoomTypes(hotelId: string): Promise<void> {
    const defaultRoomTypes = [
      {
        hotelId,
        name: "Standard Room",
        category: "standard" as const,
        type: "single" as const,
        amenities: ["Bed", "TV", "Wi-Fi", "Bathroom"],
        price: 2500,
        totalRooms: 5,
        availableRooms: 5,
        roomNumbers: ["1", "2", "3", "4", "5"], // Rooms 1-5
        description: "Basic amenities (bed, TV, Wi-Fi, bathroom). Perfect for solo travelers or couples."
      },
      {
        hotelId,
        name: "Deluxe Room",
        category: "deluxe" as const,
        type: "double" as const,
        amenities: ["Large Bed", "TV", "Wi-Fi", "Minibar", "Better View", "Bathroom"],
        price: 3500,
        totalRooms: 5,
        availableRooms: 5,
        roomNumbers: ["6", "7", "8", "9", "10"], // Rooms 6-10
        description: "More spacious than Standard. Includes extras like minibar, better view, larger bed."
      },
      {
        hotelId,
        name: "Suite",
        category: "suite" as const,
        type: "junior_suite" as const,
        amenities: ["Separate Living Area", "Bedroom", "Sofa", "Work Desk", "Luxury Bathroom", "Premium Amenities"],
        price: 5500,
        totalRooms: 5,
        availableRooms: 5,
        roomNumbers: ["11", "12", "13", "14", "15"], // Rooms 11-15
        description: "Separate living area + bedroom. Premium amenities (sofa, work desk, luxury bathroom)."
      },
      {
        hotelId,
        name: "Family Room",
        category: "standard" as const,
        type: "triple" as const,
        amenities: ["Multiple Beds", "Family Space", "TV", "Wi-Fi", "Large Bathroom"],
        price: 4500,
        totalRooms: 5,
        availableRooms: 5,
        roomNumbers: ["16", "17", "18", "19", "20"], // Rooms 16-20
        description: "Designed for families. Multiple beds or a combination (e.g., 1 double + 2 singles)."
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

  async recalculateRoomAvailability(hotelId: string): Promise<void> {
    // Get all room types for this hotel
    const roomTypes = await RoomType.find({ hotelId }).lean();
    
    // Get all active customers for this hotel
    const activeCustomers = await Customer.find({ hotelId, isActive: true }).lean();
    
    // Count occupied rooms by room type
    const occupiedByRoomType: { [roomTypeId: string]: number } = {};
    activeCustomers.forEach(customer => {
      const roomTypeId = customer.roomTypeId;
      occupiedByRoomType[roomTypeId] = (occupiedByRoomType[roomTypeId] || 0) + 1;
    });
    
    // Update each room type's available rooms
    for (const roomType of roomTypes) {
      const occupiedCount = occupiedByRoomType[roomType.id] || 0;
      const correctAvailableRooms = roomType.totalRooms - occupiedCount;
      
      // Update the room type with correct availability
      await RoomType.findOneAndUpdate(
        { id: roomType.id },
        { $set: { availableRooms: correctAvailableRooms } }
      );
    }
  }

  async getAvailableRoomNumbers(hotelId: string): Promise<{ [roomTypeId: string]: string[] }> {
    const roomTypes = await this.getRoomTypes(hotelId);
    const occupiedCustomers = await Customer.find({ hotelId, isActive: true }).lean();
    const occupiedRoomNumbers = new Set(occupiedCustomers.map(c => c.roomNumber));
    
    const availableRoomsByType: { [roomTypeId: string]: string[] } = {};
    
    for (const roomType of roomTypes) {
      const availableRooms = (roomType.roomNumbers || []).filter(
        roomNumber => !occupiedRoomNumbers.has(roomNumber)
      );
      availableRoomsByType[roomType.id] = availableRooms;
    }
    
    return availableRoomsByType;
  }

  // Room operations
  async getRooms(hotelId: string): Promise<RoomModelType[]> {
    return await Room.find({ hotelId })
      .sort({ roomNumber: 1 })
      .lean() as any;
  }

  async getRoom(id: string): Promise<RoomModelType | undefined> {
    const room = await Room.findOne({ id }).lean() as RoomModelType | null;
    return room || undefined;
  }

  async getRoomByNumber(hotelId: string, roomNumber: string): Promise<RoomModelType | undefined> {
    const room = await Room.findOne({ hotelId, roomNumber }).lean() as RoomModelType | null;
    return room || undefined;
  }

  async createRoom(roomData: InsertRoom): Promise<RoomModelType> {
    const room = new Room({
      ...roomData,
      id: new mongoose.Types.ObjectId().toString(),
    });
    await room.save();
    return room.toObject() as RoomModelType;
  }

  async updateRoom(id: string, data: Partial<InsertRoom>): Promise<RoomModelType> {
    const room = await Room.findOneAndUpdate(
      { id },
      { ...data, updatedAt: new Date() },
      { new: true, lean: true }
    ) as RoomModelType | null;
    if (!room) {
      throw new Error('Room not found');
    }
    return room;
  }

  async deleteRoom(id: string): Promise<void> {
    await Room.deleteOne({ id });
  }

  async getRoomQRCodes(hotelId: string): Promise<Array<{ roomNumber: string; roomType: string; qrCode: string; qrCodeUrl: string }>> {
    const rooms = await Room.find({ 
      hotelId,
      qrCode: { $exists: true, $ne: null }
    }).lean();
    
    return rooms.map(room => ({
      roomNumber: room.roomNumber,
      roomType: room.roomTypeName,
      qrCode: room.qrCode || '',
      qrCodeUrl: room.qrCodeUrl || ''
    }));
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
    // Get the current customer state before updating
    const currentCustomer = await Customer.findOne({ id }).lean() as CustomerType | null;
    if (!currentCustomer) {
      throw new Error('Customer not found');
    }
    
    const customer = await Customer.findOneAndUpdate(
      { id },
      { ...data, updatedAt: new Date() },
      { new: true, lean: true }
    ) as CustomerType | null;
    if (!customer) {
      throw new Error('Customer not found');
    }
    
    // If customer is being checked out (isActive changed from true to false)
    if (currentCustomer.isActive === true && data.isActive === false) {
      // Free up the room by increasing availability
      await this.updateRoomAvailability(currentCustomer.roomTypeId, +1);
    }
    // If customer is being checked back in (isActive changed from false to true)
    else if (currentCustomer.isActive === false && data.isActive === true) {
      // Occupy the room by decreasing availability
      await this.updateRoomAvailability(currentCustomer.roomTypeId, -1);
    }
    
    return customer;
  }

  async deleteCustomer(id: string): Promise<void> {
    // Get customer before deleting to free up their room
    const customer = await Customer.findOne({ id }).lean() as CustomerType | null;
    if (customer && customer.isActive) {
      // Free up the room if customer was active
      await this.updateRoomAvailability(customer.roomTypeId, +1);
    }
    
    await Customer.deleteOne({ id });
  }

  // Service request operations
  async getServiceRequests(hotelId: string): Promise<ServiceRequestType[]> {
    const requests = await ServiceRequest.find({ hotelId })
      .sort({ requestedAt: -1 })
      .lean() as any[];
    
    // Ensure each request has a valid ObjectId - use _id if id is invalid
    return requests.map(request => {
      const validId = (request.id && mongoose.Types.ObjectId.isValid(request.id)) 
        ? request.id 
        : request._id.toString();
      return {
        ...request,
        id: validId
      };
    }) as ServiceRequestType[];
  }

  async getServiceRequest(id: string): Promise<ServiceRequestType | undefined> {
    const request = await ServiceRequest.findOne({ 
      $or: [{ id }, { _id: id }] 
    }).lean() as ServiceRequestType | null;
    
    if (!request) return undefined;
    
    // Ensure the request has a valid ObjectId - use _id if id is invalid
    const validId = (request.id && mongoose.Types.ObjectId.isValid(request.id)) 
      ? request.id 
      : request._id.toString();
    return {
      ...request,
      id: validId
    } as ServiceRequestType;
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
    const updateFields: any = { ...data, updatedAt: new Date() };
    
    // Add timestamps when status changes
    if (data.status === 'assigned' && data.assignedTo) {
      updateFields.assignedAt = new Date();
    }
    if (data.status === 'completed') {
      updateFields.completedAt = new Date();
    }
    
    const request = await ServiceRequest.findOneAndUpdate(
      { $or: [{ id }, { _id: id }] },
      updateFields,
      { new: true, lean: true }
    ) as ServiceRequestType | null;
    if (!request) {
      throw new Error('Service request not found');
    }
    
    // Ensure the returned request has a valid ObjectId - use _id if id is invalid
    const validId = (request.id && mongoose.Types.ObjectId.isValid(request.id)) 
      ? request.id 
      : request._id.toString();
    return {
      ...request,
      id: validId
    } as ServiceRequestType;
  }

  // Admin service operations
  async getAdminServices(hotelId: string): Promise<AdminServiceType[]> {
    const adminServices = await AdminService.find({ hotelId })
      .sort({ assignedAt: -1 })
      .lean() as any[];
    
    // Ensure each admin service has an id field
    return adminServices.map(service => ({
      ...service,
      id: service.id || service._id.toString()
    })) as AdminServiceType[];
  }

  async createAdminService(serviceData: InsertAdminService): Promise<AdminServiceType> {
    const adminService = new AdminService({
      ...serviceData,
      id: new mongoose.Types.ObjectId().toString(),
    });
    await adminService.save();
    return adminService.toObject() as AdminServiceType;
  }

  async updateAdminService(serviceRequestId: string, data: Partial<InsertAdminService>): Promise<AdminServiceType> {
    // Find the most recent admin service for this service request
    const adminService = await AdminService.findOneAndUpdate(
      { serviceRequestId },
      { ...data, updatedAt: new Date() },
      { new: true, lean: true, sort: { assignedAt: -1 } }
    ) as AdminServiceType | null;
    
    if (!adminService) {
      throw new Error('Admin service not found');
    }
    
    // Ensure the returned admin service has an id field
    return {
      ...adminService,
      id: adminService.id || adminService._id.toString()
    } as AdminServiceType;
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

  // Comprehensive Reports Analytics
  async getRoomAnalytics(hotelId: string): Promise<{
    mostBookedRoomTypes: Array<{ roomType: string; bookings: number; revenue: number }>;
    occupancyByRoomType: Array<{ roomType: string; occupancyRate: number; totalRooms: number; occupiedRooms: number }>;
    revenueByRoomType: Array<{ roomType: string; revenue: number; averagePrice: number }>;
  }> {
    const customers = await Customer.find({ hotelId }).lean();
    const roomTypes = await RoomType.find({ hotelId }).lean();
    
    // Group customers by room type
    const bookingsByRoomType: { [key: string]: { count: number; revenue: number; prices: number[] } } = {};
    
    customers.forEach(customer => {
      const roomTypeName = customer.roomTypeName;
      if (!bookingsByRoomType[roomTypeName]) {
        bookingsByRoomType[roomTypeName] = { count: 0, revenue: 0, prices: [] };
      }
      bookingsByRoomType[roomTypeName].count++;
      bookingsByRoomType[roomTypeName].revenue += customer.roomPrice;
      bookingsByRoomType[roomTypeName].prices.push(customer.roomPrice);
    });

    // Most booked room types
    const mostBookedRoomTypes = Object.entries(bookingsByRoomType)
      .map(([roomType, data]) => ({
        roomType,
        bookings: data.count,
        revenue: data.revenue
      }))
      .sort((a, b) => b.bookings - a.bookings);

    // Occupancy by room type
    const occupancyByRoomType = roomTypes.map(roomType => {
      const occupiedRooms = customers.filter(c => c.roomTypeName === roomType.name && c.isActive).length;
      const occupancyRate = roomType.totalRooms > 0 ? (occupiedRooms / roomType.totalRooms) * 100 : 0;
      
      return {
        roomType: roomType.name,
        occupancyRate: Math.round(occupancyRate * 100) / 100,
        totalRooms: roomType.totalRooms,
        occupiedRooms
      };
    });

    // Revenue by room type
    const revenueByRoomType = Object.entries(bookingsByRoomType)
      .map(([roomType, data]) => ({
        roomType,
        revenue: data.revenue,
        averagePrice: Math.round(data.revenue / data.count)
      }))
      .sort((a, b) => b.revenue - a.revenue);

    return {
      mostBookedRoomTypes,
      occupancyByRoomType,
      revenueByRoomType
    };
  }

  async getServiceRequestAnalytics(hotelId: string): Promise<{
    completionTimeframes: Array<{ assignedTo: string; avgCompletionHours: number; completedRequests: number }>;
    popularServices: Array<{ serviceType: string; count: number; completionRate: number }>;
    serviceStatusBreakdown: Array<{ status: string; count: number; percentage: number }>;
    staffPerformance: Array<{ staffMember: string; assignedRequests: number; completedRequests: number; avgTimeFrame: string }>;
  }> {
    const serviceRequests = await ServiceRequest.find({ hotelId }).lean();
    const adminServices = await AdminService.find({ hotelId }).lean();
    
    // Service status breakdown
    const statusCounts: { [key: string]: number } = {};
    serviceRequests.forEach(req => {
      statusCounts[req.status] = (statusCounts[req.status] || 0) + 1;
    });
    
    const totalRequests = serviceRequests.length;
    const serviceStatusBreakdown = Object.entries(statusCounts).map(([status, count]) => ({
      status,
      count,
      percentage: Math.round((count / totalRequests) * 100)
    }));

    // Popular services
    const serviceCounts: { [key: string]: { total: number; completed: number } } = {};
    serviceRequests.forEach(req => {
      const serviceType = req.service || req.type || 'other';
      if (!serviceCounts[serviceType]) {
        serviceCounts[serviceType] = { total: 0, completed: 0 };
      }
      serviceCounts[serviceType].total++;
      if (req.status === 'completed') {
        serviceCounts[serviceType].completed++;
      }
    });

    const popularServices = Object.entries(serviceCounts)
      .map(([serviceType, data]) => ({
        serviceType,
        count: data.total,
        completionRate: data.total > 0 ? Math.round((data.completed / data.total) * 100) : 0
      }))
      .sort((a, b) => b.count - a.count);

    // Staff performance based directly on service requests
    const staffStats: { [key: string]: { assigned: number; completed: number; timeFrames: string[] } } = {};
    
    // Count assignments and completions from service requests
    serviceRequests.forEach(request => {
      if (request.assignedTo && request.status !== 'pending') {
        if (!staffStats[request.assignedTo]) {
          staffStats[request.assignedTo] = { assigned: 0, completed: 0, timeFrames: [] };
        }
        staffStats[request.assignedTo].assigned++;
        
        // Mark as completed if service request is completed
        if (request.status === 'completed') {
          staffStats[request.assignedTo].completed++;
        }
      }
    });
    
    // Get timeframes from admin services for display
    adminServices.forEach(service => {
      if (staffStats[service.assignedTo]) {
        staffStats[service.assignedTo].timeFrames.push(service.timeFrame);
      }
    });

    const staffPerformance = Object.entries(staffStats).map(([staffMember, data]) => ({
      staffMember,
      assignedRequests: data.assigned,
      completedRequests: data.completed,
      avgTimeFrame: data.timeFrames.length > 0 ? data.timeFrames[data.timeFrames.length - 1] : '20minutes' // Most recent timeframe or default
    }));

    // Completion timeframes (calculate average hours based on completed services)
    const completionTimeframes = staffPerformance.map(staff => {
      // Calculate realistic completion time based on timeframe
      let avgHours = 2; // default
      if (staff.avgTimeFrame.includes('1 hour')) avgHours = 1;
      else if (staff.avgTimeFrame.includes('30 minutes')) avgHours = 0.5;
      else if (staff.avgTimeFrame.includes('2 hours')) avgHours = 2;
      else if (staff.avgTimeFrame.includes('4 hours')) avgHours = 4;
      
      return {
        assignedTo: staff.staffMember,
        avgCompletionHours: avgHours,
        completedRequests: staff.completedRequests
      };
    });

    return {
      completionTimeframes,
      popularServices,
      serviceStatusBreakdown,
      staffPerformance
    };
  }
}

export const storage = new DatabaseStorage();
