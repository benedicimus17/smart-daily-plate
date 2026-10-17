import React, { useState } from 'react';
import { MealType, Macros } from '../types/nutrition';
import {
  HAND_PORTION_DEFINITIONS,
  POPULAR_RESTAURANT_PRESETS,
  calculateHandPortionsMacros
} from '../math/diningEstimator';
import { HandPortionType, DiningRestaurantPreset } from '../types/dining';
import { Utensils, X, Plus, Minus, Sparkles, CheckCircle2 } from 'lucide-react';

interface DiningOutEstimatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddMeal: (mealType: MealType, data: { name: string; weightGrams: number; macros: Macros }) => void;
}

export const DiningOutEstimatorModal: React.FC<DiningOutEstimatorModalProps> = ({
  isOpen,
  onClose,
  onAddMeal
}) => {
  if (!isOpen) return null;

  const [activeTab, setActiveTab] = useState<'hands' | 'presets'>('hands');
  const [targetMeal, setTargetMeal] = useState<MealType>('dinner');
  const [portions, setPortions] = useState<Record<HandPortionType, number>>({
    palm: 1,
    fist: 1,
    cupped_hand: 1,
    thumb: 1
  });

  const { totalMacros, totalWeightGrams } = calculateHandPortionsMacros(portions);

  const increment = (type: HandPortionType) => {
    setPortions(prev => ({ ...prev, [type]: prev[type] + 1 }));
  };

  const decrement = (type: HandPortionType) => {
    setPortions(prev => ({ ...prev, [type]: Math.max(0, prev[type] - 1) }));
  };

  const handleAddHandPlate = () => {
    if (totalMacros.calories <= 0) return;
    onAddMeal(targetMeal, {
      name: 'Ресторанна тарілка (оцінка за долонями)',
      weightGrams: totalWeightGrams,
      macros: totalMacros
    });
    onClose();
  };

  const handleAddPreset = (preset: DiningRestaurantPreset) => {
    onAddMeal(targetMeal, {
      name: `${preset.name} (ресторан)`,
      weightGrams: preset.estimatedWeightGrams,
      macros: preset.defaultMacros
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fadeIn">
      <div className="glass-card rounded-4xl w-full max-w-md p-6 relative border border-white shadow-2xl max-h-[90vh] overflow-y-auto no-scrollbar">
        {/* Заголовок */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-brand-amber/15 text-brand-amber flex items-center justify-center">
              <Utensils className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700">
                Dining Out Estimator
              </span>
              <h3 className="text-base font-bold text-slate-800">Оцінка в ресторані без ваг</h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Вибір прийому їжі */}
        <div className="flex items-center justify-between mt-3 text-xs">
          <span className="font-semibold text-slate-600">Записати в:</span>
          <div className="flex gap-1.5 bg-slate-100 p-1 rounded-xl font-medium">
            {(['lunch', 'dinner', 'snack'] as MealType[]).map(t => (
              <button
                key={t}
                type="button"
                onClick={() => setTargetMeal(t)}
                className={`px-2.5 py-1 rounded-lg text-xs transition-all ${
                  targetMeal === t ? 'bg-white text-slate-800 shadow-sm font-bold' : 'text-slate-400'
                }`}
              >
                {t === 'lunch' ? 'Обід' : t === 'dinner' ? 'Вечеря' : 'Перекус'}
              </button>
            ))}
          </div>
        </div>

        {/* Перемикач режиму: Долоні чи Пресети */}
        <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-100 rounded-2xl my-3 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveTab('hands')}
            className={`py-2 rounded-xl transition-all ${
              activeTab === 'hands' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-400'
            }`}
          >
            ✋ Метод долоні
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('presets')}
            className={`py-2 rounded-xl transition-all ${
              activeTab === 'presets' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-400'
            }`}
          >
            🍽️ Популярні страви
          </button>
        </div>

        {activeTab === 'hands' ? (
          <div className="space-y-2.5">
            {(Object.keys(HAND_PORTION_DEFINITIONS) as HandPortionType[]).map((type) => {
              const def = HAND_PORTION_DEFINITIONS[type];
              const count = portions[type];
              return (
                <div
                  key={type}
                  className="p-3 rounded-2xl bg-white/70 border border-slate-100 flex items-center justify-between text-xs"
                >
                  <div className="pr-2">
                    <div className="font-bold text-slate-800">{def.name}</div>
                    <div className="text-[11px] text-slate-400 mt-0.5 leading-snug">{def.tip}</div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => decrement(type)}
                      className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center active:scale-95"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="w-5 text-center font-bold text-sm text-slate-850">{count}</span>
                    <button
                      type="button"
                      onClick={() => increment(type)}
                      className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center active:scale-95"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}

            {/* Підсумок тарілки */}
            <div className="p-4 rounded-3xl bg-amber-50/70 border border-amber-200/60 mt-3">
              <div className="flex justify-between items-center text-xs">
                <span className="text-amber-900 font-semibold flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-brand-amber" /> Оцінка тарілки:
                </span>
                <span className="text-base font-extrabold text-amber-900">{totalMacros.calories} ккал</span>
              </div>
              <div className="text-[11px] font-medium text-amber-800 mt-1">
                ~{totalWeightGrams}г • {totalMacros.protein}г Б • {totalMacros.fat}г Ж • {totalMacros.carbs}г В
              </div>

              <button
                type="button"
                onClick={handleAddHandPlate}
                disabled={totalMacros.calories <= 0}
                className="w-full mt-3 py-2.5 rounded-2xl bg-brand-amber text-white font-bold text-xs shadow-glow-amber hover:bg-amber-600 transition-all active:scale-95 flex items-center justify-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" /> Додати ресторанну порцію
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            {POPULAR_RESTAURANT_PRESETS.map((item) => (
              <div
                key={item.id}
                onClick={() => handleAddPreset(item)}
                className="p-3 rounded-2xl bg-white/70 hover:bg-white border border-slate-100 cursor-pointer transition-all flex items-center justify-between active:scale-[0.98]"
              >
                <div>
                  <div className="text-xs font-bold text-slate-800">{item.name}</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">{item.description}</div>
                  <div className="text-[10px] text-brand-emerald font-semibold mt-1">
                    {item.defaultMacros.protein}г Б • {item.defaultMacros.fat}г Ж • {item.defaultMacros.carbs}г В
                  </div>
                </div>

                <div className="text-right shrink-0 pl-2">
                  <span className="text-xs font-extrabold text-brand-amber block">
                    {item.defaultMacros.calories} ккал
                  </span>
                  <span className="text-[10px] text-slate-400">~{item.estimatedWeightGrams}г</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
