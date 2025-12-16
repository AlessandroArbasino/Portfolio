import FixedText from '../models/FixedText.js';
import BackgroundImage from '../models/BackgroundImage.js';
import { searchVideos } from '../utils/pexels.js';

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

// @desc    Get background images from Pexels
// @route   GET /api/background-images
export const getBackgroundImages = async (req, res) => {
    try {
        const { keywords } = req.query;

        // Default fallbacks if no results or error
        const fallbacks = [
            "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=1920&q=80",
            "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=1920&q=80"
        ];

        const videos = await searchVideos(keywords || 'abstract technology', 10);

        if (videos && videos.length > 0) {
            // Map to video files (using the highest quality or specific width/height if needed)
            // Pexels returns 'video_files'. We can pick one.
            // Let's return the image (thumbnail) for now if the frontend expects images, 
            // OR return the video link if the frontend plays video.
            // The original logic returned "thumbnail_url || preview_url".
            // Pexels has 'image' (thumbnail) and 'video_files' (actual video).
            // Let's return the image for consistency with the component name 'BackgroundImage',
            // but if the user wants "VIDEO background", we might want the video file.
            // The user request said "prendere i video di background".
            // So we should probably return video URLs.
            // However, the original code returned "thumbnail_url" most of the time.
            // I will return an object or string. The original was simple strings.
            // Let's return the video file link (HD if available).

            const results = videos.map(video => {
                // Find a good quality file, e.g., hd
                const vidFile = video.video_files.find(f => f.quality === 'hd') || video.video_files[0];
                return vidFile ? vidFile.link : video.image;
            });

            res.json(results);
        } else {
            res.json(fallbacks);
        }

    } catch (error) {
        console.error('Pexels Controller Error:', error.message);
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
