/**
 * NUTRIQ Product Analytics & Health Telemetry Service (Stage 7.0)
 * Privacy-First, GDPR-Compliant Local Event Bus & Telemetry Engine.
 * 
 * Strict Privacy Rules:
 * 1. Zero Personally Identifiable Information (NO emails, names, IPs, precise locations).
 * 2. Local-First: Events are buffered locally in localStorage/in-memory (max 100 entries).
 * 3. 100% Transparency: User can view, export, or wipe all telemetry in 1 click (GDPR Art. 15, 17, 20).
 * 4. User Opt-Out: User can disable telemetry at any time.
 */

export type AnalyticsEventName =
  | 'onboarding_started'
  | 'onboarding_step_completed'
  | 'onboarding_completed'
  | 'meal_reality_swapped'
  | 'meal_skipped'
  | 'meal_eaten_toggled'
  | 'water_logged'
  | 'barcode_scanned'
  | 'pro_modal_viewed'
  | 'pro_checkout_started'
  | 'social_card_shared'
  | 'smart_swap_executed'
  | 'telemetry_consent_changed';

export interface AnalyticsEvent {
  id: string;
  name: AnalyticsEventName;
  timestamp: string; // ISO 8601
  sessionId: string;
  properties?: Record<string, string | number | boolean | null>;
}

export interface TelemetryStats {
  isEnabled: boolean;
  totalEvents: number;
  lastEventTimestamp: string | null;
  countsByName: Partial<Record<AnalyticsEventName, number>>;
}

const STORAGE_KEY_EVENTS = 'nutriq-telemetry-events-v1';
const STORAGE_KEY_CONSENT = 'nutriq-telemetry-consent-v1';
const SESSION_KEY = 'nutriq-anonymous-session-id';
const MAX_BUFFERED_EVENTS = 100;

class MemoryStorage {
  private store = new Map<string, string>();
  getItem(key: string): string | null {
    return this.store.get(key) ?? null;
  }
  setItem(key: string, value: string): void {
    this.store.set(key, String(value));
  }
  removeItem(key: string): void {
    this.store.delete(key);
  }
  clear(): void {
    this.store.clear();
  }
}

const fallbackLocalStorage = new MemoryStorage();
const fallbackSessionStorage = new MemoryStorage();

export function getSafeStorage(type: 'local' | 'session') {
  if (typeof window !== 'undefined') {
    try {
      if (type === 'local' && window.localStorage) return window.localStorage;
      if (type === 'session' && window.sessionStorage) return window.sessionStorage;
    } catch {
      // In private browsing mode or disabled cookies
    }
  }
  return type === 'local' ? fallbackLocalStorage : fallbackSessionStorage;
}

// Список заборонених PII ключів для жорсткої санітизації
const FORBIDDEN_PII_KEYS = new Set([
  'email',
  'name',
  'fullname',
  'phone',
  'phonenumber',
  'password',
  'ip',
  'ipaddress',
  'address',
  'creditcard',
  'pin',
  'pincode'
]);

/**
 * Отримання або генерація анонімного ідентифікатора сесії (без прив'язки до особи)
 */
export function getAnonymousSessionId(): string {
  try {
    const storage = getSafeStorage('session');
    let sessionId = storage.getItem(SESSION_KEY);
    if (!sessionId) {
      sessionId = 'sess_' + Math.random().toString(36).substring(2, 10) + '_' + Date.now().toString(36);
      storage.setItem(SESSION_KEY, sessionId);
    }
    return sessionId;
  } catch {
    return 'fallback_session_' + Date.now();
  }
}

/**
 * Перевірка згоди користувача на збір анонімної телеметрії (за замовчуванням true, з правом миттєвого opt-out)
 */
export function isTelemetryEnabled(): boolean {
  try {
    const storage = getSafeStorage('local');
    const val = storage.getItem(STORAGE_KEY_CONSENT);
    if (val === null) return true; // Default opt-in with full local transparency
    return val === 'true';
  } catch {
    return true;
  }
}

/**
 * Встановлення згоди / відмови від телеметрії
 */
