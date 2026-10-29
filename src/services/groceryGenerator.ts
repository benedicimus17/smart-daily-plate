/**
 * Smart Daily Plate (NUTRIQ) — Сервіс генерації та агрегації списку покупок
 * Автоматично обчислює сиру вагу для покупок з урахуванням Cook-Loss (уварки/ужарки)
 */

import { MealEntry } from '../types/nutrition';
import { GroceryItem, GroceryCategory, GROCERY_CATEGORIES } from '../types/grocery';

/**
 * Визначення категорії відділу супермаркету за ключовими словами
 */
export function detectGroceryCategory(name: string): GroceryCategory {
  const lower = name.toLowerCase();

  // 1. Молочне та яйця (Lácteos y Huevos / Dairy & Eggs)
  if (
    lower.includes('яйц') ||
    lower.includes('яєць') ||
    lower.includes('йогурт') ||
    lower.includes('сир') ||
    lower.includes('молок') ||
    lower.includes('масло вершков') ||
    (lower.includes('масло') && !lower.includes('олі')) ||
    lower.includes('кефір') ||
    lower.includes('творог') ||
    lower.includes('фета') ||
    lower.includes('пармезан') ||
    lower.includes('моцарел') ||
    lower.includes('сметан') ||
    // Spanish
    lower.includes('huevo') ||
    lower.includes('huevos') ||
    lower.includes('leche') ||
    lower.includes('yogur') ||
    lower.includes('queso') ||
    lower.includes('mantequilla') ||
    lower.includes('kéfir') ||
    lower.includes('requesón') ||
    lower.includes('cuajada') ||
    lower.includes('nata') ||
    // English
    lower.includes('egg') ||
    lower.includes('milk') ||
    lower.includes('yogurt') ||
    lower.includes('cheese') ||
    lower.includes('butter') ||
    lower.includes('cottage') ||
    lower.includes('cream')
  ) {
    return 'dairy';
  }

  // 2. М'ясо та риба (Carnicería y Pescadería / Meat & Seafood)
  if (
    lower.includes("м'яс") ||
    lower.includes('стейк') ||
    lower.includes('яловичин') ||
    lower.includes('курк') ||
    lower.includes('куряч') ||
    lower.includes('філе') ||
    lower.includes('лосос') ||
    lower.includes('тунец') ||
    lower.includes('тунц') ||
    lower.includes('риба') ||
    lower.includes('фарш') ||
    lower.includes('індич') ||
    lower.includes('креветк') ||
    lower.includes('свинин') ||
    lower.includes('бекон') ||
    lower.includes('котлет') ||
    lower.includes('бургер') ||
    lower.includes('біг мак') ||
    // Spanish
    lower.includes('carne') ||
    lower.includes('pollo') ||
    lower.includes('pechuga') ||
    lower.includes('ternera') ||
    lower.includes('vacuno') ||
    lower.includes('lomo') ||
    lower.includes('salmón') ||
    lower.includes('salmon') ||
    lower.includes('atún') ||
    lower.includes('atun') ||
    lower.includes('pescado') ||
    lower.includes('merluza') ||
    lower.includes('jamón') ||
    lower.includes('jamon') ||
    lower.includes('pavo') ||
    lower.includes('gamba') ||
    lower.includes('langostino') ||
    lower.includes('cerdo') ||
    lower.includes('bacon') ||
    lower.includes('chuletón') ||
    lower.includes('chuleton') ||
    lower.includes('solomillo') ||
    lower.includes('hamburguesa') ||
    // English
    lower.includes('meat') ||
    lower.includes('chicken') ||
    lower.includes('beef') ||
    lower.includes('steak') ||
    lower.includes('salmon') ||
    lower.includes('tuna') ||
    lower.includes('fish') ||
    lower.includes('turkey') ||
    lower.includes('shrimp') ||
    lower.includes('pork') ||
    lower.includes('patty')
  ) {
    return 'meat_fish';
  }

  // 3. Овочі, зелень та фрукти (Frutas y Verduras / Produce & Greens)
  if (
    lower.includes('авокадо') ||
    lower.includes('шпинат') ||
    lower.includes('спарж') ||
    lower.includes('брокол') ||
    lower.includes('томат') ||
    lower.includes('помідор') ||
    lower.includes('огірок') ||
    lower.includes('ягод') ||
    lower.includes('чорниц') ||
    lower.includes('лохин') ||
    lower.includes('малин') ||
    lower.includes('полуниц') ||
    lower.includes('банан') ||
    lower.includes('яблук') ||
    lower.includes('салат') ||
    lower.includes('зелень') ||
    lower.includes('лимон') ||
    lower.includes('цибул') ||
    lower.includes('моркв') ||
    lower.includes('гриб') ||
    lower.includes('капуст') ||
    lower.includes('перець') ||
    lower.includes('батат') ||
    lower.includes('картопл') ||
    // Spanish
    lower.includes('aguacate') ||
    lower.includes('espinaca') ||
    lower.includes('espárrago') ||
    lower.includes('esparrago') ||
    lower.includes('brócoli') ||
    lower.includes('brocoli') ||
    lower.includes('tomate') ||
    lower.includes('pepino') ||
    lower.includes('arándano') ||
    lower.includes('arandano') ||
    lower.includes('fresa') ||
    lower.includes('frambuesa') ||
    lower.includes('plátano') ||
    lower.includes('platano') ||
    lower.includes('manzana') ||
    lower.includes('ensalada') ||
    lower.includes('lechuga') ||
    lower.includes('limón') ||
    lower.includes('limon') ||
    lower.includes('cebolla') ||
    lower.includes('zanahoria') ||
    lower.includes('seta') ||
    lower.includes('champiñón') ||
    lower.includes('champiñon') ||
    lower.includes('col') ||
    lower.includes('pimiento') ||
    lower.includes('patata') ||
    lower.includes('perejil') ||
    // English
    lower.includes('avocado') ||
    lower.includes('spinach') ||
    lower.includes('asparagus') ||
    lower.includes('broccoli') ||
    lower.includes('tomato') ||
    lower.includes('cucumber') ||
    lower.includes('berry') ||
    lower.includes('blueberry') ||
    lower.includes('strawberry') ||
    lower.includes('raspberry') ||
    lower.includes('banana') ||
    lower.includes('apple') ||
    lower.includes('salad') ||
    lower.includes('greens') ||
    lower.includes('lettuce') ||
    lower.includes('lemon') ||
    lower.includes('onion') ||
    lower.includes('carrot') ||
    lower.includes('mushroom') ||
    lower.includes('cabbage') ||
    lower.includes('pepper') ||
    lower.includes('potato')
  ) {
    return 'produce';
  }

  // 4. Бакалія, крупи, горіхи та випічка (Despensa y Granos / Pantry & Grains)
  if (
    lower.includes('кіноа') ||
    lower.includes('гречк') ||
    lower.includes('вівсян') ||
    lower.includes('пластівц') ||
    lower.includes('хліб') ||
    lower.includes('тост') ||
    lower.includes('рис') ||
    lower.includes('макарон') ||
    lower.includes('паста') ||
    lower.includes('горіх') ||
    lower.includes('мигдал') ||
    lower.includes('олія') ||
    lower.includes('джем') ||
    lower.includes('мед') ||
    lower.includes('протеїн') ||
    lower.includes('круасан') ||
    lower.includes('снек') ||
    lower.includes('батончик') ||
    // Spanish
    lower.includes('quinoa') ||
    lower.includes('quinua') ||
    lower.includes('arroz') ||
    lower.includes('avena') ||
    lower.includes('copos') ||
    lower.includes('pan') ||
    lower.includes('tostada') ||
    lower.includes('pasta') ||
    lower.includes('macarr') ||
    lower.includes('nuez') ||
    lower.includes('nueces') ||
    lower.includes('almendra') ||
    lower.includes('aceite') ||
    lower.includes('aove') ||
    lower.includes('mermelada') ||
    lower.includes('miel') ||
    lower.includes('proteína') ||
    lower.includes('proteina') ||
    lower.includes('croissant') ||
    lower.includes('barrita') ||
    // English
    lower.includes('rice') ||
    lower.includes('oat') ||
    lower.includes('bread') ||
    lower.includes('toast') ||
    lower.includes('noodles') ||
    lower.includes('nuts') ||
    lower.includes('almond') ||
    lower.includes('oil') ||
    lower.includes('jam') ||
    lower.includes('honey') ||
    lower.includes('protein') ||
    lower.includes('snack') ||
    lower.includes('bar')
  ) {
    return 'staples';
  }

  return 'other';
}

