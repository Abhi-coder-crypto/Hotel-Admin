import session from "express-session";
import type { Express, RequestHandler } from "express";
import MemoryStore from "memorystore";
import { HotelAdmin } from "./models";
import { insertHotelAdminSchema } from "@shared/types";
import mongoose from "mongoose";
import { z } from "zod";

// Enhanced authentication system for multiple hotels
export function getSession() {
  const sessionTtl = 7 * 24 * 60 * 60 * 1000; // 1 week
  const memoryStore = MemoryStore(session);
  const sessionStore = new memoryStore({
    checkPeriod: sessionTtl,
  });
  return session({
    secret: process.env.SESSION_SECRET || 'dev-secret-key-change-in-production',
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: false,
      maxAge: sessionTtl,
    },
  });
}

export async function setupAuth(app: Express) {
  app.use(getSession());

  // Hotel admin registration endpoint
  app.post("/api/register", async (req, res) => {
    try {
      const adminData = insertHotelAdminSchema.parse(req.body);
      
      // Check if username or email already exists
      const existingAdmin = await HotelAdmin.findOne({
        $or: [
          { username: adminData.username },
          { email: adminData.email }
        ]
      });
      
      if (existingAdmin) {
        return res.status(400).json({ 
          message: "Username or email already exists" 
        });
      }
      
      // Create new hotel admin
      const newAdmin = new HotelAdmin({
        ...adminData,
        id: new mongoose.Types.ObjectId().toString(),
      });
      
      await newAdmin.save();
      
      // Create hotel and setup for the new admin
      const { storage } = await import("./storage");
      
      // Create user record for compatibility
      await storage.upsertUser({
        id: newAdmin.id,
        email: adminData.email,
        firstName: adminData.hotelName,
        lastName: "Admin"
      });
      
      // Create hotel for the admin
      const hotel = await storage.createHotel({
        name: adminData.hotelName,
        ownerId: newAdmin.id,
        address: adminData.address || "",
        phone: adminData.phone || "",
        totalRooms: 20
      });
      
      // Set session
      (req.session as any).user = {
        id: newAdmin.id,
        username: newAdmin.username,
        email: newAdmin.email,
        hotelName: newAdmin.hotelName,
        hotelId: hotel.id
      };
      
      res.json({ 
        success: true, 
        user: (req.session as any).user,
        message: "Registration successful! Hotel created with default room types."
      });
      
    } catch (error) {
      console.error("Registration error:", error);
      if (error instanceof z.ZodError) {
        res.status(400).json({ 
          message: "Validation error", 
          errors: error.errors 
        });
      } else {
        res.status(500).json({ 
          message: "Registration failed", 
          error: error instanceof Error ? error.message : "Unknown error"
        });
      }
    }
  });

  // Login endpoint for hotel admins
  app.post("/api/login", async (req, res) => {
    try {
      const { username, password } = req.body;
      
      if (!username || !password) {
        return res.status(400).json({ message: "Username and password required" });
      }
      
      // Find hotel admin by username
      const admin = await HotelAdmin.findOne({ username, isActive: true });
      
      if (!admin || admin.password !== password) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      
      const { storage } = await import("./storage");
      
      // Ensure user record exists
      await storage.upsertUser({
        id: admin.id,
        email: admin.email,
        firstName: admin.hotelName,
        lastName: "Admin"
      });
      
      // Get or create hotel
      let hotel = await storage.getUserHotel(admin.id);
      if (!hotel) {
        hotel = await storage.createHotel({
          name: admin.hotelName,
          ownerId: admin.id,
          address: admin.address || "",
          phone: admin.phone || "",
          totalRooms: 20
        });
      } else {
        // Ensure room types exist
        const roomTypes = await storage.getRoomTypes(hotel.id);
        if (roomTypes.length === 0) {
          await storage.createDefaultRoomTypesForHotel(hotel.id);
        }
      }
      
      // Set session
      (req.session as any).user = {
        id: admin.id,
        username: admin.username,
        email: admin.email,
        hotelName: admin.hotelName,
        hotelId: hotel.id
      };
      
      res.json({ 
        success: true, 
        user: (req.session as any).user 
      });
      
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ 
        message: "Login failed", 
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Get current user
  app.get("/api/auth/user", (req, res) => {
    if ((req.session as any).user) {
      res.json((req.session as any).user);
    } else {
      res.status(401).json({ message: "Not authenticated" });
    }
  });

  // Logout endpoint - support both GET and POST
  const logoutHandler = (req: any, res: any) => {
    req.session.destroy((err: any) => {
      if (err) {
        console.error("Logout error:", err);
        res.status(500).json({ message: "Could not log out" });
      } else {
        res.clearCookie('connect.sid'); // Clear session cookie
        res.json({ success: true });
      }
    });
  };
  
  app.post("/api/logout", logoutHandler);
  app.get("/api/logout", logoutHandler);

  // Check username availability
  app.post("/api/check-username", async (req, res) => {
    try {
      const { username } = req.body;
      const existing = await HotelAdmin.findOne({ username });
      res.json({ available: !existing });
    } catch (error) {
      res.status(500).json({ message: "Error checking username" });
    }
  });
}

export const isAuthenticated: RequestHandler = (req, res, next) => {
  if ((req.session as any).user) {
    // Add user to request for compatibility
    (req as any).user = {
      claims: {
        sub: (req.session as any).user.id
      }
    };
    next();
  } else {
    res.status(401).json({ message: "Unauthorized" });
  }
};