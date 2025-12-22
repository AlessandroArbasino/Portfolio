import Project from '../models/Project.js';
import FixedText from '../models/FixedText.js';
import { translateContent } from '../services/geminiService.js';

export const translateFixedTexts = async (req, res) => {
    try {
        const { id, lang } = req.query;

        if (!lang) {
            return res.status(400).json({ message: 'Target language (lang) is required' });
        }

        const query = { language: 'it' };
        if (id) {
            query.section = id;
        }


        const englishTexts = await FixedText.find(query);

        if (englishTexts.length === 0) {
            return res.status(404).json({ message: 'No English fixed texts found' });
        }

        const results = [];
        for (const doc of englishTexts) {
            try {
                // Ensure the content (Mongoose Map) is converted to a plain object for JSON serialization
                const contentToTranslate = doc.content instanceof Map ? Object.fromEntries(doc.content) : doc.content;

                const translatedContent = await translateContent(contentToTranslate, lang);

                await FixedText.findOneAndUpdate(
                    { section: doc.section, language: lang },
                    {
                        section: doc.section,
                        language: lang,
                        content: translatedContent
                    },
                    { new: true, upsert: true }
                );

                results.push({ section: doc.section, status: 'success' });
            } catch (err) {
                console.error(`Translation failed for section ${doc.section}`, err);
                results.push({ section: doc.section, status: 'error', error: err.message });
            }
        }

        res.json({ message: 'Fixed texts translation completed', results });
    } catch (error) {
        console.error('Translate Fixed Texts Error:', error);
        res.status(500).json({ message: error.message });
    }
};

export const translateProjects = async (req, res) => {
    try {
        const { id, lang } = req.query;

        if (!id || !lang) {
            return res.status(400).json({ message: 'Project ID and target language (lang) are required' });
        }

        let projectId = `${id}_en`;

        console.log(projectId);

        // Always take English as source
        const sourceDoc = await Project.findOne({ id: projectId, language: 'en' });

        if (!sourceDoc) {
            // Try to find it by ID without language filter if not found specifically with 'en'
            // but the requirement says "sempre preso il testo in inglese"
            return res.status(404).json({ message: 'English version of the project not found' });
        }

        const sourceData = sourceDoc.toObject();

        // Extract only translatable fields
        const contentToTranslate = {
            name: sourceData.name,
            description: sourceData.description,
            challenges: sourceData.challenges?.map(c => ({
                problem: c.problem,
                solution: c.solution
            })),
            subProjects: sourceData.subProjects?.map(sp => ({
                name: sp.name,
                description: sp.description,
                challenges: sp.challenges?.map(c => ({
                    problem: c.problem,
                    solution: c.solution
                }))
            }))
        };

        const translatedData = await translateContent(contentToTranslate, lang);

        // Merge translated data back into source data
        const mergedData = {
            ...sourceData,
            name: translatedData.name || sourceData.name,
            description: translatedData.description || sourceData.description,
            challenges: translatedData.challenges || sourceData.challenges,
            subProjects: sourceData.subProjects?.map((sp, idx) => {
                const translatedSP = translatedData.subProjects?.[idx];
                return {
                    ...sp,
                    name: translatedSP?.name || sp.name,
                    description: translatedSP?.description || sp.description,
                    challenges: translatedSP?.challenges || sp.challenges
                };
            }),
            id: `${id}_${lang}`,
            language: lang
        };

        // Remove Mongoose-specific fields before upsert
        delete mergedData._id;
        delete mergedData.createdAt;
        delete mergedData.updatedAt;
        delete mergedData.__v;

        const newId = mergedData.id;
        const savedDoc = await Project.findOneAndUpdate(
            { id: newId },
            mergedData,
            { new: true, upsert: true }
        );

        res.json({ message: 'Project translation completed', result: { id: newId, status: 'success' } });
    } catch (error) {
        console.error('Translate Projects Error:', error);
        res.status(500).json({ message: error.message });
    }
};
