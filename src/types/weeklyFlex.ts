/**
 * Модель тижневого калорійного банку (Weekly Flex Bank)
 * Захист від почуття провини при переїданні через динамічний тижневий розподіл
 */

export interface DayBankStatus {
  date: string; // YYYY-MM-DD
  dayName: string; // 'Пн', 'Вт', тощо
  targetCalories: number;
  consumedCalories: number;
  /** Дельта: target - consumed (>0 запас, <0 перевитрата) */
  balanceCalories: number;
  isCompleted: boolean;
  isToday: boolean;
}

export interface WeeklyFlexBank {
  weekStartDate: string; // Понеділок тижня
  weekEndDate: string; // Неділя
  weeklyTargetCalories: number;
  weeklyConsumedCalories: number;
  /** Залишок тижневого ліміту */
  weeklyBalanceCalories: number;
  /** Статус по днях тижня (7 днів) */
  days: DayBankStatus[];
  /** Рекомендована скоригована норма на залишок днів тижня */
  adjustedDailyBudgetForRemainingDays: number;
  /** Рівень стресу/безпеки банку: 'safe' (в межах норми), 'warning' (близько до ліміту), 'deficit' (перевитрата) */
  bankHealthStatus: 'safe' | 'warning' | 'deficit';
}
