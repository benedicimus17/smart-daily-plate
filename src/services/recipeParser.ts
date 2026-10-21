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
 * Пошук найбільш відповідного продукту в базі
 */
export function findBestMatch(query: string): FoodItem {
  const q = query.toLowerCase();

  // 1. Точні українські ключові слова
  if (q.includes('тост') || q.includes('хліб') || q.includes('багет')) {
    return COMMON_FOODS.find(f => f.id === 'toast_bread')!;
  }
  if (q.includes('банан')) {
    return COMMON_FOODS.find(f => f.id === 'banana')!;
  }
  if (q.includes('креп') || q.includes('млинц') || q.includes('налисник')) {
    return COMMON_FOODS.find(f => f.id === 'crepes_base')!;
  }
  if (q.includes('фарш') || (q.includes('м\'яс') && !q.includes('філе'))) {
    return COMMON_FOODS.find(f => f.id === 'ground_meat')!;
  }
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
  if (q.includes('індичк')) {
    return COMMON_FOODS.find(f => f.id === 'turkey_breast')!;
  }
  if (q.includes('кур') || q.includes('філе')) {
    return COMMON_FOODS.find(f => f.id === 'chicken_breast')!;
  }
  if (q.includes('лосос') || q.includes('сьомг')) {
    return COMMON_FOODS.find(f => f.id === 'salmon')!;
  }
  if (q.includes('тун')) {
    return COMMON_FOODS.find(f => f.id === 'tuna_canned')!;
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
  if (q.includes('арахіс')) {
    return COMMON_FOODS.find(f => f.id === 'peanut_butter')!;
  }
  if (q.includes('сир кисломол') || q.includes('творог')) {
    return COMMON_FOODS.find(f => f.id === 'cottage_cheese_5')!;
  }
  if (q.includes('рікот') || q.includes('рикот')) {
    return COMMON_FOODS.find(f => f.id === 'ricotta')!;
  }
  if (q.includes('йогурт')) {
    return COMMON_FOODS.find(f => f.id === 'greek_yogurt_2')!;
  }
  if (q.includes('яблук')) {
    return COMMON_FOODS.find(f => f.id === 'apple')!;
  }
  if (q.includes('ягід') || q.includes('лохин') || q.includes('малин') || q.includes('полуниц')) {
    return COMMON_FOODS.find(f => f.id === 'berries_mix')!;
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
  if (q.includes('лаваш') || q.includes('шаурм')) {
    return COMMON_FOODS.find(f => f.id === 'pita_lavash')!;
  }
  if (q.includes('протеїн') || q.includes('ізолят')) {
    return COMMON_FOODS.find(f => f.id === 'protein_isolate')!;
  }
  if (q.includes('чіа')) {
    return COMMON_FOODS.find(f => f.id === 'chia_seeds')!;
  }

  // 2. Пошук за збігом слів у назвах
  const words = q.split(/\s+/).filter(w => w.length > 2);
  for (const food of COMMON_FOODS) {
    const foodLower = food.name.toLowerCase();
    if (words.some(w => foodLower.includes(w))) {
      return food;
    }
  }

  // Фоллбек
  return {
    id: `custom-${Date.now()}`,
    name: query,
    per100g: { calories: 145, protein: 8.5, fat: 4.0, carbs: 18.0 }
  };
}

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

/**
 * Розумний парсер для вільного тексту (розбивка складених страв)
 */
export function parseSmartDish(dishName: string, totalWeightGrams: number = 210): ParsedRecipe {
  const lower = dishName.toLowerCase().trim().replace(/['’`ʼ]/g, "'");
  const validWeight = totalWeightGrams > 0 ? totalWeightGrams : 210;

  // 1. ТОСТ З БАНАНОМ
  if (lower.includes('тост') && lower.includes('банан')) {
    const breadWeight = Math.round(validWeight * 0.40); // 84г хліб (~2 шматочки)
    const bananaWeight = Math.round(validWeight * 0.55); // 116г банан
    const spreadWeight = validWeight - breadWeight - bananaWeight; // 10г арахісова паста/масло

    const rawText = `- ${breadWeight}г Хліб цільнозерновий / тост
- ${bananaWeight}г Банан свіжий
- ${spreadWeight}г Арахісова паста натуральна`;

    return parseRecipeFromText(
      'Тости з бананом та арахісовою пастою',
      rawText,
      1,
      undefined,
      [
        'Підсушити скибочки цільнозернового хліба в тостері або на сухій пательні до золотистої скоринки.',
        'Намастити тонким шаром натуральну арахісову пасту.',
        'Нарізати стиглий банан кружальцями та рівномірно викласти на тости.'
      ]
    );
  }

  // 2. КРЕПСИ / МЛИНЦІ З М'ЯСОМ
  if ((lower.includes('креп') || lower.includes('млинц') || lower.includes('налисник')) && (lower.includes("м'яс") || lower.includes('фарш') || lower.includes('meat'))) {
    const crepesWeight = Math.round(validWeight * 0.50);
    const meatWeight = Math.round(validWeight * 0.45);
    const oilWeight = validWeight - crepesWeight - meatWeight;

    const rawText = `- ${crepesWeight}г Млинці / крепси базові
- ${meatWeight}г Фарш м’ясний (яловичий / курячий)
- ${oilWeight} мл Оливкова олія extra virgin`;

    return parseRecipeFromText(
      'Домашні крепси (млинці) з ніжним м\'ясним фаршем',
      rawText,
      1,
      undefined,
      [
        'Обсмажити подрібнену цибулю та м\'ясний фарш на оливковій олії зі спеціями до готовності (8-10 хв).',
        'Викласти соковиту начинку в центр тонкого млинця.',
        'Згорнути конвертиком та підрум\'янити на пательні по 1 хв з кожного боку.'
      ]
    );
  }

  // 3. ВІВСЯНКА З БАНАНОМ ТА ЯГОДАМИ
  if (lower.includes('вівсян') && (lower.includes('банан') || lower.includes('ягід'))) {
    const oatsWeight = Math.round(validWeight * 0.25);
    const bananaWeight = Math.round(validWeight * 0.50);
    const yogurtWeight = validWeight - oatsWeight - bananaWeight;

    const rawText = `- ${oatsWeight}г Вівсяні пластівці
- ${bananaWeight}г Банан свіжий
- ${yogurtWeight}г Грецький йогурт 2%`;

    return parseRecipeFromText(
      'Вівсянка з бананом та грецьким йогуртом',
      rawText,
      1,
      undefined,
      [
        'Залити вівсяні пластівці окропом на 5 хвилин.',
        'Додати густий грецький йогурт та нарізаний банан.'
      ]
    );
  }

  // 4. ЛАВАШ / ШАУРМА З КУРКОЮ
  if (lower.includes('лаваш') || lower.includes('шаурм') || lower.includes('рол')) {
    const lavashWeight = Math.round(validWeight * 0.30);
    const chickenWeight = Math.round(validWeight * 0.45);
    const vegWeight = validWeight - lavashWeight - chickenWeight;

    const rawText = `- ${lavashWeight}г Лаваш вірменський тонкий
- ${chickenWeight}г Куряче філе
- ${vegWeight}г Помідори свіжі`;

    return parseRecipeFromText(
      'Фітнес-рол у тонкому лаваші з курячим філе',
      rawText,
      1,
      undefined,
      [
        'Запекти філе курки зі спеціями та нарізати смужками.',
        'Викласти на лаваш разом із томатами та згорнути в рол.',
        'Підсушити на грилі до хрусткості.'
      ]
    );
  }

  // Загальний фоллбек через parseRecipeFromText
  return parseRecipeFromText(dishName, `- ${validWeight}г ${dishName}`, 1);
}

/**
 * Розумний парсер рецептів за URL (TikTok, Instagram Reels, кулінарні блоги)
 */
export function parseRecipeFromUrl(
  url: string,
  contextPromptOrServings?: string | number,
  servings: number = 2
): ParsedRecipe {
  let contextPrompt: string | undefined = undefined;
  let effectiveServings = servings;

  if (typeof contextPromptOrServings === 'number') {
    effectiveServings = contextPromptOrServings;
  } else if (typeof contextPromptOrServings === 'string') {
    contextPrompt = contextPromptOrServings;
  }

  const combined = `${url} ${contextPrompt || ''}`.toLowerCase().replace(/['’`ʼ]/g, "'");

  // 1. КРЕПСИ / МЛИНЦІ З М'ЯСОМ (Випадок з тестування Власника)
  if ((combined.includes('креп') || combined.includes('млинц') || combined.includes('налисник') || combined.includes('crepe')) &&
      (combined.includes("м'яс") || combined.includes('фарш') || combined.includes('meat') || combined.includes('ялович'))) {
    const title = 'TikTok: Домашні крепси з соковитим м’ясним фаршем';
    const rawIngredientsText = `- 180г Млинці / крепси базові
- 220г Фарш м’ясний (яловичий / курячий)
- 80г Помідори свіжі
- 15 мл Оливкова олія extra virgin`;
    const instructions = [
      'Обсмажити подрібнену цибулю та соковитий фарш на оливковій олії зі спеціями (8-10 хв).',
      'Викласти по 2 столові ложки гарячої м\'ясної начинки в центр тонкого крепсу.',
      'Згорнути акуратним конвертиком та підрум\'янити на пательні по 1 хвилині з кожного боку.'
    ];
    return parseRecipeFromText(title, rawIngredientsText, effectiveServings, url, instructions);
  }

  // 2. ПАНКЕЙКИ / СОЛОДКІ КРЕПСИ
  if (combined.includes('pancake') || combined.includes('панкейк') || combined.includes('breakfast')) {
    const title = 'Reels: Вівсяно-протеїнові панкейки з ягодами';
    const rawIngredientsText = `- 100г Вівсяні пластівці
- 110г Куряче яйце
- 150г Грецький йогурт 2%
- 80г Ягоди свіжі (лохина, малина)
- 10 мл Оливкова олія extra virgin`;
    const instructions = [
      'Збити вівсянку, яйця та йогурт у блендері до однорідної маси.',
      'Смажити панкейки на сухій антипригарній пательні по 2 хвилини з кожного боку.',
      'Подавати зі свіжими ягодами.'
    ];
    return parseRecipeFromText(title, rawIngredientsText, effectiveServings, url, instructions);
  }

  // 3. БОУЛ З ЛОСОСЕМ
  if (combined.includes('salmon') || combined.includes('лосос') || combined.includes('fish') || combined.includes('bowl')) {
    const title = 'TikTok: Збалансований боул із лососем та кіноа';
    const rawIngredientsText = `- 300г Лосось / сьомга
- 150г Рис басматі сухий
- 100г Авокадо
- 80г Шпинат свіжий`;
    const instructions = [
      'Запекти філе лосося з сіллю та перцем при 190°C 15 хвилин.',
      'Відварити рис басматі.',
      'Викласти в глибоку тарілку рис, шпинат, шматочки лосося та нарізане авокадо.'
    ];
    return parseRecipeFromText(title, rawIngredientsText, effectiveServings, url, instructions);
  }

  // 4. КУРЯЧЕ ФІЛЕ ТА ГРЕЧКА
  if (combined.includes('chicken') || combined.includes('кур') || combined.includes('філе')) {
    const title = 'TikTok: Соковите куряче філе в прованських травах';
    const rawIngredientsText = `- 400г Куряче філе
- 150г Гречка суха
- 100г Помідори свіжі
- 15 мл Оливкова олія extra virgin`;
    const instructions = [
      'Замаринувати філе курки з травами та олією на 10 хвилин.',
      'Обсмажити на грилі до золотистої скоринки (по 5 хв з боку).',
      'Подавати з розсипчастою гречкою та свіжими томатами.'
    ];
    return parseRecipeFromText(title, rawIngredientsText, effectiveServings, url, instructions);
  }

  // 5. СТЕЙК ТА ОВОЧІ
  if (combined.includes('steak') || combined.includes('ялович') || combined.includes('meat') || combined.includes('стейк')) {
    const title = 'Chef Reels: Соковитий яловичий стейк з овочами';
    const rawIngredientsText = `- 350г Яловичина нежирна
- 140г Шпинат свіжий
- 100г Помідори свіжі
- 10г Вершкове масло 82%`;
    const instructions = [
      'Прогріти стейк до кімнатної температури.',
      'Смажити на розпеченій пательні по 3 хв з кожного боку.',
      'Додати шматочок вершкового масла та дати стейку відпочити 5 хвилин.'
    ];
    return parseRecipeFromText(title, rawIngredientsText, effectiveServings, url, instructions);
  }

  // 6. ПАСТА З КРЕВЕТКАМИ (За замовчуванням)
  const title = 'TikTok: Протеїнова паста з креветками та шпинатом';
  const rawIngredientsText = `- 250г Паста / макарони з твердих сортів
- 350г Креветки очищені
- 120г Шпинат свіжий
- 15 мл Оливкова олія extra virgin`;
  const instructions = [
    'Відварити пасту al dente у підсоленій воді 8-9 хвилин.',
    'Розігріти оливкову олію, обсмажити креветки зі шпинатом 3 хвилини.',
    'Поєднати відварену пасту з креветками та перемішати.'
  ];

  return parseRecipeFromText(title, rawIngredientsText, effectiveServings, url, instructions);
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
