import express from 'express';
import { processChat, getChatHistory, updateSessionTheme } from '../controllers/chatController.js';

const router = express.Router();

router.post('/', processChat);
router.get('/', getChatHistory);
router.put('/theme', updateSessionTheme);

export default router;
