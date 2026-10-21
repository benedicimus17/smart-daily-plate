import { describe, it, expect } from 'vitest';
import { parseIngredientLine, parseRecipeFromText, parseSmartDish, parseRecipeFromUrl } from '../recipeParser';

describe('Recipe Parser Service (1-Click TikTok / Reels / Web)', () => {
  it('коректно розпізнає грами, мілілітри та назви продуктів', () => {
    const line1 = parseIngredientLine('300г куряче філе');
    expect(line1.amountGrams).toBe(300);
    expect(line1.name).toContain('Куряче філе');
    expect(line1.macros.calories).toBeGreaterThan(300);
    expect(line1.macros.protein).toBeGreaterThan(60);

    const line2 = parseIngredientLine('15 мл оливкова олія');
    expect(line2.amountGrams).toBe(15);
    expect(line2.macros.fat).toBeGreaterThan(14);
  });

  it('конвертує штучні одиниці виміру (яйця, ложки)', () => {
    const eggLine = parseIngredientLine('2 шт яйця');
    expect(eggLine.amountGrams).toBe(120);
    expect(eggLine.macros.protein).toBeGreaterThan(12);

    const spoonLine = parseIngredientLine('1 ст.л. оливкова олія');
    expect(spoonLine.amountGrams).toBe(15);
  });

  it('парсить повний рецепт, рахує сумарні макроси та макроси на 1 порцію', () => {
    const recipeText = `
      - 250г паста / макарони
      - 300г креветки
      - 100г шпинат
      
      Приготування:
      1. Відварити пасту.
      2. Обсмажити креветки зі шпинатом.
    `;

    const parsed = parseRecipeFromText('Протеїнова паста з креветками', recipeText, 2);

    expect(parsed.title).toBe('Протеїнова паста з креветками');
    expect(parsed.servings).toBe(2);
    expect(parsed.ingredients).toHaveLength(3);
    expect(parsed.totalWeightGrams).toBe(650);

    // Перевірка макросів на 1 порцію
    expect(parsed.macrosPerServing.calories).toBe(Math.round(parsed.totalMacros.calories / 2));
    expect(parsed.macrosPerServing.protein).toBe(Math.round((parsed.totalMacros.protein / 2) * 10) / 10);
    expect(parsed.instructions.length).toBeGreaterThanOrEqual(2);
  });

  it('розумно розкладає складену страву "тост з бананом" на реальні інгредієнти та КБЖВ', () => {
    const parsed = parseSmartDish('тост з бананом', 210);
    expect(parsed.title).toContain('Тости з бананом');
    expect(parsed.totalWeightGrams).toBe(210);
    // 210г тостів з бананом мають містити більше 300 ккал та понад 50г корисних вуглеводів
    expect(parsed.totalMacros.calories).toBeGreaterThan(320);
    expect(parsed.totalMacros.carbs).toBeGreaterThan(55);
    expect(parsed.totalMacros.protein).toBeGreaterThan(9);
    expect(parsed.ingredients).toHaveLength(3);
  });

  it('розпізнає TikTok-відео з крепсами з м’ясом за описом та URL', () => {
    const parsed = parseRecipeFromUrl('https://vm.tiktok.com/ZM8123456/', 'крепси з м’ясом', 2);
    expect(parsed.title).toContain('крепси з соковитим м’ясним фаршем');
    expect(parsed.ingredients.some(i => i.name.includes('Фарш') || i.name.includes('м’яс'))).toBe(true);
    expect(parsed.macrosPerServing.protein).toBeGreaterThan(20);
  });
});
