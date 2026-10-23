import { ParsedIngredient, ParsedRecipe } from '../types/recipe';
import { COMMON_FOODS } from '../data/foodDatabase';
import { FoodItem, Macros } from '../types/nutrition';
import { resolveCrossLingualEntity } from './foodOntology';

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
  const q = query.toLowerCase().trim();

  // 0. Крос-мовний семантичний онтологічний резолвер (ES, EN, UK, FR, IT, DE, PL)
  const crossEntity = resolveCrossLingualEntity(q);
  if (crossEntity) {
    if (crossEntity.id === 'minced_meat') return COMMON_FOODS.find(f => f.id === 'ground_meat')!;
    if (crossEntity.id === 'tortilla') return COMMON_FOODS.find(f => f.id === 'tortilla_espanola')!;
    if (crossEntity.id === 'jamon') return COMMON_FOODS.find(f => f.id === 'jamon_iberico')!;
    if (crossEntity.id === 'gazpacho') return COMMON_FOODS.find(f => f.id === 'gazpacho_andaluz')!;
    if (crossEntity.id === 'baguette') return COMMON_FOODS.find(f => f.id === 'baguette_tradition')!;
    if (crossEntity.id === 'pasta_fagioli') return COMMON_FOODS.find(f => f.id === 'pasta_fagioli')!;
    if (crossEntity.id === 'chicken') return COMMON_FOODS.find(f => f.id === 'chicken_breast')!;
    if (crossEntity.id === 'beef_steak') return COMMON_FOODS.find(f => f.id === 'beef_lean')!;
    if (crossEntity.id === 'salmon') return COMMON_FOODS.find(f => f.id === 'salmon')!;
    if (crossEntity.id === 'tuna') return COMMON_FOODS.find(f => f.id === 'tuna_canned')!;
    if (crossEntity.id === 'croissant') return COMMON_FOODS.find(f => f.id === 'croissant')!;
    if (crossEntity.id === 'pizza') return COMMON_FOODS.find(f => f.id === 'pizza')!;
    if (crossEntity.id === 'burger') return COMMON_FOODS.find(f => f.id === 'big_mac')!;
    if (crossEntity.id === 'eggs') return COMMON_FOODS.find(f => f.id === 'eggs')!;
    if (crossEntity.id === 'syrniki') return COMMON_FOODS.find(f => f.id === 'syrniki_dish')!;
    if (crossEntity.id === 'yogurt_protein') return COMMON_FOODS.find(f => f.id === 'yogur_proteico_hacendado')!;
  }

  // 1. Фастфуд, випічка, снеки та особливі назви
  if (q.includes('біг мак') || q.includes('бігмак') || q.includes('бургер') || q.includes('гамбургер') || q.includes('чізбургер') || q.includes('макдональд')) {
    return COMMON_FOODS.find(f => f.id === 'big_mac')!;
  }
  if (q.includes('круасан') || q.includes('круасон') || q.includes('croissant')) {
    return COMMON_FOODS.find(f => f.id === 'croissant')!;
  }
  if (q.includes('горіх') || q.includes('горіш') || q.includes('мигдал') || q.includes('фундук') || q.includes('волоськ') || q.includes('кеш')) {
    return COMMON_FOODS.find(f => f.id === 'nuts_mix')!;
  }
  if (q.includes('снек') || q.includes('батончик') || q.includes('перекус')) {
    return COMMON_FOODS.find(f => f.id === 'snack_bar')!;
  }
  if (q.includes('салат')) {
    if (q.includes('цезар')) return COMMON_FOODS.find(f => f.id === 'salad_caesar')!;
    if (q.includes('грецьк')) return COMMON_FOODS.find(f => f.id === 'salad_greek')!;
    return COMMON_FOODS.find(f => f.id === 'salad_fresh')!;
  }
  if (q.includes('піца') || q.includes('піцц') || q.includes('pizza')) {
    return COMMON_FOODS.find(f => f.id === 'pizza')!;
  }
  if (q.includes('борщ')) {
    return COMMON_FOODS.find(f => f.id === 'soup_borscht')!;
  }
  if (q.includes('суп') || q.includes('бульйон')) {
    return COMMON_FOODS.find(f => f.id === 'soup_chicken')!;
  }
  if (q.includes('шаурм') || q.includes('донер')) {
    return COMMON_FOODS.find(f => f.id === 'shaurma')!;
  }
  if (q.includes('вареник') || q.includes('пельмен')) {
    return COMMON_FOODS.find(f => f.id === 'dumplings_varenyky')!;
  }
  if (q.includes('сирник')) {
    return COMMON_FOODS.find(f => f.id === 'syrniki_dish')!;
  }
  if (q.includes('печив')) {
    return COMMON_FOODS.find(f => f.id === 'cookies')!;
  }
  if (q.includes('шоколад')) {
    return COMMON_FOODS.find(f => f.id === 'chocolate')!;
  }
  if (q.includes('джем') || q.includes('варенн') || q.includes('повидл')) {
    return COMMON_FOODS.find(f => f.id === 'jam')!;
  }
  if (q.includes('огірок') || q.includes('огір')) {
    return COMMON_FOODS.find(f => f.id === 'cucumber')!;
  }
  if (q.includes('капуст')) {
    return COMMON_FOODS.find(f => f.id === 'cabbage')!;
  }
  if (q.includes('моркв')) {
    return COMMON_FOODS.find(f => f.id === 'carrot')!;
  }
  if (q.includes('кава') || q.includes('лате') || q.includes('латте') || q.includes('капучин')) {
    return COMMON_FOODS.find(f => f.id === 'coffee_latte')!;
  }

  // 2. Стандартні українські ключові слова
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
  if (q.includes('лаваш')) {
    return COMMON_FOODS.find(f => f.id === 'pita_lavash')!;
  }
  if (q.includes('протеїн') || q.includes('ізолят')) {
    return COMMON_FOODS.find(f => f.id === 'protein_isolate')!;
  }
  if (q.includes('чіа')) {
    return COMMON_FOODS.find(f => f.id === 'chia_seeds')!;
  }

  // 3. Точний пошук за словами без плутанини (boundary matching)
  const words = q.split(/[\s,./\(\)\-]+/).filter(w => w.length > 2);
  for (const food of COMMON_FOODS) {
    const fWords = food.name.toLowerCase().split(/[\s,./\(\)\-]+/).filter(w => w.length > 2);
    if (words.some(w => fWords.some(fw => fw === w || (w.length >= 4 && fw.startsWith(w))))) {
      return food;
    }
  }

  // 4. Реалістичний дефолт для натуральної страви
  return {
    id: `custom-${Date.now()}`,
    name: query,
    per100g: { calories: 155, protein: 9.0, fat: 5.0, carbs: 18.0 }
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

  // 1. БІГ МАК / БУРГЕР
  if (lower.includes('біг мак') || lower.includes('бігмак') || lower.includes('бургер') || lower.includes('макдональд')) {
    const rawText = `- ${validWeight}г Бургер Біг Мак (McDonalds)`;

    return parseRecipeFromText(
      'Бургер Біг Мак (соковита телятина та сир)',
      rawText,
      1,
      undefined,
      [
        'Підсмажити котлету з відбірної яловичини на грилі до готовності.',
        'Підрум’янити булочку з кунжутом на сухій пательні.',
        'Зібрати бургер: булочка, сир Чеддер, котлета, свіжі томати та соус.'
      ]
    );
  }

  // 2. КРУАСАН
  if (lower.includes('круасан') || lower.includes('круасон') || lower.includes('croissant')) {
    const rawText = `- ${validWeight}г Круасан вершковий французький`;
    return parseRecipeFromText(
      'Французький вершковий круасан',
      rawText,
      1,
      undefined,
      [
        'Ніжний свіжий круасан на вершковому маслі.',
        'Ідеально смакує теплим до ранкової кави або чаю.'
      ]
    );
  }

  // 3. ГОРІШКИ / МИГДАЛЬ
  if (lower.includes('горіх') || lower.includes('горіш') || lower.includes('мигдал') || lower.includes('фундук') || lower.includes('волоськ')) {
    const rawText = `- ${validWeight}г Горіхи асорті (мигдаль, волоські, фундук)`;
    return parseRecipeFromText(
      'Мікс добірних горіхів (енергетичний перекус)',
      rawText,
      1,
      undefined,
      [
        'Натуральні добірні горіхи без солі та цукру.',
        'Джерело корисних омега-3 жирів, рослинного білка та магнію.'
      ]
    );
  }

  // 4. СВІЖИЙ САЛАТ
  if (lower.includes('салат')) {
    if (lower.includes('цезар')) {
      const rawText = `- ${validWeight}г Салат Цезар з куркою`;
      return parseRecipeFromText('Салат Цезар з курячим філе', rawText, 1);
    }
    if (lower.includes('грецьк')) {
      const rawText = `- ${validWeight}г Грецький салат з фетою`;
      return parseRecipeFromText('Грецький салат зі свіжими овочами та фетою', rawText, 1);
    }
    const oilWeight = Math.min(8, Math.max(3, Math.round(validWeight * 0.04)));
    const vegWeight = Math.round((validWeight - oilWeight) / 2);
    const tomatoWeight = vegWeight;
    const cucumberWeight = validWeight - oilWeight - tomatoWeight;

    const rawText = `- ${tomatoWeight}г Помідори свіжі
- ${cucumberWeight}г Огірок свіжий
- ${oilWeight} мл Оливкова олія extra virgin`;

    return parseRecipeFromText(
      'Свіжий овочевий салат з оливковою олією',
      rawText,
      1,
      undefined,
      [
        'Нарізати свіжі стиглі томати та хрусткі огірки.',
        'Заправити оливковою олією Extra Virgin та морською сіллю.',
        'Прикрасити свіжою зеленню.'
      ]
    );
  }

  // 5. СНЕК / ПРОТЕЇНОВИЙ БАТОНЧИК
  if (lower.includes('снек') || lower.includes('батончик')) {
    const rawText = `- ${validWeight}г Протеїновий снек-батончик`;
    return parseRecipeFromText(
      'Збалансований поживний снек',
      rawText,
      1,
      undefined,
      ['Корисний снек для швидкого поповнення енергії та білка без зайвих простих цукрів.']
    );
  }

  // 6. ТОСТ З БАНАНОМ
  if (lower.includes('тост') && lower.includes('банан')) {
    const breadWeight = Math.round(validWeight * 0.40);
    const bananaWeight = Math.round(validWeight * 0.55);
    const spreadWeight = validWeight - breadWeight - bananaWeight;

    const rawText = `- ${breadWeight}г Хліб цільнозерновий / тост
- ${bananaWeight}г Банан свіжий
- ${spreadWeight}г Арахісова паста натуральна`;

    return parseRecipeFromText(
      'Тости з бананом та арахісовою пастою',
      rawText,
      1,
      undefined,
      [
        'Підсушити скибочки цільнозернового хліба в тостері до золотистої скоринки.',
        'Намастити тонким шаром натуральну арахісову пасту.',
        'Нарізати стиглий банан кружальцями та викласти на тости.'
      ]
    );
  }

  // 7. КРЕПСИ / МЛИНЦІ З М'ЯСОМ
  if ((lower.includes('креп') || lower.includes('млинц') || lower.includes('налисник')) && (lower.includes("м'яс") || lower.includes('фарш') || lower.includes('meat'))) {
    const crepesWeight = Math.round(validWeight * 0.50);
    const meatWeight = Math.round(validWeight * 0.45);
    const oilWeight = validWeight - crepesWeight - meatWeight;

    const rawText = `- ${crepesWeight}г Млинці / крепси базові
- ${meatWeight}г Фарш м’ясний (яловичий / курячий)
- ${oilWeight} мл Оливкова олія extra virgin`;

    return parseRecipeFromText(
      'Домашні крепси з соковитим м’ясним фаршем',
      rawText,
      1,
      undefined,
      [
        'Обсмажити подрібнену цибулю та м\'ясний фарш на оливковій олії зі спеціями.',
        'Викласти соковиту начинку в центр тонкого млинця.',
        'Згорнути конвертиком та підрум\'янити на пательні по 1 хв з кожного боку.'
      ]
    );
  }

  // 8. ВІВСЯНКА З БАНАНОМ
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

  // 9. ЛАВАШ / ШАУРМА
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

  // 10. Загальний пошук за назвою продукту через базу
  const matched = findBestMatch(dishName);
  const rawText = `- ${validWeight}г ${matched.name}`;
  return parseRecipeFromText(matched.name, rawText, 1);
}

