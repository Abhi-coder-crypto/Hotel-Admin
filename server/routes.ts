import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./simpleAuth";
import { insertHotelSchema, insertCustomerSchema, insertServiceRequestSchema } from "@shared/types";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
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

      const customerData = insertCustomerSchema.parse({ ...req.body, hotelId: hotel.id });
      const customer = await storage.createCustomer(customerData);
      
      // Broadcast to WebSocket clients
      broadcastToHotel(hotel.id, {
        type: 'customer_added',
        data: customer
      });

      res.json(customer);
    } catch (error) {
      console.error("Error creating customer:", error);
      res.status(400).json({ message: "Failed to create customer" });
    }
  });

  app.put('/api/customers/:id', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const updateData = insertCustomerSchema.partial().parse(req.body);
      const customer = await storage.updateCustomer(id, updateData);
      res.json(customer);
    } catch (error) {
      console.error("Error updating customer:", error);
      res.status(400).json({ message: "Failed to update customer" });
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

  app.put('/api/service-requests/:id', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const updateData = insertServiceRequestSchema.partial().parse(req.body);
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
