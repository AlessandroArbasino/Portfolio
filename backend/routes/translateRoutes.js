import express from 'express';
import { translateItem } from '../controllers/translateController.js';

const router = express.Router();

router.post('/', translateItem);

export default router;
