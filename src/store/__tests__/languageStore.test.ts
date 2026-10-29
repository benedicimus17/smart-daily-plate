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

  it('translates onboarding wizard questions and controls in Spanish, English and Ukrainian', () => {
    const store = useLanguageStore.getState();

    // Spanish (Default for Spain release)
    store.setLanguage('es');
    expect(store.t('w_q1_title')).toBe('¿Cuál es tu objetivo principal?');
    expect(store.t('w_gender_female')).toBe('Mujer');
    expect(store.t('w_gender_male')).toBe('Hombre');
    expect(store.t('w_btn_continue')).toBe('Continuar');
    expect(store.t('w_q9_title')).toBe('Tipo de dieta y alergias');
    expect(store.t('w_btn_save_menu')).toBe('Guardar plan y ver mi menú');
    expect(store.t('w_btn_guest')).toBe('Continuar como invitado');

    // English
    store.setLanguage('en');
    expect(store.t('w_q1_title')).toBe('What is your main goal?');
    expect(store.t('w_gender_female')).toBe('Female');
    expect(store.t('w_btn_continue')).toBe('Continue');
    expect(store.t('w_btn_guest')).toBe('Skip and enter as guest');

    // Ukrainian
    store.setLanguage('uk');
    expect(store.t('w_q1_title')).toBe('Чого ви прагнете досягти?');
    expect(store.t('w_gender_female')).toBe('Жінка');
    expect(store.t('w_btn_continue')).toBe('Продовжити');
    expect(store.t('w_btn_guest')).toBe('Пропустити та зайти як гість');
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