export function getCategoryLabel(category: GroceryCategory): string {
  const cat = GROCERY_CATEGORIES.find(c => c.key === category);
  return cat ? cat.label : 'Інше';
}

/**
 * Еталонний початковий список покупок за макетом NUTRIQ
 */
export const DEFAULT_GROCERY_ITEMS: GroceryItem[] = [
  {
    id: 'g-1',
    name: 'Філе куряче свіже',
    category: 'meat_fish',
    categoryLabel: "М'ясо та риба",
    amount: '~800 г',
    note: 'Для обідів на 3 дні (облік уварки -25%)',
    isBought: false,
    source: 'auto_menu',
    rawWeightGrams: 800,
    cookLossPercentage: 25
  },
  {
    id: 'g-2',
    name: 'Свіжий лосось (філе)',
    category: 'meat_fish',
    categoryLabel: "М'ясо та риба",
    amount: '330 г',
    note: 'Для боулу з кіноа (Обід)',
    isBought: true,
    source: 'auto_menu'
  },
  {
    id: 'g-3',
    name: 'Стейк яловичий (Рибай)',
    category: 'meat_fish',
    categoryLabel: "М'ясо та риба",
    amount: '~750 г',
    note: 'Вечеря (облік Cook-loss уварки -26%)',
    isBought: false,
    source: 'auto_menu',
    rawWeightGrams: 750,
    cookLossPercentage: 26
  },
  {
    id: 'g-4',
    name: 'Яйця курячі (кат. C0/M)',
    category: 'dairy',
    categoryLabel: 'Молочне та яйця',
    amount: '1 десяток',
    note: 'Ранкові омлети та тости',
    isBought: false,
    source: 'auto_menu'
  },
  {
    id: 'g-5',
    name: 'Грецький йогурт 0-2%',
    category: 'dairy',
    categoryLabel: 'Молочне та яйця',
    amount: '~900 г',
    note: 'Щоденні перекуси та десерти',
    isBought: false,
    source: 'auto_menu'
  },
  {
    id: 'g-6',
    name: 'Сир Cottage (зернистий)',
    category: 'dairy',
    categoryLabel: 'Молочне та яйця',
    amount: '400 г',
    note: 'Для ранкового білкового тосту',
    isBought: false,
    source: 'auto_menu'
  },
  {
    id: 'g-7',
    name: 'Свіжа спаржа',
    category: 'produce',
    categoryLabel: 'Овочі та зелень',
    amount: '350 г',
    note: 'Гарнір до стейку',
    isBought: false,
    source: 'auto_menu'
  },
  {
    id: 'g-8',
    name: 'Авокадо Хаас стигле',
    category: 'produce',
    categoryLabel: 'Овочі та зелень',
    amount: '3 шт',
    note: 'Корисні моно-жири',
    isBought: false,
    source: 'auto_menu'
  },
  {
    id: 'g-9',
    name: 'Свіжа лохина (чорниця)',
    category: 'produce',
    categoryLabel: 'Овочі та зелень',
    amount: '250 г',
    note: 'До вівсянки та йогурту',
    isBought: true,
    source: 'auto_menu'
  },
  {
    id: 'g-10',
    name: 'Вівсяні пластівці цільнозернові',
    category: 'staples',
    categoryLabel: 'Бакалія та крупи',
    amount: '500 г',
    note: 'Складні вуглеводи на сніданки',
    isBought: false,
    source: 'auto_menu'
  },
  {
    id: 'g-11',
    name: 'Кіноа біле / триколірне',
    category: 'staples',
    categoryLabel: 'Бакалія та крупи',
    amount: '300 г',
    note: "Гарнір до риби та м'яса",
    isBought: false,
    source: 'auto_menu'
  }
];

