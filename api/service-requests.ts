import { VercelRequest, VercelResponse } from '@vercel/node';
import { connectDB, setCORS, handleCORS, isValidObjectId } from './_lib/utils';
import { storage } from './_lib/storage';
import { insertServiceRequestSchema } from './_lib/shared/types';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (handleCORS(req, res)) return;
  
  await connectDB();
  
  try {
    if (req.method === 'GET') {
      // Get service requests for hotel
      const hotelId = req.query.hotelId as string;
      if (!hotelId) {
        return res.status(400).json({ message: "Hotel ID required" });
      }
      
      const serviceRequests = await storage.getServiceRequests(hotelId);
      res.json(serviceRequests);
      
    } else if (req.method === 'POST') {
      // Create service request
      const requestData = insertServiceRequestSchema.parse(req.body);
      const serviceRequest = await storage.createServiceRequest(requestData);
      res.json(serviceRequest);
      
    } else if (req.method === 'PUT') {
      // Update service request
      const { id } = req.query;
      
      if (!id || !isValidObjectId(id as string)) {
        return res.status(400).json({ message: "Invalid ID format" });
      }
      
      const updateData = insertServiceRequestSchema.partial().omit({ assignedAt: true, completedAt: true }).parse(req.body);
      const serviceRequest = await storage.updateServiceRequest(id as string, updateData);
      res.json(serviceRequest);
      
    } else {
      res.setHeader('Allow', ['GET', 'POST', 'PUT']);
      res.status(405).json({ message: 'Method not allowed' });
    }
  } catch (error) {
    console.error("Service requests API error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}