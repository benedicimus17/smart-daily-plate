import React from 'react';
import { Calendar, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import { useNutritionStore } from '../store/nutritionStore';

interface HeaderProps {
  date: string;
}

const WEEK_DAYS = [
  { shortName: 'ПН', dayNum: 19, date: '2026-10-19', isToday: true },
  { shortName: 'ВТ', dayNum: 20, date: '2026-10-20', isToday: false },
  { shortName: 'СР', dayNum: 21, date: '2026-10-21', isToday: false },
  { shortName: 'ЧТ', dayNum: 22, date: '2026-10-22', isToday: false },
  { shortName: 'ПТ', dayNum: 23, date: '2026-10-23', isToday: false },
  { shortName: 'СБ', dayNum: 24, date: '2026-10-24', isToday: false },
  { shortName: 'НД', dayNum: 25, date: '2026-10-25', isToday: false },
];

export const Header: React.FC<HeaderProps> = () => {
  const { selectedDate, setSelectedDate } = useNutritionStore();

  const todayFormatted = new Intl.DateTimeFormat('uk-UA', {
    weekday: 'long',
    day: 'numeric',
    month: 'long'
  }).format(new Date());

  const capitalizedDate = todayFormatted.charAt(0).toUpperCase() + todayFormatted.slice(1);

  return (
    <header className="pt-2 pb-3 mb-2 space-y-3 select-none">
      {/* Верхній рядок: Бренд NUTRIQ + Дзен Статус */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-1.5 text-[11px] font-semibold tracking-wider text-amber-400/90 uppercase">
            <span>МЕНЮ FIT</span>
            <span className="text-zinc-600">•</span>
            <span className="text-zinc-400 font-normal">{capitalizedDate}</span>
          </div>

          {/* Фірмовий логотип NUTRIQ із золотою Q */}
          <div className="flex items-baseline gap-1 mt-0.5">
            <span className="text-2xl font-black tracking-wider text-zinc-100 font-sans">
              NUTRI<span className="text-amber-400 text-3xl font-black drop-shadow-[0_0_12px_rgba(245,158,11,0.5)]">Q</span>
            </span>
            <span className="text-[10px] tracking-widest text-zinc-400 font-medium uppercase ml-2 hidden sm:inline">
              Intelligent Nutrition
            </span>
          </div>
        </div>

        {/* Дзен-бейдж */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-zinc-900/80 border border-zinc-700/60 shadow-lg text-xs font-semibold text-zinc-300 backdrop-blur-md">
            <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)] animate-pulse" />
            <span className="text-[11px] font-bold text-amber-300">Cook-Loss</span>
            <Sparkles className="w-3 h-3 text-amber-400" />
          </div>
        </div>
      </div>

      {/* Рядок тижня та навігація */}
      <div className="flex items-center justify-between px-0.5">
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="w-7 h-7 rounded-full bg-zinc-900/80 border border-zinc-800 hover:border-zinc-700 text-zinc-400 hover:text-zinc-200 flex items-center justify-center transition-all active:scale-95"
            title="Попередній тиждень"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          
          <div className="text-xs font-medium text-zinc-300 flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5 text-amber-400/80" />
            <span>Цей тиждень: <strong className="text-zinc-100 font-semibold">19–25 жовтня</strong></span>
          </div>

          <button
            type="button"
            className="w-7 h-7 rounded-full bg-zinc-900/80 border border-zinc-800 hover:border-zinc-700 text-zinc-400 hover:text-zinc-200 flex items-center justify-center transition-all active:scale-95"
            title="Наступний тиждень"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <button
          type="button"
          onClick={() => setSelectedDate('2026-10-19')}
          className="text-[11px] font-semibold text-amber-300/90 hover:text-amber-200 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 px-2.5 py-1 rounded-full transition-all active:scale-95"
        >
          Сьогодні
        </button>
      </div>

      {/* Стрічка днів тижня (Weekly Day Strip) */}
      <div className="grid grid-cols-7 gap-1.5 p-1.5 rounded-2xl bg-zinc-950/60 border border-zinc-800/80 backdrop-blur-xl">
        {WEEK_DAYS.map((d) => {
          const isSelected = selectedDate === d.date;

          return (
            <button
              key={d.date}
              type="button"
              onClick={() => setSelectedDate(d.date)}
              className={`flex flex-col items-center justify-center py-2 px-1 rounded-xl transition-all duration-200 ${
                isSelected
                  ? 'bg-gradient-to-b from-amber-400/20 to-amber-500/10 border border-amber-400/60 text-amber-200 shadow-[0_0_15px_rgba(245,158,11,0.2)]'
                  : 'bg-zinc-900/40 hover:bg-zinc-900/80 border border-transparent text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <span className={`text-[10px] font-bold tracking-wider ${isSelected ? 'text-amber-300' : 'text-zinc-500'}`}>
                {d.shortName}
              </span>
              <span className={`text-sm font-extrabold mt-0.5 ${isSelected ? 'text-zinc-50' : 'text-zinc-300'}`}>
                {d.dayNum}
              </span>
              {/* Крапка статусу дня */}
              <span className={`w-1 h-1 rounded-full mt-1 ${
                isSelected ? 'bg-amber-400' : d.isToday ? 'bg-emerald-400' : 'bg-transparent'
              }`} />
            </button>
          );
        })}
      </div>
    </header>
  );
};
