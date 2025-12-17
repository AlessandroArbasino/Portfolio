import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getFixedTexts, FixedTexts } from '../../api';

export type Language = string;

interface LanguageContextType {
    language: Language;
    setLanguage: (lang: Language) => void;
    fixedTexts: FixedTexts | null;
    loading: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
    const [language, setLanguage] = useState<Language>('it');
    const [fixedTexts, setFixedTexts] = useState<FixedTexts | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        getFixedTexts(language)
            .then((data) => {
                setFixedTexts(data);
                setLoading(false);
            })
            .catch((error) => {
                console.error('Failed to fetch fixed texts:', error);
                setLoading(false);
            });
    }, [language]);

    return (
        <LanguageContext.Provider value={{ language, setLanguage, fixedTexts, loading }}>
            {children}
        </LanguageContext.Provider>
    );
}

export function useLanguage() {
    const context = useContext(LanguageContext);
    if (context === undefined) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
}