export function getDefaultGroceryItems(lang: string = 'es'): GroceryItem[] {
  if (lang === 'es') {
    return [
      {
        id: 'g-1',
        name: 'Pechuga de pollo fresca',
        category: 'meat_fish',
        categoryLabel: 'Carnicería y Pescado',
        amount: '~800 g',
        note: 'Para almuerzos de 3 días (mermas cocción -25%)',
        isBought: false,
        source: 'auto_menu',
        rawWeightGrams: 800,
        cookLossPercentage: 25
      },
      {
        id: 'g-2',
        name: 'Salmón fresco (lomos)',
        category: 'meat_fish',
        categoryLabel: 'Carnicería y Pescado',
        amount: '330 g',
        note: 'Para bowl de quinoa (Almuerzo)',
        isBought: true,
        source: 'auto_menu'
      },
      {
        id: 'g-3',
        name: 'Chuletón / Entrecot de ternera',
        category: 'meat_fish',
        categoryLabel: 'Carnicería y Pescado',
        amount: '~750 g',
        note: 'Cena (mermas Cook-Loss -26%)',
        isBought: false,
        source: 'auto_menu',
        rawWeightGrams: 750,
        cookLossPercentage: 26
      },
      {
        id: 'g-4',
        name: 'Huevos camperos (clase L/M)',
        category: 'dairy',
        categoryLabel: 'Lácteos y Huevos',
        amount: '1 docena',
        note: 'Desayunos, tortillas y tostadas',
        isBought: false,
        source: 'auto_menu'
      },
      {
        id: 'g-5',
        name: 'Yogur griego natural 0-2%',
        category: 'dairy',
        categoryLabel: 'Lácteos y Huevos',
        amount: '~900 g',
        note: 'Meriendas diarias y postres',
        isBought: false,
        source: 'auto_menu'
      },
      {
        id: 'g-6',
        name: 'Queso Cottage / Requesón',
        category: 'dairy',
        categoryLabel: 'Lácteos y Huevos',
        amount: '400 g',
        note: 'Para tostada matutina proteica',
        isBought: false,
        source: 'auto_menu'
      },
      {
        id: 'g-7',
        name: 'Espárragos verdes frescos',
        category: 'produce',
        categoryLabel: 'Frutas y Verduras',
        amount: '350 g',
        note: 'Guarnición para carne o pescado',
        isBought: false,
        source: 'auto_menu'
      },
      {
        id: 'g-8',
        name: 'Aguacates Hass maduros',
        category: 'produce',
        categoryLabel: 'Frutas y Verduras',
        amount: '3 uds',
        note: 'Grasas monoinsaturadas saludables',
        isBought: false,
        source: 'auto_menu'
      },
      {
        id: 'g-9',
        name: 'Arándanos frescos',
        category: 'produce',
        categoryLabel: 'Frutas y Verduras',
        amount: '250 g',
        note: 'Para avena y yogur griego',
        isBought: true,
        source: 'auto_menu'
      },
      {
        id: 'g-10',
        name: 'Copos de avena integrales',
        category: 'staples',
        categoryLabel: 'Despensa y Granos',
        amount: '500 g',
        note: 'Carbohidratos complejos para desayunos',
        isBought: false,
        source: 'auto_menu'
      },
      {
        id: 'g-11',
        name: 'Quinoa blanca o tricolor',
        category: 'staples',
        categoryLabel: 'Despensa y Granos',
        amount: '300 g',
        note: 'Guarnición de absorción lenta',
        isBought: false,
        source: 'auto_menu'
      }
    ];
  }

  if (lang === 'en') {
    return [
      {
        id: 'g-1',
        name: 'Fresh chicken breast fillet',
        category: 'meat_fish',
        categoryLabel: 'Meat & Seafood',
        amount: '~800 g',
        note: 'For 3-day meal prep (cook-loss -25%)',
        isBought: false,
        source: 'auto_menu',
        rawWeightGrams: 800,
        cookLossPercentage: 25
      },
      {
        id: 'g-2',
        name: 'Fresh salmon fillets',
        category: 'meat_fish',
        categoryLabel: 'Meat & Seafood',
        amount: '330 g',
        note: 'For quinoa lunch bowl',
        isBought: true,
        source: 'auto_menu'
      },
      {
        id: 'g-3',
        name: 'Beef ribeye steak',
        category: 'meat_fish',
        categoryLabel: 'Meat & Seafood',
        amount: '~750 g',
        note: 'Dinner (cook-loss factor -26%)',
        isBought: false,
        source: 'auto_menu',
        rawWeightGrams: 750,
        cookLossPercentage: 26
      },
      {
        id: 'g-4',
        name: 'Free-range eggs (L/M)',
        category: 'dairy',
        categoryLabel: 'Dairy & Eggs',
        amount: '1 dozen',
        note: 'Morning scrambles and toasts',
        isBought: false,
        source: 'auto_menu'
      },
      {
        id: 'g-5',
        name: 'Greek yogurt 0-2%',
        category: 'dairy',
        categoryLabel: 'Dairy & Eggs',
        amount: '~900 g',
        note: 'Daily snacks and desserts',
        isBought: false,
        source: 'auto_menu'
      },
      {
        id: 'g-6',
        name: 'Cottage cheese (curd)',
        category: 'dairy',
        categoryLabel: 'Dairy & Eggs',
        amount: '400 g',
        note: 'For high-protein breakfast toast',
        isBought: false,
        source: 'auto_menu'
      },
      {
        id: 'g-7',
        name: 'Fresh green asparagus',
        category: 'produce',
        categoryLabel: 'Produce & Greens',
        amount: '350 g',
        note: 'Side dish for steak or fish',
        isBought: false,
        source: 'auto_menu'
      },
      {
        id: 'g-8',
        name: 'Ripe Hass avocados',
        category: 'produce',
        categoryLabel: 'Produce & Greens',
        amount: '3 pcs',
        note: 'Healthy mono-fats',
        isBought: false,
        source: 'auto_menu'
      },
      {
        id: 'g-9',
        name: 'Fresh blueberries',
        category: 'produce',
        categoryLabel: 'Produce & Greens',
        amount: '250 g',
        note: 'For oatmeal and yogurt bowls',
        isBought: true,
        source: 'auto_menu'
      },
      {
        id: 'g-10',
        name: 'Whole rolled oats',
        category: 'staples',
        categoryLabel: 'Pantry & Grains',
        amount: '500 g',
        note: 'Slow-digesting complex carbs',
        isBought: false,
        source: 'auto_menu'
      },
      {
        id: 'g-11',
        name: 'White / tricolor quinoa',
        category: 'staples',
        categoryLabel: 'Pantry & Grains',
        amount: '300 g',
        note: 'Clean carb base for meals',
        isBought: false,
        source: 'auto_menu'
      }
    ];
  }

  return DEFAULT_GROCERY_ITEMS;
}

