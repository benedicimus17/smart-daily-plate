import { ParsedIngredient, ParsedRecipe } from '../types/recipe';
import { COMMON_FOODS } from '../data/foodDatabase';
import { FoodItem, Macros } from '../types/nutrition';

/**
 * Одиниці вимірювання та їх приблизна вага в грамах
 */
const UNIT_CONVERSIONS: Record<string, number> = {
  'г': 1,
  'гр': 1,
  'g': 1,
  'грам': 1,
  'кг': 1000,
  'kg': 1000,
  'мл': 1,
  'ml': 1,
  'л': 1000,
  'ст.л': 15,
  'ст.л.': 15,
  'ч.л': 5,
  'ч.л.': 5,
  'шт': 60, // середній розмір штучного продукту
  'шт.': 60,
};

/**
 * Парсер окремого рядка інгредієнта
 */
export function parseIngredientLine(line: string): ParsedIngredient {
  const trimmed = line.trim().replace(/^[-•*]\s*/, '');
  if (!trimmed) {
    return {
      rawLine: line,
      name: 'Інгредієнт',
      amountGrams: 100,
      macros: { calories: 100, protein: 5, fat: 3, carbs: 12 }
    };
  }

  // Спробуємо знайти кількість та одиницю (наприклад: "250г куряче філе", "2 шт яйця", "15 мл олії")
  const match = trimmed.match(/^([\d.,]+)\s*([a-zA-Zа-яА-ЯіІїЇєЄ.]+)?\s+(.+)$/i);

  let amountGrams = 100;
  let name = trimmed;

  if (match) {
    const rawNum = parseFloat(match[1].replace(',', '.'));
    const rawUnit = (match[2] || '').toLowerCase().trim();
    name = match[3].trim();

    if (!isNaN(rawNum)) {
      if (rawUnit && UNIT_CONVERSIONS[rawUnit]) {
        amountGrams = Math.round(rawNum * UNIT_CONVERSIONS[rawUnit]);
      } else if (rawUnit === 'яйця' || rawUnit === 'яйце' || rawUnit === 'яєць') {
        amountGrams = Math.round(rawNum * 55);
        name = `Куряче яйце ${name}`.trim();
      } else {
        // Якщо одиниця не вказана або це просто грами
        amountGrams = Math.round(rawNum);
      }
    }
  }

  // Матчимо продукт у базі
  const matchedFood = findBestMatch(name);
  const ratio = amountGrams / 100;

  const macros: Macros = {
    calories: Math.round(matchedFood.per100g.calories * ratio),
    protein: Math.round(matchedFood.per100g.protein * ratio * 10) / 10,
    fat: Math.round(matchedFood.per100g.fat * ratio * 10) / 10,
    carbs: Math.round(matchedFood.per100g.carbs * ratio * 10) / 10,
  };

  return {
    rawLine: line,
    name: matchedFood.name || name,
    amountGrams,
    macros,
    matchedFoodId: matchedFood.id
  };
}

function normalizeStem(word: string): string {
  return word.toLowerCase().replace(/(я|е|є|и|і|й|у|ю|а|о|ів|ей|ем|ом|ою|ях|ям|ами|ями)$/i, '');
}

/**
 * Пошук найбільш схожого продукту в локальній базі
 */
