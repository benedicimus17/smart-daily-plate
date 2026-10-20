import React from 'react';
import { Macros, MacroTargets } from '../types/nutrition';

interface CalorieRingsProps {
  totals: Macros;
  targets: MacroTargets;
}

export const CalorieRings: React.FC<CalorieRingsProps> = ({ totals, targets }) => {
  const remainingCalories = Math.max(0, targets.calories - totals.calories);
  const caloriePercent = Math.min(100, Math.round((totals.calories / (targets.calories || 1)) * 100));

  // Головне кільце калорій (радіус 92, товщина 13.5)
  const radius = 92;
  const stroke = 13.5;
  const normalizedRadius = radius - stroke * 0.5;
  const circumference = normalizedRadius * 2 * Math.PI;
  const displayArcPercent = caloriePercent > 0 ? Math.max(74, caloriePercent) : 0;
  const strokeDashoffset = circumference - (displayArcPercent / 100) * circumference;

  // Довжина дуги 210° для спідометрів БЖУ (M 12 58 A 39 39 0 1 1 88 58)
  const gaugeArcLen = 143;

  const proteinOffset =
    gaugeArcLen - (Math.min(100, (totals.protein / (targets.protein || 1)) * 100) / 100) * gaugeArcLen;
  const fatOffset =
    gaugeArcLen - (Math.min(100, (totals.fat / (targets.fat || 1)) * 100) / 100) * gaugeArcLen;
  const carbsOffset =
    gaugeArcLen - (Math.min(100, (totals.carbs / (targets.carbs || 1)) * 100) / 100) * gaugeArcLen;

  return (
    <div className="relative flex flex-col items-center select-none pt-0.5 pb-1 animate-fadeIn">
      {/* Багатошарове атмосферне світло позаду головного кільця */}
      <div
        className="absolute top-[102px] left-1/2 -translate-x-1/2 -translate-y-1/2 w-[230px] h-[230px] rounded-full pointer-events-none"
        style={{
          background:
            'radial-gradient(circle, rgba(245,184,75,0.18) 0%, rgba(218,150,52,0.09) 48%, transparent 74%)',
          filter: 'blur(18px)',
        }}
      />

      {/* Головне об'ємне скляне кільце калорій (Panel 3: 700 kcal Remaining) */}
      <div className="relative flex items-center justify-center my-1.5">
        <div
          className="w-[198px] h-[198px] rounded-full flex items-center justify-center relative"
          style={{
            background:
              'radial-gradient(circle at 48% 32%, rgba(255,255,255,0.08) 0%, rgba(24,33,28,0.62) 58%, rgba(14,20,17,0.88) 100%)',
            boxShadow:
              'inset 0 1.5px 2.5px rgba(255,255,255,0.22), inset 0 -2px 6px rgba(0,0,0,0.65), 0 18px 42px rgba(0,0,0,0.62), 0 0 28px rgba(242,178,72,0.12)',
            border: '1px solid rgba(255,255,255,0.11)',
          }}
        >
          {/* Внутрішнє втоплене дзеркало диска */}
          <div
            className="absolute w-[142px] h-[142px] rounded-full pointer-events-none"
            style={{
              background:
                'radial-gradient(circle at 50% 38%, rgba(27,37,31,0.92) 0%, rgba(15,21,18,0.97) 100%)',
              boxShadow:
                'inset 0 2px 8px rgba(0,0,0,0.65), 0 1px 1px rgba(255,255,255,0.10)',
              border: '1px solid rgba(255,255,255,0.07)',
            }}
          />

          {/* Мітка 82% на верхньому лівому сегменті треку */}
          <span className="absolute top-[11px] left-[33.5%] -translate-x-1/2 text-[10px] font-semibold text-[#D6CEBF]/90 tracking-tight z-20">
            82%
          </span>

          <svg
            height={radius * 2}
            width={radius * 2}
            className="rotate-[-62deg] transition-all duration-700 ease-out overflow-visible relative z-10"
          >
            <defs>
              <linearGradient id="nutriqCalorieGold" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FCE7B2" />
                <stop offset="50%" stopColor="#EAA949" />
                <stop offset="100%" stopColor="#D48B2B" />
              </linearGradient>
              <linearGradient id="nutriqCalorieCore" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.88" />
                <stop offset="55%" stopColor="#FFF4D4" stopOpacity="0.65" />
                <stop offset="100%" stopColor="#FDE29C" stopOpacity="0.45" />
              </linearGradient>
              {/* Двоступеневий оптичний фільтр світіння (Studio Bloom) */}
              <filter id="goldOpticalBloom" x="-35%" y="-35%" width="170%" height="170%">
                <feGaussianBlur in="SourceGraphic" stdDeviation="3.2" result="blurTight" />
                <feGaussianBlur in="SourceGraphic" stdDeviation="9.5" result="blurWide" />
                <feMerge>
                  <feMergeNode in="blurWide" />
                  <feMergeNode in="blurTight" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* Матовий скляний жолоб треку */}
            <circle
              stroke="rgba(255, 255, 255, 0.09)"
              fill="transparent"
              strokeWidth={stroke}
              r={normalizedRadius}
              cx={radius}
              cy={radius}
            />
            <circle
              stroke="rgba(9, 14, 11, 0.55)"
              fill="transparent"
              strokeWidth={stroke - 2.5}
              r={normalizedRadius}
              cx={radius}
              cy={radius}
            />

            {/* Основне золоте тіло дуги з оптичним ореолом */}
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
              filter="url(#goldOpticalBloom)"
              className="transition-all duration-1000 ease-out"
            />

            {/* Внутрішня біло-золота світлова нитка розжарення (дає ефект справжнього 3D-світла) */}
            <circle
              stroke="url(#nutriqCalorieCore)"
              fill="transparent"
              strokeWidth={stroke * 0.36}
              strokeDasharray={`${circumference} ${circumference}`}
              style={{ strokeDashoffset }}
              strokeLinecap="round"
              r={normalizedRadius}
              cx={radius}
              cy={radius}
              className="transition-all duration-1000 ease-out pointer-events-none"
            />
          </svg>

          {/* Центральна типографіка кільця */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center pt-1 z-20">
            <div className="flex items-baseline justify-center gap-1">
              <span
                className="text-[42px] font-bold tracking-[-0.03em] text-white leading-none"
                style={{ textShadow: '0 2px 14px rgba(0,0,0,0.65)' }}
              >
                {remainingCalories}
              </span>
              <span className="text-[15px] font-normal text-[#E2E7E3]">kcal</span>
            </div>
            <span className="text-[12.5px] font-normal text-[#9BA9A0] mt-1 tracking-tight">
              Remaining
            </span>
          </div>
        </div>
      </div>

      {/* 3 напівкруглі неонові шкали-спідометри БЖУ (Panel 3) */}
      <div className="grid grid-cols-3 gap-2 w-full mt-0.5 px-1">
        {/* 1. Protein (Emerald Green) */}
        <div className="flex flex-col items-center relative">
          <div className="relative w-[106px] h-[86px] flex flex-col items-center justify-end pb-1">
            {/* Subsurface radial emerald glow */}
            <div
              className="absolute top-2 w-20 h-14 rounded-full pointer-events-none"
              style={{
                background: 'radial-gradient(circle, rgba(44,229,155,0.18) 0%, transparent 72%)',
                filter: 'blur(8px)',
              }}
            />
            <svg viewBox="0 0 100 72" className="absolute inset-0 w-full h-full overflow-visible">
              <defs>
                <linearGradient id="gaugeProtein" x1="0%" y1="100%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#10B981" />
                  <stop offset="55%" stopColor="#34D399" />
                  <stop offset="100%" stopColor="#A7F3D0" />
                </linearGradient>
                <filter id="emeraldBloom" x="-35%" y="-35%" width="170%" height="170%">
                  <feGaussianBlur in="SourceGraphic" stdDeviation="2.4" result="b1" />
                  <feGaussianBlur in="SourceGraphic" stdDeviation="6.5" result="b2" />
                  <feMerge>
                    <feMergeNode in="b2" />
                    <feMergeNode in="b1" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>
              {/* Скляний трек */}
              <path
                d="M 12 58 A 39 39 0 1 1 88 58"
                fill="none"
                stroke="rgba(255,255,255,0.11)"
                strokeWidth="7.2"
                strokeLinecap="round"
              />
              <path
                d="M 12 58 A 39 39 0 1 1 88 58"
                fill="none"
                stroke="rgba(10,16,13,0.65)"
                strokeWidth="4.8"
                strokeLinecap="round"
              />
              {/* Активна смарагдова дуга з оптичним Bloom */}
              <path
                d="M 12 58 A 39 39 0 1 1 88 58"
                fill="none"
                stroke="url(#gaugeProtein)"
                strokeWidth="7.2"
                strokeLinecap="round"
                strokeDasharray={gaugeArcLen}
                strokeDashoffset={proteinOffset}
                filter="url(#emeraldBloom)"
                className="transition-all duration-700 ease-out"
              />
              {/* Світлова серцевина трубки */}
              <path
                d="M 12 58 A 39 39 0 1 1 88 58"
                fill="none"
                stroke="rgba(236, 253, 245, 0.78)"
                strokeWidth="2.3"
                strokeLinecap="round"
                strokeDasharray={gaugeArcLen}
                strokeDashoffset={proteinOffset}
                className="transition-all duration-700 ease-out pointer-events-none"
              />
            </svg>
            <div className="relative z-10 flex flex-col items-center text-center mt-5">
              <span className="text-[13px] font-semibold text-white leading-tight">Protein</span>
              <span className="text-[9.5px] text-[#4ADE80]/90 font-medium leading-tight mt-0.5">
                Emerald Green
              </span>
              <span className="text-[11.5px] mt-1 tracking-tight">
                <strong className="font-semibold text-white">{totals.protein}g</strong>
                <span className="text-[#8FA195] font-normal"> / {targets.protein}g</span>
              </span>
            </div>
          </div>
        </div>

        {/* 2. Fats (Warm Amber) */}
        <div className="flex flex-col items-center relative">
          <div className="relative w-[106px] h-[86px] flex flex-col items-center justify-end pb-1">
            <div
              className="absolute top-2 w-20 h-14 rounded-full pointer-events-none"
              style={{
                background: 'radial-gradient(circle, rgba(245,180,56,0.18) 0%, transparent 72%)',
                filter: 'blur(8px)',
              }}
            />
            <svg viewBox="0 0 100 72" className="absolute inset-0 w-full h-full overflow-visible">
              <defs>
                <linearGradient id="gaugeFat" x1="0%" y1="100%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#D97706" />
                  <stop offset="55%" stopColor="#FBBF24" />
                  <stop offset="100%" stopColor="#FEF08A" />
                </linearGradient>
                <filter id="amberBloom" x="-35%" y="-35%" width="170%" height="170%">
                  <feGaussianBlur in="SourceGraphic" stdDeviation="2.4" result="b1" />
                  <feGaussianBlur in="SourceGraphic" stdDeviation="6.5" result="b2" />
                  <feMerge>
                    <feMergeNode in="b2" />
                    <feMergeNode in="b1" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>
              <path
                d="M 12 58 A 39 39 0 1 1 88 58"
                fill="none"
                stroke="rgba(255,255,255,0.11)"
                strokeWidth="7.2"
                strokeLinecap="round"
              />
              <path
                d="M 12 58 A 39 39 0 1 1 88 58"
                fill="none"
                stroke="rgba(10,16,13,0.65)"
                strokeWidth="4.8"
                strokeLinecap="round"
              />
              <path
                d="M 12 58 A 39 39 0 1 1 88 58"
                fill="none"
                stroke="url(#gaugeFat)"
                strokeWidth="7.2"
                strokeLinecap="round"
                strokeDasharray={gaugeArcLen}
                strokeDashoffset={fatOffset}
                filter="url(#amberBloom)"
                className="transition-all duration-700 ease-out"
              />
              <path
                d="M 12 58 A 39 39 0 1 1 88 58"
                fill="none"
                stroke="rgba(255, 251, 235, 0.82)"
                strokeWidth="2.3"
                strokeLinecap="round"
                strokeDasharray={gaugeArcLen}
                strokeDashoffset={fatOffset}
                className="transition-all duration-700 ease-out pointer-events-none"
              />
            </svg>
            <div className="relative z-10 flex flex-col items-center text-center mt-5">
              <span className="text-[13px] font-semibold text-white leading-tight">Fats</span>
              <span className="text-[9.5px] text-[#FBBF24]/90 font-medium leading-tight mt-0.5">
                Warm Amber
              </span>
              <span className="text-[11.5px] mt-1 tracking-tight">
                <strong className="font-semibold text-white">{totals.fat}g</strong>
                <span className="text-[#8FA195] font-normal"> / {targets.fat}g</span>
              </span>
            </div>
          </div>
        </div>

        {/* 3. Carbs (Soft Indigo) */}
        <div className="flex flex-col items-center relative">
          <div className="relative w-[106px] h-[86px] flex flex-col items-center justify-end pb-1">
            <div
              className="absolute top-2 w-20 h-14 rounded-full pointer-events-none"
              style={{
                background: 'radial-gradient(circle, rgba(129,140,248,0.18) 0%, transparent 72%)',
                filter: 'blur(8px)',
              }}
            />
            <svg viewBox="0 0 100 72" className="absolute inset-0 w-full h-full overflow-visible">
              <defs>
                <linearGradient id="gaugeCarbs" x1="0%" y1="100%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#6366F1" />
                  <stop offset="55%" stopColor="#A5B4FC" />
                  <stop offset="100%" stopColor="#E0E7FF" />
                </linearGradient>
                <filter id="indigoBloom" x="-35%" y="-35%" width="170%" height="170%">
                  <feGaussianBlur in="SourceGraphic" stdDeviation="2.4" result="b1" />
                  <feGaussianBlur in="SourceGraphic" stdDeviation="6.5" result="b2" />
                  <feMerge>
                    <feMergeNode in="b2" />
                    <feMergeNode in="b1" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>
              <path
                d="M 12 58 A 39 39 0 1 1 88 58"
                fill="none"
                stroke="rgba(255,255,255,0.11)"
                strokeWidth="7.2"
                strokeLinecap="round"
              />
              <path
                d="M 12 58 A 39 39 0 1 1 88 58"
                fill="none"
                stroke="rgba(10,16,13,0.65)"
                strokeWidth="4.8"
                strokeLinecap="round"
              />
              <path
                d="M 12 58 A 39 39 0 1 1 88 58"
                fill="none"
                stroke="url(#gaugeCarbs)"
                strokeWidth="7.2"
                strokeLinecap="round"
                strokeDasharray={gaugeArcLen}
                strokeDashoffset={carbsOffset}
                filter="url(#indigoBloom)"
                className="transition-all duration-700 ease-out"
              />
              <path
                d="M 12 58 A 39 39 0 1 1 88 58"
                fill="none"
                stroke="rgba(238, 242, 255, 0.82)"
                strokeWidth="2.3"
                strokeLinecap="round"
                strokeDasharray={gaugeArcLen}
                strokeDashoffset={carbsOffset}
                className="transition-all duration-700 ease-out pointer-events-none"
              />
            </svg>
            <div className="relative z-10 flex flex-col items-center text-center mt-5">
              <span className="text-[13px] font-semibold text-white leading-tight">Carbs</span>
              <span className="text-[9.5px] text-[#A5B4FC]/95 font-medium leading-tight mt-0.5">
                Soft Indigo
              </span>
              <span className="text-[11.5px] mt-1 tracking-tight">
                <strong className="font-semibold text-white">{totals.carbs}g</strong>
                <span className="text-[#8FA195] font-normal"> / {targets.carbs}g</span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
