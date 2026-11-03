import React, { useState } from 'react';
import { MealType, Macros } from '../types/nutrition';
import {
  getLocalizedHandPortions,
  getLocalizedRestaurantPresets,
  calculateHandPortionsMacros
} from '../math/diningEstimator';
import { HandPortionType, DiningRestaurantPreset } from '../types/dining';
import { Utensils, X, Plus, Minus, Sparkles, CheckCircle2, Flame } from 'lucide-react';
import { useTranslation } from '../store/languageStore';

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
  const { t, lang } = useTranslation();

  const [activeTab, setActiveTab] = useState<'hands' | 'presets'>('hands');
  const [targetMeal, setTargetMeal] = useState<MealType>('dinner');
  const [addHiddenOil, setAddHiddenOil] = useState<boolean>(true);
  const [portions, setPortions] = useState<Record<HandPortionType, number>>({
    palm: 1,
    fist: 1,
    cupped_hand: 1,
    thumb: 1
  });

  const localizedDefs = getLocalizedHandPortions(lang);
  const localizedPresets = getLocalizedRestaurantPresets(lang);

  const { totalMacros, totalWeightGrams } = calculateHandPortionsMacros(portions, addHiddenOil, lang);

  const increment = (type: HandPortionType) => {
    setPortions(prev => ({ ...prev, [type]: prev[type] + 1 }));
  };

  const decrement = (type: HandPortionType) => {
    setPortions(prev => ({ ...prev, [type]: Math.max(0, prev[type] - 1) }));
  };

  const oilNoteSuffix = addHiddenOil
    ? (lang === 'uk' ? ' (+15% олія)' : lang === 'es' ? ' (+15% aceite)' : ' (+15% oil)')
    : '';

  const handleAddHandPlate = () => {
    if (totalMacros.calories <= 0) return;
    onAddMeal(targetMeal, {
      name: `${t('dining_plate_name')}${oilNoteSuffix}`,
      weightGrams: totalWeightGrams,
      macros: totalMacros
    });
    onClose();
  };

  const handleAddPreset = (preset: DiningRestaurantPreset) => {
    let finalMacros = { ...preset.defaultMacros };
    let finalName = preset.name;
    if (addHiddenOil) {
      const extraFat = Math.round(finalMacros.fat * 0.25 * 10) / 10;
      const scaledFat = Math.round((finalMacros.fat + extraFat) * 10) / 10;
      finalMacros = {
        protein: finalMacros.protein,
        fat: scaledFat,
        carbs: finalMacros.carbs,
        calories: Math.round(finalMacros.protein * 4 + scaledFat * 9 + finalMacros.carbs * 4)
      };
      finalName = `${preset.name}${oilNoteSuffix}`;
    }

    onAddMeal(targetMeal, {
      name: finalName,
      weightGrams: preset.estimatedWeightGrams,
      macros: finalMacros
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      id="dining-out-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn"
      onClick={onClose}
    >
      <div
        id="dining-out-modal"
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
                {t('dining_title')}
              </span>
              <h3 className="text-base font-bold text-zinc-100">{t('dining_subtitle')}</h3>
            </div>
          </div>
          <button
            id="btn-close-dining-modal"
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#18221B] hover:bg-[#223026] text-zinc-400 hover:text-zinc-200 border border-[#2A3B2E] flex items-center justify-center transition-all cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Вибір прийому їжі */}
        <div className="flex items-center justify-between mt-3 text-xs">
          <span className="font-semibold text-zinc-300">{t('dining_log_to')}</span>
          <div className="flex gap-1.5 bg-[#162019] p-1 rounded-xl border border-[#27392C] font-medium">
            {(['lunch', 'dinner', 'snack'] as MealType[]).map((mealKey) => (
              <button
                key={mealKey}
                id={`btn-dining-slot-${mealKey}`}
                type="button"
                onClick={() => setTargetMeal(mealKey)}
                className={`px-2.5 py-1 rounded-lg text-xs transition-all cursor-pointer ${
                  targetMeal === mealKey
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm font-bold'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                {t(mealKey)}
              </button>
            ))}
          </div>
        </div>

        {/* Перемикач режиму: Долоні чи Пресети */}
        <div className="grid grid-cols-2 gap-1.5 p-1 bg-[#162019] border border-[#27392C] rounded-2xl my-3 text-xs font-semibold">
          <button
            id="tab-dining-hands"
            type="button"
            onClick={() => setActiveTab('hands')}
            className={`py-2 rounded-xl transition-all cursor-pointer ${
              activeTab === 'hands'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm font-bold'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            {t('dining_tab_hands')}
          </button>
          <button
            id="tab-dining-presets"
            type="button"
            onClick={() => setActiveTab('presets')}
            className={`py-2 rounded-xl transition-all cursor-pointer ${
              activeTab === 'presets'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm font-bold'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            {t('dining_tab_presets')}
          </button>
        </div>

        {/* Тогл прихованої олії шефа */}
        <div
          id="toggle-hidden-oil-wrapper"
          onClick={() => setAddHiddenOil(!addHiddenOil)}
          className={`p-2.5 rounded-2xl border transition-all cursor-pointer mb-3 flex items-center justify-between text-xs select-none ${
            addHiddenOil
              ? 'bg-amber-500/10 border-amber-500/40 text-amber-300'
              : 'bg-black/30 border-white/10 text-zinc-400'
          }`}
        >
          <div className="flex items-center gap-2">
            <Flame className={`w-4 h-4 ${addHiddenOil ? 'text-amber-400' : 'text-zinc-500'}`} />
            <span className="font-semibold">{t('dining_hidden_oil')}</span>
          </div>
          <input
            id="toggle-hidden-oil"
            type="checkbox"
            checked={addHiddenOil}
            onChange={(e) => setAddHiddenOil(e.target.checked)}
            className="rounded accent-amber-400 w-4 h-4 cursor-pointer"
            onClick={(e) => e.stopPropagation()}
          />
        </div>

        {activeTab === 'hands' ? (
          <div className="space-y-2.5">
            {(Object.keys(localizedDefs) as HandPortionType[]).map((type) => {
              const def = localizedDefs[type];
              const count = portions[type] || 0;
              return (
                <div
                  key={type}
                  id={`portion-row-${type}`}
                  className="p-3 rounded-2xl bg-[#162019] border border-[#27392C] flex items-center justify-between text-xs"
                >
                  <div className="pr-2">
                    <div className="font-bold text-zinc-100">{def.name}</div>
                    <div className="text-[11px] text-zinc-400 mt-0.5 leading-snug">{def.tip}</div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      id={`btn-portion-minus-${type}`}
                      type="button"
                      onClick={() => decrement(type)}
                      className="w-7 h-7 rounded-lg bg-[#202D23] hover:bg-[#28392C] text-zinc-300 flex items-center justify-center active:scale-95 border border-[#2F4232] cursor-pointer"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span id={`portion-count-${type}`} className="w-5 text-center font-bold text-sm text-amber-300">
                      {count}
                    </span>
                    <button
                      id={`btn-portion-plus-${type}`}
                      type="button"
                      onClick={() => increment(type)}
                      className="w-7 h-7 rounded-lg bg-[#202D23] hover:bg-[#28392C] text-zinc-300 flex items-center justify-center active:scale-95 border border-[#2F4232] cursor-pointer"
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
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" /> {t('dining_plate_estimate')}
                </span>
                <span id="dining-total-cals" className="text-base font-extrabold text-amber-400">
                  {totalMacros.calories} {t('calories')}
                </span>
              </div>
              <div className="text-[11px] font-medium text-zinc-300 mt-1">
                ~{totalWeightGrams}г • <span className="text-emerald-400">{totalMacros.protein}г Б</span> •{' '}
                <span className="text-amber-400">{totalMacros.fat}г Ж</span> •{' '}
                <span className="text-indigo-400">{totalMacros.carbs}г В</span>
              </div>

              <button
                id="btn-add-dining-plate"
                type="button"
                onClick={handleAddHandPlate}
                disabled={totalMacros.calories <= 0}
                className="w-full mt-3 py-2.5 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 text-zinc-950 font-bold text-xs shadow-[0_0_20px_rgba(245,158,11,0.4)] hover:brightness-110 transition-all active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <CheckCircle2 className="w-4 h-4 text-zinc-950" /> {t('dining_add_btn')}
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            {localizedPresets.map((item) => {
              const displayFat = addHiddenOil
                ? Math.round(item.defaultMacros.fat * 1.25 * 10) / 10
                : item.defaultMacros.fat;
              const displayCals = addHiddenOil
                ? Math.round(item.defaultMacros.protein * 4 + displayFat * 9 + item.defaultMacros.carbs * 4)
                : item.defaultMacros.calories;
              const pLabel = lang === 'uk' ? 'Б' : 'P';
              const fLabel = lang === 'uk' ? 'Ж' : lang === 'es' ? 'G' : 'F';
              const cLabel = lang === 'uk' ? 'В' : 'C';

              return (
                <div
                  key={item.id}
                  id={`btn-preset-${item.id}`}
                  onClick={() => handleAddPreset(item)}
                  className="p-3 rounded-2xl bg-[#162019] hover:bg-[#1C2820] border border-[#27392C] hover:border-amber-500/40 cursor-pointer transition-all flex items-center justify-between active:scale-[0.98]"
                >
                  <div>
                    <div className="text-xs font-bold text-zinc-100 flex items-center gap-1.5">
                      <span>{item.name}</span>
                      {addHiddenOil && (
                        <span className="text-[9px] font-black text-amber-300 bg-amber-400/20 px-1 rounded">
                          +15%
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-zinc-400 mt-0.5">{item.description}</div>
                    <div className="text-[10px] font-semibold mt-1 flex gap-2">
                      <span className="text-emerald-400">{item.defaultMacros.protein}g {pLabel}</span>
                      <span className="text-amber-400">{displayFat}g {fLabel}</span>
                      <span className="text-indigo-400">{item.defaultMacros.carbs}g {cLabel}</span>
                    </div>
                  </div>

                  <div className="text-right shrink-0 pl-2">
                    <span className="text-xs font-extrabold text-amber-300 block">
                      {displayCals} {t('calories')}
                    </span>
                    <span className="text-[10px] text-zinc-400">~{item.estimatedWeightGrams}g</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
