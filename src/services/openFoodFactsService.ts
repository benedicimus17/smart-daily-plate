/**
 * NUTRIQ - Open Food Facts & Barcode Scanner Service
 * stage 5.4: Cross-Market Barcode Resolution (Mercadona, Carrefour, Lidl, Silpo, Global)
 * Supports live Open Food Facts API v2 + zero-latency Offline Database Fallback.
 */

export interface ScannedProduct {
  barcode: string;
  name: string;
  brand?: string;
  categories?: string[];
  imageUrl?: string;
  source: 'open_food_facts' | 'offline_preset' | 'manual';
  servingGrams: number;
  per100g: {
    calories: number;
    protein: number;
    fat: number;
    carbs: number;
  };
}

export interface BarcodeLookupResult {
  success: boolean;
  product?: ScannedProduct;
  error?: string;
}

/**
 * Офлайн-пресети перевірених товарів для миттєвого тестування та роботи без інтернету
 * (Іспанія Mercadona/Hacendado, Україна, Загальноєвропейські бренди)
 */
export const OFFLINE_BARCODE_DATABASE: Record<string, Omit<ScannedProduct, 'source'>> = {
  // Mercadona / Hacendado +Proteínas Yogurt (Іспанія)
  '8480000123456': {
    barcode: '8480000123456',
    name: 'Yogur +Proteínas con Arándanos',
    brand: 'Hacendado (Mercadona)',
    servingGrams: 150,
    imageUrl: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&w=500&q=80',
    categories: ['Lácteos', 'Proteínas', 'Yogur'],
    per100g: {
      calories: 69,
      protein: 10.0,
      fat: 0.1,
      carbs: 7.0
    }
  },
  // Hacendado Queso Fresco Batido 0% (Іспанія)
  '8480000204780': {
    barcode: '8480000204780',
    name: 'Queso Fresco Batido Desnatado 0%',
    brand: 'Hacendado (Mercadona)',
    servingGrams: 200,
    imageUrl: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=500&q=80',
    categories: ['Lácteos', 'Queso', 'Desnatado'],
    per100g: {
      calories: 46,
      protein: 8.0,
      fat: 0.1,
      carbs: 3.5
    }
  },
  // Mercadona Copos de Avena (Іспанія)
  '8410076472092': {
    barcode: '8410076472092',
    name: 'Copos de Avena Integrales',
    brand: 'Hacendado (Mercadona)',
    servingGrams: 50,
    imageUrl: 'https://images.unsplash.com/photo-1517673132405-a56a62b18caf?auto=format&fit=crop&w=500&q=80',
    categories: ['Cereales', 'Avena'],
    per100g: {
      calories: 375,
      protein: 14.0,
      fat: 7.0,
      carbs: 59.0
    }
  },
  // Mercadona Pechuga de Pollo Cortada (Іспанія)
  '8480000262117': {
    barcode: '8480000262117',
    name: 'Pechuga de Pollo en Tiras / Fileteada',
    brand: 'Hacendado (Mercadona)',
    servingGrams: 150,
    imageUrl: 'https://images.unsplash.com/photo-1604503468506-a8da13d82791?auto=format&fit=crop&w=500&q=80',
    categories: ['Carnicería', 'Pollo'],
    per100g: {
      calories: 106,
      protein: 23.8,
      fat: 1.2,
      carbs: 0.0
    }
  },
  // Сир кисломолочний Яготинський 5% (Україна)
  '4823000914872': {
    barcode: '4823000914872',
    name: 'Сир кисломолочний 5%',
    brand: 'Яготинський',
    servingGrams: 180,
    imageUrl: 'https://images.unsplash.com/photo-1575853121743-60c24f0a7502?auto=format&fit=crop&w=500&q=80',
    categories: ['Молочні продукти', 'Сир'],
    per100g: {
      calories: 121,
      protein: 17.0,
      fat: 5.0,
      carbs: 2.0
    }
  },
  // Гречана крупа ядриця (Україна)
  '4820000000001': {
    barcode: '4820000000001',
    name: 'Гречана крупа ядриця відбірна',
    brand: 'Традиційна кухня',
    servingGrams: 80,
    imageUrl: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=500&q=80',
    categories: ['Бакалія', 'Крупи'],
    per100g: {
      calories: 335,
      protein: 12.6,
      fat: 3.3,
      carbs: 62.0
    }
  },
  // Coca-Cola Zero Azúcar 330ml (Європа / Світ)
  '5449000131805': {
    barcode: '5449000131805',
    name: 'Coca-Cola Zero Azúcar',
    brand: 'Coca-Cola',
    servingGrams: 330,
    imageUrl: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&w=500&q=80',
    categories: ['Bebidas', 'Refrescos'],
    per100g: {
      calories: 0.3,
      protein: 0.0,
      fat: 0.0,
      carbs: 0.0
    }
  },
  // Nutella Ferrero (Європа / Світ)
  '8000500310427': {
    barcode: '8000500310427',
    name: 'Nutella Crema de Avellanas',
    brand: 'Ferrero',
    servingGrams: 30,
    imageUrl: 'https://images.unsplash.com/photo-1541696432-82c6da8ce7bf?auto=format&fit=crop&w=500&q=80',
    categories: ['Dulces', 'Untables'],
    per100g: {
      calories: 539,
      protein: 6.3,
      fat: 30.9,
      carbs: 57.5
    }
  }
};

/**
 * Очищення та валідація штрих-коду (EAN-8, EAN-13, UPC-A)
 */
export function sanitizeBarcode(rawCode: string): string {
  return rawCode.trim().replace(/[^0-9]/g, '');
}

