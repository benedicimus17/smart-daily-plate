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
    expect(parsed.totalMacros.calories).toBeGreaterThan(320);
    expect(parsed.totalMacros.carbs).toBeGreaterThan(55);
    expect(parsed.totalMacros.protein).toBeGreaterThan(9);
    expect(parsed.ingredients).toHaveLength(3);
  });

  it('коректно розраховує Біг Мак (не плутає з макаронами)', () => {
    const parsed = parseSmartDish('Біг Мак', 210);
    expect(parsed.title).toContain('Біг Мак');
    expect(parsed.totalWeightGrams).toBe(210);
    // 210г Біг Мак має містити ~480-550 ккал, 25-30г білка, понад 20г жирів, ~40-45г вуглеводів
    expect(parsed.totalMacros.calories).toBeGreaterThan(450);
    expect(parsed.totalMacros.calories).toBeLessThan(580);
    expect(parsed.totalMacros.protein).toBeGreaterThan(24);
    expect(parsed.totalMacros.fat).toBeGreaterThan(18); // не 3.2г!
    expect(parsed.totalMacros.carbs).toBeLessThan(55);  // не 151г!
  });

  it('коректно розраховує круасан (не дає занижений фоллбек)', () => {
    const parsed = parseSmartDish('круасан', 100);
    expect(parsed.title).toContain('круасан');
    expect(parsed.totalMacros.calories).toBeGreaterThan(380); // ~406 ккал, не 145 ккал!
    expect(parsed.totalMacros.fat).toBeGreaterThan(18);
  });

  it('коректно розпізнає горішки, салат та снек', () => {
    const nuts = parseSmartDish('горішки', 100);
    expect(nuts.totalMacros.calories).toBeGreaterThan(550); // ~607 ккал
    expect(nuts.totalMacros.fat).toBeGreaterThan(45);

    const salad = parseSmartDish('салат', 100);
    expect(salad.totalMacros.calories).toBeLessThan(120);

    const snack = parseSmartDish('снек', 100);
    expect(snack.totalMacros.protein).toBeGreaterThan(15);
  });

  it('розпізнає TikTok-відео з крепсами з м’ясом за описом та URL', () => {
    const parsed = parseRecipeFromUrl('https://vm.tiktok.com/ZM8123456/', 'крепси з м’ясом', 2);
    expect(parsed.title).toContain('крепси з соковитим м’ясним фаршем');
    expect(parsed.ingredients.some(i => i.name.includes('Фарш') || i.name.includes('м’яс'))).toBe(true);
    expect(parsed.macrosPerServing.protein).toBeGreaterThan(20);
  });

  it('динамічно розпізнає будь-яке відео з TikTok за введеною назвою (не завжди паста)', () => {
    const croissantVideo = parseRecipeFromUrl('https://www.tiktok.com/@baker/video/12345', 'круасан', 1);
    expect(croissantVideo.title).toContain('круасан');
    expect(croissantVideo.macrosPerServing.calories).toBeGreaterThan(350);

    const saladVideo = parseRecipeFromUrl('https://www.tiktok.com/@chef/video/99999', 'салат', 1);
    expect(saladVideo.title).toContain('салат');
    expect(saladVideo.macrosPerServing.calories).toBeLessThan(200);
  });

  it('коректно парсить розмовний текст з шумом та сполучниками та/і', () => {
    const noisyText = 'Приготуй будь ласка: 250г яловичина; потім додай 2 яйця + 1 банан та 20г мед';
    const parsed = parseSmartDish(noisyText);
    expect(parsed.totalWeightGrams).toBe(510);
    expect(parsed.ingredients).toHaveLength(4);
    expect(parsed.totalMacros.calories).toBeGreaterThan(600);
  });

  it('бездоганно розпізнає реальний TikTok-рецепт Cooking with Keeks (Куряча локшина Теріякі 341 ккал на 2 порції)', () => {
    const keeksTikTokPost = `Високобілковий, низькокалорійний, ВЕЛИКИЙ смак курячої локшини Теріякі вартістю менше 350 калорій
Калорії: 341
Жир: 5,5 г
Білок: 29.9г
Вуглеводи: 50.1г

Інгредієнти (на 2 порції)
- Куряча грудка кубиками
- 150г сирої середньої яєчної локшини
- 1 нарізана цибулина
- Пучок подрібненої ріпчастої цибулі
- 2 ст.л. соусу Теріякі
- 1/4 ч.л. пластівців чилі
- 60 мл темного соєвого соусу
- 1 ч.л. часникових гранул
- 1 ч.л. паприки
- 1 ч. ложка кунжутного масла
- 4 нарізаних кубиками зубчики часнику
- 10 мл меду
- 100г гороху
- Насіння кунжуту

Метод:
- Зварити горох і локшину
- Обсмажити курку зі спеціями
- Додати соус теріякі та з'єднати`;

    const parsed = parseRecipeFromText('', keeksTikTokPost);

    // Авто-визначення назви та порцій
    expect(parsed.title).toContain('Куряча локшина Теріякі');
    expect(parsed.servings).toBe(2);

    // Точні оголошені автором макроси на 1 порцію (Золотий стандарт TikTok)
    expect(parsed.macrosPerServing.calories).toBe(341);
    expect(parsed.macrosPerServing.protein).toBe(29.9);
    expect(parsed.macrosPerServing.fat).toBe(5.5);
    expect(parsed.macrosPerServing.carbs).toBe(50.1);

    // Сумарні калорії на всю страву (2 порції)
    expect(parsed.totalMacros.calories).toBe(682); // 341 * 2

    // Відсутність фейкових креветок або стейка
    const ingredientNames = parsed.ingredients.map(i => i.name).join(' ');
    expect(ingredientNames).not.toContain('кревет');
    expect(ingredientNames).not.toContain('стейк');

    // Наявність справжніх інгредієнтів азіатської локшини
    expect(parsed.ingredients.some(i => i.name.includes('Куряч') || i.name.includes('філе'))).toBe(true);
    expect(parsed.ingredients.some(i => i.name.includes('Локшина'))).toBe(true);
    expect(parsed.ingredients.some(i => i.name.includes('Теріякі'))).toBe(true);
    expect(parsed.ingredients.some(i => i.name.includes('соєвий'))).toBe(true);
    expect(parsed.ingredients.some(i => i.name.includes('горох') || i.name.includes('горошок'))).toBe(true);
  });

  it('розумно парсить готову страву "куряча локшина теріякі" без завищення до 994 ккал сухої пасти', () => {
    const wok = parseSmartDish('куряча локшина теріякі', 280);
    expect(wok.title).toContain('Куряча локшина');
    expect(wok.totalWeightGrams).toBe(280);
    // 280г готової азіатської локшини з куркою має бути ~320-370 ккал, а НЕ 994 ккал!
    expect(wok.totalMacros.calories).toBeGreaterThan(280);
    expect(wok.totalMacros.calories).toBeLessThan(400);
    expect(wok.totalMacros.protein).toBeGreaterThan(20);
    expect(wok.totalMacros.carbs).toBeLessThan(60); // не 201г!
  });
});
