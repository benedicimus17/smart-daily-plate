import React, { useEffect, useState } from 'react';

interface SplashScreenProps {
  onFinish: () => void;
  minDurationMs?: number;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onFinish, minDurationMs = 8000 }) => {
  const [fading, setFading] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setFading(true);
      setTimeout(onFinish, 600); // 600ms fade out animation
    }, minDurationMs);

    return () => clearTimeout(timer);
  }, [onFinish, minDurationMs]);

  const handleDismiss = () => {
    if (!fading) {
      setFading(true);
      setTimeout(onFinish, 300);
    }
  };

  return (
    <div
      onClick={handleDismiss}
      className={`fixed inset-0 z-50 flex items-center justify-center bg-[#0C100E] cursor-pointer transition-opacity duration-700 ease-out select-none ${
        fading ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
      title="Натисніть у будь-якому місці для пропуску"
    >
      {/* Вертикальний світловий промінь та темний сланець (Option A: Vertical Ray) */}
      <div className="relative w-full h-full flex flex-col items-center justify-center overflow-hidden bg-[#0C100E]">
        {/* Фоновий текстурний сланець та промінь */}
        <div className="absolute inset-0 bg-[#0C100E] pointer-events-none">
          {/* Світловий вертикальний промінь золота */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[2px] h-full bg-gradient-to-b from-amber-400/30 via-amber-200 to-amber-500/20 shadow-[0_0_35px_rgba(245,158,11,0.9),0_0_70px_rgba(245,158,11,0.5)] animate-pulse" />
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-72 h-96 bg-amber-500/12 rounded-full blur-[100px] pointer-events-none" />
          <div className="absolute bottom-1/4 left-1/2 -translate-x-1/2 w-56 h-56 bg-emerald-600/8 rounded-full blur-[90px] pointer-events-none" />
        </div>

        {/* Фірмовий логотип NUTRIQ (Option A: Центрований логотип із золотою Q) */}
        <div className="relative z-10 flex flex-col items-center text-center animate-fadeIn px-6">
          <div className="flex items-baseline">
            <span className="text-5xl sm:text-6xl font-black tracking-[0.2em] text-[#F5F2EB] font-sans drop-shadow-[0_4px_24px_rgba(0,0,0,0.95)]">
              NUTRI
            </span>
            <span className="text-6xl sm:text-7xl font-black text-amber-400 font-sans ml-1 drop-shadow-[0_0_35px_rgba(245,158,11,0.95)] animate-pulse">
              Q
            </span>
          </div>

          <div className="mt-4 flex items-center gap-2">
            <span className="w-10 h-[1px] bg-amber-400/50" />
            <span className="text-xs font-semibold tracking-[0.3em] uppercase text-zinc-300">
              Intelligent Nutrition
            </span>
            <span className="w-10 h-[1px] bg-amber-400/50" />
          </div>

          {/* Витончений індикатор завантаження */}
          <div className="mt-12 flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400/60 animate-ping" />
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400/80 animate-ping delay-150" />
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping delay-300" />
          </div>
          
          <button
            type="button"
            onClick={handleDismiss}
            className="mt-8 px-4 py-1.5 rounded-full bg-[#162019]/80 border border-amber-500/30 text-xs font-medium text-amber-300/90 hover:text-amber-200 hover:border-amber-400 transition-all shadow-sm"
          >
            Торкніться для входу →
          </button>
        </div>
      </div>
    </div>
  );
};
