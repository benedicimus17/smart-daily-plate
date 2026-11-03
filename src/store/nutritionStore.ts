import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { DailyLog, Macros, MealType, MealEntry } from '../types/nutrition';
import { WeeklyFlexBank, DayBankStatus } from '../types/weeklyFlex';
import { calculateWeeklyFlexBank } from '../math/weeklyFlex';
import { ParsedRecipe } from '../types/recipe';
import { CookLossDish } from '../types/cookLoss';
import { generateDailyMealsForTargets } from '../services/menuGenerator';
import { generateSevenDayDogfoodingData } from '../services/dogfoodingSeeder';
import { UserDietaryRestrictions } from '../services/allergenService';

export interface NutritionState {
  currentDate: string;
  selectedDate: string;
  dailyLog: DailyLog;
  historyLogs: Record<string, DailyLog>;
  weeklyBank: WeeklyFlexBank;
  savedRecipes: ParsedRecipe[];
  savedCookLossDishes: CookLossDish[];
  
  // Дії щоденника
  setSelectedDate: (date: string) => void;
  addFoodToMeal: (mealType: MealType, entry: Omit<MealEntry, 'id' | 'timestamp'> & { timestamp?: string }) => void;
  removeFoodFromMeal: (mealType: MealType, entryId: string) => void;
  updateMealEntry: (mealType: MealType, entryId: string, updates: Partial<MealEntry>) => void;
  moveMealEntry: (fromMealType: MealType, toMealType: MealType, entryId: string, newTimestamp?: string) => void;
  toggleMealEaten: (mealType: MealType, entryId: string) => void;
  updateTargets: (targets: Partial<DailyLog['targets']>) => void;
  generateMenuForTargets: (
    targets: DailyLog['targets'],
    eatingRhythm?: '3_meals' | '5_meals',
    options?: { markPastAsEaten?: boolean; userRestrictions?: UserDietaryRestrictions }
  ) => void;
  quickAddCalories: (mealType: MealType, calories: number, note?: string) => void;

  // Дії рецептів
  saveRecipe: (recipe: ParsedRecipe) => void;
  deleteRecipe: (title: string) => void;

  // Дії каструлі (Cook-Loss)
  saveCookLossDish: (dish: CookLossDish) => void;

  // 7-Day Dogfooding Mode & Стійкість (Stage 5.5)
  seedSevenDayDogfoodingData: () => void;
}

const DEFAULT_TARGETS = {
  calories: 2150,
  protein: 145, // грам
  fat: 65,      // грам
  carbs: 240,   // грам
};

export function calculateCategoryTotals(entries: MealEntry[]): Macros {
  const totals: Macros = { calories: 0, protein: 0, fat: 0, carbs: 0 };
  entries.forEach(item => {
    if (item.eaten !== false) {
      totals.calories += item.macros.calories;
      totals.protein += item.macros.protein;
      totals.fat += item.macros.fat;
      totals.carbs += item.macros.carbs;
    }
  });
  return {
    calories: Math.round(totals.calories),
    protein: Math.round(totals.protein * 10) / 10,
    fat: Math.round(totals.fat * 10) / 10,
    carbs: Math.round(totals.carbs * 10) / 10,
  };
}

export function calculateTotals(meals: DailyLog['meals']): Macros {
  const totals: Macros = { calories: 0, protein: 0, fat: 0, carbs: 0 };
  (Object.values(meals) as DailyLog['meals'][MealType][]).forEach(category => {
    totals.calories += category.totalMacros.calories;
    totals.protein += category.totalMacros.protein;
    totals.fat += category.totalMacros.fat;
    totals.carbs += category.totalMacros.carbs;
  });
  return {
    calories: Math.round(totals.calories),
    protein: Math.round(totals.protein * 10) / 10,
    fat: Math.round(totals.fat * 10) / 10,
    carbs: Math.round(totals.carbs * 10) / 10,
  };
}

