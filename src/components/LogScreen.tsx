import React, { useState } from 'react';
import { useNutritionStore } from '../store/nutritionStore';
import { MealType } from '../types/nutrition';
import { SmartBalancerModal } from './SmartBalancerModal';
import { CookLossCalculator } from './CookLossCalculator';
import { DiningOutEstimatorModal } from './DiningOutEstimatorModal';
import { QuickAddModal } from './QuickAddModal';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Plus,
  Check,
  CookingPot,
  Sparkles,
  UtensilsCrossed,
  Trash2
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

export const LogScreen: React.FC<LogScreenProps> = () => {
  const { dailyLog, selectedDate, setSelectedDate, removeFoodFromMeal, addFoodToMeal } = useNutritionStore();

  const [balancerOpen, setBalancerOpen] = useState(false);
  const [cookLossOpen, setCookLossOpen] = useState(false);
  const [diningOpen, setDiningOpen] = useState(false);
  const [quickAddMealType, setQuickAddMealType] = useState<MealType | null>(null);

  // Стан для демонстрації перебору (якщо активний, показуємо кнопку балансування)
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

      {/* 2. ПІДСУМОК ДНЯ ТА ПЛАШКА БАЛАНСУВАННЯ */}
      <div
        className="rounded-3xl p-3.5 relative overflow-hidden shadow-lg"
        style={{
          background: 'linear-gradient(165deg, rgba(20,28,23,0.92) 0%, rgba(12,17,14,0.98) 100%)',
          border: '1px solid rgba(255,255,255,0.1)'
        }}
      >
        <div className="flex items-center justify-between mb-2">
          <div>
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">
              Баланс обраного дня
            </span>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-lg font-black text-white">
                {dailyLog.totals.calories}
              </span>
              <span className="text-xs text-zinc-400">/ {dailyLog.targets.calories} ккал</span>
            </div>
          </div>

          <div className="flex items-center gap-2 text-right">
            <div>
              <span className="text-[10px] text-zinc-500 block">Протеїн</span>
              <span className="text-xs font-bold text-emerald-400">{dailyLog.totals.protein} / {dailyLog.targets.protein}г</span>
            </div>
            <div className="w-px h-6 bg-white/10" />
            <div>
              <span className="text-[10px] text-zinc-500 block">Жири</span>
              <span className="text-xs font-bold text-amber-400">{dailyLog.totals.fat} / {dailyLog.targets.fat}г</span>
            </div>
            <div className="w-px h-6 bg-white/10" />
            <div>
              <span className="text-[10px] text-zinc-500 block">Вуглеводи</span>
              <span className="text-xs font-bold text-indigo-400">{dailyLog.totals.carbs} / {dailyLog.targets.carbs}г</span>
            </div>
          </div>
        </div>

        {/* ШІ-ПЛАШКА ПЕРЕБОРУ ТА БАЛАНСУВАННЯ */}
        {isOverLimit ? (
          <div className="mt-2.5 p-2.5 rounded-2xl bg-rose-500/15 border border-rose-500/40 flex items-center justify-between animate-fadeIn">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-rose-400 animate-ping" />
              <div>
                <div className="text-[11px] font-bold text-rose-200">
                  Перевищення вечері +{excessKcal} ккал
                </div>
                <div className="text-[9.5px] text-rose-300/80">
                  Забагато жирів у поєднанні з ситною вечерею
                </div>
              </div>
            </div>

            <button
              id="btn-open-balancer"
              type="button"
              onClick={() => setBalancerOpen(true)}
              className="px-3 py-1.5 rounded-xl font-bold text-[11px] text-zinc-950 flex items-center gap-1.5 shadow-md transition-all active:scale-95"
              style={{
                background: 'linear-gradient(135deg, #FDE68A 0%, #F59E0B 100%)'
              }}
            >
              <Sparkles className="w-3.5 h-3.5 text-zinc-950" />
              <span>Збалансувати</span>
            </button>
          </div>
        ) : (
          <div className="mt-2.5 p-2 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center gap-2 text-[11px] text-emerald-300 font-semibold">
            <Check className="w-3.5 h-3.5 stroke-[3]" />
            <span>День ідеально збалансовано в межах цільового дефіциту!</span>
          </div>
        )}
      </div>

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

      {/* 4. ТАЙМЛАЙН ПРИЙОМІВ ЇЖІ (ДИНАМІЧНИЙ РОЗКЛАД) */}
      <div className="space-y-3">
        {/* 1. Сніданок */}
        <div className="rounded-3xl p-3.5 bg-black/40 border border-white/10 shadow-sm">
          <div className="flex items-center justify-between pb-2 border-b border-white/5">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-extrabold text-amber-300 px-2 py-0.5 rounded-lg bg-amber-400/15 border border-amber-400/30">
                08:30
              </span>
              <h4 className="text-sm font-bold text-white tracking-tight">Сніданок</h4>
              <span className="text-[10px] text-zinc-500">• Ціль ~380 ккал</span>
            </div>

            <button
              type="button"
              onClick={() => setQuickAddMealType('breakfast')}
              className="p-1 rounded-lg bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          <div className="pt-2.5 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <button
                type="button"
                className="w-5 h-5 rounded-full bg-emerald-500/20 border border-emerald-400 flex items-center justify-center text-emerald-300"
              >
                <Check className="w-3 h-3 stroke-[3]" />
              </button>
              <div>
                <div className="text-xs font-bold text-zinc-200">Омлет з авокадо та шпинатом</div>
                <div className="text-[10.5px] text-zinc-500">180 г • 380 ккал • 28г Б • 24г Ж</div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => removeFoodFromMeal('breakfast', 'omelet-1')}
              className="p-1 text-zinc-600 hover:text-rose-400"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* 2. Обід */}
        <div className="rounded-3xl p-3.5 bg-black/40 border border-white/10 shadow-sm">
          <div className="flex items-center justify-between pb-2 border-b border-white/5">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-extrabold text-amber-300 px-2 py-0.5 rounded-lg bg-amber-400/15 border border-amber-400/30">
                13:00
              </span>
              <h4 className="text-sm font-bold text-white tracking-tight">Обід</h4>
              <span className="text-[10px] text-zinc-500">• Ціль ~520 ккал</span>
            </div>

            <button
              type="button"
              onClick={() => setQuickAddMealType('lunch')}
              className="p-1 rounded-lg bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          <div className="pt-2.5 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <button
                type="button"
                className="w-5 h-5 rounded-full bg-emerald-500/20 border border-emerald-400 flex items-center justify-center text-emerald-300"
              >
                <Check className="w-3 h-3 stroke-[3]" />
              </button>
              <div>
                <div className="text-xs font-bold text-zinc-200">Куряче філе запечене з киноа</div>
                <div className="text-[10.5px] text-zinc-500">220 г • 480 ккал • 44г Б • 12г Ж</div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => removeFoodFromMeal('lunch', 'chicken-1')}
              className="p-1 text-zinc-600 hover:text-rose-400"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* 3. Перекус */}
        <div className="rounded-3xl p-3.5 bg-black/40 border border-white/10 shadow-sm">
          <div className="flex items-center justify-between pb-2 border-b border-white/5">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-extrabold text-amber-300 px-2 py-0.5 rounded-lg bg-amber-400/15 border border-amber-400/30">
                16:30
              </span>
              <h4 className="text-sm font-bold text-white tracking-tight">Перекус</h4>
              <span className="text-[10px] text-zinc-500">• Ціль ~200 ккал</span>
            </div>

            <button
              type="button"
              onClick={() => setQuickAddMealType('snack')}
              className="p-1 rounded-lg bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          <div className="pt-2.5 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <button
                type="button"
                className="w-5 h-5 rounded-full bg-emerald-500/20 border border-emerald-400 flex items-center justify-center text-emerald-300"
              >
                <Check className="w-3 h-3 stroke-[3]" />
              </button>
              <div>
                <div className="text-xs font-bold text-zinc-200">Грецький йогурт 2% з лісовими ягодами</div>
                <div className="text-[10.5px] text-zinc-500">150 г • 190 ккал • 15г Б • 4г Ж</div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => removeFoodFromMeal('snack', 'yogurt-1')}
              className="p-1 text-zinc-600 hover:text-rose-400"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* 4. Вечеря (Панорамна картка Gourmet Steak & Greens) */}
        <div className="rounded-3xl p-3.5 bg-black/40 border border-amber-400/30 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between pb-2 border-b border-white/5">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-extrabold text-amber-300 px-2 py-0.5 rounded-lg bg-amber-400/15 border border-amber-400/30">
                19:30
              </span>
              <h4 className="text-sm font-bold text-white tracking-tight">Вечеря</h4>
              <span className="text-[10px] text-amber-400">• Ціль ~500 ккал</span>
            </div>

            <button
              type="button"
              onClick={() => setQuickAddMealType('dinner')}
              className="p-1 rounded-lg bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          <div className="pt-2.5 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <button
                type="button"
                className="w-5 h-5 rounded-full bg-emerald-500/20 border border-emerald-400 flex items-center justify-center text-emerald-300"
              >
                <Check className="w-3 h-3 stroke-[3]" />
              </button>
              <div>
                <div className="text-xs font-bold text-white">Gourmet Steak & Greens (Рибай зі спаржею)</div>
                <div className="text-[10.5px] text-zinc-400">220 г • 510 ккал • 46г Б • 24г Ж</div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => removeFoodFromMeal('dinner', 'steak-1')}
              className="p-1 text-zinc-600 hover:text-rose-400"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
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

      {/* МОДАЛКА ШІ-БАЛАНСУВАЛЬНИКА */}
      <SmartBalancerModal
        isOpen={balancerOpen}
        onClose={() => setBalancerOpen(false)}
        onApplyScale={handleApplyScale}
        onApplySwap={handleApplySwap}
        onApplyFlexBank={handleApplyFlexBank}
        excessCalories={excessKcal}
      />

      {/* МОДАЛКА КАСТРУЛІ (COOK-LOSS) */}
      {cookLossOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-sm rounded-[30px] p-4 bg-[#121814] border border-white/10 relative max-h-[90vh] overflow-y-auto">
            <button
              type="button"
              onClick={() => setCookLossOpen(false)}
              className="absolute top-4 right-4 w-7 h-7 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-zinc-400 hover:text-white"
            >
              ✕
            </button>
            <CookLossCalculator />
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
