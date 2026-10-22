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

  // 1. Молочне та яйця (перевіряємо перед курячим м'ясом, щоб 'курячі яйця' були в молочному)
  if (
    lower.includes('яйц') ||
    lower.includes('яєць') ||
    lower.includes('йогурт') ||
    lower.includes('сир') ||
    lower.includes('молок') ||
    lower.includes('масло вершков') ||
    lower.includes('масло') && !lower.includes('олі') ||
    lower.includes('кефір') ||
    lower.includes('творог') ||
    lower.includes('фета') ||
    lower.includes('пармезан') ||
    lower.includes('моцарел') ||
    lower.includes('сметан')
  ) {
    return 'dairy';
  }

  // 2. М'ясо та риба
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
    lower.includes('біг мак')
  ) {
    return 'meat_fish';
  }

  // 3. Овочі, зелень та фрукти
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
    lower.includes('картопл')
  ) {
    return 'produce';
  }

  // 4. Бакалія, крупи, горіхи та випічка
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
    lower.includes('батончик')
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
export function generateShareableGroceryText(items: GroceryItem[]): string {
  const unboughtItems = items.filter(i => !i.isBought);
  const boughtItems = items.filter(i => i.isBought);

  let text = '🛒 NUTRIQ — СПИСОК ПОКУПОК ДЛЯ СУПЕРМАРКЕТУ\n';
  text += `Всього позицій: ${items.length} (Залишилося купити: ${unboughtItems.length})\n\n`;

  GROCERY_CATEGORIES.forEach(cat => {
    const catItems = items.filter(i => i.category === cat.key);
    if (catItems.length === 0) return;

    text += `${cat.icon} ${cat.label.toUpperCase()}:\n`;
    catItems.forEach(item => {
      const checkbox = item.isBought ? '✅' : '⬜';
      const cookLossBadge = item.rawWeightGrams ? ` [Сира вага ~${item.rawWeightGrams}г]` : '';
      text += `${checkbox} ${item.name} — ${item.amount}${cookLossBadge}\n`;
      if (item.note && !item.isBought) {
        text += `   ↳ ${item.note}\n`;
      }
    });
    text += '\n';
  });

  if (boughtItems.length > 0) {
    text += `Куплено: ${boughtItems.length} з ${items.length} товарів.\n`;
  }
  text += 'Сформовано в NUTRIQ Intelligent Nutrition 🌿';

  return text;
}
