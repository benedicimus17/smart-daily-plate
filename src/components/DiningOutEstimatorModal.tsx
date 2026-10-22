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
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="bg-[#101612]/95 border border-[#233226] rounded-3xl w-full max-w-md p-6 relative shadow-[0_20px_50px_rgba(0,0,0,0.85)] max-h-[90vh] overflow-y-auto no-scrollbar"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Заголовок */}
        <div className="flex items-center justify-between pb-3 border-b border-[#233226]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-amber-500/15 text-amber-400 border border-amber-500/30 flex items-center justify-center">
              <Utensils className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">
                Dining Out Estimator
              </span>
              <h3 className="text-base font-bold text-zinc-100">Оцінка в ресторані без ваг</h3>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#18221B] hover:bg-[#223026] text-zinc-400 hover:text-zinc-200 border border-[#2A3B2E] flex items-center justify-center transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Вибір прийому їжі */}
        <div className="flex items-center justify-between mt-3 text-xs">
          <span className="font-semibold text-zinc-300">Записати в:</span>
          <div className="flex gap-1.5 bg-[#162019] p-1 rounded-xl border border-[#27392C] font-medium">
            {(['lunch', 'dinner', 'snack'] as MealType[]).map(t => (
              <button
                key={t}
                type="button"
                onClick={() => setTargetMeal(t)}
                className={`px-2.5 py-1 rounded-lg text-xs transition-all ${
                  targetMeal === t
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm font-bold'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                {t === 'lunch' ? 'Обід' : t === 'dinner' ? 'Вечеря' : 'Перекус'}
              </button>
            ))}
          </div>
        </div>

        {/* Перемикач режиму: Долоні чи Пресети */}
        <div className="grid grid-cols-2 gap-1.5 p-1 bg-[#162019] border border-[#27392C] rounded-2xl my-3 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveTab('hands')}
            className={`py-2 rounded-xl transition-all ${
              activeTab === 'hands'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm font-bold'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            ✋ Метод долоні
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('presets')}
            className={`py-2 rounded-xl transition-all ${
              activeTab === 'presets'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm font-bold'
                : 'text-zinc-400 hover:text-zinc-200'
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
                  className="p-3 rounded-2xl bg-[#162019] border border-[#27392C] flex items-center justify-between text-xs"
                >
                  <div className="pr-2">
                    <div className="font-bold text-zinc-100">{def.name}</div>
                    <div className="text-[11px] text-zinc-400 mt-0.5 leading-snug">{def.tip}</div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => decrement(type)}
                      className="w-7 h-7 rounded-lg bg-[#202D23] hover:bg-[#28392C] text-zinc-300 flex items-center justify-center active:scale-95 border border-[#2F4232]"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="w-5 text-center font-bold text-sm text-amber-300">{count}</span>
                    <button
                      type="button"
                      onClick={() => increment(type)}
                      className="w-7 h-7 rounded-lg bg-[#202D23] hover:bg-[#28392C] text-zinc-300 flex items-center justify-center active:scale-95 border border-[#2F4232]"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}

            {/* Підсумок тарілки */}
            <div className="p-4 rounded-3xl bg-[#18221B] border border-amber-500/30 mt-3 shadow-inner">
              <div className="flex justify-between items-center text-xs">
                <span className="text-amber-300 font-semibold flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Оцінка тарілки:
                </span>
                <span className="text-base font-extrabold text-amber-400">{totalMacros.calories} ккал</span>
              </div>
              <div className="text-[11px] font-medium text-zinc-300 mt-1">
                ~{totalWeightGrams}г • <span className="text-emerald-400">{totalMacros.protein}г Б</span> • <span className="text-amber-400">{totalMacros.fat}г Ж</span> • <span className="text-indigo-400">{totalMacros.carbs}г В</span>
              </div>

              <button
                type="button"
                onClick={handleAddHandPlate}
                disabled={totalMacros.calories <= 0}
                className="w-full mt-3 py-2.5 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 text-zinc-950 font-bold text-xs shadow-[0_0_20px_rgba(245,158,11,0.4)] hover:brightness-110 transition-all active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <CheckCircle2 className="w-4 h-4 text-zinc-950" /> Додати ресторанну порцію
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            {POPULAR_RESTAURANT_PRESETS.map((item) => (
              <div
                key={item.id}
                onClick={() => handleAddPreset(item)}
                className="p-3 rounded-2xl bg-[#162019] hover:bg-[#1C2820] border border-[#27392C] hover:border-amber-500/40 cursor-pointer transition-all flex items-center justify-between active:scale-[0.98]"
              >
                <div>
                  <div className="text-xs font-bold text-zinc-100">{item.name}</div>
                  <div className="text-[11px] text-zinc-400 mt-0.5">{item.description}</div>
                  <div className="text-[10px] font-semibold mt-1 flex gap-2">
                    <span className="text-emerald-400">{item.defaultMacros.protein}г Б</span>
                    <span className="text-amber-400">{item.defaultMacros.fat}г Ж</span>
                    <span className="text-indigo-400">{item.defaultMacros.carbs}г В</span>
                  </div>
                </div>

                <div className="text-right shrink-0 pl-2">
                  <span className="text-xs font-extrabold text-amber-300 block">
                    {item.defaultMacros.calories} ккал
                  </span>
                  <span className="text-[10px] text-zinc-400">~{item.estimatedWeightGrams}г</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