/**
 * Автоматична агрегація інгредієнтів з масиву запланованих страв
 */
export function generateGroceryListFromMeals(meals: MealEntry[]): GroceryItem[] {
  if (!meals || meals.length === 0) {
    return DEFAULT_GROCERY_ITEMS;
  }

  const itemsMap: Map<string, {
    name: string;
    category: GroceryCategory;
    totalAmountGrams: number;
    countUnits: number;
    notes: Set<string>;
    rawWeightGrams?: number;
    cookLossPercentage?: number;
  }> = new Map();

  meals.forEach(meal => {
    // 1. Якщо страва має Cook-loss, фіксуємо сиру вагу для магазину
    if (meal.isCookLoss && meal.rawWeightGrams) {
      const key = meal.foodId || meal.name.toLowerCase();
      const existing = itemsMap.get(key);
      const cookLossPct = meal.cookedWeightGrams && meal.rawWeightGrams > meal.cookedWeightGrams
        ? Math.round(((meal.rawWeightGrams - meal.cookedWeightGrams) / meal.rawWeightGrams) * 100)
        : 25;

      if (existing) {
        existing.rawWeightGrams = (existing.rawWeightGrams || 0) + meal.rawWeightGrams;
        existing.totalAmountGrams += meal.rawWeightGrams;
        existing.notes.add(`Сира вага для приготування (уварка -${cookLossPct}%)`);
      } else {
        itemsMap.set(key, {
          name: meal.name.replace(/\(.*\)/g, '').trim(),
          category: detectGroceryCategory(meal.name),
          totalAmountGrams: meal.rawWeightGrams,
          countUnits: 1,
          notes: new Set([`Сира вага для покупки (уварка -${cookLossPct}%)`]),
          rawWeightGrams: meal.rawWeightGrams,
          cookLossPercentage: cookLossPct
        });
      }
      return;
    }

    // 2. Якщо є recipeDetails, розбираємо детальні інгредієнти
    if (meal.recipeDetails) {
      const parts = meal.recipeDetails.split(/[,;\n]+/).map(p => p.trim()).filter(Boolean);
      parts.forEach(part => {
        // Пропускаємо позначки стрілок уварки
        if (part.includes('➔') || part.includes('Cook-Loss')) return;

        // Витягуємо грами або штуки
        const gramsMatch = part.match(/(\d+)\s*г/i);
        const unitsMatch = part.match(/(\d+)\s*шт/i);

        const cleanName = part
          .replace(/\d+\s*(г|гр|грам|шт|мл)/gi, '')
          .replace(/[()]/g, '')
          .trim();

        if (cleanName.length < 2) return;

        const cat = detectGroceryCategory(cleanName);
        const key = cleanName.toLowerCase();
        const existing = itemsMap.get(key);

        const grams = gramsMatch ? parseInt(gramsMatch[1], 10) : 0;
        const units = unitsMatch ? parseInt(unitsMatch[1], 10) : 0;

        if (existing) {
          existing.totalAmountGrams += grams;
          existing.countUnits += units;
          existing.notes.add(`До страви: ${meal.name}`);
        } else {
          itemsMap.set(key, {
            name: cleanName.charAt(0).toUpperCase() + cleanName.slice(1),
            category: cat,
            totalAmountGrams: grams,
            countUnits: units,
            notes: new Set([`До страви: ${meal.name}`])
          });
        }
      });
      return;
    }

    // 3. Якщо recipeDetails немає, беремо саму страву
    const key = meal.name.toLowerCase();
    const cat = detectGroceryCategory(meal.name);
    const existing = itemsMap.get(key);

    if (existing) {
      existing.totalAmountGrams += meal.weightGrams;
      existing.countUnits += 1;
    } else {
      itemsMap.set(key, {
        name: meal.name,
        category: cat,
        totalAmountGrams: meal.weightGrams,
        countUnits: 1,
        notes: new Set(['Заплановано в меню'])
      });
    }
  });

  const result: GroceryItem[] = [];
  let index = 1;

  itemsMap.forEach((val) => {
    let amountStr = '';
    if (val.rawWeightGrams) {
      amountStr = `~${val.rawWeightGrams} г (сире)`;
    } else if (val.totalAmountGrams > 0 && val.countUnits > 0) {
      amountStr = `${val.countUnits} шт (~${val.totalAmountGrams} г)`;
    } else if (val.countUnits > 0) {
      amountStr = val.countUnits >= 10 ? `${Math.ceil(val.countUnits / 10)} дес.` : `${val.countUnits} шт`;
    } else if (val.totalAmountGrams > 0) {
      amountStr = val.totalAmountGrams >= 1000
        ? `${(val.totalAmountGrams / 1000).toFixed(1)} кг`
        : `~${val.totalAmountGrams} г`;
    } else {
      amountStr = '1 уп / порція';
    }

    result.push({
      id: `auto-item-${index++}`,
      name: val.name,
      category: val.category,
      categoryLabel: getCategoryLabel(val.category),
      amount: amountStr,
      note: Array.from(val.notes).slice(0, 2).join('. '),
      isBought: false,
      source: 'auto_menu',
      rawWeightGrams: val.rawWeightGrams,
      cookLossPercentage: val.cookLossPercentage
    });
  });

  return result.length > 0 ? result : DEFAULT_GROCERY_ITEMS;
}

