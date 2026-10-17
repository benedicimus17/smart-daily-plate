import { Macros } from './nutrition';

export type HandPortionType = 'palm' | 'fist' | 'cupped_hand' | 'thumb';

export interface HandPortionConfig {
  type: HandPortionType;
  title: string;
  icon: string;
  description: string;
  approxGrams: number;
  macroProfile: 'protein' | 'carbs' | 'veggies' | 'fats';
  defaultPer100g: Macros;
}

export interface DiningPlateItem {
  portionType: HandPortionType;
  count: number;
}

export interface DiningRestaurantPreset {
  id: string;
  name: string;
  category: 'italian' | 'burger' | 'asian' | 'steak' | 'cafe';
  description: string;
  defaultMacros: Macros;
  estimatedWeightGrams: number;
}
