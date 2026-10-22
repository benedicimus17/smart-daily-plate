import React, { useState, useEffect } from 'react';
import { useNutritionStore } from '../store/nutritionStore';
import { useUserStore } from '../store/userStore';
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
  ChevronRight as ChevronRightIcon,
  Clock,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

interface LogScreenProps {
  onOpenQuickAdd?: (mealType: MealType) => void;
  onOpenProModal?: () => void;
}

const formatLocalDate = (d: Date): string => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

const timeToMinutes = (t?: string): number => {
  if (!t) return 0;
  const [h, m] = t.split(':').map(Number);
  return (isNaN(h) ? 0 : h) * 60 + (isNaN(m) ? 0 : m);
};

const CATEGORY_LABELS: Record<MealType, string> = {
  breakfast: 'Сніданок',
  snack: 'Перекус',
  lunch: 'Обід',
  dinner: 'Вечеря'
};

export const LogScreen: React.FC<LogScreenProps> = ({ onOpenQuickAdd: _onOpenQuickAdd, onOpenProModal }) => {
  const { user } = useUserStore();
  const {
    dailyLog,
    selectedDate,
    setSelectedDate,
    removeFoodFromMeal,
    addFoodToMeal,
    toggleMealEaten,
    updateMealEntry,
    generateMenuForTargets
  } = useNutritionStore();

  const [balancerOpen, setBalancerOpen] = useState(false);
  const [cookLossOpen, setCookLossOpen] = useState(false);
  const [diningOpen, setDiningOpen] = useState(false);
  const [quickAddConfig, setQuickAddConfig] = useState<{ mealType: MealType; initialTime?: string } | null>(null);

  // Стан для модалки деталей страви
  const [selectedDish, setSelectedDish] = useState<{ mealType: MealType; entry: MealEntry } | null>(null);

  // Стан редагування часу на картці
  const [editingTimeId, setEditingTimeId] = useState<string | null>(null);

  // ШІ-Балансувальник: ручне скидання при зміні дати
  const [isManuallyBalanced, setIsManuallyBalanced] = useState(false);

  useEffect(() => {
    setIsManuallyBalanced(false);
  }, [selectedDate]);

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
    setIsManuallyBalanced(true);
    setBalancerOpen(false);
  };

  const handleApplySwap = (_mealType: string, newDishName: string, newMacros: { calories: number; protein: number; fat: number; carbs: number }) => {
    addFoodToMeal('dinner', {
      foodId: `swap-${Date.now()}`,
      name: newDishName,
      weightGrams: 200,
      macros: newMacros,
      eaten: true,
      timestamp: '19:30'
    });
    setIsManuallyBalanced(true);
    setBalancerOpen(false);
  };

  const handleApplyFlexBank = (_excess: number) => {
    setIsManuallyBalanced(true);
    setBalancerOpen(false);
  };

  // Збираємо всі страви поточного дня та сортуємо їх ХРОНОЛОГІЧНО ЗА ЧАСОМ
  const timelineEntries = (['breakfast', 'snack', 'lunch', 'dinner'] as MealType[]).flatMap(type => {
    const cat = dailyLog.meals[type];
    if (!cat || !cat.entries) return [];
    return cat.entries.map(entry => ({
      mealType: type,
      categoryTitle: CATEGORY_LABELS[type],
      entry,
      timeMinutes: timeToMinutes(entry.timestamp)
    }));
  });

  timelineEntries.sort((a, b) => a.timeMinutes - b.timeMinutes);

  // 1. Повний динамічний розрахунок макросів ВСЬОГО меню на обраний день (як запланованих, так і з'їдених)
  const dayPlannedMacros = timelineEntries.reduce(
    (acc, item) => {
      acc.calories += item.entry.macros.calories || 0;
      acc.protein += item.entry.macros.protein || 0;
      acc.fat += item.entry.macros.fat || 0;
      acc.carbs += item.entry.macros.carbs || 0;
      if (item.entry.eaten !== false) {
        acc.eatenCalories += item.entry.macros.calories || 0;
      } else {
        acc.plannedCalories += item.entry.macros.calories || 0;
      }
      return acc;
    },
    { calories: 0, protein: 0, fat: 0, carbs: 0, eatenCalories: 0, plannedCalories: 0 }
  );

  const targetCalories = dailyLog.targets.calories || 2150;
  const targetProtein = dailyLog.targets.protein || 180;
  const targetFat = dailyLog.targets.fat || 80;
  const targetCarbs = dailyLog.targets.carbs || 270;

  // Динамічний надлишок (тільки якщо реальне перевищення цілі більше 50 ккал)
  const calDelta = dayPlannedMacros.calories - targetCalories;
  const isOverLimit = calDelta > 50 && !isManuallyBalanced;
  const excessKcal = Math.max(0, calDelta);

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

      {/* 2. ГОЛОВНЕ ЗВЕДЕННЯ: ЗАГАЛЬНЕ МЕНЮ НА ОБРАНИЙ ДЕНЬ */}
      <div
        className="rounded-3xl p-4 relative overflow-hidden text-white border border-white/10 shadow-lg"
        style={{
          background: 'linear-gradient(165deg, rgba(20,29,23,0.96) 0%, rgba(12,17,14,0.99) 100%)',
          boxShadow: '0 12px 32px rgba(0,0,0,0.6)'
        }}
      >
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-400 block">
              Загальне меню на день
            </span>
            <h3 className="text-sm font-black text-white flex items-center gap-1.5 mt-0.5">
              <span>{dailyLog.date}</span>
              <span className="text-[11px] font-medium text-zinc-400">• {timelineEntries.length} {timelineEntries.length === 1 ? 'страва' : timelineEntries.length < 5 ? 'страви' : 'страв'}</span>
            </h3>
          </div>

          {/* Статус-бейдж балансу */}
          {Math.abs(calDelta) <= 50 ? (
            <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10.5px] font-extrabold flex items-center gap-1 shadow-sm">
              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
              <span>Баланс 100%</span>
            </span>
          ) : calDelta > 50 ? (
            <span className="px-2.5 py-1 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40 text-[10.5px] font-extrabold flex items-center gap-1 shadow-sm">
              <AlertCircle className="w-3 h-3 text-rose-400" />
              <span>+{calDelta} ккал понад норму</span>
            </span>
          ) : (
            <span className="px-2.5 py-1 rounded-full bg-amber-400/15 text-amber-300 border border-amber-400/30 text-[10.5px] font-extrabold flex items-center gap-1 shadow-sm">
              <span>Залишок: {Math.abs(calDelta)} ккал</span>
            </span>
          )}
        </div>

        {/* ДВА ГОЛОВНІ ПОКАЗНИКИ: З'ЇДЕНО ЗАРАЗ ТА ПЛАН МЕНЮ НА ДЕНЬ */}
        <div className="grid grid-cols-2 gap-2.5 pt-3 pb-1">
          {/* 1. З'ЇДЕНО ЗАРАЗ (Смарагдова картка, моментально реагує на галочки) */}
          <div className="p-2.5 rounded-2xl bg-black/45 border border-emerald-500/30 flex flex-col justify-between shadow-inner">
            <div>
              <div className="text-[10px] font-extrabold uppercase tracking-wide text-emerald-400 flex items-center gap-1">
                <Check className="w-3 h-3 stroke-[3]" />
                <span>З'їдено зараз</span>
              </div>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-2xl font-black text-white font-mono tracking-tight">
                  {dayPlannedMacros.eatenCalories}
                </span>
                <span className="text-[10px] text-zinc-400 font-bold">
                  / {targetCalories}
                </span>
              </div>
            </div>

            <div className="mt-2">
              <div className="flex justify-between text-[9.5px] text-zinc-400 mb-1 font-semibold">
                <span className="text-emerald-400">{Math.round((dayPlannedMacros.eatenCalories / (targetCalories || 1)) * 100)}%</span>
                <span>факт</span>
              </div>
              <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(100, (dayPlannedMacros.eatenCalories / (targetCalories || 1)) * 100)}%` }}
                />
              </div>
            </div>
          </div>

          {/* 2. ВСЬОГО В МЕНЮ (Бурштинова картка: повний план на день) */}
          <div className="p-2.5 rounded-2xl bg-black/45 border border-amber-400/30 flex flex-col justify-between shadow-inner">
            <div>
              <div className="text-[10px] font-extrabold uppercase tracking-wide text-amber-300 flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                <span>Меню на день</span>
              </div>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-2xl font-black text-white font-mono tracking-tight">
                  {dayPlannedMacros.calories}
                </span>
                <span className="text-[10px] text-zinc-400 font-bold">
                  / {targetCalories}
                </span>
              </div>
            </div>

            <div className="mt-2">
              <div className="flex justify-between text-[9.5px] text-zinc-400 mb-1 font-semibold">
                <span className="text-amber-300 font-bold truncate">
                  {dayPlannedMacros.plannedCalories > 0 ? `Залишок: ${dayPlannedMacros.plannedCalories} ккал` : '✓ Все з\'їдено'}
                </span>
                <span>план</span>
              </div>
              <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${
                    isOverLimit ? 'bg-gradient-to-r from-amber-400 to-rose-500' : 'bg-gradient-to-r from-amber-400 to-amber-500'
                  }`}
                  style={{ width: `${Math.min(100, (dayPlannedMacros.calories / (targetCalories || 1)) * 100)}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* 3 шкали БЖУ для всього дня */}
        <div className="grid grid-cols-3 gap-2 pt-1 text-center">
          <div className="p-2 rounded-xl bg-black/40 border border-emerald-500/20">
            <span className="text-[9.5px] uppercase font-bold text-emerald-400 block">Білок</span>
            <span className="text-xs font-black text-white font-mono">{dayPlannedMacros.protein}г</span>
            <span className="text-[9px] text-zinc-500 block">/ {targetProtein}г</span>
          </div>
          <div className="p-2 rounded-xl bg-black/40 border border-amber-500/20">
            <span className="text-[9.5px] uppercase font-bold text-amber-400 block">Жири</span>
            <span className="text-xs font-black text-white font-mono">{dayPlannedMacros.fat}г</span>
            <span className="text-[9px] text-zinc-500 block">/ {targetFat}г</span>
          </div>
          <div className="p-2 rounded-xl bg-black/40 border border-sky-500/20">
            <span className="text-[9.5px] uppercase font-bold text-sky-400 block">Вуглеводи</span>
            <span className="text-xs font-black text-white font-mono">{dayPlannedMacros.carbs}г</span>
            <span className="text-[9px] text-zinc-500 block">/ {targetCarbs}г</span>
          </div>
        </div>

        {/* Кнопка ШІ-підгонки раціону під цільовий ліміт та протеїн (при відхиленні понад 50 ккал) */}
        {Math.abs(calDelta) > 50 && (
          <div className="pt-2.5">
            <button
              id="btn-auto-align-menu"
              type="button"
              onClick={() => {
                generateMenuForTargets(dailyLog.targets, user.eatingRhythm || '3_meals');
              }}
              className="w-full py-2.5 px-3 rounded-2xl bg-gradient-to-r from-amber-400/20 via-emerald-400/20 to-amber-400/20 hover:from-amber-400/30 hover:to-emerald-400/30 border border-amber-400/50 hover:border-amber-400 text-amber-300 font-extrabold text-[11px] flex items-center justify-center gap-2 shadow-sm transition-all active:scale-[0.98] cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>
                {calDelta < 0
                  ? `Недобір: ${Math.abs(calDelta)} ккал • Авто-заповнити меню під ${targetCalories} ккал`
                  : `Перебір: +${calDelta} ккал • Авто-збалансувати меню під ${targetCalories} ккал`}
              </span>
            </button>
          </div>
        )}
      </div>

      {/* 3. КОМПАКТНА ШІ-ПЛАШКА БАЛАНСУВАННЯ (З'являється ТІЛЬКИ при реальному перевищенні цілі) */}
      {isOverLimit && (
        <div className="p-2.5 rounded-2xl bg-rose-500/15 border border-rose-500/40 flex items-center justify-between animate-fadeIn">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-rose-400 animate-ping shrink-0" />
            <div>
              <div className="text-[11px] font-bold text-rose-200">
                Перевищення ліміту дня +{excessKcal} ккал
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

      {/* 4. ДИНАМІЧНИЙ ХРОНОЛОГІЧНИЙ РОЗКЛАД ДНЯ (СОРТУВАННЯ ЗА ЧАСОМ) */}
      <div className="space-y-3">
        {timelineEntries.length > 0 ? (
          timelineEntries.map(({ mealType, categoryTitle, entry }) => {
            const isEaten = entry.eaten !== false;
            const isEditingTime = editingTimeId === entry.id;

            return (
              <div
                key={entry.id}
                className={`rounded-3xl p-3.5 transition-all ${
                  isEaten
                    ? 'bg-black/25 border border-white/5 opacity-65'
                    : 'bg-black/45 border border-white/10 opacity-100 shadow-sm'
                }`}
              >
                {/* Шапка прийому: Година (редагована) + Категорія + Ціль + Кнопка [+] */}
                <div className="flex items-center justify-between pb-2 border-b border-white/5">
                  <div className="flex items-center gap-2">
                    {/* Кнопка зміни часу прямо на плашці */}
                    {!isEditingTime ? (
                      <button
                        type="button"
                        onClick={() => setEditingTimeId(entry.id)}
                        className={`text-[11px] font-black px-2 py-0.5 rounded-lg border flex items-center gap-1 transition-all ${
                          isEaten
                            ? 'bg-zinc-800 text-zinc-400 border-zinc-700'
                            : 'bg-amber-400/15 border-amber-400/30 text-amber-300 hover:border-amber-400/60'
                        }`}
                        title="Натисніть щоб змінити час"
                      >
                        <Clock className="w-2.5 h-2.5" />
                        <span>{entry.timestamp || '08:30'}</span>
                        <span className="text-[9px] opacity-60">✎</span>
                      </button>
                    ) : (
                      <div className="flex items-center gap-1 bg-black/80 p-0.5 rounded-lg border border-amber-400">
                        <input
                          type="time"
                          defaultValue={entry.timestamp || '08:30'}
                          onBlur={(e) => {
                            updateMealEntry(mealType, entry.id, { timestamp: e.target.value });
                            setEditingTimeId(null);
                          }}
                          onChange={(e) => {
                            updateMealEntry(mealType, entry.id, { timestamp: e.target.value });
                          }}
                          autoFocus
                          className="bg-transparent text-amber-300 font-black text-[11px] px-1 focus:outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => setEditingTimeId(null)}
                          className="px-1.5 py-0.5 rounded bg-amber-400 text-zinc-950 text-[9.5px] font-black"
                        >
                          OK
                        </button>
                      </div>
                    )}

                    <h4 className={`text-sm font-bold tracking-tight ${isEaten ? 'text-zinc-400' : 'text-white'}`}>
                      {categoryTitle}
                    </h4>

                    <span className="text-[10px] text-zinc-500">
                      • {entry.macros.calories} ккал
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => setQuickAddConfig({ mealType, initialTime: entry.timestamp })}
                    className="p-1 rounded-lg bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white transition-all active:scale-95"
                    title="Додати страву в цей прийом"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                {/* Рядок страви: Інтерактивний чекбокс + Текст + Деталі */}
                <div
                  id={`log-meal-row-${entry.id}`}
                  onClick={() => setSelectedDish({ mealType, entry })}
                  className="pt-2.5 flex items-center justify-between cursor-pointer group hover:bg-white/[0.02] px-1 rounded-xl transition-all"
                >
                  {/* Інтерактивна галочка з'їденого (виразне приглушення при виконанні) */}
                  <div className="flex items-center gap-2.5 flex-1 min-w-0 pr-2">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleMealEaten(mealType, entry.id);
                      }}
                      className={`w-5 h-5 rounded-full flex items-center justify-center transition-all shrink-0 active:scale-90 ${
                        isEaten
                          ? 'bg-emerald-400 text-zinc-950 shadow-sm shadow-emerald-400/30'
                          : 'border-2 border-white/30 bg-black/40 hover:border-amber-400'
                      }`}
                      title={isEaten ? 'Позначено як з\'їдено' : 'Позначити з\'їденим'}
                    >
                      {isEaten && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </button>

                    {/* Інформація про страву (тьмяніша і закреслена якщо виконано) */}
                    <div className="min-w-0">
                      <div
                        className={`text-xs font-bold truncate transition-all ${
                          isEaten
                            ? 'line-through decoration-zinc-500 text-zinc-500'
                            : 'text-zinc-100'
                        }`}
                      >
                        {entry.name}
                      </div>
                      <div
                        className={`text-[10.5px] flex items-center gap-1.5 flex-wrap mt-0.5 ${
                          isEaten ? 'text-zinc-600' : 'text-zinc-400'
                        }`}
                      >
                        <span>{entry.weightGrams}г</span>
                        <span>•</span>
                        <span className={isEaten ? 'text-zinc-500' : 'text-amber-300 font-bold'}>
                          {entry.macros.calories} ккал
                        </span>
                        <span>•</span>
                        <span className={isEaten ? 'text-zinc-500' : 'text-emerald-400/90'}>
                          {entry.macros.protein}г Б
                        </span>
                        <span>•</span>
                        <span className={isEaten ? 'text-zinc-500' : 'text-amber-400/80'}>
                          {entry.macros.fat}г Ж
                        </span>
                        <span>•</span>
                        <span className={isEaten ? 'text-zinc-500' : 'text-indigo-400/80'}>
                          {entry.macros.carbs}г В
                        </span>
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
                        removeFoodFromMeal(mealType, entry.id);
                      }}
                      className="p-1 text-zinc-600 hover:text-rose-400 transition-colors ml-1"
                      title="Видалити"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="p-8 text-center bg-black/30 rounded-3xl border border-white/5 text-zinc-500 text-xs">
            На цей день ще немає запланованих прийомів їжі.
          </div>
        )}
      </div>

      {/* 5. КНОПКА ДОДАВАННЯ СВОГО ПРИЙОМУ ЇЖІ АБО ПЕРЕКУСУ */}
      <button
        type="button"
        onClick={() => setQuickAddConfig({ mealType: 'snack', initialTime: '11:00' })}
        className="w-full py-3.5 rounded-2xl bg-white/[0.04] border border-dashed border-white/20 hover:border-amber-400/50 text-xs font-bold text-zinc-300 hover:text-amber-300 flex items-center justify-center gap-2 transition-all active:scale-[0.99] cursor-pointer"
      >
        <Plus className="w-4 h-4 text-amber-400" />
        <span>+ Додати свій прийом їжі або перекус (наприклад, 11:00)</span>
      </button>

      {/* МОДАЛКА ДЕТАЛЕЙ СТРАВИ (ФОТО, ТОЧНІ ГРАМИ, РЕЦЕПТ, ЗМІНА ЧАСУ) */}
      <DishDetailModal
        isOpen={selectedDish !== null}
        mealType={selectedDish?.mealType || null}
        entry={selectedDish?.entry || null}
        onClose={() => setSelectedDish(null)}
        onToggleEaten={toggleMealEaten}
        onRemove={removeFoodFromMeal}
        onUpdateTime={(mealType, entryId, newTime) => {
          updateMealEntry(mealType, entryId, { timestamp: newTime });
          if (selectedDish) {
            setSelectedDish({
              ...selectedDish,
              entry: { ...selectedDish.entry, timestamp: newTime }
            });
          }
        }}
        onSwapDish={(mealType, entryId, newDish) => {
          updateMealEntry(mealType, entryId, {
            name: newDish.name,
            weightGrams: newDish.weightGrams,
            macros: newDish.macros,
            recipeDetails: newDish.recipeDetails
          });
          setSelectedDish(null);
        }}
        onOpenProModal={onOpenProModal}
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
        onAddMeal={(type, data) => addFoodToMeal(type, { ...data, eaten: true, foodId: `dining-${Date.now()}`, timestamp: '19:30' })}
      />

      {/* МОДАЛКА ШВИДКОГО ДОДАВАННЯ СТРАВИ З ВИБОРОМ ЧАСУ ТА ШЕЙКІВ */}
      <QuickAddModal
        isOpen={quickAddConfig !== null}
        mealType={quickAddConfig?.mealType || null}
        initialTime={quickAddConfig?.initialTime}
        onClose={() => setQuickAddConfig(null)}
        onAdd={(type, data) => {
          addFoodToMeal(type, { ...data, eaten: true, foodId: `item-${Date.now()}` });
          setQuickAddConfig(null);
        }}
      />
    </div>
  );
};
