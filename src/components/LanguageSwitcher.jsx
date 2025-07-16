import { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';

export const LanguageSwitcher = ({ variant = 'button' }) => {
  const { language, changeLanguage, availableLanguages, t, isRTL } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);

  // Button variant - simple toggle between en/ar
  if (variant === 'button') {
    const currentLang = availableLanguages.find(lang => lang.code === language);
    const otherLang = availableLanguages.find(lang => lang.code !== language);

    return (
      <button
        onClick={() => changeLanguage(otherLang.code)}
        className={`
          px-3 py-2 rounded-lg border border-gray-300 
          bg-white hover:bg-gray-50 transition-colors
          text-sm font-medium text-gray-700 hover:text-gray-900
          ${isRTL ? 'font-arabic' : ''}
        `}
        title={`${t('switchTo')} ${otherLang.nativeName}`}
      >
        <span className="flex items-center gap-2">
          <span className="text-lg">🌐</span>
          <span>{otherLang.nativeName}</span>
        </span>
      </button>
    );
  }

  // Dropdown variant - shows all available languages
  if (variant === 'dropdown') {
    return (
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`
            px-3 py-2 rounded-lg border border-gray-300 
            bg-white hover:bg-gray-50 transition-colors
            text-sm font-medium text-gray-700 hover:text-gray-900
            flex items-center gap-2
            ${isRTL ? 'font-arabic' : ''}
          `}
        >
          <span className="text-lg">🌐</span>
          <span>{availableLanguages.find(lang => lang.code === language)?.nativeName}</span>
          <span className={`transition-transform ${isOpen ? 'rotate-180' : ''}`}>
            ▼
          </span>
        </button>

        {isOpen && (
          <div className={`
            absolute top-full mt-1 py-1 
            bg-white border border-gray-300 rounded-lg shadow-lg
            min-w-full z-50
            ${isRTL ? 'right-0' : 'left-0'}
          `}>
            {availableLanguages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => {
                  changeLanguage(lang.code);
                  setIsOpen(false);
                }}
                className={`
                  w-full px-4 py-2 text-left hover:bg-gray-100 transition-colors
                  text-sm ${language === lang.code ? 'font-bold text-blue-600' : 'text-gray-700'}
                  ${isRTL ? 'text-right font-arabic' : 'text-left'}
                `}
              >
                <span className="flex items-center gap-2">
                  <span>{lang.code === 'ar' ? '🇸🇦' : '🇺🇸'}</span>
                  <span>{lang.nativeName}</span>
                  {language === lang.code && <span className="ml-auto">✓</span>}
                </span>
              </button>
            ))}
          </div>
        )}

        {/* Click outside to close */}
        {isOpen && (
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
          />
        )}
      </div>
    );
  }

  // Compact variant - just flags
  if (variant === 'compact') {
    return (
      <div className="flex gap-1">
        {availableLanguages.map((lang) => (
          <button
            key={lang.code}
            onClick={() => changeLanguage(lang.code)}
            className={`
              w-8 h-8 rounded-full border-2 transition-all
              flex items-center justify-center text-lg
              ${language === lang.code 
                ? 'border-blue-500 bg-blue-50' 
                : 'border-gray-300 bg-white hover:border-gray-400'
              }
            `}
            title={lang.nativeName}
          >
            {lang.code === 'ar' ? '🇸🇦' : '🇺🇸'}
          </button>
        ))}
      </div>
    );
  }

  // Toggle variant - switch style
  if (variant === 'toggle') {
    return (
      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-600">{t('language')}:</span>
        <div className="flex bg-gray-100 rounded-lg p-1">
          {availableLanguages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => changeLanguage(lang.code)}
              className={`
                px-3 py-1 rounded-md text-sm font-medium transition-all
                ${language === lang.code
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
                }
                ${lang.code === 'ar' ? 'font-arabic' : ''}
              `}
            >
              {lang.code === 'ar' ? 'عربي' : 'EN'}
            </button>
          ))}
        </div>
      </div>
    );
  }

  return null;
};

// Usage examples:
// <LanguageSwitcher variant="button" />
// <LanguageSwitcher variant="dropdown" />
// <LanguageSwitcher variant="compact" />
// <LanguageSwitcher variant="toggle" />