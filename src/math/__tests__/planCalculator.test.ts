import { describe, it, expect } from 'vitest';
import { calculatePersonalPlan } from '../planCalculator';

describe('calculatePersonalPlan (Smart Plan Engine)', () => {
  it('correctly calculates maintenance and recommended safe deficit for female 70kg, 160cm', () => {
    const result = calculatePersonalPlan({
      gender: 'female',
      age: 29,
      weightKg: 70,
      heightCm: 160,
      activityLevel: 'moderate',
      goal: 'lose_weight',
      pace: 'fast'
    });

    // BMR = 10*70 + 6.25*160 - 5*29 - 161 = 700 + 1000 - 145 - 161 = 1394
    expect(result.bmr).toBe(1394);
    // Maintenance = 1394 * 1.55 = 2160.7 -> ~2160
    expect(result.maintenanceCalories).toBeGreaterThan(2000);
    // Deficit applied: -500
    expect(result.calorieDelta).toBe(-500);
    // 4 columns:
    expect(result.targets.calories).toBe(result.maintenanceCalories - 500);
    expect(result.targets.protein).toBeGreaterThanOrEqual(140);
    expect(result.targets.fat).toBeGreaterThanOrEqual(55);
    expect(result.targets.carbs).toBeGreaterThan(50);
    // Advice warning against fast crash diets
    expect(result.nutritionistAdvice.isWarning).toBe(true);
    expect(result.nutritionistAdvice.message).toContain('йо-йо');
  });

  it('calculates steady deficit without aggressive warning', () => {
    const result = calculatePersonalPlan({
      gender: 'male',
      age: 32,
      weightKg: 85,
      heightCm: 182,
      activityLevel: 'light',
      goal: 'lose_weight',
      pace: 'steady'
    });

    expect(result.calorieDelta).toBe(-400);
    expect(result.nutritionistAdvice.isWarning).toBe(false);
  });
});
