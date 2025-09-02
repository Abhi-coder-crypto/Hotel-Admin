import { VercelRequest, VercelResponse } from '@vercel/node';
import { connectDB, setCORS, handleCORS } from './_lib/utils';
import { storage } from './_lib/storage';
import { insertHotelSchema } from './_lib/shared/types';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (handleCORS(req, res)) return;
  
  await connectDB();
  
  try {
    if (req.method === 'GET') {
      // Get user's hotel
      const userId = req.query.userId as string;
      if (!userId) {
        return res.status(400).json({ message: "User ID required" });
      }
      
      const hotel = await storage.getUserHotel(userId);
      res.json(hotel);
      
    } else if (req.method === 'POST') {
      // Create hotel
      const userId = req.body.ownerId;
      const hotelData = insertHotelSchema.parse({ ...req.body, ownerId: userId });
      const hotel = await storage.createHotel(hotelData);
      res.json(hotel);
      
    } else if (req.method === 'PUT') {
      // Update hotel
      const { id } = req.query;
      const updateData = insertHotelSchema.partial().parse(req.body);
      const hotel = await storage.updateHotel(id as string, updateData);
      res.json(hotel);
      
    } else {
      res.setHeader('Allow', ['GET', 'POST', 'PUT']);
      res.status(405).json({ message: 'Method not allowed' });
    }
  } catch (error) {
    console.error("Hotel API error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}