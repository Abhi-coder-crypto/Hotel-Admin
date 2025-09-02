import { VercelRequest, VercelResponse } from '@vercel/node';
import { connectDB, setCORS, handleCORS, isValidObjectId } from './_lib/utils';
import { storage } from './_lib/storage';
import { insertAdminServiceSchema } from './_lib/shared/types';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (handleCORS(req, res)) return;
  
  await connectDB();
  
  try {
    if (req.method === 'GET') {
      // Get admin services for hotel
      const hotelId = req.query.hotelId as string;
      if (!hotelId) {
        return res.status(400).json({ message: "Hotel ID required" });
      }
      
      const adminServices = await storage.getAdminServices(hotelId);
      res.json(adminServices);
      
    } else if (req.method === 'POST') {
      // Create admin service
      const serviceData = insertAdminServiceSchema.parse(req.body);
      const adminService = await storage.createAdminService(serviceData);
      res.json(adminService);
      
    } else if (req.method === 'PUT') {
      // Update admin service
      const { serviceRequestId } = req.query;
      
      if (!serviceRequestId || !isValidObjectId(serviceRequestId as string)) {
        return res.status(400).json({ message: "Invalid ID format" });
      }
      
      const updateData = insertAdminServiceSchema.partial().parse(req.body);
      const adminService = await storage.updateAdminService(serviceRequestId as string, updateData);
      res.json(adminService);
      
    } else {
      res.setHeader('Allow', ['GET', 'POST', 'PUT']);
      res.status(405).json({ message: 'Method not allowed' });
    }
  } catch (error) {
    console.error("Admin services API error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}