import React, { useState } from 'react';
import { Droplets, Check } from 'lucide-react';

export const WaterTracker: React.FC = () => {
  const [glasses, setGlasses] = useState<number>(3); // 3 з 6 за замовчуванням
  const totalGlasses = 6;
  const glassVolumeMl = 250;

  const handleToggleGlass = (index: number) => {
    // Якщо тиснемо на ту саму заповнену склянку — можемо зняти одну або встановити новий рівень
    if (glasses === index + 1) {
      setGlasses(index);
    } else {
      setGlasses(index + 1);
    }
  };

  const isCompleted = glasses >= totalGlasses;

  return (
    <div
      className="w-full rounded-[24px] px-3.5 py-2.5 relative overflow-hidden select-none transition-all shadow-md"
      style={{
        background: 'linear-gradient(165deg, rgba(20,29,24,0.88) 0%, rgba(12,17,14,0.95) 100%)',
        border: '1px solid rgba(255,255,255,0.1)',
        boxShadow: '0 8px 24px rgba(0,0,0,0.5)'
      }}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5">
          <Droplets className="w-3.5 h-3.5 text-cyan-400" />
          <span className="text-[11px] font-bold text-white tracking-tight">
            Гідратація
          </span>
          <span className="text-[10px] text-zinc-400 ml-1">
            ({glasses * glassVolumeMl} / {totalGlasses * glassVolumeMl} мл)
          </span>
        </div>

        <span
          className={`text-[9.5px] font-extrabold px-2 py-0.5 rounded-full transition-all flex items-center gap-1 ${
            isCompleted
              ? 'bg-cyan-500/25 text-cyan-300 border border-cyan-400/40 shadow-sm shadow-cyan-500/30'
              : 'bg-white/5 text-zinc-400'
          }`}
        >
          {isCompleted ? (
            <>
              <Check className="w-2.5 h-2.5 stroke-[3]" />
              <span>Норма 1.5 л!</span>
            </>
          ) : (
            <span>{totalGlasses - glasses} скл. до норми</span>
          )}
        </span>
      </div>

      {/* 6 тактильних інтерактивних склянок */}
      <div className="grid grid-cols-6 gap-2">
        {Array.from({ length: totalGlasses }).map((_, i) => {
          const filled = i < glasses;
          return (
            <button
              key={i}
              type="button"
              onClick={() => handleToggleGlass(i)}
              className={`h-9 rounded-xl flex flex-col items-center justify-center transition-all duration-300 active:scale-90 relative ${
                filled
                  ? 'bg-gradient-to-t from-cyan-600/40 via-cyan-500/20 to-cyan-400/10 border border-cyan-400/60 shadow-[0_0_12px_rgba(34,211,238,0.35)]'
                  : 'bg-black/30 border border-white/[0.08] hover:border-white/20 text-zinc-600'
              }`}
              title={`Склянка ${i + 1} (250 мл)`}
            >
              <Droplets
                className={`w-3.5 h-3.5 transition-transform duration-300 ${
                  filled ? 'text-cyan-300 scale-110' : 'text-zinc-600'
                }`}
              />
              <span className={`text-[8.5px] font-bold mt-0.5 ${filled ? 'text-cyan-200' : 'text-zinc-600'}`}>
                {i + 1}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
