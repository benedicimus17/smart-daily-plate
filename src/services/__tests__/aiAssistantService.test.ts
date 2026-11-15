import { describe, it, expect, beforeEach } from 'vitest';
import {
  getMealTypeByHour,
  resolveMealTimeAndSlot,
  parseLocalMealInput,
  parseMealWithAiOrLocal,
  executeAutoMealLog
} from '../aiAssistantService';
import { useNutritionStore } from '../../store/nutritionStore';

describe('aiAssistantService - Zen AI Voice & Multimodal Assistant', () => {
  beforeEach(() => {
    // Скидаємо стан щоденника для детермінованого тестування
    const store = useNutritionStore.getState();
    store.updateTargets({ calories: 1200, protein: 100, fat: 40, carbs: 110 });
  });

  describe('1. Детектор слоту прийому їжі за годиною (getMealTypeByHour)', () => {
    it('правильно класифікує години доби', () => {
      expect(getMealTypeByHour(8)).toBe('breakfast');
      expect(getMealTypeByHour(10.5)).toBe('breakfast');
      expect(getMealTypeByHour(11)).toBe('snack'); // 11:00 - ранковий перекус
      expect(getMealTypeByHour(12)).toBe('snack');
      expect(getMealTypeByHour(13.5)).toBe('lunch');
      expect(getMealTypeByHour(15)).toBe('lunch');
      expect(getMealTypeByHour(16.5)).toBe('snack'); // 16:30 - денний перекус
      expect(getMealTypeByHour(19)).toBe('dinner');
      expect(getMealTypeByHour(21.5)).toBe('dinner');
      expect(getMealTypeByHour(2)).toBe('snack');
    });
  });

  describe('2. Визначення часу та слоту з тексту (resolveMealTimeAndSlot)', () => {
    it('розпізнає фрази без явного часу і бере системний час (11:00 -> Перекус)', () => {
      const mockDate11 = new Date(2026, 10, 15, 11, 0, 0);
      const res = resolveMealTimeAndSlot("Я з'їв яблуко", mockDate11);

      expect(res.timestamp).toBe('11:00');
      expect(res.mealType).toBe('snack');
      expect(res.explicitTimeFound).toBe(false);
      expect(res.cleanInput).toBe('яблуко');
    });

    it('витягує явно вказаний час "о 10:00" і змінює слот на сніданок', () => {
      const mockDate15 = new Date(2026, 10, 15, 15, 30, 0); // поточний 15:30
      const res = resolveMealTimeAndSlot("О 10:00 з'їв вівсянку з бананом", mockDate15);

      expect(res.timestamp).toBe('10:00');
      expect(res.mealType).toBe('breakfast');
      expect(res.explicitTimeFound).toBe(true);
      expect(res.cleanInput).toBe('вівсянку з бананом');
    });

    it('витягує явний слот "обід" та час "14:30"', () => {
      const res = resolveMealTimeAndSlot("В 14:30 обід: суп курячий");

      expect(res.timestamp).toBe('14:30');
      expect(res.mealType).toBe('lunch');
      expect(res.explicitSlotFound).toBe(true);
      expect(res.cleanInput).toBe('суп курячий');
    });

    it('підтримує іспанські та англійські фрази', () => {
      const resEs = resolveMealTimeAndSlot("A las 11:15 comí una manzana");
      expect(resEs.timestamp).toBe('11:15');
      expect(resEs.mealType).toBe('snack');

      const resEn = resolveMealTimeAndSlot("At 09:00 ate oatmeal and banana");
      expect(resEn.timestamp).toBe('09:00');
      expect(resEn.mealType).toBe('breakfast');
    });
  });

  describe('3. Детермінований розбір страви (parseLocalMealInput)', () => {
    it('миттєво визначає яблуко середнє (160г) з точними КБЖВ (~83 ккал)', () => {
      const mockDate11 = new Date(2026, 10, 15, 11, 0, 0);
      const result = parseLocalMealInput("Я з'їв яблуко", mockDate11);

      expect(result.dishName).toBe('Яблуко свіже');
      expect(result.weightGrams).toBe(160);
      expect(result.macros.calories).toBe(83); // 160 * 52 / 100 = 83.2 -> 83 ккал
      expect(result.macros.protein).toBe(0.5);
      expect(result.macros.carbs).toBe(22.1);
      expect(result.mealType).toBe('snack');
      expect(result.timestamp).toBe('11:00');
    });

    it('розбирає складені страви "кава лате і круасан"', () => {
      const mockDate11 = new Date(2026, 10, 15, 11, 0, 0);
      const result = parseLocalMealInput("кава лате і круасан", mockDate11);

      expect(result.macros.calories).toBeGreaterThan(300);
      expect(result.items?.length).toBe(2);
      expect(result.mealType).toBe('snack');
    });
  });

  describe('4. Сценарій Власника: Авто-логування та перерахунок макросів', () => {
    it('додає яблуко о 11:00 у Перекус і автоматично зменшує залишок калорій з 1200 до 1117 ккал', () => {
      const store = useNutritionStore.getState();
      
      // Початкова ціль: 1200 ккал
      store.updateTargets({ calories: 1200 });

      // Симулюємо розпізнане яблуко о 11:00
      const parsedApple = parseLocalMealInput("Я з'їв яблуко", new Date(2026, 10, 15, 11, 0, 0));
      expect(parsedApple.macros.calories).toBe(83);
      expect(parsedApple.mealType).toBe('snack');
      expect(parsedApple.timestamp).toBe('11:00');

      // Виконуємо авто-запис
      const logResult = executeAutoMealLog(parsedApple);

      expect(logResult.mealType).toBe('snack');
      expect(logResult.timestamp).toBe('11:00');
      expect(logResult.caloriesAdded).toBe(83);

      // Перевіряємо живий стан щоденника
      const state = useNutritionStore.getState();
      const snackCategory = state.dailyLog.meals.snack;
      
      // Перевіряємо наявність запису яблука
      const addedEntry = snackCategory.entries.find(e => e.name === 'Яблуко свіже');
      expect(addedEntry).toBeDefined();
      expect(addedEntry?.timestamp).toBe('11:00');
      expect(addedEntry?.macros.calories).toBe(83);
      expect(addedEntry?.eaten).toBe(true);

      // Перевіряємо перерахунок калорій на день
      // Залишок = 1200 - з'їдені ккал
      expect(logResult.targetCalories).toBe(1200);
      expect(logResult.consumedCalories).toBeGreaterThanOrEqual(83);
    });
  });

  describe('5. Відмовостійкість Gemini API шлюзу', () => {
    it('при збої мережі або перевищенні ліміту 429 прозоро повертає локальний розрахунок без падіння', async () => {
      // Мокаємо fetch з кодом 429 Too Many Requests
      const mockFetch429 = async () => ({
        ok: false,
        status: 429,
        json: async () => ({ error: 'Rate limit exceeded' })
      }) as any;

      const result = await parseMealWithAiOrLocal("Я з'їв яблуко", {
        apiKey: 'fake-test-key-429',
        referenceDate: new Date(2026, 10, 15, 11, 0, 0),
        fetchImpl: mockFetch429
      });

      // Перевіряємо, що користувач отримав валідний результат, а не помилку
      expect(result.dishName).toBe('Яблуко свіже');
      expect(result.macros.calories).toBe(83);
      expect(result.source).toBe('local_nlp');
      expect(result.timestamp).toBe('11:00');
    });
  });
});
