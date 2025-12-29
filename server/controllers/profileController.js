import PersonalProfile from '../models/PersonalProfile.js';
import FixedText from '../models/FixedText.js';

// Get profile (filter by language)
export const getProfile = async (req, res) => {
    try {
        const lang = req.query.lang || 'it';
        let profile = await PersonalProfile.findOne({ language: lang });

        // Fallback to Italian if requested language not found
        if (!profile && lang !== 'it') {
            profile = await PersonalProfile.findOne({ language: 'it' });
        }

        if (!profile) {
            return res.status(404).json({ message: 'Profile not found' });
        }

        res.json(profile);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Create or Update profile
export const createOrUpdateProfile = async (req, res) => {
    try {
        const { language = 'it', ...profileData } = req.body;

        const profile = await PersonalProfile.findOneAndUpdate(
            { language },
            { language, ...profileData },
            { new: true, upsert: true } // Create if not exists
        );

        res.json(profile);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};
