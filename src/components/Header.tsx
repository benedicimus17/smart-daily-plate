import React, { useState } from 'react';
import { Calendar, ChevronLeft, ChevronRight, RotateCcw, Crown, Lock, Share2 } from 'lucide-react';
import { useNutritionStore } from '../store/nutritionStore';
import { useUserStore } from '../store/userStore';

interface HeaderProps {
  date: string;
  onOpenSplash?: () => void;
  hideCalendarButton?: boolean;
  onOpenProModal?: () => void;
  onResetTestUser?: () => void;
  onOpenShareModal?: () => void;
}

const formatLocalDate = (d: Date): string => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

export const Header: React.FC<HeaderProps> = ({
  onOpenSplash,
  hideCalendarButton,
  onOpenProModal,
  onResetTestUser,
  onOpenShareModal
}) => {
  const { selectedDate, setSelectedDate } = useNutritionStore();
  const { user, resetToNewGuestUser } = useUserStore();
  // weekOffset: 0 - поточний тиждень, -1 - попередній тиждень, -2 - два тижні тому, etc.
  const [weekOffset, setWeekOffset] = useState<number>(0);

  // Обчислення понеділка для обраного тижня
  const baseDate = new Date(); // сьогодні
  const currentDayOfWeek = baseDate.getDay(); // 0 (Нд) .. 6 (Сб)
  const daysToMonday = currentDayOfWeek === 0 ? -6 : 1 - currentDayOfWeek;
  
  const monday = new Date(baseDate);
  monday.setDate(baseDate.getDate() + daysToMonday + weekOffset * 7);

  // Створюємо масив з 7 днів тижня
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

  const weekStartStr = `${days[0].dayNum} ${days[0].monthName}`;
  const weekEndStr = `${days[6].dayNum} ${days[6].monthName}`;

  const todayDateStr = formatLocalDate(new Date());

  const handleGoToday = () => {
    setWeekOffset(0);
    setSelectedDate(todayDateStr);
  };

  const selectedDateObj = new Date(selectedDate + 'T12:00:00');
  const selectedFormatted = selectedDateObj.toLocaleDateString('uk-UA', {
    weekday: 'long',
    day: 'numeric',
    month: 'long'
  });
  const capitalizedSelected = selectedFormatted.charAt(0).toUpperCase() + selectedFormatted.slice(1);

  const [showDatePicker, setShowDatePicker] = useState(false);

  return (
    <header className="pt-2 pb-1 select-none relative">
      {/* Центрована шапка в стилі еталонного макета Layout 2 */}
      <div className="relative flex flex-col items-center justify-center text-center pt-1">
        {/* Кнопки керування в кутах (акуратні, напівпрозорі, не руйнують симетрію) */}
        {!hideCalendarButton && (
          <button
            type="button"
            onClick={() => setShowDatePicker(!showDatePicker)}
            className="absolute left-0 top-1.5 w-8 h-8 rounded-full bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-zinc-400 hover:text-amber-300 hover:border-amber-400/30 transition-all active:scale-95"
            title="Вибір дати"
          >
            <Calendar className="w-3.5 h-3.5" />
          </button>
        )}

        {onOpenShareModal && (
          <button
            id="btn-header-share-daily"
            type="button"
            onClick={onOpenShareModal}
            className="absolute left-9.5 top-1.5 w-8 h-8 rounded-full bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-zinc-400 hover:text-amber-300 hover:border-amber-400/30 transition-all active:scale-95 cursor-pointer"
            title="Поділитися в Stories / соцмережах"
          >
            <Share2 className="w-3.5 h-3.5" />
          </button>
        )}

        {onOpenSplash && (
          <button
            type="button"
            onClick={onOpenSplash}
            className="absolute right-0 top-1.5 px-2 py-1 rounded-full bg-white/[0.04] border border-white/[0.08] text-[10px] font-bold tracking-wider text-zinc-300 hover:text-amber-300 transition-all active:scale-95"
            title="Завантажувальний екран NUTRIQ"
          >
            NUTRI<span className="text-amber-400">Q</span>
          </button>
        )}

        <h1 className="text-[26px] sm:text-[28px] font-bold tracking-[-0.02em] text-[#F7F9F7] leading-tight">
          Today’s Balance
        </h1>
        <p className="text-[13px] text-[#A2B2A7] font-normal tracking-tight mt-0.5">
          {capitalizedSelected}
        </p>
        <p className="text-[13px] text-[#C5D1C8] font-medium tracking-tight leading-snug">
          Hello, {user.name || 'Alistair'}!
        </p>

        {/* Панель швидкого тестування (Новий користувач + Статус FREE / PRO) */}
        <div className="flex items-center gap-1.5 mt-1.5">
          <button
            id="btn-header-reset-test"
            type="button"
            onClick={() => {
              resetToNewGuestUser();
              onResetTestUser?.();
            }}
            className="px-2.5 py-1 rounded-full bg-white/[0.04] hover:bg-white/[0.09] border border-white/10 text-[10px] font-bold text-zinc-300 hover:text-white flex items-center gap-1 transition-all active:scale-95 cursor-pointer"
            title="Скинути стан користувача для повторного проходження анкети"
          >
            <RotateCcw className="w-3 h-3 text-amber-400" />
            <span>Тест нового юзера</span>
          </button>

          <button
            id="btn-header-pro-status"
            type="button"
            onClick={onOpenProModal}
            className={`px-2.5 py-1 rounded-full border text-[10px] font-extrabold flex items-center gap-1 transition-all active:scale-95 cursor-pointer ${
              user.isPro
                ? 'bg-amber-400/20 border-amber-400/60 text-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.25)]'
                : 'bg-white/[0.04] border-white/10 text-zinc-400 hover:text-amber-300 hover:border-amber-400/30'
            }`}
            title="Керування статусом підписки (FREE / PRO)"
          >
            {user.isPro ? (
              <>
                <Crown className="w-3 h-3 text-amber-400 stroke-[2.5]" />
                <span>PRO</span>
              </>
            ) : (
              <>
                <Lock className="w-3 h-3 text-zinc-400" />
                <span>FREE <span className="text-amber-400/90 font-bold">• PRO</span></span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Компактний випадаючий вибір днів тижня (з'являється лише при кліку на календар) */}
      {showDatePicker && (
        <div className="mt-3 p-3 rounded-2xl liquid-glass z-30 animate-fadeIn">
          <div className="flex items-center justify-between mb-2 px-1">
            <span className="text-[11px] font-bold text-amber-300 uppercase tracking-wider">
              {weekStartStr} – {weekEndStr}
            </span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setWeekOffset(prev => prev - 1)}
                className="p-1 rounded-lg hover:bg-white/5 text-zinc-400 hover:text-zinc-200"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={handleGoToday}
                className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/30"
              >
                Сьогодні
              </button>
              <button
                type="button"
                onClick={() => setWeekOffset(prev => prev + 1)}
                className="p-1 rounded-lg hover:bg-white/5 text-zinc-400 hover:text-zinc-200"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
          <div className="grid grid-cols-7 gap-1.5">
            {days.map((item) => {
              const isSelected = item.date === selectedDate;
              return (
                <button
                  key={item.date}
                  type="button"
                  onClick={() => {
                    setSelectedDate(item.date);
                    setShowDatePicker(false);
                  }}
                  className={`py-1.5 rounded-xl flex flex-col items-center justify-center text-xs transition-all ${
                    isSelected
                      ? 'bg-amber-400 text-zinc-950 font-black shadow-lg shadow-amber-500/30'
                      : item.isToday
                      ? 'bg-amber-500/15 border border-amber-500/40 text-amber-300 font-bold'
                      : 'bg-white/[0.04] text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  <span className="text-[9px] uppercase">{item.shortName}</span>
                  <span className="text-xs font-bold">{item.dayNum}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </header>
  );
};
