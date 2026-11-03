import { Macros } from '../types/nutrition';
import { HandPortionType, DiningRestaurantPreset } from '../types/dining';

export interface HandPortionMeta {
  name: string;
  unitGrams: number;
  macrosPerUnit: Macros;
  tip: string;
}

export const HAND_PORTIONS_BY_LANG: Record<string, Record<HandPortionType, HandPortionMeta>> = {
  es: {
    palm: {
      name: 'Palma (Proteína)',
      unitGrams: 130,
      macrosPerUnit: { calories: 165, protein: 28, fat: 5, carbs: 0 },
      tip: 'Carne, pescado, pollo, tofu del tamaño de la palma sin dedos',
    },
    fist: {
      name: 'Puño (Carbohidratos complejos)',
      unitGrams: 160,
      macrosPerUnit: { calories: 190, protein: 4.5, fat: 1.5, carbs: 40 },
      tip: 'Arroz, patatas, pasta, legumbres del tamaño de tu puño cerrado',
    },
    cupped_hand: {
      name: 'Mano cóncava (Verduras o frutas)',
      unitGrams: 120,
      macrosPerUnit: { calories: 50, protein: 2, fat: 0.5, carbs: 10 },
      tip: 'Ensalada fresca, verduras salteadas o frutos en la palma ahuecada',
    },
    thumb: {
      name: 'Pulgar (Grasas y aliños)',
      unitGrams: 15,
      macrosPerUnit: { calories: 120, protein: 0, fat: 13, carbs: 1 },
      tip: 'Aceite de oliva, mantequilla, frutos secos o queso del tamaño del pulgar',
    },
  },
  en: {
    palm: {
      name: 'Palm (Protein)',
      unitGrams: 130,
      macrosPerUnit: { calories: 165, protein: 28, fat: 5, carbs: 0 },
      tip: 'Meat, fish, poultry, tofu roughly the size of your open palm (excluding fingers)',
    },
    fist: {
      name: 'Fist (Complex Carbs)',
      unitGrams: 160,
      macrosPerUnit: { calories: 190, protein: 4.5, fat: 1.5, carbs: 40 },
      tip: 'Rice, potato, pasta, grains roughly the size of your clenched fist',
    },
    cupped_hand: {
      name: 'Cupped Hand (Veggies & Fruits)',
      unitGrams: 120,
      macrosPerUnit: { calories: 50, protein: 2, fat: 0.5, carbs: 10 },
      tip: 'Fresh greens, berries, or roasted veggies fitting inside your cupped hand',
    },
    thumb: {
      name: 'Thumb (Fats & Dressings)',
      unitGrams: 15,
      macrosPerUnit: { calories: 120, protein: 0, fat: 13, carbs: 1 },
      tip: 'Olive oil, butter, cheese, nuts about the size of your thumb',
    },
  },
  uk: {
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
  },
};

export const HAND_PORTION_DEFINITIONS = HAND_PORTIONS_BY_LANG.uk;

export function getLocalizedHandPortions(lang: string): Record<HandPortionType, HandPortionMeta> {
  return HAND_PORTIONS_BY_LANG[lang] || HAND_PORTIONS_BY_LANG.en || HAND_PORTIONS_BY_LANG.uk;
}

