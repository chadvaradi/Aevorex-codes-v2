import { useState } from 'react';

// Chevron Down Icon
const ChevronDownIcon = () => (
  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="6,9 12,15 18,9" />
  </svg>
);

const languages = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'hu', name: 'Magyar', flag: '🇭🇺' },
];

export const LanguageSwitch = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentLang, setCurrentLang] = useState('en');

  const handleLanguageChange = (langCode: string) => {
    setCurrentLang(langCode);
    setIsOpen(false);
    
    // Here you would typically call i18n.changeLanguage(langCode)
    // For now, we'll just store it in localStorage
    localStorage.setItem('language', langCode);
  };

  const currentLanguage = languages.find(lang => lang.code === currentLang) || languages[0];

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 text-sm font-medium 
                   text-neutral-600 dark:text-neutral-400 
                   hover:text-primary-600 dark:hover:text-primary-400
                   hover:bg-neutral-100 dark:hover:bg-neutral-800
                   rounded-lg transition-smooth"
      >
        <span>{currentLanguage.flag}</span>
        <span>{currentLanguage.code.toUpperCase()}</span>
        <ChevronDownIcon />
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown */}
          <div className="absolute top-full right-0 mt-1 w-36 z-20
                          bg-white dark:bg-neutral-800 
                          border border-neutral-200 dark:border-neutral-700
                          rounded-lg shadow-lg py-2">
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => handleLanguageChange(lang.code)}
                className={`w-full flex items-center gap-3 px-3 py-2 text-sm text-left
                           hover:bg-neutral-50 dark:hover:bg-neutral-700
                           transition-colors duration-150
                           ${currentLang === lang.code 
                             ? 'text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/20' 
                             : 'text-neutral-700 dark:text-neutral-300'
                           }`}
              >
                <span>{lang.flag}</span>
                <span>{lang.name}</span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}; 