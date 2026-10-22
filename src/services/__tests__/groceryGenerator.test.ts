import { describe, it, expect } from 'vitest';
import {
  detectGroceryCategory,
  generateGroceryListFromMeals,
  generateShareableGroceryText,
  DEFAULT_GROCERY_ITEMS
} from '../groceryGenerator';
import { MealEntry } from '../../types/nutrition';

describe('groceryGenerator', () => {
  describe('detectGroceryCategory', () => {
    it('classifies meat and fish correctly', () => {
      expect(detectGroceryCategory('Філе куряче')).toBe('meat_fish');
      expect(detectGroceryCategory('Стейк яловичий Рибай')).toBe('meat_fish');
      expect(detectGroceryCategory('Свіжий лосось')).toBe('meat_fish');
      expect(detectGroceryCategory('Крафтовий Біг Мак')).toBe('meat_fish');
      expect(detectGroceryCategory('Індичка фарш')).toBe('meat_fish');
    });

    it('classifies dairy and eggs correctly', () => {
      expect(detectGroceryCategory('Яйця курячі')).toBe('dairy');
      expect(detectGroceryCategory('Грецький йогурт 2%')).toBe('dairy');
      expect(detectGroceryCategory('Сир зернистий Cottage')).toBe('dairy');
      expect(detectGroceryCategory('Сир фета')).toBe('dairy');
    });

    it('classifies produce and greens correctly', () => {
      expect(detectGroceryCategory('Авокадо Хаас')).toBe('produce');
      expect(detectGroceryCategory('Свіжа спаржа')).toBe('produce');
      expect(detectGroceryCategory('Шпинат бейбі')).toBe('produce');
      expect(detectGroceryCategory('Лохина свіжа')).toBe('produce');
      expect(detectGroceryCategory('Томати чері')).toBe('produce');
    });

    it('classifies staples, carbs and bakery correctly', () => {
      expect(detectGroceryCategory('Вівсяні пластівці')).toBe('staples');
      expect(detectGroceryCategory('Кіноа триколірне')).toBe('staples');
      expect(detectGroceryCategory('Тост цільнозерновий')).toBe('staples');
      expect(detectGroceryCategory('Французький круасан')).toBe('staples');
      expect(detectGroceryCategory('Горіховий мікс')).toBe('staples');
    });
  });

  describe('generateGroceryListFromMeals', () => {
    it('returns default items when meals list is empty', () => {
      const result = generateGroceryListFromMeals([]);
      expect(result).toEqual(DEFAULT_GROCERY_ITEMS);
    });

    it('extracts raw weight for Cook-Loss dishes with shrinkage notice', () => {
      const mockMeals: MealEntry[] = [
        {
          id: 'm-1',
          foodId: 'steak_1',
          name: 'Стейк Рибай зі спаржею',
          weightGrams: 260,
          macros: { calories: 510, protein: 46, fat: 24, carbs: 8 },
          timestamp: '19:30',
          isCookLoss: true,
          rawWeightGrams: 350,
          cookedWeightGrams: 260
        }
      ];

      const list = generateGroceryListFromMeals(mockMeals);
      const steak = list.find(i => i.name.toLowerCase().includes('стейк'));
      expect(steak).toBeDefined();
      expect(steak?.category).toBe('meat_fish');
      expect(steak?.rawWeightGrams).toBe(350);
      expect(steak?.amount).toContain('350');
      expect(steak?.note).toContain('уварка');
    });

    it('decomposes recipeDetails into individual grocery items', () => {
      const mockMeals: MealEntry[] = [
        {
          id: 'm-2',
          foodId: 'omelet_1',
          name: 'Омлет з авокадо та шпинатом',
          weightGrams: 180,
          macros: { calories: 380, protein: 28, fat: 24, carbs: 12 },
          timestamp: '08:30',
          recipeDetails: 'Курячі яйця 3 шт, авокадо хасс 60г, шпинат свіжий 50г'
        }
      ];

      const list = generateGroceryListFromMeals(mockMeals);
      expect(list.some(i => i.category === 'dairy' && i.name.toLowerCase().includes('яйц'))).toBe(true);
      expect(list.some(i => i.category === 'produce' && i.name.toLowerCase().includes('авокадо'))).toBe(true);
      expect(list.some(i => i.category === 'produce' && i.name.toLowerCase().includes('шпинат'))).toBe(true);
    });
  });

  describe('generateShareableGroceryText', () => {
    it('formats a readable text with markdown checkboxes and department headers', () => {
      const sampleItems = [
        {
          id: '1',
          name: 'Куряче філе',
          category: 'meat_fish' as const,
          categoryLabel: "М'ясо та риба",
          amount: '~500 г',
          note: 'Для обідів',
          isBought: false,
          source: 'auto_menu' as const,
          rawWeightGrams: 500
        },
        {
          id: '2',
          name: 'Яйця курячі',
          category: 'dairy' as const,
          categoryLabel: 'Молочне та яйця',
          amount: '1 десяток',
          isBought: true,
          source: 'auto_menu' as const
        }
      ];

      const text = generateShareableGroceryText(sampleItems);
      expect(text).toContain('NUTRIQ — СПИСОК ПОКУПОК ДЛЯ СУПЕРМАРКЕТУ');
      expect(text).toContain("М'ЯСО ТА РИБА:");
      expect(text).toContain('⬜ Куряче філе — ~500 г');
      expect(text).toContain('✅ Яйця курячі — 1 десяток');
      expect(text).toContain('Куплено: 1 з 2 товарів');
    });
  });
});
