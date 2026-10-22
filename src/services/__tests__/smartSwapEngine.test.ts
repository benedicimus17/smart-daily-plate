import { describe, it, expect } from 'vitest';
import { findSmartSwapCandidates, getNextSwapCandidate } from '../smartSwapEngine';
import { ChefDishItem } from '../../components/ChefHubModal';

const MOCK_CATALOG: ChefDishItem[] = [
  {
    id: 'dish-1',
    name: 'Куряче філе запечене з кіноа',
    category: 'lunch',
    categoryLabel: 'Обід',
    weightGrams: 220,
    macros: { calories: 480, protein: 44, fat: 12, carbs: 48 },
    photo: '',
    prepTime: '20 хв',
    shortDesc: ''
  },
  {
    id: 'dish-2',
    name: 'Свіжий лосось су-від з кіноа',
    category: 'lunch',
    categoryLabel: 'Обід',
    weightGrams: 250,
    macros: { calories: 490, protein: 42, fat: 18, carbs: 40 },
    photo: '',
    prepTime: '20 хв',
    shortDesc: ''
  },
  {
    id: 'dish-3',
    name: 'Gourmet Steak Ribeye зі спаржею',
    category: 'dinner',
    categoryLabel: 'Вечеря',
    weightGrams: 260,
    macros: { calories: 510, protein: 46, fat: 24, carbs: 8 },
    photo: '',
    prepTime: '15 хв',
    shortDesc: ''
  },
  {
    id: 'dish-4',
    name: 'Омлет з авокадо',
    category: 'breakfast',
    categoryLabel: 'Сніданок',
    weightGrams: 180,
    macros: { calories: 380, protein: 28, fat: 24, carbs: 12 },
    photo: '',
    prepTime: '10 хв',
    shortDesc: ''
  },
  {
    id: 'dish-5',
    name: 'Сирники з рікоти',
    category: 'breakfast',
    categoryLabel: 'Сніданок',
    weightGrams: 200,
    macros: { calories: 310, protein: 26, fat: 11, carbs: 24 },
    photo: '',
    prepTime: '15 хв',
    shortDesc: ''
  }
];

describe('smartSwapEngine', () => {
  it('finds isocaloric equivalent for lunch dish with matching protein', () => {
    const currentDish = {
      name: 'Куряче філе запечене з кіноа',
      macros: { calories: 480, protein: 44, fat: 12, carbs: 48 },
      category: 'lunch' as const
    };

    const results = findSmartSwapCandidates(currentDish, MOCK_CATALOG);
    expect(results.length).toBeGreaterThan(0);

    const topMatch = results[0];
    // Повинен запропонувати лосось або стейк, а не сніданок
    expect(topMatch.candidate.id).toBe('dish-2'); // Лосось (490 ккал, 42г білка - найближчий)
    expect(topMatch.calorieDelta).toBe(10);
    expect(topMatch.proteinDelta).toBe(-2);
  });

  it('cycles through candidates when previous match is excluded (Замінити знов)', () => {
    const currentDish = {
      name: 'Куряче філе запечене з кіноа',
      macros: { calories: 480, protein: 44, fat: 12, carbs: 48 },
      category: 'lunch' as const
    };

    // Перший вибір
    const firstMatch = getNextSwapCandidate(currentDish, MOCK_CATALOG, []);
    expect(firstMatch?.candidate.id).toBe('dish-2');

    // Клік "Замінити знов" (виключаємо dish-2)
    const secondMatch = getNextSwapCandidate(currentDish, MOCK_CATALOG, ['dish-2']);
    expect(secondMatch).toBeDefined();
    expect(secondMatch?.candidate.id).toBe('dish-3'); // Стейк Рибай
    expect(secondMatch?.candidate.id).not.toBe('dish-2');
  });

  it('preserves meal category context for breakfasts', () => {
    const breakfastDish = {
      name: 'Омлет з авокадо',
      macros: { calories: 380, protein: 28, fat: 24, carbs: 12 },
      category: 'breakfast' as const
    };

    const results = findSmartSwapCandidates(breakfastDish, MOCK_CATALOG);
    expect(results.length).toBe(1);
    expect(results[0].candidate.id).toBe('dish-5'); // Сирники з рікоти
    expect(results[0].candidate.category).toBe('breakfast');
  });
});
