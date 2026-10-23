import { describe, it, expect } from 'vitest';
import {
  generateSevenDayDogfoodingData,
  getMondayOfWeek,
  formatDateStr
} from '../dogfoodingSeeder';

describe('dogfoodingPersistence - 7-Day Personal Dogfooding Mode (Stage 5.5)', () => {
  it('correctly calculates the Monday of the current week', () => {
    const monday = getMondayOfWeek(new Date('2026-10-23')); // Friday
    expect(monday.getDay()).toBe(1); // Monday
    expect(formatDateStr(monday)).toBe('2026-10-19');
  });

  it('generates a full 7-day realistic cycle with meals and dates', () => {
    const targets = { calories: 2150, protein: 150, fat: 70, carbs: 230 };
    const result = generateSevenDayDogfoodingData(targets);

    expect(result.dates).toHaveLength(7);
    expect(Object.keys(result.historyLogs)).toHaveLength(7);

    // Перевірка що для кожного дня сформовано 4 слоти їжі
    result.dates.forEach((dateStr) => {
      const dayLog = result.historyLogs[dateStr];
      expect(dayLog).toBeDefined();
      expect(dayLog.meals.breakfast.entries.length).toBeGreaterThan(0);
      expect(dayLog.meals.lunch.entries.length).toBeGreaterThan(0);
      expect(dayLog.meals.snack.entries.length).toBeGreaterThan(0);
      expect(dayLog.meals.dinner.entries.length).toBeGreaterThan(0);
      expect(dayLog.waterMl).toBeGreaterThanOrEqual(1800);
    });
  });

  it('calculates Weekly Flex Bank with safe balance reserve', () => {
    const targets = { calories: 2150, protein: 145, fat: 65, carbs: 240 };
    const result = generateSevenDayDogfoodingData(targets);

    const bank = result.weeklyBank;
    expect(bank.weeklyTargetCalories).toBe(2150 * 7); // 15050 kcal
    expect(bank.weeklyConsumedCalories).toBeGreaterThan(0);
    expect(bank.days).toHaveLength(7);
    expect(bank.days[0].dayName).toBe('Пн');
    expect(bank.days[6].dayName).toBe('Нд');
    expect(bank.bankHealthStatus).toBe('safe');
  });

  it('preserves Cook-Loss meta in cooked meals across the week', () => {
    const result = generateSevenDayDogfoodingData();
    const mondayLog = result.historyLogs[result.dates[0]];

    const lunch = mondayLog.meals.lunch.entries[0];
    expect(lunch.isCookLoss).toBe(true);
    expect(lunch.rawWeightGrams).toBe(220);
    expect(lunch.cookedWeightGrams).toBe(165);

    const dinner = mondayLog.meals.dinner.entries[0];
    expect(dinner.isCookLoss).toBe(true);
    expect(dinner.rawWeightGrams).toBe(350);
    expect(dinner.cookedWeightGrams).toBe(260);
  });

  it('serializes and deserializes 7-day state without loss (Round-trip JSON)', () => {
    const result = generateSevenDayDogfoodingData();
    const jsonStr = JSON.stringify(result);

    const restored = JSON.parse(jsonStr);
    expect(restored.dates).toEqual(result.dates);
    expect(Object.keys(restored.historyLogs)).toEqual(Object.keys(result.historyLogs));
    expect(restored.weeklyBank.weeklyTargetCalories).toBe(result.weeklyBank.weeklyTargetCalories);
  });
});
