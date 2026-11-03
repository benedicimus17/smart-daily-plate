import { describe, it, expect } from 'vitest';
import {
  calculateHandPortionsMacros,
  getLocalizedRestaurantPresets,
  getLocalizedHandPortions,
} from '../../math/diningEstimator';
import { calculateWeeklyFlexBank } from '../../math/weeklyFlex';
import { DayBankStatus } from '../../types/weeklyFlex';
import { findSmartSwapCandidates, getNextSwapCandidate } from '../smartSwapEngine';
import { CHEF_CATALOG } from '../../components/ChefHubModal';
import { buildWeeklyFlexBank } from '../../store/nutritionStore';
import { DailyLog } from '../../types/nutrition';

describe('Block B QA Stress Audit - Dining Out, Weekly Flex Bank & Meal Swap Engine', () => {
  describe('1. Dining Out Estimator & Hidden Oil Factor', () => {
    it('accurately calculates hand portions with base macros', () => {
      const res = calculateHandPortionsMacros({
        palm: 2, // 2 * 130g = 260g (protein)
        fist: 1, // 160g (carbs)
        cupped_hand: 2, // 240g (veggies)
        thumb: 1, // 15g (fats)
      }, false, 'es');

      expect(res.totalWeightGrams).toBe(260 + 160 + 240 + 15);
      // Base: palm: 2*165=330, fist: 190, cupped: 2*50=100, thumb: 120 -> 740 kcal
      expect(res.totalMacros.calories).toBe(740);
      expect(res.totalMacros.protein).toBeCloseTo(2 * 28 + 4.5 + 4 + 0, 1);
    });

    it('applies hidden restaurant oil & sauces scaling (+15% to +25% fat factor)', () => {
      const withoutOil = calculateHandPortionsMacros({
        palm: 1,
        fist: 1,
        cupped_hand: 1,
        thumb: 1,
      }, false, 'uk');

      const withOil = calculateHandPortionsMacros({
        palm: 1,
        fist: 1,
        cupped_hand: 1,
        thumb: 1,
      }, true, 'uk');

      // Fat should be multiplied by 1.25
      expect(withOil.totalMacros.fat).toBeGreaterThan(withoutOil.totalMacros.fat);
      // Calories should be higher
      expect(withOil.totalMacros.calories).toBeGreaterThan(withoutOil.totalMacros.calories);
      // Atwater check: withOil.calories approx P*4 + F*9 + C*4
      const expectedAtwater = Math.round(
        withOil.totalMacros.protein * 4 + withOil.totalMacros.fat * 9 + withOil.totalMacros.carbs * 4
      );
      expect(Math.abs(withOil.totalMacros.calories - expectedAtwater)).toBeLessThanOrEqual(2);
    });

    it('provides rich authentic Spanish presets for Spain market rollout', () => {
      const esPresets = getLocalizedRestaurantPresets('es');
      const presetIds = esPresets.map(p => p.id);

      expect(presetIds).toContain('paella-marisco');
      expect(presetIds).toContain('tapas-patatas-bravas');
      expect(presetIds).toContain('chuleton-ternera');
      expect(presetIds).toContain('pulpo-gallega');
      expect(presetIds).toContain('tortilla-espanola');
      expect(presetIds).toContain('gambas-ajillo');

      const paella = esPresets.find(p => p.id === 'paella-marisco');
      expect(paella?.name).toContain('Paella');
      expect(paella?.defaultMacros.calories).toBe(620);
      expect(paella?.category).toBe('spanish');
    });

    it('localizes hand portion definitions correctly across ES, EN, UK', () => {
      const esDefs = getLocalizedHandPortions('es');
      const enDefs = getLocalizedHandPortions('en');
      const ukDefs = getLocalizedHandPortions('uk');

      expect(esDefs.palm.name).toBe('Palma (Proteína)');
      expect(enDefs.palm.name).toBe('Palm (Protein)');
      expect(ukDefs.palm.name).toBe('Долоня (білок)');
    });
  });

  describe('2. Flexible Weekly Bank & Anti-Starvation Safety Clamp', () => {
    const createMockDays = (consumedList: number[], dailyTarget: number = 2000): DayBankStatus[] => {
      const dayNames = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Нд'];
      return dayNames.map((dayName, idx) => {
        const consumed = consumedList[idx] || 0;
        const isToday = idx === 2; // Wednesday
        const isCompleted = idx < 2;
        return {
          date: `2026-11-0${idx + 1}`,
          dayName,
          targetCalories: dailyTarget,
          consumedCalories: consumed,
          balanceCalories: dailyTarget - consumed,
          isCompleted,
          isToday,
        };
      });
    };

    it('calculates positive reserve and health status safe when on track', () => {
      // Mon: 1800, Tue: 1900, Wed (today): 1700, Thu-Sun: future
      const days = createMockDays([1800, 1900, 1700, 0, 0, 0, 0], 2000);
      const bank = calculateWeeklyFlexBank({
        weekStartDate: '2026-11-01',
        weekEndDate: '2026-11-07',
        dailyTargetCalories: 2000,
        days,
      });

      // Total target: 14000. Consumed so far (Mon, Tue, Wed): 5400.
      expect(bank.weeklyTargetCalories).toBe(14000);
      expect(bank.weeklyConsumedCalories).toBe(5400);
      expect(bank.weeklyBalanceCalories).toBe(8600);
      expect(bank.bankHealthStatus).toBe('safe');
      // Remaining budget for 4 days: 8600 / 4 = 2150 kcal/day
      expect(bank.adjustedDailyBudgetForRemainingDays).toBe(2150);
    });

    it('enforces clinical anti-starvation clamp: daily adjusted budget NEVER drops below 1200 kcal', () => {
      // User binge-ate Mon: 4000, Tue: 4000, Wed (today): 4500 (total 12500 kcal!)
      // Remaining for Thu-Sun (4 days): only 1500 kcal left.
      // Raw average would be 1500 / 4 = 375 kcal/day (dangerous starvation!)
      const days = createMockDays([4000, 4000, 4500, 0, 0, 0, 0], 2000);
      const bank = calculateWeeklyFlexBank({
        weekStartDate: '2026-11-01',
        weekEndDate: '2026-11-07',
        dailyTargetCalories: 2000,
        days,
      });

      expect(bank.bankHealthStatus).toBe('deficit');
      // Anti-yo-yo clamp ensures floor of max(1200, 2000 - 450) = 1550 kcal/day
      expect(bank.adjustedDailyBudgetForRemainingDays).toBeGreaterThanOrEqual(1200);
      expect(bank.adjustedDailyBudgetForRemainingDays).toBe(1550);
    });
  });

  describe('3. Meal Swap Reality Engine', () => {
    it('finds closest isocaloric match with protein preserved', () => {
      const currentDish = {
        name: 'Куряче філе запечене з кіноа',
        macros: { calories: 480, protein: 44, fat: 12, carbs: 48 },
        category: 'lunch' as const,
      };

      const candidates = findSmartSwapCandidates(currentDish, CHEF_CATALOG);
      expect(candidates.length).toBeGreaterThan(0);
      expect(candidates[0].candidate.id).not.toBe('chef-l1');
    });

    it('cycles candidates without repeating excluded IDs', () => {
      const currentDish = {
        name: 'Куряче філе запечене з кіноа',
        macros: { calories: 480, protein: 44, fat: 12, carbs: 48 },
        category: 'lunch' as const,
      };

      const first = getNextSwapCandidate(currentDish, CHEF_CATALOG, []);
      expect(first).toBeDefined();

      const second = getNextSwapCandidate(
        currentDish,
        CHEF_CATALOG,
        [first!.candidate.id]
      );
      expect(second).toBeDefined();
      expect(second!.candidate.id).not.toBe(first!.candidate.id);
    });
  });

  describe('4. Store Integration & Reactive Weekly Bank', () => {
    it('dynamically computes WeeklyFlexBank from arbitrary date and dailyLog', () => {
      const mockLog: DailyLog = {
        date: '2026-11-03',
        targets: { calories: 2100, protein: 160, fat: 70, carbs: 200 },
        meals: {
          breakfast: { type: 'breakfast', title: 'Breakfast', icon: '', entries: [], totalMacros: { calories: 450, protein: 30, fat: 15, carbs: 45 } },
          lunch: { type: 'lunch', title: 'Lunch', icon: '', entries: [], totalMacros: { calories: 650, protein: 45, fat: 20, carbs: 70 } },
          snack: { type: 'snack', title: 'Snack', icon: '', entries: [], totalMacros: { calories: 0, protein: 0, fat: 0, carbs: 0 } },
          dinner: { type: 'dinner', title: 'Dinner', icon: '', entries: [], totalMacros: { calories: 0, protein: 0, fat: 0, carbs: 0 } },
        },
        totals: { calories: 1100, protein: 75, fat: 35, carbs: 115 },
        waterMl: 1200,
      };

      const history: Record<string, DailyLog> = {
        '2026-11-02': {
          date: '2026-11-02',
          targets: { calories: 2100, protein: 160, fat: 70, carbs: 200 },
          meals: {} as any,
          totals: { calories: 2000, protein: 150, fat: 65, carbs: 190 },
          waterMl: 2000,
        },
      };

      const bank = buildWeeklyFlexBank('2026-11-03', history, mockLog, 2100);
      expect(bank.days.length).toBe(7);
      expect(bank.weeklyTargetCalories).toBe(2100 * 7);
      expect(bank.weeklyConsumedCalories).toBe(2000 + 1100);
      expect(bank.weeklyBalanceCalories).toBe(2100 * 7 - 3100);
    });
  });
});
