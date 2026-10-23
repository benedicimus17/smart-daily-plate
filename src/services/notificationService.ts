/**
 * NUTRIQ Notification Service (Stage 6.2)
 * Керування системними Web Notifications API, плануванням нагадувань про гідратацію,
 * розкладом прийомів їжі та вечірнім чек-іном тижневого резерву Flex Bank.
 */

export interface MealScheduleTimes {
  breakfast: string; // наприклад "08:30"
  lunch: string;     // наприклад "13:30"
  dinner: string;    // наприклад "19:00"
  snack?: string;    // наприклад "16:30"
}

export interface NotificationSettings {
  enabled: boolean;
  waterReminders: boolean;
  waterIntervalHours: number; // За замовчуванням кожні 2 години
  mealReminders: boolean;
  mealTimes: MealScheduleTimes;
  eveningFlexCheckin: boolean;
  eveningTime: string; // "20:30"
  soundEnabled: boolean;
}

export type NotificationPermissionState = 'default' | 'granted' | 'denied' | 'unsupported';

export interface ScheduledAlert {
  id: string;
  type: 'water' | 'meal' | 'flex_bank';
  title: string;
  body: string;
  scheduledTime: string;
}

export const NOTIFICATION_STORAGE_KEY = 'nutriq-notifications-v1';

export const DEFAULT_NOTIFICATION_SETTINGS: NotificationSettings = {
  enabled: false,
  waterReminders: true,
  waterIntervalHours: 2,
  mealReminders: true,
  mealTimes: {
    breakfast: '08:30',
    lunch: '13:30',
    dinner: '19:00',
    snack: '16:30'
  },
  eveningFlexCheckin: true,
  eveningTime: '20:30',
  soundEnabled: true
};

/**
 * Перевірка статусу дозволу на сповіщення
 */
export function getNotificationPermissionStatus(): NotificationPermissionState {
  const Notif = typeof Notification !== 'undefined'
    ? Notification
    : (typeof window !== 'undefined' && 'Notification' in window ? (window as any).Notification : undefined);

  if (!Notif || !Notif.permission) {
    return 'unsupported';
  }
  return Notif.permission as NotificationPermissionState;
}

/**
 * Завантаження збережених налаштувань із LocalStorage
 */
export function loadNotificationSettings(): NotificationSettings {
  if (typeof window === 'undefined') {
    return DEFAULT_NOTIFICATION_SETTINGS;
  }
  try {
    const raw = localStorage.getItem(NOTIFICATION_STORAGE_KEY);
    if (!raw) return DEFAULT_NOTIFICATION_SETTINGS;
    return { ...DEFAULT_NOTIFICATION_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_NOTIFICATION_SETTINGS;
  }
}

/**
 * Збереження налаштувань у LocalStorage
 */
export function saveNotificationSettings(settings: NotificationSettings): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(NOTIFICATION_STORAGE_KEY, JSON.stringify(settings));
  } catch (e) {
    console.error('Failed to save notification settings', e);
  }
}

/**
 * Запит на дозвіл сповіщень
 */
export async function requestNotificationPermission(): Promise<NotificationPermissionState> {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'unsupported';
  }

  try {
    const result = await Notification.requestPermission();
    return result as NotificationPermissionState;
  } catch (e) {
    console.error('Error requesting notification permission', e);
    return 'denied';
  }
}

/**
 * Генерація текстового повідомлення для нагадування про воду
 */
export function formatWaterNotification(currentMl: number, targetMl: number): { title: string; body: string } {
  const remaining = Math.max(0, targetMl - currentMl);
  if (remaining === 0) {
    return {
      title: '💧 NUTRIQ: Денну норму води досягнуто!',
      body: `Чудова робота! Ви випили ${currentMl} мл води сьогодні. Баланс гідратації 100%.`
    };
  }
  return {
    title: '💧 Час для склянки води!',
    body: `Зробіть ковток свіжості. Залишилось ${remaining} мл до вашої денної норми (${targetMl} мл).`
  };
}

/**
 * Генерація тексту для нагадування про прийом їжі
 */
export function formatMealNotification(mealTitle: string, mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack', kcal?: number): { title: string; body: string } {
  const genitiveMap: Record<string, string> = {
    breakfast: 'сніданку',
    lunch: 'обіду',
    dinner: 'вечері',
    snack: 'перекусу'
  };

  const mealName = genitiveMap[mealType] || 'прийому їжі';
  const kcalStr = kcal ? ` (~${kcal} ккал)` : '';

  return {
    title: `🍽️ Час для ${mealName}!`,
    body: `За розкладом: ${mealTitle}${kcalStr}. Смачного та збалансованого прийому їжі!`
  };
}

