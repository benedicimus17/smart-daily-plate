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

  it('translates Block 2 (LogScreen, QuickMealSwap, ChefHub, DishDetail) in Spanish, English and Ukrainian', () => {
    const store = useLanguageStore.getState();

    // Spanish (Spain release default)
    store.setLanguage('es');
    expect(store.t('log_today')).toBe('Hoy');
    expect(store.t('log_balance_100')).toBe('Balance 100%');
    expect(store.t('swap_badge_reality')).toBe('Vida real • Cambio rápido');
    expect(store.t('swap_skip_title')).toBe('Saltar esta comida (0 kcal)');
    expect(store.t('chef_hub_header')).toBe('Chef-Hub NUTRIQ');
    expect(store.t('chef_mode_menu')).toBe('Menú');
    expect(store.t('chef_mode_barcode')).toBe('Código barras');
    expect(store.t('dish_cooked_portion')).toBe('g porción cocinada');
    expect(store.t('dish_ate_other_btn')).toBe('Comí otra cosa (2 croissants, pizza, bocadillo...)');

    // English
    store.setLanguage('en');
    expect(store.t('log_today')).toBe('Today');
    expect(store.t('log_balance_100')).toBe('100% Balanced');
    expect(store.t('swap_badge_reality')).toBe('Real Life • Quick Swap');
    expect(store.t('chef_mode_barcode')).toBe('Barcode');

    // Ukrainian
    store.setLanguage('uk');
    expect(store.t('log_today')).toBe('Сьогодні');
    expect(store.t('log_balance_100')).toBe('Баланс 100%');
    expect(store.t('swap_badge_reality')).toBe('Реальне життя • Швидка підміна');
    expect(store.t('chef_mode_barcode')).toBe('Штрих-код');
  });

  it('translates Block 3 (TrueFatTrend & SmartGroceryList) in Spanish, English and Ukrainian', () => {
    const store = useLanguageStore.getState();

    // Spanish (Spain release default)
    store.setLanguage('es');
    expect(store.t('my_weight_title')).toBe('Mi peso');
    expect(store.t('why_scale_lies')).toBe('¿Por qué la báscula miente?');
    expect(store.t('water_filter')).toBe('Filtro de agua');
    expect(store.t('real_fat')).toBe('Grasa real');
    expect(store.t('weight_saved_toast')).toBe('¡Peso guardado! Tendencia real recalculada.');
    expect(store.t('grocery_title')).toBe('Compras de la semana');
    expect(store.t('grocery_subtitle')).toBe('Organizado por 4 secciones de supermercado');
    expect(store.t('grocery_collected_cart')).toBe('En el carrito');
    expect(store.t('grocery_cat_meat_fish')).toBe('Carnicería y Pescado');
    expect(store.t('grocery_cat_dairy')).toBe('Lácteos y Huevos');
    expect(store.t('grocery_cat_produce')).toBe('Frutas y Verduras');
    expect(store.t('grocery_cat_staples')).toBe('Despensa y Granos');
    expect(store.t('grocery_cat_other')).toBe('Otros y Bebidas');
    expect(store.t('grocery_sync_btn')).toBe('Sincronizar');
    expect(store.t('grocery_copy_btn')).toBe('Copiar lista');

    // English
    store.setLanguage('en');
    expect(store.t('my_weight_title')).toBe('My Weight');
    expect(store.t('why_scale_lies')).toBe('Why does the bathroom scale lie?');
    expect(store.t('water_filter')).toBe('Water Filter');
    expect(store.t('real_fat')).toBe('True body fat');
    expect(store.t('weight_saved_toast')).toBe('Weight saved! True trend recalculated.');
    expect(store.t('grocery_title')).toBe('Weekly Grocery List');
    expect(store.t('grocery_cat_meat_fish')).toBe('Meat & Seafood');
    expect(store.t('grocery_cat_dairy')).toBe('Dairy & Eggs');

    // Ukrainian
    store.setLanguage('uk');
    expect(store.t('my_weight_title')).toBe('Моя вага');
    expect(store.t('why_scale_lies')).toBe('Чому щоденні ваги показують неправду?');
    expect(store.t('water_filter')).toBe('Фільтр води');
    expect(store.t('real_fat')).toBe('Справжній жир');
    expect(store.t('weight_saved_toast')).toBe('Вагу збережено! Справжній тренд перераховано.');
    expect(store.t('grocery_title')).toBe('Покупки на тиждень');
    expect(store.t('grocery_cat_meat_fish')).toBe("М'ясо та риба");
    expect(store.t('grocery_cat_dairy')).toBe('Молочне та яйця');
  });
});
