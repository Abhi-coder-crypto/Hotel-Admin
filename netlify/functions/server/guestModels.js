import mongoose from 'mongoose';
// Guest schema - matches the customers collection from hotel management system
const guestSchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true },
    hotelId: { type: String, required: true },
    name: { type: String, required: true },
    email: { type: String },
    phone: { type: String, required: true },
    roomNumber: { type: String, required: true }, // This is the room_no we'll search by
    roomTypeId: { type: String, required: true },
    roomTypeName: { type: String, required: true },
    roomPrice: { type: Number, required: true },
    checkinTime: { type: Date, required: true },
    checkoutTime: { type: Date },
    expectedStayDays: { type: Number },
    isActive: { type: Boolean, default: true }, // This determines if guest is still checked in
    qrCode: { type: String },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});
// Inquiry schema - for storing guest requests
const inquirySchema = new mongoose.Schema({
    room_no: { type: String, required: true },
    guest_name: { type: String, required: true },
    request: { type: String, required: true },
    created_at: { type: Date, default: Date.now },
    status: { type: String, default: 'pending', enum: ['pending', 'in_progress', 'completed', 'cancelled'] }
});
// Export models - using collection names that match your hotel management system
export const Guest = mongoose.model('Customer', guestSchema); // Use 'Customer' collection name to match hotel management
export const Inquiry = mongoose.model('Inquiry', inquirySchema);
