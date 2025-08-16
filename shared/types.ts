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
  createdAt: Date;
  updatedAt: Date;
}

export interface ServiceRequest {
  _id?: string;
  id: string;
  hotelId: string;
  customerId?: string;
  roomNumber: string;
  type: 'maintenance' | 'room_service' | 'food_delivery' | 'housekeeping' | 'concierge' | 'other';
  description: string;
  status: 'pending' | 'assigned' | 'in_progress' | 'completed' | 'cancelled';
  assignedTo?: string;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  requestedAt: Date;
  assignedAt?: Date;
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
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().min(1, "Phone number is required"),
  roomNumber: z.string().min(1, "Room number is required"),
  roomTypeId: z.string().min(1, "Room type is required"),
  roomTypeName: z.string().min(1, "Room type name is required"),
  roomPrice: z.number().min(0, "Room price must be positive"),
  checkinTime: z.date().optional(),
  checkoutTime: z.date().optional(),
  expectedStayDays: z.number().min(1).optional(),
  isActive: z.boolean().optional(),
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

export type InsertHotel = z.infer<typeof insertHotelSchema>;
export type InsertCustomer = z.infer<typeof insertCustomerSchema>;
export type InsertServiceRequest = z.infer<typeof insertServiceRequestSchema>;