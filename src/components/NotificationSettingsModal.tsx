import React, { useState, useEffect } from 'react';
import {
  Bell,
  X,
  Droplets,
  UtensilsCrossed,
  Moon,
  Volume2,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import {
  NotificationSettings,
  NotificationPermissionState,
  loadNotificationSettings,
  saveNotificationSettings,
  getNotificationPermissionStatus,
  requestNotificationPermission,
  dispatchNutriqNotification
} from '../services/notificationService';

interface NotificationSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentWaterMl?: number;
  targetWaterMl?: number;
  flexBankKcal?: number;
  remainingTodayKcal?: number;
}

export const NotificationSettingsModal: React.FC<NotificationSettingsModalProps> = ({
  isOpen,
  onClose,
  currentWaterMl = 750,
  targetWaterMl = 2000,
  flexBankKcal = 350,
  remainingTodayKcal = 420
}) => {
  const [settings, setSettings] = useState<NotificationSettings>(loadNotificationSettings());
  const [permission, setPermission] = useState<NotificationPermissionState>(getNotificationPermissionStatus());
  const [testSentToast, setTestSentToast] = useState(false);
  const [saveToast, setSaveToast] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setSettings(loadNotificationSettings());
      setPermission(getNotificationPermissionStatus());
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleToggleMaster = async () => {
    if (!settings.enabled) {
      // Запит дозволу
      if (permission === 'default') {
        const res = await requestNotificationPermission();
        setPermission(res);
      }
      const updated = { ...settings, enabled: true };
      setSettings(updated);
      saveNotificationSettings(updated);
    } else {
      const updated = { ...settings, enabled: false };
      setSettings(updated);
      saveNotificationSettings(updated);
    }
  };

  const handleSave = () => {
    saveNotificationSettings(settings);
    setSaveToast(true);
    setTimeout(() => {
      setSaveToast(false);
      onClose();
    }, 800);
  };

  const handleSendTestNotification = async () => {
    const waterRem = Math.max(0, targetWaterMl - currentWaterMl);
    const flexStr = flexBankKcal >= 0 ? `+${flexBankKcal}` : `${flexBankKcal}`;
    await dispatchNutriqNotification(
      '💧 NUTRIQ: Дзен-нагадування',
      `Склянка води (ще ${waterRem} мл) • Залишок ${remainingTodayKcal} ккал • Flex Bank: ${flexStr} ккал`
    );
    setTestSentToast(true);
    setTimeout(() => setTestSentToast(false), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div
        id="notification-settings-modal"
        className="w-full max-w-lg rounded-3xl p-5 sm:p-6 text-zinc-100 relative overflow-hidden flex flex-col max-h-[92vh] border border-white/10"
        style={{
          background: 'linear-gradient(165deg, rgba(20,28,24,0.96) 0%, rgba(10,14,12,0.99) 100%)',
          boxShadow: '0 24px 60px rgba(0,0,0,0.8), 0 0 40px rgba(245,158,11,0.06)'
        }}
      >
        {/* Glow */}
        <div className="absolute -top-16 -right-16 w-48 h-48 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10 relative z-10 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-400/15 border border-amber-400/30 flex items-center justify-center text-amber-300">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-white tracking-tight flex items-center gap-2">
                <span>Розумні нагадування</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30">
                  Web Push
                </span>
              </h3>
              <p className="text-xs text-zinc-400">
                Гідратація, розклад прийомів їжі та баланс Flex Bank
              </p>
            </div>
          </div>
          <button
            id="btn-close-notification-settings"
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-zinc-400 hover:text-white transition-all cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="py-4 space-y-4 overflow-y-auto relative z-10 pr-1 flex-1">
          {/* 1. Головний перемикач */}
          <div className="p-3.5 rounded-2xl bg-white/[0.04] border border-white/10 flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-white">Увімкнути сповіщення</span>
                {permission === 'granted' ? (
                  <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Дозволено
                  </span>
                ) : permission === 'denied' ? (
                  <span className="text-[10px] text-rose-400 font-semibold flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> Заблоковано в браузері
                  </span>
                ) : (
                  <span className="text-[10px] text-amber-400 font-semibold">
                    Потребує дозволу
                  </span>
                )}
              </div>
              <p className="text-[11px] text-zinc-400 mt-0.5">
                Отримуйте нагадування навіть при згорнутому застосунку
              </p>
            </div>

            <button
              id="btn-toggle-master-notifications"
              type="button"
              onClick={handleToggleMaster}
              className={`w-12 h-6 rounded-full transition-colors relative flex items-center p-1 cursor-pointer ${
                settings.enabled ? 'bg-amber-400' : 'bg-zinc-700'
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-zinc-950 shadow-md transition-transform ${
                  settings.enabled ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* 2. Нагадування про воду */}
          <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-sky-500/15 border border-sky-500/25 flex items-center justify-center text-sky-400">
                  <Droplets className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-bold text-xs text-zinc-200 block">Трекер води</span>
                  <span className="text-[10px] text-zinc-400">
                    Регулярні нагадування про склянку води
                  </span>
                </div>
              </div>

              <button
                id="btn-toggle-water-reminder"
                type="button"
                disabled={!settings.enabled}
                onClick={() =>
                  setSettings({ ...settings, waterReminders: !settings.waterReminders })
                }
                className={`w-10 h-5 rounded-full transition-colors relative flex items-center p-0.5 cursor-pointer disabled:opacity-40 ${
                  settings.waterReminders && settings.enabled ? 'bg-sky-400' : 'bg-zinc-700'
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full bg-zinc-950 shadow-md transition-transform ${
                    settings.waterReminders && settings.enabled ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {settings.waterReminders && settings.enabled && (
              <div className="flex items-center justify-between pt-2 border-t border-white/5 text-xs text-zinc-300">
                <span className="text-[11px] text-zinc-400">Інтервал нагадувань:</span>
                <div className="flex items-center gap-1.5">
                  {[1.5, 2, 3].map((hrs) => (
                    <button
                      key={hrs}
                      type="button"
                      onClick={() => setSettings({ ...settings, waterIntervalHours: hrs })}
                      className={`px-2 py-0.5 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                        settings.waterIntervalHours === hrs
                          ? 'bg-sky-400 text-zinc-950'
                          : 'bg-white/5 text-zinc-400 hover:text-white'
                      }`}
                    >
                      {hrs} год
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* 3. Сповіщення за розкладом прийомів їжі */}
          <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/15 border border-emerald-500/25 flex items-center justify-center text-emerald-400">
                  <UtensilsCrossed className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-bold text-xs text-zinc-200 block">Розклад страв</span>
                  <span className="text-[10px] text-zinc-400">
                    Нагадування про сніданок, обід та вечерю
                  </span>
                </div>
              </div>

              <button
                id="btn-toggle-meal-reminder"
                type="button"
                disabled={!settings.enabled}
                onClick={() =>
                  setSettings({ ...settings, mealReminders: !settings.mealReminders })
                }
                className={`w-10 h-5 rounded-full transition-colors relative flex items-center p-0.5 cursor-pointer disabled:opacity-40 ${
                  settings.mealReminders && settings.enabled ? 'bg-emerald-400' : 'bg-zinc-700'
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full bg-zinc-950 shadow-md transition-transform ${
                    settings.mealReminders && settings.enabled ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {settings.mealReminders && settings.enabled && (
              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-white/5">
                <div className="p-2 rounded-xl bg-white/5 border border-white/5 text-center">
                  <span className="text-[9px] text-zinc-400 block">Сніданок</span>
                  <input
                    type="time"
                    value={settings.mealTimes.breakfast}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        mealTimes: { ...settings.mealTimes, breakfast: e.target.value }
                      })
                    }
                    className="bg-transparent text-white font-mono text-xs font-bold w-full text-center focus:outline-none"
                  />
                </div>
                <div className="p-2 rounded-xl bg-white/5 border border-white/5 text-center">
                  <span className="text-[9px] text-zinc-400 block">Обід</span>
                  <input
                    type="time"
                    value={settings.mealTimes.lunch}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        mealTimes: { ...settings.mealTimes, lunch: e.target.value }
                      })
                    }
                    className="bg-transparent text-white font-mono text-xs font-bold w-full text-center focus:outline-none"
                  />
                </div>
                <div className="p-2 rounded-xl bg-white/5 border border-white/5 text-center">
                  <span className="text-[9px] text-zinc-400 block">Вечеря</span>
                  <input
                    type="time"
                    value={settings.mealTimes.dinner}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        mealTimes: { ...settings.mealTimes, dinner: e.target.value }
                      })
                    }
                    className="bg-transparent text-white font-mono text-xs font-bold w-full text-center focus:outline-none"
                  />
                </div>
              </div>
            )}
          </div>

          {/* 4. Вечірній чек-ін Flex Bank */}
          <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-amber-500/15 border border-amber-500/25 flex items-center justify-center text-amber-400">
                <Moon className="w-4 h-4" />
              </div>
              <div>
                <span className="font-bold text-xs text-zinc-200 block">
                  Вечірній чек-ін Flex Bank
                </span>
                <span className="text-[10px] text-zinc-400">
                  Щодня о {settings.eveningTime || '20:30'} з підсумком калорій
                </span>
              </div>
            </div>

            <button
              id="btn-toggle-flex-reminder"
              type="button"
              disabled={!settings.enabled}
              onClick={() =>
                setSettings({ ...settings, eveningFlexCheckin: !settings.eveningFlexCheckin })
              }
              className={`w-10 h-5 rounded-full transition-colors relative flex items-center p-0.5 cursor-pointer disabled:opacity-40 ${
                settings.eveningFlexCheckin && settings.enabled ? 'bg-amber-400' : 'bg-zinc-700'
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-zinc-950 shadow-md transition-transform ${
                  settings.eveningFlexCheckin && settings.enabled ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* 5. Звуковий сигнал */}
          <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-purple-500/15 border border-purple-500/25 flex items-center justify-center text-purple-400">
                <Volume2 className="w-4 h-4" />
              </div>
              <div>
                <span className="font-bold text-xs text-zinc-200 block">Звуковий сигнал</span>
                <span className="text-[10px] text-zinc-400">
                  Приємний дзен-сигнал сповіщення
                </span>
              </div>
            </div>

            <button
              id="btn-toggle-sound"
              type="button"
              disabled={!settings.enabled}
              onClick={() => setSettings({ ...settings, soundEnabled: !settings.soundEnabled })}
              className={`w-10 h-5 rounded-full transition-colors relative flex items-center p-0.5 cursor-pointer disabled:opacity-40 ${
                settings.soundEnabled && settings.enabled ? 'bg-purple-400' : 'bg-zinc-700'
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-zinc-950 shadow-md transition-transform ${
                  settings.soundEnabled && settings.enabled ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="pt-3 border-t border-white/10 space-y-2 relative z-10 shrink-0">
          <button
            id="btn-test-notification"
            type="button"
            onClick={handleSendTestNotification}
            className="w-full py-2.5 px-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-300 hover:text-white font-bold text-xs flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer"
          >
            <Bell className="w-3.5 h-3.5 text-amber-400" />
            <span>Надіслати тестове сповіщення</span>
          </button>

          <button
            id="btn-save-notification-settings"
            type="button"
            onClick={handleSave}
            className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-amber-400 to-amber-500 text-zinc-950 font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 hover:from-amber-300 hover:to-amber-400 transition-all active:scale-98 cursor-pointer"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Зберегти налаштування</span>
          </button>

          {testSentToast && (
            <div className="p-2 rounded-xl bg-amber-400/20 border border-amber-400/30 text-amber-300 text-center text-xs font-bold animate-fadeIn">
              ✓ Тестове сповіщення надіслано в систему!
            </div>
          )}

          {saveToast && (
            <div className="p-2 rounded-xl bg-emerald-400/20 border border-emerald-400/30 text-emerald-300 text-center text-xs font-bold animate-fadeIn">
              ✓ Налаштування успішно збережено!
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
