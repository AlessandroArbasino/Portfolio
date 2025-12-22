import express from 'express';
import { translateFixedTexts, translateProjects } from '../controllers/translateController.js';

const router = express.Router();

router.get('/fixed', translateFixedTexts);
router.get('/projects', translateProjects);

export default router;
