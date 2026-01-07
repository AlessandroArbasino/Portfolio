export const verifyTranslateApiKey = (req, res, next) => {
    const apiKey = req.headers['x-api-key'];
    const validApiKey = process.env.TRANSLATE_CONTENT_API_KEY;

    if (!validApiKey) {
        console.error('TRANSLATE_CONTENT_API_KEY is not set in environment variables.');
        return res.status(500).json({ message: 'Server configuration error' });
    }

    if (!apiKey || apiKey !== validApiKey) {
        return res.status(401).json({ message: 'Unauthorized: Invalid or missing API Key' });
    }

    next();
};
