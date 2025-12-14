import express from 'express';
import { processChat, getChatHistory } from '../controllers/chatController.js';

const router = express.Router();

router.post('/', processChat);
router.get('/:sessionId', getChatHistory);

export default router;
