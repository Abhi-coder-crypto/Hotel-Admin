import { sql } from 'drizzle-orm';
import { 
  index, 
  jsonb, 
  pgTable, 
  timestamp, 
  varchar, 
  text, 
  integer,
  boolean,
  pgEnum
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table.
// (IMPORTANT) This table is mandatory for Replit Auth, don't drop it.
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table.
// (IMPORTANT) This table is mandatory for Replit Auth, don't drop it.
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Hotels table - each user owns a hotel
export const hotels = pgTable("hotels", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull(),
  ownerId: varchar("owner_id").notNull().references(() => users.id),
  address: text("address"),
  phone: varchar("phone"),
  totalRooms: integer("total_rooms").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Customers table
export const customers = pgTable("customers", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  hotelId: varchar("hotel_id").notNull().references(() => hotels.id),
  name: varchar("name").notNull(),
  email: varchar("email"),
  phone: varchar("phone").notNull(),
  roomNumber: varchar("room_number").notNull(),
  checkinTime: timestamp("checkin_time").defaultNow(),
  checkoutTime: timestamp("checkout_time"),
  expectedStayDays: integer("expected_stay_days"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Service request types enum
export const serviceRequestTypeEnum = pgEnum("service_request_type", [
  "maintenance",
  "room_service", 
  "food_delivery",
  "housekeeping",
  "concierge",
  "other"
]);

// Service request status enum
export const serviceRequestStatusEnum = pgEnum("service_request_status", [
  "pending",
  "assigned", 
  "in_progress",
  "completed",
  "cancelled"
]);

// Service requests table
export const serviceRequests = pgTable("service_requests", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  hotelId: varchar("hotel_id").notNull().references(() => hotels.id),
  customerId: varchar("customer_id").references(() => customers.id),
  roomNumber: varchar("room_number").notNull(),
  type: serviceRequestTypeEnum("type").notNull(),
  description: text("description").notNull(),
  status: serviceRequestStatusEnum("status").default("pending"),
  assignedTo: varchar("assigned_to"), // Service provider identifier
  priority: varchar("priority").default("normal"), // low, normal, high, urgent
  requestedAt: timestamp("requested_at").defaultNow(),
  assignedAt: timestamp("assigned_at"),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ one }) => ({
  hotel: one(hotels, {
    fields: [users.id],
    references: [hotels.ownerId],
  }),
}));

export const hotelsRelations = relations(hotels, ({ one, many }) => ({
  owner: one(users, {
    fields: [hotels.ownerId],
    references: [users.id],
  }),
  customers: many(customers),
  serviceRequests: many(serviceRequests),
}));

export const customersRelations = relations(customers, ({ one, many }) => ({
  hotel: one(hotels, {
    fields: [customers.hotelId],
    references: [hotels.id],
  }),
  serviceRequests: many(serviceRequests),
}));

export const serviceRequestsRelations = relations(serviceRequests, ({ one }) => ({
  hotel: one(hotels, {
    fields: [serviceRequests.hotelId],
    references: [hotels.id],
  }),
  customer: one(customers, {
    fields: [serviceRequests.customerId],
    references: [customers.id],
  }),
}));

// Insert schemas
export const insertHotelSchema = createInsertSchema(hotels).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertCustomerSchema = createInsertSchema(customers).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertServiceRequestSchema = createInsertSchema(serviceRequests).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Types
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type Hotel = typeof hotels.$inferSelect;
export type InsertHotel = z.infer<typeof insertHotelSchema>;
export type Customer = typeof customers.$inferSelect;
export type InsertCustomer = z.infer<typeof insertCustomerSchema>;
export type ServiceRequest = typeof serviceRequests.$inferSelect;
export type InsertServiceRequest = z.infer<typeof insertServiceRequestSchema>;
