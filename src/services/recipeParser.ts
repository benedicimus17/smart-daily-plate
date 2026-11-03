import { ParsedIngredient, ParsedRecipe } from '../types/recipe';
import { COMMON_FOODS } from '../data/foodDatabase';
import { FoodItem, Macros } from '../types/nutrition';
import { resolveCrossLingualEntity } from './foodOntology';

/**
 * Одиниці вимірювання та їх приблизна вага в грамах
  */
export const UNIT_CONVERSIONS: Record<string, number> = {
  'г': 1, 'гр': 1, 'g': 1, 'gram': 1, 'grams': 1, 'gramo': 1, 'gramos': 1, 'gr': 1,
  'кг': 1000, 'kg': 1000, 'kilo': 1000, 'kilos': 1000,
  'мл': 1, 'ml': 1,
  'л': 1000, 'l': 1000, 'liter': 1000, 'litro': 1000,
  'ст.л': 15, 'ст.л.': 15, 'ст л': 15, 'ст. л.': 15, 'ст л.': 15,
  'столова ложка': 15, 'столові ложки': 15, 'столових ложок': 15, 'столову ложку': 15,
  'tbsp': 15, 'tablespoon': 15, 'tablespoons': 15,
  'cucharada': 15, 'cucharadas': 15, 'cda': 15, 'cdas': 15,
  'ч.л': 5, 'ч.л.': 5, 'ч л': 5, 'ч. л.': 5,
  'чайна ложка': 5, 'чайні ложки': 5, 'чайних ложок': 5, 'чайну ложку': 5,
  'tsp': 5, 'teaspoon': 5, 'teaspoons': 5,
  'cucharadita': 5, 'cucharaditas': 5, 'cdta': 5, 'cdtas': 5,
  'cup': 200, 'cups': 200, 'склянка': 200, 'склянки': 200, 'стакан': 200, 'taza': 200, 'tazas': 200,
  'slice': 35, 'slices': 35, 'скибка': 35, 'скибки': 35, 'шматок': 35, 'шматочки': 35, 'rebanada': 35, 'rebanadas': 35, 'loncha': 35, 'lonchas': 35,
  'шт': -1, 'шт.': -1, 'штука': -1, 'штуки': -1, 'штук': -1,
  'pcs': -1, 'pc': -1, 'piece': -1, 'pieces': -1,
  'ud': -1, 'uds': -1, 'unidad': -1, 'unidades': -1
};

export const PIECE_WEIGHTS: Record<string, number> = {
  'яйц': 60, 'яєц': 60, 'huev': 60, 'egg': 60,
  'банан': 120, 'platan': 120, 'plátan': 120, 'banan': 120,
  'яблук': 150, 'manzan': 150, 'appl': 150,
  'авокад': 150, 'aguacat': 150, 'avocad': 150,
  'помідор': 100, 'томат': 100, 'tomat': 100,
  'огірок': 100, 'огірк': 100, 'pepin': 100, 'cucumb': 100,
  'картопл': 130, 'patat': 130, 'papa': 130, 'potat': 130,
  'круасан': 60, 'croiss': 60,
  'тортиль': 40, 'tortill': 40
};

/**
 * Пошук найбільш відповідного продукту в базі
 */
