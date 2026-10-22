/**
 * Smart Daily Plate (NUTRIQ) — Сховище Розумного Списку Покупок (Zustand + Persist)
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { GroceryItem, GroceryCategory } from '../types/grocery';
import { DEFAULT_GROCERY_ITEMS, generateGroceryListFromMeals, getCategoryLabel } from '../services/groceryGenerator';
import { MealEntry } from '../types/nutrition';

export interface GroceryState {
  items: GroceryItem[];
  activeFilter: string; // 'all' | 'unbought' | GroceryCategory
  searchQuery: string;

  // Дії списку
  toggleBought: (id: string) => void;
  addItem: (itemData: {
    name: string;
    amount?: string;
    category?: GroceryCategory;
    note?: string;
  }) => void;
  removeItem: (id: string) => void;
  clearBought: () => void;
  syncFromMeals: (meals: MealEntry[]) => void;
  resetToDefaults: () => void;
  setActiveFilter: (filter: string) => void;
  setSearchQuery: (query: string) => void;
}

export const useGroceryStore = create<GroceryState>()(
  persist(
    (set, get) => ({
      items: DEFAULT_GROCERY_ITEMS,
      activeFilter: 'all',
      searchQuery: '',

      toggleBought: (id: string) => {
        set(state => ({
          items: state.items.map(item =>
            item.id === id ? { ...item, isBought: !item.isBought } : item
          )
        }));
      },

      addItem: ({ name, amount, category = 'produce', note }) => {
        if (!name || !name.trim()) return;

        const newItem: GroceryItem = {
          id: `custom-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          name: name.trim(),
          category,
          categoryLabel: getCategoryLabel(category),
          amount: amount && amount.trim() ? amount.trim() : '1 шт',
          note: note && note.trim() ? note.trim() : undefined,
          isBought: false,
          source: 'custom'
        };

        set(state => ({
          items: [newItem, ...state.items]
        }));
      },

      removeItem: (id: string) => {
        set(state => ({
          items: state.items.filter(item => item.id !== id)
        }));
      },

      clearBought: () => {
        set(state => ({
          items: state.items.filter(item => !item.isBought)
        }));
      },

      syncFromMeals: (meals: MealEntry[]) => {
        const { items } = get();
        // Зберігаємо додані користувачем вручну товари (custom)
        const customItems = items.filter(i => i.source === 'custom');
        const generatedItems = generateGroceryListFromMeals(meals);

        set({
          items: [...customItems, ...generatedItems]
        });
      },

      resetToDefaults: () => {
        set({
          items: DEFAULT_GROCERY_ITEMS,
          activeFilter: 'all',
          searchQuery: ''
        });
      },

      setActiveFilter: (filter: string) => {
        set({ activeFilter: filter });
      },

      setSearchQuery: (query: string) => {
        set({ searchQuery: query });
      }
    }),
    {
      name: 'nutriq-grocery-storage-v1'
    }
  )
);
