import { FoodItem } from '../types/nutrition';

export const COMMON_FOODS: FoodItem[] = [
  // Білкові продукти
  { id: 'chicken_breast', name: 'Куряче філе', per100g: { calories: 110, protein: 23.0, fat: 1.5, carbs: 0 } },
  { id: 'turkey_breast', name: 'Філе індички', per100g: { calories: 115, protein: 24.0, fat: 1.5, carbs: 0 } },
  { id: 'salmon', name: 'Лосось / сьомга', per100g: { calories: 206, protein: 20.0, fat: 13.0, carbs: 0 } },
  { id: 'tuna_canned', name: 'Тунець у власному соку', per100g: { calories: 116, protein: 26.0, fat: 1.0, carbs: 0 } },
  { id: 'beef_lean', name: 'Яловичина нежирна', per100g: { calories: 158, protein: 22.0, fat: 7.0, carbs: 0 } },
  { id: 'ground_meat', name: 'Фарш м’ясний (яловичий / курячий)', per100g: { calories: 215, protein: 20.0, fat: 15.0, carbs: 0 } },
  { id: 'shrimp', name: 'Креветки очищені', per100g: { calories: 85, protein: 18.0, fat: 1.0, carbs: 1.0 } },
  { id: 'protein_isolate', name: 'Протеїн ізолят (порошок)', per100g: { calories: 370, protein: 85.0, fat: 1.5, carbs: 3.0 } },

  // Яйця та молочні
  { id: 'eggs', name: 'Куряче яйце', per100g: { calories: 143, protein: 12.6, fat: 9.5, carbs: 0.7 }, defaultServingWeight: 55 },
  { id: 'egg_whites', name: 'Яєчний білок', per100g: { calories: 52, protein: 11.0, fat: 0.2, carbs: 0.7 } },
  { id: 'cottage_cheese_5', name: 'Сир кисломолочний 5%', per100g: { calories: 121, protein: 17.0, fat: 5.0, carbs: 2.0 } },
  { id: 'ricotta', name: 'Сир рікота', per100g: { calories: 140, protein: 11.0, fat: 9.0, carbs: 4.0 } },
  { id: 'greek_yogurt_2', name: 'Грецький йогурт 2%', per100g: { calories: 73, protein: 10.0, fat: 2.0, carbs: 4.0 } },
  { id: 'cheddar_cheese', name: 'Сир твердий (Чеддер/Гауда)', per100g: { calories: 380, protein: 25.0, fat: 30.0, carbs: 1.3 } },
  { id: 'cream_10', name: 'Вершки 10%', per100g: { calories: 118, protein: 2.8, fat: 10.0, carbs: 4.0 } },

  // Вуглеводи та хлібобулочні
  { id: 'toast_bread', name: 'Хліб цільнозерновий / тост', per100g: { calories: 242, protein: 9.2, fat: 2.8, carbs: 45.0 } },
  { id: 'pita_lavash', name: 'Лаваш вірменський тонкий', per100g: { calories: 236, protein: 7.9, fat: 1.0, carbs: 48.0 } },
  { id: 'crepes_base', name: 'Млинці / крепси базові', per100g: { calories: 210, protein: 6.5, fat: 7.0, carbs: 30.0 } },
  { id: 'rice_basmati', name: 'Рис басматі сухий', per100g: { calories: 350, protein: 7.5, fat: 0.6, carbs: 78.0 } },
  { id: 'pasta_durum', name: 'Паста / макарони з твердих сортів', per100g: { calories: 355, protein: 13.0, fat: 1.5, carbs: 72.0 } },
  { id: 'oats', name: 'Вівсяні пластівці', per100g: { calories: 370, protein: 12.5, fat: 6.0, carbs: 62.0 } },
  { id: 'buckwheat', name: 'Гречка суха', per100g: { calories: 343, protein: 12.6, fat: 3.3, carbs: 62.0 } },
  { id: 'potatoes', name: 'Картопля', per100g: { calories: 77, protein: 2.0, fat: 0.1, carbs: 17.5 } },

  // Фрукти та ягоди
  { id: 'banana', name: 'Банан свіжий', per100g: { calories: 89, protein: 1.1, fat: 0.3, carbs: 22.8 } },
  { id: 'apple', name: 'Яблуко свіже', per100g: { calories: 52, protein: 0.3, fat: 0.2, carbs: 13.8 } },
  { id: 'berries_mix', name: 'Ягоди свіжі (лохина, малина)', per100g: { calories: 45, protein: 0.8, fat: 0.4, carbs: 9.5 } },

  // Овочі та зелень
  { id: 'spinach', name: 'Шпинат свіжий', per100g: { calories: 23, protein: 2.9, fat: 0.4, carbs: 3.6 } },
  { id: 'tomatoes', name: 'Помідори свіжі', per100g: { calories: 18, protein: 0.9, fat: 0.2, carbs: 3.9 } },
  { id: 'avocado', name: 'Авокадо', per100g: { calories: 160, protein: 2.0, fat: 14.7, carbs: 8.5 } },

  // Жири, насіння та горіхи
  { id: 'olive_oil', name: 'Оливкова олія extra virgin', per100g: { calories: 884, protein: 0, fat: 100.0, carbs: 0 } },
  { id: 'butter', name: 'Вершкове масло 82%', per100g: { calories: 748, protein: 0.8, fat: 82.5, carbs: 0.8 } },
  { id: 'peanut_butter', name: 'Арахісова паста натуральна', per100g: { calories: 588, protein: 25.0, fat: 50.0, carbs: 20.0 } },
  { id: 'chia_seeds', name: 'Насіння чіа', per100g: { calories: 486, protein: 16.5, fat: 30.7, carbs: 42.1 } }
];
