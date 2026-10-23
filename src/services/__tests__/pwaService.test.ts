import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  parsePwaActionFromUrl,
  getPwaStatus,
  getMobilePlatform
} from '../pwaService';

describe('pwaService - PWA Native Installation & Shortcuts (Stage 6.1)', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe('PWA Shortcut & Action URL Parsing', () => {
    it('parses ?action=quickadd action', () => {
      const parsed = parsePwaActionFromUrl('https://nutriq.app/?action=quickadd');
      expect(parsed.action).toBe('quickadd');
    });

    it('parses ?action=barcode action', () => {
      const parsed = parsePwaActionFromUrl('https://nutriq.app/?action=barcode');
      expect(parsed.action).toBe('barcode');
    });

    it('parses ?tab=cookloss shortcut into log action', () => {
      const parsed = parsePwaActionFromUrl('https://nutriq.app/?tab=cookloss');
      expect(parsed.action).toBe('log');
      expect(parsed.tab).toBe('cookloss');
    });

    it('parses ?tab=grocery shortcut into grocery action', () => {
      const parsed = parsePwaActionFromUrl('https://nutriq.app/?tab=grocery');
      expect(parsed.action).toBe('grocery');
      expect(parsed.tab).toBe('grocery');
    });

    it('returns null action for standard root URL', () => {
      const parsed = parsePwaActionFromUrl('https://nutriq.app/');
      expect(parsed.action).toBeNull();
    });
  });

  describe('PWA Status Detection', () => {
    it('returns structured PWA status', () => {
      const status = getPwaStatus();
      expect(typeof status.isStandalone).toBe('boolean');
      expect(typeof status.isIos).toBe('boolean');
      expect(typeof status.isAndroid).toBe('boolean');
      expect(typeof status.canPromptInstall).toBe('boolean');
    });

    it('correctly detects browser environment', () => {
      const platform = getMobilePlatform();
      expect(typeof platform.isIos).toBe('boolean');
      expect(typeof platform.isAndroid).toBe('boolean');
    });
  });
});
