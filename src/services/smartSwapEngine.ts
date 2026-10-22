/**
 * Smart Daily Plate (NUTRIQ) — ШІ-Двигун миттєвої ізокалорійної заміни страви (Smart Swap Engine)
 * Знаходить страви-еквіваленти за 2 секунди зі збереженням калоражу та норми білка
 */

import { MealType } from '../types/nutrition';
import { ChefDishItem } from '../components/ChefHubModal';

export interface SmartSwapResult {
  candidate: ChefDishItem;
  calorieDelta: number; // Наприклад: +10 ккал
  proteinDelta: number; // Наприклад: -2 г
  matchScore: number;   // 0 (ідеальний) до 100
  matchReason: string;  // Коротке роз'яснення нутриціолога
}

/**
 * Пошук списку страв-кандидатів для швидкої заміни
 */
export function findSmartSwapCandidates(
  currentMeal: {
    name: string;
    macros: { calories: number; protein: number; fat: number; carbs: number };
    category?: MealType;
  },
  availableDishes: ChefDishItem[],
  excludeIds: string[] = []
): SmartSwapResult[] {
  const targetCalories = currentMeal.macros.calories;
  const targetProtein = currentMeal.macros.protein;

  const candidates: SmartSwapResult[] = [];

  availableDishes.forEach(dish => {
    // 1. Виключаємо поточну страву та раніше відхилені
    if (dish.name.toLowerCase() === currentMeal.name.toLowerCase()) return;
    if (excludeIds.includes(dish.id)) return;

    // 2. Якщо задана категорія прийому їжі, віддаємо пріоритет спорідненим прийомам
    if (currentMeal.category) {
      if (currentMeal.category === 'breakfast' && dish.category !== 'breakfast') return;
      if (currentMeal.category === 'snack' && dish.category !== 'snack') return;
      if ((currentMeal.category === 'lunch' || currentMeal.category === 'dinner') &&
          dish.category !== 'lunch' && dish.category !== 'dinner') {
        return;
      }
    }

    const calDelta = dish.macros.calories - targetCalories;
    const absCalDelta = Math.abs(calDelta);
    const protDelta = dish.macros.protein - targetProtein;
    const absProtDelta = Math.abs(protDelta);

    // Допустимий коридор: калорії ±20%, білок ±12 г
    const maxAllowedCalDelta = Math.max(80, targetCalories * 0.22);
    if (absCalDelta > maxAllowedCalDelta) return;
    if (absProtDelta > 14) return;

    // Оцінка відповідності (Score): чим менше, тим точніший збіг
    const calScore = (absCalDelta / Math.max(targetCalories, 1)) * 50;
    const protScore = (absProtDelta / Math.max(targetProtein, 1)) * 50;
    const totalScore = Math.round(calScore + protScore);

    let reason = 'Ідеальний макро-баланс';
    if (absProtDelta <= 2 && absCalDelta <= 20) {
      reason = '1:1 точний макро-збіг за білком та енергією';
    } else if (protDelta >= 0) {
      reason = `Зберігає норму білка (+${protDelta.toFixed(0)}г) при близькій калорійності`;
    } else {
      reason = `Близький аналог за калоріями (${calDelta >= 0 ? `+${calDelta}` : calDelta} ккал)`;
    }

    candidates.push({
      candidate: dish,
      calorieDelta: calDelta,
      proteinDelta: protDelta,
      matchScore: totalScore,
      matchReason: reason
    });
  });

  // Сортуємо від найкращого збігу до менш точного
  return candidates.sort((a, b) => a.matchScore - b.matchScore);
}

/**
 * Отримання наступного кандидата (ротація "Замінити знов")
 */
export function getNextSwapCandidate(
  currentMeal: {
    name: string;
    macros: { calories: number; protein: number; fat: number; carbs: number };
    category?: MealType;
  },
  availableDishes: ChefDishItem[],
  previouslySeenIds: string[] = []
): SmartSwapResult | null {
  const candidates = findSmartSwapCandidates(currentMeal, availableDishes, previouslySeenIds);
  return candidates.length > 0 ? candidates[0] : null;
}
