import ChatSession from '../models/ChatSession.js';
import FixedText from '../models/FixedText.js';
import { getGeminiResponse } from '../services/geminiService.js';
import { searchVideos } from '../utils/pexels.js';
import axios from 'axios';
import ChatMood from '../models/ChatMood.js';
import { encrypt, decrypt } from '../utils/crypto.js';


const processPexelsVideo = (videos) => {
    if (!videos || videos.length === 0) return { backgroundUrl: null, thumbnailUrl: null };
    const random = videos[Math.floor(Math.random() * videos.length)];
    const vidFile = random.video_files.find(f => f.quality === 'hd') || random.video_files[0];
    return {
        backgroundUrl: vidFile ? vidFile.link : random.image,
        thumbnailUrl: random.image
    };
};

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
        const history = session ? session.messages.map(m => ({
            role: m.role,
            content: decrypt(m.content)
        })).slice(-10) : [];

        // 2. Get Gemini Response
        const aiResult = await getGeminiResponse(history, message);

        // 3. Prepare updates
        const newMessages = [
            { role: 'user', content: message },
            { role: 'assistant', content: aiResult.text }
        ];

        const encryptedMessages = newMessages.map(m => ({
            role: m.role,
            content: encrypt(m.content)
        }));

        let updates = {
            $push: { messages: { $each: encryptedMessages } },
            $set: { lastMessageAt: new Date() }
        };

        // 4. Fetch Background Image/Video based on Keywords (Pexels)
        let backgroundUrl = null;
        let thumbnailUrl = null;
        if (aiResult.keywords) {
            try {
                console.log("Gemini Keywords:", aiResult.keywords);
                const videos = await searchVideos(aiResult.keywords, process.env.PEXELS_VIDEOS_NUMBER);
                const { backgroundUrl: bUrl, thumbnailUrl: tUrl } = processPexelsVideo(videos);

                if (bUrl) {
                    backgroundUrl = bUrl;
                    thumbnailUrl = tUrl;
                    console.log("Background URL:", backgroundUrl);
                    updates.$set.backgroundUrl = backgroundUrl;
                    updates.$set.thumbnailUrl = thumbnailUrl;
                }
            } catch (pexError) {
                console.error('Pexels Search Error in Chat:', pexError.message);
            }
        }

        // AI themes are no longer persisted here; the frontend will derive colors from the video
        // and send them back via updateSessionTheme if needed.

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
            backgroundUrl: session.backgroundUrl || backgroundUrl,
            thumbnailUrl: session.thumbnailUrl || thumbnailUrl
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
        let session = await ChatSession.findOne({ sessionId });

        // Pick a random mood as default if needed
        let randomMood = { keywords: 'abstract technology' }; // Safe fallback
        try {
            const moods = await ChatMood.find();
            if (moods && moods.length > 0) {
                randomMood = moods[Math.floor(Math.random() * moods.length)];
            }
        } catch (moodErr) {
            console.error('Error fetching chat moods:', moodErr);
        }

        if (!session) {
            // New session initialization - Synchronously fetch initial background
            let backgroundUrl = null;
            let thumbnailUrl = null;

            try {
                const videos = await searchVideos(randomMood.keywords, 3);
                const result = processPexelsVideo(videos);
                backgroundUrl = result.backgroundUrl;
                thumbnailUrl = result.thumbnailUrl;
            } catch (e) {
                console.error('Initial background search error:', e);
            }

            // Fetch welcome message from FixedText
            let welcomeMessage = "Hello! How can I help you today?"; // Fallback
            try {
                const lang = req.query.lang || 'en';
                const chatText = await FixedText.findOne({ section: 'chat', language: lang });
                if (chatText && chatText.content) {
                    welcomeMessage = chatText.content.get('welcome') || welcomeMessage;
                }
            } catch (err) {
                console.error('Error fetching welcome message from FixedText:', err);
            }

            session = await ChatSession.create({
                sessionId,
                messages: [{ role: 'assistant', content: encrypt(welcomeMessage) }],
                backgroundUrl,
                thumbnailUrl
            });
        }

        res.json({
            messages: session.messages.map(m => ({
                ...m.toObject(),
                content: decrypt(m.content)
            })),
            backgroundUrl: session.backgroundUrl || null,
            thumbnailUrl: session.thumbnailUrl || null,
            primaryColor: session.primaryColor,
            secondaryColor: session.secondaryColor,
            accentColor: session.accentColor,
            backgroundColor: session.backgroundColor,
            textColor: session.textColor,
            fontFamily: session.fontFamily,
            assistantColor: session.assistantColor
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
// @desc    Update session theme
// @route   PUT /api/chat/theme
export const updateSessionTheme = async (req, res) => {
    try {
        const sessionId = req.sessionId;
        const { theme } = req.body;

        if (!sessionId || !theme) {
            return res.status(400).json({ message: 'Session ID and theme are required' });
        }

        const updates = {};
        if (theme.primaryColor !== undefined) updates.primaryColor = theme.primaryColor;
        if (theme.secondaryColor !== undefined) updates.secondaryColor = theme.secondaryColor;
        if (theme.accentColor !== undefined) updates.accentColor = theme.accentColor;
        if (theme.backgroundColor !== undefined) updates.backgroundColor = theme.backgroundColor;
        if (theme.textColor !== undefined) updates.textColor = theme.textColor;
        if (theme.fontFamily !== undefined) updates.fontFamily = theme.fontFamily;
        if (theme.assistantColor !== undefined) updates.assistantColor = theme.assistantColor;

        const session = await ChatSession.findOneAndUpdate(
            { sessionId },
            { $set: updates },
            { new: true }
        );

        if (!session) {
            return res.status(404).json({ message: 'Session not found' });
        }

        res.json({ message: 'Theme updated successfully', theme: session });

    } catch (error) {
        console.error('Update Theme Controller Error:', error);
        res.status(500).json({ message: error.message });
    }
};
