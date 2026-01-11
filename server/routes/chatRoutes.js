import express from 'express';
import { processChat, getChatHistory, updateSessionTheme } from '../controllers/chatController.js';
import { getStatus } from '../controllers/chatStatusController.js';

const router = express.Router();

router.post('/', processChat);
router.get('/', getChatHistory);
router.put('/theme', updateSessionTheme);
router.get('/status', getStatus);

export default router;
