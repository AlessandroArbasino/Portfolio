import express from 'express';
import { getDocuments, createDocument, downloadDocument } from '../controllers/documentController.js';

const router = express.Router();

router.get('/', getDocuments);
router.post('/', createDocument);
router.get('/download/:id', downloadDocument);

export default router;
