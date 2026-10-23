import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  lookupBarcode,
  sanitizeBarcode,
  isValidBarcode,
  calculatePortionMacros,
  ScannedProduct
} from '../openFoodFactsService';

describe('openFoodFactsService - Barcode Scanner & Open Food Facts Global API', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe('Sanitization & Validation', () => {
    it('sanitizes barcode removing spaces and non-numeric chars', () => {
      expect(sanitizeBarcode(' 848-000 012 3456 ')).toBe('8480000123456');
      expect(sanitizeBarcode('EAN: 5449000131805\n')).toBe('5449000131805');
    });

    it('validates barcode length (8 to 14 digits)', () => {
      expect(isValidBarcode('8480000123456')).toBe(true);
      expect(isValidBarcode('5449000131805')).toBe(true);
      expect(isValidBarcode('12345678')).toBe(true); // EAN-8
      expect(isValidBarcode('12345')).toBe(false); // too short
      expect(isValidBarcode('1234567890123456')).toBe(false); // too long
      expect(isValidBarcode('')).toBe(false);
    });
  });

  describe('Offline Presets & Zero-Latency Lookup', () => {
    it('instantly returns Hacendado +Proteínas yogurt without network request', async () => {
      const fetchSpy = vi.fn();
      const res = await lookupBarcode('8480000123456', { fetchImpl: fetchSpy });

      expect(fetchSpy).not.toHaveBeenCalled();
      expect(res.success).toBe(true);
      expect(res.product).toBeDefined();
      expect(res.product?.name).toContain('Yogur +Proteínas');
      expect(res.product?.brand).toContain('Hacendado');
      expect(res.product?.per100g.protein).toBe(10.0);
      expect(res.product?.source).toBe('offline_preset');
    });

    it('instantly returns Queso Fresco Batido 0% Mercadona', async () => {
      const res = await lookupBarcode('8480000204780');
      expect(res.success).toBe(true);
      expect(res.product?.name).toContain('Queso Fresco Batido');
      expect(res.product?.per100g.calories).toBe(46);
    });

    it('instantly returns Ukrainian Яготинський 5% cheese', async () => {
      const res = await lookupBarcode('4823000914872');
      expect(res.success).toBe(true);
      expect(res.product?.name).toContain('Сир кисломолочний 5%');
      expect(res.product?.per100g.protein).toBe(17.0);
    });

    it('instantly returns Coca-Cola Zero 330ml with 0 calories', async () => {
      const res = await lookupBarcode('5449000131805');
      expect(res.success).toBe(true);
      expect(res.product?.name).toContain('Coca-Cola Zero');
      expect(res.product?.per100g.calories).toBe(0.3);
    });
  });

  describe('Portion Calculations Math', () => {
    const sampleProduct: ScannedProduct = {
      barcode: '8480000123456',
      name: 'Yogur +Proteínas',
      source: 'offline_preset',
      servingGrams: 150,
      per100g: {
        calories: 69,
        protein: 10.0,
        fat: 0.1,
        carbs: 7.0
      }
    };

    it('calculates portion for default 100g', () => {
      const macros = calculatePortionMacros(sampleProduct, 100);
      expect(macros.calories).toBe(69);
      expect(macros.protein).toBe(10.0);
      expect(macros.fat).toBe(0.1);
      expect(macros.carbs).toBe(7.0);
    });

    it('calculates portion for 150g (standard cup)', () => {
      const macros = calculatePortionMacros(sampleProduct, 150);
      // 69 * 1.5 = 103.5 -> 104 kcal
      expect(macros.calories).toBe(104);
      // 10.0 * 1.5 = 15.0 g protein
      expect(macros.protein).toBe(15.0);
      // 7.0 * 1.5 = 10.5 g carbs
      expect(macros.carbs).toBe(10.5);
    });

    it('handles small portion (25g)', () => {
      const macros = calculatePortionMacros(sampleProduct, 25);
      expect(macros.calories).toBe(17);
      expect(macros.protein).toBe(2.5);
    });
  });

  describe('Live Open Food Facts API Integration', () => {
    it('successfully parses valid product from Open Food Facts API v2', async () => {
      const mockApiResponse = {
        status: 1,
        product: {
          product_name: 'Bio Skyr Naturalny',
          product_name_uk: 'Біо Скир Натуральний',
          brands: 'Piątnica',
          image_front_url: 'https://images.openfoodfacts.org/skyr.jpg',
          serving_size: '150 g',
          nutriments: {
            'energy-kcal_100g': 64,
            proteins_100g: 11.0,
            fat_100g: 0.0,
            carbohydrates_100g: 4.0
          }
        }
      };

      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => mockApiResponse
      });

      const res = await lookupBarcode('5900531012345', { fetchImpl: mockFetch as any });

      expect(mockFetch).toHaveBeenCalledTimes(1);
      expect(res.success).toBe(true);
      expect(res.product?.name).toBe('Біо Скир Натуральний');
      expect(res.product?.brand).toBe('Piątnica');
      expect(res.product?.servingGrams).toBe(150);
      expect(res.product?.per100g.calories).toBe(64);
      expect(res.product?.per100g.protein).toBe(11.0);
      expect(res.product?.source).toBe('open_food_facts');
    });

    it('returns clear error when product is not found in Open Food Facts (status 0 or 404)', async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({ status: 0, status_verbose: 'product not found' })
      });

      const res = await lookupBarcode('9999999999999', { fetchImpl: mockFetch as any });

      expect(res.success).toBe(false);
      expect(res.error).toContain('не зареєстрований у базі Open Food Facts');
    });

    it('handles network error and timeout gracefully', async () => {
      const mockFetch = vi.fn().mockRejectedValue(new Error('Network offline or DNS error'));

      const res = await lookupBarcode('7777777777777', { fetchImpl: mockFetch as any });

      expect(res.success).toBe(false);
      expect(res.error).toContain('Не вдалося з\'єднатися');
    });

    it('rejects invalid barcode before hitting the network', async () => {
      const mockFetch = vi.fn();
      const res = await lookupBarcode('123', { fetchImpl: mockFetch as any });

      expect(mockFetch).not.toHaveBeenCalled();
      expect(res.success).toBe(false);
      expect(res.error).toContain('Некоректний штрих-код');
    });
  });
});
