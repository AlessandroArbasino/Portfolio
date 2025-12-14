import Project from '../models/Project.js';
import FixedText from '../models/FixedText.js';
import { translateContent } from '../services/geminiService.js';

export const translateItem = async (req, res) => {
    try {
        const { id, type } = req.body;
        const targetLanguages = ['en', 'es', 'fr', 'de'];

        if (!id || !type) {
            return res.status(400).json({ message: 'ID and type (project/fixed) are required' });
        }

        let sourceDoc;
        let Model;
        let idField;

        // 1. Fetch Source Document
        if (type === 'project') {
            Model = Project;
            idField = 'id';
            sourceDoc = await Project.findOne({ id });
        } else if (type === 'fixed') {
            Model = FixedText;
            idField = 'section';
            sourceDoc = await FixedText.findOne({ section: id });
        } else {
            return res.status(400).json({ message: 'Invalid type. Use "project" or "fixed"' });
        }

        if (!sourceDoc) {
            return res.status(404).json({ message: 'Document not found' });
        }

        const sourceData = sourceDoc.toObject();
        delete sourceData._id;
        delete sourceData.createdAt;
        delete sourceData.updatedAt;
        delete sourceData.__v;

        const results = [];

        // 2. Iterate Languages
        for (const lang of targetLanguages) {
            try {
                // 3. Translate
                // We pass the whole object. Gemini is instructed to translate values.
                // We trust the prompt to handle URLs/tech stacks reasonably well or we accept minor over-translation risks 
                // as per "pass whole body" instruction.
                const translatedData = await translateContent(sourceData, lang);

                // 4. Update ID/Section
                // Append _lang to the original ID
                const newId = `${sourceData[idField]}_${lang}`;
                translatedData[idField] = newId;

                // 5. Save (Upsert)
                const query = {};
                query[idField] = newId;

                const savedDoc = await Model.findOneAndUpdate(
                    query,
                    translatedData,
                    { new: true, upsert: true }
                );

                results.push({ lang, status: 'success', id: newId });

            } catch (err) {
                console.error(`Translation failed for ${lang}`, err);
                results.push({ lang, status: 'error', error: err.message });
            }
        }

        res.json({ message: 'Translation process completed', results });

    } catch (error) {
        console.error('Translate Controller Error:', error);
        res.status(500).json({ message: error.message });
    }
};
