import express from 'express';
import { getDocuments, downloadDocument } from '../controllers/documentController.js';

const router = express.Router();

router.get('/', getDocuments);
router.get('/download/:id', downloadDocument);

export default router;
