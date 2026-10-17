import React, { useState } from 'react';
import { WeeklyFlexBank } from '../types/weeklyFlex';
import { ShieldCheck, ChevronDown, ChevronUp, Sparkles } from 'lucide-react';

interface WeeklyBankWidgetProps {
  bank: WeeklyFlexBank;
}

export const WeeklyBankWidget: React.FC<WeeklyBankWidgetProps> = ({ bank }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="glass-card-interactive rounded-3xl p-4 my-4 cursor-pointer" onClick={() => setIsExpanded(!isExpanded)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-brand-indigo">
            <ShieldCheck className="w-5 h-5 text-brand-indigo" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Weekly Flex Bank</span>
              <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-brand-emerald bg-emerald-50 px-2 py-0.5 rounded-full">
                <Sparkles className="w-2.5 h-2.5" /> В безпеці
              </span>
            </div>
            <div className="text-sm font-bold text-slate-800">
              +{bank.weeklyBalanceCalories} ккал <span className="text-xs text-slate-400 font-normal">вільного запасу</span>
            </div>
          </div>
        </div>

        <button className="text-slate-400 p-1 hover:text-slate-600 transition-colors">
          {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </button>
      </div>

      {/* Прогрес 7 днів тижня (міні-бар) */}
      <div className="grid grid-cols-7 gap-1.5 mt-3 pt-3 border-t border-slate-100/80">
        {bank.days.map((day) => {
          const isOver = day.balanceCalories < 0;
          return (
            <div key={day.date} className="flex flex-col items-center">
              <span className={`text-[10px] font-medium mb-1 ${day.isToday ? 'text-brand-indigo font-bold' : 'text-slate-400'}`}>
                {day.dayName}
              </span>
              <div 
                className={`w-full h-8 rounded-lg flex items-center justify-center text-[10px] font-semibold transition-all ${
                  day.isToday
                    ? 'bg-brand-indigo text-white shadow-glow-indigo'
                    : day.isCompleted
                    ? isOver
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-emerald-100 text-emerald-800'
                    : 'bg-slate-100/70 text-slate-400'
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
        <div className="mt-3 pt-3 border-t border-slate-100 text-xs text-slate-600 space-y-1.5 animate-fadeIn">
          <p className="leading-relaxed">
            🌿 <strong>Антистрес-контроль:</strong> Перевищення або недоїдання автоматично розподіляється на наступні дні без почуття провини.
          </p>
          <div className="flex justify-between items-center bg-slate-50 p-2.5 rounded-xl mt-2 font-medium">
            <span>Скоригований бюджет на наступні дні:</span>
            <span className="text-brand-indigo font-bold text-sm">~{bank.adjustedDailyBudgetForRemainingDays} ккал/день</span>
          </div>
        </div>
      )}
    </div>
  );
};
