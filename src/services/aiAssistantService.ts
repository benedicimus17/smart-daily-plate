/**
 * NUTRIQ - Zen AI Voice & Multimodal Assistant Service (Stage 8.6)
 * Handles natural speech/text food logging with auto-detection of time,
 * smart meal slot routing, and deterministic macro updates.
 */

import { MealType, Macros } from '../types/nutrition';
import { COMMON_FOODS } from '../data/foodDatabase';
import { parseSmartDish } from './recipeParser';
import { isMeatOrFishCookLossCandidate } from './videoAiService';
import { useNutritionStore } from '../store/nutritionStore';

export interface AiParsedMealResult {
  dishName: string;
  mealType: MealType;
  timestamp: string;
  weightGrams: number;
  macros: Macros;
  recipeDetails?: string;
  confidence: number;
  source: 'gemini_flash' | 'local_nlp';
  isCookLoss?: boolean;
  rawWeightGrams?: number;
  cookedWeightGrams?: number;
  items?: Array<{
    name: string;
    weightGrams: number;
    macros: Macros;
  }>;
}

export interface MealSlotAndTimeResolution {
  timestamp: string;
  mealType: MealType;
  explicitTimeFound: boolean;
  explicitSlotFound: boolean;
  cleanInput: string;
}

/**
 * 1. Детерміноване визначення слоту прийому їжі за годиною дня
 */
export function getMealTypeByHour(hour: number): MealType {
  if (hour >= 5 && hour < 11) return 'breakfast';   // 05:00 - 10:59
  if (hour >= 11 && hour < 12.5) return 'snack';    // 11:00 - 12:29 (ранковий перекус)
  if (hour >= 12.5 && hour < 16) return 'lunch';    // 12:30 - 15:59
  if (hour >= 16 && hour < 18) return 'snack';      // 16:00 - 17:59 (денний перекус)
  if (hour >= 18 && hour <= 23) return 'dinner';    // 18:00 - 23:59
  return 'snack';                                   // 00:00 - 04:59 (нічний перекус)
}

/**
 * Хелпер для безпечного пошуку слів у багатомовних текстах (UK, ES, EN)
 */
function matchAndStripWord(text: string, pattern: RegExp): { found: boolean; result: string; matchText?: string } {
  const match = text.match(pattern);
  if (match) {
    const cleaned = text.replace(pattern, ' ').replace(/\s+/g, ' ').trim();
    return { found: true, result: cleaned, matchText: match[0] };
  }
  return { found: false, result: text };
}

/**
 * 2. Витягування точного часу або прийому їжі з тексту
 */
