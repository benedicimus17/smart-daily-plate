import React, { useState } from 'react';
import { useNutritionStore } from '../store/nutritionStore';
import { MealType, MealEntry } from '../types/nutrition';
import { SmartBalancerModal } from './SmartBalancerModal';
import { CookLossCalculator } from './CookLossCalculator';
import { DiningOutEstimatorModal } from './DiningOutEstimatorModal';
import { QuickAddModal } from './QuickAddModal';
import { DishDetailModal } from './DishDetailModal';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Plus,
  Check,
  CookingPot,
  Sparkles,
  UtensilsCrossed,
  Trash2,
  ChevronRight as ChevronRightIcon
} from 'lucide-react';

interface LogScreenProps {
  onOpenQuickAdd: (mealType: MealType) => void;
}

const formatLocalDate = (d: Date): string => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

interface MealSlotConfig {
  type: MealType;
  title: string;
  time: string;
  targetKcal: number;
}

const MEAL_SLOTS: MealSlotConfig[] = [
  { type: 'breakfast', title: 'Сніданок', time: '08:30', targetKcal: 380 },
  { type: 'lunch', title: 'Обід', time: '13:00', targetKcal: 520 },
  { type: 'snack', title: 'Перекус', time: '16:30', targetKcal: 200 },
  { type: 'dinner', title: 'Вечеря', time: '19:30', targetKcal: 500 }
];

