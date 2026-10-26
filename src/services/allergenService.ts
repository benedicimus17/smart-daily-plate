/**
 * NUTRIQ Smart Allergen & Dietary Restriction Engine (Stage 6.4)
 * Інтелектуальний контроль алергій (лактоза, глютен, горіхи, яйця, морепродукти, соя, кастомні),
 * верифікація типів раціону (вегетаріанство, веганство, пескетаріанство) та запобігання конфліктам.
 */

export type StandardAllergen = 'lactose' | 'gluten' | 'nuts' | 'eggs' | 'seafood' | 'soy';

export type DietType = 'standard' | 'vegetarian' | 'vegan' | 'pescatarian';

export interface UserDietaryRestrictions {
  dietType?: DietType;
  allergens?: StandardAllergen[];
  customAllergies?: string[];
}

export interface AllergenConflict {
  type: 'allergen' | 'diet';
  id: string;
  name: string;
  triggerIngredient: string;
  severity: 'danger' | 'warning';
  safeAlternativeSuggestion: string;
}

export const ALLERGEN_META: Record<
  StandardAllergen,
  { labelUk: string; labelEn: string; icon: string; triggers: string[]; defaultSafeAlternative: string }
> = {
  lactose: {
    labelUk: 'Лактоза (молочні продукти)',
    labelEn: 'Lactose & Dairy',
    icon: '🥛',
    triggers: [
      'молок', 'сир', 'йогурт', 'сметан', 'вершк', 'масло вершков', 'пармезан', 'моцарел', 'рікот',
      'фета', 'кефір', 'ряжанк', 'сирник', 'творог', 'сыр', 'молоко', 'сливк',
      'queso', 'leche', 'mantequilla', 'yogur', 'nata', 'cuajada',
      'cheese', 'milk', 'butter', 'cream', 'whey', 'parmesan', 'mozzarella', 'ricotta', 'yogurt'
    ],
    defaultSafeAlternative: 'Рослинне молоко (мигдальне/вівсяне) або безлактозний сир'
  },
  gluten: {
    labelUk: 'Глютен (пшениця, випічка)',
    labelEn: 'Gluten & Wheat',
    icon: '🌾',
    triggers: [
      'пшениц', 'хліб', 'булк', 'круасан', 'тост', 'паст', 'спагет', 'макарон', 'борошн', 'лаваш', 'глютен',
      'хлеб', 'мука', 'макароны',
      'trigo', 'pan', 'pasta', 'harina', 'croissant', 'tostada',
      'wheat', 'bread', 'flour', 'toast', 'pasta', 'spaghetti', 'croissant', 'gluten'
    ],
    defaultSafeAlternative: 'Безглютенові тости або кіноа / гречка'
  },
  nuts: {
    labelUk: 'Горіхи (арахіс, мигдаль, фундук)',
    labelEn: 'Tree Nuts & Peanuts',
    icon: '🥜',
    triggers: [
      'горіх', 'арахіс', 'мигдал', 'фундук', 'кеш', 'фісташк', 'волоськ', 'пекан',
      'орех', 'арахис', 'миндаль', 'фундук', 'кешью',
      'almendra', 'nuez', 'cacahuete', 'avellana', 'pistacho', 'anacardo',
      'nut', 'peanut', 'almond', 'walnut', 'cashew', 'hazelnut', 'pistachio'
    ],
    defaultSafeAlternative: 'Гарбузове або соняшникове насіння'
  },
  eggs: {
    labelUk: 'Яйця (курячі, омлети)',
    labelEn: 'Eggs',
    icon: '🥚',
    triggers: [
      'яйц', 'яєчн', 'омлет', 'жовток', 'білок яйця',
      'яйцо', 'яичница',
      'huevo', 'tortilla francesa',
      'egg', 'omelette', 'omelet', 'yolk'
    ],
    defaultSafeAlternative: 'Скрембл з тофу або чіа-пудинг'
  },
  seafood: {
    labelUk: 'Риба та Морепродукти',
    labelEn: 'Fish & Seafood',
    icon: '🐟',
    triggers: [
      'лосос', 'тунец', 'тунц', 'риб', 'креветк', 'міді', 'кальмар', 'форел', 'тріск', 'морепродукт', 'хек', 'скумбрі',
      'рыба', 'креветка', 'мидии', 'кальмары',
      'pescado', 'salmón', 'atún', 'marisco', 'gamba', 'merluza',
      'fish', 'salmon', 'tuna', 'shrimp', 'seafood', 'prawn', 'cod', 'squid'
    ],
    defaultSafeAlternative: 'Авокадо з кіноа та насінням льону (Омега-3)'
  },
  soy: {
    labelUk: 'Соя та похідні',
    labelEn: 'Soy & Soya',
    icon: '🌱',
    triggers: [
      'соя', 'соєв', 'тофу', 'темпе', 'едамаме',
      'соя', 'соевый', 'тофу',
      'soja', 'tofu', 'tempeh', 'edamame',
      'soy', 'soya', 'tofu', 'tempeh', 'edamame'
    ],
    defaultSafeAlternative: 'Нут, сочевиця або гороховий протеїн'
  }
};

