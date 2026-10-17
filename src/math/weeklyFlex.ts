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
 */
export function calculateWeeklyFlexBank(input: WeeklyCalculationInput): WeeklyFlexBank {
  const { weekStartDate, weekEndDate, dailyTargetCalories, days } = input;

  if (days.length !== 7) {
    throw new Error('Тижневий банк вимагає статусів рівно для 7 днів тижня');
  }

  const weeklyTargetCalories = dailyTargetCalories * 7;
  let weeklyConsumedCalories = 0;
  let completedOrTodayDaysCount = 0;
  let remainingFutureDaysCount = 0;

  const evaluatedDays: DayBankStatus[] = days.map((day) => {
    const balanceCalories = day.targetCalories - day.consumedCalories;
    if (day.isCompleted || day.isToday) {
      weeklyConsumedCalories += day.consumedCalories;
      completedOrTodayDaysCount++;
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
    adjustedDailyBudgetForRemainingDays = Math.round(remainingCaloriesBudget / remainingFutureDaysCount);
  } else {
    adjustedDailyBudgetForRemainingDays = Math.round(weeklyTargetCalories / 7);
  }

  let bankHealthStatus: 'safe' | 'warning' | 'deficit' = 'safe';
  if (weeklyBalanceCalories < -500) {
    bankHealthStatus = 'deficit';
  } else if (weeklyBalanceCalories < 0) {
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
