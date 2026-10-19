import React from 'react';
import { Macros, MacroTargets } from '../types/nutrition';

interface CalorieRingsProps {
  totals: Macros;
  targets: MacroTargets;
}

export const CalorieRings: React.FC<CalorieRingsProps> = ({ totals, targets }) => {
  const remainingCalories = Math.max(0, targets.calories - totals.calories);
  const caloriePercent = Math.min(100, Math.round((totals.calories / targets.calories) * 100));

  const proteinPercent = Math.min(100, Math.round((totals.protein / targets.protein) * 100));
  const fatPercent = Math.min(100, Math.round((totals.fat / targets.fat) * 100));
  const carbsPercent = Math.min(100, Math.round((totals.carbs / targets.carbs) * 100));

  // Розрахунок кола для калорій
  const radius = 86;
  const stroke = 12;
  const normalizedRadius = radius - stroke * 0.5;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (caloriePercent / 100) * circumference;

  return (
    <div className="rounded-4xl p-6 relative overflow-hidden flex flex-col items-center bg-zinc-900/80 border border-zinc-800/80 backdrop-blur-2xl shadow-2xl shadow-black/60 select-none">
      {/* Делікатне фонове неоморфне світіння (Янтарне та Смарагдове) */}
      <div className="absolute -top-16 -right-16 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-16 -left-16 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Головне золоте кільце калорій (Фірмовий дзен NUTRIQ) */}
      <div className="relative flex items-center justify-center my-1">
        <svg
          height={radius * 2}
          width={radius * 2}
          className="rotate-[-90deg] transition-all duration-700 ease-out"
        >
          {/* Фонові треки */}
          <circle
            stroke="#27272A"
            fill="transparent"
            strokeWidth={stroke}
            r={normalizedRadius}
            cx={radius}
            cy={radius}
            className="opacity-70"
          />
          {/* Активний золотий прогрес із світінням */}
          <circle
            stroke="url(#nutriqCalorieGold)"
            fill="transparent"
            strokeWidth={stroke}
            strokeDasharray={`${circumference} ${circumference}`}
            style={{ strokeDashoffset }}
            strokeLinecap="round"
            r={normalizedRadius}
            cx={radius}
            cy={radius}
            className="transition-all duration-1000 ease-out drop-shadow-[0_0_12px_rgba(245,158,11,0.6)]"
          />
          <defs>
            <linearGradient id="nutriqCalorieGold" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FDE68A" />
              <stop offset="50%" stopColor="#F59E0B" />
              <stop offset="100%" stopColor="#D97706" />
            </linearGradient>
          </defs>
        </svg>

        {/* Текст у центрі кільця */}
        <div className="absolute flex flex-col items-center justify-center text-center">
          <span className="text-3xl font-black tracking-tight text-zinc-100 drop-shadow-sm">
            {remainingCalories}
          </span>
          <span className="text-[10px] uppercase font-bold tracking-widest text-zinc-400 mt-0.5">
            ккал залишок
          </span>
          <span className="text-[11px] font-semibold text-amber-300 bg-amber-500/15 border border-amber-500/30 px-2.5 py-0.5 rounded-full mt-1.5 shadow-sm">
            {totals.calories} / {targets.calories} ккал
          </span>
        </div>
      </div>

      {/* 3 мікро-шкали БЖУ (Смарагд / Янтар / Індиго) */}
      <div className="grid grid-cols-3 gap-2.5 w-full mt-5 pt-4 border-t border-zinc-800/80">
        {/* Білки (Смарагдовий) */}
        <div className="flex flex-col items-center p-2.5 rounded-2xl bg-zinc-950/60 border border-zinc-800 hover:border-emerald-500/30 transition-colors shadow-inner">
          <div className="flex items-center gap-1.5 mb-1">
            <div className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.8)]" />
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Білки</span>
          </div>
          <span className="text-sm font-extrabold text-zinc-100">
            {totals.protein}<span className="text-[11px] text-zinc-500 font-normal">/{targets.protein}г</span>
          </span>
          <div className="w-full bg-zinc-800 h-1.5 rounded-full mt-2 overflow-hidden">
            <div
              className="bg-gradient-to-r from-emerald-500 to-emerald-400 h-full rounded-full transition-all duration-500 shadow-[0_0_6px_rgba(16,185,129,0.7)]"
              style={{ width: `${proteinPercent}%` }}
            />
          </div>
        </div>

        {/* Жири (Теплий бурштин) */}
        <div className="flex flex-col items-center p-2.5 rounded-2xl bg-zinc-950/60 border border-zinc-800 hover:border-amber-500/30 transition-colors shadow-inner">
          <div className="flex items-center gap-1.5 mb-1">
            <div className="w-2 h-2 rounded-full bg-amber-400 shadow-[0_0_6px_rgba(251,191,36,0.8)]" />
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Жири</span>
          </div>
          <span className="text-sm font-extrabold text-zinc-100">
            {totals.fat}<span className="text-[11px] text-zinc-500 font-normal">/{targets.fat}г</span>
          </span>
          <div className="w-full bg-zinc-800 h-1.5 rounded-full mt-2 overflow-hidden">
            <div
              className="bg-gradient-to-r from-amber-500 to-amber-400 h-full rounded-full transition-all duration-500 shadow-[0_0_6px_rgba(245,158,11,0.7)]"
              style={{ width: `${fatPercent}%` }}
            />
          </div>
        </div>

        {/* Вуглеводи (Індиго / Лаванда) */}
        <div className="flex flex-col items-center p-2.5 rounded-2xl bg-zinc-950/60 border border-zinc-800 hover:border-indigo-500/30 transition-colors shadow-inner">
          <div className="flex items-center gap-1.5 mb-1">
            <div className="w-2 h-2 rounded-full bg-indigo-400 shadow-[0_0_6px_rgba(129,140,248,0.8)]" />
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Вуглеводи</span>
          </div>
          <span className="text-sm font-extrabold text-zinc-100">
            {totals.carbs}<span className="text-[11px] text-zinc-500 font-normal">/{targets.carbs}г</span>
          </span>
          <div className="w-full bg-zinc-800 h-1.5 rounded-full mt-2 overflow-hidden">
            <div
              className="bg-gradient-to-r from-indigo-500 to-indigo-400 h-full rounded-full transition-all duration-500 shadow-[0_0_6px_rgba(99,102,241,0.7)]"
              style={{ width: `${carbsPercent}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
