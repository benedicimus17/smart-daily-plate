import React from 'react';
import { Macros, MacroTargets } from '../types/nutrition';

interface CalorieRingsProps {
  totals: Macros;
  targets: MacroTargets;
}

export const CalorieRings: React.FC<CalorieRingsProps> = ({ totals, targets }) => {
  const remainingCalories = Math.max(0, targets.calories - totals.calories);
  const caloriePercent = Math.min(100, Math.round((totals.calories / targets.calories) * 100));

  // Розрахунок кола для калорій
  const radius = 95;
  const stroke = 12;
  const normalizedRadius = radius - stroke * 0.5;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (caloriePercent / 100) * circumference;

  return (
    <div className="relative flex flex-col items-center select-none py-2 animate-fadeIn">
      {/* Делікатне фонове світіння NUTRIQ Zen Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-amber-500/10 rounded-full blur-[80px] pointer-events-none" />

      {/* Головне золоте кільце калорій (Фірмовий дзен NUTRIQ 700 kcal Remaining) */}
      <div className="relative flex items-center justify-center my-3">
        <svg
          height={radius * 2}
          width={radius * 2}
          className="rotate-[-90deg] transition-all duration-700 ease-out overflow-visible"
        >
          {/* Фонові треки */}
          <circle
            stroke="#1C261F"
            fill="transparent"
            strokeWidth={stroke}
            r={normalizedRadius}
            cx={radius}
            cy={radius}
            className="opacity-70"
          />
          {/* Активний золотий прогрес із м'яким градієнтом та світінням */}
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
            className="transition-all duration-1000 ease-out drop-shadow-[0_0_20px_rgba(245,158,11,0.7)]"
          />
          <defs>
            <linearGradient id="nutriqCalorieGold" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FDE68A" />
              <stop offset="50%" stopColor="#F59E0B" />
              <stop offset="100%" stopColor="#D97706" />
            </linearGradient>
          </defs>
        </svg>

        {/* Текст у центрі кільця точно за макетом */}
        <div className="absolute flex flex-col items-center justify-center text-center">
          <div className="flex items-baseline gap-1">
            <span className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white drop-shadow-md">
              {remainingCalories}
            </span>
            <span className="text-xs sm:text-sm font-semibold text-zinc-300">
              kcal
            </span>
          </div>
          <span className="text-xs font-medium text-zinc-400 mt-0.5 tracking-wide">
            Remaining
          </span>
        </div>
      </div>

      {/* 3 напівкруглі мікро-шкали БЖУ (Смарагд / Бурштин / Індиго) без грубих рамок картки */}
      <div className="grid grid-cols-3 gap-2 sm:gap-4 w-full mt-2 px-1">
        {/* Білки (Смарагдовий спідометр - Protein 140g / 180g) */}
        <div className="flex flex-col items-center">
          <div className="relative w-24 h-14 flex items-center justify-center">
            <svg viewBox="0 0 90 50" className="w-full h-full overflow-visible">
              <defs>
                <linearGradient id="gaugeProtein" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#10B981" stopOpacity="0.75" />
                  <stop offset="100%" stopColor="#34D399" stopOpacity="1" />
                </linearGradient>
              </defs>
              <path
                d="M 13 42 A 32 32 0 0 1 77 42"
                fill="none"
                stroke="#1A241D"
                strokeWidth="7"
                strokeLinecap="round"
              />
              <path
                d="M 13 42 A 32 32 0 0 1 77 42"
                fill="none"
                stroke="url(#gaugeProtein)"
                strokeWidth="7"
                strokeLinecap="round"
                strokeDasharray="100.53"
                strokeDashoffset={100.53 - (Math.min(100, (totals.protein / (targets.protein || 1)) * 100) / 100) * 100.53}
                style={{ filter: 'drop-shadow(0 0 8px rgba(16,185,129,0.8))' }}
                className="transition-all duration-700 ease-out"
              />
            </svg>
          </div>
          <span className="text-xs font-bold text-emerald-400 mt-1">Protein</span>
          <span className="text-[10px] text-emerald-400/70 font-medium">Emerald Green</span>
          <span className="text-xs font-extrabold text-zinc-200 mt-0.5">{totals.protein}g / {targets.protein}g</span>
        </div>

        {/* Жири (Теплий бурштин спідометр - Fats 65g / 80g) */}
        <div className="flex flex-col items-center">
          <div className="relative w-24 h-14 flex items-center justify-center">
            <svg viewBox="0 0 90 50" className="w-full h-full overflow-visible">
              <defs>
                <linearGradient id="gaugeFat" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#F59E0B" stopOpacity="0.75" />
                  <stop offset="100%" stopColor="#FBBF24" stopOpacity="1" />
                </linearGradient>
              </defs>
              <path
                d="M 13 42 A 32 32 0 0 1 77 42"
                fill="none"
                stroke="#1A241D"
                strokeWidth="7"
                strokeLinecap="round"
              />
              <path
                d="M 13 42 A 32 32 0 0 1 77 42"
                fill="none"
                stroke="url(#gaugeFat)"
                strokeWidth="7"
                strokeLinecap="round"
                strokeDasharray="100.53"
                strokeDashoffset={100.53 - (Math.min(100, (totals.fat / (targets.fat || 1)) * 100) / 100) * 100.53}
                style={{ filter: 'drop-shadow(0 0 8px rgba(245,158,11,0.8))' }}
                className="transition-all duration-700 ease-out"
              />
            </svg>
          </div>
          <span className="text-xs font-bold text-amber-400 mt-1">Fats</span>
          <span className="text-[10px] text-amber-400/70 font-medium">Warm Amber</span>
          <span className="text-xs font-extrabold text-zinc-200 mt-0.5">{totals.fat}g / {targets.fat}g</span>
        </div>

        {/* Вуглеводи (М'який індиго спідометр - Carbs 220g / 270g) */}
        <div className="flex flex-col items-center">
          <div className="relative w-24 h-14 flex items-center justify-center">
            <svg viewBox="0 0 90 50" className="w-full h-full overflow-visible">
              <defs>
                <linearGradient id="gaugeCarbs" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#818CF8" stopOpacity="0.75" />
                  <stop offset="100%" stopColor="#A5B4FC" stopOpacity="1" />
                </linearGradient>
              </defs>
              <path
                d="M 13 42 A 32 32 0 0 1 77 42"
                fill="none"
                stroke="#1A241D"
                strokeWidth="7"
                strokeLinecap="round"
              />
              <path
                d="M 13 42 A 32 32 0 0 1 77 42"
                fill="none"
                stroke="url(#gaugeCarbs)"
                strokeWidth="7"
                strokeLinecap="round"
                strokeDasharray="100.53"
                strokeDashoffset={100.53 - (Math.min(100, (totals.carbs / (targets.carbs || 1)) * 100) / 100) * 100.53}
                style={{ filter: 'drop-shadow(0 0 8px rgba(129,140,248,0.8))' }}
                className="transition-all duration-700 ease-out"
              />
            </svg>
          </div>
          <span className="text-xs font-bold text-indigo-400 mt-1">Carbs</span>
          <span className="text-[10px] text-indigo-400/70 font-medium">Soft Indigo</span>
          <span className="text-xs font-extrabold text-zinc-200 mt-0.5">{totals.carbs}g / {targets.carbs}g</span>
        </div>
      </div>
    </div>
  );
};