export const POPULAR_RESTAURANT_PRESETS: DiningRestaurantPreset[] = [
  {
    id: 'paella-marisco',
    name: 'Паелья з морепродуктами (Paella de marisco)',
    category: 'spanish',
    description: 'Рис бомба, тигрові креветки, мідії, кальмари, шафран',
    estimatedWeightGrams: 420,
    defaultMacros: { calories: 620, protein: 28, fat: 16, carbs: 92 },
  },
  {
    id: 'tapas-patatas-bravas',
    name: 'Тапас: Пататас Бравас з аліолі (Patatas Bravas)',
    category: 'tapas',
    description: 'Хрустка обсмажена картопля, пікантний соус брава, домашній аліолі',
    estimatedWeightGrams: 260,
    defaultMacros: { calories: 480, protein: 6, fat: 24, carbs: 60 },
  },
  {
    id: 'chuleton-ternera',
    name: 'Стейк Чулетон на вугіллі (Chuletón de ternera)',
    category: 'steak',
    description: 'Відбірний яловичий рібай на кістці з пластівцями морської солі',
    estimatedWeightGrams: 350,
    defaultMacros: { calories: 720, protein: 68, fat: 48, carbs: 0 },
  },
  {
    id: 'pulpo-gallega',
    name: 'Восьминіг по-галісійськи (Pulpo a la gallega)',
    category: 'spanish',
    description: 'Ніжний восьминіг, відварна картопля, копчена паприка, оливкова олія',
    estimatedWeightGrams: 250,
    defaultMacros: { calories: 380, protein: 34, fat: 14, carbs: 28 },
  },
  {
    id: 'tortilla-espanola',
    name: 'Іспанська тортилья з картоплею (Tortilla de patatas)',
    category: 'tapas',
    description: 'Традиційний пінчо: яйця, підрум\'янена картопля, солодка цибуля',
    estimatedWeightGrams: 200,
    defaultMacros: { calories: 340, protein: 14, fat: 20, carbs: 26 },
  },
  {
    id: 'gambas-ajillo',
    name: 'Креветки аль ахільйо (Gambas al ajillo)',
    category: 'tapas',
    description: 'Очищені креветки в киплячій оливковій олії з часником та чилі',
    estimatedWeightGrams: 180,
    defaultMacros: { calories: 310, protein: 26, fat: 22, carbs: 2 },
  },
  {
    id: 'pizza-slice-half',
    name: 'Піца (половина / 4 шматочки)',
    category: 'italian',
    description: 'Сир моцарела, томатний соус San Marzano, тонке тісто',
    estimatedWeightGrams: 350,
    defaultMacros: { calories: 760, protein: 30, fat: 26, carbs: 98 },
  },
  {
    id: 'pasta-carbonara',
    name: 'Паста Карбонара',
    category: 'italian',
    description: 'Спагеті, панчета, яєчний жовток, пекоріно, чорний перець',
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

export function getLocalizedRestaurantPresets(lang: string): DiningRestaurantPreset[] {
  if (lang === 'es') {
    return [
      {
        id: 'paella-marisco',
        name: 'Paella de marisco tradicional',
        category: 'spanish',
        description: 'Arroz bomba, gambas, mejillones, calamar, azafrán',
        estimatedWeightGrams: 420,
        defaultMacros: { calories: 620, protein: 28, fat: 16, carbs: 92 },
      },
      {
        id: 'tapas-patatas-bravas',
        name: 'Patatas bravas con alioli casero',
        category: 'tapas',
        description: 'Patatas doradas crujientes, salsa brava picante y alioli',
        estimatedWeightGrams: 260,
        defaultMacros: { calories: 480, protein: 6, fat: 24, carbs: 60 },
      },
      {
        id: 'chuleton-ternera',
        name: 'Chuletón de ternera a la brasa',
        category: 'steak',
        description: 'Corte noble a la parrilla con escamas de sal marina',
        estimatedWeightGrams: 350,
        defaultMacros: { calories: 720, protein: 68, fat: 48, carbs: 0 },
      },
      {
        id: 'pulpo-gallega',
        name: 'Pulpo a la gallega con cachelos',
        category: 'spanish',
        description: 'Pulpo tierno cocido, patatas, pimentón de la Vera y AOVE',
        estimatedWeightGrams: 250,
        defaultMacros: { calories: 380, protein: 34, fat: 14, carbs: 28 },
      },
      {
        id: 'tortilla-espanola',
        name: 'Pincho de tortilla de patatas casera',
        category: 'tapas',
        description: 'Huevos de campo, patatas tiernas pochadas, cebolla',
        estimatedWeightGrams: 200,
        defaultMacros: { calories: 340, protein: 14, fat: 20, carbs: 26 },
      },
      {
        id: 'gambas-ajillo',
        name: 'Gambas al ajillo al barro',
        category: 'tapas',
        description: 'Gambas peladas, ajo dorado, guindilla y aceite de oliva virgen',
        estimatedWeightGrams: 180,
        defaultMacros: { calories: 310, protein: 26, fat: 22, carbs: 2 },
      },
      {
        id: 'pizza-slice-half',
        name: 'Pizza artesanal (media pizza / 4 porciones)',
        category: 'italian',
        description: 'Queso mozzarella, salsa de tomate San Marzano, masa fina',
        estimatedWeightGrams: 350,
        defaultMacros: { calories: 760, protein: 30, fat: 26, carbs: 98 },
      },
      {
        id: 'pasta-carbonara',
        name: 'Pasta Carbonara auténtica',
        category: 'italian',
        description: 'Espaguetis, guanciale/panceta, yema de huevo, pecorino',
        estimatedWeightGrams: 350,
        defaultMacros: { calories: 840, protein: 29, fat: 44, carbs: 82 },
      },
      {
        id: 'burger-classic',
        name: 'Hamburguesa clásica de ternera',
        category: 'burger',
        description: 'Pan brioche, carne de vacuno, queso cheddar, salsa de la casa',
        estimatedWeightGrams: 240,
        defaultMacros: { calories: 590, protein: 32, fat: 31, carbs: 44 },
      },
      {
        id: 'caesar-chicken',
        name: 'Ensalada César con pollo a la parrilla',
        category: 'cafe',
        description: 'Lechuga romana, pechuga de pollo, parmesano, picatostes, salsa César',
        estimatedWeightGrams: 300,
        defaultMacros: { calories: 490, protein: 34, fat: 32, carbs: 16 },
      },
      {
        id: 'steak-grilled',
        name: 'Entrecot a la plancha con hierbas',
        category: 'steak',
        description: 'Punto medio con mantequilla de hierbas y sal gruesa',
        estimatedWeightGrams: 250,
        defaultMacros: { calories: 560, protein: 55, fat: 38, carbs: 0 },
      },
      {
        id: 'asian-ramen',
        name: 'Ramen japonés de cerdo Chashu',
        category: 'asian',
        description: 'Caldo denso tonkotsu, fideos ramen, huevo marinado, chashu',
        estimatedWeightGrams: 550,
        defaultMacros: { calories: 680, protein: 35, fat: 28, carbs: 72 },
      },
    ];
  }

  if (lang === 'en') {
    return [
      {
        id: 'paella-marisco',
        name: 'Traditional Seafood Paella',
        category: 'spanish',
        description: 'Bomba rice, tiger prawns, mussels, squid, saffron',
        estimatedWeightGrams: 420,
        defaultMacros: { calories: 620, protein: 28, fat: 16, carbs: 92 },
      },
      {
        id: 'tapas-patatas-bravas',
        name: 'Tapas: Patatas Bravas with Alioli',
        category: 'tapas',
        description: 'Crispy golden potatoes, spicy brava sauce, garlic alioli',
        estimatedWeightGrams: 260,
        defaultMacros: { calories: 480, protein: 6, fat: 24, carbs: 60 },
      },
      {
        id: 'chuleton-ternera',
        name: 'Charcoal Grilled Chuletón Steak',
        category: 'steak',
        description: 'Prime bone-in ribeye steak with sea salt flakes',
        estimatedWeightGrams: 350,
        defaultMacros: { calories: 720, protein: 68, fat: 48, carbs: 0 },
      },
      {
        id: 'pulpo-gallega',
        name: 'Galician-Style Octopus (Pulpo a la Gallega)',
        category: 'spanish',
        description: 'Tender octopus, boiled potatoes, smoked paprika, olive oil',
        estimatedWeightGrams: 250,
        defaultMacros: { calories: 380, protein: 34, fat: 14, carbs: 28 },
      },
      {
        id: 'tortilla-espanola',
        name: 'Spanish Potato Omelette (Tortilla de Patatas)',
        category: 'tapas',
        description: 'Country eggs, soft poached potatoes, sweet onions',
        estimatedWeightGrams: 200,
        defaultMacros: { calories: 340, protein: 14, fat: 20, carbs: 26 },
      },
      {
        id: 'gambas-ajillo',
        name: 'Sizzling Garlic Prawns (Gambas al Ajillo)',
        category: 'tapas',
        description: 'Prawns sizzling in extra virgin olive oil, garlic and chilli',
        estimatedWeightGrams: 180,
        defaultMacros: { calories: 310, protein: 26, fat: 22, carbs: 2 },
      },
      {
        id: 'pizza-slice-half',
        name: 'Artisan Pizza (Half pizza / 4 slices)',
        category: 'italian',
        description: 'Mozzarella cheese, San Marzano tomato sauce, thin crust',
        estimatedWeightGrams: 350,
        defaultMacros: { calories: 760, protein: 30, fat: 26, carbs: 98 },
      },
      {
        id: 'pasta-carbonara',
        name: 'Classic Pasta Carbonara',
        category: 'italian',
        description: 'Spaghetti, pancetta, egg yolk, pecorino cheese, black pepper',
        estimatedWeightGrams: 350,
        defaultMacros: { calories: 840, protein: 29, fat: 44, carbs: 82 },
      },
      {
        id: 'burger-classic',
        name: 'Classic Gourmet Beef Burger',
        category: 'burger',
        description: 'Brioche bun, prime beef patty, cheddar cheese, special sauce',
        estimatedWeightGrams: 240,
        defaultMacros: { calories: 590, protein: 32, fat: 31, carbs: 44 },
      },
      {
        id: 'caesar-chicken',
        name: 'Grilled Chicken Caesar Salad',
        category: 'cafe',
        description: 'Romaine lettuce, grilled chicken breast, parmesan, croutons, dressing',
        estimatedWeightGrams: 300,
        defaultMacros: { calories: 490, protein: 34, fat: 32, carbs: 16 },
      },
      {
        id: 'steak-grilled',
        name: 'Prime Grilled Beef Steak (Ribeye)',
        category: 'steak',
        description: 'Medium doneness with herb butter and coarse sea salt',
        estimatedWeightGrams: 250,
        defaultMacros: { calories: 560, protein: 55, fat: 38, carbs: 0 },
      },
      {
        id: 'asian-ramen',
        name: 'Japanese Pork Chashu Ramen',
        category: 'asian',
        description: 'Rich tonkotsu broth, ramen noodles, soft egg, pork chashu',
        estimatedWeightGrams: 550,
        defaultMacros: { calories: 680, protein: 35, fat: 28, carbs: 72 },
      },
    ];
  }

  return POPULAR_RESTAURANT_PRESETS;
}

/**
 * Розрахунок КБЖВ ресторанної тарілки за кількістю візуальних долонь
 * @param portions Кількість порцій кожного типу
 * @param addHiddenOil Чи додавати коефіцієнт прихованої ресторанної олії (+15% ккал / +25% жирів)
 * @param lang Мова для підтягування метаданих
 */
export function calculateHandPortionsMacros(
  portions: Record<HandPortionType, number>,
  addHiddenOil: boolean = false,
  lang: string = 'uk'
): {
  totalMacros: Macros;
  totalWeightGrams: number;
} {
  let calories = 0;
  let protein = 0;
  let fat = 0;
  let carbs = 0;
  let totalWeightGrams = 0;

  const defs = getLocalizedHandPortions(lang);

  (Object.keys(portions) as HandPortionType[]).forEach((type) => {
    const count = Math.max(0, portions[type] || 0);
    const def = defs[type];
    if (count > 0 && def) {
      calories += def.macrosPerUnit.calories * count;
      protein += def.macrosPerUnit.protein * count;
      fat += def.macrosPerUnit.fat * count;
      carbs += def.macrosPerUnit.carbs * count;
      totalWeightGrams += def.unitGrams * count;
    }
  });

  if (addHiddenOil && calories > 0) {
    // Ресторанна прихована олія: +20% жирів, перерахунок за формулою Етватера
    fat = fat * 1.25;
    calories = protein * 4 + fat * 9 + carbs * 4;
  }

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
