import { z } from "zod";

// Base interfaces for frontend
export interface User {
  _id?: string;
  id: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  profileImageUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface HotelAdmin {
  _id?: string;
  id: string;
  username: string;
  password?: string; // Excluded in responses
  hotelName: string;
  email: string;
  phone?: string;
  address?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Hotel {
  _id?: string;
  id: string;
  name: string;
  ownerId: string;
  address?: string;
  phone?: string;
  totalRooms: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface RoomType {
  _id?: string;
  id: string;
  hotelId: string;
  name: string;
  category: 'standard' | 'deluxe' | 'suite' | 'studio';
  type: 'single' | 'double' | 'twin' | 'triple' | 'junior_suite' | 'executive_suite' | 'presidential_suite';
  amenities: string[];
  price: number;
  totalRooms: number;
  availableRooms: number;
  roomNumbers?: string[]; // Array of room numbers for this room type
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Customer {
  _id?: string;
  id: string;
  hotelId: string;
  name: string;
  email?: string;
  phone: string;
  roomNumber: string;
  roomTypeId: string;
  roomTypeName: string;
  roomPrice: number;
  checkinTime: Date;
  checkoutTime?: Date;
  expectedStayDays?: number;
  isActive: boolean;
  qrCode?: string; // base64 QR code string
  createdAt: Date;
  updatedAt: Date;
}

export interface ServiceRequest {
  _id?: string;
  id: string;
  hotelId: string;
  customerId?: string;
  guestName?: string;
  roomNumber: string;
  service: string; // This is what's actually stored in MongoDB
  notes?: string; // Additional notes field from MongoDB
  type?: 'maintenance' | 'room_service' | 'food_delivery' | 'housekeeping' | 'concierge' | 'other';
  description?: string;
  status: 'pending' | 'assigned' | 'in_progress' | 'completed' | 'cancelled';
  assignedTo?: string;
  assignedBy?: string;
  completedBy?: string;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  requestedAt: Date;
  assignedAt?: Date;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Room {
  _id?: string;
  id: string;
  hotelId: string;
  roomNumber: string;
  roomTypeId: string;
  roomTypeName: string;
  qrCode?: string; // base64 QR code string
  qrCodeUrl?: string; // URL for QR code scanning
  isOccupied: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface AdminService {
  _id?: string;
  id: string;
  hotelId: string;
  serviceRequestId: string;
  requestType: string; // autofilled from service request
  assignedTo: string; // person name entered in form
  timeFrame: string; // timeframe entered in form
  service: boolean; // true when assigned, false when completed
  assignedAt: Date;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Zod Validation Schemas
export const insertHotelSchema = z.object({
  name: z.string().min(1, "Hotel name is required"),
  ownerId: z.string(),
  address: z.string().optional(),
  phone: z.string().optional(),
  totalRooms: z.number().min(0).optional(),
});

export const insertRoomTypeSchema = z.object({
  hotelId: z.string(),
  name: z.string().min(1, "Room type name is required"),
  category: z.enum(['standard', 'deluxe', 'suite', 'studio']),
  type: z.enum(['single', 'double', 'twin', 'triple', 'junior_suite', 'executive_suite', 'presidential_suite']),
  amenities: z.array(z.string()).default([]),
  price: z.number().min(0, "Price must be positive"),
  totalRooms: z.number().min(1, "Must have at least 1 room"),
  description: z.string().optional(),
});

export const insertCustomerSchema = z.object({
  hotelId: z.string(),
  name: z.string().min(1, "Customer name is required"),
  email: z.string().email("Please enter a valid email address").optional().or(z.literal("")),
  phone: z.string()
    .min(1, "Phone number is required")
    .regex(/^[+]?[1-9]\d{1,14}$/, "Please enter a valid phone number with country code (e.g., +1234567890)"),
  roomNumber: z.string().min(1, "Room number is required"),
  roomTypeId: z.string().min(1, "Room type is required"),
  roomTypeName: z.string().min(1, "Room type name is required"),
  roomPrice: z.number().min(0, "Room price must be positive"),
  checkinTime: z.date().optional(),
  checkoutTime: z.date().optional(),
  expectedStayDays: z.number().min(1).optional(),
  isActive: z.boolean().optional(),
  qrCode: z.string().optional(), // base64 QR code string
});

export const insertHotelAdminSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  hotelName: z.string().min(1, "Hotel name is required"),
  email: z.string().email("Valid email is required"),
  phone: z.string().optional(),
  address: z.string().optional(),
});

export const insertServiceRequestSchema = z.object({
  hotelId: z.string(),
  customerId: z.string().optional(),
  roomNumber: z.string().min(1, "Room number is required"),
  type: z.enum(['maintenance', 'room_service', 'food_delivery', 'housekeeping', 'concierge', 'other']),
  description: z.string().min(1, "Description is required"),
  status: z.enum(['pending', 'assigned', 'in_progress', 'completed', 'cancelled']).optional(),
  assignedTo: z.string().optional(),
  priority: z.enum(['low', 'normal', 'high', 'urgent']).optional(),
  requestedAt: z.date().optional(),
  assignedAt: z.date().optional(),
  completedAt: z.date().optional(),
});

// Type exports
export type UpsertUser = {
  id: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  profileImageUrl?: string;
};

export const insertRoomSchema = z.object({
  hotelId: z.string(),
  roomNumber: z.string().min(1, "Room number is required"),
  roomTypeId: z.string().min(1, "Room type is required"),
  roomTypeName: z.string().min(1, "Room type name is required"),
  qrCode: z.string().optional(),
  qrCodeUrl: z.string().optional(),
  isOccupied: z.boolean().default(false),
});

export const insertAdminServiceSchema = z.object({
  hotelId: z.string(),
  serviceRequestId: z.string(),
  requestType: z.string(),
  assignedTo: z.string().min(1, "Assigned person is required"),
  timeFrame: z.string().min(1, "Time frame is required"),
  service: z.boolean().default(true),
});

export type InsertHotel = z.infer<typeof insertHotelSchema>;
export type InsertHotelAdmin = z.infer<typeof insertHotelAdminSchema>;
export type InsertRoomType = z.infer<typeof insertRoomTypeSchema>;
export type InsertRoom = z.infer<typeof insertRoomSchema>;
export type InsertCustomer = z.infer<typeof insertCustomerSchema>;
export type InsertServiceRequest = z.infer<typeof insertServiceRequestSchema>;
export type InsertAdminService = z.infer<typeof insertAdminServiceSchema>;