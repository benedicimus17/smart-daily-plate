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
  const radius = 80;
  const stroke = 12;
  const normalizedRadius = radius - stroke * 0.5;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (caloriePercent / 100) * circumference;

  return (
    <div className="glass-card rounded-4xl p-6 relative overflow-hidden flex flex-col items-center">
      {/* Делікатне фонове неоморфне світіння */}
      <div className="absolute -top-16 -right-16 w-44 h-44 bg-brand-emerald/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-16 -left-16 w-44 h-44 bg-brand-indigo/10 rounded-full blur-3xl pointer-events-none" />

      {/* Головне кільце калорій */}
      <div className="relative flex items-center justify-center my-2">
        <svg
          height={radius * 2}
          width={radius * 2}
          className="rotate-[-90deg] transition-all duration-700 ease-out"
        >
          {/* Фонові треки */}
          <circle
            stroke="#E2E8F0"
            fill="transparent"
            strokeWidth={stroke}
            r={normalizedRadius}
            cx={radius}
            cy={radius}
            className="opacity-50"
          />
          {/* Активний прогрес */}
          <circle
            stroke="url(#calorieGradient)"
            fill="transparent"
            strokeWidth={stroke}
            strokeDasharray={`${circumference} ${circumference}`}
            style={{ strokeDashoffset }}
            strokeLinecap="round"
            r={normalizedRadius}
            cx={radius}
            cy={radius}
            className="glow-ring-emerald transition-all duration-1000 ease-out"
          />
          <defs>
            <linearGradient id="calorieGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#10B981" />
              <stop offset="100%" stopColor="#059669" />
            </linearGradient>
          </defs>
        </svg>

        {/* Текст у центрі */}
        <div className="absolute flex flex-col items-center justify-center text-center">
          <span className="text-3xl font-extrabold tracking-tight text-slate-850">
            {remainingCalories}
          </span>
          <span className="text-xs uppercase font-semibold tracking-wider text-slate-400 mt-0.5">
            ккал залишок
          </span>
          <span className="text-[11px] font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full mt-1">
            {totals.calories} з {targets.calories}
          </span>
        </div>
      </div>

      {/* 3 міні-кільця / смужки БЖВ (Дзен-вигляд) */}
      <div className="grid grid-cols-3 gap-3 w-full mt-5 pt-4 border-t border-slate-100/80">
        {/* Білки (Смарагдовий) */}
        <div className="flex flex-col items-center p-2.5 rounded-2xl bg-white/60 border border-white/80 shadow-sm">
          <div className="flex items-center gap-1.5 mb-1.5">
            <div className="w-2 h-2 rounded-full bg-brand-emerald shadow-glow-emerald" />
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">Білки</span>
          </div>
          <span className="text-base font-bold text-slate-800">
            {totals.protein}<span className="text-xs text-slate-400 font-normal">/{targets.protein}г</span>
          </span>
          <div className="w-full bg-slate-100 h-1.5 rounded-full mt-2 overflow-hidden">
            <div
              className="bg-brand-emerald h-full rounded-full transition-all duration-500 shadow-glow-emerald"
              style={{ width: `${proteinPercent}%` }}
            />
          </div>
        </div>

        {/* Жири (Теплий бурштин) */}
        <div className="flex flex-col items-center p-2.5 rounded-2xl bg-white/60 border border-white/80 shadow-sm">
          <div className="flex items-center gap-1.5 mb-1.5">
            <div className="w-2 h-2 rounded-full bg-brand-amber shadow-glow-amber" />
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">Жири</span>
          </div>
          <span className="text-base font-bold text-slate-800">
            {totals.fat}<span className="text-xs text-slate-400 font-normal">/{targets.fat}г</span>
          </span>
          <div className="w-full bg-slate-100 h-1.5 rounded-full mt-2 overflow-hidden">
            <div
              className="bg-brand-amber h-full rounded-full transition-all duration-500 shadow-glow-amber"
              style={{ width: `${fatPercent}%` }}
            />
          </div>
        </div>

        {/* Вуглеводи (Індиго) */}
        <div className="flex flex-col items-center p-2.5 rounded-2xl bg-white/60 border border-white/80 shadow-sm">
          <div className="flex items-center gap-1.5 mb-1.5">
            <div className="w-2 h-2 rounded-full bg-brand-indigo shadow-glow-indigo" />
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">Вуглеводи</span>
          </div>
          <span className="text-base font-bold text-slate-800">
            {totals.carbs}<span className="text-xs text-slate-400 font-normal">/{targets.carbs}г</span>
          </span>
          <div className="w-full bg-slate-100 h-1.5 rounded-full mt-2 overflow-hidden">
            <div
              className="bg-brand-indigo h-full rounded-full transition-all duration-500 shadow-glow-indigo"
              style={{ width: `${carbsPercent}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
