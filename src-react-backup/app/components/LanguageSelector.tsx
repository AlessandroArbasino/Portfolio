import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Globe, Check } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { getLanguages, LanguageDto } from '../../api';

export function LanguageSelector() {
  const [isOpen, setIsOpen] = useState(false);
  const { language, setLanguage } = useLanguage();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [languages, setLanguages] = useState<LanguageDto[]>([]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    getLanguages()
      .then((data) => setLanguages(data))
      .catch(() => setLanguages([]));
  }, []);

  const currentLanguage = languages.find((lang) => lang.id === language);

  return (
    <div className="fixed top-4 right-4 z-50">
      <div ref={dropdownRef} className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 backdrop-blur-sm border border-white/10 hover:border-white/20 transition-colors text-white/80 hover:text-white"
        >
          <Globe size={18} />
          <span className="text-sm hidden md:inline">{currentLanguage?.text}</span>
        </button>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="absolute right-0 mt-2 w-48 bg-gray-900/95 backdrop-blur-md rounded-lg border border-white/10 shadow-xl overflow-hidden z-50"
            >
              {languages.map((lang) => (
                <button
                  key={lang.id}
                  onClick={() => {
                    setLanguage(lang.id);
                    setIsOpen(false);
                  }}
                  className="w-full flex items-center justify-between px-4 py-3 hover:bg-white/5 transition-colors text-white/80 hover:text-white"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-sm">{lang.text}</span>
                  </div>
                  {language === lang.id && (
                    <Check size={16} className="text-green-400" />
                  )}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
