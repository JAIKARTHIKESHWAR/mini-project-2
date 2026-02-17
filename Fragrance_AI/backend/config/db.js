import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Ensure env vars are loaded
dotenv.config({ path: join(__dirname, '../.env') });

/**
 * Returns the mongoose connection's db instance.
 * When called from within the server (after server.js has connected mongoose),
 * this reuses the existing connection — no duplicate connections.
 *
 * If mongoose is not yet connected (e.g. running standalone scripts),
 * it will connect using MONGO_URI.
 */
export const connectDB = async () => {
    // If already connected, return the existing connection's db instance
    if (mongoose.connection.readyState === 1) {
        return mongoose.connection.db;
    }

    if (!process.env.MONGO_URI) {
        throw new Error("MONGO_URI is not defined in .env");
    }

    try {
        await mongoose.connect(process.env.MONGO_URI, {
            dbName: 'fragrance', // Ensure we always connect to the correct database
            connectTimeoutMS: 30000,
            socketTimeoutMS: 45000,
        });

        console.log("✅ MongoDB Connected (via config/db.js)");
        return mongoose.connection.db;
    } catch (error) {
        console.error("❌ MongoDB connection error:", error);
        throw error;
    }
};
