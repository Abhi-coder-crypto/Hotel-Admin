import { VercelRequest, VercelResponse } from '@vercel/node';
import { connectDB, setCORS, handleCORS } from '../_lib/utils';
import { storage } from '../_lib/storage';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (handleCORS(req, res)) return;
  
  await connectDB();
  
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ message: 'Method not allowed' });
  }
  
  try {
    const hotelId = req.query.hotelId as string;
    if (!hotelId) {
      return res.status(400).json({ message: "Hotel ID required" });
    }
    
    const serviceAnalytics = await storage.getServiceRequestAnalytics(hotelId);
    res.json(serviceAnalytics);
    
  } catch (error) {
    console.error("Service analytics error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}