function createEmptyMeals(): DailyLog['meals'] {
  return {
    breakfast: { type: 'breakfast', title: 'Сніданок', icon: 'SunMedium', entries: [], totalMacros: { calories: 0, protein: 0, fat: 0, carbs: 0 } },
    lunch: { type: 'lunch', title: 'Обід', icon: 'Flame', entries: [], totalMacros: { calories: 0, protein: 0, fat: 0, carbs: 0 } },
    dinner: { type: 'dinner', title: 'Вечеря', icon: 'Moon', entries: [], totalMacros: { calories: 0, protein: 0, fat: 0, carbs: 0 } },
    snack: { type: 'snack', title: 'Перекус', icon: 'Apple', entries: [], totalMacros: { calories: 0, protein: 0, fat: 0, carbs: 0 } },
  };
}

// Початкові прийоми їжі (відповідають макету Layout 2: 700 ккал залишок, 140г білка, 65г жиру, 220г вуглеводів)
const todayMeals: DailyLog['meals'] = {
  breakfast: {
    type: 'breakfast',
    title: 'Сніданок',
    icon: 'SunMedium',
    entries: [
      {
        id: 'b-1',
        foodId: 'omelet_avocado',
        name: 'Омлет з авокадо та шпинатом',
        weightGrams: 180,
        macros: { calories: 380, protein: 28, fat: 24, carbs: 12 },
        timestamp: '08:30',
        eaten: true,
        recipeDetails: 'Курячі яйця 3 шт, авокадо хасс 60г, шпинат свіжий 50г, оливкова олія 5г'
      }
    ],
    totalMacros: { calories: 380, protein: 28, fat: 24, carbs: 12 }
  },
  lunch: {
    type: 'lunch',
    title: 'Обід',
    icon: 'Flame',
    entries: [
      {
        id: 'l-1',
        foodId: 'chicken_quinoa',
        name: 'Куряче філе запечене з кіноа',
        weightGrams: 220,
        macros: { calories: 480, protein: 44, fat: 12, carbs: 48 },
        timestamp: '13:00',
        eaten: true,
        isCookLoss: true,
        rawWeightGrams: 220,
        cookedWeightGrams: 165,
        recipeDetails: 'Філе курки 220г ➔ 165г (-25%), кіноа відварене 150г, броколі на пару'
      }
    ],
    totalMacros: { calories: 480, protein: 44, fat: 12, carbs: 48 }
  },
  snack: {
    type: 'snack',
    title: 'Перекус',
    icon: 'Apple',
    entries: [
      {
        id: 's-1',
        foodId: 'greek_yogurt_berries',
        name: 'Грецький йогурт 2% з лісовими ягодами',
        weightGrams: 150,
        macros: { calories: 190, protein: 15, fat: 4, carbs: 22 },
        timestamp: '16:30',
        eaten: true,
        recipeDetails: 'Грецький йогурт 2% 150г, лісові ягоди (чорниця, малина) 60г'
      }
    ],
    totalMacros: { calories: 190, protein: 15, fat: 4, carbs: 22 }
  },
  dinner: {
    type: 'dinner',
    title: 'Вечеря',
    icon: 'Moon',
    entries: [
      {
        id: 'd-1',
        foodId: 'steak_greens',
        name: 'Gourmet Steak & Greens (Рибай зі спаржею)',
        weightGrams: 260,
        macros: { calories: 510, protein: 46, fat: 24, carbs: 8 },
        timestamp: '19:30',
        eaten: false, // Заплановано
        isCookLoss: true,
        rawWeightGrams: 350,
        cookedWeightGrams: 260,
        recipeDetails: 'Стейк яловичий 350г ➔ 260г (-26% Cook-Loss), спаржа свіжа 140г'
      }
    ],
    totalMacros: { calories: 0, protein: 0, fat: 0, carbs: 0 }
  }
};

