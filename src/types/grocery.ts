/**
 * Smart Daily Plate (NUTRIQ) — Моделі даних Розумного Кошика Продуктів
 */

export type GroceryCategory = 'meat_fish' | 'dairy' | 'produce' | 'staples' | 'other';

export interface GroceryCategoryMeta {
  key: GroceryCategory;
  label: string;
  icon: string;
}

export interface GroceryItem {
  id: string;
  name: string;
  category: GroceryCategory;
  categoryLabel: string;
  amount: string;
  note?: string;
  isBought: boolean;
  source: 'auto_menu' | 'custom';
  rawWeightGrams?: number;
  cookLossPercentage?: number;
  dishReference?: string;
}

export const GROCERY_CATEGORIES: GroceryCategoryMeta[] = [
  { key: 'meat_fish', label: "М'ясо та риба", icon: '🥩' },
  { key: 'dairy', label: 'Молочне та яйця', icon: '🥛' },
  { key: 'produce', label: 'Овочі та зелень', icon: '🥗' },
  { key: 'staples', label: 'Бакалія та крупи', icon: '🌾' },
  { key: 'other', label: 'Інше та напої', icon: '🧺' },
];
