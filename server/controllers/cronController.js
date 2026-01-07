import ChatSession from '../models/ChatSession.js';

// @desc    Cleanup old chat sessions
// @route   GET /api/cron/cleanup-sessions
export const cleanupChatSessions = async (req, res) => {
    try {
        const retentionDays = parseInt(process.env.AI_CHAT_RETENTION_DAYS) || 30; // Default 30 days if not set
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

        console.log(`Running Cron: Cleaning up chat sessions older than ${retentionDays} days (before ${cutoffDate.toISOString()})`);

        const result = await ChatSession.deleteMany({
            lastMessageAt: { $lt: cutoffDate }
        });

        console.log(`Crim clean-up complete: Deleted ${result.deletedCount} sessions.`);

        res.json({
            message: 'Cleanup successful',
            deletedCount: result.deletedCount,
            cutoffDate: cutoffDate,
            retentionDays: retentionDays
        });
    } catch (error) {
        console.error('Cron Cleanup Error:', error);
        res.status(500).json({ message: error.message });
    }
};
