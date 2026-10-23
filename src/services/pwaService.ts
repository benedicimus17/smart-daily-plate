/**
 * NUTRIQ - PWA Installation & Service Worker Service (Stage 6.1)
 * Detects standalone display mode, manages beforeinstallprompt event,
 * provides iOS Add-to-Home instructions, and parses PWA shortcut URL actions.
 */

export interface PwaStatus {
  isStandalone: boolean;
  isIos: boolean;
  isAndroid: boolean;
  canPromptInstall: boolean;
}

export type PwaAction = 'quickadd' | 'barcode' | 'log' | 'grocery' | 'profile' | null;

let deferredPrompt: any = null;
const listeners = new Set<(canPrompt: boolean) => void>();

if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    listeners.forEach(fn => fn(true));
  });

  window.addEventListener('appinstalled', () => {
    deferredPrompt = null;
    listeners.forEach(fn => fn(false));
  });
}

/**
 * Перевірка, чи запущено додаток у нативному автономному режимі (Standalone PWA)
 */
export function isStandaloneMode(): boolean {
  if (typeof window === 'undefined') return false;
  const isDisplayStandalone = window.matchMedia('(display-mode: standalone)').matches;
  const isIosStandalone = (window.navigator as any).standalone === true;
  return Boolean(isDisplayStandalone || isIosStandalone);
}

/**
 * Детекція типу мобільної платформи
 */
export function getMobilePlatform(): { isIos: boolean; isAndroid: boolean } {
  if (typeof navigator === 'undefined') return { isIos: false, isAndroid: false };
  const ua = navigator.userAgent || '';
  const isIos = /iPad|iPhone|iPod/.test(ua) && !(window as any).MSStream;
  const isAndroid = /Android/.test(ua);
  return { isIos, isAndroid };
}

/**
 * Отримання поточного PWA-статусу
 */
export function getPwaStatus(): PwaStatus {
  const { isIos, isAndroid } = getMobilePlatform();
  return {
    isStandalone: isStandaloneMode(),
    isIos,
    isAndroid,
    canPromptInstall: Boolean(deferredPrompt)
  };
}

/**
 * Підписка на доступність нативного промпта встановлення
 */
export function subscribeToInstallPrompt(callback: (canPrompt: boolean) => void): () => void {
  listeners.add(callback);
  callback(Boolean(deferredPrompt));
  return () => {
    listeners.delete(callback);
  };
}

/**
 * Запуск системного промпта встановлення на Android / Chrome
 */
export async function triggerNativeInstall(): Promise<{ outcome: 'accepted' | 'dismissed' | 'unsupported' }> {
  if (!deferredPrompt) {
    return { outcome: 'unsupported' };
  }

  try {
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    deferredPrompt = null;
    listeners.forEach(fn => fn(false));
    return { outcome };
  } catch {
    return { outcome: 'unsupported' };
  }
}

/**
 * Розбір швидких дій PWA з URL (Shortcuts: ?action=quickadd, ?action=barcode, ?tab=cookloss)
 */
export function parsePwaActionFromUrl(url: string = typeof window !== 'undefined' ? window.location.href : ''): { action: PwaAction; tab?: string } {
  try {
    const urlObj = new URL(url, 'https://nutriq.app');
    const action = urlObj.searchParams.get('action');
    const tab = urlObj.searchParams.get('tab');

    if (action === 'quickadd') return { action: 'quickadd' };
    if (action === 'barcode') return { action: 'barcode' };
    if (tab === 'cookloss' || action === 'log') return { action: 'log', tab: 'cookloss' };
    if (tab === 'grocery' || action === 'grocery') return { action: 'grocery', tab: 'grocery' };
    if (tab === 'profile' || action === 'profile') return { action: 'profile', tab: 'profile' };
  } catch {
    // ignore
  }

  return { action: null };
}
