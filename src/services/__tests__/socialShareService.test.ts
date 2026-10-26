import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  ShareCardData,
  renderCardToCanvas,
  createShareCardBlob,
  shareOrDownloadCard
} from '../socialShareService';

describe('socialShareService - Branded Social Share & Progress Cards (Stage 6.3)', () => {
  const sampleData: ShareCardData = {
    dateTitle: 'Субота, 24 жовтня',
    userName: 'Alistair',
    caloriesConsumed: 1850,
    caloriesTarget: 2200,
    proteinGrams: 145,
    proteinTarget: 160,
    fatGrams: 55,
    fatTarget: 70,
    carbsGrams: 190,
    carbsTarget: 220,
    waterMl: 1750,
    waterTargetMl: 2000,
    flexBankKcal: 350,
    cookLossGramsSaved: 85,
    format: 'story'
  };

  const createMockCanvas = () => {
    const mockCtx = {
      createLinearGradient: vi.fn().mockReturnValue({ addColorStop: vi.fn() }),
      createRadialGradient: vi.fn().mockReturnValue({ addColorStop: vi.fn() }),
      fillRect: vi.fn(),
      beginPath: vi.fn(),
      arc: vi.fn(),
      fill: vi.fn(),
      stroke: vi.fn(),
      save: vi.fn(),
      restore: vi.fn(),
      roundRect: vi.fn(),
      fillText: vi.fn(),
      measureText: vi.fn().mockReturnValue({ width: 100 })
    };

    const mockCanvas = {
      width: 0,
      height: 0,
      getContext: vi.fn().mockReturnValue(mockCtx),
      toBlob: vi.fn((cb) => cb(new Blob(['mock-png-data'], { type: 'image/png' })))
    };

    return { mockCanvas, mockCtx };
  };

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe('Canvas Rendering Engine', () => {
    it('sets 1080x1920 dimensions for Story format', () => {
      const { mockCanvas, mockCtx } = createMockCanvas();
      renderCardToCanvas({ ...sampleData, format: 'story' }, mockCanvas as any);

      expect(mockCanvas.width).toBe(1080);
      expect(mockCanvas.height).toBe(1920);
      expect(mockCtx.fillRect).toHaveBeenCalledWith(0, 0, 1080, 1920);
      expect(mockCtx.fillText).toHaveBeenCalledWith('NUTRI', expect.any(Number), expect.any(Number));
    });

    it('sets 1080x1080 dimensions for Square format', () => {
      const { mockCanvas, mockCtx } = createMockCanvas();
      renderCardToCanvas({ ...sampleData, format: 'square' }, mockCanvas as any);

      expect(mockCanvas.width).toBe(1080);
      expect(mockCanvas.height).toBe(1080);
      expect(mockCtx.fillRect).toHaveBeenCalledWith(0, 0, 1080, 1080);
    });

    it('draws macro pillars and Flex Bank information', () => {
      const { mockCanvas, mockCtx } = createMockCanvas();
      renderCardToCanvas(sampleData, mockCanvas as any);

      // Verify that values are drawn
      const textCalls = mockCtx.fillText.mock.calls.map((c) => c[0]);
      expect(textCalls).toContain('БІЛКИ');
      expect(textCalls).toContain('ЖИРИ');
      expect(textCalls).toContain('ВУГЛЕВОДИ');
      expect(textCalls).toContain('Weekly Flex Bank');
      expect(textCalls).toContain('+350 ккал у резерві');
      expect(textCalls).toContain('Водний баланс');
    });
  });

  describe('createShareCardBlob', () => {
    it('generates a Blob using HTML5 Canvas', async () => {
      const originalDocument = globalThis.document;
      const { mockCanvas } = createMockCanvas();

      (globalThis as any).document = {
        createElement: vi.fn().mockReturnValue(mockCanvas)
      };

      const blob = await createShareCardBlob(sampleData);
      expect(blob).toBeDefined();
      expect(blob.type).toBe('image/png');

      globalThis.document = originalDocument;
    });
  });

  describe('shareOrDownloadCard Distribution Engine', () => {
    it('uses native navigator.share if available and supported', async () => {
      const mockBlob = new Blob(['img'], { type: 'image/png' });

      const shareMock = vi.fn().mockResolvedValue(undefined);
      const canShareMock = vi.fn().mockReturnValue(true);

      Object.defineProperty(navigator, 'canShare', { value: canShareMock, configurable: true, writable: true });
      Object.defineProperty(navigator, 'share', { value: shareMock, configurable: true, writable: true });

      const res = await shareOrDownloadCard(mockBlob);
      expect(res.success).toBe(true);
      expect(res.method).toBe('native');
      expect(shareMock).toHaveBeenCalled();
    });

    it('handles user cancellation in navigator.share gracefully', async () => {
      const mockBlob = new Blob(['img'], { type: 'image/png' });

      const abortError = new Error('Abort');
      abortError.name = 'AbortError';

      Object.defineProperty(navigator, 'canShare', { value: vi.fn().mockReturnValue(true), configurable: true, writable: true });
      Object.defineProperty(navigator, 'share', { value: vi.fn().mockRejectedValue(abortError), configurable: true, writable: true });

      const res = await shareOrDownloadCard(mockBlob);
      expect(res.success).toBe(false);
      expect(res.method).toBe('native');
      expect(res.error).toBe('Скасовано користувачем');
    });

    it('falls back to Clipboard when navigator.share is unavailable', async () => {
      const mockBlob = new Blob(['img'], { type: 'image/png' });

      const clipboardWriteMock = vi.fn().mockResolvedValue(undefined);
      Object.defineProperty(navigator, 'canShare', { value: undefined, configurable: true, writable: true });
      Object.defineProperty(navigator, 'share', { value: undefined, configurable: true, writable: true });
      Object.defineProperty(navigator, 'clipboard', {
        value: { write: clipboardWriteMock },
        configurable: true,
        writable: true
      });

      (globalThis as any).window = (globalThis as any).window || {};
      (globalThis as any).window.ClipboardItem = class ClipboardItem {
        constructor(public items: any) {}
      };

      const res = await shareOrDownloadCard(mockBlob);
      expect(res.success).toBe(true);
      expect(res.method).toBe('clipboard');
      expect(clipboardWriteMock).toHaveBeenCalled();
    });

    it('falls back to file download when neither share nor clipboard are available', async () => {
      const mockBlob = new Blob(['img'], { type: 'image/png' });

      Object.defineProperty(navigator, 'canShare', { value: undefined, configurable: true, writable: true });
      Object.defineProperty(navigator, 'share', { value: undefined, configurable: true, writable: true });
      Object.defineProperty(navigator, 'clipboard', { value: undefined, configurable: true, writable: true });

      const mockLink = {
        href: '',
        download: '',
        click: vi.fn()
      };
      const origDoc = globalThis.document;
      const origUrl = globalThis.URL;

      (globalThis as any).document = {
        createElement: vi.fn().mockReturnValue(mockLink),
        body: {
          appendChild: vi.fn(),
          removeChild: vi.fn()
        }
      };
      (globalThis as any).URL = {
        createObjectURL: vi.fn().mockReturnValue('blob:mock-url'),
        revokeObjectURL: vi.fn()
      };

      const res = await shareOrDownloadCard(mockBlob, 'test-summary.png');
      expect(res.success).toBe(true);
      expect(res.method).toBe('download');
      expect(mockLink.download).toBe('test-summary.png');
      expect(mockLink.click).toHaveBeenCalled();

      globalThis.document = origDoc;
      globalThis.URL = origUrl;
    });
  });
});
