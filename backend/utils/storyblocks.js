import crypto from 'crypto';

export const generateStoryblocksAuth = () => {
    const publicKey = process.env.STORYBLOCKS_PUBLIC_KEY;
    const privateKey = process.env.STORYBLOCKS_PRIVATE_KEY;

    if (!publicKey || !privateKey) {
        console.warn('Storyblocks keys not found in environment variables.');
        return null;
    }

    // Expires in 1 hour (3600 seconds)
    const expires = Math.floor(Date.now() / 1000) + 3600;

    // HMAC generation: path is typically required for some APIs, but often just search requires standard params.
    // Storyblocks V2 API documentation says: 
    // HMAC = HMAC-SHA256(private_key, path + expires)
    // For search, the path is often just /api/v2/videos/search

    const path = '/api/v2/videos/search';
    const hmacBuilder = crypto.createHmac('sha256', privateKey);
    hmacBuilder.update(path + expires);
    const hmac = hmacBuilder.digest('hex');

    return {
        APIKEY: publicKey,
        EXPIRES: expires,
        HMAC: hmac
    };
};
