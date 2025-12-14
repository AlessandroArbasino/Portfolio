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

                // 4. Update ID/Section & Language
                // Append _lang to the original ID to keep it unique (though not strictly necessary for Project if filtering by lang, but good for ID unique constraint)
                const newId = `${sourceData[idField]}_${lang}`;
                translatedData[idField] = newId;
                translatedData.language = lang;

                // 5. Save (Upsert)
                const query = {};
                if (type === 'project') {
                    // For projects, we might rely on the unique ID
                    query[idField] = newId;
                } else {
                    // For FixedText, we use the compound index section + language
                    // But we modified the ID to include _lang so assuming we keep using that for uniqueness or query
                    // Ideally we should match on section + language
                    query.section = sourceData.section; // Keep original section name? 
                    // Wait, if I change the ID in translatedData, I'm changing the 'section' field.
                    // The requirement says "every string ... saved in db with language field".
                    // For FixedText, section is the ID. 

                    // Let's refine: 
                    // Project: id="1_en", language="en"
                    // FixedText: section="hero", language="en" (Compound Index)

                    // So for FixedText, I SHOULD NOT change the section name if I want to query by section=hero & language=en.
                    // BUT, previous implementation appended _lang.
                    // User said: "In the get... I want you to add filter on language".

                    // Strategy: 
                    // Project: Keep id unique constraint, so "1_en". 
                    // FixedText: Use section="hero" and language="en".

                    if (type === 'fixed') {
                        translatedData.section = sourceData.section; // Revert to original section name
                        query.section = sourceData.section;
                        query.language = lang;
                    } else {
                        query[idField] = newId;
                    }
                }
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
