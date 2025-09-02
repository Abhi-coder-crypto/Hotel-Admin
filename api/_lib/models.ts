import mongoose, { Schema, Document } from 'mongoose';

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
  roomNumbers: string[]; // Array of room numbers for this room type
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
  qrCode?: string; // base64 QR code string
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
  service?: string;
  notes?: string;
  type: 'maintenance' | 'room_service' | 'food_delivery' | 'housekeeping' | 'concierge' | 'other';
  description: string;
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

export interface IRoom extends Document {
  _id: string;
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

export interface IAdminService extends Document {
  _id: string;
  id: string;
  hotelId: string;
  serviceRequestId: string;
  requestType: string;
  assignedTo: string;
  timeFrame: string;
  service: boolean;
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
  roomNumbers: [String], // Array of room numbers for this room type
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
  qrCode: String, // base64 QR code string
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
  priority: {
    type: String,
    enum: ['low', 'normal', 'high', 'urgent'],
    default: 'normal'
  },
  requestedAt: { type: Date, default: Date.now },
  assignedAt: Date,
  completedAt: Date,
}, { timestamps: true });

const roomSchema = new Schema<IRoom>({
  id: { type: String, unique: true, required: true, default: () => new mongoose.Types.ObjectId().toString() },
  hotelId: { type: String, required: true, ref: 'Hotel' },
  roomNumber: { type: String, required: true },
  roomTypeId: { type: String, required: true, ref: 'RoomType' },
  roomTypeName: { type: String, required: true },
  qrCode: String, // base64 QR code string
  qrCodeUrl: String, // URL for QR code scanning
  isOccupied: { type: Boolean, default: false },
}, { timestamps: true });

// Create compound index for unique room numbers per hotel
roomSchema.index({ hotelId: 1, roomNumber: 1 }, { unique: true });

// Mongoose Models
export const User = mongoose.models.User || mongoose.model<IUser>('User', userSchema);
export const HotelAdmin = mongoose.models.HotelAdmin || mongoose.model<IHotelAdmin>('HotelAdmin', hotelAdminSchema);
export const Hotel = mongoose.models.Hotel || mongoose.model<IHotel>('Hotel', hotelSchema);
export const RoomType = mongoose.models.RoomType || mongoose.model<IRoomType>('RoomType', roomTypeSchema);
export const Room = mongoose.models.Room || mongoose.model<IRoom>('Room', roomSchema);
export const Customer = mongoose.models.Customer || mongoose.model<ICustomer>('Customer', customerSchema);
export const ServiceRequest = mongoose.models.ServiceRequest || mongoose.model<IServiceRequest>('ServiceRequest', serviceRequestSchema);

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

export const AdminService = mongoose.models.AdminService || mongoose.model<IAdminService>('AdminService', adminServiceSchema);

// Type exports for backend
export type UserType = IUser;
export type HotelAdminType = IHotelAdmin;
export type HotelType = IHotel;
export type RoomTypeType = IRoomType;
export type RoomType = IRoom;
export type CustomerType = ICustomer;
export type ServiceRequestType = IServiceRequest;
export type AdminServiceType = IAdminService;