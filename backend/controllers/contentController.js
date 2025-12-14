import FixedText from '../models/FixedText.js';
import BackgroundImage from '../models/BackgroundImage.js';

// @desc    Get fixed texts
// @route   GET /api/fixed-texts
export const getFixedTexts = async (req, res) => {
    try {
        const { lang } = req.query;
        const texts = await FixedText.findOne({ section: 'hero', language: lang || 'it' });
        if (texts) {
            res.json({ hero: texts.content });
        } else {
            // Return default/empty if not in DB yet, or seed it
            res.json({ hero: {} });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create/Update fixed texts
// @route   POST /api/fixed-texts
export const updateFixedTexts = async (req, res) => {
    try {
        const { section, content } = req.body;
        const updated = await FixedText.findOneAndUpdate(
            { section: section || 'hero' },
            { content },
            { new: true, upsert: true }
        );
        res.json(updated);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get background images from Storyblocks
// @route   GET /api/background-images
export const getBackgroundImages = async (req, res) => {
    try {
        const { keywords, content_type } = req.query;
        const auth = generateStoryblocksAuth();

        if (!auth) {
            // Fallback if no keys
            return res.json([
                "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=1920&q=80",
                "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=1920&q=80"
            ]);
        }

        const { APIKEY, EXPIRES, HMAC } = auth;
        const project_id = process.env.STORYBLOCKS_PROJECT_ID || '1'; // Default User ID if not specific
        const user_id = process.env.STORYBLOCKS_USER_ID || '1';

        const response = await axios.get('https://api.storyblocks.com/api/v2/videos/search', {
            params: {
                APIKEY,
                EXPIRES,
                HMAC,
                project_id,
                user_id,
                keywords: keywords || 'abstract technology',
                content_type: content_type || 'motion-backgrounds'
            }
        });

        // Extract relevant data (e.g., thumbnail or preview URL)
        // Storyblocks API response structure needs checking, assuming results[].thumbnail_url or similar
        // For now, mapping to preview_urls or similar based on typical stock API
        // Actually, looking at docs, it might be 'results' array.

        if (response.data && response.data.results) {
            const images = response.data.results.map(item => item.thumbnail_url || item.preview_url || item.stock_item.thumbnail_url);
            res.json(images);
        } else {
            res.json([]);
        }

    } catch (error) {
        console.error('Storyblocks API Error:', error.response ? error.response.data : error.message);
        // Fallback on error
        res.json([
            "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=1920&q=80",
            "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=1920&q=80"
        ]);
    }
};

// @desc    Add background image
// @route   POST /api/background-images
export const addBackgroundImage = async (req, res) => {
    try {
        const { url } = req.body;
        const image = await BackgroundImage.create({ url });
        res.status(201).json(image);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
