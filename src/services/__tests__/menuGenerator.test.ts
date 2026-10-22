import { describe, it, expect } from 'vitest';
import { generateDailyMealsForTargets } from '../menuGenerator';

describe('menuGenerator — Smart Target-Fulfilling Daily Menu Generator', () => {
  it('generates a 3-meal menu matching 100% of target calories and macros for 110 kg user', () => {
    const targets = {
      calories: 2150,
      protein: 220,
      fat: 85,
      carbs: 125
    };

    const meals = generateDailyMealsForTargets(targets, '3_meals');
    const allEntries = [...meals.breakfast.entries, ...meals.lunch.entries, ...meals.snack.entries, ...meals.dinner.entries];

    const sumCals = allEntries.reduce((sum, e) => sum + e.macros.calories, 0);
    const sumProt = allEntries.reduce((sum, e) => sum + e.macros.protein, 0);
    const sumFat = allEntries.reduce((sum, e) => sum + e.macros.fat, 0);
    const sumCarbs = allEntries.reduce((sum, e) => sum + e.macros.carbs, 0);

    expect(sumCals).toBe(2150);
    expect(sumProt).toBe(220);
    expect(sumFat).toBe(85);
    expect(sumCarbs).toBe(125);
    expect(meals.snack.entries.length).toBe(0);
  });

  it('generates a 4/5-meal menu matching 100% of target calories and macros for 60 kg user', () => {
    const targets = {
      calories: 1510,
      protein: 120,
      fat: 55,
      carbs: 134
    };

    const meals = generateDailyMealsForTargets(targets, '5_meals');
    const allEntries = [...meals.breakfast.entries, ...meals.lunch.entries, ...meals.snack.entries, ...meals.dinner.entries];

    const sumCals = allEntries.reduce((sum, e) => sum + e.macros.calories, 0);
    const sumProt = allEntries.reduce((sum, e) => sum + e.macros.protein, 0);
    const sumFat = allEntries.reduce((sum, e) => sum + e.macros.fat, 0);
    const sumCarbs = allEntries.reduce((sum, e) => sum + e.macros.carbs, 0);

    expect(sumCals).toBe(1510);
    expect(sumProt).toBe(120);
    expect(sumFat).toBe(55);
    expect(sumCarbs).toBe(134);
    expect(meals.snack.entries.length).toBe(1);
  });

  it('correctly populates Cook-Loss information for lunch and dinner', () => {
    const targets = { calories: 2000, protein: 160, fat: 70, carbs: 180 };
    const meals = generateDailyMealsForTargets(targets, '5_meals');

    const lunch = meals.lunch.entries[0];
    expect(lunch.isCookLoss).toBe(true);
    expect(lunch.rawWeightGrams).toBeGreaterThan(lunch.cookedWeightGrams!);

    const dinner = meals.dinner.entries[0];
    expect(dinner.isCookLoss).toBe(true);
    expect(dinner.rawWeightGrams).toBeGreaterThan(dinner.cookedWeightGrams!);
  });
});
