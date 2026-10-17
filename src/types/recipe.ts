import { Macros } from './nutrition';

export interface ParsedIngredient {
  rawLine: string;
  name: string;
  amountGrams: number;
  macros: Macros;
  matchedFoodId?: string;
}

export interface ParsedRecipe {
  title: string;
  sourceUrl?: string;
  servings: number;
  prepTimeMinutes?: number;
  ingredients: ParsedIngredient[];
  totalMacros: Macros;
  macrosPerServing: Macros;
  macrosPer100g: Macros;
  totalWeightGrams: number;
  instructions: string[];
}
