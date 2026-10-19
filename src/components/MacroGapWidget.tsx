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
    <div className="rounded-3xl p-4 my-3 bg-[#111713]/90 border border-[#212E24]/80 backdrop-blur-xl shadow-xl shadow-black/50 select-none">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shadow-inner">
            <Lightbulb className="w-4 h-4 text-emerald-400" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                Macro-Gap Solver
              </span>
              <span className="text-[9px] font-semibold text-emerald-300 bg-emerald-500/15 border border-emerald-500/30 px-1.5 py-0.5 rounded-full">
                {bestMatch.gapFitScore}% збіг
              </span>
            </div>
            <div className="text-xs font-semibold text-zinc-200 mt-0.5">
              Під залишок <span className="text-amber-400 font-bold">~{remainingMacros.calories} ккал</span>:
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
          className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-zinc-950 font-extrabold text-xs shadow-[0_0_12px_rgba(16,185,129,0.4)] flex items-center gap-1 transition-all active:scale-95"
        >
          <Plus className="w-3.5 h-3.5 stroke-[3]" /> Доїсти
        </button>
      </div>

      <div className="mt-2.5 pt-2 border-t border-[#1E2921] flex items-center justify-between text-xs">
        <span className="font-semibold text-zinc-200">
          🍽️ {bestMatch.foodItem.name} ({bestMatch.recommendedWeightGrams}г)
        </span>
        <span className="text-[11px] font-medium text-zinc-400">
          <strong className="text-emerald-400 font-bold">{bestMatch.resultingMacros.protein}г Б</strong> • {bestMatch.resultingMacros.calories} ккал
        </span>
      </div>
    </div>
  );
};
