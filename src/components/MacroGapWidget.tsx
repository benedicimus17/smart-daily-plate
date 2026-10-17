import React from 'react';
import { solveMacroGap } from '../math/macroGap';
import { FoodItem, Macros } from '../types/nutrition';
import { Lightbulb, Plus } from 'lucide-react';

interface MacroGapWidgetProps {
  remainingMacros: Macros;
  onAddSuggestion: (foodName: string, weightGrams: number, macros: Macros) => void;
}

const sampleCatalog: FoodItem[] = [
  {
    id: 'cottage-cheese',
    name: 'Кисломолочний сир 5%',
    per100g: { calories: 121, protein: 17, fat: 5, carbs: 2 }
  },
  {
    id: 'chicken-breast',
    name: 'Куряче філе запечене',
    per100g: { calories: 145, protein: 30, fat: 2.5, carbs: 0 }
  },
  {
    id: 'greek-yogurt',
    name: 'Грецький йогурт 2%',
    per100g: { calories: 73, protein: 10, fat: 2, carbs: 4 }
  },
  {
    id: 'eggs',
    name: 'Яйця варені',
    per100g: { calories: 143, protein: 12.6, fat: 9.5, carbs: 0.7 }
  }
];

export const MacroGapWidget: React.FC<MacroGapWidgetProps> = ({
  remainingMacros,
  onAddSuggestion
}) => {
  if (remainingMacros.calories < 120) return null;

  const suggestions = solveMacroGap(remainingMacros, sampleCatalog);
  const bestMatch = suggestions[0];

  if (!bestMatch) return null;

  return (
    <div className="glass-card-interactive rounded-3xl p-4 my-3 border border-emerald-100/80 bg-gradient-to-r from-white/90 to-emerald-50/50">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-brand-emerald/15 text-brand-emerald flex items-center justify-center">
            <Lightbulb className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800">
                Macro-Gap Solver
              </span>
              <span className="text-[9px] font-semibold text-emerald-600 bg-emerald-100/60 px-1.5 py-0.5 rounded-full">
                {bestMatch.gapFitScore}% збіг
              </span>
            </div>
            <div className="text-xs font-semibold text-slate-800 mt-0.5">
              Під залишок <span className="text-brand-emerald font-bold">~{remainingMacros.calories} ккал</span>:
            </div>
          </div>
        </div>

        <button
          onClick={() =>
            onAddSuggestion(
              bestMatch.foodItem.name,
              bestMatch.recommendedWeightGrams,
              bestMatch.resultingMacros
            )
          }
          className="px-2.5 py-1.5 rounded-xl bg-brand-emerald hover:bg-emerald-600 text-white text-xs font-bold shadow-glow-emerald flex items-center gap-1 transition-all active:scale-95"
        >
          <Plus className="w-3.5 h-3.5" /> Доїсти
        </button>
      </div>

      <div className="mt-2.5 pt-2 border-t border-slate-100/80 flex items-center justify-between text-xs text-slate-600">
        <span className="font-medium text-slate-800">
          🍽️ {bestMatch.foodItem.name} ({bestMatch.recommendedWeightGrams}г)
        </span>
        <span className="text-[11px] font-semibold text-slate-500">
          {bestMatch.resultingMacros.protein}г Б • {bestMatch.resultingMacros.calories} ккал
        </span>
      </div>
    </div>
  );
};
