import { VercelRequest, VercelResponse } from '@vercel/node';
import { connectDB, setCORS, handleCORS } from './_lib/utils';
import { storage } from './_lib/storage';
import { insertCustomerSchema } from './_lib/shared/types';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (handleCORS(req, res)) return;
  
  await connectDB();
  
  try {
    if (req.method === 'GET') {
      // Get customers for hotel
      const hotelId = req.query.hotelId as string;
      if (!hotelId) {
        return res.status(400).json({ message: "Hotel ID required" });
      }
      
      const customers = await storage.getCustomers(hotelId);
      res.json(customers);
      
    } else if (req.method === 'POST') {
      // Create customer
      const customerData = insertCustomerSchema.parse(req.body);
      const customer = await storage.createCustomer(customerData);
      res.json(customer);
      
    } else if (req.method === 'PUT') {
      // Update customer
      const { id } = req.query;
      const updateData = insertCustomerSchema.partial().parse(req.body);
      const customer = await storage.updateCustomer(id as string, updateData);
      res.json(customer);
      
    } else if (req.method === 'DELETE') {
      // Delete customer
      const { id } = req.query;
      await storage.deleteCustomer(id as string);
      res.json({ success: true });
      
    } else {
      res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
      res.status(405).json({ message: 'Method not allowed' });
    }
  } catch (error) {
    console.error("Customers API error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}