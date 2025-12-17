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
            2. Select 3-5 keywords for searching a relevant background video on Pexels (e.g., "storm", "abstract technology", "ocean waves").
            3. Define a color theme (hex codes) and font family that matches the mood.
            4. **Agent Response (text)**: Write a short, meta-commentary response describing *how* you are changing the site. Do NOT answer as a chatbot. 
               - Bad: "Sure, I can help you with that. Here is a dark theme."
               - Good: "I see you're looking for a mysterious vibe. I'm darkening the interface and setting a stormy background to match."
               - Good: "Switching to a professional look with a clean, minimal layout and a corporate aesthetic."

            Return ONLY a JSON object with this structure:
            {
                "text": "Your agent response here",
                "mood": "string",
                "keywords": "string",
                "theme": {
                    "primaryColor": "hex string",
                    "secondaryColor": "hex string",
                    "accentColor": "hex string",
                    "fontFamily": "string",
                    "backgroundColor": "hex string",
                    "textColor": "hex string"
                }
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
