import { describe, it, expect } from 'vitest';
import { calculateHandPortionsMacros } from '../diningEstimator';

describe('Dining Out Estimator (Visual Hand Portions)', () => {
  it('коректно підраховує КБЖВ збалансованої ресторанної тарілки (1 долоня + 1 кулак + 1 жменя + 1 палець)', () => {
    const result = calculateHandPortionsMacros({
      palm: 1, // білок ~130г
      fist: 1, // вуглеводи ~160г
      cupped_hand: 1, // овочі ~120г
      thumb: 1, // жири ~15г
    });

    // Вага: 130 + 160 + 120 + 15 = 425г
    expect(result.totalWeightGrams).toBe(425);
    // Калорії: 165 + 190 + 50 + 120 = 525 ккал
    expect(result.totalMacros.calories).toBe(525);
    // Білки: 28 + 4.5 + 2 + 0 = 34.5г
    expect(result.totalMacros.protein).toBeCloseTo(34.5, 1);
    // Жири: 5 + 1.5 + 0.5 + 13 = 20г
    expect(result.totalMacros.fat).toBeCloseTo(20, 1);
    // Вуглеводи: 0 + 40 + 10 + 1 = 51г
    expect(result.totalMacros.carbs).toBeCloseTo(51, 1);
  });

  it('повертає нульові значення при порожньому наборі', () => {
    const result = calculateHandPortionsMacros({
      palm: 0,
      fist: 0,
      cupped_hand: 0,
      thumb: 0,
    });

    expect(result.totalWeightGrams).toBe(0);
    expect(result.totalMacros.calories).toBe(0);
  });
});
