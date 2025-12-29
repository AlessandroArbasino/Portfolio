import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
    role: { type: String, enum: ['user', 'assistant'], required: true },
    content: { type: String, required: true },
    timestamp: { type: Date, default: Date.now }
});

const chatSessionSchema = new mongoose.Schema({
    sessionId: { type: String, required: true, unique: true }, // Could be IP or generated UUID
    lastMessageAt: { type: Date, default: Date.now },
    backgroundUrl: { type: String },
    thumbnailUrl: { type: String },
    primaryColor: { type: String },
    secondaryColor: { type: String },
    accentColor: { type: String },
    backgroundColor: { type: String },
    textColor: { type: String },
    fontFamily: { type: String },
    assistantColor: { type: String },
    messages: [messageSchema]
}, { timestamps: true });

const ChatSession = mongoose.model('ChatSession', chatSessionSchema);

export default ChatSession;
