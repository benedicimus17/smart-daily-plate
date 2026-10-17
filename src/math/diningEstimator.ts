import { Macros } from '../types/nutrition';
import { HandPortionType, DiningRestaurantPreset } from '../types/dining';

export const HAND_PORTION_DEFINITIONS: Record<
  HandPortionType,
  {
    name: string;
    unitGrams: number;
    macrosPerUnit: Macros;
    tip: string;
  }
> = {
  palm: {
    name: 'Долоня (білок)',
    unitGrams: 130,
    macrosPerUnit: { calories: 165, protein: 28, fat: 5, carbs: 0 },
    tip: 'М\'ясо, риба, птиця, тофу за розміром вашої долоні без пальців',
  },
  fist: {
    name: 'Кулак (складні вуглеводи)',
    unitGrams: 160,
    macrosPerUnit: { calories: 190, protein: 4.5, fat: 1.5, carbs: 40 },
    tip: 'Рис, картопля, паста, каша за розміром стисненого кулака',
  },
  cupped_hand: {
    name: 'Жменя (овочі або фрукти)',
    unitGrams: 120,
    macrosPerUnit: { calories: 50, protein: 2, fat: 0.5, carbs: 10 },
    tip: 'Свіжий салат, ягоди або тушковані овочі у складеній долоні',
  },
  thumb: {
    name: 'Палець (жири та заправки)',
    unitGrams: 15,
    macrosPerUnit: { calories: 120, protein: 0, fat: 13, carbs: 1 },
    tip: 'Олія, соус, сир, горіхи чи вершкове масло розміром з великий палець',
  },
};

export const POPULAR_RESTAURANT_PRESETS: DiningRestaurantPreset[] = [
  {
    id: 'pizza-slice-half',
    name: 'Піца (половина / 4 шматочки)',
    category: 'italian',
    description: 'Сир моцарела, томатний соус, тонке тісто',
    estimatedWeightGrams: 350,
    defaultMacros: { calories: 760, protein: 30, fat: 26, carbs: 98 },
  },
  {
    id: 'pasta-carbonara',
    name: 'Паста Карбонара',
    category: 'italian',
    description: 'Спагеті, панчета, жовток, пармезан, вершковий соус',
    estimatedWeightGrams: 350,
    defaultMacros: { calories: 840, protein: 29, fat: 44, carbs: 82 },
  },
  {
    id: 'burger-classic',
    name: 'Класичний бургер з яловичиною',
    category: 'burger',
    description: 'Бріош, котлета з яловичини, сир чеддер, соус',
    estimatedWeightGrams: 240,
    defaultMacros: { calories: 590, protein: 32, fat: 31, carbs: 44 },
  },
  {
    id: 'caesar-chicken',
    name: 'Салат Цезар з куркою',
    category: 'cafe',
    description: 'Ромен, курка-гриль, пармезан, сухарики, заправка Цезар',
    estimatedWeightGrams: 300,
    defaultMacros: { calories: 490, protein: 34, fat: 32, carbs: 16 },
  },
  {
    id: 'steak-grilled',
    name: 'Стейк яловичий (Рибай / Філе)',
    category: 'steak',
    description: 'Середньої прожарки з травами та вершковим маслом',
    estimatedWeightGrams: 250,
    defaultMacros: { calories: 560, protein: 55, fat: 38, carbs: 0 },
  },
  {
    id: 'asian-ramen',
    name: 'Азійський рамен зі свининою',
    category: 'asian',
    description: 'Насичений бульйон, локшина, яйце, чашу',
    estimatedWeightGrams: 550,
    defaultMacros: { calories: 680, protein: 35, fat: 28, carbs: 72 },
  },
];

/**
 * Розрахунок КБЖВ ресторанної тарілки за кількістю візуальних долонь
 */
export function calculateHandPortionsMacros(portions: Record<HandPortionType, number>): {
  totalMacros: Macros;
  totalWeightGrams: number;
} {
  let calories = 0;
  let protein = 0;
  let fat = 0;
  let carbs = 0;
  let totalWeightGrams = 0;

  (Object.keys(portions) as HandPortionType[]).forEach((type) => {
    const count = Math.max(0, portions[type] || 0);
    const def = HAND_PORTION_DEFINITIONS[type];
    if (count > 0 && def) {
      calories += def.macrosPerUnit.calories * count;
      protein += def.macrosPerUnit.protein * count;
      fat += def.macrosPerUnit.fat * count;
      carbs += def.macrosPerUnit.carbs * count;
      totalWeightGrams += def.unitGrams * count;
    }
  });

  return {
    totalMacros: {
      calories: Math.round(calories),
      protein: Math.round(protein * 10) / 10,
      fat: Math.round(fat * 10) / 10,
      carbs: Math.round(carbs * 10) / 10,
    },
    totalWeightGrams: Math.round(totalWeightGrams),
  };
}
