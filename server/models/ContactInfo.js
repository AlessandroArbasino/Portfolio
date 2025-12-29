import mongoose from 'mongoose';

const contactItemSchema = new mongoose.Schema({
  id: { type: String, required: true }, // 'email' | 'linkedin' | 'github'
  label: { type: String, required: true },
  value: { type: String, required: true },
  href: { type: String, required: true }
}, { _id: false });

const contactInfoSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true, default: 'default' },
  items: { type: [contactItemSchema], default: [] }
}, { timestamps: true });

const ContactInfo = mongoose.model('ContactInfo', contactInfoSchema);

export default ContactInfo;
