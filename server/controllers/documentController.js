import Document from '../models/Document.js';

// @desc    Get all documents
// @route   GET /api/documents
export const getDocuments = async (req, res) => {
    try {
        const lang = req.query.lang || 'it';
        // Filter by language or return all if generic?
        // For now, let's return all and let frontend filter, OR filter by lang if strictly needed.
        // Given the portfolio nature, usually documents like CV might match the language.
        let documents = await Document.find({ language: lang });
        if (!documents || documents.length === 0) {
            documents = await Document.find({ language: 'en' });
        }
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

// @desc    Download a document
// @route   GET /api/documents/download/:id
export const downloadDocument = async (req, res) => {
    try {
        const document = await Document.findById(req.params.id);
        if (!document) {
            return res.status(404).json({ message: 'Document not found' });
        }

        // For Cloudinary URLs, we need to modify the URL to force download
        // Cloudinary supports fl_attachment flag to force download
        let downloadUrl = document.fileUrl;

        // Check if it's a Cloudinary URL
        if (downloadUrl.includes('cloudinary.com')) {
            // Add fl_attachment flag to force download
            // Example: https://res.cloudinary.com/xxx/image/upload/v123/file.pdf
            // becomes: https://res.cloudinary.com/xxx/image/upload/fl_attachment/v123/file.pdf
            downloadUrl = downloadUrl.replace('/upload/', '/upload/fl_attachment/');
        }

        // Redirect to the modified URL
        res.redirect(downloadUrl);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
