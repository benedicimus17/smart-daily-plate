import React from 'react';
import { Macros, MacroTargets } from '../types/nutrition';

interface CalorieRingsProps {
  totals: Macros;
  targets: MacroTargets;
}

interface SemiCircleGaugeProps {
  label: string;
  current: number;
  target: number;
  unit?: string;
  colorHex: string;
  gradId: string;
  glowDropShadow: string;
  dotColorClass: string;
  textColorClass: string;
}

const SemiCircleGauge: React.FC<SemiCircleGaugeProps> = ({
  label,
  current,
  target,
  unit = 'г',
  colorHex,
  gradId,
  glowDropShadow,
  dotColorClass,
  textColorClass,
}) => {
  const percent = Math.min(100, Math.max(0, Math.round((current / (target || 1)) * 100)));
  // Дуга півкола: центр (45, 42), радіус 32
  // Від (13, 42) до (77, 42) -> M 13 42 A 32 32 0 0 1 77 42
  // Довжина дуги: Math.PI * 32 = 100.53
  const arcLength = 100.53;
  const strokeDashoffset = arcLength - (percent / 100) * arcLength;

  return (
    <div className="flex flex-col items-center p-3 rounded-2xl bg-[#0F1511]/90 border border-[#212E24]/80 backdrop-blur-md shadow-inner transition-all hover:border-[#2C3D30]">
      {/* Напівкруглий спідометр (Micro-gauge semi-arc) */}
      <div className="relative w-24 h-14 flex items-center justify-center">
        <svg viewBox="0 0 90 50" className="w-full h-full overflow-visible">
          <defs>
            <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor={colorHex} stopOpacity="0.75" />
              <stop offset="100%" stopColor={colorHex} stopOpacity="1" />
            </linearGradient>
          </defs>
          {/* Флаг / трек напівкола */}
          <path
            d="M 13 42 A 32 32 0 0 1 77 42"
            fill="none"
            stroke="#19231B"
            strokeWidth="7"
            strokeLinecap="round"
          />
          {/* Активний півкруг із фірмовим світінням */}
          <path
            d="M 13 42 A 32 32 0 0 1 77 42"
            fill="none"
            stroke={`url(#${gradId})`}
            strokeWidth="7"
            strokeLinecap="round"
            strokeDasharray={arcLength}
            strokeDashoffset={strokeDashoffset}
            style={{ filter: glowDropShadow }}
            className="transition-all duration-700 ease-out"
          />
        </svg>

        {/* Значення в центрі напівкола */}
        <div className="absolute bottom-0 inset-x-0 flex flex-col items-center justify-center text-center">
          <span className="text-sm font-black text-zinc-100 tracking-tight leading-none">
            {current}<span className="text-[10px] text-zinc-400 font-normal">{unit}</span>
          </span>
          <span className="text-[9px] text-zinc-400 font-medium leading-tight mt-0.5">
            з {target}{unit}
          </span>
        </div>
      </div>

      {/* Назва макросу та статусний індикатор */}
      <div className="flex items-center gap-1.5 mt-2">
        <div className={`w-2 h-2 rounded-full ${dotColorClass} shadow-sm`} />
        <span className={`text-[11px] font-bold uppercase tracking-wider ${textColorClass}`}>
          {label}
        </span>
      </div>
      <span className="text-[10px] font-semibold text-zinc-400 mt-0.5">
        {percent}%
      </span>
    </div>
  );
};

export const CalorieRings: React.FC<CalorieRingsProps> = ({ totals, targets }) => {
  const remainingCalories = Math.max(0, targets.calories - totals.calories);
  const caloriePercent = Math.min(100, Math.round((totals.calories / targets.calories) * 100));

  // Розрахунок кола для калорій
  const radius = 86;
  const stroke = 11;
  const normalizedRadius = radius - stroke * 0.5;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (caloriePercent / 100) * circumference;

  return (
    <div className="rounded-4xl p-6 relative overflow-hidden flex flex-col items-center bg-[#111713]/90 border border-[#212E24]/80 backdrop-blur-2xl shadow-2xl shadow-black/80 select-none">
      {/* Делікатне фонове органічне світіння (NUTRIQ Zen Glow: Бурштин та Мох) */}
      <div className="absolute -top-16 -right-16 w-52 h-52 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-16 -left-16 w-52 h-52 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Заголовок блоку у стилі Layout 2: Today's Balance */}
      <div className="w-full flex items-center justify-between mb-2 px-1">
        <span className="text-xs font-bold uppercase tracking-widest text-amber-400/90 flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
          Today's Balance
        </span>
        <span className="text-[11px] text-zinc-400 font-medium bg-[#162019] px-2.5 py-0.5 rounded-full border border-[#26372A]">
          Баланс дня
        </span>
      </div>

      {/* Головне золоте кільце калорій (Фірмовий дзен NUTRIQ) */}
      <div className="relative flex items-center justify-center my-2">
        <svg
          height={radius * 2}
          width={radius * 2}
          className="rotate-[-90deg] transition-all duration-700 ease-out"
        >
          {/* Фонові треки */}
          <circle
            stroke="#1B241D"
            fill="transparent"
            strokeWidth={stroke}
            r={normalizedRadius}
            cx={radius}
            cy={radius}
            className="opacity-80"
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
            className="transition-all duration-1000 ease-out drop-shadow-[0_0_16px_rgba(245,158,11,0.65)]"
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
          <span className="text-3xl sm:text-4xl font-black tracking-tight text-zinc-100 drop-shadow-sm">
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

      {/* 3 напівкруглі мікро-шкали БЖУ (Смарагд / Бурштин / Індиго) точно за Layout 2 */}
      <div className="grid grid-cols-3 gap-2.5 w-full mt-4 pt-4 border-t border-[#212E24]/80">
        {/* Білки (Смарагдовий напівкруг) */}
        <SemiCircleGauge
          label="Білки"
          current={totals.protein}
          target={targets.protein}
          colorHex="#10B981"
          gradId="gaugeProtein"
          glowDropShadow="drop-shadow(0 0 6px rgba(16,185,129,0.85))"
          dotColorClass="bg-emerald-400"
          textColorClass="text-emerald-300"
        />

        {/* Жири (Теплий бурштин напівкруг) */}
        <SemiCircleGauge
          label="Жири"
          current={totals.fat}
          target={targets.fat}
          colorHex="#F59E0B"
          gradId="gaugeFat"
          glowDropShadow="drop-shadow(0 0 6px rgba(245,158,11,0.85))"
          dotColorClass="bg-amber-400"
          textColorClass="text-amber-300"
        />

        {/* Вуглеводи (Індиго напівкруг) */}
        <SemiCircleGauge
          label="Вуглеводи"
          current={totals.carbs}
          target={targets.carbs}
          colorHex="#818CF8"
          gradId="gaugeCarbs"
          glowDropShadow="drop-shadow(0 0 6px rgba(129,140,248,0.85))"
          dotColorClass="bg-indigo-400"
          textColorClass="text-indigo-300"
        />
      </div>
    </div>
  );
};
