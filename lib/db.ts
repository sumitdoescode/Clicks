import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI as string;

if (!MONGODB_URI) {
    throw new Error("MONGODB_URI is not defined");
}

/**
 * Global cache (prevents multiple connections in Next.js dev / hot reload)
 */
let cached = (global as any).mongoose;

if (!cached) {
    cached = (global as any).mongoose = {
        conn: null,
        promise: null,
    };
}

export async function connectDB() {
    // already connected
    if (cached.conn) {
        return cached.conn;
    }

    // create connection promise once
    if (!cached.promise) {
        cached.promise = mongoose.connect(MONGODB_URI, {
            bufferCommands: false,
            maxPoolSize: 10,
        });
    }

    try {
        cached.conn = await cached.promise;
        return cached.conn;
    } catch (err) {
        // 🔥 VERY IMPORTANT for Next.js
        cached.promise = null;
        throw err;
    }
}
