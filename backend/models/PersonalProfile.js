import mongoose from 'mongoose';

const skillSchema = new mongoose.Schema({
    name: { type: String, required: true },
    level: { type: Number, min: 1, max: 100 }, // Percentage
    icon: String // Optional: URL or icon name
});

const personalProfileSchema = new mongoose.Schema({
    language: { type: String, required: true, default: 'it' },
    name: { type: String, required: true },
    title: { type: String, required: true }, // e.g., "Full Stack Developer"
    description: { type: String, required: true }, // Bio
    imageUrl: { type: String }, // Profile picture
    socialLinks: {
        github: String,
        linkedin: String,
        twitter: String
    },
    cvUrl: String,
    skills: [skillSchema]
}, { timestamps: true });

// Ensure only one profile per language exists
personalProfileSchema.index({ language: 1 }, { unique: true });

const PersonalProfile = mongoose.model('PersonalProfile', personalProfileSchema);

export default PersonalProfile;
