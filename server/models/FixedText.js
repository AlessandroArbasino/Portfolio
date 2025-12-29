import mongoose from 'mongoose';

const fixedTextSchema = new mongoose.Schema({
    section: { type: String, required: true }, // Removed unique: true to allow same section for diff langs
    content: { type: Map, of: String }, // Flexible key-value pairs
    language: { type: String, required: true, default: 'it' }
}, { timestamps: true });

// Compound index to ensure section is unique per language
fixedTextSchema.index({ section: 1, language: 1 }, { unique: true });

const FixedText = mongoose.model('FixedText', fixedTextSchema);

export default FixedText;