export const LogScreen: React.FC<LogScreenProps> = () => {
  const {
    dailyLog,
    selectedDate,
    setSelectedDate,
    removeFoodFromMeal,
    addFoodToMeal,
    toggleMealEaten
  } = useNutritionStore();

  const [balancerOpen, setBalancerOpen] = useState(false);
  const [cookLossOpen, setCookLossOpen] = useState(false);
  const [diningOpen, setDiningOpen] = useState(false);
  const [quickAddMealType, setQuickAddMealType] = useState<MealType | null>(null);

  // Стан для модалки деталей страви
  const [selectedDish, setSelectedDish] = useState<{ mealType: MealType; entry: MealEntry } | null>(null);

  // ШІ-Балансувальник: стан перебору
  const [isOverLimit, setIsOverLimit] = useState(true);
  const excessKcal = 240;

  // Календарні розрахунки
  const [weekOffset, setWeekOffset] = useState<number>(0);
  const baseDate = new Date();
  const currentDayOfWeek = baseDate.getDay();
  const daysToMonday = currentDayOfWeek === 0 ? -6 : 1 - currentDayOfWeek;
  const monday = new Date(baseDate);
  monday.setDate(baseDate.getDate() + daysToMonday + weekOffset * 7);

  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    const dateStr = formatLocalDate(d);
    const isToday = dateStr === formatLocalDate(new Date());
    const shortNames = ['НД', 'ПН', 'ВТ', 'СР', 'ЧТ', 'ПТ', 'СБ'];
    const shortName = shortNames[d.getDay()];
    return {
      date: dateStr,
      shortName,
      dayNum: d.getDate(),
      isToday,
      monthName: d.toLocaleDateString('uk-UA', { month: 'short' })
    };
  });

  const weekTitle = `${days[0].dayNum} ${days[0].monthName} – ${days[6].dayNum} ${days[6].monthName}`;

  // Обробка застосування балансувальника
  const handleApplyScale = (_mealType: string, _newGrams: number) => {
    setIsOverLimit(false);
  };

  const handleApplySwap = (_mealType: string, newDishName: string, newMacros: { calories: number; protein: number; fat: number; carbs: number }) => {
    addFoodToMeal('dinner', {
      foodId: `swap-${Date.now()}`,
      name: newDishName,
      weightGrams: 200,
      macros: newMacros,
      eaten: true
    });
    setIsOverLimit(false);
  };

  const handleApplyFlexBank = (_excess: number) => {
    setIsOverLimit(false);
  };

  return (
    <div className="space-y-3.5 pb-28 animate-fadeIn select-none">
      {/* 1. ШАПКА З КАЛЕНДАРНИМ ТИЖНЕМ */}
      <div
        className="rounded-3xl p-3.5 relative overflow-hidden shadow-lg"
        style={{
          background: 'linear-gradient(165deg, rgba(23,32,26,0.92) 0%, rgba(13,18,15,0.98) 100%)',
          border: '1px solid rgba(255,255,255,0.12)',
          boxShadow: '0 10px 30px rgba(0,0,0,0.5)'
        }}
      >
        <div className="flex items-center justify-between mb-2.5 px-1">
          <div className="flex items-center gap-1.5">
            <CalendarIcon className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-xs font-bold text-white tracking-tight">
              {weekTitle}
            </span>
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setWeekOffset(prev => prev - 1)}
              className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-zinc-400 hover:text-white"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => {
                setWeekOffset(0);
                setSelectedDate(formatLocalDate(new Date()));
              }}
              className="px-2 py-0.5 rounded-lg bg-white/5 hover:bg-white/10 text-[10px] font-bold text-amber-300"
            >
              Сьогодні
            </button>
            <button
              type="button"
              onClick={() => setWeekOffset(prev => prev + 1)}
              className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-zinc-400 hover:text-white"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 7 днів тижня */}
        <div className="grid grid-cols-7 gap-1.5 text-center">
          {days.map((item) => {
            const isSelected = item.date === selectedDate;
            return (
              <button
                key={item.date}
                type="button"
                onClick={() => setSelectedDate(item.date)}
                className={`py-2 rounded-2xl flex flex-col items-center transition-all ${
                  isSelected
                    ? 'bg-gradient-to-b from-amber-400 to-amber-500 text-zinc-950 font-bold shadow-md shadow-amber-500/20'
                    : item.isToday
                    ? 'bg-white/10 text-white font-semibold border border-amber-400/40'
                    : 'bg-black/30 text-zinc-400 hover:text-white border border-white/5'
                }`}
              >
                <span className={`text-[9.5px] uppercase ${isSelected ? 'text-zinc-950 font-extrabold' : 'text-zinc-500'}`}>
                  {item.shortName}
                </span>
                <span className="text-xs font-extrabold mt-0.5">
                  {item.dayNum}
                </span>
                <span className={`w-1 h-1 rounded-full mt-1 ${isSelected ? 'bg-zinc-950' : 'bg-emerald-400'}`} />
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. КОМПАКТНА ШІ-ПЛАШКА БАЛАНСУВАННЯ (БЕЗ ДУБЛЮВАННЯ КІЛЬЦЯ) */}
      {isOverLimit && (
        <div className="p-2.5 rounded-2xl bg-rose-500/15 border border-rose-500/40 flex items-center justify-between animate-fadeIn">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-rose-400 animate-ping shrink-0" />
            <div>
              <div className="text-[11px] font-bold text-rose-200">
                Перевищення вечері +{excessKcal} ккал
              </div>
              <div className="text-[9.5px] text-rose-300/80">
                ШІ пропонує зменшити порцію або списати у Flex Bank
              </div>
            </div>
          </div>

          <button
            id="btn-open-balancer"
            type="button"
            onClick={() => setBalancerOpen(true)}
            className="px-3 py-1.5 rounded-xl font-bold text-[11px] text-zinc-950 flex items-center gap-1.5 shadow-md transition-all active:scale-95 shrink-0"
            style={{
              background: 'linear-gradient(135deg, #FDE68A 0%, #F59E0B 100%)'
            }}
          >
            <Sparkles className="w-3.5 h-3.5 text-zinc-950" />
            <span>Збалансувати</span>
          </button>
        </div>
      )}

      {/* 3. КНОПКИ ШВИДКИХ ІНСТРУМЕНТІВ ШЕФА */}
      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => setCookLossOpen(true)}
          className="p-2.5 rounded-2xl bg-white/[0.04] border border-white/10 hover:border-amber-400/40 flex items-center justify-center gap-2 text-xs font-bold text-zinc-200 hover:text-amber-300 transition-all active:scale-95"
        >
          <CookingPot className="w-4 h-4 text-amber-400" />
          <span>Уварка (Cook-Loss)</span>
        </button>

        <button
          type="button"
          onClick={() => setDiningOpen(true)}
          className="p-2.5 rounded-2xl bg-white/[0.04] border border-white/10 hover:border-amber-400/40 flex items-center justify-center gap-2 text-xs font-bold text-zinc-200 hover:text-amber-300 transition-all active:scale-95"
        >
          <UtensilsCrossed className="w-4 h-4 text-emerald-400" />
          <span>В ресторані (+олії)</span>
        </button>
      </div>

      {/* 4. ТАЙМЛАЙН ПРИЙОМІВ ЇЖІ (ДИНАМІЧНИЙ РОЗКЛАД З РЕАЛЬНОГО STORE) */}
      <div className="space-y-3">
        {MEAL_SLOTS.map((slot) => {
          const category = dailyLog.meals[slot.type];
          const entries = category?.entries || [];

          return (
            <div
              key={slot.type}
              className="rounded-3xl p-3.5 bg-black/40 border border-white/10 shadow-sm transition-all"
            >
              {/* Заголовок тайм-слота */}
              <div className="flex items-center justify-between pb-2 border-b border-white/5">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-extrabold text-amber-300 px-2 py-0.5 rounded-lg bg-amber-400/15 border border-amber-400/30">
                    {slot.time}
                  </span>
                  <h4 className="text-sm font-bold text-white tracking-tight">{slot.title}</h4>
                  <span className="text-[10px] text-zinc-500">
                    • Ціль ~{slot.targetKcal} ккал
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => setQuickAddMealType(slot.type)}
                  className="p-1 rounded-lg bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white transition-all active:scale-95"
                  title="Додати страву"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              {/* Список страв слота */}
              {entries.length > 0 ? (
                <div className="divide-y divide-white/5 pt-1">
                  {entries.map((entry) => {
                    const isEaten = entry.eaten !== false;

                    return (
                      <div
                        key={entry.id}
                        onClick={() => setSelectedDish({ mealType: slot.type, entry })}
                        className="py-2.5 flex items-center justify-between cursor-pointer group hover:bg-white/[0.02] px-1 rounded-xl transition-all"
                      >
                        {/* Інтерактивна галочка з'їденого */}
                        <div className="flex items-center gap-2.5 flex-1 min-w-0 pr-2">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleMealEaten(slot.type, entry.id);
                            }}
                            className={`w-5 h-5 rounded-full flex items-center justify-center transition-all shrink-0 active:scale-90 ${
                              isEaten
                                ? 'bg-emerald-400 text-zinc-950 shadow-sm shadow-emerald-400/30'
                                : 'border-2 border-white/25 bg-black/40 hover:border-amber-400'
                            }`}
                            title={isEaten ? 'Позначено як з\'їдено' : 'Позначити з\'їденим'}
                          >
                            {isEaten && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                          </button>

                          {/* Інформація про страву (тап відкриває деталі) */}
                          <div className="min-w-0">
                            <div className={`text-xs font-bold truncate ${isEaten ? 'text-zinc-200' : 'text-zinc-400'}`}>
                              {entry.name}
                            </div>
                            <div className="text-[10.5px] text-zinc-500 flex items-center gap-1.5 flex-wrap mt-0.5">
                              <span>{entry.weightGrams}г</span>
                              <span>•</span>
                              <span className="text-amber-400/90 font-bold">{entry.macros.calories} ккал</span>
                              <span>•</span>
                              <span className="text-emerald-400/80">{entry.macros.protein}г Б</span>
                              <span>•</span>
                              <span className="text-amber-400/80">{entry.macros.fat}г Ж</span>
                            </div>
                          </div>
                        </div>

                        {/* Кнопки дій: стрілочка деталей та видалення */}
                        <div className="flex items-center gap-1 shrink-0">
                          <ChevronRightIcon className="w-3.5 h-3.5 text-zinc-500 group-hover:text-amber-400 transition-colors" />
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              removeFoodFromMeal(slot.type, entry.id);
                            }}
                            className="p-1 text-zinc-600 hover:text-rose-400 transition-colors ml-1"
                            title="Видалити"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div
                  onClick={() => setQuickAddMealType(slot.type)}
                  className="py-3 text-center cursor-pointer text-zinc-600 hover:text-zinc-400 text-xs transition-colors"
                >
                  Немає страв • Натисніть [+] щоб додати
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* 5. КНОПКА ДОДАВАННЯ СВОГО ПРИЙОМУ ЇЖІ */}
      <button
        type="button"
        onClick={() => setQuickAddMealType('snack')}
        className="w-full py-3 rounded-2xl bg-white/[0.04] border border-dashed border-white/20 hover:border-amber-400/50 text-xs font-bold text-zinc-300 hover:text-amber-300 flex items-center justify-center gap-2 transition-all active:scale-[0.99]"
      >
        <Plus className="w-4 h-4 text-amber-400" />
        <span>+ Додати свій прийом їжі або перекус</span>
      </button>

      {/* МОДАЛКА ДЕТАЛЕЙ СТРАВИ (ФОТО, ІНГРЕДІЄНТИ В ГРАМАХ, РЕЦЕПТ, КБЖВ) */}
      <DishDetailModal
        isOpen={selectedDish !== null}
        mealType={selectedDish?.mealType || null}
        entry={selectedDish?.entry || null}
        onClose={() => setSelectedDish(null)}
        onToggleEaten={toggleMealEaten}
        onRemove={removeFoodFromMeal}
      />

      {/* МОДАЛКА ШІ-БАЛАНСУВАЛЬНИКА */}
      <SmartBalancerModal
        isOpen={balancerOpen}
        onClose={() => setBalancerOpen(false)}
        onApplyScale={handleApplyScale}
        onApplySwap={handleApplySwap}
        onApplyFlexBank={handleApplyFlexBank}
        excessCalories={excessKcal}
      />

      {/* МОДАЛКА КАСТРУЛІ (COOK-LOSS) З НАДІЙНИМ ЗАКРИТТЯМ */}
      {cookLossOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn"
          onClick={() => setCookLossOpen(false)}
        >
          <div
            className="w-full max-w-sm rounded-[30px] p-4 bg-[#121814] border border-white/10 relative max-h-[92vh] overflow-y-auto shadow-[0_20px_50px_rgba(0,0,0,0.85)]"
            onClick={(e) => e.stopPropagation()}
          >
            <CookLossCalculator onClose={() => setCookLossOpen(false)} />
          </div>
        </div>
      )}

      {/* МОДАЛКА В РЕСТОРАНІ */}
      <DiningOutEstimatorModal
        isOpen={diningOpen}
        onClose={() => setDiningOpen(false)}
        onAddMeal={(type, data) => addFoodToMeal(type, { ...data, eaten: true, foodId: `dining-${Date.now()}` })}
      />

      {/* МОДАЛКА ШВИДКОГО ДОДАВАННЯ СТРАВИ */}
      <QuickAddModal
        isOpen={quickAddMealType !== null}
        mealType={quickAddMealType}
        onClose={() => setQuickAddMealType(null)}
        onAdd={(type, data) => {
          addFoodToMeal(type, { ...data, eaten: true, foodId: `item-${Date.now()}` });
          setQuickAddMealType(null);
        }}
      />
    </div>
  );
};