// Прийоми їжі для вчора (18.10.2026) - щоб користувач міг перевірити вчорашній раціон
const yesterdayMeals: DailyLog['meals'] = {
  breakfast: {
    type: 'breakfast',
    title: 'Сніданок',
    icon: 'SunMedium',
    entries: [
      {
        id: 'yb-1',
        foodId: 'eggs_spinach',
        name: 'Омлет із шпинатом, томатами та тостом',
        weightGrams: 290,
        macros: { calories: 420, protein: 26, fat: 24, carbs: 22 },
        timestamp: '09:00',
        eaten: true,
        recipeDetails: 'Яйця курячі 3 шт, шпинат свіжий 50г, томати чері 80г, тост житній'
      }
    ],
    totalMacros: { calories: 420, protein: 26, fat: 24, carbs: 22 }
  },
  lunch: {
    type: 'lunch',
    title: 'Обід',
    icon: 'Flame',
    entries: [
      {
        id: 'yl-1',
        foodId: 'chicken_buckwheat',
        name: 'Куряче філе су-від з гречкою та броколі',
        weightGrams: 360,
        macros: { calories: 570, protein: 48, fat: 12, carbs: 64 },
        timestamp: '13:30',
        eaten: true,
        isCookLoss: true,
        rawWeightGrams: 300,
        cookedWeightGrams: 215,
        recipeDetails: 'Філе курки 300г ➔ 215г (-28%), відварна гречка 150г, броколі на пару'
      }
    ],
    totalMacros: { calories: 570, protein: 48, fat: 12, carbs: 64 }
  },
  dinner: {
    type: 'dinner',
    title: 'Вечеря',
    icon: 'Moon',
    entries: [
      {
        id: 'yd-1',
        foodId: 'seabass_zucchini',
        name: 'Запечений сібас із цукіні на грилі',
        weightGrams: 320,
        macros: { calories: 480, protein: 42, fat: 22, carbs: 14 },
        timestamp: '19:15',
        eaten: true,
        isCookLoss: true,
        rawWeightGrams: 350,
        cookedWeightGrams: 260,
        recipeDetails: 'Сібас 350г ➔ 260г (-25%), цукіні 160г, оливкова олія extra virgin'
      }
    ],
    totalMacros: { calories: 480, protein: 42, fat: 22, carbs: 14 }
  },
  snack: {
    type: 'snack',
    title: 'Перекус',
    icon: 'Apple',
    entries: [
      {
        id: 'ys-1',
        foodId: 'nuts_mix',
        name: 'Мигдаль, волоський горіх та зелене яблуко',
        weightGrams: 160,
        macros: { calories: 230, protein: 7, fat: 16, carbs: 18 },
        timestamp: '16:00',
        eaten: true
      }
    ],
    totalMacros: { calories: 230, protein: 7, fat: 16, carbs: 18 }
  }
};

// Прийоми їжі для завтра (20.10.2026) - заплановане меню
const tomorrowMeals: DailyLog['meals'] = {
  breakfast: {
    type: 'breakfast',
    title: 'Сніданок',
    icon: 'SunMedium',
    entries: [
      {
        id: 'tb-1',
        foodId: 'syrnyky',
        name: 'Сирники з рикоти з малиновим кюлі',
        weightGrams: 260,
        macros: { calories: 430, protein: 28, fat: 16, carbs: 40 },
        timestamp: '08:30',
        eaten: false,
        recipeDetails: 'Сир кисломолочний 5% 180г, рикота 50г, рисове борошно 20г, малина 60г'
      }
    ],
    totalMacros: { calories: 0, protein: 0, fat: 0, carbs: 0 }
  },
  lunch: {
    type: 'lunch',
    title: 'Обід',
    icon: 'Flame',
    entries: [
      {
        id: 'tl-1',
        foodId: 'turkey_rice',
        name: 'Філе індички з бурим рисом та спаржею',
        weightGrams: 340,
        macros: { calories: 550, protein: 46, fat: 12, carbs: 60 },
        timestamp: '13:00',
        eaten: false,
        isCookLoss: true,
        rawWeightGrams: 280,
        cookedWeightGrams: 200,
        recipeDetails: 'Індичка 280г ➔ 200г (-28%), бурий рис 130г, спаржа 100г'
      }
    ],
    totalMacros: { calories: 0, protein: 0, fat: 0, carbs: 0 }
  },
  dinner: {
    type: 'dinner',
    title: 'Вечеря',
    icon: 'Moon',
    entries: [
      {
        id: 'td-1',
        foodId: 'beef_salad',
        name: 'Теплий салат з яловичиною та кунжутом',
        weightGrams: 310,
        macros: { calories: 460, protein: 38, fat: 24, carbs: 14 },
        timestamp: '19:30',
        eaten: false,
        recipeDetails: 'Яловичина вирізка 180г, мікс салату 100г, заправка кунжутна'
      }
    ],
    totalMacros: { calories: 0, protein: 0, fat: 0, carbs: 0 }
  },
  snack: {
    type: 'snack',
    title: 'Перекус',
    icon: 'Apple',
    entries: [
      {
        id: 'ts-1',
        foodId: 'chia_pudding',
        name: 'Протеїновий пудинг з насінням чіа',
        weightGrams: 200,
        macros: { calories: 190, protein: 20, fat: 6, carbs: 15 },
        timestamp: '16:30',
        eaten: false
      }
    ],
    totalMacros: { calories: 0, protein: 0, fat: 0, carbs: 0 }
  }
};

