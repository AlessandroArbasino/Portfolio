import mongoose from 'mongoose';

const skillSchema = new mongoose.Schema({
    name: { type: String, required: true },
    level: { type: Number, min: 1, max: 100 }, // Percentage
    icon: String // Optional: URL or icon name
});

const competenceSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    icon: { type: String } // Optional: icon identifier
});

const personalProfileSchema = new mongoose.Schema({
    language: { type: String, required: true, default: 'it' },
    name: { type: String, required: true },
    title: { type: String, required: true }, // e.g., "Full Stack Developer"
    description: { type: String, required: true }, // Bio
    greeting: { type: String },
    imageUrl: { type: String }, // Profile picture
    socialLinks: {
        github: String,
        linkedin: String,
        twitter: String
    },
    cvUrl: String,
    experienceYears: { type: Number },
    completedProjects: { type: Number },
    skills: [skillSchema],
    competences: [competenceSchema]
}, { timestamps: true });

// Ensure only one profile per language exists
personalProfileSchema.index({ language: 1 }, { unique: true });

const PersonalProfile = mongoose.model('PersonalProfile', personalProfileSchema);

export default PersonalProfile;
