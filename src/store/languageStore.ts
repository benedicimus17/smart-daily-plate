import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  SupportedLocale,
  SUPPORTED_LANGUAGES,
  translations,
  TranslationKey
} from '../i18n/translations';

export const detectDeviceLanguage = (): SupportedLocale => {
  try {
    const saved = localStorage.getItem('nutriq-locale-storage-v1');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed?.state?.currentLanguage) {
        return parsed.state.currentLanguage;
      }
    }

    const browserLang = (
      (typeof navigator !== 'undefined' && (navigator.language || navigator.languages?.[0])) || 'es'
    ).toLowerCase();

    if (browserLang.startsWith('es')) return 'es';
    if (browserLang.startsWith('uk')) return 'uk';
    if (browserLang.startsWith('de')) return 'de';
    if (browserLang.startsWith('fr')) return 'fr';
    if (browserLang.startsWith('it')) return 'it';
    if (browserLang.startsWith('en')) return 'en';

    // Для Іспанії та Європи дефолт — Español або English
    return 'es';
  } catch {
    return 'es';
  }
};

interface LanguageState {
  currentLanguage: SupportedLocale;
  setLanguage: (lang: SupportedLocale) => void;
  t: (key: TranslationKey, fallback?: string) => string;
}

export const useLanguageStore = create<LanguageState>()(
  persist(
    (set, get) => ({
      currentLanguage: detectDeviceLanguage(),

      setLanguage: (lang) => {
        set({ currentLanguage: lang });
        try {
          document.documentElement.lang = lang;
        } catch {}
      },

      t: (key, fallback) => {
        const lang = get().currentLanguage;
        const dict = translations[lang] || translations.es;
        return dict[key] || translations.en[key] || fallback || key;
      }
    }),
    {
      name: 'nutriq-locale-storage-v1'
    }
  )
);

// Швидкий зручний хук
export const useTranslation = () => {
  const currentLanguage = useLanguageStore((s) => s.currentLanguage);
  const setLanguage = useLanguageStore((s) => s.setLanguage);
  const t = useLanguageStore((s) => s.t);

  const currentOption = SUPPORTED_LANGUAGES.find((l) => l.code === currentLanguage) || SUPPORTED_LANGUAGES[0];

  return {
    lang: currentLanguage,
    setLanguage,
    t,
    currentOption,
    supportedLanguages: SUPPORTED_LANGUAGES
  };
};