export function findBestMatch(query: string): FoodItem {
  const q = query.toLowerCase().trim();

  // 0. Крос-мовний семантичний онтологічний резолвер (ES, EN, UK, FR, IT, DE, PL)
  const crossEntity = resolveCrossLingualEntity(q);
  if (crossEntity) {
    if (crossEntity.id === 'minced_meat') return COMMON_FOODS.find(f => f.id === 'ground_meat') || COMMON_FOODS[0];
    if (crossEntity.id === 'tortilla') return COMMON_FOODS.find(f => f.id === 'tortilla_espanola') || COMMON_FOODS[0];
    if (crossEntity.id === 'jamon') return COMMON_FOODS.find(f => f.id === 'jamon_iberico') || COMMON_FOODS[0];
    if (crossEntity.id === 'gazpacho') return COMMON_FOODS.find(f => f.id === 'gazpacho_andaluz') || COMMON_FOODS[0];
    if (crossEntity.id === 'baguette') return COMMON_FOODS.find(f => f.id === 'baguette_tradition') || COMMON_FOODS[0];
    if (crossEntity.id === 'pasta_fagioli') return COMMON_FOODS.find(f => f.id === 'pasta_fagioli') || COMMON_FOODS[0];
    if (crossEntity.id === 'chicken') return COMMON_FOODS.find(f => f.id === 'chicken_breast') || COMMON_FOODS[0];
    if (crossEntity.id === 'beef_steak') return COMMON_FOODS.find(f => f.id === 'beef_lean') || COMMON_FOODS[0];
    if (crossEntity.id === 'salmon') return COMMON_FOODS.find(f => f.id === 'salmon') || COMMON_FOODS[0];
    if (crossEntity.id === 'tuna') return COMMON_FOODS.find(f => f.id === 'tuna_canned') || COMMON_FOODS[0];
    if (crossEntity.id === 'croissant') return COMMON_FOODS.find(f => f.id === 'croissant') || COMMON_FOODS[0];
    if (crossEntity.id === 'pizza') return COMMON_FOODS.find(f => f.id === 'pizza') || COMMON_FOODS[0];
    if (crossEntity.id === 'burger') return COMMON_FOODS.find(f => f.id === 'big_mac') || COMMON_FOODS[0];
    if (crossEntity.id === 'eggs') return COMMON_FOODS.find(f => f.id === 'eggs') || COMMON_FOODS[0];
    if (crossEntity.id === 'syrniki') return COMMON_FOODS.find(f => f.id === 'syrniki_dish') || COMMON_FOODS[0];
    if (crossEntity.id === 'yogurt_protein') return COMMON_FOODS.find(f => f.id === 'yogur_proteico_hacendado') || COMMON_FOODS[0];
    if (crossEntity.id === 'turkey') return COMMON_FOODS.find(f => f.id === 'turkey_breast') || COMMON_FOODS[0];
    if (crossEntity.id === 'pasta') return COMMON_FOODS.find(f => f.id === 'pasta_durum') || COMMON_FOODS[0];
    if (crossEntity.id === 'salad') return COMMON_FOODS.find(f => f.id === 'salad_fresh') || COMMON_FOODS[0];
    if (crossEntity.id === 'rice') return COMMON_FOODS.find(f => f.id === 'rice_basmati') || COMMON_FOODS[0];
    if (crossEntity.id === 'olive_oil') return COMMON_FOODS.find(f => f.id === 'olive_oil') || COMMON_FOODS[0];
    if (crossEntity.id === 'butter') return COMMON_FOODS.find(f => f.id === 'butter') || COMMON_FOODS[0];
    if (crossEntity.id === 'milk') return COMMON_FOODS.find(f => f.id === 'milk') || COMMON_FOODS[0];
    if (crossEntity.id === 'cheese') return COMMON_FOODS.find(f => f.id === 'cheddar_cheese') || COMMON_FOODS[0];
    if (crossEntity.id === 'bread') return COMMON_FOODS.find(f => f.id === 'toast_bread') || COMMON_FOODS[0];
    if (crossEntity.id === 'potato') return COMMON_FOODS.find(f => f.id === 'potatoes') || COMMON_FOODS[0];
    if (crossEntity.id === 'pork') return COMMON_FOODS.find(f => f.id === 'pork') || COMMON_FOODS[0];
    if (crossEntity.id === 'avocado') return COMMON_FOODS.find(f => f.id === 'avocado') || COMMON_FOODS[0];
    if (crossEntity.id === 'banana') return COMMON_FOODS.find(f => f.id === 'banana') || COMMON_FOODS[0];
    if (crossEntity.id === 'apple') return COMMON_FOODS.find(f => f.id === 'apple') || COMMON_FOODS[0];
    if (crossEntity.id === 'oats') return COMMON_FOODS.find(f => f.id === 'oats') || COMMON_FOODS[0];
    if (crossEntity.id === 'broccoli') return COMMON_FOODS.find(f => f.id === 'broccoli') || COMMON_FOODS[0];
    if (crossEntity.id === 'almonds') return COMMON_FOODS.find(f => f.id === 'almonds') || COMMON_FOODS[0];
    if (crossEntity.id === 'tofu') return COMMON_FOODS.find(f => f.id === 'tofu') || COMMON_FOODS[0];
    if (crossEntity.id === 'shrimp') return COMMON_FOODS.find(f => f.id === 'shrimp') || COMMON_FOODS[0];
    if (crossEntity.id === 'sour_cream') return COMMON_FOODS.find(f => f.id === 'sour_cream_15') || COMMON_FOODS[0];
    if (crossEntity.id === 'kefir') return COMMON_FOODS.find(f => f.id === 'kefir_1') || COMMON_FOODS[0];
    if (crossEntity.id === 'honey') return COMMON_FOODS.find(f => f.id === 'honey') || COMMON_FOODS[0];
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
  if (q.includes('олі') || q.includes('оливков') || q.includes('aceite')) {
    return COMMON_FOODS.find(f => f.id === 'olive_oil')!;
  }
  if (q.includes('вершков') || q.includes('масл') || q.includes('mantequilla')) {
    return COMMON_FOODS.find(f => f.id === 'butter')!;
  }
  if (q.includes('молок') || q.includes('leche')) {
    return COMMON_FOODS.find(f => f.id === 'milk')!;
  }
  if (q.includes('свинин') || q.includes('сало') || q.includes('cerdo')) {
    return COMMON_FOODS.find(f => f.id === 'pork')!;
  }
  if (q.includes('брокол') || q.includes('broccoli') || q.includes('brócoli')) {
    return COMMON_FOODS.find(f => f.id === 'broccoli')!;
  }
  if (q.includes('мед') || q.includes('miel')) {
    return COMMON_FOODS.find(f => f.id === 'honey')!;
  }
  if (q.includes('тофу') || q.includes('tofu')) {
    return COMMON_FOODS.find(f => f.id === 'tofu')!;
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
  let trimmed = line.trim().replace(/^[-•*]\s*/, '').replace(/^\d+[.)]\s+/, '').trim();
  // Очищення розмовного шуму та ввідних слів користувача ("приготуй будь ласка:", "потім додай", "та")
  trimmed = trimmed
    .replace(/^(?:(?:приготуй|будь ласка|візьми|додай|потім|також|та|і|порція|порції)\s*[:,\-]?\s*)+/gi, '')
    .trim();
  if (!trimmed) {
    return {
      rawLine: line,
      name: 'Інгредієнт',
      amountGrams: 100,
      macros: { calories: 100, protein: 5, fat: 3, carbs: 12 }
    };
  }

  let amountGrams = 100;
  let name = trimmed;
  let num: number | null = null;
  let unit = '';

  const postMatch = trimmed.match(/^(.*?)\s*[-:]?\s*([\d.,]+)\s*([a-zA-Zа-яА-ЯіІїЇєЄ.]+)?$/i);
  const preMatch = trimmed.match(/^([\d.,]+)\s*([a-zA-Zа-яА-ЯіІїЇєЄ.]+)?\s*(.*)$/i);

  if (/^[\d.,]/.test(trimmed) && preMatch) {
    num = parseFloat(preMatch[1].replace(',', '.'));
    const firstWord = (preMatch[2] || '').toLowerCase().trim();
    const rest = (preMatch[3] || '').trim();
    const restWords = rest.split(/\s+/);
    const secondWord = (restWords[0] || '').toLowerCase().trim();
    const twoWords = `${firstWord} ${secondWord}`.trim();

    if (UNIT_CONVERSIONS[twoWords]) {
      unit = twoWords;
      name = restWords.slice(1).join(' ').trim();
    } else if (UNIT_CONVERSIONS[firstWord]) {
      unit = firstWord;
      name = rest;
    } else {
      unit = 'pcs';
      name = `${firstWord} ${rest}`.trim();
    }
  } else if (postMatch && !isNaN(parseFloat(postMatch[2].replace(',', '.')))) {
    num = parseFloat(postMatch[2].replace(',', '.'));
    unit = (postMatch[3] || '').toLowerCase().trim();
    name = postMatch[1].trim();
  }

  name = name.replace(/^(de|з|із|of)\s+/i, '').trim();

  if (num !== null && !isNaN(num)) {
    if (unit && UNIT_CONVERSIONS[unit] && UNIT_CONVERSIONS[unit] > 0) {
      amountGrams = Math.round(num * UNIT_CONVERSIONS[unit]);
    } else {
      let pieceWeight = 80;
      const lowerName = name.toLowerCase();
      for (const [key, w] of Object.entries(PIECE_WEIGHTS)) {
        if (lowerName.includes(key)) {
          pieceWeight = w;
          break;
        }
      }
      amountGrams = Math.round(num * pieceWeight);
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
  const clean = dishName.trim();
  const lower = clean.toLowerCase().replace(/['’`ʼ]/g, "'");
  const validWeight = totalWeightGrams > 0 ? totalWeightGrams : 210;

  // Якщо користувач ввів складений рецепт (переноси рядків, коми, крапки з комою, плюси чи кілька кількостей)
  const isMultiIngredient = clean.includes('\n') ||
    clean.includes(',') ||
    clean.includes(';') ||
    clean.includes('+') ||
    /\s+(?:та|і|y|and)\s+\d/i.test(clean) ||
    (clean.match(/\b\d+[\d.,]*\s*(g|г|гр|kg|кг|ml|мл|l|л|tbsp|tsp|ст\.?л|ч\.?л|шт|pcs|ud)/gi) || []).length > 1;

  if (isMultiIngredient) {
    return parseRecipeFromText('Власна страва', clean, 1);
  }

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
    const dish = parseSmartDish(cleanPrompt, 260 * effectiveServings);
    return {
      ...dish,
      title: `TikTok: ${dish.title}`,
      sourceUrl: url,
      servings: effectiveServings,
      macrosPerServing: {
        calories: Math.round(dish.totalMacros.calories / effectiveServings),
        protein: Math.round((dish.totalMacros.protein / effectiveServings) * 10) / 10,
        fat: Math.round((dish.totalMacros.fat / effectiveServings) * 10) / 10,
        carbs: Math.round((dish.totalMacros.carbs / effectiveServings) * 10) / 10,
      }
    };
  }

  // 2. Якщо підказки нема, витягуємо слова з URL slug
  const cleanUrl = url.toLowerCase().replace(/['’`ʼ]/g, "'");
  const urlParts = cleanUrl
    .replace(/https?:\/\//, '')
    .replace(/[?#].*$/, '')
    .split(/[/_\-.]+/)
    .filter(p => p.length > 2 && !['www', 'tiktok', 'com', 'video', 'watch', 'reel', 'reels', 'shorts', 'youtube', 'instagram', 'vm'].includes(p));

  // Відфільтровуємо технічні хеші та цифрові ID відео (наприклад 'zm8xyql', '7391823482')
  const meaningfulWords = urlParts.filter(p => !/^\d+$/.test(p) && !/^[a-z0-9_-]{5,15}$/.test(p) && p.length > 2);
  const urlText = meaningfulWords.join(' ');

  // Якщо в URL є назва страви, парсимо її
  if (urlText.length > 2) {
    const dish = parseSmartDish(urlText, 260 * effectiveServings);
    return {
      ...dish,
      title: `TikTok: ${dish.title}`,
      sourceUrl: url,
      servings: effectiveServings,
      macrosPerServing: {
        calories: Math.round(dish.totalMacros.calories / effectiveServings),
        protein: Math.round((dish.totalMacros.protein / effectiveServings) * 10) / 10,
        fat: Math.round((dish.totalMacros.fat / effectiveServings) * 10) / 10,
        carbs: Math.round((dish.totalMacros.carbs / effectiveServings) * 10) / 10,
      }
    };
  }

  // 3. Фоллбек для порожніх коротких посилань (vm.tiktok.com без тексту)
  const defaultDish = parseSmartDish('Крепси з м\'ясом', 260 * effectiveServings);
  return {
    ...defaultDish,
    title: 'TikTok: Домашні крепси з соковитим м’ясним фаршем',
    sourceUrl: url,
    servings: effectiveServings,
    macrosPerServing: {
      calories: Math.round(defaultDish.totalMacros.calories / effectiveServings),
      protein: Math.round((defaultDish.totalMacros.protein / effectiveServings) * 10) / 10,
      fat: Math.round((defaultDish.totalMacros.fat / effectiveServings) * 10) / 10,
      carbs: Math.round((defaultDish.totalMacros.carbs / effectiveServings) * 10) / 10,
    }
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
  const rawLines = rawText.split('\n');
  const lines: string[] = [];

  const isInstruction = (text: string) => {
    const l = text.toLowerCase();
    return (
      l.includes('приготування') || l.includes('кроки') || l.includes('інструкція') || l.includes('спосіб') ||
      l.includes('instructions') || l.includes('steps') || l.includes('directions') || l.includes('preparation') || l.includes('method') ||
      l.includes('instrucciones') || l.includes('preparación') || l.includes('pasos') || l.includes('modo de preparación') ||
      /^(paso\s*\d+|step\s*\d+|крок\s*\d+|\d+\.)\s+/i.test(l)
    );
  };

  for (const rawLine of rawLines) {
    const trimmed = rawLine.trim();
    if (!trimmed) continue;

    if (isInstruction(trimmed)) {
      lines.push(trimmed);
      continue;
    }

    // Розбиваємо рядки, які містять кілька інгредієнтів через кому, крапку з комою, плюс або сполучники (та, і, y, and)
    if (trimmed.includes(',') || trimmed.includes(';') || trimmed.includes('+') || /\s+(?:та|і|y|and)\s+\d/i.test(trimmed)) {
      const parts = trimmed.split(/[,;+]|\s+(?:та|і|y|and)\s+(?=\d)/i).map(p => p.trim()).filter(p => p.length > 0);
      if (parts.length > 1 && parts.some(p => /\d/.test(p) || p.length > 3)) {
        lines.push(...parts);
        continue;
      }
    }

    lines.push(trimmed);
  }

  const ingredients: ParsedIngredient[] = [];
  const instructions: string[] = customInstructions ? [...customInstructions] : [];

  let isInstructionSection = false;

  for (const line of lines) {
    if (isInstruction(line)) {
      isInstructionSection = true;
      instructions.push(line);
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

/**
 * Швидкий резолвер вільної фрази користувача (наприклад: "2 круасани", "піца", "салат")
 * для 1-тап підміни реального прийому їжі.
 */
export function parseQuickDishInput(query: string): { name: string; weightGrams: number; macros: Macros } | null {
  const q = query.trim().toLowerCase();
  if (!q) return null;

  const matched = findBestMatch(q);
  if (!matched) return null;

  // Визначення приблизної ваги: якщо вказано "2 шт", "2 круасани" тощо
  let multiplier = 1;
  const countMatch = q.match(/(\d+)\s*(шт|круасан|шмат|кусок|порц)?/);
  if (countMatch && parseInt(countMatch[1], 10) > 1 && parseInt(countMatch[1], 10) <= 6) {
    multiplier = parseInt(countMatch[1], 10);
  }

  const baseWeight = matched.defaultServingWeight || 150;
  const totalWeight = baseWeight * multiplier;
  const ratio = totalWeight / 100;

  return {
    name: query.trim(),
    weightGrams: totalWeight,
    macros: {
      calories: Math.round(matched.per100g.calories * ratio),
      protein: Math.round(matched.per100g.protein * ratio),
      fat: Math.round(matched.per100g.fat * ratio),
      carbs: Math.round(matched.per100g.carbs * ratio)
    }
  };
}
