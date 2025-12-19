import mongoose from 'mongoose';

const documentSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String
    },
    fileUrl: {
        type: String,
        required: true
    },
    type: {
        type: String,
        default: 'PDF' // PDF, DOC, IMG, etc.
    },
    language: {
        type: String,
        default: 'it'
    }
}, {
    timestamps: true
});

const Document = mongoose.model('Document', documentSchema);

export default Document;
