import ChatSession from '../models/ChatSession.js';
import { getGeminiResponse } from '../services/geminiService.js';
import axios from 'axios';
import { generateStoryblocksAuth } from '../utils/storyblocks.js';

// @desc    Process chat message
// @route   POST /api/chat
export const processChat = async (req, res) => {
    try {
        const { sessionId, message } = req.body;

        if (!sessionId || !message) {
            return res.status(400).json({ message: 'Session ID and message are required' });
        }

        // 1. Retrieve or Create Session
        let session = await ChatSession.findOne({ sessionId });

        // 2. Get Gemini Response & Analysis
        // Pass recent history (e.g., last 10 messages)
        const history = session.messages.slice(-10);
        const aiResult = await getGeminiResponse(history, message);

        // 3. Save Messages to DB
        session.messages.push({ role: 'user', content: message });
        session.messages.push({ role: 'assistant', content: aiResult.text });
        await session.save();

        // 4. Fetch Background Image based on Keywords (Storyblocks)
        let backgroundUrl = null;
        if (aiResult.keywords) {
            try {
                // Reusing logic similar to contentController or calling it directly if refactored.
                // For independence, repeating logic here using the shared utility.
                const auth = generateStoryblocksAuth();
                if (auth) {
                    const { APIKEY, EXPIRES, HMAC } = auth;
                    const response = await axios.get('https://api.storyblocks.com/api/v2/videos/search', {
                        params: {
                            APIKEY, EXPIRES, HMAC,
                            project_id: process.env.STORYBLOCKS_PROJECT_ID || '1',
                            user_id: process.env.STORYBLOCKS_USER_ID || '1',
                            keywords: aiResult.keywords,
                            content_type: 'motion-backgrounds'
                        }
                    });
                    if (response.data && response.data.results && response.data.results.length > 0) {
                        // Get a random one from top 3
                        const top3 = response.data.results.slice(0, 3);
                        const random = top3[Math.floor(Math.random() * top3.length)];
                        backgroundUrl = random.thumbnail_url || random.preview_url || random.stock_item.thumbnail_url;
                    }
                }
            } catch (sbError) {
                console.error('Storyblocks Search Error in Chat:', sbError.message);
            }
        }

        res.json({
            response: aiResult.text,
            mood: aiResult.mood,
            keywords: aiResult.keywords,
            backgroundUrl
        });

    } catch (error) {
        console.error('Chat Controller Error:', error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get chat history
// @route   GET /api/chat/:sessionId
export const getChatHistory = async (req, res) => {
    try {
        const { sessionId } = req.params;
        // 1. Retrieve or Create Session
        let session = await ChatSession.findOne({ sessionId });
        if (!session) {
            session = await ChatSession.create({
                sessionId,
                messages: [
                    { role: 'assistant', content: process.env.CHATBOT_WELCOME || 'Hello! How can I help you today?' }
                ]
            });
        }

        res.json(session.messages);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
