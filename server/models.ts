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

export interface ICustomer extends Document {
  _id: string;
  id: string;
  hotelId: string;
  name: string;
  email?: string;
  phone: string;
  roomNumber: string;
  checkinTime: Date;
  checkoutTime?: Date;
  expectedStayDays?: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IServiceRequest extends Document {
  _id: string;
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

// Mongoose Schemas
const userSchema = new Schema<IUser>({
  id: { type: String, unique: true, required: true },
  email: { type: String, unique: true, sparse: true },
  firstName: String,
  lastName: String,
  profileImageUrl: String,
}, { timestamps: true });

const hotelSchema = new Schema<IHotel>({
  id: { type: String, unique: true, required: true, default: () => new mongoose.Types.ObjectId().toString() },
  name: { type: String, required: true },
  ownerId: { type: String, required: true, ref: 'User' },
  address: String,
  phone: String,
  totalRooms: { type: Number, default: 0 },
}, { timestamps: true });

const customerSchema = new Schema<ICustomer>({
  id: { type: String, unique: true, required: true, default: () => new mongoose.Types.ObjectId().toString() },
  hotelId: { type: String, required: true, ref: 'Hotel' },
  name: { type: String, required: true },
  email: String,
  phone: { type: String, required: true },
  roomNumber: { type: String, required: true },
  checkinTime: { type: Date, default: Date.now },
  checkoutTime: Date,
  expectedStayDays: Number,
  isActive: { type: Boolean, default: true },
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

// Mongoose Models
export const User = mongoose.models.User || mongoose.model<IUser>('User', userSchema);
export const Hotel = mongoose.models.Hotel || mongoose.model<IHotel>('Hotel', hotelSchema);
export const Customer = mongoose.models.Customer || mongoose.model<ICustomer>('Customer', customerSchema);
export const ServiceRequest = mongoose.models.ServiceRequest || mongoose.model<IServiceRequest>('ServiceRequest', serviceRequestSchema);

// Type exports for backend
export type UserType = IUser;
export type HotelType = IHotel;
export type CustomerType = ICustomer;
export type ServiceRequestType = IServiceRequest;