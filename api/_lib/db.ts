import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://abhijeet18012001:SCeJSjgqac7DmdS5@hotel.d1juzfe.mongodb.net/?retryWrites=true&w=majority&appName=Hotel';

// Connection function
export async function connectDB() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    throw error;
  }
}

// Initialize connection
connectDB();

export { mongoose };