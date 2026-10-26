import React from 'react';
import {
  AlertTriangle,
  X,
  ShieldAlert,
  CheckCircle2,
  Sparkles
} from 'lucide-react';
import { AllergenConflict } from '../services/allergenService';

interface AllergenConflictModalProps {
  isOpen: boolean;
  dishName: string;
  conflicts: AllergenConflict[];
  onCancel: () => void;
  onProceedAnyway: () => void;
  onReplaceWithSafeAlternative?: (suggestion: string) => void;
}

export const AllergenConflictModal: React.FC<AllergenConflictModalProps> = ({
  isOpen,
  dishName,
  conflicts,
  onCancel,
  onProceedAnyway,
  onReplaceWithSafeAlternative
}) => {
  if (!isOpen || conflicts.length === 0) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/90 backdrop-blur-md animate-fadeIn select-none">
      <div
        id="allergen-conflict-modal"
        className="w-full max-w-md rounded-3xl p-5 sm:p-6 text-zinc-100 relative overflow-hidden flex flex-col border border-rose-500/30"
        style={{
          background: 'linear-gradient(165deg, rgba(30,18,20,0.98) 0%, rgba(18,10,12,0.99) 100%)',
          boxShadow: '0 24px 60px rgba(0,0,0,0.9), 0 0 50px rgba(244,63,94,0.15)'
        }}
      >
        {/* Glow */}
        <div className="absolute -top-16 -right-16 w-48 h-48 bg-rose-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-48 h-48 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-rose-500/20 relative z-10 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm sm:text-base text-white tracking-tight flex items-center gap-1.5">
                <span>Конфлікт з раціоном!</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30">
                  Увага
                </span>
              </h3>
              <p className="text-[11px] text-zinc-400 truncate max-w-[220px]">
                {dishName}
              </p>
            </div>
          </div>
          <button
            id="btn-close-allergen-conflict"
            type="button"
            onClick={onCancel}
            className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-zinc-400 hover:text-white transition-all cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Conflict Details */}
        <div className="py-4 space-y-3 relative z-10 text-xs">
          <p className="text-zinc-300 text-xs font-semibold">
            Ця страва містить інгредієнти, які суперечать вашим налаштуванням здоров'я:
          </p>

          <div className="space-y-2">
            {conflicts.map((c, idx) => (
              <div
                key={idx}
                className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/25 space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-rose-300 flex items-center gap-1.5 text-xs">
                    <AlertTriangle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                    <span>{c.name}</span>
                  </span>
                  <span className="text-[10px] bg-rose-500/20 text-rose-200 px-2 py-0.5 rounded-md font-mono">
                    «{c.triggerIngredient}»
                  </span>
                </div>

                <div className="p-2 rounded-xl bg-black/40 border border-white/5 text-[11px] text-zinc-300 flex items-start gap-1.5">
                  <Sparkles className="w-3 h-3 text-amber-400 shrink-0 mt-0.5" />
                  <span>
                    <strong className="text-amber-300">Порада ШІ: </strong>
                    {c.safeAlternativeSuggestion}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-3 border-t border-white/10 space-y-2 relative z-10 shrink-0">
          {onReplaceWithSafeAlternative && conflicts[0]?.safeAlternativeSuggestion && (
            <button
              id="btn-replace-safe-alternative"
              type="button"
              onClick={() => onReplaceWithSafeAlternative(conflicts[0].safeAlternativeSuggestion)}
              className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-emerald-600 text-zinc-950 font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 hover:from-emerald-400 hover:to-emerald-500 transition-all active:scale-98 cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Замінити на безпечний аналог</span>
            </button>
          )}

          <div className="grid grid-cols-2 gap-2">
            <button
              id="btn-proceed-allergen-anyway"
              type="button"
              onClick={onProceedAnyway}
              className="py-2.5 px-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-rose-300 hover:text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer text-center"
              title="Додати страву попри застереження"
            >
              <span>Все одно додати</span>
            </button>

            <button
              id="btn-cancel-allergen-conflict"
              type="button"
              onClick={onCancel}
              className="py-2.5 px-3 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 text-zinc-200 hover:text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer text-center"
            >
              <span>Скасувати</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
