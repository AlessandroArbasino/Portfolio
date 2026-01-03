import ChatSession from '../models/ChatSession.js';
import FixedText from '../models/FixedText.js';
import { getGeminiResponse } from '../services/geminiService.js';
import { searchVideos } from '../utils/pexels.js';
import axios from 'axios';

const INITIAL_MOODS = [
    {
        name: 'tech',
        keywords: 'digital nexus cyberpunk data high-tech grid',
        welcomeMessages: {
            it: "Ciao! Ho impostato un'atmosfera tecnologica e futuristica per la tua visita. Come posso aiutarti?",
            en: "Hi! I've set a technological and futuristic atmosphere for your visit. How can I help you?"
        }
    },
    {
        name: 'minimal',
        keywords: 'minimal abstract architecture clean white bright',
        welcomeMessages: {
            it: "Benvenuto. Ho scelto un look pulito e minimale per oggi. Cosa desideri sapere?",
            en: "Welcome. I've chosen a clean and minimal look for today. What would you like to know?"
        }
    },
    {
        name: 'deep_sea',
        keywords: 'abstract dark blue water ocean wave',
        welcomeMessages: {
            it: "Ciao! Mi sento ispirato dalle profondità dell'oceano. Ho adattato il sito di conseguenza. Dimmi pure!",
            en: "Hi! I'm feeling inspired by the deep ocean today. I've adjusted the site accordingly. Let me know what you need!"
        }
    },
    {
        name: 'vibrant',
        keywords: 'abstract colorful liquid gradient neon',
        welcomeMessages: {
            it: "Ehi! Ho caricato il sito con un'esplosione di colori ed energia. Come posso esserti utile?",
            en: "Hey! I've charged the site with an explosion of colors and energy. How can I be of service?"
        }
    }
];

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
        const randomMood = INITIAL_MOODS[Math.floor(Math.random() * INITIAL_MOODS.length)];

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

            session = await ChatSession.create({
                sessionId,
                messages: [{ role: 'assistant', content: randomMood.welcomeMessages.it }],
                backgroundUrl,
                thumbnailUrl
            });
        }

        res.json({
            messages: session.messages,
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
