import { VercelRequest, VercelResponse } from '@vercel/node';
import { connectDB, setCORS, handleCORS } from './_lib/utils';
import { storage } from './_lib/storage';
import { insertRoomTypeSchema } from './_lib/shared/types';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (handleCORS(req, res)) return;
  
  await connectDB();
  
  try {
    if (req.method === 'GET') {
      // Get room types for hotel
      const hotelId = req.query.hotelId as string;
      if (!hotelId) {
        return res.status(400).json({ message: "Hotel ID required" });
      }
      
      const roomTypes = await storage.getRoomTypes(hotelId);
      res.json(roomTypes);
      
    } else if (req.method === 'POST') {
      // Create room type
      const roomTypeData = insertRoomTypeSchema.parse(req.body);
      const roomType = await storage.createRoomType(roomTypeData);
      res.json(roomType);
      
    } else if (req.method === 'PUT') {
      // Update room type availability
      const { id } = req.query;
      const { availableRooms } = req.body;
      const roomType = await storage.updateRoomAvailability(id as string, availableRooms);
      res.json(roomType);
      
    } else {
      res.setHeader('Allow', ['GET', 'POST', 'PUT']);
      res.status(405).json({ message: 'Method not allowed' });
    }
  } catch (error) {
    console.error("Room types API error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}