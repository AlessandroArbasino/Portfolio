import express from 'express';
import { getFixedTexts, updateFixedTexts, getBackgroundImages } from '../controllers/contentController.js';

const router = express.Router();

router.route('/fixed-texts').get(getFixedTexts).post(updateFixedTexts);
router.route('/background-images').get(getBackgroundImages);

export default router;
