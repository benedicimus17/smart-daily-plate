import React from 'react';
import { Calendar, Sparkles } from 'lucide-react';

interface HeaderProps {
  date: string;
}

export const Header: React.FC<HeaderProps> = () => {
  const todayFormatted = new Intl.DateTimeFormat('uk-UA', {
    weekday: 'long',
    day: 'numeric',
    month: 'long'
  }).format(new Date());

  // Робимо першу літеру великою
  const capitalizedDate = todayFormatted.charAt(0).toUpperCase() + todayFormatted.slice(1);

  return (
    <header className="flex items-center justify-between py-3 mb-2">
      <div>
        <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-400">
          <Calendar className="w-3.5 h-3.5 text-brand-emerald" />
          <span>{capitalizedDate}</span>
        </div>
        <h1 className="text-xl font-extrabold text-slate-850 tracking-tight flex items-center gap-2 mt-0.5">
          Smart Daily Plate
        </h1>
      </div>

      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/80 border border-white shadow-sm text-xs font-semibold text-slate-600">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[11px] font-bold text-slate-700">Дзен</span>
          <Sparkles className="w-3 h-3 text-amber-500" />
        </div>
      </div>
    </header>
  );
};