export function resolveMealTimeAndSlot(
  input: string,
  referenceDate: Date = new Date()
): MealSlotAndTimeResolution {
  let clean = (input || '').trim();
  let explicitTimeFound = false;
  let explicitSlotFound = false;
  let resolvedMealType: MealType | null = null;
  let resolvedTimestamp: string | null = null;

  // А. Пошук явного часу: "о 10:00", "в 14:30", "a las 11:15", "at 09:00", "10:00"
  const timePatterns = [
    /(?:^|[^a-zа-яіїєґ0-9])(?:о|в|at|a las)\s*([0-2]?\d)[:.]([0-5]\d)(?=[^a-zа-яіїєґ0-9]|$)/i,
    /(?:^|[^a-zа-яіїєґ0-9])([0-2]?\d)[:.]([0-5]\d)(?=[^a-zа-яіїєґ0-9]|$)/i,
    /(?:^|[^a-zа-яіїєґ0-9])(?:о|в|at|a las)\s*([0-2]?\d)\s*(?:годин[іиа]?|год|h|ранку|вечора|am|pm)?(?=[^a-zа-яіїєґ0-9]|$)/i
  ];

  for (const re of timePatterns) {
    const match = clean.match(re);
    if (match) {
      explicitTimeFound = true;
      let hours = parseInt(match[1], 10);
      let minutes = match[2] ? parseInt(match[2], 10) : 0;

      if (/вечора|дня|pm/i.test(match[0]) && hours < 12) {
        hours += 12;
      }

      const hStr = String(hours).padStart(2, '0');
      const mStr = String(minutes).padStart(2, '0');
      resolvedTimestamp = `${hStr}:${mStr}`;

      clean = clean.replace(match[0], ' ').replace(/\s+/g, ' ').trim();

      if (!resolvedMealType) {
        resolvedMealType = getMealTypeByHour(hours + minutes / 60);
      }
      break;
    }
  }

  // Б. Пошук явного прийому їжі
  const slotChecks: Array<{ type: MealType; regex: RegExp }> = [
    { type: 'breakfast', regex: /(?:^|[^a-zа-яіїєґ0-9])(?:на\s+)?(сніданок|сніданку|завтрак|breakfast|desayuno)(?=[^a-zа-яіїєґ0-9]|$)/i },
    { type: 'lunch', regex: /(?:^|[^a-zа-яіїєґ0-9])(?:на\s+)?(обід|обіду|обед|lunch|almuerzo|comida)(?=[^a-zа-яіїєґ0-9]|$)/i },
    { type: 'dinner', regex: /(?:^|[^a-zа-яіїєґ0-9])(?:на\s+)?(вечеря|вечерю|ужин|dinner|cena)(?=[^a-zа-яіїєґ0-9]|$)/i },
    { type: 'snack', regex: /(?:^|[^a-zа-яіїєґ0-9])(?:на\s+)?(перекус|перекусу|ланч|snack|merienda)(?=[^a-zа-яіїєґ0-9]|$)/i }
  ];

  for (const check of slotChecks) {
    const res = matchAndStripWord(clean, check.regex);
    if (res.found) {
      resolvedMealType = check.type;
      explicitSlotFound = true;
      clean = res.result;
      break;
    }
  }

  // В. Якщо час не вказано — беремо поточний час із referenceDate
  if (!resolvedTimestamp) {
    const h = referenceDate.getHours();
    const m = referenceDate.getMinutes();
    resolvedTimestamp = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
  }

  // Г. Якщо слот не вказано — визначаємо за знайденим/поточним часом
  if (!resolvedMealType) {
    const [h, m] = resolvedTimestamp.split(':').map(Number);
    resolvedMealType = getMealTypeByHour(h + (m || 0) / 60);
  }

  // Д. Очищення розмовних дієслів: "я з'їв", "з'їла", "випив", "ate", "comí", тощо
  const noisePatterns = [
    /(?:^|[^a-zа-яіїєґ0-9])(?:я\s+)?(?:з'їв|з'їла|зїв|зіла|зʼїв|зʼїла|з`їв|з`їла|ate|ate today|comí|he comido)(?=[^a-zа-яіїєґ0-9]|$)/gi,
    /(?:^|[^a-zа-яіїєґ0-9])(?:я\s+)?(?:випив|випила|пив|пила|drank|bebí|he bebido)(?=[^a-zа-яіїєґ0-9]|$)/gi,
    /(?:^|[^a-zа-яіїєґ0-9])(?:сьогодні|сегодня|today|hoy)(?=[^a-zа-яіїєґ0-9]|$)/gi
  ];

  for (const np of noisePatterns) {
    clean = clean.replace(np, ' ');
  }

  clean = clean.replace(/^[:,\s-]+|[:,\s-]+$/g, '').trim();

  return {
    timestamp: resolvedTimestamp,
    mealType: resolvedMealType,
    explicitTimeFound,
    explicitSlotFound,
    cleanInput: clean || input.trim()
  };
}

/**
 * 3. Локальний детермінований розбір страви (0 мс)
 */
