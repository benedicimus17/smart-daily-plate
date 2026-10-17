import { Macros } from './nutrition';

/**
 * Модель сирого інгредієнта каструлі
 */
export interface RawIngredient {
  id: string;
  name: string;
  rawWeightGrams: number;
  macrosPer100g: Macros;
}

/**
 * Модель калькулятора приготування та уварювання (Cook-Loss Engine)
 */
export interface CookLossDish {
  id: string;
  name: string;
  dateCreated: string;
  /** Сирі інгредієнти */
  ingredients: RawIngredient[];
  /** Загальна сира вага (сума інгредієнтів) */
  totalRawWeightGrams: number;
  /** Вага порожньої каструлі / тари (г) */
  emptyPotWeightGrams: number;
  /** Вага каструлі разом із готовою гарячою стравою (г) */
  potWithCookedDishWeightGrams: number;
  /** Чиста вага готової страви (посуд знято) */
  cookedDishWeightGrams: number;
  /** Відсоток уварювання або википання: (raw - cooked) / raw * 100% */
  waterLossPercentage: number;
  /** Загальні макроси всієї каструлі */
  totalPotMacros: Macros;
  /** Концентровані макроси на 100 г готової страви (з урахуванням випаровування води) */
  cookedMacrosPer100g: Macros;
}
