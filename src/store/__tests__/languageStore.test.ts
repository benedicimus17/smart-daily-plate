import { describe, it, expect, beforeEach } from 'vitest';
import { useLanguageStore, detectDeviceLanguage } from '../languageStore';

describe('LanguageStore & i18n Engine', () => {
  beforeEach(() => {
    useLanguageStore.getState().setLanguage('uk');
  });

  it('translates keys properly in Ukrainian, Spanish, and English', () => {
    const store = useLanguageStore.getState();

    store.setLanguage('uk');
    expect(store.t('nav_home')).toBe('Головна');
    expect(store.t('calories')).toBe('ккал');

    store.setLanguage('es');
    expect(store.t('nav_home')).toBe('Inicio');
    expect(store.t('calories')).toBe('kcal');
    expect(store.t('nav_weight')).toBe('Mi peso (sin agua)');

    store.setLanguage('en');
    expect(store.t('nav_home')).toBe('Home');
    expect(store.t('nav_weight')).toBe('True Weight (No Water)');
  });

  it('detects language or defaults safely', () => {
    const lang = detectDeviceLanguage();
    expect(['uk', 'es', 'en', 'de', 'fr', 'it']).toContain(lang);
  });

  it('falls back to English or fallback string when key is missing', () => {
    const store = useLanguageStore.getState();
    store.setLanguage('es');
    // @ts-expect-error test invalid key
    const val = store.t('non_existing_key', 'Default Fallback');
    expect(val).toBe('Default Fallback');
  });
});
