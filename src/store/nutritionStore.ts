import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { DailyLog, Macros, MealType, MealEntry } from '../types/nutrition';
import { WeeklyFlexBank } from '../types/weeklyFlex';
import { ParsedRecipe } from '../types/recipe';
import { CookLossDish } from '../types/cookLoss';

interface NutritionState {
  currentDate: string;
  dailyLog: DailyLog;
  weeklyBank: WeeklyFlexBank;
  savedRecipes: ParsedRecipe[];
  savedCookLossDishes: CookLossDish[];
  
  // Дії щоденника
  selectedDate: string;
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

const initialMeals: DailyLog['meals'] = {
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
        macros: { calories: 380, protein: 14, fat: 12, carbs: 54 },
        timestamp: '08:30',
        eaten: true,
        recipeDetails: 'Вівсяні пластівці 60г, лохина свіжа 80г, мигдаль 15г, протеїн 25г'
      },
      {
        id: 'b-2',
        foodId: 'coffee',
        name: 'Флет-вайт на вівсяному',
        weightGrams: 200,
        macros: { calories: 95, protein: 3, fat: 3, carbs: 14 },
        timestamp: '08:45',
        eaten: true
      }
    ],
    totalMacros: { calories: 475, protein: 17, fat: 15, carbs: 68 }
  },
  lunch: {
    type: 'lunch',
    title: 'Обід',
    icon: 'Flame',
    entries: [
      {
        id: 'l-1',
        foodId: 'salmon_bowl',
        name: 'Боул з лососем, кіноа та авокадо',
        weightGrams: 350,
        macros: { calories: 620, protein: 38, fat: 26, carbs: 58 },
        timestamp: '13:15',
        eaten: true,
        isCookLoss: true,
        rawWeightGrams: 330,
        cookedWeightGrams: 250,
        recipeDetails: 'Лосось свіжий 330г ➔ 250г (-24%), варена кіноа 120г, авокадо 60г, огірок'
      }
    ],
    totalMacros: { calories: 620, protein: 38, fat: 26, carbs: 58 }
  },
  dinner: {
    type: 'dinner',
    title: 'Вечеря',
    icon: 'Moon',
    entries: [
      {
        id: 'd-1',
        foodId: 'steak_asparagus',
        name: 'Стейк рибай та запечена спаржа',
        weightGrams: 300,
        macros: { calories: 520, protein: 44, fat: 32, carbs: 10 },
        timestamp: '19:30',
        eaten: false, // Заплановано на вечір, ще не з'їдено!
        isCookLoss: true,
        rawWeightGrams: 380,
        cookedWeightGrams: 275,
        recipeDetails: 'Яловичина 380г ➔ 275г (-28% уварка), спаржа 150г, оливкова олія, спеції'
      }
    ],
    totalMacros: { calories: 0, protein: 0, fat: 0, carbs: 0 } // 0 оскільки eaten === false
  },
  snack: {
    type: 'snack',
    title: 'Перекус',
    icon: 'Apple',
    entries: [
      {
        id: 's-1',
        foodId: 'protein_yogurt',
        name: 'Грецький йогурт 0% з лохиною',
        weightGrams: 250,
        macros: { calories: 160, protein: 22, fat: 2, carbs: 14 },
        timestamp: '16:40',
        eaten: true,
        recipeDetails: 'Грецький йогурт 200г, свіжа лохина 50г'
      }
    ],
    totalMacros: { calories: 160, protein: 22, fat: 2, carbs: 14 }
  }
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

function calculateTotals(meals: DailyLog['meals']): Macros {
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

const initialWeeklyBank: WeeklyFlexBank = {
  weekStartDate: '2026-10-19',
  weekEndDate: '2026-10-25',
  weeklyTargetCalories: 15050, // 2150 * 7
  weeklyConsumedCalories: 1255,
  weeklyBalanceCalories: 13795,
  adjustedDailyBudgetForRemainingDays: 2299,
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

export const useNutritionStore = create<NutritionState>()(
  persist(
    (set, get) => ({
      currentDate: new Date().toISOString().split('T')[0],
      selectedDate: new Date().toISOString().split('T')[0],
      setSelectedDate: (date) => set({ selectedDate: date }),
      dailyLog: {
        date: new Date().toISOString().split('T')[0],
        targets: DEFAULT_TARGETS,
        meals: initialMeals,
        totals: calculateTotals(initialMeals),
        waterMl: 1750,
      },
      weeklyBank: initialWeeklyBank,
      savedRecipes: [],
      savedCookLossDishes: [],

      addFoodToMeal: (mealType, entryData) => {
        const { dailyLog } = get();
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

        set({
          dailyLog: {
            ...dailyLog,
            meals: updatedMeals,
            totals: calculateTotals(updatedMeals)
          }
        });
      },

      toggleMealEaten: (mealType, entryId) => {
        const { dailyLog } = get();
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

        set({
          dailyLog: {
            ...dailyLog,
            meals: updatedMeals,
            totals: calculateTotals(updatedMeals)
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
        const { dailyLog } = get();
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

        set({
          dailyLog: {
            ...dailyLog,
            meals: updatedMeals,
            totals: calculateTotals(updatedMeals)
          }
        });
      },

      updateTargets: (newTargets) => {
        set(state => ({
          dailyLog: {
            ...state.dailyLog,
            targets: { ...state.dailyLog.targets, ...newTargets }
          }
        }));
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
    }),
    {
      name: 'smart-daily-plate-storage',
    }
  )
);
