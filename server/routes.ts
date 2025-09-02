import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./multiHotelAuth";
import { insertHotelSchema, insertCustomerSchema, insertServiceRequestSchema, insertRoomTypeSchema, insertRoomSchema, insertAdminServiceSchema } from "@shared/types";
import { z } from "zod";
import QRCode from "qrcode";
import mongoose from "mongoose";

// Utility function to validate ObjectId
function isValidObjectId(id: string): boolean {
  return mongoose.Types.ObjectId.isValid(id) && (new mongoose.Types.ObjectId(id).toString() === id || id.length === 24);
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes - override the auth middleware route with our session-based route
  app.get('/api/auth/user', (req: any, res) => {
    if ((req.session as any).user) {
      res.json((req.session as any).user);
    } else {
      res.status(401).json({ message: "Not authenticated" });
    }
  });

  // Hotel routes
  app.get('/api/hotel', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const hotel = await storage.getUserHotel(userId);
      res.json(hotel);
    } catch (error) {
      console.error("Error fetching hotel:", error);
      res.status(500).json({ message: "Failed to fetch hotel" });
    }
  });

  app.post('/api/hotel', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const hotelData = insertHotelSchema.parse({ ...req.body, ownerId: userId });
      const hotel = await storage.createHotel(hotelData);
      res.json(hotel);
    } catch (error) {
      console.error("Error creating hotel:", error);
      res.status(400).json({ message: "Failed to create hotel" });
    }
  });

  app.put('/api/hotel/:id', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const updateData = insertHotelSchema.partial().parse(req.body);
      const hotel = await storage.updateHotel(id, updateData);
      res.json(hotel);
    } catch (error) {
      console.error("Error updating hotel:", error);
      res.status(400).json({ message: "Failed to update hotel" });
    }
  });

  // Hotel setup route for detailed hotel information
  app.post('/api/hotel/setup', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const hotelAdmin = await storage.getHotelAdminById(userId);
      
      if (!hotelAdmin) {
        return res.status(404).json({ message: "Hotel admin not found" });
      }

      // Update hotel admin with additional details
      const updatedAdmin = await storage.updateHotelAdmin(userId, {
        phone: req.body.phone,
        address: req.body.address,
      });

      // Get or create hotel for this admin
      let hotel = await storage.getHotelByAdminId(userId);
      if (!hotel) {
        // Create hotel if it doesn't exist
        const hotelData = {
          name: req.body.hotelName || hotelAdmin.hotelName,
          ownerId: userId,
          address: req.body.address,
          phone: req.body.phone,
          totalRooms: parseInt(req.body.totalRooms) || 20,
          city: req.body.city,
          state: req.body.state,
          country: req.body.country,
          pincode: req.body.pincode,
          hotelType: req.body.hotelType,
          description: req.body.description,
          amenities: req.body.amenities || [],
          checkInTime: req.body.checkInTime || "14:00",
          checkOutTime: req.body.checkOutTime || "11:00",
          starRating: req.body.starRating,
          website: req.body.website,
          email: req.body.email,
        };

        hotel = await storage.createHotel(hotelData);

        // Create default room types for the new hotel
        await storage.createDefaultRoomTypes(hotel.id);
      }

      res.json({ 
        success: true, 
        hotel,
        message: "Hotel setup completed successfully!" 
      });
    } catch (error) {
      console.error("Error setting up hotel:", error);
      res.status(500).json({ message: "Failed to complete hotel setup" });
    }
  });

  // Room type routes
  app.get('/api/room-types', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const hotel = await storage.getUserHotel(userId);
      
      if (!hotel) {
        return res.status(404).json({ message: "Hotel not found" });
      }

      const roomTypes = await storage.getRoomTypes(hotel.id);
      res.json(roomTypes);
    } catch (error) {
      console.error("Error fetching room types:", error);
      res.status(500).json({ message: "Failed to fetch room types" });
    }
  });

  app.post('/api/room-types', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const hotel = await storage.getUserHotel(userId);
      
      if (!hotel) {
        return res.status(404).json({ message: "Hotel not found" });
      }

      const roomTypeData = insertRoomTypeSchema.parse({ ...req.body, hotelId: hotel.id });
      const roomType = await storage.createRoomType(roomTypeData);
      res.json(roomType);
    } catch (error) {
      console.error("Error creating room type:", error);
      res.status(400).json({ message: "Failed to create room type" });
    }
  });

  app.get('/api/available-rooms', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const hotel = await storage.getUserHotel(userId);
      
      if (!hotel) {
        return res.status(404).json({ message: "Hotel not found" });
      }

      const availableRooms = await storage.getAvailableRoomNumbers(hotel.id);
      res.json(availableRooms);
    } catch (error) {
      console.error("Error fetching available rooms:", error);
      res.status(500).json({ message: "Failed to fetch available rooms" });
    }
  });

  app.post('/api/recalculate-rooms', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const hotel = await storage.getUserHotel(userId);
      
      if (!hotel) {
        return res.status(404).json({ message: "Hotel not found" });
      }

      await storage.recalculateRoomAvailability(hotel.id);
      res.json({ message: "Room availability recalculated successfully" });
    } catch (error) {
      console.error("Error recalculating room availability:", error);
      res.status(500).json({ message: "Failed to recalculate room availability" });
    }
  });

  // Customer routes
  app.get('/api/customers', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const hotel = await storage.getUserHotel(userId);
      
      if (!hotel) {
        return res.status(404).json({ message: "Hotel not found" });
      }

      const customers = await storage.getCustomers(hotel.id);
      res.json(customers);
    } catch (error) {
      console.error("Error fetching customers:", error);
      res.status(500).json({ message: "Failed to fetch customers" });
    }
  });

  app.post('/api/customers', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const hotel = await storage.getUserHotel(userId);
      
      if (!hotel) {
        return res.status(404).json({ message: "Hotel not found" });
      }

      // Parse the checkinTime if it's a string
      const customerInput = { ...req.body };
      if (customerInput.checkinTime && typeof customerInput.checkinTime === 'string') {
        customerInput.checkinTime = new Date(customerInput.checkinTime);
      }
      
      // Set default values - use Indian Standard Time (IST = UTC + 5:30)
      if (!customerInput.checkinTime) {
        customerInput.checkinTime = new Date(new Date().getTime() + (5.5 * 60 * 60 * 1000));
      }
      if (customerInput.isActive === undefined) {
        customerInput.isActive = true;
      }

      const customerData = insertCustomerSchema.parse({ 
        ...customerInput, 
        hotelId: hotel.id 
      });

      // Check if room exists in the Room collection
      const room = await storage.getRoomByNumber(hotel.id, customerData.roomNumber);
      if (room) {
        // Update room occupancy status
        await storage.updateRoom(room.id, { isOccupied: true });
      }
      
      const customer = await storage.createCustomer(customerData);
      
      // Broadcast to WebSocket clients
      broadcastToHotel(hotel.id, {
        type: 'customer_added',
        data: customer
      });

      res.json(customer);
    } catch (error) {
      console.error("Error creating customer:", error);
      res.status(400).json({ 
        message: "Failed to create customer", 
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  app.put('/api/customers/:id', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      
      // Parse dates if they're strings
      const customerInput = { ...req.body };
      if (customerInput.checkinTime && typeof customerInput.checkinTime === 'string') {
        customerInput.checkinTime = new Date(customerInput.checkinTime);
      }
      if (customerInput.checkoutTime && typeof customerInput.checkoutTime === 'string') {
        customerInput.checkoutTime = new Date(customerInput.checkoutTime);
      }
      
      const updateData = insertCustomerSchema.partial().parse(customerInput);
      const customer = await storage.updateCustomer(id, updateData);
      res.json(customer);
    } catch (error) {
      console.error("Error updating customer:", error);
      res.status(400).json({ 
        message: "Failed to update customer",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  app.delete('/api/customers/:id', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      await storage.deleteCustomer(id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting customer:", error);
      res.status(400).json({ message: "Failed to delete customer" });
    }
  });

  // Service request routes
  app.get('/api/service-requests', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const hotel = await storage.getUserHotel(userId);
      
      if (!hotel) {
        return res.status(404).json({ message: "Hotel not found" });
      }

      const serviceRequests = await storage.getServiceRequests(hotel.id);
      res.json(serviceRequests);
    } catch (error) {
      console.error("Error fetching service requests:", error);
      res.status(500).json({ message: "Failed to fetch service requests" });
    }
  });

  app.post('/api/service-requests', async (req, res) => {
    try {
      const requestData = insertServiceRequestSchema.parse(req.body);
      const serviceRequest = await storage.createServiceRequest(requestData);
      
      // Broadcast to WebSocket clients
      broadcastToHotel(requestData.hotelId, {
        type: 'service_request_created',
        data: serviceRequest
      });

      res.json(serviceRequest);
    } catch (error) {
      console.error("Error creating service request:", error);
      res.status(400).json({ message: "Failed to create service request" });
    }
  });

  app.put('/api/service-requests/:id', async (req: any, res) => {
    try {
      const { id } = req.params;
      
      // Validate ID format for security
      if (!isValidObjectId(id)) {
        return res.status(400).json({ message: "Invalid ID format" });
      }
      
      const updateData = insertServiceRequestSchema.partial().omit({ assignedAt: true, completedAt: true }).parse(req.body);
      const serviceRequest = await storage.updateServiceRequest(id, updateData);
      
      // Broadcast update to WebSocket clients
      const request = await storage.getServiceRequest(id);
      if (request) {
        broadcastToHotel(request.hotelId, {
          type: 'service_request_updated',
          data: serviceRequest
        });
      }

      res.json(serviceRequest);
    } catch (error) {
      console.error("Error updating service request:", error);
      res.status(400).json({ message: "Failed to update service request" });
    }
  });

  // Admin Service routes
  app.get('/api/admin-services', async (req, res) => {
    try {
      const { hotelId } = req.query;
      if (!hotelId) {
        return res.status(400).json({ message: "Hotel ID is required" });
      }
      const adminServices = await storage.getAdminServices(hotelId as string);
      res.json(adminServices);
    } catch (error) {
      console.error("Error fetching admin services:", error);
      res.status(500).json({ message: "Failed to fetch admin services" });
    }
  });

  app.post('/api/admin-services', async (req, res) => {
    try {
      const serviceData = insertAdminServiceSchema.parse(req.body);
      const adminService = await storage.createAdminService(serviceData);
      res.json(adminService);
    } catch (error) {
      console.error("Error creating admin service:", error);
      res.status(400).json({ message: "Failed to create admin service" });
    }
  });

  app.put('/api/admin-services/:serviceRequestId', async (req, res) => {
    try {
      const { serviceRequestId } = req.params;
      
      // Validate ID format for security
      if (!isValidObjectId(serviceRequestId)) {
        return res.status(400).json({ message: "Invalid ID format" });
      }
      const updateData = insertAdminServiceSchema.partial().parse(req.body);
      const adminService = await storage.updateAdminService(serviceRequestId, updateData);
      res.json(adminService);
    } catch (error) {
      console.error("Error updating admin service:", error);
      res.status(400).json({ message: "Failed to update admin service" });
    }
  });

  // Room management routes
  app.get('/api/rooms', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const hotel = await storage.getUserHotel(userId);
      
      if (!hotel) {
        return res.status(404).json({ message: "Hotel not found" });
      }

      const rooms = await storage.getRooms(hotel.id);
      res.json(rooms);
    } catch (error) {
      console.error("Error fetching rooms:", error);
      res.status(500).json({ message: "Failed to fetch rooms" });
    }
  });

  app.post('/api/generate-room-qr', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const hotel = await storage.getUserHotel(userId);
      
      if (!hotel) {
        return res.status(404).json({ message: "Hotel not found" });
      }

      const { roomNumber, roomTypeId, roomTypeName } = req.body;
      
      if (!roomNumber || !roomTypeId || !roomTypeName) {
        return res.status(400).json({ message: "Room number, type ID, and type name are required" });
      }

      // Check if room already exists
      const existingRoom = await storage.getRoomByNumber(hotel.id, roomNumber);
      if (existingRoom) {
        return res.status(400).json({ message: "Room already exists with QR code" });
      }

      // Generate QR code URL for room service - pointing to your service app
      const serviceAppUrl = process.env.SERVICE_APP_URL || 'https://your-service-app.replit.app';
      const qrCodeUrl = `${serviceAppUrl}/service?room=${roomNumber}&hotel=${hotel.id}`;
      const qrCodeBase64 = await QRCode.toDataURL(qrCodeUrl, {
        errorCorrectionLevel: 'M',
        margin: 1,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });

      // Create room with QR code
      const roomData = insertRoomSchema.parse({
        hotelId: hotel.id,
        roomNumber,
        roomTypeId,
        roomTypeName,
        qrCode: qrCodeBase64,
        qrCodeUrl,
        isOccupied: false
      });

      const room = await storage.createRoom(roomData);
      res.json(room);
    } catch (error) {
      console.error("Error generating room QR code:", error);
      res.status(400).json({ 
        message: "Failed to generate room QR code", 
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  app.get('/api/qr-codes/:hotelId', async (req, res) => {
    try {
      const { hotelId } = req.params;
      const roomQRCodes = await storage.getRoomQRCodes(hotelId);
      res.json(roomQRCodes);
    } catch (error) {
      console.error("Error fetching room QR codes:", error);
      res.status(500).json({ message: "Failed to fetch room QR codes" });
    }
  });

  app.post('/api/regenerate-all-qr-codes', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const hotel = await storage.getUserHotel(userId);
      
      if (!hotel) {
        return res.status(404).json({ message: "Hotel not found" });
      }

      // Get all existing rooms
      const rooms = await storage.getRooms(hotel.id);
      
      if (rooms.length === 0) {
        return res.json({ 
          success: true, 
          message: "No rooms found - QR codes are generated when you create room QR codes",
          updatedCount: 0 
        });
      }

      const serviceAppUrl = process.env.SERVICE_APP_URL || 'https://your-service-app.replit.app';
      let updatedCount = 0;

      // Update each room's QR code
      for (const room of rooms) {
        const qrCodeUrl = `${serviceAppUrl}/service?room=${room.roomNumber}&hotel=${hotel.id}`;
        const qrCodeBase64 = await QRCode.toDataURL(qrCodeUrl, {
          errorCorrectionLevel: 'M',
          margin: 1,
          color: {
            dark: '#000000',
            light: '#FFFFFF'
          }
        });

        await storage.updateRoom(room.id, {
          qrCode: qrCodeBase64,
          qrCodeUrl: qrCodeUrl
        });
        updatedCount++;
      }

      res.json({ 
        success: true, 
        message: `Successfully regenerated QR codes for ${updatedCount} rooms`,
        updatedCount 
      });
    } catch (error) {
      console.error("Error regenerating QR codes:", error);
      res.status(500).json({ message: "Failed to regenerate QR codes" });
    }
  });

  // Analytics routes
  app.get('/api/analytics/stats', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const hotel = await storage.getUserHotel(userId);
      
      if (!hotel) {
        return res.status(404).json({ message: "Hotel not found" });
      }

      const stats = await storage.getHotelStats(hotel.id);
      res.json(stats);
    } catch (error) {
      console.error("Error fetching stats:", error);
      res.status(500).json({ message: "Failed to fetch stats" });
    }
  });

  app.get('/api/analytics/rooms', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const hotel = await storage.getUserHotel(userId);
      
      if (!hotel) {
        return res.status(404).json({ message: "Hotel not found" });
      }

      const roomAnalytics = await storage.getRoomAnalytics(hotel.id);
      res.json(roomAnalytics);
    } catch (error) {
      console.error("Error fetching room analytics:", error);
      res.status(500).json({ message: "Failed to fetch room analytics" });
    }
  });

  app.get('/api/analytics/services', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const hotel = await storage.getUserHotel(userId);
      
      if (!hotel) {
        return res.status(404).json({ message: "Hotel not found" });
      }

      const serviceAnalytics = await storage.getServiceRequestAnalytics(hotel.id);
      res.json(serviceAnalytics);
    } catch (error) {
      console.error("Error fetching service analytics:", error);
      res.status(500).json({ message: "Failed to fetch service analytics" });
    }
  });

  const httpServer = createServer(app);

  // WebSocket setup
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });
  const hotelConnections = new Map<string, Set<WebSocket>>();

  wss.on('connection', (ws, req) => {
    let hotelId: string | null = null;

    ws.on('message', (message) => {
      try {
        const data = JSON.parse(message.toString());
        
        if (data.type === 'join_hotel' && data.hotelId && typeof data.hotelId === 'string') {
          hotelId = data.hotelId;
          
          if (!hotelConnections.has(data.hotelId)) {
            hotelConnections.set(data.hotelId, new Set());
          }
          
          const connections = hotelConnections.get(data.hotelId);
          if (connections) {
            connections.add(ws);
          }
        }
      } catch (error) {
        console.error('WebSocket message error:', error);
      }
    });

    ws.on('close', () => {
      if (hotelId && hotelConnections.has(hotelId)) {
        const connections = hotelConnections.get(hotelId);
        if (connections) {
          connections.delete(ws);
          
          if (connections.size === 0) {
            hotelConnections.delete(hotelId);
          }
        }
      }
    });
  });

  function broadcastToHotel(hotelId: string, message: any) {
    const connections = hotelConnections.get(hotelId);
    if (connections) {
      const messageStr = JSON.stringify(message);
      connections.forEach(ws => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(messageStr);
        }
      });
    }
  }

  return httpServer;
}
