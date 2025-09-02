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
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ message: "Username and password required" });
    }
    
    // Find hotel admin by username
    const admin = await storage.getHotelAdmin(username);
    
    if (!admin || !admin.isActive) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
    
    // Check password
    const isValidPassword = await bcrypt.compare(password, admin.password);
    
    if (!isValidPassword) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
    
    // Return success with user info (excluding password)
    const { password: _, ...userInfo } = admin;
    res.json({
      success: true,
      user: {
        id: admin.id,
        username: admin.username,
        hotelName: admin.hotelName,
        email: admin.email
      }
    });
    
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}