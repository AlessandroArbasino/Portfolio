import mongoose from 'mongoose';

const ChatStatusSchema = new mongoose.Schema({
  // Key representing the current day, formatted as YYYY-MM-DD (server timezone)
  dateKey: { type: String, required: true, index: true, unique: true },
  disabled: { type: Boolean, default: false },
  reason: { type: String },
  limit: { type: Number, default: 0 },
  remaining: { type: Number, default: 0 },
}, { timestamps: true });

const ChatStatus = mongoose.model('ChatStatus', ChatStatusSchema);
export default ChatStatus;
