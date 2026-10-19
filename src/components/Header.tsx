import React, { useState } from 'react';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { useNutritionStore } from '../store/nutritionStore';

interface HeaderProps {
  date: string;
  onOpenSplash?: () => void;
}

const formatLocalDate = (d: Date): string => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

export const Header: React.FC<HeaderProps> = ({ onOpenSplash }) => {
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

  const [showDatePicker, setShowDatePicker] = useState(false);

  return (
    <header className="pt-2 pb-1 select-none relative">
      {/* Верхній рядок: Чистий мінімалістичний дзен Layout 2 */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-zinc-100 font-sans">
            Today's Balance
          </h1>
          <div className="flex items-center gap-2 mt-1 text-xs text-zinc-400 font-medium">
            <span>{capitalizedSelected}</span>
            <span>•</span>
            <span className="text-zinc-300">Привіт!</span>
          </div>
        </div>

        {/* Дії: календар та логотип */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowDatePicker(!showDatePicker)}
            className="w-9 h-9 rounded-full bg-[#141C16] border border-[#233326] flex items-center justify-center text-zinc-300 hover:text-amber-400 hover:border-amber-500/40 transition-all active:scale-95 shadow-sm"
            title="Календар днів"
          >
            <Calendar className="w-4 h-4" />
          </button>
          {onOpenSplash && (
            <button
              type="button"
              onClick={onOpenSplash}
              className="px-2.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-xs font-bold text-amber-300 hover:bg-amber-500/20 transition-all"
              title="Завантажувальний екран NUTRIQ"
            >
              NUTRI<span className="text-amber-400">Q</span>
            </button>
          )}
        </div>
      </div>

      {/* Компактний випадаючий вибір днів тижня (з'являється лише при кліку на календар) */}
      {showDatePicker && (
        <div className="mt-3 p-3 rounded-2xl bg-[#111713]/98 border border-[#212E24] shadow-2xl animate-fadeIn">
          <div className="flex items-center justify-between mb-2 px-1">
            <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider">
              {weekStartStr} – {weekEndStr}
            </span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setWeekOffset(prev => prev - 1)}
                className="p-1 rounded-lg hover:bg-[#1A251D] text-zinc-400 hover:text-zinc-200"
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
                className="p-1 rounded-lg hover:bg-[#1A251D] text-zinc-400 hover:text-zinc-200"
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
                      : 'bg-[#151D18] text-zinc-400 hover:text-zinc-200'
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
