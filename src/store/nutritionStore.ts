import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { DailyLog, Macros, MealType, MealEntry } from '../types/nutrition';
import { WeeklyFlexBank } from '../types/weeklyFlex';
import { ParsedRecipe } from '../types/recipe';
import { CookLossDish } from '../types/cookLoss';

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
  addFoodToMeal: (mealType: MealType, entry: Omit<MealEntry, 'id' | 'timestamp'>) => void;
  removeFoodFromMeal: (mealType: MealType, entryId: string) => void;
  toggleMealEaten: (mealType: MealType, entryId: string) => void;
  updateTargets: (targets: Partial<DailyLog['targets']>) => void;
  quickAddCalories: (mealType: MealType, calories: number, note?: string) => void;

  // Дії рецептів
  saveRecipe: (recipe: ParsedRecipe) => void;
  deleteRecipe: (title: string) => void;

  // Дії каструлі (Cook-Loss)
  saveCookLossDish: (dish: CookLossDish) => void;
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
        foodId: 'oats',
        name: 'Вівсянка з ягодами та мигдалем',
        weightGrams: 280,
        macros: { calories: 520, protein: 42, fat: 22, carbs: 78 },
        timestamp: '08:30',
        eaten: true,
        recipeDetails: 'Вівсяні пластівці 70г, протеїн ізолят 35г, лохина 80г, мигдаль 20г'
      },
      {
        id: 'b-2',
        foodId: 'coffee',
        name: 'Флет-вайт',
        weightGrams: 200,
        macros: { calories: 120, protein: 6, fat: 5, carbs: 14 },
        timestamp: '08:45',
        eaten: true
      }
    ],
    totalMacros: { calories: 640, protein: 48, fat: 27, carbs: 92 }
  },
  lunch: {
    type: 'lunch',
    title: 'Обід',
    icon: 'Flame',
    entries: [
      {
        id: 'l-1',
        foodId: 'salmon_bowl',
        name: 'Боул з лососем та кіноа',
        weightGrams: 420,
        macros: { calories: 810, protein: 92, fat: 38, carbs: 128 },
        timestamp: '13:15',
        eaten: true,
        isCookLoss: true,
        rawWeightGrams: 350,
        cookedWeightGrams: 260,
        recipeDetails: 'Філе лосося 350г ➔ 260г (-26%), кіноа 160г, авокадо 70г'
      }
    ],
    totalMacros: { calories: 810, protein: 92, fat: 38, carbs: 128 }
  },
  dinner: {
    type: 'dinner',
    title: 'Вечеря',
    icon: 'Moon',
    entries: [
      {
        id: 'd-1',
        foodId: 'steak_greens',
        name: 'Gourmet Steak & Greens',
        weightGrams: 320,
        macros: { calories: 480, protein: 42, fat: 12, carbs: 20 },
        timestamp: '19:30',
        eaten: false, // Заплановано
        isCookLoss: true,
        rawWeightGrams: 350,
        cookedWeightGrams: 260,
        recipeDetails: 'Стейк яловичий 350г ➔ 260г (-26% Cook-Loss), спаржа свіжа 150г'
      }
    ],
    totalMacros: { calories: 0, protein: 0, fat: 0, carbs: 0 }
  },
  snack: {
    type: 'snack',
    title: 'Перекус',
    icon: 'Apple',
    entries: [],
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

const initialWeeklyBank: WeeklyFlexBank = {
  weekStartDate: '2026-10-19',
  weekEndDate: '2026-10-25',
  weeklyTargetCalories: 15050,
  weeklyConsumedCalories: 14700,
  weeklyBalanceCalories: 350,
  adjustedDailyBudgetForRemainingDays: 2200,
  bankHealthStatus: 'safe',
  days: [
    { date: '2026-10-19', dayName: 'Пн', targetCalories: 2150, consumedCalories: 1255, balanceCalories: 895, isCompleted: false, isToday: true },
    { date: '2026-10-20', dayName: 'Вт', targetCalories: 2150, consumedCalories: 0, balanceCalories: 2150, isCompleted: false, isToday: false },
    { date: '2026-10-21', dayName: 'Ср', targetCalories: 2150, consumedCalories: 0, balanceCalories: 2150, isCompleted: false, isToday: false },
    { date: '2026-10-22', dayName: 'Чт', targetCalories: 2150, consumedCalories: 0, balanceCalories: 2150, isCompleted: false, isToday: false },
    { date: '2026-10-23', dayName: 'Пт', targetCalories: 2150, consumedCalories: 0, balanceCalories: 2150, isCompleted: false, isToday: false },
    { date: '2026-10-24', dayName: 'Сб', targetCalories: 2150, consumedCalories: 0, balanceCalories: 2150, isCompleted: false, isToday: false },
    { date: '2026-10-25', dayName: 'Нд', targetCalories: 2150, consumedCalories: 0, balanceCalories: 2150, isCompleted: false, isToday: false },
  ]
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

export const useNutritionStore = create<NutritionState>()(
  persist(
    (set, get) => {
      const todayStr = getTodayDateStr();
      const initialLog = defaultHistory[todayStr] || defaultHistory['2026-10-19'] || createLogForDate(todayStr);

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
          set({
            selectedDate: date,
            dailyLog: targetLog,
            historyLogs: {
              ...historyLogs,
              [date]: targetLog
            }
          });
        },

        addFoodToMeal: (mealType, entryData) => {
          const { dailyLog, selectedDate, historyLogs } = get();
          const category = dailyLog.meals[mealType];
          const newEntry: MealEntry = {
            ...entryData,
            id: `entry-${Date.now()}`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
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

          set({
            dailyLog: updatedLog,
            historyLogs: {
              ...historyLogs,
              [selectedDate]: updatedLog
            }
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

          set({
            dailyLog: updatedLog,
            historyLogs: {
              ...historyLogs,
              [selectedDate]: updatedLog
            }
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

          set({
            dailyLog: updatedLog,
            historyLogs: {
              ...historyLogs,
              [selectedDate]: updatedLog
            }
          });
        },

        updateTargets: (newTargets) => {
          const { dailyLog, selectedDate, historyLogs } = get();
          const updatedLog = {
            ...dailyLog,
            targets: { ...dailyLog.targets, ...newTargets }
          };
          set({
            dailyLog: updatedLog,
            historyLogs: {
              ...historyLogs,
              [selectedDate]: updatedLog
            }
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
        }
      };
    },
    {
      name: 'nutriq-studio-storage-v6',
    }
  )
);
