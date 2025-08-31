import type { Handler, HandlerEvent, HandlerContext } from "@netlify/functions";
import mongoose from "mongoose";
import { Inquiry } from "../../server/guestModels";

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

    const body = JSON.parse(event.body || "{}");
    const { room_no, guest_name, request } = body;

    if (!room_no || !guest_name || !request) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ 
          error: "Missing required fields: room_no, guest_name, request" 
        })
      };
    }

    // Create new inquiry
    const inquiry = new Inquiry({
      room_no,
      guest_name,
      request,
      created_at: new Date(),
      status: 'pending'
    });

    await inquiry.save();

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        message: "Your request was sent.",
        inquiry_id: inquiry._id
      })
    };
  } catch (error) {
    console.error("Error saving inquiry:", error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: "Internal server error" })
    };
  }
};