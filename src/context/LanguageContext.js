import { createContext, useContext, useState, useEffect } from 'react';
import { translations, t as translate, getDirection, getTextAlign } from '../utils/translations';

// Create the language context
const LanguageContext = createContext();

// Language provider component
export const LanguageProvider = ({ children }) => {
  // Initialize language from localStorage or default to 'en'
  const [language, setLanguage] = useState(() => {
    try {
      const savedLanguage = localStorage.getItem('dawwarli_language');
      return savedLanguage && ['en', 'ar'].includes(savedLanguage) ? savedLanguage : 'en';
    } catch (error) {
      console.warn('Could not access localStorage for language preference');
      return 'en';
    }
  });

  // Save language preference when it changes
  useEffect(() => {
    try {
      localStorage.setItem('dawwarli_language', language);
    } catch (error) {
      console.warn('Could not save language preference to localStorage');
    }
    
    // Update document direction and language
    document.documentElement.dir = getDirection(language);
    document.documentElement.lang = language;
    
    // Add/remove RTL class for styling
    if (language === 'ar') {
      document.body.classList.add('rtl');
      document.body.classList.remove('ltr');
    } else {
      document.body.classList.add('ltr');
      document.body.classList.remove('rtl');
    }
  }, [language]);

  // Function to change language
  const changeLanguage = (newLanguage) => {
    if (['en', 'ar'].includes(newLanguage)) {
      setLanguage(newLanguage);
    }
  };

  // Translation function with current language
  const t = (key, params = {}) => {
    return translate(key, params, language);
  };

  // Get available languages
  const availableLanguages = [
    { code: 'en', name: 'English', nativeName: 'English' },
    { code: 'ar', name: 'Arabic', nativeName: 'العربية' }
  ];

  // Context value
  const value = {
    language,
    changeLanguage,
    t,
    direction: getDirection(language),
    textAlign: getTextAlign(language),
    isRTL: language === 'ar',
    availableLanguages,
    translations: translations[language]
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

// Hook to use language context
export const useLanguage = () => {
  const context = useContext(LanguageContext);
  
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  
  return context;
};

// Higher-order component for components that need language
export const withLanguage = (Component) => {
  return function LanguageWrappedComponent(props) {
    const language = useLanguage();
    return <Component {...props} language={language} />;
  };
};