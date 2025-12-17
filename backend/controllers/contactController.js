import ContactInfo from '../models/ContactInfo.js';

export const getContact = async (req, res) => {
  try {
    let doc = await ContactInfo.findOne({ key: 'default' });
    if (!doc) {
      doc = await ContactInfo.create({
        key: 'default',
        items: [
          {
            id: 'email',
            label: 'Email',
            value: 'mario.rossi@email.com',
            href: 'mailto:mario.rossi@email.com'
          },
          {
            id: 'linkedin',
            label: 'LinkedIn',
            value: 'linkedin.com/in/mariorossi',
            href: 'https://linkedin.com'
          },
          {
            id: 'github',
            label: 'GitHub',
            value: 'github.com/mariorossi',
            href: 'https://github.com'
          }
        ]
      });
    }
    res.json(doc.items);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