export const MEAT_TRIGGERS: string[] = [
  'м\'яс', 'мяс', 'стейк', 'яловичин', 'курк', 'куряч', 'індичк', 'свинин', 'телятин', 'бекон', 'хамон', 'фарш', 'ковбас', 'сосиск',
  'куриц', 'индейк', 'говядин', 'свинин', 'ветчин',
  'carne', 'pollo', 'pavo', 'ternera', 'cerdo', 'jamón', 'bacon', 'salchicha',
  'meat', 'chicken', 'turkey', 'beef', 'pork', 'bacon', 'ham', 'sausage', 'steak'
];

/**
 * Перевірка тексту страви та її інгредієнтів на конфлікти з налаштуваннями користувача
 */
export function detectDietaryConflicts(
  dishName: string,
  ingredients: (string | { name: string })[] | undefined,
  userRestrictions: UserDietaryRestrictions | undefined
): AllergenConflict[] {
  if (!userRestrictions) return [];

  const conflicts: AllergenConflict[] = [];

  // Збираємо весь текст страви для аналізу
  const ingredientTexts = (ingredients || []).map((i) => (typeof i === 'string' ? i : i.name));
  const fullCorpus = [dishName, ...ingredientTexts].join(' ').toLowerCase();

  // 1. ПЕРЕВІРКА ТИПУ ДІЄТИ (Vegetarian, Vegan, Pescatarian)
  const diet = userRestrictions.dietType || 'standard';

  if (diet === 'vegetarian' || diet === 'vegan') {
    const meatTrigger = MEAT_TRIGGERS.find((trigger) => fullCorpus.includes(trigger));
    if (meatTrigger) {
      conflicts.push({
        type: 'diet',
        id: 'diet_meat',
        name: 'М\'ясо та птиця',
        triggerIngredient: meatTrigger,
        severity: 'danger',
        safeAlternativeSuggestion: 'Вегетаріанський стейк з тофу, сейтану або нутовий боул'
      });
    }
  }

  if (diet === 'vegan') {
    // Вегани не вживають рибу, яйця та молочні продукти
    const seafoodTrigger = ALLERGEN_META.seafood.triggers.find((t) => fullCorpus.includes(t));
    if (seafoodTrigger) {
      conflicts.push({
        type: 'diet',
        id: 'diet_seafood',
        name: 'Морепродукти (суперечить веганству)',
        triggerIngredient: seafoodTrigger,
        severity: 'danger',
        safeAlternativeSuggestion: 'Авокадо-боул або тофу з норі'
      });
    }

    const eggTrigger = ALLERGEN_META.eggs.triggers.find((t) => fullCorpus.includes(t));
    if (eggTrigger) {
      conflicts.push({
        type: 'diet',
        id: 'diet_eggs',
        name: 'Яйця (суперечить веганству)',
        triggerIngredient: eggTrigger,
        severity: 'danger',
        safeAlternativeSuggestion: 'Скрембл із тофу та шпинатом'
      });
    }

    const dairyTrigger = ALLERGEN_META.lactose.triggers.find((t) => fullCorpus.includes(t));
    if (dairyTrigger) {
      conflicts.push({
        type: 'diet',
        id: 'diet_dairy',
        name: 'Молочні продукти (суперечить веганству)',
        triggerIngredient: dairyTrigger,
        severity: 'danger',
        safeAlternativeSuggestion: 'Кокосовий або соєвий йогурт'
      });
    }
  }

  if (diet === 'pescatarian') {
    // Пескетаріанці їдять рибу, але не їдять наземне м'ясо/птицю
    const meatTrigger = MEAT_TRIGGERS.find((trigger) => fullCorpus.includes(trigger));
    if (meatTrigger) {
      conflicts.push({
        type: 'diet',
        id: 'diet_meat',
        name: 'М\'ясо (суперечить пескетаріанству)',
        triggerIngredient: meatTrigger,
        severity: 'danger',
        safeAlternativeSuggestion: 'Лосось су-від або тунець гриль'
      });
    }
  }

  // 2. ПЕРЕВІРКА СТАНДАРТНИХ АЛЕРГЕНІВ
  const activeAllergens = userRestrictions.allergens || [];
  activeAllergens.forEach((allergenKey) => {
    const meta = ALLERGEN_META[allergenKey];
    if (!meta) return;

    const matchedTrigger = meta.triggers.find((trigger) => fullCorpus.includes(trigger));
    if (matchedTrigger) {
      conflicts.push({
        type: 'allergen',
        id: allergenKey,
        name: meta.labelUk,
        triggerIngredient: matchedTrigger,
        severity: 'danger',
        safeAlternativeSuggestion: meta.defaultSafeAlternative
      });
    }
  });

  // 3. ПЕРЕВІРКА КАСТОМНИХ АЛЕРГІЙ КОРИСТУВАЧА (наприклад, "яблука", "мед")
  const customList = userRestrictions.customAllergies || [];
  customList.forEach((customItem) => {
    const trimmed = customItem.trim().toLowerCase();
    if (trimmed.length >= 2 && fullCorpus.includes(trimmed)) {
      conflicts.push({
        type: 'allergen',
        id: `custom_${trimmed}`,
        name: `Алергія: ${customItem}`,
        triggerIngredient: customItem,
        severity: 'danger',
        safeAlternativeSuggestion: `Виключіть ${customItem} або замініть на безпечний інгредієнт`
      });
    }
  });

  return conflicts;
}
