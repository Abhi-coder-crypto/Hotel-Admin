import type { Handler, HandlerEvent, HandlerContext } from "@netlify/functions";
import mongoose from "mongoose";
import { Guest } from "../../server/guestModels";

// Initialize MongoDB connection
let isConnected = false;

async function connectToDatabase() {
  if (isConnected) return;
  
  try {
    const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/hotel-db";
    await mongoose.connect(MONGODB_URI);
    isConnected = true;
    console.log("Connected to MongoDB successfully");
  } catch (error) {
    console.error("MongoDB connection error:", error);
    throw error;
  }
}

export const handler: Handler = async (event: HandlerEvent, context: HandlerContext) => {
  // Add CORS headers
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS"
  };

  // Handle preflight requests
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 200,
      headers,
      body: ""
    };
  }

  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: "Method not allowed" })
    };
  }

  try {
    await connectToDatabase();

    const testGuest = new Guest({
      id: "test-guest-1",
      hotelId: "hotel-123",
      name: "John Doe",
      email: "john.doe@email.com",
      phone: "+1-555-123-4567",
      roomNumber: "101",
      roomTypeId: "deluxe-001",
      roomTypeName: "Deluxe Suite",
      roomPrice: 250,
      checkinTime: new Date(),
      checkoutTime: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
      expectedStayDays: 3,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    await testGuest.save();
    
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ success: true, message: "Test guest added", guest: testGuest })
    };
  } catch (error) {
    console.error("Error adding test guest:", error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: "Failed to add test guest" })
    };
  }
};