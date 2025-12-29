import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const connectDB = async () => {
    try {
        const mongoUri = process.env.MONGO_URI;
        if (!mongoUri) {
            console.warn('WARNING: MONGO_URI is not defined in environment variables. Falling back to localhost.');
            console.log('If you are on Vercel, please add MONGO_URI to your project settings.');
        } else {
            console.log('Attempting to connect to MongoDB Atlas...');
        }

        const conn = await mongoose.connect(mongoUri || 'mongodb://localhost:27017/portfolio');
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`Database Connection Error: ${error.message}`);
        console.error('Please check your MONGO_URI and ensure your IP is whitelisted in MongoDB Atlas.');
        process.exit(1);
    }
};

export default connectDB;
