import express from 'express';
import { getFixedTexts, getBackgroundImages } from '../controllers/contentController.js';

const router = express.Router();

router.route('/fixed-texts').get(getFixedTexts);
router.route('/background-images').get(getBackgroundImages);

export default router;
