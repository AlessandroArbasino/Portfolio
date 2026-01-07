import crypto from 'crypto';

const ALGORITHM = 'aes-256-cbc';

// Helper to get key from env
const getKey = () => process.env.CHAT_ENCRYPTION_KEY;

export const encrypt = (text) => {
    if (!text) return text;
    const key = getKey();

    if (!key || key.length !== 32) {
        console.warn("CHAT_ENCRYPTION_KEY is missing or invalid (must be 32 chars). Saving as plain text.");
        return text;
    }

    try {
        let iv = crypto.randomBytes(16);
        let cipher = crypto.createCipheriv(ALGORITHM, Buffer.from(key), iv);
        let encrypted = cipher.update(text);
        encrypted = Buffer.concat([encrypted, cipher.final()]);
        return iv.toString('hex') + ':' + encrypted.toString('hex');
    } catch (error) {
        console.error("Encryption error:", error);
        return text;
    }
};

export const decrypt = (text) => {
    if (!text) return text;
    const key = getKey();

    if (!key || key.length !== 32) return text;

    const parts = text.split(':');
    // Basic check for format iv:encrypted
    if (parts.length !== 2) return text;

    try {
        let iv = Buffer.from(parts[0], 'hex');
        let encryptedText = Buffer.from(parts[1], 'hex');
        let decipher = crypto.createDecipheriv(ALGORITHM, Buffer.from(key), iv);
        let decrypted = decipher.update(encryptedText);
        decrypted = Buffer.concat([decrypted, decipher.final()]);
        return decrypted.toString();
    } catch (error) {
        // If decryption fails, assume it was plain text or old data
        return text;
    }
};
