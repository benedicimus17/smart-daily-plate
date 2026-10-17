/**
 * Smart Daily Plate — Суворі моделі даних харчування
 * Розроблено Core Nutrition & Math Algorithms Engineer
 */

export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';

export interface Macros {
  /** Калорійність (ккал) */
  calories: number;
  /** Білки (грами) */
  protein: number;
  /** Жири (грами) */
  fat: number;
  /** Вуглеводи (грами) */
  carbs: number;
}

export interface FoodItem {
  id: string;
  name: string;
  /** КБЖВ на 100 г */
  per100g: Macros;
  /** Вага порції за замовчуванням (г) */
  defaultServingWeight?: number;
  /** Чи є страва власноруч приготованою (Cook-loss) */
  isCookedDish?: boolean;
}

export interface MealEntry {
  id: string;
  foodId: string;
  name: string;
  /** Вага з'їденої порції в грамах */
  weightGrams: number;
  /** Фактичні макроси порції */
  macros: Macros;
  /** Час додавання */
  timestamp: string;
}

export interface MealCategory {
  type: MealType;
  title: string;
  icon: string;
  entries: MealEntry[];
  totalMacros: Macros;
}

export interface MacroTargets {
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
}

export interface DailyLog {
  date: string; // YYYY-MM-DD
  targets: MacroTargets;
  meals: Record<MealType, MealCategory>;
  totals: Macros;
  waterMl: number;
  notes?: string;
}
