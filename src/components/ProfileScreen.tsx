import React, { useState } from 'react';
import { useUserStore } from '../store/userStore';
import { useNutritionStore } from '../store/nutritionStore';
import { MyPlanWizard } from './MyPlanWizard';
import { AuthModal } from './AuthModal';
import {
  User,
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
  KeyRound,
  Crown,
  RotateCcw,
  ShieldCheck,
  FileText,
  Lock,
  Trash2,
  CheckCircle2,
  Bell,
  Share2
} from 'lucide-react';
import { ProSubscriptionModal } from './ProSubscriptionModal';
import { LegalModal } from './LegalModal';
import { LanguageSelectorModal } from './LanguageSelectorModal';
import { NotificationSettingsModal } from './NotificationSettingsModal';
import { SocialShareModal } from './SocialShareModal';
import { DietaryRestrictionsModal } from './DietaryRestrictionsModal';
import { useTranslation } from '../store/languageStore';
import { PwaInstallBanner } from './PwaInstallBanner';

export const ProfileScreen: React.FC = () => {
  const { currentOption, t } = useTranslation();
  const {
    user,
    toggleFaceId,
    togglePinCode,
    resetToNewGuestUser,
    logout,
    deleteAccountAndAllData,
    exportUserData
  } = useUserStore();
  const { dailyLog, historyLogs, seedSevenDayDogfoodingData } = useNutritionStore();

  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [wizardOpen, setWizardOpen] = useState(false);
  const [proModalOpen, setProModalOpen] = useState(false);
  const [pinInputOpen, setPinInputOpen] = useState(false);
  const [newPin, setNewPin] = useState(user.pinCode || '');
  const [legalModalOpen, setLegalModalOpen] = useState(false);
  const [legalTab, setLegalTab] = useState<'privacy' | 'terms'>('privacy');
  const [languageModalOpen, setLanguageModalOpen] = useState(false);
  const [notificationModalOpen, setNotificationModalOpen] = useState(false);
  const [socialShareOpen, setSocialShareOpen] = useState(false);
  const [dietaryModalOpen, setDietaryModalOpen] = useState(false);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [exportToast, setExportToast] = useState(false);
  const [deletedToast, setDeletedToast] = useState(false);
  const [dogfoodingToast, setDogfoodingToast] = useState(false);

  const handleSavePin = () => {
    togglePinCode(true, newPin);
    setPinInputOpen(false);
  };

  const handleOpenLegal = (tab: 'privacy' | 'terms') => {
    setLegalTab(tab);
    setLegalModalOpen(true);
  };

  const handleExportData = () => {
    const jsonStr = exportUserData();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `nutriq_export_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setExportToast(true);
    setTimeout(() => setExportToast(false), 2500);
  };

  const handleConfirmDelete = () => {
    deleteAccountAndAllData();
    setConfirmDeleteOpen(false);
    setDeletedToast(true);
    setTimeout(() => setDeletedToast(false), 3000);
  };

  return (
    <div className="space-y-4 pb-28 animate-fadeIn select-none">
      {/* 0. PWA-СТАТУС ТА ВСТАНОВЛЕННЯ (Stage 6.1) */}
      <PwaInstallBanner />

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
                {user.isPro ? (
                  <button
                    id="btn-open-pro-modal"
                    type="button"
                    onClick={() => setProModalOpen(true)}
                    className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-1 shadow-sm cursor-pointer hover:bg-amber-500/30 transition-colors"
                  >
                    <Crown className="w-3 h-3 text-amber-400" />
                    <span>NUTRIQ PRO</span>
                  </button>
                ) : (
                  <button
                    id="btn-open-pro-modal"
                    type="button"
                    onClick={() => setProModalOpen(true)}
                    className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/5 text-zinc-300 hover:text-amber-300 border border-white/10 hover:border-amber-400/40 transition-colors cursor-pointer"
                  >
                    FREE (Отримати PRO)
                  </button>
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

        {/* Кнопки керування тестуванням та підпискою */}
        <div className="mt-3.5 pt-3 border-t border-white/10 flex items-center gap-2">
          <button
            type="button"
            onClick={() => setProModalOpen(true)}
            className="flex-1 py-2 px-3 rounded-xl bg-amber-400/15 hover:bg-amber-400/25 border border-amber-400/30 text-amber-300 font-bold text-xs flex items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer"
          >
            <Crown className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>{user.isPro ? 'Тариф PRO (Активно)' : 'Оформити PRO'}</span>
          </button>

          <button
            type="button"
            onClick={() => {
              resetToNewGuestUser();
              setWizardOpen(true);
            }}
            className="py-2 px-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-300 hover:text-white font-bold text-xs flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer"
            title="Скинути профіль та пройти анкету наново"
          >
            <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
            <span>Тест анкети</span>
          </button>
        </div>
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
          <button
            id="btn-open-language-selector"
            type="button"
            onClick={() => setLanguageModalOpen(true)}
            className="w-full p-3 rounded-2xl bg-white/[0.03] hover:bg-white/[0.07] border border-white/5 hover:border-amber-400/40 flex items-center justify-between text-left transition-all active:scale-[0.99] cursor-pointer"
          >
            <div className="flex items-center gap-2.5">
              <Globe className="w-4 h-4 text-amber-400" />
              <span className="font-semibold text-zinc-200">{t('interface_lang')}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-amber-300 bg-amber-400/10 px-2.5 py-1 rounded-xl border border-amber-400/30 flex items-center gap-1.5 shadow-sm text-xs">
                <span>{currentOption.flag}</span>
                <span>{currentOption.nativeName}</span>
              </span>
              <ChevronRight className="w-4 h-4 text-zinc-500" />
            </div>
          </button>

          <button
            id="btn-open-notification-settings"
            type="button"
            onClick={() => setNotificationModalOpen(true)}
            className="w-full p-3 rounded-2xl bg-white/[0.03] hover:bg-white/[0.07] border border-white/5 hover:border-amber-400/40 flex items-center justify-between text-left transition-all active:scale-[0.99] cursor-pointer"
          >
            <div className="flex items-center gap-2.5">
              <Bell className="w-4 h-4 text-amber-400" />
              <span className="font-semibold text-zinc-200">Розумні нагадування (Web Push)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-amber-300 bg-amber-400/10 px-2 py-0.5 rounded-lg border border-amber-400/20">
                Вода • Їжа • Flex Bank
              </span>
              <ChevronRight className="w-4 h-4 text-zinc-500" />
            </div>
          </button>

          <button
            id="btn-open-profile-social-share"
            type="button"
            onClick={() => setSocialShareOpen(true)}
            className="w-full p-3 rounded-2xl bg-white/[0.03] hover:bg-white/[0.07] border border-white/5 hover:border-emerald-400/40 flex items-center justify-between text-left transition-all active:scale-[0.99] cursor-pointer"
          >
            <div className="flex items-center gap-2.5">
              <Share2 className="w-4 h-4 text-emerald-400" />
              <span className="font-semibold text-zinc-200">Поділитися днем (Stories / картка)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-emerald-300 bg-emerald-400/10 px-2 py-0.5 rounded-lg border border-emerald-400/20">
                Stories • Telegram
              </span>
              <ChevronRight className="w-4 h-4 text-zinc-500" />
            </div>
          </button>

          <button
            id="btn-open-dietary-restrictions"
            type="button"
            onClick={() => setDietaryModalOpen(true)}
            className="w-full p-3 rounded-2xl bg-white/[0.03] hover:bg-white/[0.07] border border-white/5 hover:border-emerald-400/40 flex items-center justify-between text-left transition-all active:scale-[0.99] cursor-pointer"
          >
            <div className="flex items-center gap-2.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span className="font-semibold text-zinc-200">Алергії та Раціон (Вегетаріанство / Лактоза)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-emerald-300 bg-emerald-400/10 px-2 py-0.5 rounded-lg border border-emerald-400/20">
                {user.dietType === 'vegetarian' ? 'Вегетаріанство' : user.dietType === 'vegan' ? 'Веганство' : user.dietType === 'pescatarian' ? 'Пескетаріанство' : 'Стандарт'}
                {user.allergens && user.allergens.length > 0 ? ` • ${user.allergens.length} алерг.` : ''}
              </span>
              <ChevronRight className="w-4 h-4 text-zinc-500" />
            </div>
          </button>

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

      {/* 4. ПРАВОВИЙ КОМПЛАЄНС ТА КОНФІДЕНЦІЙНІСТЬ (GDPR / EU) */}
      <div
        className="rounded-3xl p-5 relative overflow-hidden"
        style={{
          background: 'linear-gradient(165deg, rgba(20,28,23,0.85) 0%, rgba(12,16,14,0.92) 100%)',
          border: '1px solid rgba(255,255,255,0.1)',
          boxShadow: '0 12px 32px rgba(0,0,0,0.45)'
        }}
      >
        <div className="flex items-center gap-2 mb-3">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <h4 className="text-xs font-black tracking-wider uppercase text-zinc-300">
            Правова інформація та безпека (GDPR)
          </h4>
        </div>

        <div className="space-y-2">
          {/* Політика конфіденційності */}
          <button
            id="btn-open-privacy-policy"
            type="button"
            onClick={() => handleOpenLegal('privacy')}
            className="w-full p-3 rounded-2xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/5 hover:border-white/15 flex items-center justify-between text-left transition-all active:scale-[0.99] cursor-pointer"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <Lock className="w-3.5 h-3.5" />
              </div>
              <div>
                <span className="font-bold text-zinc-200 block text-xs">Політика конфіденційності</span>
                <span className="text-[10px] text-zinc-400">Стандарт GDPR (EU 2016/679), захист даних</span>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-zinc-500" />
          </button>

          {/* Умови надання послуг */}
          <button
            id="btn-open-terms-of-service"
            type="button"
            onClick={() => handleOpenLegal('terms')}
            className="w-full p-3 rounded-2xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/5 hover:border-white/15 flex items-center justify-between text-left transition-all active:scale-[0.99] cursor-pointer"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-xl bg-amber-400/10 border border-amber-400/20 flex items-center justify-center text-amber-300">
                <FileText className="w-3.5 h-3.5" />
              </div>
              <div>
                <span className="font-bold text-zinc-200 block text-xs">Умови використання</span>
                <span className="text-[10px] text-zinc-400">Медичний дисклеймер, правила тріалу та PRO</span>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-zinc-500" />
          </button>

          {/* Експорт моїх даних (GDPR Art. 20) */}
          <button
            id="btn-export-user-data"
            type="button"
            onClick={handleExportData}
            className="w-full p-3 rounded-2xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/5 hover:border-emerald-500/30 flex items-center justify-between text-left transition-all active:scale-[0.99] cursor-pointer"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                <Download className="w-3.5 h-3.5" />
              </div>
              <div>
                <span className="font-bold text-zinc-200 block text-xs">Експорт моїх даних (JSON)</span>
                <span className="text-[10px] text-zinc-400">Завантажити копію щоденника та профілю</span>
              </div>
            </div>
            <span className="text-[10px] font-bold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-full">
              Завантажити
            </span>
          </button>

          {/* Видалити всі дані (Right to be Forgotten) */}
          <button
            id="btn-delete-all-data"
            type="button"
            onClick={() => setConfirmDeleteOpen(true)}
            className="w-full p-3 rounded-2xl bg-rose-500/[0.04] hover:bg-rose-500/[0.08] border border-rose-500/15 hover:border-rose-500/30 flex items-center justify-between text-left transition-all active:scale-[0.99] cursor-pointer"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
                <Trash2 className="w-3.5 h-3.5" />
              </div>
              <div>
                <span className="font-bold text-rose-300 block text-xs">Видалити акаунт та всі дані</span>
                <span className="text-[10px] text-zinc-500">Право бути забутим (GDPR ст. 17)</span>
              </div>
            </div>
            <span className="text-[10px] font-bold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-full">
              Стерти
            </span>
          </button>
        </div>
      </div>

      {/* 5. DOGFOODING ТА СТРЕС-ТЕСТ СТІЙКОСТІ (Stage 5.5) */}
      <div
        className="rounded-3xl p-5 relative overflow-hidden"
        style={{
          background: 'linear-gradient(165deg, rgba(20,28,23,0.85) 0%, rgba(12,16,14,0.92) 100%)',
          border: '1px solid rgba(245,176,65,0.25)',
          boxShadow: '0 12px 32px rgba(0,0,0,0.45)'
        }}
      >
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <h4 className="text-xs font-black tracking-wider uppercase text-amber-300">
              7-Day Personal Dogfooding Mode
            </h4>
          </div>
          <span className="text-[9.5px] font-bold text-emerald-300 bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 rounded-full">
            Stage 5.5
          </span>
        </div>

        <p className="text-[11px] text-zinc-300 mb-3 leading-relaxed">
          Тестування тижневого використання застосунку реальним користувачем: повне заповнення розкладу (Пн–Нд), облік Cook-Loss, водний баланс та автоматичний перерахунок Weekly Flex Bank.
        </p>

        <div className="grid grid-cols-2 gap-2 mb-3 text-[11px]">
          <div className="p-2.5 rounded-2xl bg-black/40 border border-white/5">
            <span className="text-zinc-500 block text-[10px] font-bold">Сховище:</span>
            <span className="text-zinc-200 font-bold truncate block">LocalStorage v6</span>
          </div>
          <div className="p-2.5 rounded-2xl bg-black/40 border border-white/5">
            <span className="text-zinc-500 block text-[10px] font-bold">Днів в історії:</span>
            <span className="text-amber-400 font-black block">{Object.keys(historyLogs).length} активних</span>
          </div>
        </div>

        <button
          id="btn-seed-dogfooding-7days"
          type="button"
          onClick={() => {
            seedSevenDayDogfoodingData();
            setDogfoodingToast(true);
            setTimeout(() => setDogfoodingToast(false), 2500);
          }}
          className="w-full py-3 rounded-2xl bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 hover:from-amber-300 hover:to-amber-400 text-zinc-950 font-black text-xs flex items-center justify-center gap-2 shadow-lg shadow-amber-400/20 active:scale-[0.98] transition-all cursor-pointer"
        >
          <Sparkles className="w-4 h-4 text-zinc-950 stroke-[2.5]" />
          <span>Заповнити 7 днів реальним раціоном (Пн–Нд)</span>
        </button>
      </div>

      {/* ДІАЛОГ ПІДТВЕРДЖЕННЯ ВИДАЛЕННЯ ДАНИХ (GDPR) */}
      {confirmDeleteOpen && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-sm rounded-[32px] p-6 bg-[#161c18] border border-rose-500/40 text-white shadow-2xl space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/20 text-rose-400 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="text-base font-black text-white">Видалити акаунт та всі дані?</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Це безповоротно видалить ваш персональний план, історію ваги, збережені страви та покупки з пристрою відповідно до ст. 17 GDPR.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                type="button"
                onClick={() => setConfirmDeleteOpen(false)}
                className="py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-xs font-bold text-zinc-300 cursor-pointer"
              >
                Скасувати
              </button>
              <button
                id="btn-confirm-delete-action"
                type="button"
                onClick={handleConfirmDelete}
                className="py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-xs font-black text-white shadow-lg shadow-rose-600/30 cursor-pointer"
              >
                Так, видалити все
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Тости сповіщень */}
      {exportToast && (
        <div className="fixed bottom-24 inset-x-4 max-w-sm mx-auto z-50 p-3 rounded-2xl bg-emerald-500 text-zinc-950 font-bold text-xs flex items-center justify-center gap-2 shadow-2xl animate-fadeIn">
          <CheckCircle2 className="w-4 h-4" />
          <span>Файл персональних даних (JSON) завантажено!</span>
        </div>
      )}

      {deletedToast && (
        <div className="fixed bottom-24 inset-x-4 max-w-sm mx-auto z-50 p-3 rounded-2xl bg-rose-600 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-2xl animate-fadeIn">
          <Trash2 className="w-4 h-4" />
          <span>Всі дані та акаунт безповоротно видалено з пристрою.</span>
        </div>
      )}

      {dogfoodingToast && (
        <div className="fixed bottom-24 inset-x-4 max-w-sm mx-auto z-50 p-3 rounded-2xl bg-emerald-500 text-zinc-950 font-bold text-xs flex items-center justify-center gap-2 shadow-2xl animate-fadeIn">
          <CheckCircle2 className="w-4 h-4" />
          <span>7-денний раціон Dogfooding успішно збережено в сховище!</span>
        </div>
      )}

      {/* ЮРИДИЧНА МОДАЛКА (GDPR / TERMS) */}
      <LegalModal
        isOpen={legalModalOpen}
        onClose={() => setLegalModalOpen(false)}
        initialTab={legalTab}
      />

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

      {/* Модалка тарифів та переваг PRO */}
      <ProSubscriptionModal
        isOpen={proModalOpen}
        onClose={() => setProModalOpen(false)}
      />
      {/* Модалка вибору мови */}
      <LanguageSelectorModal
        isOpen={languageModalOpen}
        onClose={() => setLanguageModalOpen(false)}
      />

      {/* Модалка розумних нагадувань */}
      <NotificationSettingsModal
        isOpen={notificationModalOpen}
        onClose={() => setNotificationModalOpen(false)}
        currentWaterMl={dailyLog.waterMl}
        targetWaterMl={Math.round((user.weightKg || 70) * 30)}
        flexBankKcal={350}
        remainingTodayKcal={Math.max(0, dailyLog.targets.calories - dailyLog.totals.calories)}
      />

      {/* Модалка генерації та шерингу картки дня */}
      <SocialShareModal
        isOpen={socialShareOpen}
        onClose={() => setSocialShareOpen(false)}
        shareData={{
          dateTitle: 'Сьогоднішній баланс',
          userName: user.name || 'Alistair',
          caloriesConsumed: dailyLog.totals.calories,
          caloriesTarget: dailyLog.targets.calories,
          proteinGrams: dailyLog.totals.protein,
          proteinTarget: dailyLog.targets.protein,
          fatGrams: dailyLog.totals.fat,
          fatTarget: dailyLog.targets.fat,
          carbsGrams: dailyLog.totals.carbs,
          carbsTarget: dailyLog.targets.carbs,
          waterMl: dailyLog.waterMl,
          waterTargetMl: Math.round((user.weightKg || 70) * 30),
          flexBankKcal: 350,
          cookLossGramsSaved: 85,
          format: 'story'
        }}
      />

      {/* Модалка дієтичних обмежень та алергій */}
      <DietaryRestrictionsModal
        isOpen={dietaryModalOpen}
        onClose={() => setDietaryModalOpen(false)}
      />
    </div>
  );
};
