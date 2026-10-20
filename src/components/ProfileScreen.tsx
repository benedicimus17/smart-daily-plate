import React, { useState } from 'react';
import { useUserStore } from '../store/userStore';
import { useNutritionStore } from '../store/nutritionStore';
import { MyPlanWizard } from './MyPlanWizard';
import { AuthModal } from './AuthModal';
import {
  User,
  ShieldCheck,
  Sparkles,
  Flame,
  Fingerprint,
  LogOut,
  Mail,
  Phone,
  RefreshCw,
  Globe,
  Download,
  ChevronRight,
  CookingPot,
  PiggyBank,
  UtensilsCrossed,
  ShoppingCart,
  Link2,
  TrendingUp,
  KeyRound
} from 'lucide-react';

export const ProfileScreen: React.FC = () => {
  const { user, toggleFaceId, togglePinCode, logout } = useUserStore();
  const { dailyLog } = useNutritionStore();

  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [wizardOpen, setWizardOpen] = useState(false);
  const [pinInputOpen, setPinInputOpen] = useState(false);
  const [newPin, setNewPin] = useState(user.pinCode || '');

  const handleSavePin = () => {
    togglePinCode(true, newPin);
    setPinInputOpen(false);
  };

  return (
    <div className="space-y-4 pb-28 animate-fadeIn select-none">
      {/* 1. БЛОК АКАУНТА ТА БЕЗПЕКИ */}
      <div
        className="rounded-3xl p-5 relative overflow-hidden transition-all"
        style={{
          background: 'linear-gradient(165deg, rgba(25,35,29,0.85) 0%, rgba(13,18,15,0.92) 100%)',
          border: '1px solid rgba(255,255,255,0.12)',
          boxShadow: '0 12px 32px rgba(0,0,0,0.55)'
        }}
      >
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-amber-400/15 border border-amber-400/30 flex items-center justify-center text-amber-300 font-bold text-lg shadow-inner">
              {user.isRegistered ? (
                user.name.charAt(0).toUpperCase()
              ) : (
                <User className="w-6 h-6 text-zinc-400" />
              )}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white tracking-tight">
                  {user.isRegistered ? user.name : 'Гість (локальний профіль)'}
                </h3>
                {user.isRegistered ? (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3" />
                    <span>PRO-акаунт</span>
                  </span>
                ) : (
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300/90 border border-amber-500/25">
                    Гість
                  </span>
                )}
              </div>

              {user.isRegistered ? (
                <div className="text-[11.5px] text-zinc-400 space-y-0.5 mt-1">
                  <div className="flex items-center gap-1.5">
                    <Mail className="w-3 h-3 text-zinc-500" />
                    <span>{user.email}</span>
                  </div>
                  {user.phone && (
                    <div className="flex items-center gap-1.5">
                      <Phone className="w-3 h-3 text-zinc-500" />
                      <span>{user.phone}</span>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-[11.5px] text-zinc-400 mt-1">
                  Зареєструйтесь через пошту, щоб зберегти свій план та щоденник
                </p>
              )}
            </div>
          </div>

          {user.isRegistered && (
            <button
              type="button"
              onClick={logout}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-rose-400 transition-colors"
              title="Вийти з акаунта"
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>

        {!user.isRegistered ? (
          <div className="mt-4 pt-3.5 border-t border-white/10 flex items-center justify-between">
            <span className="text-xs text-zinc-300">
              Бажаєте зберегти раціон у хмару?
            </span>
            <button
              type="button"
              onClick={() => setAuthModalOpen(true)}
              className="py-1.5 px-3.5 rounded-xl font-bold text-xs text-zinc-950 transition-all active:scale-95 shadow-md flex items-center gap-1.5"
              style={{
                background: 'linear-gradient(135deg, #FDE68A 0%, #F59E0B 100%)',
                boxShadow: '0 4px 14px rgba(245,158,11,0.35)'
              }}
            >
              <Sparkles className="w-3.5 h-3.5 text-zinc-950" />
              <span>Зареєструватися</span>
            </button>
          </div>
        ) : (
          /* БЕЗПЕКА ТА КОД ВХОДУ (За вказівкою Власника) */
          <div className="mt-4 pt-3 border-t border-white/10 space-y-2.5">
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">
              Безпека та Вхід
            </span>

            {/* Вхід через Face ID */}
            <div className="flex items-center justify-between text-xs text-zinc-300">
              <span className="flex items-center gap-2">
                <Fingerprint className="w-4 h-4 text-emerald-400" />
                <span>Біометрія (Face ID / Touch ID)</span>
              </span>
              <button
                type="button"
                onClick={() => toggleFaceId(!user.faceIdEnabled)}
                className={`w-10 h-5 rounded-full transition-colors relative flex items-center p-0.5 ${
                  user.faceIdEnabled ? 'bg-emerald-500' : 'bg-zinc-700'
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${
                    user.faceIdEnabled ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Вхід через PIN-код */}
            <div className="flex items-center justify-between text-xs text-zinc-300">
              <span className="flex items-center gap-2">
                <KeyRound className="w-4 h-4 text-amber-400" />
                <span>PIN-код для входу ({user.pinCode ? '••••' : 'Не встановлено'})</span>
              </span>
              <button
                type="button"
                onClick={() => setPinInputOpen(!pinInputOpen)}
                className="text-[11px] font-semibold text-amber-400 hover:text-amber-300 underline"
              >
                {user.pinCode ? 'Змінити' : 'Встановити'}
              </button>
            </div>

            {pinInputOpen && (
              <div className="p-3 rounded-2xl bg-black/40 border border-white/10 flex items-center gap-2 mt-1">
                <input
                  type="password"
                  maxLength={6}
                  placeholder="Введіть 4 або 6 цифр PIN"
                  value={newPin}
                  onChange={(e) => setNewPin(e.target.value)}
                  className="flex-1 bg-transparent border-none text-sm text-white font-mono focus:outline-none placeholder-zinc-500"
                />
                <button
                  type="button"
                  onClick={handleSavePin}
                  className="px-3 py-1 rounded-xl bg-amber-400 text-zinc-950 text-xs font-bold"
                >
                  Зберегти
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 2. БЛОК «МІЙ ПЛАН» (ВИЗНАЧЕНИЙ ПЛАН І КНОПКА ПЕРЕРАХУНКУ) */}
      <div
        className="rounded-3xl p-5 relative overflow-hidden transition-all"
        style={{
          background: 'linear-gradient(165deg, rgba(23,33,27,0.92) 0%, rgba(12,17,14,0.98) 100%)',
          border: '1px solid rgba(255,255,255,0.12)',
          boxShadow: '0 16px 40px rgba(0,0,0,0.6)'
        }}
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Flame className="w-5 h-5 text-amber-400" />
            <h3 className="text-base font-bold text-white tracking-tight">
              Блок «Мій План»
            </h3>
          </div>
          <button
            type="button"
            onClick={() => setWizardOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/[0.06] border border-white/10 hover:border-amber-400/40 text-xs font-semibold text-amber-300 transition-all active:scale-95"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Перерахувати план</span>
          </button>
        </div>

        <p className="text-xs text-zinc-400 leading-relaxed mb-3">
          Індивідуальні ліміти калорій та БЖУ, які транслюються на головний екран:
        </p>

        {/* 4 КОЛОНКИ ПЛАНУ */}
        <div className="grid grid-cols-4 gap-1.5 text-center">
          <div className="p-2.5 rounded-2xl bg-black/40 border border-amber-400/30 flex flex-col items-center">
            <span className="text-[9.5px] font-bold text-amber-300 uppercase">Ліміт</span>
            <span className="text-base font-extrabold text-white mt-1">
              {dailyLog.targets.calories}
            </span>
            <span className="text-[9px] text-zinc-400">ккал</span>
          </div>

          <div className="p-2.5 rounded-2xl bg-black/40 border border-emerald-400/30 flex flex-col items-center">
            <span className="text-[9.5px] font-bold text-emerald-300 uppercase">Протеїн</span>
            <span className="text-base font-extrabold text-white mt-1">
              {dailyLog.targets.protein}
            </span>
            <span className="text-[9px] text-zinc-400">грам</span>
          </div>

          <div className="p-2.5 rounded-2xl bg-black/40 border border-amber-500/30 flex flex-col items-center">
            <span className="text-[9.5px] font-bold text-amber-400 uppercase">Жири</span>
            <span className="text-base font-extrabold text-white mt-1">
              {dailyLog.targets.fat}
            </span>
            <span className="text-[9px] text-zinc-400">грам</span>
          </div>

          <div className="p-2.5 rounded-2xl bg-black/40 border border-indigo-400/30 flex flex-col items-center">
            <span className="text-[9.5px] font-bold text-indigo-300 uppercase">Вуглеводи</span>
            <span className="text-base font-extrabold text-white mt-1">
              {dailyLog.targets.carbs}
            </span>
            <span className="text-[9px] text-zinc-400">грам</span>
          </div>
        </div>
      </div>

      {/* 3. НАЛАШТУВАННЯ ТА СИСТЕМА */}
      <div
        className="rounded-3xl p-5 relative overflow-hidden"
        style={{
          background: 'linear-gradient(165deg, rgba(20,28,23,0.85) 0%, rgba(12,16,13,0.95) 100%)',
          border: '1px solid rgba(255,255,255,0.08)'
        }}
      >
        <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block mb-3">
          Системні налаштування
        </span>

        <div className="space-y-2 text-xs">
          <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Globe className="w-4 h-4 text-amber-400" />
              <span className="font-semibold text-zinc-200">Мова інтерфейсу</span>
            </div>
            <span className="font-bold text-amber-300 bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/20">
              Українська (UA)
            </span>
          </div>

          <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Download className="w-4 h-4 text-emerald-400" />
              <span className="font-semibold text-zinc-200">Експорт щоденника (JSON / CSV)</span>
            </div>
            <button
              type="button"
              onClick={() => alert('Експорт даних щоденника збережено.')}
              className="text-xs text-zinc-400 hover:text-white underline"
            >
              Завантажити
            </button>
          </div>
        </div>
      </div>

      {/* 4. БЛОК 6 УНІКАЛЬНИХ ПЕРЕВАГ NUTRIQ */}
      <div
        className="rounded-3xl p-5 relative overflow-hidden"
        style={{
          background: 'linear-gradient(165deg, rgba(20,28,23,0.85) 0%, rgba(12,16,13,0.95) 100%)',
          border: '1px solid rgba(255,255,255,0.08)'
        }}
      >
        <h4 className="text-sm font-bold text-white tracking-tight mb-1">
          6 переваг NUTRIQ перед конкурентами
        </h4>
        <p className="text-[11px] text-zinc-400 mb-3">
          Працюють непомітно, не перевантажуючи головний екран
        </p>

        <div className="space-y-2 text-xs">
          <div className="p-2.5 rounded-2xl bg-white/[0.03] border border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-xl bg-amber-400/10 border border-amber-400/20 flex items-center justify-center text-amber-300">
                <CookingPot className="w-3.5 h-3.5" />
              </div>
              <div>
                <span className="font-bold text-zinc-200 block text-xs">Cook-Loss Engine</span>
                <span className="text-[10px] text-zinc-400">Уварка/ужарка (сире ➔ готове)</span>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-zinc-600" />
          </div>

          <div className="p-2.5 rounded-2xl bg-white/[0.03] border border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-xl bg-emerald-400/10 border border-emerald-400/20 flex items-center justify-center text-emerald-300">
                <PiggyBank className="w-3.5 h-3.5" />
              </div>
              <div>
                <span className="font-bold text-zinc-200 block text-xs">Weekly Flex Bank</span>
                <span className="text-[10px] text-zinc-400">Резерв калорій без стресу на вихідних</span>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-zinc-600" />
          </div>

          <div className="p-2.5 rounded-2xl bg-white/[0.03] border border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-xl bg-indigo-400/10 border border-indigo-400/20 flex items-center justify-center text-indigo-300">
                <UtensilsCrossed className="w-3.5 h-3.5" />
              </div>
              <div>
                <span className="font-bold text-zinc-200 block text-xs">Dining Out Estimator</span>
                <span className="text-[10px] text-zinc-400">Оцінка порцій у ресторані без вагів</span>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-zinc-600" />
          </div>

          <div className="p-2.5 rounded-2xl bg-white/[0.03] border border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-xl bg-teal-400/10 border border-teal-400/20 flex items-center justify-center text-teal-300">
                <ShoppingCart className="w-3.5 h-3.5" />
              </div>
              <div>
                <span className="font-bold text-zinc-200 block text-xs">Smart Grocery List</span>
                <span className="text-[10px] text-zinc-400">Автосписок покупок під раціон</span>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-zinc-600" />
          </div>

          <div className="p-2.5 rounded-2xl bg-white/[0.03] border border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-xl bg-purple-400/10 border border-purple-400/20 flex items-center justify-center text-purple-300">
                <Link2 className="w-3.5 h-3.5" />
              </div>
              <div>
                <span className="font-bold text-zinc-200 block text-xs">AI Recipe Parser</span>
                <span className="text-[10px] text-zinc-400">Розбір TikTok/Reels у КБЖВ</span>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-zinc-600" />
          </div>

          <div className="p-2.5 rounded-2xl bg-white/[0.03] border border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-xl bg-amber-400/10 border border-amber-400/20 flex items-center justify-center text-amber-300">
                <TrendingUp className="w-3.5 h-3.5" />
              </div>
              <div>
                <span className="font-bold text-zinc-200 block text-xs">True Fat Trend</span>
                <span className="text-[10px] text-zinc-400">Графік чистого жиру без коливань води</span>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-zinc-600" />
          </div>
        </div>
      </div>

      {/* Модалка візарда "Мій План" */}
      <MyPlanWizard
        isOpen={wizardOpen}
        onClose={() => setWizardOpen(false)}
      />

      {/* Модалка реєстрації */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        title="Створення профілю NUTRIQ"
        subtitle="Введіть пошту один раз, щоб зберегти свій персональний план харчування та щоденник."
      />
    </div>
  );
};
