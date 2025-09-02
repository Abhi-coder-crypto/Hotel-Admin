import mongoose, { Schema, Document } from 'mongoose';
import { z } from "zod";

// MongoDB Document Interfaces
export interface IUser extends Document {
  _id: string;
  id: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  profileImageUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IHotelAdmin extends Document {
  _id: string;
  id: string;
  username: string;
  password: string;
  hotelName: string;
  email: string;
  phone?: string;
  address?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IHotel extends Document {
  _id: string;
  id: string;
  name: string;
  ownerId: string;
  address?: string;
  phone?: string;
  totalRooms: number;
  city?: string;
  state?: string;
  country?: string;
  pincode?: string;
  hotelType?: string;
  description?: string;
  amenities?: string[];
  checkInTime?: string;
  checkOutTime?: string;
  starRating?: number;
  website?: string;
  email?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IRoomType extends Document {
  _id: string;
  id: string;
  hotelId: string;
  name: string;
  category: 'standard' | 'deluxe' | 'suite' | 'studio';
  type: 'single' | 'double' | 'twin' | 'triple' | 'junior_suite' | 'executive_suite' | 'presidential_suite';
  amenities: string[];
  price: number;
  totalRooms: number;
  availableRooms: number;
  roomNumbers?: string[];
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ICustomer extends Document {
  _id: string;
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
  qrCode?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IServiceRequest extends Document {
  _id: string;
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

// Admin Service Collection - tracks assigned service requests
export interface IAdminService extends Document {
  _id: string;
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

// Mongoose Schemas
const userSchema = new Schema<IUser>({
  id: { type: String, unique: true, required: true },
  email: { type: String, unique: true, sparse: true },
  firstName: String,
  lastName: String,
  profileImageUrl: String,
}, { timestamps: true });

const hotelAdminSchema = new Schema<IHotelAdmin>({
  id: { type: String, unique: true, required: true, default: () => new mongoose.Types.ObjectId().toString() },
  username: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  hotelName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: String,
  address: String,
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

const hotelSchema = new Schema<IHotel>({
  id: { type: String, unique: true, required: true, default: () => new mongoose.Types.ObjectId().toString() },
  name: { type: String, required: true },
  ownerId: { type: String, required: true, ref: 'User' },
  address: String,
  phone: String,
  totalRooms: { type: Number, default: 0 },
  city: String,
  state: String,
  country: String,
  pincode: String,
  hotelType: String,
  description: String,
  amenities: [String],
  checkInTime: { type: String, default: "14:00" },
  checkOutTime: { type: String, default: "11:00" },
  starRating: Number,
  website: String,
  email: String,
}, { timestamps: true });

const roomTypeSchema = new Schema<IRoomType>({
  id: { type: String, unique: true, required: true, default: () => new mongoose.Types.ObjectId().toString() },
  hotelId: { type: String, required: true, ref: 'Hotel' },
  name: { type: String, required: true },
  category: {
    type: String,
    enum: ['standard', 'deluxe', 'suite', 'studio'],
    required: true
  },
  type: {
    type: String,
    enum: ['single', 'double', 'twin', 'triple', 'junior_suite', 'executive_suite', 'presidential_suite'],
    required: true
  },
  amenities: [String],
  price: { type: Number, required: true, min: 0 },
  totalRooms: { type: Number, required: true, min: 1 },
  availableRooms: { type: Number, required: true, min: 0 },
  roomNumbers: [String],
  description: String,
}, { timestamps: true });

const customerSchema = new Schema<ICustomer>({
  id: { type: String, unique: true, required: true, default: () => new mongoose.Types.ObjectId().toString() },
  hotelId: { type: String, required: true, ref: 'Hotel' },
  name: { type: String, required: true },
  email: String,
  phone: { type: String, required: true },
  roomNumber: { type: String, required: true },
  roomTypeId: { type: String, required: true, ref: 'RoomType' },
  roomTypeName: { type: String, required: true },
  roomPrice: { type: Number, required: true, min: 0 },
  checkinTime: { type: Date, default: Date.now },
  checkoutTime: Date,
  expectedStayDays: Number,
  isActive: { type: Boolean, default: true },
  qrCode: String,
}, { timestamps: true });

const serviceRequestSchema = new Schema<IServiceRequest>({
  id: { type: String, unique: true, required: true, default: () => new mongoose.Types.ObjectId().toString() },
  hotelId: { type: String, required: true, ref: 'Hotel' },
  customerId: { type: String, ref: 'Customer' },
  roomNumber: { type: String, required: true },
  type: {
    type: String,
    enum: ['maintenance', 'room_service', 'food_delivery', 'housekeeping', 'concierge', 'other'],
    required: true
  },
  description: { type: String, required: true },
  status: {
    type: String,
    enum: ['pending', 'assigned', 'in_progress', 'completed', 'cancelled'],
    default: 'pending'
  },
  assignedTo: String,
  assignedBy: String,
  completedBy: String,
  priority: {
    type: String,
    enum: ['low', 'normal', 'high', 'urgent'],
    default: 'normal'
  },
  requestedAt: { type: Date, default: Date.now },
  assignedAt: Date,
  completedAt: Date,
  guestName: String,
  service: String,
  notes: String,
}, { timestamps: true });

// Admin Service Schema
const adminServiceSchema = new Schema<IAdminService>({
  id: { type: String, unique: true, required: true, default: () => new mongoose.Types.ObjectId().toString() },
  hotelId: { type: String, required: true, ref: 'Hotel' },
  serviceRequestId: { type: String, required: true, ref: 'ServiceRequest' },
  requestType: { type: String, required: true },
  assignedTo: { type: String, required: true },
  timeFrame: { type: String, required: true },
  service: { type: Boolean, default: true },
  assignedAt: { type: Date, default: Date.now },
  completedAt: Date,
}, { timestamps: true });

// Mongoose Models
export const User = mongoose.models.User || mongoose.model<IUser>('User', userSchema);
export const HotelAdmin = mongoose.models.HotelAdmin || mongoose.model<IHotelAdmin>('HotelAdmin', hotelAdminSchema);
export const Hotel = mongoose.models.Hotel || mongoose.model<IHotel>('Hotel', hotelSchema);
export const RoomType = mongoose.models.RoomType || mongoose.model<IRoomType>('RoomType', roomTypeSchema);
export const Customer = mongoose.models.Customer || mongoose.model<ICustomer>('Customer', customerSchema);
export const ServiceRequest = mongoose.models.ServiceRequest || mongoose.model<IServiceRequest>('ServiceRequest', serviceRequestSchema);
export const AdminService = mongoose.models.AdminService || mongoose.model<IAdminService>('AdminService', adminServiceSchema);

// Zod Validation Schemas
export const insertHotelSchema = z.object({
  name: z.string().min(1, "Hotel name is required"),
  ownerId: z.string(),
  address: z.string().optional(),
  phone: z.string().optional(),
  totalRooms: z.number().min(0).optional(),
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
  qrCode: z.string().optional(),
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
  assignedBy: z.string().optional(),
  completedBy: z.string().optional(),
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

export type UserType = IUser;
export type HotelAdminType = IHotelAdmin;
export type HotelType = IHotel;
export type RoomTypeType = IRoomType;
export type CustomerType = ICustomer;
export type ServiceRequestType = IServiceRequest;
export type AdminServiceType = IAdminService;

export type InsertHotel = z.infer<typeof insertHotelSchema>;
export type InsertCustomer = z.infer<typeof insertCustomerSchema>;
export type InsertServiceRequest = z.infer<typeof insertServiceRequestSchema>;

// Backwards compatibility type aliases
export type User = UserType;
export type Hotel = HotelType;
export type Customer = CustomerType;
export type ServiceRequest = ServiceRequestType;