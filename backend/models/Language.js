import mongoose from 'mongoose';

const languageSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true }, // e.g. 'it', 'en'
  text: { type: String, required: true } // e.g. 'IT-it', 'EN-en' or display label
}, { timestamps: true });

const Language = mongoose.model('Language', languageSchema);

export default Language;