/**
 * Форматування списку для копіювання в месенджери (Telegram, Viber, WhatsApp)
 */
export function generateShareableGroceryText(items: GroceryItem[], lang: string = 'uk'): string {
  const isEs = lang === 'es';
  const isEn = lang === 'en';

  const title = isEs
    ? '🛒 NUTRIQ — LISTA DE LA COMPRA PARA EL SUPERMERCADO'
    : isEn
    ? '🛒 NUTRIQ — GROCERY SHOPPING LIST'
    : '🛒 NUTRIQ — СПИСОК ПОКУПОК ДЛЯ СУПЕРМАРКЕТУ';

  const unboughtItems = items.filter(i => !i.isBought);
  const boughtItems = items.filter(i => i.isBought);

  const stats = isEs
    ? `Total artículos: ${items.length} (Por comprar: ${unboughtItems.length})`
    : isEn
    ? `Total items: ${items.length} (To buy: ${unboughtItems.length})`
    : `Всього позицій: ${items.length} (Залишилося купити: ${unboughtItems.length})`;

  let text = `${title}\n${stats}\n\n`;

  const categoryNames: Record<GroceryCategory, { es: string; en: string; uk: string }> = {
    meat_fish: { es: 'CARNICERÍA Y PESCADO', en: 'MEAT & SEAFOOD', uk: "М'ЯСО ТА РИБА" },
    dairy: { es: 'LÁCTEOS Y HUEVOS', en: 'DAIRY & EGGS', uk: 'МОЛОЧНЕ ТА ЯЙЦЯ' },
    produce: { es: 'FRUTAS Y VERDURAS', en: 'PRODUCE & GREENS', uk: 'ОВОЧІ ТА ЗЕЛЕНЬ' },
    staples: { es: 'DESPENSA Y GRANOS', en: 'PANTRY & GRAINS', uk: 'БАКАЛІЯ ТА КРУПИ' },
    other: { es: 'OTROS Y BEBIDAS', en: 'OTHER & DRINKS', uk: 'ІНШЕ ТА НАПОЇ' }
  };

  GROCERY_CATEGORIES.forEach(cat => {
    const catItems = items.filter(i => i.category === cat.key);
    if (catItems.length === 0) return;

    const catTitle = isEs ? categoryNames[cat.key]?.es : isEn ? categoryNames[cat.key]?.en : categoryNames[cat.key]?.uk;
    text += `${cat.icon} ${catTitle || cat.label.toUpperCase()}:\n`;
    catItems.forEach(item => {
      const checkbox = item.isBought ? '✅' : '⬜';
      const cookLossBadge = item.rawWeightGrams
        ? isEs
          ? ` [Peso crudo ~${item.rawWeightGrams}g]`
          : isEn
          ? ` [Raw weight ~${item.rawWeightGrams}g]`
          : ` [Сира вага ~${item.rawWeightGrams}г]`
        : '';
      text += `${checkbox} ${item.name} — ${item.amount}${cookLossBadge}\n`;
      if (item.note && !item.isBought) {
        text += `   ↳ ${item.note}\n`;
      }
    });
    text += '\n';
  });

  if (boughtItems.length > 0) {
    text += isEs
      ? `Comprados: ${boughtItems.length} de ${items.length} artículos.\n`
      : isEn
      ? `Purchased: ${boughtItems.length} of ${items.length} items.\n`
      : `Куплено: ${boughtItems.length} з ${items.length} товарів.\n`;
  }
  text += isEs
    ? 'Generado en NUTRIQ Intelligent Nutrition 🌿'
    : isEn
    ? 'Generated by NUTRIQ Intelligent Nutrition 🌿'
    : 'Сформовано в NUTRIQ Intelligent Nutrition 🌿';

  return text;
}
