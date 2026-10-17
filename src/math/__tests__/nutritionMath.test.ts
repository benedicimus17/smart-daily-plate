import { describe, it, expect } from 'vitest';
import { calculateCookLoss } from '../cookLoss';
import { calculateWeeklyFlexBank } from '../weeklyFlex';
import { solveMacroGap } from '../macroGap';
import { calculateTrueFatTrend } from '../trueFatTrend';
import { RawIngredient } from '../../types/cookLoss';
import { FoodItem } from '../../types/nutrition';
import { DayBankStatus } from '../../types/weeklyFlex';

describe('1. Cook-Loss Engine', () => {
  it('коректно розраховує концентрацію КБЖВ при уварюванні (випаровуванні води)', () => {
    // Приклад: 1000 г сирого курячого філе уварюється до 750 г у каструлі вагою 500 г
    const ingredients: RawIngredient[] = [
      {
        id: '1',
        name: 'Куряче філе',
        rawWeightGrams: 1000,
        macrosPer100g: { calories: 110, protein: 23, fat: 1.5, carbs: 0 }
      }
    ];

    const result = calculateCookLoss({
      emptyPotWeightGrams: 500,
      potWithCookedDishWeightGrams: 1250, // 500 + 750 готового
      ingredients
    });

    expect(result.totalRawWeightGrams).toBe(1000);
    expect(result.cookedDishWeightGrams).toBe(750);
    expect(result.waterLossPercentage).toBe(25); // 25% води випарувалося

    // Загалом у сирому було: 1100 ккал, 230г білка
    expect(result.totalPotMacros.calories).toBe(1100);
    expect(result.totalPotMacros.protein).toBe(230);

    // У готовому на 100г: 1100 / 750 * 100 = ~147 ккал, білок = 230 / 750 * 100 = ~30.7г
    expect(result.cookedMacrosPer100g.calories).toBe(147);
    expect(result.cookedMacrosPer100g.protein).toBeCloseTo(30.7, 1);
  });

  it('викидає зрозумілу помилку, якщо вага готової каструлі менша або дорівнює вазі порожнього посуду', () => {
    expect(() => {
      calculateCookLoss({
        emptyPotWeightGrams: 800,
        potWithCookedDishWeightGrams: 800,
        ingredients: []
      });
    }).toThrow('Вага каструлі з готовою стравою має бути більшою за вагу сухого посуду');
  });
});

describe('2. Weekly Flex Bank', () => {
  it('коректно розраховує тижневий калорійний баланс та динамічно адаптує залишок днів', () => {
    const days: DayBankStatus[] = [
      { date: '2026-10-12', dayName: 'Пн', targetCalories: 2000, consumedCalories: 1900, balanceCalories: 0, isCompleted: true, isToday: false },
      { date: '2026-10-13', dayName: 'Вт', targetCalories: 2000, consumedCalories: 2200, balanceCalories: 0, isCompleted: true, isToday: false },
      { date: '2026-10-14', dayName: 'Ср', targetCalories: 2000, consumedCalories: 2000, balanceCalories: 0, isCompleted: true, isToday: false },
      { date: '2026-10-15', dayName: 'Чт', targetCalories: 2000, consumedCalories: 1800, balanceCalories: 0, isCompleted: true, isToday: false },
      { date: '2026-10-16', dayName: 'Пт', targetCalories: 2000, consumedCalories: 2000, balanceCalories: 0, isCompleted: false, isToday: true },
      { date: '2026-10-17', dayName: 'Сб', targetCalories: 2000, consumedCalories: 0, balanceCalories: 0, isCompleted: false, isToday: false },
      { date: '2026-10-18', dayName: 'Нд', targetCalories: 2000, consumedCalories: 0, balanceCalories: 0, isCompleted: false, isToday: false },
    ];

    const bank = calculateWeeklyFlexBank({
      weekStartDate: '2026-10-12',
      weekEndDate: '2026-10-18',
      dailyTargetCalories: 2000,
      days
    });

    expect(bank.weeklyTargetCalories).toBe(14000);
    // Спожито: 1900 + 2200 + 2000 + 1800 + 2000 = 9900
    expect(bank.weeklyConsumedCalories).toBe(9900);
    // Залишок на весь тиждень: 14000 - 9900 = 4100
    expect(bank.weeklyBalanceCalories).toBe(4100);
    // Залишилося 2 майбутніх дні (Сб, Нд): бюджет = 4100 / 2 = 2050 ккал/день
    expect(bank.adjustedDailyBudgetForRemainingDays).toBe(2050);
    expect(bank.bankHealthStatus).toBe('safe');
  });
});

describe('3. Macro-Gap Solver', () => {
  it('підбирає оптимальну порцію продукту під вечірній дефіцит білка', () => {
    const candidateFoods: FoodItem[] = [
      {
        id: 'cottage-cheese',
        name: 'Кисломолочний сир 5%',
        per100g: { calories: 121, protein: 17, fat: 5, carbs: 2 }
      },
      {
        id: 'egg-whites',
        name: 'Яєчні білки',
        per100g: { calories: 52, protein: 11, fat: 0.2, carbs: 0.7 }
      }
    ];

    const remainingMacros = { calories: 250, protein: 30, fat: 10, carbs: 20 };
    const suggestions = solveMacroGap(remainingMacros, candidateFoods);

    expect(suggestions.length).toBeGreaterThan(0);
    expect(suggestions[0].recommendedWeightGrams).toBeGreaterThan(100);
    expect(suggestions[0].resultingMacros.protein).toBeGreaterThan(20);
  });
});

describe('4. True Fat Trend (EMA α=0.1)', () => {
  it('згладжує раптові набряки та показує стабільний спадний тренд', () => {
    const entries = [
      { date: '2026-10-01', rawWeightKg: 80.0 },
      { date: '2026-10-02', rawWeightKg: 79.8 },
      { date: '2026-10-03', rawWeightKg: 81.2 }, // Різкий стрибок через затримку солі/води
      { date: '2026-10-04', rawWeightKg: 79.5 },
    ];

    const trend = calculateTrueFatTrend(entries, 0.1);

    expect(trend).toHaveLength(4);
    // На третій день при стрибку ваги до 81.2 кг EMA-тренд залишається згладженим (< 80.2 кг)
    expect(trend[2].rawWeightKg).toBe(81.2);
    expect(trend[2].emaWeightKg).toBeLessThan(80.2);
    // Дельта води показує набряк
    expect(trend[2].waterRetentionDeltaKg).toBeGreaterThan(1.0);
  });
});
