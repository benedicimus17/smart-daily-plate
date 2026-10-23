import React, { useState, useEffect } from 'react';
import {
  Smartphone,
  Share,
  PlusSquare,
  CheckCircle2,
  X,
  Download
} from 'lucide-react';
import {
  getPwaStatus,
  subscribeToInstallPrompt,
  triggerNativeInstall,
  PwaStatus
} from '../services/pwaService';

export const PwaInstallBanner: React.FC = () => {
  const [status, setStatus] = useState<PwaStatus>(getPwaStatus());
  const [isDismissed, setIsDismissed] = useState(false);
  const [showIosGuide, setShowIosGuide] = useState(false);
  const [installedToast, setInstalledToast] = useState(false);

  useEffect(() => {
    setStatus(getPwaStatus());
    const unsubscribe = subscribeToInstallPrompt((canPrompt) => {
      setStatus(prev => ({ ...prev, canPromptInstall: canPrompt }));
    });
    return unsubscribe;
  }, []);

  const handleInstallClick = async () => {
    if (status.isIos) {
      setShowIosGuide(true);
    } else if (status.canPromptInstall) {
      const res = await triggerNativeInstall();
      if (res.outcome === 'accepted') {
        setInstalledToast(true);
        setTimeout(() => setInstalledToast(false), 3000);
      }
    } else {
      setShowIosGuide(true);
    }
  };

  if (isDismissed) return null;

  // Якщо застосунок уже встановлено у Standalone-режимі
  if (status.isStandalone) {
    return (
      <div className="p-3.5 rounded-2xl bg-[#0e1611] border border-emerald-500/30 flex items-center justify-between text-xs text-white">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <div>
            <div className="font-bold text-emerald-300">Нативний PWA-додаток (Standalone)</div>
            <div className="text-[10.5px] text-zinc-400">Встановлено на пристрій • Офлайн-режим активний</div>
          </div>
        </div>
        <span className="text-[10px] font-black uppercase text-emerald-400 bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 rounded-full">
          Активно
        </span>
      </div>
    );
  }

  return (
    <>
      <div className="p-3.5 rounded-2xl bg-gradient-to-r from-[#141b16] to-[#0f1511] border border-amber-400/30 text-white space-y-2.5 shadow-xl animate-fadeIn">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-400/15 border border-amber-400/30 flex items-center justify-center text-amber-300 shrink-0">
              <Smartphone className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-black text-white">Встановити NUTRIQ на екран</span>
                <span className="text-[9.5px] font-bold text-amber-300 bg-amber-400/15 px-1.5 py-0.5 rounded">
                  PWA v6
                </span>
              </div>
              <p className="text-[10.5px] text-zinc-400 mt-0.5">
                Робота без рамок браузера, швидкий запуск та 100% офлайн-доступ
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setIsDismissed(true)}
            className="text-zinc-500 hover:text-zinc-300 p-1"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        <button
          id="btn-install-pwa-action"
          type="button"
          onClick={handleInstallClick}
          className="w-full py-2.5 rounded-xl font-black text-xs text-zinc-950 bg-gradient-to-r from-amber-400 to-amber-500 shadow-md flex items-center justify-center gap-1.5 active:scale-95 transition-all cursor-pointer"
        >
          <Download className="w-3.5 h-3.5 text-zinc-950 stroke-[2.5]" />
          <span>
            {status.isIos ? 'Інструкція встановлення на iPhone' : 'Встановити додаток в 1 клік'}
          </span>
        </button>
      </div>

      {/* Інструкція для iOS Safari */}
      {showIosGuide && (
        <div className="fixed inset-0 z-[95] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-sm rounded-[32px] p-6 bg-[#141b16] border border-amber-400/30 text-white shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <Smartphone className="w-5 h-5 text-amber-400" />
                <h3 className="text-sm font-black text-white">Встановлення на iPhone / iPad</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowIosGuide(false)}
                className="w-7 h-7 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-zinc-400"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex items-start gap-3 p-3 rounded-2xl bg-black/40 border border-white/5">
                <div className="w-7 h-7 rounded-xl bg-amber-400/15 border border-amber-400/30 text-amber-300 flex items-center justify-center shrink-0 font-black">
                  1
                </div>
                <div>
                  <div className="font-bold text-zinc-200">Натисніть «Поділитися»</div>
                  <div className="text-[11px] text-zinc-400 flex items-center gap-1 mt-0.5">
                    Іконка <Share className="w-3.5 h-3.5 text-blue-400 inline" /> у нижній панелі Safari
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-2xl bg-black/40 border border-white/5">
                <div className="w-7 h-7 rounded-xl bg-amber-400/15 border border-amber-400/30 text-amber-300 flex items-center justify-center shrink-0 font-black">
                  2
                </div>
                <div>
                  <div className="font-bold text-zinc-200">Оберіть «На початковий екран»</div>
                  <div className="text-[11px] text-zinc-400 flex items-center gap-1 mt-0.5">
                    Пункт меню <PlusSquare className="w-3.5 h-3.5 text-amber-300 inline" /> (Add to Home Screen)
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-2xl bg-black/40 border border-white/5">
                <div className="w-7 h-7 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shrink-0 font-black">
                  3
                </div>
                <div>
                  <div className="font-bold text-zinc-200">Підтвердіть назву NUTRIQ</div>
                  <div className="text-[11px] text-zinc-400 mt-0.5">
                    Натисніть кнопку «Додати» у правому верхньому кутку
                  </div>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowIosGuide(false)}
              className="w-full py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-zinc-950 font-black text-xs transition-all cursor-pointer"
            >
              Зрозуміло
            </button>
          </div>
        </div>
      )}

      {installedToast && (
        <div className="fixed bottom-24 inset-x-4 max-w-sm mx-auto z-50 p-3 rounded-2xl bg-emerald-500 text-zinc-950 font-bold text-xs flex items-center justify-center gap-2 shadow-2xl animate-fadeIn">
          <CheckCircle2 className="w-4 h-4" />
          <span>Додаток NUTRIQ успішно додано на ваш екран!</span>
        </div>
      )}
    </>
  );
};