const getTodayDateStr = () => {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

const getOffsetDateStr = (offsetDays: number) => {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

const dynamicToday = getTodayDateStr();
const dynamicYesterday = getOffsetDateStr(-1);
const dynamicTomorrow = getOffsetDateStr(1);

const defaultHistory: Record<string, DailyLog> = {
  '2026-10-19': {
    date: '2026-10-19',
    targets: { calories: 2150, protein: 180, fat: 80, carbs: 270 },
    meals: yesterdayMeals,
    totals: calculateTotals(yesterdayMeals),
    waterMl: 2100
  },
  '2026-10-20': {
    date: '2026-10-20',
    targets: { calories: 2150, protein: 180, fat: 80, carbs: 270 },
    meals: todayMeals,
    totals: calculateTotals(todayMeals),
    waterMl: 1750
  },
  '2026-10-21': {
    date: '2026-10-21',
    targets: { calories: 2150, protein: 180, fat: 80, carbs: 270 },
    meals: tomorrowMeals,
    totals: calculateTotals(tomorrowMeals),
    waterMl: 0
  },
  [dynamicYesterday]: {
    date: dynamicYesterday,
    targets: { calories: 2150, protein: 180, fat: 80, carbs: 270 },
    meals: yesterdayMeals,
    totals: calculateTotals(yesterdayMeals),
    waterMl: 2100
  },
  [dynamicToday]: {
    date: dynamicToday,
    targets: { calories: 2150, protein: 180, fat: 80, carbs: 270 },
    meals: todayMeals,
    totals: calculateTotals(todayMeals),
    waterMl: 1750
  },
  [dynamicTomorrow]: {
    date: dynamicTomorrow,
    targets: { calories: 2150, protein: 180, fat: 80, carbs: 270 },
    meals: tomorrowMeals,
    totals: calculateTotals(tomorrowMeals),
    waterMl: 0
  }
};

const createLogForDate = (dateStr: string): DailyLog => {
  const emptyMeals = createEmptyMeals();
  return {
    date: dateStr,
    targets: DEFAULT_TARGETS,
    meals: emptyMeals,
    totals: { calories: 0, protein: 0, fat: 0, carbs: 0 },
    waterMl: 0
  };
};

export function buildWeeklyFlexBank(
  currentDateStr: string,
  historyLogs: Record<string, DailyLog>,
  currentDailyLog: DailyLog,
  dailyTargetCalories: number = 2150
): WeeklyFlexBank {
  const parts = currentDateStr.split('-').map(Number);
  const curr = new Date(parts[0], parts[1] - 1, parts[2]);
  const dayOfWeek = curr.getDay();
  const distToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  const monday = new Date(curr);
  monday.setDate(curr.getDate() + distToMonday);

  // Support language-aware day names
  let savedLang = 'uk';
  try {
    const rawLocale = typeof localStorage !== 'undefined' ? localStorage.getItem('nutriq-locale-storage-v1') : null;
    if (rawLocale) {
      const parsed = JSON.parse(rawLocale);
      if (parsed?.state?.lang) savedLang = parsed.state.lang;
    }
  } catch {
    // default uk
  }

  const dayNames = savedLang === 'es'
    ? ['L', 'M', 'X', 'J', 'V', 'S', 'D']
    : savedLang === 'en'
    ? ['M', 'T', 'W', 'T', 'F', 'S', 'S']
    : ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Нд'];
  const weekDays: DayBankStatus[] = [];

  for (let i = 0; i < 7; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const dStr = `${y}-${m}-${day}`;

    let consumed = 0;
    let target = dailyTargetCalories;

    if (dStr === currentDateStr) {
      consumed = currentDailyLog.totals.calories;
      target = currentDailyLog.targets.calories || dailyTargetCalories;
    } else if (historyLogs[dStr]) {
      consumed = historyLogs[dStr].totals.calories;
      target = historyLogs[dStr].targets.calories || dailyTargetCalories;
    }

    const isToday = dStr === currentDateStr;
    const isCompleted = dStr < currentDateStr && consumed > 0;

    weekDays.push({
      date: dStr,
      dayName: dayNames[i],
      targetCalories: target,
      consumedCalories: consumed,
      balanceCalories: target - consumed,
      isCompleted,
      isToday
    });
  }

  const weekStartDate = weekDays[0].date;
  const weekEndDate = weekDays[6].date;

  return calculateWeeklyFlexBank({
    weekStartDate,
    weekEndDate,
    dailyTargetCalories,
    days: weekDays
  });
}

export const useNutritionStore = create<NutritionState>()(
  persist(
    (set, get) => {
      const todayStr = getTodayDateStr();
      const initialLog = defaultHistory[todayStr] || defaultHistory['2026-10-19'] || createLogForDate(todayStr);
      const initialWeeklyBank = buildWeeklyFlexBank(
        todayStr,
        defaultHistory,
        initialLog,
        initialLog.targets.calories || 2150
      );

      return {
        currentDate: todayStr,
        selectedDate: todayStr,
        historyLogs: defaultHistory,
        dailyLog: initialLog,
        weeklyBank: initialWeeklyBank,
        savedRecipes: [],
        savedCookLossDishes: [],

        setSelectedDate: (date: string) => {
          const { historyLogs } = get();
          let targetLog = historyLogs[date];
          if (!targetLog) {
            targetLog = createLogForDate(date);
          }
          const updatedHistory = {
            ...historyLogs,
            [date]: targetLog
          };
          const updatedBank = buildWeeklyFlexBank(
            date,
            updatedHistory,
            targetLog,
            targetLog.targets.calories || 2150
          );
          set({
            selectedDate: date,
            dailyLog: targetLog,
            historyLogs: updatedHistory,
            weeklyBank: updatedBank
          });
        },

        addFoodToMeal: (mealType, entryData) => {
          const { dailyLog, selectedDate, historyLogs } = get();
          const category = dailyLog.meals[mealType];
          const newEntry: MealEntry = {
            ...entryData,
            id: `entry-${Date.now()}`,
            timestamp: entryData.timestamp || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          };

          const updatedEntries = [...category.entries, newEntry];
          const categoryMacros = calculateCategoryTotals(updatedEntries);

          const updatedMeals = {
            ...dailyLog.meals,
            [mealType]: {
              ...category,
              entries: updatedEntries,
              totalMacros: categoryMacros
            }
          };

          const updatedLog: DailyLog = {
            ...dailyLog,
            meals: updatedMeals,
            totals: calculateTotals(updatedMeals)
          };

          const updatedHistory = {
            ...historyLogs,
            [selectedDate]: updatedLog
          };
          const updatedBank = buildWeeklyFlexBank(
            selectedDate,
            updatedHistory,
            updatedLog,
            updatedLog.targets.calories || 2150
          );

          set({
            dailyLog: updatedLog,
            historyLogs: updatedHistory,
            weeklyBank: updatedBank
          });
        },

        updateMealEntry: (mealType, entryId, updates) => {
          const { dailyLog, selectedDate, historyLogs } = get();
          const category = dailyLog.meals[mealType];
          const updatedEntries = category.entries.map(e =>
            e.id === entryId ? { ...e, ...updates } : e
          );
          const categoryMacros = calculateCategoryTotals(updatedEntries);

          const updatedMeals = {
            ...dailyLog.meals,
            [mealType]: {
              ...category,
              entries: updatedEntries,
              totalMacros: categoryMacros
            }
          };

          const updatedLog: DailyLog = {
            ...dailyLog,
            meals: updatedMeals,
            totals: calculateTotals(updatedMeals)
          };

          const updatedHistory = {
            ...historyLogs,
            [selectedDate]: updatedLog
          };
          const updatedBank = buildWeeklyFlexBank(
            selectedDate,
            updatedHistory,
            updatedLog,
            updatedLog.targets.calories || 2150
          );

          set({
            dailyLog: updatedLog,
            historyLogs: updatedHistory,
            weeklyBank: updatedBank
          });
        },

        moveMealEntry: (fromMealType, toMealType, entryId, newTimestamp) => {
          const { dailyLog, selectedDate, historyLogs } = get();
          const fromCategory = dailyLog.meals[fromMealType];
          const entryToMove = fromCategory.entries.find(e => e.id === entryId);
          if (!entryToMove) return;

          const updatedFromEntries = fromCategory.entries.filter(e => e.id !== entryId);
          const updatedFromCategory = {
            ...fromCategory,
            entries: updatedFromEntries,
            totalMacros: calculateCategoryTotals(updatedFromEntries)
          };

          const toCategory = dailyLog.meals[toMealType];
          const updatedEntry: MealEntry = {
            ...entryToMove,
            timestamp: newTimestamp || entryToMove.timestamp
          };
          const updatedToEntries = [...toCategory.entries, updatedEntry];
          const updatedToCategory = {
            ...toCategory,
            entries: updatedToEntries,
            totalMacros: calculateCategoryTotals(updatedToEntries)
          };

          const updatedMeals = {
            ...dailyLog.meals,
            [fromMealType]: updatedFromCategory,
            [toMealType]: updatedToCategory
          };

          const updatedLog: DailyLog = {
            ...dailyLog,
            meals: updatedMeals,
            totals: calculateTotals(updatedMeals)
          };

          const updatedHistory = {
            ...historyLogs,
            [selectedDate]: updatedLog
          };
          const updatedBank = buildWeeklyFlexBank(
            selectedDate,
            updatedHistory,
            updatedLog,
            updatedLog.targets.calories || 2150
          );

          set({
            dailyLog: updatedLog,
            historyLogs: updatedHistory,
            weeklyBank: updatedBank
          });
        },

        toggleMealEaten: (mealType, entryId) => {
          const { dailyLog, selectedDate, historyLogs } = get();
          const category = dailyLog.meals[mealType];
          const updatedEntries = category.entries.map(e =>
            e.id === entryId ? { ...e, eaten: e.eaten === false ? true : false } : e
          );
          const categoryMacros = calculateCategoryTotals(updatedEntries);

          const updatedMeals = {
            ...dailyLog.meals,
            [mealType]: {
              ...category,
              entries: updatedEntries,
              totalMacros: categoryMacros
            }
          };

          const updatedLog: DailyLog = {
            ...dailyLog,
            meals: updatedMeals,
            totals: calculateTotals(updatedMeals)
          };

          const updatedHistory = {
            ...historyLogs,
            [selectedDate]: updatedLog
          };
          const updatedBank = buildWeeklyFlexBank(
            selectedDate,
            updatedHistory,
            updatedLog,
            updatedLog.targets.calories || 2150
          );

          set({
            dailyLog: updatedLog,
            historyLogs: updatedHistory,
            weeklyBank: updatedBank
          });
        },

        quickAddCalories: (mealType, calories, note = 'Швидкий запис') => {
          get().addFoodToMeal(mealType, {
            foodId: 'quick-add',
            name: note,
            weightGrams: 100,
            eaten: true,
            macros: {
              calories,
              protein: Math.round(calories * 0.15 / 4),
              fat: Math.round(calories * 0.3 / 9),
              carbs: Math.round(calories * 0.55 / 4)
            }
          });
        },

        removeFoodFromMeal: (mealType, entryId) => {
          const { dailyLog, selectedDate, historyLogs } = get();
          const category = dailyLog.meals[mealType];
          const updatedEntries = category.entries.filter(e => e.id !== entryId);
          const categoryMacros = calculateCategoryTotals(updatedEntries);

          const updatedMeals = {
            ...dailyLog.meals,
            [mealType]: {
              ...category,
              entries: updatedEntries,
              totalMacros: categoryMacros
            }
          };

          const updatedLog: DailyLog = {
            ...dailyLog,
            meals: updatedMeals,
            totals: calculateTotals(updatedMeals)
          };

          const updatedHistory = {
            ...historyLogs,
            [selectedDate]: updatedLog
          };
          const updatedBank = buildWeeklyFlexBank(
            selectedDate,
            updatedHistory,
            updatedLog,
            updatedLog.targets.calories || 2150
          );

          set({
            dailyLog: updatedLog,
            historyLogs: updatedHistory,
            weeklyBank: updatedBank
          });
        },

        updateTargets: (newTargets) => {
          const { dailyLog, selectedDate, historyLogs } = get();
          const updatedLog = {
            ...dailyLog,
            targets: { ...dailyLog.targets, ...newTargets }
          };
          const updatedHistory = {
            ...historyLogs,
            [selectedDate]: updatedLog
          };
          const updatedBank = buildWeeklyFlexBank(
            selectedDate,
            updatedHistory,
            updatedLog,
            updatedLog.targets.calories || 2150
          );
          set({
            dailyLog: updatedLog,
            historyLogs: updatedHistory,
            weeklyBank: updatedBank
          });
        },

        generateMenuForTargets: (targets, eatingRhythm = '3_meals', options = {}) => {
          const { selectedDate, historyLogs, dailyLog } = get();
          const mergedTargets = { ...dailyLog.targets, ...targets };
          const newMeals = generateDailyMealsForTargets(mergedTargets, eatingRhythm, options);
          const updatedLog: DailyLog = {
            ...dailyLog,
            date: selectedDate,
            targets: mergedTargets,
            meals: newMeals,
            totals: calculateTotals(newMeals)
          };
          const updatedHistory = {
            ...historyLogs,
            [selectedDate]: updatedLog
          };
          const updatedBank = buildWeeklyFlexBank(
            selectedDate,
            updatedHistory,
            updatedLog,
            updatedLog.targets.calories || 2150
          );
          set({
            dailyLog: updatedLog,
            historyLogs: updatedHistory,
            weeklyBank: updatedBank
          });
        },

        saveRecipe: (recipe) => {
          set(state => ({
            savedRecipes: [recipe, ...state.savedRecipes.filter(r => r.title !== recipe.title)]
          }));
        },

        deleteRecipe: (title) => {
          set(state => ({
            savedRecipes: state.savedRecipes.filter(r => r.title !== title)
          }));
        },

        saveCookLossDish: (dish) => {
          set(state => ({
            savedCookLossDishes: [dish, ...state.savedCookLossDishes.filter(d => d.id !== dish.id)]
          }));
        },

        seedSevenDayDogfoodingData: () => {
          const { dailyLog } = get();
          const seed = generateSevenDayDogfoodingData(dailyLog.targets);
          const todayStr = getTodayDateStr();
          const activeLog = seed.historyLogs[todayStr] || seed.historyLogs[seed.dates[0]];

          set({
            historyLogs: seed.historyLogs,
            weeklyBank: seed.weeklyBank,
            dailyLog: activeLog,
            selectedDate: todayStr
          });
        }
      };
    },
    {
      name: 'nutriq-studio-storage-v6',
    }
  )
);
