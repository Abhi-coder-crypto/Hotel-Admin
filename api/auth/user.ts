import { VercelRequest, VercelResponse } from '@vercel/node';
import { storage } from '../_lib/storage';
import { isAuthenticated } from '../_lib/auth';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'GET') {
    try {
      // Check if user is authenticated via session
      if ((req as any).session?.user) {
        res.json((req as any).session.user);
      } else {
        res.status(401).json({ message: "Not authenticated" });
      }
    } catch (error) {
      res.status(500).json({ message: "Authentication error" });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).json({ message: 'Method not allowed' });
  }
}