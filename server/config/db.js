import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const connectDB = async () => {
    try {
        if (mongoose.connection.readyState === 1) {
            // console.log('MongoDB already connected.');
            return;
        }

        const mongoUri = process.env.MONGO_URI;
        if (!mongoUri) {
            console.warn('WARNING: MONGO_URI is not defined. Falling back to localhost.');
        } else {
            console.log('Attempting to connect to MongoDB...');
        }

        const conn = await mongoose.connect(mongoUri || 'mongodb://localhost:27017/portfolio');
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`Database Connection Error: ${error.message}`);
        // Do NOT exit process in serverless env
        // process.exit(1); 
    }
};

export default connectDB;