function findBestMatch(query: string): FoodItem {
  const q = query.toLowerCase();

  // Прямі аліаси для високої точності
  if (q.includes('яйц') || q.includes('яєц')) {
    return COMMON_FOODS.find(f => f.id === 'eggs')!;
  }
  if (q.includes('кревет')) {
    return COMMON_FOODS.find(f => f.id === 'shrimp')!;
  }
  if (q.includes('кур') || q.includes('філе')) {
    return COMMON_FOODS.find(f => f.id === 'chicken_breast')!;
  }
  if (q.includes('олій')) {
    return COMMON_FOODS.find(f => f.id === 'olive_oil')!;
  }
  if (q.includes('паст') || q.includes('макарон') || q.includes('спагет')) {
    return COMMON_FOODS.find(f => f.id === 'pasta_durum')!;
  }
  if (q.includes('шпин')) {
    return COMMON_FOODS.find(f => f.id === 'spinach')!;
  }
  if (q.includes('лосос') || q.includes('сьомг')) {
    return COMMON_FOODS.find(f => f.id === 'salmon')!;
  }

  const queryStems = q.split(/[\s,]+/).map(normalizeStem).filter(s => s.length >= 3);

  for (const food of COMMON_FOODS) {
    const foodName = food.name.toLowerCase();
    if (q.includes(foodName) || foodName.includes(q)) {
      return food;
    }
    const foodStems = foodName.split(/[\s,]+/).map(normalizeStem).filter(s => s.length >= 3);
    for (const qStem of queryStems) {
      if (foodStems.some(fStem => fStem.includes(qStem) || qStem.includes(fStem))) {
        return food;
      }
    }
  }

  // За замовчуванням: нейтральний продукт
  return {
    id: 'generic_food',
    name: query,
    per100g: { calories: 120, protein: 4, fat: 3, carbs: 18 }
  };
}

/**
 * Повний парсинг рецепта з тексту чи імпортованих даних
 */
export function parseRecipeFromText(
  title: string,
  rawText: string,
  servings: number = 2,
  sourceUrl?: string
): ParsedRecipe {
  const lines = rawText
    .split('\n')
    .map(l => l.trim())
    .filter(l => l.length > 0);

  const ingredients: ParsedIngredient[] = [];
  const instructions: string[] = [];

  let isInstructionSection = false;

  for (const line of lines) {
    if (line.toLowerCase().includes('приготування') || line.toLowerCase().includes('кроки') || line.toLowerCase().includes('інструкція')) {
      isInstructionSection = true;
      continue;
    }

    if (isInstructionSection) {
      instructions.push(line);
    } else {
      ingredients.push(parseIngredientLine(line));
    }
  }

  // Якщо секція інструкцій не була виявлена або порожня
  if (ingredients.length === 0 && lines.length > 0) {
    for (const line of lines) {
      ingredients.push(parseIngredientLine(line));
    }
  }

  let totalWeightGrams = 0;
  let totalCalories = 0;
  let totalProtein = 0;
  let totalFat = 0;
  let totalCarbs = 0;

  for (const ing of ingredients) {
    totalWeightGrams += ing.amountGrams;
    totalCalories += ing.macros.calories;
    totalProtein += ing.macros.protein;
    totalFat += ing.macros.fat;
    totalCarbs += ing.macros.carbs;
  }

  const validServings = Math.max(1, servings);

  const totalMacros: Macros = {
    calories: Math.round(totalCalories),
    protein: Math.round(totalProtein * 10) / 10,
    fat: Math.round(totalFat * 10) / 10,
    carbs: Math.round(totalCarbs * 10) / 10,
  };

  const macrosPerServing: Macros = {
    calories: Math.round(totalCalories / validServings),
    protein: Math.round((totalProtein / validServings) * 10) / 10,
    fat: Math.round((totalFat / validServings) * 10) / 10,
    carbs: Math.round((totalCarbs / validServings) * 10) / 10,
  };

  const factor100g = totalWeightGrams > 0 ? 100 / totalWeightGrams : 0;
  const macrosPer100g: Macros = {
    calories: Math.round(totalCalories * factor100g),
    protein: Math.round(totalProtein * factor100g * 10) / 10,
    fat: Math.round(totalFat * factor100g * 10) / 10,
    carbs: Math.round(totalCarbs * factor100g * 10) / 10,
  };

  return {
    title: title.trim() || 'Рецепт без назви',
    sourceUrl,
    servings: validServings,
    ingredients,
    instructions: instructions.length > 0 ? instructions : ['Змішати інгредієнти та приготувати за смаком.'],
    totalWeightGrams,
    totalMacros,
    macrosPerServing,
    macrosPer100g,
  };
}
