import express from 'express';
import { translateFixedTexts, translateProjects, translateProfile, translateAll } from '../controllers/translateController.js';

const router = express.Router();

router.get('/fixed', translateFixedTexts);
router.get('/projects', translateProjects);
router.get('/profile', translateProfile);
router.get('/all', translateAll);

export default router;
