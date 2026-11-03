import React, { useState } from 'react';
import { WeeklyFlexBank } from '../types/weeklyFlex';
import { ChevronRight, ChevronUp, ShieldCheck, AlertTriangle, AlertCircle } from 'lucide-react';
import { useTranslation } from '../store/languageStore';

interface WeeklyBankWidgetProps {
  bank: WeeklyFlexBank;
}

export const WeeklyBankWidget: React.FC<WeeklyBankWidgetProps> = ({ bank }) => {
  const { t, lang } = useTranslation();
  const [isExpanded, setIsExpanded] = useState(false);

  const balance = bank.weeklyBalanceCalories;
  const isDeficit = bank.bankHealthStatus === 'deficit';
  const isSafe = !isDeficit && balance >= 0;
  const isWarning = isDeficit || (balance < 0 && balance >= -350);

  return (
    <div id="widget-weekly-flex-bank" className="w-full my-1.5 select-none animate-fadeIn">
      {/* Скляна панель WEEKLY FLEX BANK */}
      <div
        id="btn-expand-weekly-bank"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-3.5 rounded-2xl liquid-glass cursor-pointer transition-all active:scale-[0.99] border border-white/10 hover:border-white/20"
      >
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-semibold uppercase tracking-[0.06em] text-[#B0BEB5]">
              {t('weekly_flex_bank')}
            </span>
            {isSafe ? (
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            ) : isWarning ? (
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
            ) : (
              <AlertCircle className="w-3.5 h-3.5 text-rose-400" />
            )}
          </div>
          <div className="text-[#9AB0A2]">
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </div>
        </div>

        {/* Внутрішня динамічна капсула статусу банку */}
        <div
          id="weekly-bank-pill-status"
          className={`inline-flex items-center px-3.5 py-1.5 rounded-full border shadow-inner transition-all ${
            isSafe
              ? 'bg-[#1E3B2B]/85 border-[#346B4C]/60 text-[#7CE8B2]'
              : isWarning
              ? 'bg-amber-950/70 border-amber-600/50 text-amber-300'
              : 'bg-rose-950/70 border-rose-600/50 text-rose-300'
          }`}
        >
          <span id="weekly-bank-pill" className="text-xs sm:text-[13px] font-bold tracking-tight">
            {isSafe
              ? `${t('bank_in_reserve')}: +${balance} ${t('calories')}`
              : `${t('bank_deficit')}: ${balance >= 0 ? `-${Math.round(Math.round(bank.weeklyTargetCalories / 7) - bank.adjustedDailyBudgetForRemainingDays)}/день` : `${balance} ${t('calories')}`}`}
          </span>
        </div>

        {/* 7 міні-індикаторів днів тижня (Пн - Нд) */}
        <div id="weekly-bank-mini-days" className="grid grid-cols-7 gap-1 mt-2.5 pt-2 border-t border-white/5">
          {bank.days.map((d) => {
            const hasData = d.consumedCalories > 0;
            const dayOver = d.balanceCalories < 0;
            return (
              <div key={d.date} className="flex flex-col items-center">
                <span
                  className={`text-[9px] font-bold mb-1 ${
                    d.isToday ? 'text-amber-400 underline underline-offset-2' : 'text-zinc-500'
                  }`}
                >
                  {d.dayName}
                </span>
                <div
                  className={`w-full h-1.5 rounded-full transition-all ${
                    d.isToday
                      ? 'bg-amber-400 shadow-sm shadow-amber-400/50'
                      : !hasData
                      ? 'bg-white/10'
                      : dayOver
                      ? 'bg-rose-500/80'
                      : 'bg-emerald-400/80'
                  }`}
                  title={`${d.date}: ${d.consumedCalories}/${d.targetCalories} kcal`}
                />
              </div>
            );
          })}
        </div>

        {/* Розкривні деталі банку (Progressive Disclosure) */}
        {isExpanded && (
          <div id="weekly-bank-drawer" className="mt-3 pt-3 border-t border-white/10 text-xs text-zinc-300 space-y-2 animate-fadeIn">
            <p className="leading-relaxed text-zinc-300/90 text-[11.5px]">
              {t('bank_explanation')}
            </p>
            <div className="grid grid-cols-2 gap-2 mt-2">
              <div className="bg-black/30 border border-white/10 p-2.5 rounded-xl font-medium">
                <span className="text-[10px] text-zinc-400 block uppercase tracking-wider">
                  {t('weekly_flex_bank')}
                </span>
                <span className="text-zinc-200 font-bold text-xs">
                  {bank.weeklyConsumedCalories} / {bank.weeklyTargetCalories} {t('calories')}
                </span>
              </div>
              <div className="bg-black/30 border border-white/10 p-2.5 rounded-xl font-medium">
                <span className="text-[10px] text-zinc-400 block uppercase tracking-wider">
                  {t('bank_adjusted_budget')}
                </span>
                <span id="weekly-bank-adjusted-budget" className="text-amber-300 font-bold text-xs">
                  ~{bank.adjustedDailyBudgetForRemainingDays} {t('calories')}/{lang === 'uk' ? 'день' : lang === 'es' ? 'día' : 'day'}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
