import ChatSession from '../models/ChatSession.js';
import FixedText from '../models/FixedText.js';
import { getGeminiResponse } from '../services/geminiService.js';
import axios from 'axios';
import { searchVideos } from '../utils/pexels.js';

// @desc    Process chat message
// @route   POST /api/chat
export const processChat = async (req, res) => {
    try {
        const { message } = req.body;
        const sessionId = req.sessionId;

        if (!sessionId || !message) {
            return res.status(400).json({ message: 'Session ID and message are required' });
        }

        // 1. Retrieve current session to get history (for context)
        let session = await ChatSession.findOne({ sessionId });
        const history = session ? session.messages.slice(-10) : [];

        // 2. Get Gemini Response
        const aiResult = await getGeminiResponse(history, message);

        // 3. Prepare updates
        const newMessages = [
            { role: 'user', content: message },
            { role: 'assistant', content: aiResult.text }
        ];

        let updates = {
            $push: { messages: { $each: newMessages } },
            $set: { lastMessageAt: new Date() }
        };

        // 4. Fetch Background Image/Video based on Keywords (Pexels)
        let backgroundUrl = null;
        if (aiResult.keywords) {
            try {
                console.log("Gemini Keywords:", aiResult.keywords);
                const videos = await searchVideos(aiResult.keywords, process.env.PEXELS_VIDEOS_NUMBER);
                if (videos && videos.length > 0) {
                    const random = videos[Math.floor(Math.random() * videos.length)];
                    const vidFile = random.video_files.find(f => f.quality === 'hd') || random.video_files[0];
                    backgroundUrl = vidFile ? vidFile.link : random.image;

                    console.log("Background URL:", backgroundUrl);
                    if (backgroundUrl) {
                        updates.$set.backgroundUrl = backgroundUrl;
                    }
                }
            } catch (pexError) {
                console.error('Pexels Search Error in Chat:', pexError.message);
            }
        }

        // Persist AI-proposed theme
        if (aiResult && aiResult.theme) {
            const t = aiResult.theme;
            if (t.primaryColor !== undefined) updates.$set.primaryColor = t.primaryColor;
            if (t.secondaryColor !== undefined) updates.$set.secondaryColor = t.secondaryColor;
            if (t.accentColor !== undefined) updates.$set.accentColor = t.accentColor;
            if (t.backgroundColor !== undefined) updates.$set.backgroundColor = t.backgroundColor;
            if (t.textColor !== undefined) updates.$set.textColor = t.textColor;
            if (t.fontFamily !== undefined) updates.$set.fontFamily = t.fontFamily;
        }

        // 5. Update DB atomically
        session = await ChatSession.findOneAndUpdate(
            { sessionId },
            updates,
            { new: true, upsert: true, setDefaultsOnInsert: true }
        );

        res.json({
            response: aiResult.text,
            mood: aiResult.mood,
            keywords: aiResult.keywords,
            theme: aiResult.theme,
            backgroundUrl: session.backgroundUrl || backgroundUrl
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
        const sessionId = req.sessionId;
        // 1. Retrieve or Create Session
        let session = await ChatSession.findOne({ sessionId });
        if (!session) {
            // Fetch initial message from DB (default to Italian or fallback)
            let initialMsg = 'Ciao! Come posso aiutarti oggi?';
            try {
                const fixed = await FixedText.findOne({ section: 'chat', language: 'it' });
                if (fixed && fixed.content && fixed.content.get('initialMessage')) {
                    initialMsg = fixed.content.get('initialMessage');
                }
            } catch (e) {
                console.error('Failed to fetch initial chat message:', e);
            }

            session = await ChatSession.create({
                sessionId,
                messages: [
                    { role: 'assistant', content: initialMsg }
                ]
            });
        }

        res.json({
            messages: session.messages,
            backgroundUrl: session.backgroundUrl || null,
            primaryColor: session.primaryColor,
            secondaryColor: session.secondaryColor,
            accentColor: session.accentColor,
            backgroundColor: session.backgroundColor,
            textColor: session.textColor,
            fontFamily: session.fontFamily
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
