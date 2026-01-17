import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
    throw new Error("Please define the MONGODB_URI environment variable in .env.local");
}

// Global is used here to maintain a cached connection across hot reloads in development
let cached = global.mongoose;

if (!cached) {
    cached = global.mongoose = { conn: null, promise: null };
}

export const connectDB = async () => {
    if (cached.conn) return cached.conn;

    if (!cached.promise) {
        cached.promise = mongoose.connect(MONGODB_URI);
    }

    try {
        cached.conn = await cached.promise;
        return cached.conn;
    } catch (error: any) {
        throw new Error("MongoDB connection failed: " + error.message);
    }
};
