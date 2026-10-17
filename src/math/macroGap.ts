import { FoodItem, Macros } from '../types/nutrition';

export interface MacroGapSuggestion {
  foodItem: FoodItem;
  recommendedWeightGrams: number;
  resultingMacros: Macros;
  gapFitScore: number; // 0..100 (чим вище, тим точніше закриває прогалину)
  reasoning: string;
}

export function solveMacroGap(
  remaining: Macros,
  candidateFoods: FoodItem[]
): MacroGapSuggestion[] {
  if (remaining.calories <= 0) {
    return [];
  }

  const suggestions: MacroGapSuggestion[] = [];

  for (const food of candidateFoods) {
    if (food.per100g.calories <= 0) continue;

    // Якщо потрібен переважно білок
    let targetWeight = 100;
    if (remaining.protein > 10 && food.per100g.protein > 10) {
      targetWeight = Math.round((remaining.protein / food.per100g.protein) * 100);
    } else {
      targetWeight = Math.round((remaining.calories / food.per100g.calories) * 100);
    }

    // Обмеження розумної ваги порції (від 30г до 400г)
    targetWeight = Math.max(30, Math.min(400, targetWeight));

    const ratio = targetWeight / 100;
    const resultingMacros: Macros = {
      calories: Math.round(food.per100g.calories * ratio),
      protein: Math.round(food.per100g.protein * ratio * 10) / 10,
      fat: Math.round(food.per100g.fat * ratio * 10) / 10,
      carbs: Math.round(food.per100g.carbs * ratio * 10) / 10,
    };

    // Оцінка відповідності ліміту калорій та білка
    const calDelta = Math.abs(remaining.calories - resultingMacros.calories);
    const proteinDelta = Math.abs(remaining.protein - resultingMacros.protein);
    
    // Чим менше відхилення, тим вищий бал
    const score = Math.max(0, 100 - (calDelta * 0.15) - (proteinDelta * 1.5));

    suggestions.push({
      foodItem: food,
      recommendedWeightGrams: targetWeight,
      resultingMacros,
      gapFitScore: Math.round(score),
      reasoning: `Порція ${targetWeight}г покриває ~${resultingMacros.protein}г білка з ${resultingMacros.calories} ккал`
    });
  }

  return suggestions.sort((a, b) => b.gapFitScore - a.gapFitScore);
}
