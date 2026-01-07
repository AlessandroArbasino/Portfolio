import express from 'express';
import { cleanupChatSessions } from '../controllers/cronController.js';

const router = express.Router();

router.get('/cleanup-sessions', cleanupChatSessions);

export default router;
