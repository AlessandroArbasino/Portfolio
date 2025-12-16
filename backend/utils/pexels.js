import axios from 'axios';

const PEXELS_API_KEY = process.env.PEXELS_API_KEY;

export const searchVideos = async (query, perPage = 1) => {
    if (!PEXELS_API_KEY) {
        console.warn('Pexels API Key not found in environment variables.');
        return [];
    }

    try {
        const response = await axios.get('https://api.pexels.com/videos/search', {
            headers: {
                Authorization: PEXELS_API_KEY
            },
            params: {
                query,
                per_page: perPage,
                orientation: 'landscape',
                size: 'medium'
            }
        });

        if (response.data && response.data.videos) {
            return response.data.videos;
        }
        return [];
    } catch (error) {
        console.error('Pexels API Error:', error.response ? error.response.data : error.message);
        return [];
    }
};
