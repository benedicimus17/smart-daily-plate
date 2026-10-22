import { describe, it, expect, beforeEach, beforeAll } from 'vitest';
import { useGroceryStore } from '../groceryStore';
import { MealEntry } from '../../types/nutrition';

beforeAll(() => {
  const store: Record<string, string> = {};
  globalThis.localStorage = {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => { store[key] = value; },
    removeItem: (key: string) => { delete store[key]; },
    clear: () => { Object.keys(store).forEach(k => delete store[k]); },
    length: 0,
    key: () => null
  };
});

describe('groceryStore', () => {
  beforeEach(() => {
    useGroceryStore.getState().resetToDefaults();
  });

  it('initializes with default grocery items', () => {
    const state = useGroceryStore.getState();
    expect(state.items.length).toBeGreaterThan(0);
    expect(state.activeFilter).toBe('all');
  });

  it('allows custom item addition (дописування товару)', () => {
    const store = useGroceryStore.getState();
    store.addItem({
      name: 'Лимони свіжі',
      amount: '3 шт',
      category: 'produce',
      note: 'Для ранкової води'
    });

    const updated = useGroceryStore.getState();
    const item = updated.items.find(i => i.name === 'Лимони свіжі');
    expect(item).toBeDefined();
    expect(item?.amount).toBe('3 шт');
    expect(item?.category).toBe('produce');
    expect(item?.source).toBe('custom');
    expect(item?.isBought).toBe(false);
  });

  it('toggles item bought status', () => {
    const store = useGroceryStore.getState();
    const firstId = store.items[0].id;
    const initialStatus = store.items[0].isBought;

    store.toggleBought(firstId);
    expect(useGroceryStore.getState().items[0].isBought).toBe(!initialStatus);

    store.toggleBought(firstId);
    expect(useGroceryStore.getState().items[0].isBought).toBe(initialStatus);
  });

  it('removes item by id', () => {
    const store = useGroceryStore.getState();
    const firstId = store.items[0].id;
    const initialCount = store.items.length;

    store.removeItem(firstId);
    const updated = useGroceryStore.getState();
    expect(updated.items.length).toBe(initialCount - 1);
    expect(updated.items.find(i => i.id === firstId)).toBeUndefined();
  });

  it('clears all bought items', () => {
    const store = useGroceryStore.getState();
    // Переконуємось, що є хоча б один куплений
    const firstId = store.items[0].id;
    if (!store.items[0].isBought) {
      store.toggleBought(firstId);
    }

    store.clearBought();
    const updated = useGroceryStore.getState();
    expect(updated.items.every(i => !i.isBought)).toBe(true);
  });

  it('syncs items from scheduled meals preserving custom items', () => {
    const store = useGroceryStore.getState();
    // Додаємо свій товар
    store.addItem({
      name: 'Мій спеціальний соус',
      amount: '1 пляшка',
      category: 'staples'
    });

    const mockMeals: MealEntry[] = [
      {
        id: 'sync-1',
        foodId: 'steak_1',
        name: 'Стейк Рибай',
        weightGrams: 260,
        macros: { calories: 510, protein: 46, fat: 24, carbs: 8 },
        timestamp: '19:30',
        isCookLoss: true,
        rawWeightGrams: 350,
        cookedWeightGrams: 260
      }
    ];

    store.syncFromMeals(mockMeals);
    const updated = useGroceryStore.getState();

    // Перевіряємо, що кастомний товар залишився
    expect(updated.items.some(i => i.name === 'Мій спеціальний соус')).toBe(true);
    // І додалась страва з меню
    expect(updated.items.some(i => i.name.toLowerCase().includes('стейк'))).toBe(true);
  });
});
