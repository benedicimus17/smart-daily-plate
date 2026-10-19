import React, { useState } from 'react';
import { WeeklyFlexBank } from '../types/weeklyFlex';
import { ShieldCheck, ChevronDown, ChevronUp, Sparkles } from 'lucide-react';

interface WeeklyBankWidgetProps {
  bank: WeeklyFlexBank;
}

export const WeeklyBankWidget: React.FC<WeeklyBankWidgetProps> = ({ bank }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div
      className="rounded-3xl p-4 my-3 cursor-pointer bg-[#111713]/90 border border-[#212E24]/80 hover:border-[#2C3E30] backdrop-blur-xl shadow-xl shadow-black/50 transition-all duration-200 select-none"
      onClick={() => setIsExpanded(!isExpanded)}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-inner">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-bold text-amber-400/90 uppercase tracking-wider">
                Weekly Flex Bank
              </span>
              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-300 bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 rounded-full shadow-sm">
                <Sparkles className="w-2.5 h-2.5 text-emerald-300" /> In Safe Balance
              </span>
            </div>
            <div className="text-sm font-extrabold text-zinc-100 mt-0.5">
              +{bank.weeklyBalanceCalories} ккал <span className="text-xs text-zinc-400 font-normal">вільного запасу</span>
            </div>
          </div>
        </div>

        <button
          type="button"
          className="text-zinc-500 p-1 hover:text-zinc-300 transition-colors"
        >
          {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </button>
      </div>

      {/* Прогрес 7 днів тижня (міні-бар) */}
      <div className="grid grid-cols-7 gap-1.5 mt-3 pt-3 border-t border-[#1E2921]">
        {bank.days.map((day) => {
          const isOver = day.balanceCalories < 0;
          return (
            <div key={day.date} className="flex flex-col items-center">
              <span className={`text-[10px] font-semibold mb-1 ${day.isToday ? 'text-amber-400' : 'text-zinc-400'}`}>
                {day.dayName}
              </span>
              <div 
                className={`w-full h-8 rounded-lg flex items-center justify-center text-[10px] font-bold transition-all ${
                  day.isToday
                    ? 'bg-amber-500/25 border border-amber-400/60 text-amber-200 shadow-[0_0_10px_rgba(245,158,11,0.3)]'
                    : day.isCompleted
                    ? isOver
                      ? 'bg-rose-500/20 border border-rose-500/40 text-rose-300'
                      : 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-300'
                    : 'bg-[#151D18] border border-[#212E24]/60 text-zinc-400'
                }`}
              >
                {day.isCompleted || day.isToday ? (
                  day.balanceCalories > 0 ? `+${day.balanceCalories}` : day.balanceCalories
                ) : (
                  '—'
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Розкривні деталі банку (Progressive Disclosure) */}
      {isExpanded && (
        <div className="mt-3 pt-3 border-t border-[#1E2921] text-xs text-zinc-300 space-y-2 animate-fadeIn">
          <p className="leading-relaxed text-zinc-400">
            🌿 <strong className="text-zinc-200">Антистрес-контроль:</strong> Перевищення або недоїдання автоматично розподіляється на наступні дні без почуття провини.
          </p>
          <div className="flex justify-between items-center bg-[#0E1410] border border-[#212E24] p-2.5 rounded-xl mt-2 font-medium">
            <span className="text-zinc-400">Скоригований бюджет на наступні дні:</span>
            <span className="text-amber-300 font-extrabold text-sm">~{bank.adjustedDailyBudgetForRemainingDays} ккал/день</span>
          </div>
        </div>
      )}
    </div>
  );
};