export function parseLocalMealInput(
  rawInput: string,
  referenceDate: Date = new Date()
): AiParsedMealResult {
  const { timestamp, mealType, cleanInput } = resolveMealTimeAndSlot(rawInput, referenceDate);
  const lower = cleanInput.toLowerCase().trim();

  // А. Швидкий шлях: яблуко (apple / manzana)
  if (
    lower === 'яблуко' ||
    lower === 'яблука' ||
    lower === 'яблучко' ||
    lower.includes('яблук') ||
    lower.includes('apple') ||
    lower.includes('manzana')
  ) {
    const apple = COMMON_FOODS.find(f => f.id === 'apple') || {
      id: 'apple',
      name: 'Яблуко свіже',
      per100g: { calories: 52, protein: 0.3, fat: 0.2, carbs: 13.8 }
    };
    const weight = 160; // середнє яблуко 160 г
    const calories = Math.round((apple.per100g.calories * weight) / 100);
    const protein = Math.round((apple.per100g.protein * weight) / 10) / 10;
    const fat = Math.round((apple.per100g.fat * weight) / 10) / 10;
    const carbs = Math.round((apple.per100g.carbs * weight) / 10) / 10;

    return {
      dishName: 'Яблуко свіже',
      mealType,
      timestamp,
      weightGrams: weight,
      macros: { calories, protein, fat, carbs },
      recipeDetails: '1 середнє свіже яблуко (160г)',
      confidence: 1.0,
      source: 'local_nlp',
      items: [
        {
          name: 'Яблуко свіже',
          weightGrams: weight,
          macros: { calories, protein, fat, carbs }
        }
      ]
    };
  }

  // Б. Обробка складених страв (наприклад, "кава лате і круасан")
  const delimiters = /\s+(?:і|та|and|y|\+)\s+|,\s*/i;
  const parts = cleanInput.split(delimiters).filter(p => p.trim().length > 0);

  if (parts.length > 1) {
    let totalWeight = 0;
    const totalMacros: Macros = { calories: 0, protein: 0, fat: 0, carbs: 0 };
    const itemsList: Array<{ name: string; weightGrams: number; macros: Macros }> = [];
    const details: string[] = [];

    for (const part of parts) {
      const parsedItem = parseSmartDish(part.trim());
      const itemWeight = parsedItem.totalWeightGrams || 150;
      const itemMacros = parsedItem.totalMacros || { calories: 150, protein: 5, fat: 5, carbs: 20 };

      totalWeight += itemWeight;
      totalMacros.calories += itemMacros.calories;
      totalMacros.protein += itemMacros.protein;
      totalMacros.fat += itemMacros.fat;
      totalMacros.carbs += itemMacros.carbs;

      itemsList.push({
        name: parsedItem.title,
        weightGrams: itemWeight,
        macros: itemMacros
      });
      details.push(`${parsedItem.title} (${itemWeight}г)`);
    }

    const isMeat = isMeatOrFishCookLossCandidate(cleanInput);

    return {
      dishName: cleanInput.charAt(0).toUpperCase() + cleanInput.slice(1),
      mealType,
      timestamp,
      weightGrams: Math.round(totalWeight),
      macros: {
        calories: Math.round(totalMacros.calories),
        protein: Math.round(totalMacros.protein * 10) / 10,
        fat: Math.round(totalMacros.fat * 10) / 10,
        carbs: Math.round(totalMacros.carbs * 10) / 10
      },
      recipeDetails: details.join(', '),
      confidence: 0.95,
      source: 'local_nlp',
      isCookLoss: isMeat,
      items: itemsList
    };
  }

  // В. Одиночна страва через parseSmartDish
  const singleParsed = parseSmartDish(cleanInput);
  const dishWeight = singleParsed.totalWeightGrams || 200;
  const dishMacros = singleParsed.totalMacros || { calories: 200, protein: 10, fat: 5, carbs: 25 };
  const detailsStr = singleParsed.ingredients?.length
    ? singleParsed.ingredients.map(i => `${i.name} (${i.amountGrams}г)`).join(', ')
    : cleanInput;

  return {
    dishName: singleParsed.title || cleanInput,
    mealType,
    timestamp,
    weightGrams: dishWeight,
    macros: dishMacros,
    recipeDetails: detailsStr,
    confidence: 0.92,
    source: 'local_nlp',
    isCookLoss: isMeatOrFishCookLossCandidate(cleanInput),
    items: [
      {
        name: singleParsed.title || cleanInput,
        weightGrams: dishWeight,
        macros: dishMacros
      }
    ]
  };
}

/**
 * 4. Інтеграція з Google Gemini API (із прозорим фолбеком на локальний розрахунок)
 */
