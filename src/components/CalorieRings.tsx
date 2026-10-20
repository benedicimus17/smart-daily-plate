import React from 'react';
import { Macros, MacroTargets } from '../types/nutrition';

interface CalorieRingsProps {
  totals: Macros;
  targets: MacroTargets;
}

export const CalorieRings: React.FC<CalorieRingsProps> = ({ totals, targets }) => {
  const remainingCalories = Math.max(0, targets.calories - totals.calories);
  const caloriePercent = Math.min(100, Math.round((totals.calories / (targets.calories || 1)) * 100));

  // Розрахунок кола для калорій
  const radius = 92;
  const stroke = 13;
  const normalizedRadius = radius - stroke * 0.5;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (Math.max(72, caloriePercent) / 100) * circumference;

  // Перерахунок дуг спідометрів (210 градусів, де цифри лежать ВСЕРЕДИНІ дуги)
  // Дуга від (11, 56) до (89, 56), радіус 39, довжина ~143
  const gaugeArcLen = 143;

  return (
    <div className="relative flex flex-col items-center select-none pt-1 pb-1 animate-fadeIn">
      {/* Тепле золотисте підсвічування під головним кільцем */}
      <div className="absolute top-20 left-1/2 -translate-x-1/2 -translate-y-1/2 w-56 h-56 bg-amber-400/12 rounded-full blur-[65px] pointer-events-none" />

      {/* Головне об'ємне скляне кільце калорій згідно з еталонним макетом */}
      <div className="relative flex items-center justify-center my-2">
        {/* Напівпрозорий скляний диск-основа кільця */}
        <div
          className="w-[200px] h-[200px] rounded-full flex items-center justify-center relative"
          style={{
            background: 'radial-gradient(circle at 50% 35%, rgba(255,255,255,0.06) 0%, rgba(20,30,24,0.45) 70%, rgba(15,23,18,0.75) 100%)',
            boxShadow: 'inset 0 1px 2px rgba(255,255,255,0.18), 0 18px 40px rgba(0,0,0,0.55)'
          }}
        >
          {/* Мітка відсотка на обідку треку (як у макеті 82%) */}
          <span className="absolute top-[11px] left-[33%] -translate-x-1/2 text-[10px] font-semibold text-[#D6CEBF]/90 tracking-tight z-20">
            82%
          </span>

          <svg
            height={radius * 2}
            width={radius * 2}
            className="rotate-[-60deg] transition-all duration-700 ease-out overflow-visible"
          >
            {/* Скляний матовий трек кільця */}
            <circle
              stroke="rgba(255, 255, 255, 0.08)"
              fill="transparent"
              strokeWidth={stroke}
              r={normalizedRadius}
              cx={radius}
              cy={radius}
            />
            {/* Внутрішній темний жолоб треку */}
            <circle
              stroke="rgba(10, 16, 12, 0.55)"
              fill="transparent"
              strokeWidth={stroke - 2}
              r={normalizedRadius}
              cx={radius}
              cy={radius}
            />
            {/* Активна золота дуга зі світловим ореолом */}
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
              className="transition-all duration-1000 ease-out drop-shadow-[0_0_16px_rgba(245,176,65,0.75)]"
            />
            <defs>
              <linearGradient id="nutriqCalorieGold" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FFF3C4" />
                <stop offset="45%" stopColor="#F5B041" />
                <stop offset="100%" stopColor="#D68910" />
              </linearGradient>
            </defs>
          </svg>

          {/* Текст у центрі кільця точно за макетом */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center pt-1">
            <div className="flex items-baseline justify-center gap-1">
              <span className="text-[42px] font-bold tracking-[-0.03em] text-white leading-none drop-shadow">
                {remainingCalories}
              </span>
              <span className="text-[15px] font-medium text-[#E5E9E6]">
                kcal
              </span>
            </div>
            <span className="text-[13px] font-normal text-[#A3B3A8] mt-1 tracking-tight">
              Remaining
            </span>
          </div>
        </div>
      </div>

      {/* 3 напівкруглі мікро-шкали БЖУ, де текст розташований ВСЕРЕДИНІ під куполом дуги */}
      <div className="grid grid-cols-3 gap-2 w-full mt-1 px-1">
        {/* 1. Protein (Emerald Green) */}
        <div className="flex flex-col items-center relative">
          <div className="relative w-[104px] h-[86px] flex flex-col items-center justify-end pb-1">
            <svg viewBox="0 0 100 72" className="absolute inset-0 w-full h-full overflow-visible">
              <defs>
                <linearGradient id="gaugeProtein" x1="0%" y1="100%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#10B981" />
                  <stop offset="100%" stopColor="#6EE7B7" />
                </linearGradient>
              </defs>
              {/* Фонова підкладка дуги */}
              <path
                d="M 12 58 A 39 39 0 1 1 88 58"
                fill="none"
                stroke="rgba(255,255,255,0.08)"
                strokeWidth="6.5"
                strokeLinecap="round"
              />
              {/* Активна смарагдова дуга */}
              <path
                d="M 12 58 A 39 39 0 1 1 88 58"
                fill="none"
                stroke="url(#gaugeProtein)"
                strokeWidth="6.5"
                strokeLinecap="round"
                strokeDasharray={gaugeArcLen}
                strokeDashoffset={gaugeArcLen - (Math.min(100, (totals.protein / (targets.protein || 1)) * 100) / 100) * gaugeArcLen}
                style={{ filter: 'drop-shadow(0 0 8px rgba(52,211,153,0.75))' }}
                className="transition-all duration-700 ease-out"
              />
            </svg>
            {/* Текст ВСЕРЕДИНІ дуги */}
            <div className="relative z-10 flex flex-col items-center text-center mt-5">
              <span className="text-[13px] font-semibold text-white leading-tight">Protein</span>
              <span className="text-[9.5px] text-[#5EEAD4]/85 font-medium leading-tight mt-0.5">Emerald Green</span>
              <span className="text-[11px] font-medium text-[#D5E0D8] mt-1 tracking-tight">
                {totals.protein}g / {targets.protein}g
              </span>
            </div>
          </div>
        </div>

        {/* 2. Fats (Warm Amber) */}
        <div className="flex flex-col items-center relative">
          <div className="relative w-[104px] h-[86px] flex flex-col items-center justify-end pb-1">
            <svg viewBox="0 0 100 72" className="absolute inset-0 w-full h-full overflow-visible">
              <defs>
                <linearGradient id="gaugeFat" x1="0%" y1="100%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#F59E0B" />
                  <stop offset="100%" stopColor="#FDE68A" />
                </linearGradient>
              </defs>
              <path
                d="M 12 58 A 39 39 0 1 1 88 58"
                fill="none"
                stroke="rgba(255,255,255,0.08)"
                strokeWidth="6.5"
                strokeLinecap="round"
              />
              <path
                d="M 12 58 A 39 39 0 1 1 88 58"
                fill="none"
                stroke="url(#gaugeFat)"
                strokeWidth="6.5"
                strokeLinecap="round"
                strokeDasharray={gaugeArcLen}
                strokeDashoffset={gaugeArcLen - (Math.min(100, (totals.fat / (targets.fat || 1)) * 100) / 100) * gaugeArcLen}
                style={{ filter: 'drop-shadow(0 0 8px rgba(251,191,36,0.75))' }}
                className="transition-all duration-700 ease-out"
              />
            </svg>
            {/* Текст ВСЕРЕДИНІ дуги */}
            <div className="relative z-10 flex flex-col items-center text-center mt-5">
              <span className="text-[13px] font-semibold text-white leading-tight">Fats</span>
              <span className="text-[9.5px] text-[#FCD34D]/85 font-medium leading-tight mt-0.5">Warm Amber</span>
              <span className="text-[11px] font-medium text-[#D5E0D8] mt-1 tracking-tight">
                {totals.fat}g / {targets.fat}g
              </span>
            </div>
          </div>
        </div>

        {/* 3. Carbs (Soft Indigo) */}
        <div className="flex flex-col items-center relative">
          <div className="relative w-[104px] h-[86px] flex flex-col items-center justify-end pb-1">
            <svg viewBox="0 0 100 72" className="absolute inset-0 w-full h-full overflow-visible">
              <defs>
                <linearGradient id="gaugeCarbs" x1="0%" y1="100%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#818CF8" />
                  <stop offset="100%" stopColor="#C7D2FE" />
                </linearGradient>
              </defs>
              <path
                d="M 12 58 A 39 39 0 1 1 88 58"
                fill="none"
                stroke="rgba(255,255,255,0.08)"
                strokeWidth="6.5"
                strokeLinecap="round"
              />
              <path
                d="M 12 58 A 39 39 0 1 1 88 58"
                fill="none"
                stroke="url(#gaugeCarbs)"
                strokeWidth="6.5"
                strokeLinecap="round"
                strokeDasharray={gaugeArcLen}
                strokeDashoffset={gaugeArcLen - (Math.min(100, (totals.carbs / (targets.carbs || 1)) * 100) / 100) * gaugeArcLen}
                style={{ filter: 'drop-shadow(0 0 8px rgba(165,180,252,0.75))' }}
                className="transition-all duration-700 ease-out"
              />
            </svg>
            {/* Текст ВСЕРЕДИНІ дуги */}
            <div className="relative z-10 flex flex-col items-center text-center mt-5">
              <span className="text-[13px] font-semibold text-white leading-tight">Carbs</span>
              <span className="text-[9.5px] text-[#A5B4FC]/90 font-medium leading-tight mt-0.5">Soft Indigo</span>
              <span className="text-[11px] font-medium text-[#D5E0D8] mt-1 tracking-tight">
                {totals.carbs}g / {targets.carbs}g
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
