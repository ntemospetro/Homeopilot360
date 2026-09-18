const fs = require('fs');
let file = fs.readFileSync('src/i18n/LanguageContext.tsx', 'utf8');

const newInitialLanguageLogic = `  const getInitialLanguage = (): LanguageCode => {
    try {
      const activeTh = getActiveTherapist();
      if (activeTh?.preferredLanguage && LANGUAGES.some(l => l.code === activeTh.preferredLanguage)) {
        return activeTh.preferredLanguage;
      }
      
      const stored = localStorage.getItem(STORAGE_LANG_KEY) as LanguageCode | null;
      if (stored && LANGUAGES.some(l => l.code === stored)) {
        return stored;
      }

      // Check browser language
      if (typeof navigator !== 'undefined' && navigator.language) {
        const browserLangs = navigator.languages || [navigator.language];
        for (const bLang of browserLangs) {
          const shortCode = bLang.split('-')[0].toLowerCase() as LanguageCode;
          if (LANGUAGES.some(l => l.code === shortCode)) {
            return shortCode;
          }
        }
      }
    } catch {
      // fallback
    }
    return 'de';
  };`;

// replace old getInitialLanguage function
const regex = /const getInitialLanguage = \(\): LanguageCode => \{[\s\S]*?return 'de';\s*\};/;
file = file.replace(regex, newInitialLanguageLogic);

fs.writeFileSync('src/i18n/LanguageContext.tsx', file);
