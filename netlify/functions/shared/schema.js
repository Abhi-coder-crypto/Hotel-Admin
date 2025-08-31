import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
export const users = pgTable("users", {
    id: varchar("id").primaryKey().default(sql `gen_random_uuid()`),
    username: text("username").notNull().unique(),
    password: text("password").notNull(),
});
export const serviceRequests = pgTable("service_requests", {
    id: varchar("id").primaryKey().default(sql `gen_random_uuid()`),
    name: text("name").notNull(),
    roomNumber: text("room_number").notNull(),
    service: text("service").notNull(),
    notes: text("notes"),
    createdAt: timestamp("created_at").defaultNow(),
});
export const insertUserSchema = createInsertSchema(users).pick({
    username: true,
    password: true,
});
export const insertServiceRequestSchema = createInsertSchema(serviceRequests).pick({
    name: true,
    roomNumber: true,
    service: true,
    notes: true,
});
