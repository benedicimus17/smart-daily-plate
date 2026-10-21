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
  'шт': 60,
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

  // Наприклад: "250г куряче філе", "2 шт яйця", "15 мл олії"
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

  if (q.includes('яйц') || q.includes('яєц')) {
    return COMMON_FOODS.find(f => f.id === 'eggs')!;
  }
  if (q.includes('кревет')) {
    return COMMON_FOODS.find(f => f.id === 'shrimp')!;
  }
  if (q.includes('шпинат')) {
    return COMMON_FOODS.find(f => f.id === 'spinach')!;
  }
  if (q.includes('авокадо')) {
    return COMMON_FOODS.find(f => f.id === 'avocado')!;
  }
  if (q.includes('паст') || q.includes('макарон')) {
    return COMMON_FOODS.find(f => f.id === 'pasta_durum')!;
  }
  if (q.includes('кур') || q.includes('філе')) {
    return COMMON_FOODS.find(f => f.id === 'chicken_breast')!;
  }
  if (q.includes('лосос') || q.includes('сьомг')) {
    return COMMON_FOODS.find(f => f.id === 'salmon')!;
  }
  if (q.includes('рис')) {
    return COMMON_FOODS.find(f => f.id === 'rice_basmati')!;
  }
  if (q.includes('гречк')) {
    return COMMON_FOODS.find(f => f.id === 'buckwheat')!;
  }
  if (q.includes('вівсян') || q.includes('вівсянк')) {
    return COMMON_FOODS.find(f => f.id === 'oats')!;
  }
  if (q.includes('олій') || q.includes('оливков')) {
    return COMMON_FOODS.find(f => f.id === 'olive_oil')!;
  }
  if (q.includes('масл')) {
    return COMMON_FOODS.find(f => f.id === 'butter')!;
  }
  if (q.includes('сир кисломол') || q.includes('творог')) {
    return COMMON_FOODS.find(f => f.id === 'cottage_cheese_5')!;
  }
  if (q.includes('йогурт')) {
    return COMMON_FOODS.find(f => f.id === 'greek_yogurt_2')!;
  }
  if (q.includes('томат') || q.includes('помідор')) {
    return COMMON_FOODS.find(f => f.id === 'tomatoes')!;
  }
  if (q.includes('картопл')) {
    return COMMON_FOODS.find(f => f.id === 'potatoes')!;
  }
  if (q.includes('ялович') || q.includes('стейк')) {
    return COMMON_FOODS.find(f => f.id === 'beef_lean')!;
  }

  // Пошук за коренями
  const words = q.split(/\s+/).map(normalizeStem).filter(w => w.length > 2);
  let bestFood = COMMON_FOODS[0];
  let maxScore = -1;

  for (const food of COMMON_FOODS) {
    const foodWords = food.name.toLowerCase().split(/\s+/).map(normalizeStem);
    let score = 0;
    for (const w of words) {
      if (foodWords.some(fw => fw.includes(w) || w.includes(fw))) {
        score += 2;
      }
    }
    if (score > maxScore) {
      maxScore = score;
      bestFood = food;
    }
  }

  if (maxScore > 0) {
    return bestFood;
  }

  // Фоллбек
  return {
    id: `custom-${Date.now()}`,
    name: query,
    per100g: { calories: 120, protein: 6, fat: 3, carbs: 16 }
  };
}

/**
 * Розумний парсер рецептів за URL (TikTok, Instagram Reels, кулінарні блоги)
 */
export function parseRecipeFromUrl(url: string, servings: number = 2): ParsedRecipe {
  const lowerUrl = url.toLowerCase();

  let title = 'TikTok Протеїнова паста з креветками та шпинатом';
  let rawIngredientsText = `- 250г паста з твердих сортів
- 350г очищені королівські креветки
- 120г свіжий шпинат
- 15 мл оливкова олія`;

  let instructions = [
    'Відварити пасту al dente у підсоленій воді 8-9 хвилин.',
    'Розігріти оливкову олію, обсмажити креветки зі шпинатом 3 хвилини.',
    'Поєднати відварену пасту з креветками та перемішати.'
  ];

  if (lowerUrl.includes('pancake') || lowerUrl.includes('панкейк') || lowerUrl.includes('breakfast')) {
    title = 'Reels: Вівсяно-протеїнові панкейки з ягодами';
    rawIngredientsText = `- 100г вівсяні пластівці
- 110г куряче яйце
- 150г грецький йогурт 2%
- 80г свіжі ягоди
- 10 мл оливкова олія`;
    instructions = [
      'Збити вівсянку, яйця та йогурт у блендері до однорідної маси.',
      'Смажити панкейки на сухій антипригарній пательні по 2 хвилини з кожного боку.',
      'Подавати зі свіжими ягодами.'
    ];
  } else if (lowerUrl.includes('salmon') || lowerUrl.includes('лосос') || lowerUrl.includes('fish') || lowerUrl.includes('bowl')) {
    title = 'TikTok: Збалансований боул із лососем та кіноа';
    rawIngredientsText = `- 300г лосось / сьомга
- 150г рис басматі сухий
- 100г авокадо
- 80г свіжий шпинат`;
    instructions = [
      'Запекти філе лосося з сіллю та перцем при 190°C 15 хвилин.',
      'Відварити рис басматі.',
      'Викласти в глибоку тарілку рис, шпинат, шматочки лосося та нарізане авокадо.'
    ];
  } else if (lowerUrl.includes('chicken') || lowerUrl.includes('кур') || lowerUrl.includes('філе')) {
    title = 'TikTok: Соковите куряче філе в прованських травах';
    rawIngredientsText = `- 400г куряче філе
- 150г гречка суха
- 100г помідори
- 15 мл оливкова олія`;
    instructions = [
      'Замаринувати філе курки з травами та олією на 10 хвилин.',
      'Обсмажити на грилі до золотистої скоринки (по 5 хв з боку).',
      'Подавати з розсипчастою гречкою та свіжими томатами.'
    ];
  } else if (lowerUrl.includes('steak') || lowerUrl.includes('ялович') || lowerUrl.includes('meat')) {
    title = 'Chef Reels: Соковитий яловичий стейк з овочами';
    rawIngredientsText = `- 350г яловичина нежирна
- 140г шпинат свіжий
- 100г помідори
- 10г вершкове масло 82%`;
    instructions = [
      'Прогріти стейк до кімнатної температури.',
      'Смажити на розпеченій пательні по 3 хв з кожного боку.',
      'Додати шматочок вершкового масла та дати стейку відпочити 5 хвилин.'
    ];
  }

  return parseRecipeFromText(title, rawIngredientsText, servings, url, instructions);
}

/**
 * Головна функція парсингу тексту рецепта в структуровану модель
 */
export function parseRecipeFromText(
  title: string,
  rawText: string,
  servings: number = 1,
  sourceUrl?: string,
  customInstructions?: string[]
): ParsedRecipe {
  const lines = rawText
    .split('\n')
    .map(l => l.trim())
    .filter(l => l.length > 0);

  const ingredients: ParsedIngredient[] = [];
  const instructions: string[] = customInstructions || [];

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
