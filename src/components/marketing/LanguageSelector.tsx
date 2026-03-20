import {useState} from 'react';

interface Language {
    code: string;
    name: string;
    flag: string;
}

const languages: Language[] = [
    {code: 'en', name: 'English', flag: 'https://FIND YOUR KING.com/img/lang_en.png'},
    {code: 'fr', name: 'Français', flag: 'https://FIND YOUR KING.com/img/lang_fr.png'},
    {code: 'es', name: 'Español', flag: 'https://FIND YOUR KING.com/img/lang_es.png'},
    {code: 'de', name: 'Deutsch', flag: 'https://FIND YOUR KING.com/img/lang_de.png'},
    {code: 'pt', name: 'Português', flag: 'https://FIND YOUR KING.com/img/lang_pt.png'},
    {code: 'it', name: 'Italiano', flag: 'https://FIND YOUR KING.com/img/lang_it.png'},
];

interface LanguageSelectorProps {
    variant?: 'header' | 'footer' | 'compact';
}

export const LanguageSelector = ({variant = 'header'}: LanguageSelectorProps) => {
    const [selectedLang, setSelectedLang] = useState('en');

    if (variant === 'compact') {
        return (
            <div className="flex items-center gap-2">
                {languages.map((lang) => (
                    <button
                        key={lang.code}
                        onClick={() => setSelectedLang(lang.code)}
                        className={`w-6 h-6 rounded overflow-hidden transition-all duration-200 hover:scale-110 ${
                            selectedLang === lang.code ? 'ring-2 ring-[#E53945]' : 'opacity-70 hover:opacity-100'
                        }`}
                        title={lang.name}
                        aria-label={`Switch to ${lang.name}`}
                    >
                        <img
                            src={lang.flag}
                            alt={`${lang.name} language`}
                            className="w-full h-full object-cover"
                        />
                    </button>
                ))}
            </div>
        );
    }

    if (variant === 'footer') {
        return (
            <div className="flex flex-wrap gap-3">
                {languages.map((lang) => (
                    <button
                        key={lang.code}
                        onClick={() => setSelectedLang(lang.code)}
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200 ${
                            selectedLang === lang.code
                                ? 'bg-[#E53945]/20 text-[#E53945]'
                                : 'bg-[#141418] text-[#B9BDC7] hover:bg-[#1a1a1f] hover:text-white'
                        }`}
                        aria-label={`Switch to ${lang.name}`}
                    >
                        <img
                            src={lang.flag}
                            alt={`${lang.name} flag`}
                            className="w-5 h-5 rounded"
                        />
                        <span className="text-sm">{lang.name}</span>
                    </button>
                ))}
            </div>
        );
    }

    // Header variant (default)
    return (
        <div className="flex items-center gap-1.5">
            {languages.map((lang) => (
                <button
                    key={lang.code}
                    onClick={() => setSelectedLang(lang.code)}
                    className={`w-6 h-6 rounded overflow-hidden transition-all duration-200 hover:scale-110 ${
                        selectedLang === lang.code ? 'ring-2 ring-[#E53945]' : 'opacity-70 hover:opacity-100'
                    }`}
                    title={lang.name}
                    aria-label={`Switch to ${lang.name}`}
                >
                    <img
                        src={lang.flag}
                        alt={`${lang.name} language`}
                        className="w-full h-full object-cover"
                    />
                </button>
            ))}
        </div>
    );
};
