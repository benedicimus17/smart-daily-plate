import { Macros } from '../types/nutrition';
import { RawIngredient } from '../types/cookLoss';

export interface CookLossCalculationInput {
  emptyPotWeightGrams: number;
  potWithCookedDishWeightGrams: number;
  ingredients: RawIngredient[];
}

export interface CookLossCalculationResult {
  totalRawWeightGrams: number;
  cookedDishWeightGrams: number;
  waterLossPercentage: number;
  totalPotMacros: Macros;
  cookedMacrosPer100g: Macros;
}

/**
 * Детермінований розрахунок Cook-Loss Engine
 * Враховує випаровування або додавання води при термічній обробці
 */
export function calculateCookLoss(input: CookLossCalculationInput): CookLossCalculationResult {
  const { emptyPotWeightGrams, potWithCookedDishWeightGrams, ingredients } = input;

  if (potWithCookedDishWeightGrams <= emptyPotWeightGrams) {
    throw new Error('Вага каструлі з готовою стравою має бути більшою за вагу сухого посуду');
  }

  const cookedDishWeightGrams = Math.round(potWithCookedDishWeightGrams - emptyPotWeightGrams);

  let totalRawWeightGrams = 0;
  let potCalories = 0;
  let potProtein = 0;
  let potFat = 0;
  let potCarbs = 0;

  for (const item of ingredients) {
    if (item.rawWeightGrams <= 0) continue;
    totalRawWeightGrams += item.rawWeightGrams;

    const ratio = item.rawWeightGrams / 100;
    potCalories += item.macrosPer100g.calories * ratio;
    potProtein += item.macrosPer100g.protein * ratio;
    potFat += item.macrosPer100g.fat * ratio;
    potCarbs += item.macrosPer100g.carbs * ratio;
  }

  if (totalRawWeightGrams <= 0) {
    throw new Error('Сумарна вага сирих інгредієнтів має бути більшою за нуль');
  }

  // Відсоток випаровування/зміни ваги: позитивний = википіло, негативний = увібрало воду (наприклад рис/паста)
  const waterLossPercentage = Math.round(((totalRawWeightGrams - cookedDishWeightGrams) / totalRawWeightGrams) * 1000) / 10;

  const concentrationFactor = 100 / cookedDishWeightGrams;

  const totalPotMacros: Macros = {
    calories: Math.round(potCalories),
    protein: Math.round(potProtein * 10) / 10,
    fat: Math.round(potFat * 10) / 10,
    carbs: Math.round(potCarbs * 10) / 10,
  };

  const cookedMacrosPer100g: Macros = {
    calories: Math.round(potCalories * concentrationFactor),
    protein: Math.round(potProtein * concentrationFactor * 10) / 10,
    fat: Math.round(potFat * concentrationFactor * 10) / 10,
    carbs: Math.round(potCarbs * concentrationFactor * 10) / 10,
  };

  return {
    totalRawWeightGrams: Math.round(totalRawWeightGrams),
    cookedDishWeightGrams,
    waterLossPercentage,
    totalPotMacros,
    cookedMacrosPer100g,
  };
}
