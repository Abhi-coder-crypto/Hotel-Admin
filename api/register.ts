import { VercelRequest, VercelResponse } from '@vercel/node';
import { connectDB, setCORS, handleCORS } from './_lib/utils';
import { storage } from './_lib/storage';
import bcrypt from 'bcrypt';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (handleCORS(req, res)) return;
  
  await connectDB();
  
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ message: 'Method not allowed' });
  }
  
  try {
    const { username, password, hotelName, email } = req.body;
    
    if (!username || !password || !hotelName) {
      return res.status(400).json({ 
        message: "Username, password, and hotel name are required" 
      });
    }
    
    // Check if username already exists
    const existingAdmin = await storage.getHotelAdmin(username);
    if (existingAdmin) {
      return res.status(400).json({ 
        message: "Username already exists" 
      });
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Create hotel first
    const hotel = await storage.createHotel({
      name: hotelName,
      ownerId: username // temporary, will be updated after admin creation
    });
    
    // Create admin account
    const admin = await storage.createHotelAdmin({
      username,
      password: hashedPassword,
      hotelName,
      email,
      hotelId: hotel.id,
      isActive: true
    });
    
    const result = { hotel, admin };
    
    res.status(201).json({
      success: true,
      message: "Hotel registered successfully",
      hotelId: result.hotel.id,
      adminId: result.admin.id
    });
    
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}