import { UserBodyMetrics } from '../types/user';
import { MacroTargets } from '../types/nutrition';

export interface PlanCalculationResult {
  bmr: number;
  maintenanceCalories: number; // Наприклад 2500 ккал
  targetCalories: number;      // Наприклад 2000 ккал (-500 ккал)
  calorieDelta: number;        // -500
  targets: MacroTargets;
  nutritionistAdvice: {
    title: string;
    message: string;
    isWarning: boolean;
  };
}

/**
 * Детермінований розрахунок норми калорій та 4 колонок БЖУ
 * Формула Міффліна-Сан Жеора + захист від йо-йо ефекту
 */
export function calculatePersonalPlan(metrics: UserBodyMetrics): PlanCalculationResult {
  const { gender, age, weightKg, heightCm, activityLevel, goal, pace } = metrics;

  // 1. Базовий метаболізм (BMR)
  const baseBmr = 10 * weightKg + 6.25 * heightCm - 5 * age;
  const bmr = Math.round(gender === 'male' ? baseBmr + 5 : baseBmr - 161);

  // 2. Коефіцієнт активності (кроки + тренування)
  const activityMultipliers: Record<typeof activityLevel, number> = {
    sedentary: 1.2,   // До 5 000 кроків, без спорту
    light: 1.375,     // 6 000-8 000 кроків або 1-2 тренування
    moderate: 1.55,   // 9 000-12 000 кроків або 3-4 тренування
    high: 1.725       // 12 000+ кроків або щоденний спорт
  };
  const multiplier = activityMultipliers[activityLevel] || 1.375;
  const maintenanceCalories = Math.round((bmr * multiplier) / 10) * 10;

  // 3. Розрахунок дефіциту/профіциту та порада нутриціолога
  let calorieDelta = 0;
  let advice = {
    title: 'Збалансований план',
    message: 'Ваш раціон ідеально збалансований під щоденні витрати тіла.',
    isWarning: false
  };

  if (goal === 'lose_weight') {
    if (pace === 'fast') {
      // Користувач обрав схуднути швидко
      calorieDelta = -500; // Система м'яко спрямовує на здоровий максимум -500 ккал
      advice = {
        title: 'Порада нутриціолога проти йо-йо ефекту',
        message:
          'Краще не поспішати: ті, хто худне екстремально швидко, у 95% випадків повертають усю вагу назад (ефект йо-йо). Комп’ютер зафіксував норму підтримки ~' +
          maintenanceCalories +
          ' ккал і призначив безпечний дефіцит -500 ккал/день. Ви будете худнути стабільно, спалювати саме жир і не страждати від голоду.',
        isWarning: true
      };
    } else {
      // Поступове схуднення
      calorieDelta = -400;
      advice = {
        title: 'Золотий стандарт схуднення',
        message:
          'Комфортний дефіцит -400 ккал/день спалює ~0.4–0.5 кг чистого жиру на тиждень, захищає метаболізм і унеможливлює зриви.',
        isWarning: false
      };
    }
  } else if (goal === 'recomp') {
    calorieDelta = -250;
    advice = {
      title: 'Рельєф і тонус',
      message:
        'Мікро-дефіцит калорій у поєднанні з високим білком (160г+) дозволяє одночасно підсушити підшкірний жир і проявити рельєф м’язів.',
      isWarning: false
    };
  } else if (goal === 'maintain') {
    calorieDelta = 0;
    advice = {
      title: 'Підтримка форми',
      message: '100% покриття щоденних енерговитрат. Вага залишається стабільною день у день.',
      isWarning: false
    };
  } else if (goal === 'gain') {
    calorieDelta = 350;
    advice = {
      title: 'Якісний набір',
      message: 'Помірний профіцит +350 ккал для росту сухої м’язової тканини.',
      isWarning: false
    };
  }

  // Фізіологічний мінімум
  const minSafe = gender === 'female' ? Math.max(1350, bmr) : Math.max(1600, bmr);
  const targetCalories = Math.max(minSafe, maintenanceCalories + calorieDelta);

  // 4. Розподіл 4 колонок (Калорії, Протеїн, Жири, Вуглеводи)
  // Протеїн: для 70 кг жінки при схудненні/рельєфі ~140-160 г (2.0-2.3 г/кг)
  let proteinGrams = Math.round(weightKg * 2.0);
  if (goal === 'maintain') proteinGrams = Math.round(weightKg * 1.6);
  // Захист меж
  proteinGrams = Math.max(110, Math.min(220, proteinGrams));

  // Жири: мінімум 60-65 г для здорового гормонального фону
  const fatGrams = Math.max(55, Math.round(weightKg * 0.9));

  // Вуглеводи: решта калорій
  const proteinAndFatCals = proteinGrams * 4 + fatGrams * 9;
  const remainingCals = Math.max(200, targetCalories - proteinAndFatCals);
  const carbsGrams = Math.max(50, Math.round(remainingCals / 4));

  return {
    bmr,
    maintenanceCalories,
    targetCalories,
    calorieDelta,
    targets: {
      calories: targetCalories,
      protein: proteinGrams,
      fat: fatGrams,
      carbs: carbsGrams
    },
    nutritionistAdvice: advice
  };
}