export function isValidBarcode(code: string): boolean {
  const sanitized = sanitizeBarcode(code);
  return sanitized.length >= 8 && sanitized.length <= 14;
}

/**
 * Розрахунок калорій та макросів для обраної ваги порції (у грамах)
 */
export function calculatePortionMacros(product: ScannedProduct, grams: number) {
  const safeGrams = Math.max(1, grams || 100);
  const factor = safeGrams / 100;

  return {
    grams: Math.round(safeGrams),
    calories: Math.round(product.per100g.calories * factor),
    protein: Math.round(product.per100g.protein * factor * 10) / 10,
    fat: Math.round(product.per100g.fat * factor * 10) / 10,
    carbs: Math.round(product.per100g.carbs * factor * 10) / 10
  };
}

/**
 * Головна функція пошуку товару:
 * 1. Спочатку перевіряє офлайн-базу (0 мс затримки, робота без інтернету)
 * 2. При відсутності — звертається до live API Open Food Facts v2
 */
export async function lookupBarcode(
  rawBarcode: string,
  options: { timeoutMs?: number; fetchImpl?: typeof fetch } = {}
): Promise<BarcodeLookupResult> {
  const barcode = sanitizeBarcode(rawBarcode);

  if (!isValidBarcode(barcode)) {
    return {
      success: false,
      error: 'Некоректний штрих-код. Має містити від 8 до 14 цифр.'
    };
  }

  // 1. Офлайн-пресети перевірених товарів
  if (OFFLINE_BARCODE_DATABASE[barcode]) {
    const item = OFFLINE_BARCODE_DATABASE[barcode];
    return {
      success: true,
      product: {
        ...item,
        source: 'offline_preset'
      }
    };
  }

  // 2. Live API Open Food Facts v2
  const activeFetch = options.fetchImpl || (typeof fetch !== 'undefined' ? fetch : null);
  if (!activeFetch) {
    return {
      success: false,
      error: 'Мережевий клієнт недоступний для пошуку штрих-коду.'
    };
  }

  const timeoutMs = options.timeoutMs ?? 5000;
  const controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
  const timeoutId = controller ? setTimeout(() => controller.abort(), timeoutMs) : null;

  try {
    const url = `https://world.openfoodfacts.org/api/v2/product/${barcode}.json`;
    const res = await activeFetch(url, {
      signal: controller?.signal,
      headers: {
        'User-Agent': 'NUTRIQ-DailyPlate-App/1.0 (nutriq@antigravity.health)'
      }
    });

    if (timeoutId) clearTimeout(timeoutId);

    if (!res.ok) {
      if (res.status === 404) {
        return {
          success: false,
          error: `Товар зі штрих-кодом ${barcode} не знайдено у відкритій базі Open Food Facts.`
        };
      }
      return {
        success: false,
        error: `Помилка сервера Open Food Facts (HTTP ${res.status}).`
      };
    }

    const data = await res.json();

    if (!data || data.status === 0 || !data.product) {
      return {
        success: false,
        error: `Товар зі штрих-кодом ${barcode} не зареєстрований у базі Open Food Facts.`
      };
    }

    const p = data.product;
    const nutriments = p.nutriments || {};

    // Розрахунок енергії (ккал): пріоритет energy-kcal_100g, або конвертація з kJ
    let kcal = parseFloat(nutriments['energy-kcal_100g'] ?? nutriments['energy-kcal'] ?? 0);
    if (!kcal && nutriments['energy_100g']) {
      // Якщо вказано в кДж
      const kj = parseFloat(nutriments['energy_100g']);
      kcal = Math.round(kj / 4.184);
    }

    const protein = parseFloat(nutriments.proteins_100g ?? nutriments.proteins ?? 0);
    const fat = parseFloat(nutriments.fat_100g ?? nutriments.fat ?? 0);
    const carbs = parseFloat(nutriments.carbohydrates_100g ?? nutriments.carbohydrates ?? 0);

    // Визначення назви (локалізована або загальна)
    const name = p.product_name_uk || p.product_name_es || p.product_name_en || p.product_name || `Продукт #${barcode}`;
    const brand = p.brands || p.brand_owner || undefined;
    const imageUrl = p.image_front_url || p.image_url || p.image_small_url || undefined;

    // Стандартна порція
    let servingGrams = 100;
    if (p.serving_quantity) {
      const parsed = parseFloat(p.serving_quantity);
      if (!isNaN(parsed) && parsed > 0) servingGrams = parsed;
    } else if (p.serving_size) {
      const match = String(p.serving_size).match(/(\d+(?:[.,]\d+)?)\s*g/i);
      if (match) {
        servingGrams = parseFloat(match[1].replace(',', '.'));
      }
    }

    const scannedProduct: ScannedProduct = {
      barcode,
      name,
      brand,
      imageUrl,
      source: 'open_food_facts',
      servingGrams: Math.round(servingGrams) || 100,
      per100g: {
        calories: Math.round(kcal) || 0,
        protein: Math.round(protein * 10) / 10 || 0,
        fat: Math.round(fat * 10) / 10 || 0,
        carbs: Math.round(carbs * 10) / 10 || 0
      }
    };

    return {
      success: true,
      product: scannedProduct
    };
  } catch (err: any) {
    if (timeoutId) clearTimeout(timeoutId);
    if (err?.name === 'AbortError') {
      return {
        success: false,
        error: 'Перевищено час очікування відповіді від Open Food Facts (таймаут).'
      };
    }
    return {
      success: false,
      error: `Не вдалося з'єднатися з базою Open Food Facts: ${err?.message || 'Помилка мережі'}`
    };
  }
}
