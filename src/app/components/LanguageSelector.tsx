import { useLanguage, Language } from '../context/LanguageContext';
import { Globe } from 'lucide-react';

export function LanguageSelector() {
    const { language, setLanguage } = useLanguage();

    const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setLanguage(e.target.value as Language);
    };

    return (
        <div className="absolute top-4 right-4 z-50 flex items-center gap-2 bg-black/20 backdrop-blur-md p-2 rounded-full border border-white/10">
            <Globe size={16} className="text-white/80" />
            <select
                value={language}
                onChange={handleChange}
                className="bg-transparent text-white/90 text-sm focus:outline-none cursor-pointer [&>option]:bg-gray-900"
            >
                <option value="it">🇮🇹 IT</option>
                <option value="en">🇬🇧 EN</option>
                <option value="es">🇪🇸 ES</option>
                <option value="fr">🇫🇷 FR</option>
                <option value="de">🇩🇪 DE</option>
            </select>
        </div>
    );
}
