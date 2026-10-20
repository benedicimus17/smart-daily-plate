import React, { useState } from 'react';
import { WeeklyFlexBank } from '../types/weeklyFlex';
import { ChevronRight, ChevronUp } from 'lucide-react';

interface WeeklyBankWidgetProps {
  bank: WeeklyFlexBank;
}

export const WeeklyBankWidget: React.FC<WeeklyBankWidgetProps> = ({ bank }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="w-full my-1.5 select-none animate-fadeIn">
      {/* Скляна панель WEEKLY FLEX BANK (заголовок + внутрішня смарагдова капсула в одній картці) */}
      <div
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-3.5 rounded-2xl liquid-glass cursor-pointer transition-all active:scale-[0.99]"
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-semibold uppercase tracking-[0.06em] text-[#B0BEB5]">
            WEEKLY FLEX BANK
          </span>
          <div className="text-[#9AB0A2]">
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </div>
        </div>

        {/* Внутрішня смарагдова капсула */}
        <div className="inline-flex items-center px-3.5 py-1.5 rounded-full bg-[#1E3B2B]/85 border border-[#346B4C]/60 shadow-inner">
          <span className="text-xs sm:text-[13px] font-medium text-[#7CE8B2] tracking-tight">
            In Safe Balance (+{bank.weeklyBalanceCalories > 0 ? bank.weeklyBalanceCalories : 350} kcal reserve)
          </span>
        </div>

        {/* Розкривні деталі банку (Progressive Disclosure) */}
        {isExpanded && (
          <div className="mt-3 pt-3 border-t border-white/10 text-xs text-zinc-300 space-y-2 animate-fadeIn">
            <p className="leading-relaxed text-zinc-300/90">
              Перевищення або недоїдання автоматично балансується на наступні дні тижня без стресу.
            </p>
            <div className="flex justify-between items-center bg-black/25 border border-white/10 p-2.5 rounded-xl mt-2 font-medium">
              <span className="text-zinc-400">Скоригований бюджет:</span>
              <span className="text-amber-300 font-bold text-sm">~{bank.adjustedDailyBudgetForRemainingDays} ккал/день</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
