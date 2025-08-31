import mongoose from "mongoose";
import { Guest } from "../../server/guestModels";
// Initialize MongoDB connection
let isConnected = false;
async function connectToDatabase() {
    if (isConnected)
        return;
    try {
        const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/hotel-db";
        await mongoose.connect(MONGODB_URI);
        isConnected = true;
        console.log("Connected to MongoDB successfully");
    }
    catch (error) {
        console.error("MongoDB connection error:", error);
        throw error;
    }
}
export const handler = async (event, context) => {
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
    if (event.httpMethod !== "GET") {
        return {
            statusCode: 405,
            headers,
            body: JSON.stringify({ error: "Method not allowed" })
        };
    }
    try {
        await connectToDatabase();
        const room_no = event.queryStringParameters?.room_no;
        if (!room_no || typeof room_no !== 'string') {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ error: "Room number is required" })
            };
        }
        // Look up guest by room number (active guests only)
        const guest = await Guest.findOne({
            roomNumber: room_no,
            isActive: true
        }).lean();
        if (!guest) {
            return {
                statusCode: 404,
                headers,
                body: JSON.stringify({ error: "Guest not found" })
            };
        }
        // Return guest details for the frontend
        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
                success: true,
                guest: {
                    name: guest.name,
                    room_no: guest.roomNumber,
                    room_type: guest.roomTypeName,
                    check_in: guest.checkinTime,
                    check_out: guest.checkoutTime,
                    hotel_id: guest.hotelId
                }
            })
        };
    }
    catch (error) {
        console.error("Error fetching guest:", error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: "Internal server error" })
        };
    }
};
