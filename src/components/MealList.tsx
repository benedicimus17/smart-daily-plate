import React, { useState } from 'react';
import { MealCategory, MealType } from '../types/nutrition';
import { Plus, SunMedium, Flame, Moon, Apple, Trash2, ChevronRight } from 'lucide-react';

interface MealListProps {
  meals: Record<MealType, MealCategory>;
  onOpenAddModal: (mealType: MealType) => void;
  onRemoveEntry: (mealType: MealType, entryId: string) => void;
  onOpenDiningEstimator?: () => void;
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
  onOpenDiningEstimator
}) => {
  const [expandedMeal, setExpandedMeal] = useState<MealType | null>('lunch');

  const toggleMeal = (type: MealType) => {
    setExpandedMeal(prev => (prev === type ? null : type));
  };

  return (
    <div className="space-y-3 pb-24">
      <div className="flex items-center justify-between px-1">
        <h2 className="text-base font-bold text-slate-800 tracking-tight">Прийоми їжі</h2>
        <div className="flex items-center gap-2">
          {onOpenDiningEstimator && (
            <button
              type="button"
              onClick={onOpenDiningEstimator}
              className="text-[11px] font-bold text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200/60 px-2.5 py-1 rounded-full flex items-center gap-1 transition-all active:scale-95 shadow-sm"
              title="Оцінка ресторанних страв без ваг"
            >
              🍽️ В ресторані
            </button>
          )}
          <span className="text-xs text-slate-400 font-medium hidden sm:inline">Дзен-структура</span>
        </div>
      </div>

      {(Object.entries(meals) as [MealType, MealCategory][]).map(([type, category]) => {
        const IconComponent = ICONS[category.icon as keyof typeof ICONS] || SunMedium;
        const isExpanded = expandedMeal === type;
        const hasEntries = category.entries.length > 0;

        return (
          <div
            key={type}
            className="glass-card-interactive rounded-3xl overflow-hidden transition-all duration-300"
          >
            {/* Заголовок картки прийому їжі */}
            <div
              className="p-4 flex items-center justify-between cursor-pointer select-none"
              onClick={() => toggleMeal(type)}
            >
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${
                  type === 'breakfast' ? 'bg-amber-50 text-brand-amber' :
                  type === 'lunch' ? 'bg-emerald-50 text-brand-emerald' :
                  type === 'dinner' ? 'bg-indigo-50 text-brand-indigo' :
                  'bg-rose-50 text-brand-rose'
                }`}>
                  <IconComponent className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-800">{category.title}</h3>
                  <div className="text-xs text-slate-400 font-medium">
                    {hasEntries ? `${category.entries.length} страв` : 'Ще нічого не додано'}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-right">
                  <div className="text-sm font-extrabold text-slate-850">
                    {category.totalMacros.calories} <span className="text-xs font-normal text-slate-400">ккал</span>
                  </div>
                  {category.totalMacros.protein > 0 && (
                    <div className="text-[11px] font-semibold text-brand-emerald">
                      {category.totalMacros.protein}г Б
                    </div>
                  )}
                </div>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onOpenAddModal(type);
                  }}
                  className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-transform active:scale-90"
                  title="Додати страву"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Розкривні деталі (Progressive Disclosure) */}
            {isExpanded && (
              <div className="px-4 pb-4 pt-1 border-t border-slate-100/80">
                {hasEntries ? (
                  <div className="space-y-2 mt-2">
                    {category.entries.map((entry) => (
                      <div
                        key={entry.id}
                        className="flex items-center justify-between p-2.5 rounded-2xl bg-white/70 border border-white/90 text-xs"
                      >
                        <div className="flex-1 min-w-0 pr-2">
                          <div className="font-semibold text-slate-800 truncate">{entry.name}</div>
                          <div className="text-[11px] text-slate-400 mt-0.5">
                            {entry.weightGrams}г • {entry.macros.protein}г Б • {entry.macros.fat}г Ж • {entry.macros.carbs}г В
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-700 whitespace-nowrap">
                            {entry.macros.calories} ккал
                          </span>
                          <button
                            type="button"
                            onClick={() => onRemoveEntry(type, entry.id)}
                            className="p-1 text-slate-300 hover:text-rose-500 transition-colors"
                            title="Видалити"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-4 text-center">
                    <p className="text-xs text-slate-400">Поки що порожньо</p>
                    <button
                      type="button"
                      onClick={() => onOpenAddModal(type)}
                      className="mt-2 text-xs font-semibold text-brand-emerald hover:underline inline-flex items-center gap-1"
                    >
                      + Записати страву <ChevronRight className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
