import ChatSession from '../models/ChatSession.js';
import { getGeminiResponse } from '../services/geminiService.js';
import axios from 'axios';
import { searchVideos } from '../utils/pexels.js';

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
        if (!session) {
            session = await ChatSession.create({
                sessionId,
                messages: []
            });
        }

        // Optional UI customization from FE
        const {
            backgroundUrls: incomingBackgroundUrls,
            primaryColor,
            secondaryColor,
            accentColor,
            backgroundColor,
            textColor,
            fontFamily
        } = req.body || {};

        if (incomingBackgroundUrls && Array.isArray(incomingBackgroundUrls)) {
            session.backgroundUrls = incomingBackgroundUrls;
        }
        if (primaryColor !== undefined) session.primaryColor = primaryColor;
        if (secondaryColor !== undefined) session.secondaryColor = secondaryColor;
        if (accentColor !== undefined) session.accentColor = accentColor;
        if (backgroundColor !== undefined) session.backgroundColor = backgroundColor;
        if (textColor !== undefined) session.textColor = textColor;
        if (fontFamily !== undefined) session.fontFamily = fontFamily;

        // 2. Get Gemini Response (Stateless with History)
        // Pass recent history (e.g., last 10 messages)
        const history = session.messages.slice(-10);
        const aiResult = await getGeminiResponse(history, message);

        // 3. Save Messages to DB
        session.messages.push({ role: 'user', content: message });
        session.messages.push({ role: 'assistant', content: aiResult.text });
        session.lastMessageAt = new Date();

        // 4. Fetch Background Image/Video based on Keywords (Pexels)
        let backgroundUrl = null;
        if (aiResult.keywords) {
            try {

                console.log("Gemini Keywords:", aiResult.keywords);
                const videos = await searchVideos(aiResult.keywords, 3);
                if (videos && videos.length > 0) {
                    // Get a random one from top 3
                    const random = videos[Math.floor(Math.random() * videos.length)];
                    // Prioritize HD video link, then SD, then image
                    const vidFile = random.video_files.find(f => f.quality === 'hd') || random.video_files[0];
                    backgroundUrl = vidFile ? vidFile.link : random.image;

                    console.log("Background URL:", backgroundUrl);
                    // Persist the most recent background URL(s)
                    if (backgroundUrl) {
                        if (!Array.isArray(session.backgroundUrls)) session.backgroundUrls = [];
                        if (session.backgroundUrls[0] !== backgroundUrl) {
                            session.backgroundUrls.unshift(backgroundUrl);
                            session.backgroundUrls = session.backgroundUrls.slice(0, 10);
                        }
                    }
                }
            } catch (pexError) {
                console.error('Pexels Search Error in Chat:', pexError.message);
            }
        }

        await session.save();

        res.json({
            response: aiResult.text,
            mood: aiResult.mood,
            keywords: aiResult.keywords,
            theme: aiResult.theme,
            backgroundUrl,
            backgroundUrls: session.backgroundUrls || [],
            primaryColor: session.primaryColor,
            secondaryColor: session.secondaryColor,
            accentColor: session.accentColor,
            backgroundColor: session.backgroundColor,
            textColor: session.textColor,
            fontFamily: session.fontFamily
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

        res.json({
            messages: session.messages,
            backgroundUrls: session.backgroundUrls || [],
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
