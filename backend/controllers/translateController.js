import Project from '../models/Project.js';
import FixedText from '../models/FixedText.js';
import { translateContent } from '../services/geminiService.js';

export const translateFixedTexts = async (req, res) => {
    try {
        const { id, lang } = req.query;

        if (!lang) {
            return res.status(400).json({ message: 'Target language (lang) is required' });
        }

        // BULK TRANSLATION: If no ID provided, translate all fixed texts
        if (!id) {
            const sourceTexts = await FixedText.find({ language: 'en' });

            if (sourceTexts.length === 0) {
                return res.status(404).json({ message: 'No English fixed texts found' });
            }

            // Check which sections already exist in target language
            const existingSections = await FixedText.find({ language: lang }).distinct('section');
            const existingSectionsSet = new Set(existingSections);

            // Filter out sections that already have translations
            const textsToTranslate = sourceTexts.filter(doc => !existingSectionsSet.has(doc.section));

            if (textsToTranslate.length === 0) {
                return res.json({ message: 'All fixed texts already translated', results: [] });
            }

            // Prepare bulk data for translation
            const bulkData = {};
            textsToTranslate.forEach(doc => {
                const content = doc.content instanceof Map ? Object.fromEntries(doc.content) : doc.content;
                bulkData[doc.section] = content;
            });

            // Send all fixed texts to Gemini with structured instructions
            const translatedBulk = await translateContent({
                sections: bulkData,
                _instruction: `Translate all sections in the object. Return a JSON object with a 'sections' key containing an object where each key is a section name (e.g., 'hero', 'about', 'projects') and the value is the translated content object for that section. Maintain all section names exactly as provided.`
            }, lang);

            const results = [];

            // Process each translated section
            for (const doc of textsToTranslate) {
                try {
                    const translatedContent = translatedBulk.sections?.[doc.section];

                    if (!translatedContent) {
                        results.push({ section: doc.section, status: 'error', error: 'Translation missing' });
                        continue;
                    }

                    await FixedText.create({
                        section: doc.section,
                        language: lang,
                        content: translatedContent
                    });

                    results.push({ section: doc.section, status: 'success' });
                } catch (err) {
                    console.error(`Translation failed for section ${doc.section}`, err);
                    results.push({ section: doc.section, status: 'error', error: err.message });
                }
            }

            return res.json({ message: 'Bulk translation completed', results });
        }

        // SINGLE SECTION TRANSLATION
        // Check if translation already exists
        const existingTranslation = await FixedText.findOne({ section: id, language: lang });
        if (existingTranslation) {
            return res.json({ message: 'Translation already exists', result: { section: id, status: 'skipped' } });
        }

        const sourceDoc = await FixedText.findOne({ section: id, language: 'it' });

        if (!sourceDoc) {
            return res.status(404).json({ message: 'Italian version of the section not found' });
        }

        // Ensure the content (Mongoose Map) is converted to a plain object for JSON serialization
        const contentToTranslate = sourceDoc.content instanceof Map ? Object.fromEntries(sourceDoc.content) : sourceDoc.content;

        const translatedContent = await translateContent(contentToTranslate, lang);

        await FixedText.findOneAndUpdate(
            { section: id, language: lang },
            {
                section: id,
                language: lang,
                content: translatedContent
            },
            { new: true, upsert: true }
        );

        res.json({ message: 'Fixed text translation completed', result: { section: id, status: 'success' } });
    } catch (error) {
        console.error('Translate Fixed Texts Error:', error);
        res.status(500).json({ message: error.message });
    }
};

export const translateProjects = async (req, res) => {
    try {
        const { id, lang } = req.query;

        if (!lang) {
            return res.status(400).json({ message: 'Target language (lang) is required' });
        }

        // BULK TRANSLATION: If no ID provided, translate all projects
        if (!id) {
            const sourceProjects = await Project.find({ language: 'en' });

            if (sourceProjects.length === 0) {
                return res.status(404).json({ message: 'No English projects found' });
            }

            // Check which projects already exist in target language
            const existingIds = await Project.find({ language: lang }).distinct('id');
            const existingBaseIds = new Set(existingIds.map(id => id.replace(`_${lang}`, '').replace('_en', '')));

            // Filter out projects that already have translations
            const projectsToTranslate = sourceProjects.filter(p => {
                const baseId = p.id.replace('_en', '');
                return !existingBaseIds.has(baseId);
            });

            if (projectsToTranslate.length === 0) {
                return res.json({ message: 'All projects already translated', results: [] });
            }

            // Prepare bulk data for translation
            const bulkData = projectsToTranslate.map(doc => {
                const sourceData = doc.toObject();
                return {
                    projectId: sourceData.id.replace('_en', ''),
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
            });

            // Send all projects to Gemini with structured instructions
            const translatedBulk = await translateContent({
                projects: bulkData,
                _instruction: `Translate all projects in the array. Return a JSON object with a 'projects' array where each element has the same projectId and all text fields translated to ${lang}. Maintain the exact same array order and structure.`
            }, lang);

            const results = [];

            // Process each translated project
            for (let i = 0; i < projectsToTranslate.length; i++) {
                try {
                    const sourceDoc = projectsToTranslate[i];
                    const sourceData = sourceDoc.toObject();
                    const translatedData = translatedBulk.projects?.[i];

                    if (!translatedData) {
                        results.push({ id: sourceData.id, status: 'error', error: 'Translation missing' });
                        continue;
                    }

                    const baseId = sourceData.id.replace('_en', '');
                    const newId = `${baseId}_${lang}`;

                    // Merge translated data back
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
                        id: newId,
                        language: lang
                    };

                    delete mergedData._id;
                    delete mergedData.createdAt;
                    delete mergedData.updatedAt;
                    delete mergedData.__v;

                    await Project.create(mergedData);
                    results.push({ id: newId, status: 'success' });
                } catch (err) {
                    console.error(`Translation failed for project ${projectsToTranslate[i].id}`, err);
                    results.push({ id: projectsToTranslate[i].id, status: 'error', error: err.message });
                }
            }

            return res.json({ message: 'Bulk translation completed', results });
        }

        // SINGLE PROJECT TRANSLATION
        let projectId = `${id}_en`;

        // Check if translation already exists
        const existingTranslation = await Project.findOne({ id: `${id}_${lang}`, language: lang });
        if (existingTranslation) {
            return res.json({ message: 'Translation already exists', result: { id: `${id}_${lang}`, status: 'skipped' } });
        }

        // Always take English as source
        const sourceDoc = await Project.findOne({ id: projectId, language: 'en' });

        if (!sourceDoc) {
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
