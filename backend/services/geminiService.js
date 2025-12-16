import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export const getGeminiResponse = async (history, message) => {
    try {
        const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash-lite' });

        // 1. Generate Chat Response (Stateless but with history)
        // Construct the full conversation history for the "contents" parameter
        const contents = history.map(msg => ({
            role: msg.role === 'client' ? 'user' : 'model', // Map DB/Client roles to Gemini roles
            parts: [{ text: msg.content }]
        }));

        // Add the new user message
        contents.push({
            role: 'user',
            parts: [{ text: message }]
        });

        console.log("Gemini Contents:", contents);

        const result = await model.generateContent({ contents });
        const responseText = result.response.text();

        // 2. Extract Mood and Keywords (Separate prompt or combined if complex, simple prompt here)
        // Using a separate call for cleaner structured output specifically for Storyblocks
        const analysisModel = genAI.getGenerativeModel({ model: 'gemini-2.5-flash-lite', generationConfig: { responseMimeType: "application/json" } });
        const analysisPrompt = `
      Analyze the following user message and conversation context to determine the "mood", relevant "keywords" for a video background search, and a "theme" (colors and font) that matches the mood.
      User Message: "${message}"
      Context Summary: ${responseText.substring(0, 100)}...
      
      Return JSON: { 
        "mood": "string", 
        "keywords": "string",
        "theme": {
            "primaryColor": "hex color string (e.g. #ff0000)",
            "secondaryColor": "hex color string",
            "accentColor": "hex color string",
            "fontFamily": "string (sans-serif, serif, monospace, or a specific google font name if common)"
        }
      }
      Example: { 
        "mood": "happy", 
        "keywords": "nature, sun, flowers",
        "theme": { "primaryColor": "#FFD700", "secondaryColor": "#87CEEB", "accentColor": "#FFFFFF", "fontFamily": "sans-serif" }
      }
    `;

        const analysisResult = await analysisModel.generateContent(analysisPrompt);
        const analysisJson = await analysisResult.response.text();
        let analysis = { mood: 'neutral', keywords: 'abstract', theme: null };

        try {
            analysis = JSON.parse(analysisJson);
        } catch (e) {
            console.error("Failed to parse Gemini analysis JSON", e);
        }

        console.log("Gemini Analysis:", analysis);

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
        const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash-lite', generationConfig: { responseMimeType: "application/json" } });

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
