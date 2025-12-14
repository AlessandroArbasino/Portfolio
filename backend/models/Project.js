import mongoose from 'mongoose';

const subProjectSchema = new mongoose.Schema({
    id: String,
    name: { type: String, required: true },
    description: String,
    tech: [String],
    link: String,
    images: [String]
});

const projectSchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    description: String,
    tech: [String],
    github: String,
    demo: String,
    images: [String],
    subProjects: [subProjectSchema],
    language: { type: String, required: true, default: 'it' }
}, { timestamps: true });

const Project = mongoose.model('Project', projectSchema);

export default Project;
