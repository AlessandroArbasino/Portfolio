import mongoose from 'mongoose';

const fixedTextSchema = new mongoose.Schema({
    section: { type: String, required: true, unique: true }, // e.g., 'hero'
    content: { type: Map, of: String } // Flexible key-value pairs
}, { timestamps: true });

const FixedText = mongoose.model('FixedText', fixedTextSchema);

export default FixedText;
