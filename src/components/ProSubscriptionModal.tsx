import React, { useState } from 'react';
import { X, Crown, Check, Sparkles, ChefHat, RefreshCw, Scale, TrendingUp, ShieldCheck } from 'lucide-react';
import { useUserStore } from '../store/userStore';

interface ProSubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const ProSubscriptionModal: React.FC<ProSubscriptionModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const { user, setProStatus } = useUserStore();
  const [selectedPlan, setSelectedPlan] = useState<'yearly' | 'monthly'>('yearly');
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const handleActivatePro = () => {
    setIsSubscribing(true);
    setTimeout(() => {
      setProStatus(true);
      setIsSubscribing(false);
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        onSuccess?.();
        onClose();
      }, 1200);
    }, 600);
  };

  const handleDeactivatePro = () => {
    setProStatus(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 animate-fadeIn select-none">
      {/* Окремий бекдроп для закриття тапом збоку */}
      <div
        id="pro-subscription-backdrop"
        className="absolute inset-0 bg-black/85 backdrop-blur-md cursor-pointer"
        onClick={onClose}
      />
      <div
        className="relative z-10 w-full max-w-sm rounded-[32px] overflow-hidden p-6 transition-all border border-amber-400/40 text-white shadow-[0_25px_60px_rgba(0,0,0,0.95)]"
        onClick={(e) => e.stopPropagation()}
        style={{
          background: 'linear-gradient(165deg, rgba(28,36,30,0.98) 0%, rgba(12,16,14,0.99) 100%)'
        }}
      >
        {/* Фонове золоте неонове світіння */}
        <div className="absolute -top-16 -right-16 w-48 h-48 bg-amber-400/20 rounded-full blur-3xl pointer-events-none" />

        {/* Кнопка закриття */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-zinc-400 hover:text-white transition-all active:scale-90"
        >
          <X className="w-4 h-4" />
        </button>

        {success ? (
          <div className="py-10 text-center space-y-3 animate-fadeIn">
            <div className="w-16 h-16 rounded-3xl bg-emerald-500 text-zinc-950 flex items-center justify-center mx-auto shadow-[0_0_30px_rgba(16,185,129,0.6)]">
              <Check className="w-8 h-8 stroke-[3]" />
            </div>
            <h3 className="text-lg font-black text-white">Вітаємо в NUTRIQ PRO!</h3>
            <p className="text-xs text-zinc-300">
              Усі ресторанні шеф-страви, Smart Swap та Cook-Loss калькуляції розблоковано.
            </p>
          </div>
        ) : user.isPro ? (
          <div className="space-y-4 animate-fadeIn">
            {/* Статус: PRO вже активовано */}
            <div className="text-center space-y-1.5 pt-1">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-500 text-zinc-950 flex items-center justify-center mx-auto shadow-[0_0_20px_rgba(245,158,11,0.4)]">
                <Crown className="w-6 h-6 stroke-[2.5]" />
              </div>
              <h2 className="text-lg font-black tracking-tight text-white">
                NUTRIQ <span className="text-amber-400">PRO</span> Активно 👑
              </h2>
              <p className="text-xs text-zinc-300">
                Усі преміальні функції, 12 ресторанних страв та Smart Swap розблоковано.
              </p>
            </div>

            <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-300 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 shrink-0 text-emerald-400" />
              <span>Повний доступ до меню шефа, розрахунку уварки та аналітики.</span>
            </div>

            <div className="space-y-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-amber-400 to-amber-500 text-zinc-950 font-black text-xs flex items-center justify-center gap-2 shadow-lg shadow-amber-400/25 active:scale-95 transition-all cursor-pointer"
              >
                <span>Продовжити користування</span>
              </button>

              <button
                type="button"
                onClick={handleDeactivatePro}
                className="w-full py-2.5 rounded-2xl bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 text-rose-300 text-xs font-bold transition-all active:scale-95 flex items-center justify-center gap-1.5"
                title="Перейти назад у безкоштовний режим для тестування блокувань"
              >
                <span>Вимкнути PRO (Тест режиму FREE 🔒)</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Заголовок */}
            <div className="text-center space-y-1.5 pt-1">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-500 text-zinc-950 flex items-center justify-center mx-auto shadow-[0_0_20px_rgba(245,158,11,0.4)]">
                <Crown className="w-6 h-6 stroke-[2.5]" />
              </div>
              <h2 className="text-lg font-black tracking-tight text-white">
                NUTRIQ <span className="text-amber-400">PRO</span>
              </h2>
              <p className="text-xs text-zinc-400">
                Персональний шеф-кухар та нутриціолог у твоїй кишені
              </p>
            </div>

            {/* 5 Переваг підписки */}
            <div className="space-y-2 py-1">
              {[
                { icon: ChefHat, title: 'Каталог 50+ авторських страв', desc: 'Точні грами, макроси та покроковий рецепт' },
                { icon: RefreshCw, title: 'ШІ-Заміна Smart Swap (2 сек)', desc: 'Миттєва ізокалорійна заміна набридлих страв' },
                { icon: Scale, title: 'Облік уварки/ужарки (Cook-Loss)', desc: 'Авто-перерахунок сирої ваги в готову без похибок' },
                { icon: TrendingUp, title: 'True Fat Trend (EMA аналітика)', desc: 'Спалювання чистого жиру без водної ваги' },
                { icon: Sparkles, title: 'Weekly Flex Bank на вікенди', desc: 'Резерв калорій на вечері з друзями без зривів' }
              ].map((feat, i) => {
                const Icon = feat.icon;
                return (
                  <div key={i} className="flex items-start gap-2.5 p-2 rounded-xl bg-white/[0.03] border border-white/5">
                    <div className="w-6 h-6 rounded-lg bg-amber-400/15 border border-amber-400/30 text-amber-400 flex items-center justify-center shrink-0 mt-0.5">
                      <Icon className="w-3.5 h-3.5 stroke-[2.3]" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="text-xs font-bold text-zinc-100">{feat.title}</h4>
                      <p className="text-[10.5px] text-zinc-400 leading-tight">{feat.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Тарифні плани */}
            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                type="button"
                onClick={() => setSelectedPlan('yearly')}
                className={`p-3 rounded-2xl border text-left transition-all relative ${
                  selectedPlan === 'yearly'
                    ? 'bg-amber-400/15 border-amber-400/60 shadow-[0_0_15px_rgba(245,158,11,0.2)]'
                    : 'bg-black/40 border-white/10 hover:border-white/20'
                }`}
              >
                <div className="text-[9px] font-black uppercase text-amber-300 bg-amber-400/20 px-1.5 py-0.2 rounded-md inline-block mb-1">
                  -50% ХІТ
                </div>
                <div className="text-sm font-black text-white">99 грн<span className="text-[10px] text-zinc-400 font-normal">/міс</span></div>
                <div className="text-[10px] text-zinc-400 mt-0.5">Річна підписка</div>
              </button>

              <button
                type="button"
                onClick={() => setSelectedPlan('monthly')}
                className={`p-3 rounded-2xl border text-left transition-all ${
                  selectedPlan === 'monthly'
                    ? 'bg-amber-400/15 border-amber-400/60 shadow-[0_0_15px_rgba(245,158,11,0.2)]'
                    : 'bg-black/40 border-white/10 hover:border-white/20'
                }`}
              >
                <div className="text-[9px] font-bold text-zinc-400 uppercase mb-1">
                  Гнучкий
                </div>
                <div className="text-sm font-black text-white">199 грн<span className="text-[10px] text-zinc-400 font-normal">/міс</span></div>
                <div className="text-[10px] text-zinc-400 mt-0.5">Оплата щомісяця</div>
              </button>
            </div>

            {/* Кнопка активації */}
            <div className="space-y-2 pt-1">
              <button
                id="btn-activate-pro-test"
                type="button"
                onClick={handleActivatePro}
                disabled={isSubscribing}
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-zinc-950 font-black text-xs flex items-center justify-center gap-2 shadow-lg shadow-amber-400/30 active:scale-95 transition-all cursor-pointer"
              >
                <Crown className="w-4 h-4 stroke-[2.5]" />
                <span>{isSubscribing ? 'Підключення...' : 'Активувати NUTRIQ PRO (Тестовий режим)'}</span>
              </button>

              <button
                type="button"
                onClick={onClose}
                className="w-full py-2 text-center text-xs font-semibold text-zinc-400 hover:text-white transition-colors"
              >
                Продовжити на безкоштовному тарифі
              </button>
            </div>

            <div className="text-center text-[10px] text-zinc-500 flex items-center justify-center gap-1">
              <ShieldCheck className="w-3 h-3 text-emerald-400" />
              <span>Тестовий режим: без реальних оплат</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
