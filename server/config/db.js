import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Global is used here to maintain a cached connection across hot reloads
 * in development. This prevents connections growing exponentially
 * during API Route usage.
 */
let cached = global.mongoose;

if (!cached) {
    cached = global.mongoose = { conn: null, promise: null };
}

const connectDB = async () => {
    const mongoUri = process.env.MONGO_URI;

    if (cached.conn) {
        // console.log('Using cached database connection');
        return cached.conn;
    }

    if (!cached.promise) {
        const opts = {
            bufferCommands: false,
        };

        if (!mongoUri) {
            console.warn('WARNING: MONGO_URI is not defined. Falling back to localhost.');
        } else {
            console.log('Attempting to connect to MongoDB...');
        }

        cached.promise = mongoose.connect(mongoUri || 'mongodb://localhost:27017/portfolio', opts).then((mongoose) => {
            console.log(`MongoDB Connected: ${mongoose.connection.host}`);
            return mongoose;
        });
    }

    try {
        cached.conn = await cached.promise;
    } catch (e) {
        cached.promise = null;
        console.error(`Database Connection Error: ${e.message}`);
        throw e;
    }

    return cached.conn;
};

export default connectDB;
