import Language from '../models/Language.js';

export const getLanguages = async (req, res) => {
  try {
    const languages = await Language.find({}).sort({ id: 1 });
    res.json(languages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
