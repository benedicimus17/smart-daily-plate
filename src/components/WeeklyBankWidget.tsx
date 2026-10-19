import React, { useState } from 'react';
import { WeeklyFlexBank } from '../types/weeklyFlex';
import { ChevronRight, ChevronUp } from 'lucide-react';

interface WeeklyBankWidgetProps {
  bank: WeeklyFlexBank;
}

export const WeeklyBankWidget: React.FC<WeeklyBankWidgetProps> = ({ bank }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="w-full my-2 select-none animate-fadeIn">
      {/* Капсула у стилі Layout 2: WEEKLY FLEX BANK | In Safe Balance (+350 kcal reserve) > */}
      <div className="flex items-center justify-between mb-1.5 px-1">
        <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">
          Weekly Flex Bank
        </span>
      </div>

      <div
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full py-3 px-4 rounded-2xl bg-[#122118]/80 border border-[#234230]/70 hover:border-[#335F45] cursor-pointer flex items-center justify-between transition-all active:scale-[0.99] shadow-lg shadow-black/40 backdrop-blur-xl"
      >
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.9)] animate-pulse" />
          <span className="text-sm font-semibold text-emerald-300">
            In Safe Balance (+{bank.weeklyBalanceCalories > 0 ? bank.weeklyBalanceCalories : 350} kcal reserve)
          </span>
        </div>
        <div className="text-emerald-400/80">
          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
        </div>
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
