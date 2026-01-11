import ChatStatus from '../models/ChatStatus.js';
import FixedText from '../models/FixedText.js';

const todayKey = () => new Date().toISOString().slice(0, 10);

// @desc    Get chat sending availability for today
// @route   GET /api/chat/status
export const getStatus = async (req, res) => {
  try {
    const lang = req.query.lang || 'en';
    const status = await ChatStatus.findOne({ dateKey: todayKey() });
    if (!status) {
      return res.json({ canSend: true, remaining: undefined, limit: undefined, reason: undefined });
    }
    let reason;
    if (status.disabled) {
      try {
        const chatText = await FixedText.findOne({ section: 'chat', language: lang });
        reason = chatText?.content?.get('creditsExhausted') || 'Daily AI message limit reached. Please try again tomorrow.';
      } catch (e) {
        reason = 'Daily AI message limit reached. Please try again tomorrow.';
      }
    }
    return res.json({
      canSend: !status.disabled,
      remaining: status.remaining,
      limit: status.limit,
      reason,
    });
  } catch (err) {
    console.error('Get Chat Status Error:', err);
    res.status(500).json({ message: 'Failed to get chat status' });
  }
};
