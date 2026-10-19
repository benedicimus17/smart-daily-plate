import React, { useEffect, useState } from 'react';

interface SplashScreenProps {
  onFinish: () => void;
  minDurationMs?: number;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onFinish, minDurationMs = 2200 }) => {
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
      {/* Вертикальний світловий промінь та темний сланець (Vertical Ray) */}
      <div className="relative w-full max-w-md h-full flex flex-col items-center justify-center overflow-hidden">
        {/* Фоновий текстурний сланець та промінь */}
        <div className="absolute inset-0 bg-[#0C100E]">
          {/* Світловий вертикальний промінь */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[2px] h-full bg-gradient-to-b from-transparent via-amber-200 to-transparent shadow-[0_0_25px_rgba(245,158,11,0.95),0_0_50px_rgba(245,158,11,0.6)] animate-pulse" />
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-52 h-96 bg-amber-500/10 rounded-full blur-[90px] pointer-events-none" />
          <div className="absolute bottom-1/4 left-1/2 -translate-x-1/2 w-48 h-48 bg-emerald-600/5 rounded-full blur-[80px] pointer-events-none" />
        </div>

        {/* Фірмовий логотип NUTRIQ (Option A: Центрований логотип із золотою Q) */}
        <div className="relative z-10 flex flex-col items-center text-center animate-fadeIn px-6">
          <div className="flex items-baseline">
            <span className="text-4xl sm:text-5xl font-black tracking-[0.2em] text-[#F5F2EB] font-sans drop-shadow-[0_4px_16px_rgba(0,0,0,0.9)]">
              NUTRI
            </span>
            <span className="text-5xl sm:text-6xl font-black text-amber-400 font-sans ml-1 drop-shadow-[0_0_25px_rgba(245,158,11,0.9)] animate-pulse">
              Q
            </span>
          </div>

          <div className="mt-4 flex items-center gap-2">
            <span className="w-8 h-[1px] bg-amber-400/40" />
            <span className="text-[11px] font-semibold tracking-[0.3em] uppercase text-zinc-400/90">
              Intelligent Nutrition
            </span>
            <span className="w-8 h-[1px] bg-amber-400/40" />
          </div>

          {/* Витончений індикатор завантаження */}
          <div className="mt-12 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-400/60 animate-ping" />
            <span className="w-2 h-2 rounded-full bg-amber-400/80 animate-ping delay-150" />
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping delay-300" />
          </div>
          
          <p className="mt-6 text-[10px] text-zinc-500 tracking-wider">
            Торкніться екрана для входу
          </p>
        </div>
      </div>
    </div>
  );
};
