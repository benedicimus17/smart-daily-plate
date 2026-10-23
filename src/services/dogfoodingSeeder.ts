/**
 * NUTRIQ - 7-Day Personal Dogfooding Mode & Seeder (Stage 5.5)
 * Generates realistic 7-day nutritional logs, water tracking, Cook-Loss meals,
 * and deterministic Weekly Flex Bank calibration for offline stress-testing and dogfooding.
 */

import { DailyLog, MealType, MealEntry } from '../types/nutrition';
import { WeeklyFlexBank, DayBankStatus } from '../types/weeklyFlex';

export interface DogfoodingSeedResult {
  historyLogs: Record<string, DailyLog>;
  weeklyBank: WeeklyFlexBank;
  dates: string[];
}

export function getMondayOfWeek(d: Date = new Date()): Date {
  const date = new Date(d);
  const day = date.getDay();
  // В JS Sunday = 0, Monday = 1
  const diff = date.getDate() - day + (day === 0 ? -6 : 1);
  date.setDate(diff);
  date.setHours(0, 0, 0, 0);
  return date;
}

export function formatDateStr(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

const DAY_NAMES = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Нд'];

export function generateSevenDayDogfoodingData(targets = { calories: 2150, protein: 145, fat: 65, carbs: 240 }): DogfoodingSeedResult {
  const monday = getMondayOfWeek();
  const dates: string[] = [];
  const historyLogs: Record<string, DailyLog> = {};
  const flexDays: DayBankStatus[] = [];

  const todayStr = formatDateStr(new Date());

  // 7-денний реалістичний раціон для Dogfooding
  const weekTemplates: Array<{
    breakfast: MealEntry;
    lunch: MealEntry;
    snack: MealEntry;
    dinner: MealEntry;
    waterMl: number;
    allEaten: boolean;
  }> = [
    // ПонЕДІЛОК: Дисциплінований старт
    {
      breakfast: {
        id: 'df-mon-b',
        foodId: 'omelet_avocado',
        name: 'Омлет з авокадо та шпинатом',
        weightGrams: 180,
        macros: { calories: 380, protein: 28, fat: 24, carbs: 12 },
        timestamp: '08:30',
        eaten: true,
        recipeDetails: '3 яйця, 45г авокадо, свіжий шпинат'
      },
      lunch: {
        id: 'df-mon-l',
        foodId: 'chicken_quinoa',
        name: 'Куряче філе запечене з кіноа',
        weightGrams: 220,
        macros: { calories: 480, protein: 44, fat: 12, carbs: 48 },
        timestamp: '13:00',
        eaten: true,
        isCookLoss: true,
        rawWeightGrams: 220,
        cookedWeightGrams: 165
      },
      snack: {
        id: 'df-mon-s',
        foodId: 'greek_yogurt_berries',
        name: 'Грецький йогурт з лохиною',
        weightGrams: 150,
        macros: { calories: 190, protein: 15, fat: 4, carbs: 22 },
        timestamp: '16:30',
        eaten: true
      },
      dinner: {
        id: 'df-mon-d',
        foodId: 'steak_greens',
        name: 'Gourmet Стейк Рибай зі спаржею',
        weightGrams: 260,
        macros: { calories: 510, protein: 46, fat: 24, carbs: 8 },
        timestamp: '19:30',
        eaten: true,
        isCookLoss: true,
        rawWeightGrams: 350,
        cookedWeightGrams: 260
      },
      waterMl: 2200,
      allEaten: true
    },
    // ВІВТОРОК: Високобілковий день
    {
      breakfast: {
        id: 'df-tue-b',
        foodId: 'protein_pancakes',
        name: 'Вівсяно-протеїнові панкейки з ягодами',
        weightGrams: 220,
        macros: { calories: 340, protein: 32, fat: 6, carbs: 42 },
        timestamp: '08:30',
        eaten: true
      },
      lunch: {
        id: 'df-tue-l',
        foodId: 'salmon_bowl',
        name: 'Боул із запеченим лососем та диким рисом',
        weightGrams: 260,
        macros: { calories: 520, protein: 40, fat: 22, carbs: 42 },
        timestamp: '13:00',
        eaten: true
      },
      snack: {
        id: 'df-tue-s',
        foodId: 'mercadona_protein',
        name: 'Йогурт +Proteínas Hacendado (Mercadona)',
        weightGrams: 150,
        macros: { calories: 104, protein: 15, fat: 0.1, carbs: 10.5 },
        timestamp: '16:00',
        eaten: true
      },
      dinner: {
        id: 'df-tue-d',
        foodId: 'beef_salad',
        name: 'Теплий салат з телячою вирізкою гриль',
        weightGrams: 240,
        macros: { calories: 420, protein: 42, fat: 16, carbs: 18 },
        timestamp: '19:30',
        eaten: true
      },
      waterMl: 2400,
      allEaten: true
    },
    // СЕРЕДА: Свіжа риба та клітковина
    {
      breakfast: {
        id: 'df-wed-b',
        foodId: 'ricotta_syrnyky',
        name: 'Сирники з рікоти та ванілі',
        weightGrams: 200,
        macros: { calories: 310, protein: 26, fat: 11, carbs: 24 },
        timestamp: '08:30',
        eaten: true
      },
      lunch: {
        id: 'df-wed-l',
        foodId: 'turkey_buckwheat',
        name: 'Індичка су-від з гречаною кашею',
        weightGrams: 280,
        macros: { calories: 490, protein: 46, fat: 10, carbs: 54 },
        timestamp: '13:00',
        eaten: true
      },
      snack: {
        id: 'df-wed-s',
        foodId: 'almonds_mix',
        name: 'Смажений мигдаль та кеш’ю',
        weightGrams: 35,
        macros: { calories: 210, protein: 7, fat: 18, carbs: 6 },
        timestamp: '16:30',
        eaten: true
      },
      dinner: {
        id: 'df-wed-d',
        foodId: 'dorado_greens',
        name: 'Дорадо на грилі з броколі та лимоном',
        weightGrams: 270,
        macros: { calories: 390, protein: 42, fat: 14, carbs: 6 },
        timestamp: '19:30',
        eaten: true
      },
      waterMl: 2100,
      allEaten: true
    },
    // ЧЕТВЕР: Збалансований день
    {
      breakfast: {
        id: 'df-thu-b',
        foodId: 'avocado_poached',
        name: 'Цільнозерновий тост з яйцем пашот',
        weightGrams: 190,
        macros: { calories: 360, protein: 22, fat: 18, carbs: 26 },
        timestamp: '08:30',
        eaten: true
      },
      lunch: {
        id: 'df-thu-l',
        foodId: 'pasta_shrimp',
        name: 'Паста з тигровими креветками у соусі',
        weightGrams: 280,
        macros: { calories: 490, protein: 38, fat: 11, carbs: 58 },
        timestamp: '13:15',
        eaten: true
      },
      snack: {
        id: 'df-thu-s',
        foodId: 'apple_shake',
        name: 'Зелене яблуко та ізолят сироваткового білка',
        weightGrams: 200,
        macros: { calories: 175, protein: 24, fat: 1.5, carbs: 16 },
        timestamp: '16:30',
        eaten: true
      },
      dinner: {
        id: 'df-thu-d',
        foodId: 'chicken_salad',
        name: 'Куряче філе з хрустким міксом овочів',
        weightGrams: 250,
        macros: { calories: 380, protein: 45, fat: 12, carbs: 14 },
        timestamp: '19:30',
        eaten: true
      },
      waterMl: 2300,
      allEaten: true
    },
    // П'ЯТНИЦЯ: Вечеря в ресторані (Social Dining)
    {
      breakfast: {
        id: 'df-fri-b',
        foodId: 'scrambled_eggs',
        name: 'Скрамбл з 3 яєць з томатами чері',
        weightGrams: 200,
        macros: { calories: 330, protein: 25, fat: 22, carbs: 8 },
        timestamp: '08:30',
        eaten: true
      },
      lunch: {
        id: 'df-fri-l',
        foodId: 'mercadona_chicken_salad',
        name: 'Pechuga de Pollo Hacendado з овочами',
        weightGrams: 250,
        macros: { calories: 430, protein: 48, fat: 11, carbs: 24 },
        timestamp: '13:00',
        eaten: true
      },
      snack: {
        id: 'df-fri-s',
        foodId: 'protein_bar',
        name: 'Протеїновий снек-батончик (шоколад-арахіс)',
        weightGrams: 60,
        macros: { calories: 228, protein: 12, fat: 7.2, carbs: 28.8 },
        timestamp: '16:00',
        eaten: true
      },
      dinner: {
        id: 'df-fri-d',
        foodId: 'big_mac_dining',
        name: 'Бургер Біг Мак із соковитою телятиною (cheat meal)',
        weightGrams: 210,
        macros: { calories: 540, protein: 25.2, fat: 29.4, carbs: 44.1 },
        timestamp: '20:00',
        eaten: true
      },
      waterMl: 2500,
      allEaten: true
    },
    // СУБОТА: Іспанські вихідні (Mercadona & Тортилья)
    {
      breakfast: {
        id: 'df-sat-b',
        foodId: 'croissant_paris',
        name: 'Французький вершковий круасан та еспресо',
        weightGrams: 80,
        macros: { calories: 325, protein: 6.5, fat: 16.8, carbs: 36 },
        timestamp: '09:30',
        eaten: true
      },
      lunch: {
        id: 'df-sat-l',
        foodId: 'tortilla_patatas',
        name: 'Іспанська тортилья де пататас (Tortilla)',
        weightGrams: 220,
        macros: { calories: 341, protein: 12.1, fat: 21.5, carbs: 24.6 },
        timestamp: '14:00',
        eaten: true
      },
      snack: {
        id: 'df-sat-s',
        foodId: 'hacendado_queso',
        name: 'Queso Fresco Batido 0% з ягодами',
        weightGrams: 200,
        macros: { calories: 120, protein: 16, fat: 0.2, carbs: 12 },
        timestamp: '17:00',
        eaten: true
      },
      dinner: {
        id: 'df-sat-d',
        foodId: 'salmon_steak',
        name: 'Стейк дикого лосося на пару зі спаржею',
        weightGrams: 240,
        macros: { calories: 460, protein: 42, fat: 22, carbs: 6 },
        timestamp: '19:45',
        eaten: false // Заплановано
      },
      waterMl: 2000,
      allEaten: false
    },
    // НЕДІЛЯ: Легкий баланс
    {
      breakfast: {
        id: 'df-sun-b',
        foodId: 'avena_mercadona',
        name: 'Copos de Avena Hacendado з мигдалевим молоком',
        weightGrams: 220,
        macros: { calories: 310, protein: 14, fat: 8, carbs: 45 },
        timestamp: '09:30',
        eaten: false
      },
      lunch: {
        id: 'df-sun-l',
        foodId: 'pasta_fagioli',
        name: 'Паста е фаджолі по-римськи (Pasta e fagioli)',
        weightGrams: 280,
        macros: { calories: 350, protein: 17.4, fat: 7.8, carbs: 51.8 },
        timestamp: '13:30',
        eaten: false
      },
      snack: {
        id: 'df-sun-s',
        foodId: 'yagotynsky_berries',
        name: 'Сир кисломолочний Яготинський 5% з медом',
        weightGrams: 180,
        macros: { calories: 230, protein: 26, fat: 9, carbs: 12 },
        timestamp: '16:30',
        eaten: false
      },
      dinner: {
        id: 'df-sun-d',
        foodId: 'baked_chicken_salad',
        name: 'Куряча грудка на грилі з грецьким салатом',
        weightGrams: 260,
        macros: { calories: 410, protein: 46, fat: 16, carbs: 12 },
        timestamp: '19:30',
        eaten: false
      },
      waterMl: 1800,
      allEaten: false
    }
  ];

  let weeklyConsumedCalories = 0;
  const weeklyTargetCalories = targets.calories * 7;

  for (let i = 0; i < 7; i++) {
    const curDate = new Date(monday);
    curDate.setDate(monday.getDate() + i);
    const dateStr = formatDateStr(curDate);
    dates.push(dateStr);

    const tpl = weekTemplates[i];
    const meals = {
      breakfast: {
        type: 'breakfast' as MealType,
        title: 'Сніданок',
        icon: 'SunMedium',
        entries: [tpl.breakfast],
        totalMacros: tpl.breakfast.eaten !== false ? tpl.breakfast.macros : { calories: 0, protein: 0, fat: 0, carbs: 0 }
      },
      lunch: {
        type: 'lunch' as MealType,
        title: 'Обід',
        icon: 'Flame',
        entries: [tpl.lunch],
        totalMacros: tpl.lunch.eaten !== false ? tpl.lunch.macros : { calories: 0, protein: 0, fat: 0, carbs: 0 }
      },
      snack: {
        type: 'snack' as MealType,
        title: 'Перекус',
        icon: 'Apple',
        entries: [tpl.snack],
        totalMacros: tpl.snack.eaten !== false ? tpl.snack.macros : { calories: 0, protein: 0, fat: 0, carbs: 0 }
      },
      dinner: {
        type: 'dinner' as MealType,
        title: 'Вечеря',
        icon: 'Moon',
        entries: [tpl.dinner],
        totalMacros: tpl.dinner.eaten !== false ? tpl.dinner.macros : { calories: 0, protein: 0, fat: 0, carbs: 0 }
      }
    };

    const dayConsumed = (meals.breakfast.totalMacros.calories) +
                         (meals.lunch.totalMacros.calories) +
                         (meals.snack.totalMacros.calories) +
                         (meals.dinner.totalMacros.calories);

    weeklyConsumedCalories += dayConsumed;

    const dailyLog: DailyLog = {
      date: dateStr,
      targets,
      meals,
      totals: {
        calories: dayConsumed,
        protein: meals.breakfast.totalMacros.protein + meals.lunch.totalMacros.protein + meals.snack.totalMacros.protein + meals.dinner.totalMacros.protein,
        fat: meals.breakfast.totalMacros.fat + meals.lunch.totalMacros.fat + meals.snack.totalMacros.fat + meals.dinner.totalMacros.fat,
        carbs: meals.breakfast.totalMacros.carbs + meals.lunch.totalMacros.carbs + meals.snack.totalMacros.carbs + meals.dinner.totalMacros.carbs
      },
      waterMl: tpl.waterMl
    };

    historyLogs[dateStr] = dailyLog;

    flexDays.push({
      date: dateStr,
      dayName: DAY_NAMES[i],
      targetCalories: targets.calories,
      consumedCalories: dayConsumed,
      balanceCalories: targets.calories - dayConsumed,
      isCompleted: tpl.allEaten,
      isToday: dateStr === todayStr
    });
  }

  const weeklyBalanceCalories = Math.max(0, weeklyTargetCalories - weeklyConsumedCalories);
  const remainingDays = flexDays.filter(d => !d.isCompleted).length || 1;
  const adjustedDailyBudget = Math.round((targets.calories * remainingDays + Math.min(350, weeklyBalanceCalories)) / remainingDays);

  const weeklyBank: WeeklyFlexBank = {
    weekStartDate: dates[0],
    weekEndDate: dates[6],
    weeklyTargetCalories,
    weeklyConsumedCalories,
    weeklyBalanceCalories,
    adjustedDailyBudgetForRemainingDays: adjustedDailyBudget,
    bankHealthStatus: weeklyBalanceCalories >= 0 ? 'safe' : 'deficit',
    days: flexDays
  };

  return {
    historyLogs,
    weeklyBank,
    dates
  };
}
