import { DayBankStatus, WeeklyFlexBank } from '../types/weeklyFlex';

export interface WeeklyCalculationInput {
  weekStartDate: string;
  weekEndDate: string;
  dailyTargetCalories: number;
  days: DayBankStatus[];
}

/**
 * Детермінований розрахунок тижневого калорійного банку (Weekly Flex Bank)
 * Динамічно коригує калорійний ліміт на залишок тижня для зняття психологічного стресу від переїдання
 * Включає клінічний анти-йо-йо шлюз (Anti-Starvation Clamp не нижче 1200 ккал)
 */
export function calculateWeeklyFlexBank(input: WeeklyCalculationInput): WeeklyFlexBank {
  const { weekStartDate, weekEndDate, dailyTargetCalories, days } = input;

  if (days.length !== 7) {
    throw new Error('Тижневий банк вимагає статусів рівно для 7 днів тижня');
  }

  const weeklyTargetCalories = dailyTargetCalories * 7;
  let weeklyConsumedCalories = 0;
  let remainingFutureDaysCount = 0;

  const evaluatedDays: DayBankStatus[] = days.map((day) => {
    const balanceCalories = day.targetCalories - day.consumedCalories;
    if (day.isCompleted || day.isToday) {
      weeklyConsumedCalories += day.consumedCalories;
    } else {
      remainingFutureDaysCount++;
    }

    return {
      ...day,
      balanceCalories,
    };
  });

  const weeklyBalanceCalories = weeklyTargetCalories - weeklyConsumedCalories;

  // Динамічний перерозподіл на залишок днів тижня
  let adjustedDailyBudgetForRemainingDays = dailyTargetCalories;

  if (remainingFutureDaysCount > 0) {
    const remainingCaloriesBudget = Math.max(0, weeklyTargetCalories - weeklyConsumedCalories);
    const rawAdjusted = Math.round(remainingCaloriesBudget / remainingFutureDaysCount);
    // Анти-йо-йо захист: заборона небезпечного голодування нижче 1200 ккал
    const safeFloor = Math.max(1200, dailyTargetCalories - 450);
    const safeCeil = dailyTargetCalories + 450;
    adjustedDailyBudgetForRemainingDays = Math.max(safeFloor, Math.min(safeCeil, rawAdjusted));
  } else {
    adjustedDailyBudgetForRemainingDays = Math.round(weeklyTargetCalories / 7);
  }

  let bankHealthStatus: 'safe' | 'warning' | 'deficit' = 'safe';
  const averageDailyRemaining =
    remainingFutureDaysCount > 0
      ? (weeklyTargetCalories - weeklyConsumedCalories) / remainingFutureDaysCount
      : dailyTargetCalories;

  if (weeklyBalanceCalories < 0 || averageDailyRemaining < dailyTargetCalories - 350) {
    bankHealthStatus = 'deficit';
  } else if (averageDailyRemaining < dailyTargetCalories - 100) {
    bankHealthStatus = 'warning';
  }

  return {
    weekStartDate,
    weekEndDate,
    weeklyTargetCalories,
    weeklyConsumedCalories,
    weeklyBalanceCalories,
    days: evaluatedDays,
    adjustedDailyBudgetForRemainingDays,
    bankHealthStatus,
  };
}