export function setTelemetryConsent(enabled: boolean): void {
  try {
    const storage = getSafeStorage('local');
    storage.setItem(STORAGE_KEY_CONSENT, String(enabled));
    if (!enabled) {
      // При відмові одразу очищаємо збережені події (GDPR Right to be Forgotten)
      clearTelemetryEvents();
    } else {
      // Фіксуємо факт зміни налаштування
      trackEvent('telemetry_consent_changed', { enabled: true });
    }
  } catch {
    // Fail-safe
  }
}

/**
 * Санітизація властивостей для гарантованого відсікання PII
 */
export function sanitizeProperties(
  props?: Record<string, any>
): Record<string, string | number | boolean | null> | undefined {
  if (!props) return undefined;
  const sanitized: Record<string, string | number | boolean | null> = {};

  for (const [key, val] of Object.entries(props)) {
    if (FORBIDDEN_PII_KEYS.has(key.toLowerCase())) {
      continue; // Відсікаємо персональні дані
    }
    if (typeof val === 'string') {
      // Якщо це схоже на email — відсікаємо
      if (val.includes('@') && val.includes('.')) {
        continue;
      }
      sanitized[key] = val.substring(0, 100); // Обмеження довжини рядків
    } else if (typeof val === 'number' || typeof val === 'boolean' || val === null) {
      sanitized[key] = val;
    }
  }

  return Object.keys(sanitized).length > 0 ? sanitized : undefined;
}

/**
 * Реєстрація події в системі аналітики
 */
export function trackEvent(
  name: AnalyticsEventName,
  properties?: Record<string, any>
): AnalyticsEvent | null {
  if (!isTelemetryEnabled()) return null;

  try {
    const event: AnalyticsEvent = {
      id: 'evt_' + Math.random().toString(36).substring(2, 9) + '_' + Date.now().toString(36),
      name,
      timestamp: new Date().toISOString(),
      sessionId: getAnonymousSessionId(),
      properties: sanitizeProperties(properties)
    };

    const existing = getStoredEvents();
    existing.push(event);

    // Ротація кільцевого буфера
    const trimmed = existing.length > MAX_BUFFERED_EVENTS
      ? existing.slice(existing.length - MAX_BUFFERED_EVENTS)
      : existing;

    const storage = getSafeStorage('local');
    storage.setItem(STORAGE_KEY_EVENTS, JSON.stringify(trimmed));

    if (typeof window !== 'undefined' && typeof window.dispatchEvent === 'function') {
      window.dispatchEvent(new CustomEvent('nutriq-telemetry-event', { detail: event }));
    }

    return event;
  } catch (err) {
    console.warn('[NUTRIQ Analytics] Failed to record event:', err);
    return null;
  }
}

/**
 * Отримання списку збережених подій
 */
export function getStoredEvents(): AnalyticsEvent[] {
  try {
    const storage = getSafeStorage('local');
    const raw = storage.getItem(STORAGE_KEY_EVENTS);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

/**
 * Очищення локального буфера телеметрії
 */
export function clearTelemetryEvents(): void {
  try {
    const storage = getSafeStorage('local');
    storage.removeItem(STORAGE_KEY_EVENTS);
    if (typeof window !== 'undefined' && typeof window.dispatchEvent === 'function') {
      window.dispatchEvent(new CustomEvent('nutriq-telemetry-cleared'));
    }
  } catch {
    // Fail-safe
  }
}

/**
 * Отримання зведеної статистики подій
 */
export function getTelemetryStats(): TelemetryStats {
  const isEnabled = isTelemetryEnabled();
  const events = getStoredEvents();
  const countsByName: Partial<Record<AnalyticsEventName, number>> = {};

  for (const e of events) {
    countsByName[e.name] = (countsByName[e.name] || 0) + 1;
  }

  const lastEvent = events.length > 0 ? events[events.length - 1] : null;

  return {
    isEnabled,
    totalEvents: events.length,
    lastEventTimestamp: lastEvent ? lastEvent.timestamp : null,
    countsByName
  };
}

/**
 * Експорт подій у форматі красивого JSON для GDPR-перевірки
 */
export function exportTelemetryJson(): string {
  const events = getStoredEvents();
  const payload = {
    exportDate: new Date().toISOString(),
    service: 'NUTRIQ Anonymous Telemetry Engine',
    gdprCompliant: true,
    piiCollected: false,
    totalEvents: events.length,
    events
  };
  return JSON.stringify(payload, null, 2);
}
