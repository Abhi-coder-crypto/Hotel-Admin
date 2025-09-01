import { pgTable, varchar, text, integer, boolean, timestamp, decimal, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

// PostgreSQL Tables using Drizzle ORM
export const users = pgTable("users", {
  id: varchar("id").primaryKey(),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: text("profile_image_url"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const hotelAdmins = pgTable("hotel_admins", {
  id: varchar("id").primaryKey(),
  username: varchar("username").unique().notNull(),
  password: varchar("password").notNull(),
  hotelName: varchar("hotel_name").notNull(),
  email: varchar("email").unique().notNull(),
  phone: varchar("phone"),
  address: text("address"),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const hotels = pgTable("hotels", {
  id: varchar("id").primaryKey(),
  name: varchar("name").notNull(),
  ownerId: varchar("owner_id").notNull(),
  address: text("address"),
  phone: varchar("phone"),
  totalRooms: integer("total_rooms").default(0).notNull(),
  city: varchar("city"),
  state: varchar("state"),
  country: varchar("country"),
  pincode: varchar("pincode"),
  hotelType: varchar("hotel_type"),
  description: text("description"),
  amenities: jsonb("amenities").default([]),
  checkInTime: varchar("check_in_time").default("14:00"),
  checkOutTime: varchar("check_out_time").default("11:00"),
  starRating: integer("star_rating"),
  website: varchar("website"),
  email: varchar("email"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const roomTypes = pgTable("room_types", {
  id: varchar("id").primaryKey(),
  hotelId: varchar("hotel_id").notNull(),
  name: varchar("name").notNull(),
  category: varchar("category").notNull(),
  type: varchar("type").notNull(),
  amenities: jsonb("amenities").default([]),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  totalRooms: integer("total_rooms").notNull(),
  availableRooms: integer("available_rooms").notNull(),
  roomNumbers: jsonb("room_numbers").default([]),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const customers = pgTable("customers", {
  id: varchar("id").primaryKey(),
  hotelId: varchar("hotel_id").notNull(),
  name: varchar("name").notNull(),
  email: varchar("email"),
  phone: varchar("phone").notNull(),
  roomNumber: varchar("room_number").notNull(),
  roomTypeId: varchar("room_type_id").notNull(),
  roomTypeName: varchar("room_type_name").notNull(),
  roomPrice: decimal("room_price", { precision: 10, scale: 2 }).notNull(),
  checkinTime: timestamp("checkin_time").defaultNow().notNull(),
  checkoutTime: timestamp("checkout_time"),
  expectedStayDays: integer("expected_stay_days"),
  isActive: boolean("is_active").default(true).notNull(),
  qrCode: text("qr_code"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const serviceRequests = pgTable("service_requests", {
  id: varchar("id").primaryKey(),
  hotelId: varchar("hotel_id").notNull(),
  customerId: varchar("customer_id"),
  guestName: varchar("guest_name"),
  roomNumber: varchar("room_number").notNull(),
  service: varchar("service"),
  notes: text("notes"),
  type: varchar("type").notNull(),
  description: text("description").notNull(),
  status: varchar("status").default("pending").notNull(),
  assignedTo: varchar("assigned_to"),
  assignedBy: varchar("assigned_by"),
  completedBy: varchar("completed_by"),
  priority: varchar("priority").default("normal").notNull(),
  requestedAt: timestamp("requested_at").defaultNow().notNull(),
  assignedAt: timestamp("assigned_at"),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const adminServices = pgTable("admin_services", {
  id: varchar("id").primaryKey(),
  hotelId: varchar("hotel_id").notNull(),
  serviceRequestId: varchar("service_request_id").notNull(),
  requestType: varchar("request_type").notNull(),
  assignedTo: varchar("assigned_to").notNull(),
  timeFrame: varchar("time_frame").notNull(),
  service: boolean("service").default(true).notNull(),
  assignedAt: timestamp("assigned_at").defaultNow().notNull(),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Create Zod schemas from Drizzle tables
export const insertUserSchema = createInsertSchema(users);
export const selectUserSchema = createSelectSchema(users);

export const insertHotelAdminSchema = createInsertSchema(hotelAdmins);
export const selectHotelAdminSchema = createSelectSchema(hotelAdmins);

export const insertHotelSchema = createInsertSchema(hotels);
export const selectHotelSchema = createSelectSchema(hotels);

export const insertRoomTypeSchema = createInsertSchema(roomTypes);
export const selectRoomTypeSchema = createSelectSchema(roomTypes);

export const insertCustomerSchema = createInsertSchema(customers);
export const selectCustomerSchema = createSelectSchema(customers);

export const insertServiceRequestSchema = createInsertSchema(serviceRequests);
export const selectServiceRequestSchema = createSelectSchema(serviceRequests);

export const insertAdminServiceSchema = createInsertSchema(adminServices);
export const selectAdminServiceSchema = createSelectSchema(adminServices);

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
export type HotelType = IHotel;
export type CustomerType = ICustomer;
export type ServiceRequestType = IServiceRequest;

export type InsertHotel = z.infer<typeof insertHotelSchema>;
export type InsertCustomer = z.infer<typeof insertCustomerSchema>;
export type InsertServiceRequest = z.infer<typeof insertServiceRequestSchema>;

// Backwards compatibility type aliases
export type User = UserType;
export type Hotel = HotelType;
export type Customer = CustomerType;
export type ServiceRequest = ServiceRequestType;
