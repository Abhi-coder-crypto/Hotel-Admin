import session from "express-session";
import type { Express, RequestHandler } from "express";
import MemoryStore from "memorystore";

// Simple admin credentials
const ADMIN_USERNAME = "admin";
const ADMIN_PASSWORD = "password";

export function getSession() {
  const sessionTtl = 7 * 24 * 60 * 60 * 1000; // 1 week
  const memoryStore = MemoryStore(session);
  const sessionStore = new memoryStore({
    checkPeriod: sessionTtl,
  });
  return session({
    secret: process.env.SESSION_SECRET!,
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: false,
      maxAge: sessionTtl,
    },
  });
}

export async function setupAuth(app: Express) {
  app.use(getSession());

  // Login endpoint
  app.post("/api/login", async (req, res) => {
    const { username, password } = req.body;
    
    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
      const { storage } = await import("./storage");
      
      // Create admin user if doesn't exist
      await storage.upsertUser({
        id: "admin",
        email: "admin@hotel.com",
        firstName: "Admin",
        lastName: "User"
      });
      
      // Create default hotel if doesn't exist
      const existingHotel = await storage.getUserHotel("admin");
      if (!existingHotel) {
        await storage.createHotel({
          name: "Demo Hotel",
          ownerId: "admin",
          address: "123 Main Street, City, State",
          phone: "+1-555-0123",
          totalRooms: 50
        });
      }
      
      (req.session as any).user = {
        id: "admin",
        username: "admin",
        email: "admin@hotel.com",
        firstName: "Admin",
        lastName: "User"
      };
      res.json({ success: true, user: (req.session as any).user });
    } else {
      res.status(401).json({ message: "Invalid credentials" });
    }
  });

  // Get current user
  app.get("/api/auth/user", (req, res) => {
    if ((req.session as any).user) {
      res.json((req.session as any).user);
    } else {
      res.status(401).json({ message: "Not authenticated" });
    }
  });

  // Logout endpoint
  app.post("/api/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        res.status(500).json({ message: "Could not log out" });
      } else {
        res.json({ success: true });
      }
    });
  });
}

export const isAuthenticated: RequestHandler = (req, res, next) => {
  if ((req.session as any).user) {
    // Add user to request for compatibility
    (req as any).user = {
      claims: {
        sub: (req.session as any).user.id
      }
    };
    next();
  } else {
    res.status(401).json({ message: "Unauthorized" });
  }
};