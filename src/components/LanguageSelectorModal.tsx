import React from 'react';
import { X, Check, Globe } from 'lucide-react';
import { useTranslation } from '../store/languageStore';
import { SupportedLocale } from '../i18n/translations';

interface LanguageSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LanguageSelectorModal: React.FC<LanguageSelectorModalProps> = ({ isOpen, onClose }) => {
  const { lang, setLanguage, supportedLanguages, t } = useTranslation();

  if (!isOpen) return null;

  const handleSelect = (code: SupportedLocale) => {
    setLanguage(code);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center p-4 animate-fadeIn select-none">
      {/* Бекдроп для закриття тапом збоку */}
      <div
        id="language-modal-backdrop"
        className="absolute inset-0 bg-black/85 backdrop-blur-md cursor-pointer"
        onClick={onClose}
      />

      <div
        className="relative z-10 w-full max-w-sm rounded-[32px] overflow-hidden p-6 transition-all border border-amber-400/30 text-white shadow-[0_25px_60px_rgba(0,0,0,0.95)]"
        onClick={(e) => e.stopPropagation()}
        style={{
          background: 'linear-gradient(165deg, rgba(28,36,30,0.98) 0%, rgba(12,16,14,0.99) 100%)'
        }}
      >
        {/* Шапка */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-amber-400/15 border border-amber-400/30 text-amber-400 flex items-center justify-center shadow-inner">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-black text-white tracking-tight">{t('select_lang_title')}</h3>
              <p className="text-[10px] text-zinc-400">Автовизначення мови пристрою (Auto-detect)</p>
            </div>
          </div>

          <button
            id="btn-close-language-modal"
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-zinc-400 hover:text-white transition-all active:scale-90"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Список мов */}
        <div className="py-3 space-y-2">
          {supportedLanguages.map((opt) => {
            const isSelected = lang === opt.code;
            return (
              <button
                key={opt.code}
                id={`btn-lang-${opt.code}`}
                type="button"
                onClick={() => handleSelect(opt.code)}
                className={`w-full p-3 rounded-2xl border text-left transition-all flex items-center justify-between active:scale-[0.99] cursor-pointer ${
                  isSelected
                    ? 'bg-amber-400/20 border-amber-400/60 shadow-[0_0_15px_rgba(245,158,11,0.2)]'
                    : 'bg-white/[0.03] hover:bg-white/[0.07] border-white/5 hover:border-white/15'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl drop-shadow-sm">{opt.flag}</span>
                  <div>
                    <span className="text-xs font-bold text-white block">{opt.nativeName}</span>
                    <span className="text-[10px] text-zinc-400">{opt.name}</span>
                  </div>
                </div>

                {isSelected ? (
                  <div className="w-6 h-6 rounded-full bg-amber-400 text-zinc-950 flex items-center justify-center shadow-sm">
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                ) : (
                  <span className="text-[10px] text-zinc-500 font-mono uppercase">{opt.code}</span>
                )}
              </button>
            );
          })}
        </div>

        {/* Інформаційний бейдж про вагу мов */}
        <div className="mt-2 p-2.5 rounded-xl bg-black/40 border border-white/5 text-[10.5px] text-zinc-400 text-center">
          💡 Вага одного перекладу: ~4 КБ. Мова змінюється миттєво без перезавантаження.
        </div>
      </div>
    </div>
  );
};
