import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export const getGeminiResponse = async (history, message) => {
    try {
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

        // 1. Generate Chat Response
        const chat = model.startChat({
            history: history.map(msg => ({
                role: msg.role === 'client' ? 'user' : 'model', // Map DB/Client roles to Gemini roles
                parts: [{ text: msg.content }]
            }))
        });

        const result = await chat.sendMessage(message);
        const responseText = result.response.text();

        // 2. Extract Mood and Keywords (Separate prompt or combined if complex, simple prompt here)
        // Using a separate call for cleaner structured output specifically for Storyblocks
        const analysisModel = genAI.getGenerativeModel({ model: 'gemini-1.5-flash', generationConfig: { responseMimeType: "application/json" } });
        const analysisPrompt = `
      Analyze the following user message and conversation context to determine the "mood" and relevant "keywords" for a video background search.
      User Message: "${message}"
      Context Summary: ${responseText.substring(0, 100)}...
      
      Return JSON: { "mood": "string", "keywords": "string" }
      Example: { "mood": "happy", "keywords": "nature, sun, flowers" }
    `;

        const analysisResult = await analysisModel.generateContent(analysisPrompt);
        const analysisJson = await analysisResult.response.text();
        let analysis = { mood: 'neutral', keywords: 'abstract' };

        try {
            analysis = JSON.parse(analysisJson);
        } catch (e) {
            console.error("Failed to parse Gemini analysis JSON", e);
        }

        return {
            text: responseText,
            ...analysis
        };

    } catch (error) {
        console.error('Gemini Service Error:', error);
        throw new Error('Failed to get response from AI');
    }
};

export const translateContent = async (content, targetLanguage) => {
    try {
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash', generationConfig: { responseMimeType: "application/json" } });

        const prompt = `
            You are a professional translator. 
            Translate the values of the following JSON object into ${targetLanguage}. 
            Do NOT translate the keys.
            Do NOT translate proper names if not appropriate (e.g. brand names, technical terms like React, MongoDB).
            Return ONLY the JSON object.

            Input JSON:
            ${JSON.stringify(content)}
        `;

        const result = await model.generateContent(prompt);
        const translatedJson = result.response.text();
        return JSON.parse(translatedJson);

    } catch (error) {
        console.error(`Gemini Translation Error (${targetLanguage}):`, error);
        throw new Error(`Failed to translate to ${targetLanguage}`);
    }
};
