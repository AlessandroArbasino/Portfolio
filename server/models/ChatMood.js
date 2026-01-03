import mongoose from 'mongoose';

const chatMoodSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    keywords: {
        type: String,
        required: true
    }
}, { timestamps: true });

const ChatMood = mongoose.model('ChatMood', chatMoodSchema);

export default ChatMood;