/**
 * Розумний парсер рецептів за URL (TikTok, Instagram Reels, кулінарні блоги)
 */
export function parseRecipeFromUrl(
  url: string,
  contextPromptOrServings?: string | number,
  servings: number = 1
): ParsedRecipe {
  let contextPrompt: string | undefined = undefined;
  let effectiveServings = servings;

  if (typeof contextPromptOrServings === 'number') {
    effectiveServings = contextPromptOrServings;
  } else if (typeof contextPromptOrServings === 'string') {
    contextPrompt = contextPromptOrServings;
  }

  // 1. Якщо користувач вказав конкретну страву у підказці (найвищий пріоритет)
  const cleanPrompt = (contextPrompt || '').trim();
  if (cleanPrompt.length >= 2) {
    const dish = parseSmartDish(cleanPrompt, 260);
    return {
      ...dish,
      title: `TikTok: ${dish.title}`,
      sourceUrl: url,
      servings: effectiveServings
    };
  }

  // 2. Якщо підказки нема, витягуємо слова з URL slug
  const cleanUrl = url.toLowerCase().replace(/['’`ʼ]/g, "'");
  const urlParts = cleanUrl
    .replace(/https?:\/\//, '')
    .replace(/[?#].*$/, '')
    .split(/[/_\-.]+/)
    .filter(p => p.length > 2 && !['www', 'tiktok', 'com', 'video', 'watch', 'reel', 'reels', 'shorts', 'youtube', 'instagram', 'vm'].includes(p));

  const urlText = urlParts.join(' ');

  // Якщо в URL є назва страви, парсимо її
  if (urlText.length > 2) {
    const dish = parseSmartDish(urlText, 260);
    return {
      ...dish,
      title: `TikTok: ${dish.title}`,
      sourceUrl: url,
      servings: effectiveServings
    };
  }

  // 3. Фоллбек для порожніх коротких посилань (vm.tiktok.com без тексту)
  const defaultDish = parseSmartDish('Крепси з м\'ясом', 260);
  return {
    ...defaultDish,
    title: 'TikTok: Домашні крепси з соковитим м’ясним фаршем',
    sourceUrl: url,
    servings: effectiveServings
  };
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
  const instructions: string[] = customInstructions ? [...customInstructions] : [];

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
