import React from 'react';
import { X, Sparkles, Scale, RefreshCw, PiggyBank, ArrowRight } from 'lucide-react';

interface SmartBalancerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyScale: (mealType: string, newGrams: number) => void;
  onApplySwap: (mealType: string, newDishName: string, newMacros: { calories: number; protein: number; fat: number; carbs: number }) => void;
  onApplyFlexBank: (excessCalories: number) => void;
  excessCalories?: number;
}

export const SmartBalancerModal: React.FC<SmartBalancerModalProps> = ({
  isOpen,
  onClose,
  onApplyScale,
  onApplySwap,
  onApplyFlexBank,
  excessCalories = 240
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn select-none"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm rounded-[32px] p-5 relative overflow-hidden text-zinc-100"
        onClick={(e) => e.stopPropagation()}
        style={{
          background: 'linear-gradient(165deg, rgba(22,32,26,0.96) 0%, rgba(12,17,14,0.98) 100%)',
          border: '1px solid rgba(255,255,255,0.14)',
          boxShadow: '0 24px 60px rgba(0,0,0,0.85), inset 0 1px 1px rgba(255,255,255,0.18)'
        }}
      >
        {/* Кнопка закриття */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 w-7 h-7 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-zinc-400 hover:text-white"
        >
          <X className="w-3.5 h-3.5" />
        </button>

        {/* Заголовок */}
        <div className="flex items-center gap-2 mb-2 pr-8">
          <div className="w-8 h-8 rounded-xl bg-amber-400/20 border border-amber-400/40 flex items-center justify-center text-amber-300">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white tracking-tight">
              ШІ-Балансувальник дня
            </h3>
            <span className="text-[10px] font-bold text-rose-400 uppercase tracking-wider">
              Перевищення +{excessCalories} ккал (забагато жирів)
            </span>
          </div>
        </div>

        <p className="text-xs text-zinc-300 mb-3.5 leading-relaxed">
          Вечеря виходить за межі цільового дефіциту. Оберіть одне з 3 розумних рішень, щоб не зірвати режим:
        </p>

        {/* 3 ВАРІАНТИ ВИРІШЕННЯ */}
        <div className="space-y-2.5">
          {/* Варіант 1: Авто-масштабування порції */}
          <div
            onClick={() => {
              onApplyScale('dinner', 220);
              onClose();
            }}
            className="p-3 rounded-2xl bg-black/40 border border-amber-400/30 hover:border-amber-400/60 cursor-pointer transition-all active:scale-[0.99] group"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <Scale className="w-4 h-4 text-amber-400 shrink-0" />
                <span className="text-xs font-bold text-amber-300">
                  Варіант 1 • Зменшити порцію (-25%)
                </span>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-zinc-500 group-hover:text-amber-300 transition-colors" />
            </div>
            <p className="text-[11px] text-zinc-300 mt-1 pl-6">
              Зменшити порцію вечері з 300г до 225г. Смак страви зберігається, а день повертається у чистий дефіцит.
            </p>
          </div>

          {/* Варіант 2: Шеф-заміна страви */}
          <div
            onClick={() => {
              onApplySwap('dinner', 'Лосось на грилі зі спаржею', { calories: 420, protein: 44, fat: 18, carbs: 12 });
              onClose();
            }}
            className="p-3 rounded-2xl bg-black/40 border border-emerald-400/30 hover:border-emerald-400/60 cursor-pointer transition-all active:scale-[0.99] group"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <RefreshCw className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="text-xs font-bold text-emerald-300">
                  Варіант 2 • Легша альтернатива (Swap)
                </span>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-zinc-500 group-hover:text-emerald-300 transition-colors" />
            </div>
            <p className="text-[11px] text-zinc-300 mt-1 pl-6">
              Замінити на <strong>«Лосось зі спаржею»</strong>. Білок 44г збережено, але мінус 240 ккал зайвого жиру!
            </p>
          </div>

          {/* Варіант 3: Покриття з Weekly Flex Bank */}
          <div
            onClick={() => {
              onApplyFlexBank(excessCalories);
              onClose();
            }}
            className="p-3 rounded-2xl bg-black/40 border border-indigo-400/30 hover:border-indigo-400/60 cursor-pointer transition-all active:scale-[0.99] group"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <PiggyBank className="w-4 h-4 text-indigo-400 shrink-0" />
                <span className="text-xs font-bold text-indigo-300">
                  Варіант 3 • Списати з Flex Bank
                </span>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-zinc-500 group-hover:text-indigo-300 transition-colors" />
            </div>
            <p className="text-[11px] text-zinc-300 mt-1 pl-6">
              Залишити страву без змін. Списати +{excessCalories} ккал із тижневого буфера (+350 ккал). Ваш темп не постраждає!
            </p>
          </div>
        </div>

        <div className="mt-3.5 pt-2.5 border-t border-white/10 text-center">
          <span className="text-[10px] text-zinc-500">
            💡 NUTRIQ адаптує макроси без почуття провини та жорстких рамок
          </span>
        </div>
      </div>
    </div>
  );
};