export async function parseMealWithAiOrLocal(
  rawInput: string,
  options?: {
    imageBase64?: string;
    apiKey?: string;
    referenceDate?: Date;
    fetchImpl?: typeof fetch;
  }
): Promise<AiParsedMealResult> {
  const refDate = options?.referenceDate || new Date();
  const apiKey = options?.apiKey || (typeof import.meta !== 'undefined' && import.meta.env?.VITE_GEMINI_API_KEY) || '';
  const fetchFn = options?.fetchImpl || fetch;

  // Якщо немає API-ключа і немає фото — миттєвий локальний розрахунок (0 мс)
  if (!apiKey && !options?.imageBase64) {
    return parseLocalMealInput(rawInput, refDate);
  }

  try {
    const resolution = resolveMealTimeAndSlot(rawInput, refDate);
    const parts: any[] = [];

    if (options?.imageBase64) {
      const mimeType = options.imageBase64.startsWith('data:image/png') ? 'image/png' : 'image/jpeg';
      const base64Data = options.imageBase64.replace(/^data:image\/\w+;base64,/, '');
      parts.push({
        inlineData: {
          mimeType,
          data: base64Data
        }
      });
    }

    parts.push({
      text: `Користувач з'їв: "${rawInput}". Час: ${resolution.timestamp}. Визнач назву страви, вагу та КБЖВ у форматі JSON без markdown.`
    });

    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
    const res = await fetchFn(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ role: 'user', parts }],
        generationConfig: {
          temperature: 0.1,
          responseMimeType: 'application/json'
        }
      })
    });

    if (!res.ok) {
      return parseLocalMealInput(rawInput, refDate);
    }

    const data = await res.json();
    const rawJsonText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (rawJsonText) {
      const parsed = JSON.parse(rawJsonText);
      return {
        dishName: parsed.dishName || resolution.cleanInput,
        mealType: resolution.mealType,
        timestamp: resolution.timestamp,
        weightGrams: parsed.weightGrams || 150,
        macros: {
          calories: Math.round(parsed.calories || 0),
          protein: Math.round((parsed.protein || 0) * 10) / 10,
          fat: Math.round((parsed.fat || 0) * 10) / 10,
          carbs: Math.round((parsed.carbs || 0) * 10) / 10
        },
        recipeDetails: parsed.recipeDetails || rawInput,
        confidence: 0.98,
        source: 'gemini_flash',
        isCookLoss: parsed.isCookLoss || isMeatOrFishCookLossCandidate(parsed.dishName || rawInput),
        items: [
          {
            name: parsed.dishName || resolution.cleanInput,
            weightGrams: parsed.weightGrams || 150,
            macros: {
              calories: Math.round(parsed.calories || 0),
              protein: Math.round((parsed.protein || 0) * 10) / 10,
              fat: Math.round((parsed.fat || 0) * 10) / 10,
              carbs: Math.round((parsed.carbs || 0) * 10) / 10
            }
          }
        ]
      };
    }
  } catch (err) {
    // Тихо перемикаємось на локальний розрахунок
  }

  return parseLocalMealInput(rawInput, refDate);
}

/**
 * 5. Миттєве збереження страви в Щоденник
 */
export function executeAutoMealLog(parsed: AiParsedMealResult): {
  entryId: string;
  mealType: MealType;
  timestamp: string;
  caloriesAdded: number;
  remainingCalories: number;
  targetCalories: number;
  consumedCalories: number;
} {
  const store = useNutritionStore.getState();
  const entryId = `ai-voice-${Date.now()}`;

  store.addFoodToMeal(parsed.mealType, {
    foodId: `food-${Date.now()}`,
    name: parsed.dishName,
    weightGrams: parsed.weightGrams,
    macros: parsed.macros,
    timestamp: parsed.timestamp,
    eaten: true,
    recipeDetails: parsed.recipeDetails,
    isCookLoss: parsed.isCookLoss,
    rawWeightGrams: parsed.rawWeightGrams,
    cookedWeightGrams: parsed.cookedWeightGrams
  });

  const updatedLog = useNutritionStore.getState().dailyLog;
  const targetCalories = updatedLog.targets.calories;
  const consumedCalories = updatedLog.totals.calories;
  const remainingCalories = Math.max(0, targetCalories - consumedCalories);

  return {
    entryId,
    mealType: parsed.mealType,
    timestamp: parsed.timestamp,
    caloriesAdded: parsed.macros.calories,
    remainingCalories,
    targetCalories,
    consumedCalories
  };
}
