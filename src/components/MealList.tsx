import React, { useState } from 'react';
import { MealCategory, MealType } from '../types/nutrition';
import { Plus, SunMedium, Flame, Moon, Apple, ChevronDown, Check, CookingPot, Trash2 } from 'lucide-react';

interface MealListProps {
  meals: Record<MealType, MealCategory>;
  onOpenAddModal: (mealType: MealType) => void;
  onRemoveEntry: (mealType: MealType, entryId: string) => void;
  onToggleEaten?: (mealType: MealType, entryId: string) => void;
  onOpenDiningEstimator?: () => void;
  onOpenCookLoss?: () => void;
}

const ICONS = {
  SunMedium: SunMedium,
  Flame: Flame,
  Moon: Moon,
  Apple: Apple,
};

export const MealList: React.FC<MealListProps> = ({
  meals,
  onOpenAddModal,
  onRemoveEntry,
  onToggleEaten,
  onOpenDiningEstimator,
  onOpenCookLoss
}) => {
  const [expandedMeal, setExpandedMeal] = useState<MealType | null>('dinner');

  const toggleMeal = (type: MealType) => {
    setExpandedMeal(prev => (prev === type ? null : type));
  };

  return (
    <div className="space-y-3.5 pb-24">
      {/* Заголовок секції */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <h2 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-amber-400/90 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            Меню дня (Comidas del día)
          </h2>
          <span className="text-[10px] bg-[#162119] text-zinc-300 px-2 py-0.5 rounded-full border border-[#27392C] font-medium">
            1-тап списання
          </span>
        </div>

        <div className="flex items-center gap-2">
          {onOpenDiningEstimator && (
            <button
              type="button"
              onClick={onOpenDiningEstimator}
              className="text-[11px] font-bold text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 px-3 py-1 rounded-full flex items-center gap-1.5 transition-all active:scale-95 shadow-sm"
              title="Оцінка ресторанних страв без ваг"
            >
              🍽️ <span>В ресторані</span>
            </button>
          )}
        </div>
      </div>

      {/* Список прийомів їжі */}
      {(Object.entries(meals) as [MealType, MealCategory][]).map(([type, category]) => {
        const IconComponent = ICONS[category.icon as keyof typeof ICONS] || SunMedium;
        const isExpanded = expandedMeal === type;
        const hasEntries = category.entries.length > 0;
        const eatenCount = category.entries.filter(e => e.eaten !== false).length;

        return (
          <div
            key={type}
            className="rounded-3xl bg-[#111713]/90 border border-[#212E24]/80 hover:border-[#2E3F32] overflow-hidden transition-all duration-300 backdrop-blur-xl shadow-xl shadow-black/50"
          >
            {/* Заголовок картки прийому їжі */}
            <div
              className="p-4 flex items-center justify-between cursor-pointer select-none"
              onClick={() => toggleMeal(type)}
            >
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-colors shadow-inner ${
                  type === 'breakfast' ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30' :
                  type === 'lunch' ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30' :
                  type === 'dinner' ? 'bg-indigo-500/15 text-indigo-400 border border-indigo-500/30' :
                  'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                }`}>
                  <IconComponent className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-zinc-100 tracking-tight">
                      {category.title}
                    </h3>
                    {hasEntries && (
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#18231B] text-zinc-300 border border-[#27382B]">
                        {eatenCount}/{category.entries.length} з'їдено
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-zinc-400 mt-0.5">
                    <span className="font-semibold text-amber-300">{category.totalMacros.calories} ккал</span>
                    <span>•</span>
                    <span className="text-emerald-400 font-medium">Б: {category.totalMacros.protein}г</span>
                    <span>•</span>
                    <span className="text-amber-400/90 font-medium">Ж: {category.totalMacros.fat}г</span>
                    <span>•</span>
                    <span className="text-indigo-400 font-medium">В: {category.totalMacros.carbs}г</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onOpenAddModal(type);
                  }}
                  className="w-8 h-8 rounded-full bg-[#162119] hover:bg-amber-500/20 border border-[#26372A] hover:border-amber-500/40 text-zinc-300 hover:text-amber-300 flex items-center justify-center transition-all active:scale-90"
                  title="Додати страву"
                >
                  <Plus className="w-4 h-4" />
                </button>

                <div className={`text-zinc-500 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}>
                  <ChevronDown className="w-4 h-4" />
                </div>
              </div>
            </div>

            {/* Вміст списку страв прийому (Розгортання) */}
            {isExpanded && (
              <div className="px-4 pb-4 pt-1 space-y-2.5 border-t border-[#1C261F] bg-[#0E1410]/70">
                {/* Картка страви у стилі Layout 2: Dinner | Gourmet Steak & Greens */}
                {type === 'dinner' && (
                  <div className="relative rounded-2xl overflow-hidden bg-[#131D16]/90 border border-[#233527] shadow-xl p-3 flex items-center justify-between my-1">
                    <div className="space-y-1">
                      <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider block">
                        Dinner
                      </span>
                      <h4 className="text-sm sm:text-base font-extrabold text-white">
                        Gourmet Steak & Greens
                      </h4>
                      <p className="text-xs text-zinc-400 font-medium">
                        480 kcal • 42g Protein
                      </p>
                    </div>
                    <div className="w-24 h-16 sm:w-28 sm:h-18 rounded-xl overflow-hidden border border-[#2B3F30] shrink-0">
                      <img
                        src="/gourmet_steak_dish.jpg"
                        alt="Gourmet Steak & Greens"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                )}

                {!hasEntries ? (
                  <div className="py-6 text-center">
                    <p className="text-xs text-zinc-500 font-medium">
                      У цьому прийомі ще немає запланованих страв
                    </p>
                    <button
                      type="button"
                      onClick={() => onOpenAddModal(type)}
                      className="mt-2 text-xs font-bold text-amber-400 hover:text-amber-300 transition-colors"
                    >
                      + Запланувати страву
                    </button>
                  </div>
                ) : (
                  category.entries.map((entry) => {
                    const isEaten = entry.eaten !== false;

                    return (
                      <div
                        key={entry.id}
                        className={`group p-3.5 rounded-2xl border transition-all duration-200 flex flex-col gap-2 ${
                          isEaten
                            ? 'bg-[#131A15]/95 border-[#233126]/90 hover:border-[#2E4132] shadow-md'
                            : 'bg-[#131A15]/40 border-dashed border-[#233126]/60 opacity-80 hover:opacity-100'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          {/* Чекбокс «З'їдено в 1 тап» */}
                          <div className="flex items-start gap-3 flex-1 min-w-0">
                            <button
                              type="button"
                              onClick={() => onToggleEaten && onToggleEaten(type, entry.id)}
                              className={`mt-0.5 w-6 h-6 rounded-lg flex items-center justify-center transition-all duration-200 active:scale-90 flex-shrink-0 ${
                                isEaten
                                  ? 'bg-gradient-to-br from-emerald-500 to-emerald-600 text-zinc-950 shadow-[0_0_10px_rgba(16,185,129,0.5)]'
                                  : 'bg-[#19241C] border border-[#2D3E31] text-transparent hover:border-amber-400/60'
                              }`}
                              title={isEaten ? "Позначено як з'їдено" : "Натисніть, щоб списати в кільце калорій"}
                            >
                              <Check className="w-4 h-4 stroke-[3]" />
                            </button>

                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <h4 className={`text-sm font-bold tracking-tight transition-colors ${
                                  isEaten ? 'text-zinc-200 line-through decoration-zinc-500/70' : 'text-zinc-100 font-semibold'
                                }`}>
                                  {entry.name}
                                </h4>
                                <span className="text-[11px] font-semibold text-zinc-400 bg-[#162119] px-2 py-0.5 rounded-md border border-[#27382B]">
                                  {entry.weightGrams} г
                                </span>
                                {entry.isCookLoss && (
                                  <span
                                    onClick={onOpenCookLoss}
                                    className="cursor-pointer text-[10px] font-bold text-amber-300 bg-amber-500/15 border border-amber-500/30 px-2 py-0.5 rounded-md flex items-center gap-1 hover:bg-amber-500/25 transition-colors"
                                    title="Натисніть для перегляду розрахунку каструлі"
                                  >
                                    <CookingPot className="w-3 h-3 text-amber-400" />
                                    <span>Уварка {entry.rawWeightGrams && entry.cookedWeightGrams ? `${entry.rawWeightGrams}г ➔ ${entry.cookedWeightGrams}г` : 'Cook-Loss'}</span>
                                  </span>
                                )}
                              </div>

                              {/* Деталі рецепта / складники */}
                              {entry.recipeDetails && (
                                <p className="text-[11px] text-zinc-400/90 mt-1 line-clamp-2 leading-relaxed">
                                  {entry.recipeDetails}
                                </p>
                              )}

                              {/* Макроси порції */}
                              <div className="flex items-center gap-2.5 text-[11px] mt-2 text-zinc-400">
                                <span className="font-bold text-amber-300 bg-amber-400/10 px-1.5 py-0.5 rounded border border-amber-400/20">
                                  {entry.macros.calories} ккал
                                </span>
                                <span className="text-emerald-400 font-medium">
                                  Б: {entry.macros.protein}г
                                </span>
                                <span className="text-amber-400/90 font-medium">
                                  Ж: {entry.macros.fat}г
                                </span>
                                <span className="text-indigo-400 font-medium">
                                  В: {entry.macros.carbs}г
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Кнопка видалення */}
                          <button
                            type="button"
                            onClick={() => onRemoveEntry(type, entry.id)}
                            className="text-zinc-600 hover:text-rose-400 p-1.5 rounded-lg hover:bg-[#1A251E] transition-colors opacity-60 group-hover:opacity-100"
                            title="Видалити страву"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
