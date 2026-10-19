import React, { useState } from 'react';
import { Calendar, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import { useNutritionStore } from '../store/nutritionStore';

interface HeaderProps {
  date: string;
}

const formatLocalDate = (d: Date): string => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

export const Header: React.FC<HeaderProps> = () => {
  const { selectedDate, setSelectedDate } = useNutritionStore();
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

  return (
    <header className="pt-2 pb-3 mb-2 space-y-3 select-none">
      {/* Верхній рядок: Бренд NUTRIQ + Дзен Статус */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-1.5 text-[11px] font-semibold tracking-wider text-amber-400/90 uppercase">
            <span>NUTRIQ FIT</span>
            <span className="text-zinc-600">•</span>
            <span className="text-zinc-300 font-normal">{capitalizedSelected}</span>
          </div>

          {/* Фірмовий логотип NUTRIQ із золотою Q */}
          <div className="flex items-baseline gap-1 mt-0.5">
            <span className="text-2xl font-black tracking-wider text-zinc-100 font-sans">
              NUTRI<span className="text-amber-400 text-3xl font-black drop-shadow-[0_0_12px_rgba(245,158,11,0.6)]">Q</span>
            </span>
            <span className="text-[10px] tracking-widest text-zinc-400 font-medium uppercase ml-2 hidden sm:inline">
              Intelligent Nutrition
            </span>
          </div>
        </div>

        {/* Дзен-бейдж статусу Cook-Loss */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#121814]/90 border border-[#233226]/80 shadow-lg text-xs font-semibold text-zinc-300 backdrop-blur-md">
            <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)] animate-pulse" />
            <span className="text-[11px] font-bold text-amber-300">Cook-Loss</span>
            <Sparkles className="w-3 h-3 text-amber-400" />
          </div>
        </div>
      </div>

      {/* Рядок тижня та навігація (гортання без обмежень назад і вперед) */}
      <div className="flex items-center justify-between px-0.5">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setWeekOffset(prev => prev - 1)}
            className="w-7 h-7 rounded-full bg-[#121814]/90 border border-[#233226]/80 hover:border-amber-500/40 text-zinc-400 hover:text-zinc-200 flex items-center justify-center transition-all active:scale-95"
            title="Попередній тиждень"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          
          <div className="text-xs font-medium text-zinc-300 flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5 text-amber-400/80" />
            <span>Тиждень: <strong className="text-zinc-100 font-semibold">{weekStartStr} – {weekEndStr}</strong></span>
          </div>

          <button
            type="button"
            onClick={() => setWeekOffset(prev => prev + 1)}
            className="w-7 h-7 rounded-full bg-[#121814]/90 border border-[#233226]/80 hover:border-amber-500/40 text-zinc-400 hover:text-zinc-200 flex items-center justify-center transition-all active:scale-95"
            title="Наступний тиждень"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <button
          type="button"
          onClick={handleGoToday}
          className={`text-[11px] font-semibold px-2.5 py-1 rounded-full transition-all active:scale-95 ${
            selectedDate === todayDateStr
              ? 'text-amber-400 bg-amber-500/20 border border-amber-400/50 shadow-sm'
              : 'text-zinc-400 bg-[#121814]/90 border border-[#233226]/80 hover:text-zinc-200'
          }`}
        >
          Сьогодні
        </button>
      </div>

      {/* Стрічка 7 днів тижня з можливістю вибору будь-якого дня */}
      <div className="grid grid-cols-7 gap-1.5 p-1.5 rounded-2xl bg-[#0F1411]/90 border border-[#202C23]/80 backdrop-blur-xl">
        {days.map((d) => {
          const isSelected = selectedDate === d.date;

          return (
            <button
              key={d.date}
              type="button"
              onClick={() => setSelectedDate(d.date)}
              className={`flex flex-col items-center justify-center py-2 px-1 rounded-xl transition-all duration-200 ${
                isSelected
                  ? 'bg-gradient-to-b from-amber-400/25 to-amber-500/10 border border-amber-400/70 text-amber-200 shadow-[0_0_15px_rgba(245,158,11,0.25)]'
                  : 'bg-[#141C16]/50 hover:bg-[#18221B] border border-transparent text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <span className={`text-[10px] font-bold tracking-wider ${isSelected ? 'text-amber-300' : 'text-zinc-400'}`}>
                {d.shortName}
              </span>
              <span className={`text-sm font-extrabold mt-0.5 ${isSelected ? 'text-zinc-50' : 'text-zinc-300'}`}>
                {d.dayNum}
              </span>
              {/* Крапка статусу дня */}
              <span className={`w-1 h-1 rounded-full mt-1 ${
                isSelected ? 'bg-amber-400 shadow-[0_0_6px_rgba(251,191,36,0.8)]' : d.isToday ? 'bg-emerald-400' : 'bg-transparent'
              }`} />
            </button>
          );
        })}
      </div>
    </header>
  );
};
