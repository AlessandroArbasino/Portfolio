import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { FileText, Download, Eye } from 'lucide-react';
import { getDocuments, Document } from '../../api';
import { useLanguage } from '../context/LanguageContext';

export function Documents() {
    const { fixedTexts } = useLanguage();
    const t = fixedTexts?.documents;
    const [documents, setDocuments] = useState<Document[]>([]);

    useEffect(() => {
        getDocuments()
            .then((docs) => setDocuments(docs))
            .catch((err) => console.error("Failed to load documents", err));
    }, []);

    return (
        <section id="documents" className="flex flex-col justify-center px-4 py-8">
            <div className="max-w-4xl mx-auto w-full">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                >
                    <h2 className="text-white mb-4 text-center">{t?.title || 'Documenti'}</h2>
                    <p className="text-white/70 text-center mb-12">
                        {t?.subtitle || 'Scarica o visualizza i miei documenti'}
                    </p>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {documents.map((doc, index) => (
                        <motion.div
                            key={doc._id}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6, delay: index * 0.1 }}
                            className="bg-white/5 backdrop-blur-sm rounded-lg p-6 border border-white/10 hover:border-white/20 hover:bg-white/10 transition-all group flex flex-col"
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div className="p-3 bg-white/10 rounded-lg group-hover:bg-white/20 transition-colors">
                                    <FileText className="text-white w-6 h-6" />
                                </div>
                                <div className="flex gap-2">
                                    <a
                                        href={doc.fileUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="p-2 text-white/60 hover:text-white transition-colors"
                                        title="Visualizza"
                                    >
                                        <Eye size={20} />
                                    </a>
                                    <a
                                        href={doc.fileUrl}
                                        download
                                        className="p-2 text-white/60 hover:text-white transition-colors"
                                        title="Scarica"
                                    >
                                        <Download size={20} />
                                    </a>
                                </div>
                            </div>

                            <h3 className="text-white mb-2">{doc.title}</h3>
                            <p className="text-white/60 text-sm flex-grow">{doc.description}</p>

                            <div className="mt-4 pt-4 border-t border-white/5 flex justify-between items-center">
                                <span className="text-xs text-white/40 uppercase tracking-wider">{doc.type}</span>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
