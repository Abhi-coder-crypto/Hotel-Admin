import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertServiceRequestSchema } from "@shared/schema";
import { z } from "zod";
import { sendServiceRequestEmail } from "./email";
import { Guest, Inquiry, type GuestType, type InquiryType } from "./guestModels";
import "./db"; // Initialize MongoDB connection

export async function registerRoutes(app: Express): Promise<Server> {
  // NEW: GET /service?room_no=ROOM_NO - Show guest details and inquiry form
  app.get("/service", async (req, res) => {
    try {
      const { room_no } = req.query;
      
      if (!room_no || typeof room_no !== 'string') {
        return res.status(400).json({ error: "Room number is required" });
      }

      // Look up guest by room number (active guests only)
      const guest = await Guest.findOne({ 
        roomNumber: room_no, 
        isActive: true 
      }).lean() as GuestType | null;

      if (!guest) {
        return res.status(404).json({ error: "Guest not found" });
      }

      // Return guest details for the frontend
      res.json({
        success: true,
        guest: {
          name: guest.name,
          room_no: guest.roomNumber,
          room_type: guest.roomTypeName,
          check_in: guest.checkinTime,
          check_out: guest.checkoutTime,
          hotel_id: guest.hotelId
        }
      });
    } catch (error) {
      console.error("Error fetching guest:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // DEVELOPMENT: Add test guest data
  app.post("/api/add-test-guest", async (req, res) => {
    try {
      const testGuest = new Guest({
        id: "test-guest-1",
        hotelId: "hotel-123",
        name: "John Doe",
        email: "john.doe@email.com",
        phone: "+1-555-123-4567",
        roomNumber: "101",
        roomTypeId: "deluxe-001",
        roomTypeName: "Deluxe Suite",
        roomPrice: 250,
        checkinTime: new Date(),
        checkoutTime: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
        expectedStayDays: 3,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      });

      await testGuest.save();
      res.json({ success: true, message: "Test guest added", guest: testGuest });
    } catch (error) {
      console.error("Error adding test guest:", error);
      res.status(500).json({ error: "Failed to add test guest" });
    }
  });

  // NEW: POST /inquiry - Save guest inquiry
  app.post("/inquiry", async (req, res) => {
    try {
      const { room_no, guest_name, request } = req.body;

      if (!room_no || !guest_name || !request) {
        return res.status(400).json({ 
          error: "Missing required fields: room_no, guest_name, request" 
        });
      }

      // Create new inquiry
      const inquiry = new Inquiry({
        room_no,
        guest_name,
        request,
        created_at: new Date(),
        status: 'pending'
      });

      await inquiry.save();

      res.json({
        success: true,
        message: "Your request was sent.",
        inquiry_id: inquiry._id
      });
    } catch (error) {
      console.error("Error saving inquiry:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // EXISTING: Service request endpoint (keep for compatibility)
  app.post("/api/request-service", async (req, res) => {
    try {
      const validatedData = insertServiceRequestSchema.parse(req.body);
      
      const serviceRequest = await storage.createServiceRequest(validatedData);
      
      // Log the request details to console as specified
      console.log("Service Request Details:", {
        name: serviceRequest.name,
        roomNumber: serviceRequest.roomNumber,
        service: serviceRequest.service,
        notes: serviceRequest.notes,
        timestamp: serviceRequest.createdAt
      });
      
      // Send email notification
      const emailSent = await sendServiceRequestEmail({
        guestName: serviceRequest.name,
        roomNumber: serviceRequest.roomNumber,
        service: serviceRequest.service,
        notes: serviceRequest.notes || undefined,
        timestamp: serviceRequest.createdAt ? new Date(serviceRequest.createdAt).toLocaleString() : new Date().toLocaleString()
      });
      
      if (!emailSent) {
        console.warn("Failed to send email notification for service request");
      }
      
      res.status(201).json({ 
        message: "Service request submitted successfully",
        request: serviceRequest,
        emailSent 
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ 
          message: "Invalid request data", 
          errors: error.errors 
        });
      } else {
        console.error("Error creating service request:", error);
        res.status(500).json({ message: "Internal server error" });
      }
    }
  });

  // Get all service requests endpoint (optional, for admin purposes)
  app.get("/api/service-requests", async (req, res) => {
    try {
      const requests = await storage.getServiceRequests();
      res.json(requests);
    } catch (error) {
      console.error("Error fetching service requests:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
