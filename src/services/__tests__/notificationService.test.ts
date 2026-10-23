import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  DEFAULT_NOTIFICATION_SETTINGS,
  loadNotificationSettings,
  saveNotificationSettings,
  getNotificationPermissionStatus,
  formatWaterNotification,
  formatMealNotification,
  formatFlexBankEveningNotification,
  getActiveDailyAlerts,
  dispatchNutriqNotification,
  NotificationSettings
} from '../notificationService';

// Setup mock localStorage and window for Node/Vitest environment
const memoryStore: Record<string, string> = {};
const mockLocalStorage = {
  getItem: (key: string) => memoryStore[key] || null,
  setItem: (key: string, val: string) => {
    memoryStore[key] = val;
  },
  removeItem: (key: string) => {
    delete memoryStore[key];
  },
  clear: () => {
    Object.keys(memoryStore).forEach((k) => delete memoryStore[k]);
  }
};

if (typeof globalThis.localStorage === 'undefined') {
  globalThis.localStorage = mockLocalStorage as unknown as Storage;
}

if (typeof globalThis.window === 'undefined') {
  const listeners: Record<string, Function[]> = {};
  (globalThis as any).window = {
    addEventListener: (type: string, cb: Function) => {
      listeners[type] = listeners[type] || [];
      listeners[type].push(cb);
    },
    removeEventListener: (type: string, cb: Function) => {
      if (!listeners[type]) return;
      listeners[type] = listeners[type].filter((fn) => fn !== cb);
    },
    dispatchEvent: (evt: any) => {
      if (listeners[evt.type]) {
        listeners[evt.type].forEach((cb) => cb(evt));
      }
      return true;
    }
  };
}

if (typeof (globalThis as any).CustomEvent === 'undefined') {
  (globalThis as any).CustomEvent = class CustomEvent {
    type: string;
    detail: any;
    constructor(type: string, params?: { detail?: any }) {
      this.type = type;
      this.detail = params?.detail;
    }
  };
}

describe('notificationService - Smart Reminders & Web Push (Stage 6.2)', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    globalThis.localStorage.clear();
  });

  describe('Storage & Default Settings', () => {
    it('returns default settings when storage is empty', () => {
      const settings = loadNotificationSettings();
      expect(settings.waterReminders).toBe(true);
      expect(settings.mealReminders).toBe(true);
      expect(settings.eveningFlexCheckin).toBe(true);
      expect(settings.waterIntervalHours).toBe(2);
      expect(settings.mealTimes.breakfast).toBe('08:30');
    });

    it('persists and loads updated notification settings', () => {
      const customSettings: NotificationSettings = {
        ...DEFAULT_NOTIFICATION_SETTINGS,
        enabled: true,
        waterIntervalHours: 3,
        mealTimes: {
          breakfast: '09:00',
          lunch: '14:00',
          dinner: '20:00'
        }
      };

      saveNotificationSettings(customSettings);
      const loaded = loadNotificationSettings();

      expect(loaded.enabled).toBe(true);
      expect(loaded.waterIntervalHours).toBe(3);
      expect(loaded.mealTimes.breakfast).toBe('09:00');
      expect(loaded.mealTimes.lunch).toBe('14:00');
    });
  });

  describe('Permission Status', () => {
    it('detects granted, denied or default permission', () => {
      // Mock global Notification
      const originalNotification = (globalThis as any).Notification;
      
      (globalThis as any).Notification = {
        permission: 'granted',
        requestPermission: vi.fn().mockResolvedValue('granted')
      };
      (globalThis as any).window.Notification = (globalThis as any).Notification;

      expect(getNotificationPermissionStatus()).toBe('granted');

      (globalThis as any).Notification.permission = 'denied';
      (globalThis as any).window.Notification.permission = 'denied';
      expect(getNotificationPermissionStatus()).toBe('denied');

      (globalThis as any).Notification = originalNotification;
      (globalThis as any).window.Notification = originalNotification;
    });
  });

  describe('Message Formatting Engines', () => {
    it('formats water reminders when target is not reached', () => {
      const msg = formatWaterNotification(750, 2000);
      expect(msg.title).toContain('Час для склянки води');
      expect(msg.body).toContain('1250 мл');
      expect(msg.body).toContain('2000 мл');
    });

    it('formats water congratulation when target is reached or exceeded', () => {
      const msg = formatWaterNotification(2200, 2000);
      expect(msg.title).toContain('досягнуто');
      expect(msg.body).toContain('2200 мл');
      expect(msg.body).toContain('100%');
    });

    it('formats meal notification for breakfast, lunch, and dinner', () => {
      const breakfast = formatMealNotification('Омлет з авокадо', 'breakfast', 380);
      expect(breakfast.title).toContain('сніданку');
      expect(breakfast.body).toContain('Омлет з авокадо');
      expect(breakfast.body).toContain('380 ккал');

      const dinner = formatMealNotification('Лосось', 'dinner', 450);
      expect(dinner.title).toContain('вечері');
      expect(dinner.body).toContain('Лосось');
    });

    it('formats evening Flex Bank notification with surplus reserve', () => {
      const msg = formatFlexBankEveningNotification(350, 420);
      expect(msg.title).toContain('Вечірній баланс NUTRIQ');
      expect(msg.body).toContain('420 ккал');
      expect(msg.body).toContain('+350 ккал');
    });

    it('formats evening Flex Bank notification with deficit reserve', () => {
      const msg = formatFlexBankEveningNotification(-150, 0);
      expect(msg.body).toContain('-150 ккал');
    });
  });

  describe('Active Daily Alerts Calculator', () => {
    it('returns empty array if notifications are disabled', () => {
      const settings: NotificationSettings = {
        ...DEFAULT_NOTIFICATION_SETTINGS,
        enabled: false
      };
      const alerts = getActiveDailyAlerts(settings, 500, 2000, 200, 500);
      expect(alerts).toHaveLength(0);
    });

    it('returns full schedule of alerts when enabled', () => {
      const settings: NotificationSettings = {
        ...DEFAULT_NOTIFICATION_SETTINGS,
        enabled: true,
        waterReminders: true,
        mealReminders: true,
        eveningFlexCheckin: true
      };

      const alerts = getActiveDailyAlerts(settings, 1000, 2000, 350, 600);
      expect(alerts.length).toBeGreaterThanOrEqual(5); // Water + 3 meals + Flex Bank

      const waterAlert = alerts.find((a) => a.type === 'water');
      const breakfastAlert = alerts.find((a) => a.id === 'meal-breakfast');
      const flexAlert = alerts.find((a) => a.type === 'flex_bank');

      expect(waterAlert).toBeDefined();
      expect(breakfastAlert).toBeDefined();
      expect(breakfastAlert?.scheduledTime).toBe('08:30');
      expect(flexAlert).toBeDefined();
      expect(flexAlert?.scheduledTime).toBe('20:30');
    });
  });

  describe('Notification Dispatch & In-App Event', () => {
    it('always dispatches in-app event on window', async () => {
      const eventSpy = vi.fn();
      window.addEventListener('nutriq-inapp-alert', eventSpy);

      await dispatchNutriqNotification('Тест', 'Тіло сповіщення');

      expect(eventSpy).toHaveBeenCalled();
      const eventDetail = eventSpy.mock.calls[0][0].detail;
      expect(eventDetail.title).toBe('Тест');
      expect(eventDetail.body).toBe('Тіло сповіщення');

      window.removeEventListener('nutriq-inapp-alert', eventSpy);
    });
  });
});
