import Document from '../models/Document.js';

// @desc    Get all documents
// @route   GET /api/documents
export const getDocuments = async (req, res) => {
    try {
        const lang = req.query.lang || 'it';
        // Filter by language or return all if generic?
        // For now, let's return all and let frontend filter, OR filter by lang if strictly needed.
        // Given the portfolio nature, usually documents like CV might match the language.
        const documents = await Document.find({ language: lang });
        res.json(documents);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create a document
// @route   POST /api/documents
export const createDocument = async (req, res) => {
    try {
        const doc = await Document.create(req.body);
        res.status(201).json(doc);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};
