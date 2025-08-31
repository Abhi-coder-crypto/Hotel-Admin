import { z } from "zod";
import { insertServiceRequestSchema } from "../../shared/schema";
import { storage } from "../../server/storage";
import { sendServiceRequestEmail } from "../../server/email";
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
    if (event.httpMethod !== "POST") {
        return {
            statusCode: 405,
            headers,
            body: JSON.stringify({ error: "Method not allowed" })
        };
    }
    try {
        const body = JSON.parse(event.body || "{}");
        const validatedData = insertServiceRequestSchema.parse(body);
        const serviceRequest = await storage.createServiceRequest(validatedData);
        // Log the request details to console as specified
        console.log("Service Request Details:", {
            name: serviceRequest.name,
            roomNumber: serviceRequest.roomNumber,
            service: serviceRequest.service,
            notes: serviceRequest.notes,
            timestamp: serviceRequest.createdAt
        });
        // Send email notification
        const emailSent = await sendServiceRequestEmail({
            guestName: serviceRequest.name,
            roomNumber: serviceRequest.roomNumber,
            service: serviceRequest.service,
            notes: serviceRequest.notes || undefined,
            timestamp: serviceRequest.createdAt ? new Date(serviceRequest.createdAt).toLocaleString() : new Date().toLocaleString()
        });
        if (!emailSent) {
            console.warn("Failed to send email notification for service request");
        }
        return {
            statusCode: 201,
            headers,
            body: JSON.stringify({
                message: "Service request submitted successfully",
                request: serviceRequest,
                emailSent
            })
        };
    }
    catch (error) {
        if (error instanceof z.ZodError) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({
                    message: "Invalid request data",
                    errors: error.errors
                })
            };
        }
        else {
            console.error("Error creating service request:", error);
            return {
                statusCode: 500,
                headers,
                body: JSON.stringify({ message: "Internal server error" })
            };
        }
    }
};