/**
 * Генерація тексту для вечірнього чек-іну Flex Bank
 */
export function formatFlexBankEveningNotification(flexReserveKcal: number, remainingTodayKcal: number): { title: string; body: string } {
  const isSurplus = flexReserveKcal >= 0;
  const reserveStr = isSurplus ? `+${flexReserveKcal} ккал` : `${flexReserveKcal} ккал`;

  return {
    title: '🌙 Вечірній баланс NUTRIQ',
    body: `Залишок на сьогодні: ${remainingTodayKcal} ккал. Тижневий резерв Flex Bank: ${reserveStr}. Спокійного вечора!`
  };
}

/**
 * Відправка системного або fallback-сповіщення
 */
export async function dispatchNutriqNotification(title: string, body: string): Promise<boolean> {
  const permission = getNotificationPermissionStatus();

  // Завжди генеруємо кастомну браузерну подію для In-App показу тосту
  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent('nutriq-inapp-alert', {
        detail: { title, body, timestamp: Date.now() }
      })
    );
  }

  if (permission !== 'granted') {
    return false;
  }

  try {
    // 1. Спроба показати через Service Worker для PWA / Standalone режиму
    if ('serviceWorker' in navigator) {
      const reg = await navigator.serviceWorker.ready;
      if (reg && 'showNotification' in reg) {
        await reg.showNotification(title, {
          body,
          icon: '/pwa-192x192.png',
          badge: '/favicon.png',
          tag: 'nutriq-alert',
          silent: false
        });
        return true;
      }
    }

    // 2. Fallback на звичайний конструктор Notification
    new Notification(title, {
      body,
      icon: '/pwa-192x192.png'
    });
    return true;
  } catch (err) {
    console.warn('System notification failed, fallback to in-app event', err);
    return false;
  }
}

/**
 * Розрахунок активних нагадувань на день для діагностики та розкладу
 */
export function getActiveDailyAlerts(
  settings: NotificationSettings,
  currentWaterMl: number,
  targetWaterMl: number,
  flexReserveKcal: number,
  remainingTodayKcal: number
): ScheduledAlert[] {
  if (!settings.enabled) return [];

  const alerts: ScheduledAlert[] = [];

  // 1. Сповіщення про воду
  if (settings.waterReminders) {
    const waterMsg = formatWaterNotification(currentWaterMl, targetWaterMl);
    alerts.push({
      id: 'water-reminder',
      type: 'water',
      title: waterMsg.title,
      body: waterMsg.body,
      scheduledTime: `Кожні ${settings.waterIntervalHours} год (09:00 - 21:00)`
    });
  }

  // 2. Сповіщення про прийоми їжі
  if (settings.mealReminders) {
    if (settings.mealTimes.breakfast) {
      const bMsg = formatMealNotification('Омлет з авокадо та шпинатом', 'breakfast', 380);
      alerts.push({
        id: 'meal-breakfast',
        type: 'meal',
        title: bMsg.title,
        body: bMsg.body,
        scheduledTime: settings.mealTimes.breakfast
      });
    }
    if (settings.mealTimes.lunch) {
      const lMsg = formatMealNotification('Куряче філе з кіноа та овочами', 'lunch', 520);
      alerts.push({
        id: 'meal-lunch',
        type: 'meal',
        title: lMsg.title,
        body: lMsg.body,
        scheduledTime: settings.mealTimes.lunch
      });
    }
    if (settings.mealTimes.dinner) {
      const dMsg = formatMealNotification('Лосось су-від зі спаржею', 'dinner', 480);
      alerts.push({
        id: 'meal-dinner',
        type: 'meal',
        title: dMsg.title,
        body: dMsg.body,
        scheduledTime: settings.mealTimes.dinner
      });
    }
  }

  // 3. Вечірній чек-ін Flex Bank
  if (settings.eveningFlexCheckin) {
    const flexMsg = formatFlexBankEveningNotification(flexReserveKcal, remainingTodayKcal);
    alerts.push({
      id: 'flex-evening',
      type: 'flex_bank',
      title: flexMsg.title,
      body: flexMsg.body,
      scheduledTime: settings.eveningTime || '20:30'
    });
  }

  return alerts;
}
