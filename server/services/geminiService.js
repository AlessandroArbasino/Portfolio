import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export const getGeminiResponse = async (history, message) => {
    try {
        const model = genAI.getGenerativeModel({
            model: 'gemini-2.5-flash-lite',
            generationConfig: { responseMimeType: "application/json" }
        });

        // Construct the full conversation history for context
        const historyText = history.map(msg => `${msg.role === 'client' ? 'User' : 'Agent'}: ${msg.content}`).join('\n');

        const prompt = `
            You are a "Site Mood Agent" for a portfolio website. Your goal is to interpret the user's message to adjust the website's visual theme (colors, fonts) and background video.

            Context:
            ${historyText}

            User Message: "${message}"

            Instructions:
            1. Analyze the user's message to determine the desired mood (e.g., "dark", "energetic", "calm", "professional").
            2. Select 3-5 keywords for searching a relevant background video on Pexels.
            3. **Agent Response (text)**: Write a short, meta-commentary response describing *how* the site is changing (e.g., the new atmosphere). Do NOT answer as a chatbot.
            4. **CRITICAL**: Do NOT include a "theme" field in the JSON response. The theme will be derived automatically from the video.
            5. **Language**: The text field in the response MUST be in the SAME language as the user's input message.

            Return ONLY a JSON object with this structure:
            {
                "text": "Your agent response here",
                "mood": "string",
                "keywords": "string"
            }
        `;

        console.log("Gemini Prompt constructed.");

        const result = await model.generateContent(prompt);
        const responseJson = result.response.text();

        let parsedResult = {
            text: "I updated the mood for you.",
            mood: 'neutral',
            keywords: 'abstract',
            theme: {}
        };

        try {
            parsedResult = JSON.parse(responseJson);
        } catch (e) {
            console.error("Failed to parse Gemini JSON:", e);
            // Fallback if JSON is broken but maybe contains text? Unlikely with JSON mode but safe to handle.
        }

        console.log("Gemini Result:", parsedResult);

        return parsedResult;

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
