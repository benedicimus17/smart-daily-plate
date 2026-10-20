import React, { useEffect, useState } from 'react';

interface SplashScreenProps {
  onFinish: () => void;
  minDurationMs?: number;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onFinish, minDurationMs = 4200 }) => {
  const [fading, setFading] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setFading(true);
      setTimeout(onFinish, 550);
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
      className={`fixed inset-0 z-50 flex items-center justify-center bg-[#0B0E0D] cursor-pointer transition-opacity duration-500 ease-out select-none overflow-hidden ${
        fading ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      {/* Оригінальне студійне світлове поле зі сланцем та вертикальним золотим променем (Panel 2) */}
      <img
        src="/splash_studio_bg.jpg"
        alt="NUTRIQ Studio Splash"
        className="absolute inset-0 w-full h-full object-cover object-center pointer-events-none scale-[1.01]"
      />

      {/* Живе оптичне дихання центрального світлового променя */}
      <div
        className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-[3px] pointer-events-none animate-pulse"
        style={{
          background:
            'linear-gradient(180deg, rgba(255,248,220,0.85) 0%, rgba(244,185,66,0.95) 50%, rgba(244,185,66,0.15) 95%, transparent 100%)',
          boxShadow:
            '0 0 18px 2px rgba(245, 186, 66, 0.75), 0 0 55px 10px rgba(218, 155, 58, 0.38)',
        }}
      />

      {/* Типографіка еталона Panel 2: NUTRIQ — INTELLIGENT NUTRITION */}
      <div className="relative z-10 flex flex-col items-center text-center px-6 -mt-2">
        <div className="flex items-baseline justify-center pl-[0.24em]">
          <span
            className="text-[34px] sm:text-[38px] font-normal tracking-[0.26em] text-[#F6F6F4]"
            style={{
              textShadow: '0 2px 18px rgba(0, 0, 0, 0.85)',
            }}
          >
            NUTRI
          </span>
          <span
            className="text-[35px] sm:text-[39px] font-semibold tracking-[0.06em] text-[#F5BA42] ml-[0.04em]"
            style={{
              textShadow:
                '0 0 16px rgba(245, 186, 66, 0.95), 0 0 36px rgba(245, 186, 66, 0.55), 0 2px 12px rgba(0,0,0,0.9)',
            }}
          >
            Q
          </span>
        </div>

        <p
          className="mt-3.5 text-[9.5px] sm:text-[10.5px] font-normal tracking-[0.42em] uppercase text-[#B5B7B2] pl-[0.42em]"
          style={{
            textShadow: '0 1px 10px rgba(0, 0, 0, 0.9)',
          }}
        >
          Intelligent Nutrition
        </p>
      </div>
    </div>
  );
};
