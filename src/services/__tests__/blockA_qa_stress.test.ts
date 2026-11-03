import { describe, it, expect, vi } from 'vitest';
import { parseIngredientLine, parseRecipeFromText, parseSmartDish, parseRecipeFromUrl } from '../recipeParser';
import { parseVideoRecipeWithAi, fetchRealVideoMetadata } from '../videoAiService';
import { resolveCrossLingualEntity } from '../foodOntology';
import { detectDietaryConflicts } from '../allergenService';

describe('Block A QA Stress Audit - TikTok, NLP & Calorie Calculation Engine', () => {
  describe('1. Piece and Unit Conversions', () => {
    it('converts Ukrainian piece units correctly', () => {
      const eggs = parseIngredientLine('2 шт яйця');
      expect(eggs.amountGrams).toBe(120);
      expect(eggs.macros.protein).toBeGreaterThan(14);

      const bananas = parseIngredientLine('3 банани');
      expect(bananas.amountGrams).toBe(360);
      expect(bananas.macros.carbs).toBeGreaterThan(70);

      const apples = parseIngredientLine('1 яблуко');
      expect(apples.amountGrams).toBe(150);
      expect(apples.macros.calories).toBeGreaterThan(60);
    });

    it('converts Spanish piece units and abbreviations', () => {
      const eggs = parseIngredientLine('2 huevos');
      expect(eggs.amountGrams).toBe(120);

      const avocados = parseIngredientLine('1 ud aguacate');
      expect(avocados.amountGrams).toBe(150);
      expect(avocados.macros.fat).toBeGreaterThan(20);

      const spoon = parseIngredientLine('1 cda aceite de oliva');
      expect(spoon.amountGrams).toBe(15);
      expect(spoon.macros.fat).toBeGreaterThan(14);
    });

    it('converts English tablespoons and teaspoons', () => {
      const tbsp = parseIngredientLine('2 tbsp olive oil');
      expect(tbsp.amountGrams).toBe(30);
      expect(tbsp.macros.calories).toBeGreaterThan(250);

      const tsp = parseIngredientLine('1 tsp honey');
      expect(tsp.amountGrams).toBe(5);
    });
  });

  describe('2. Multi-Ingredient Free-Form Recipe Splitting', () => {
    it('splits comma-separated fitness lunch into accurate items and calculates total macros', () => {
      const input = '200g pechuga de pollo, 100g arroz blanco, 15g aceite de oliva, 2 huevos';
      const parsed = parseSmartDish(input);

      expect(parsed.ingredients.length).toBe(4);
      expect(parsed.totalWeightGrams).toBe(435); // 200 + 100 + 15 + 120

      // Pollo (200g): ~230 kcal, ~47g protein
      // Arroz (100g): ~360 kcal, ~7g protein, ~80g carbs
      // Aceite (15g): ~133 kcal, ~15g fat
      // Huevos (120g): ~186 kcal, ~15g protein, ~13g fat
      // Total calories: ~900-950 kcal
      // Total protein: ~69g
      expect(parsed.totalMacros.calories).toBeGreaterThan(850);
      expect(parsed.totalMacros.calories).toBeLessThan(1000);
      expect(parsed.totalMacros.protein).toBeGreaterThan(60);
      expect(parsed.totalMacros.fat).toBeGreaterThan(25);
      expect(parsed.totalMacros.carbs).toBeGreaterThan(65);
    });

    it('filters out instructions in Ukrainian, Spanish, and English without creating fake food items', () => {
      const recipeText = `
        - 250g куряче філе
        - 150g броколі
        - 15 мл оливкова олія

        Приготування:
        1. Нарізати філе соломкою.
        2. Обсмажити на пательні 10 хвилин.
        3. Додати суцвіття броколі та тушкувати до готовності.
        Смачного!
      `;

      const parsed = parseRecipeFromText('Куряче філе з броколі', recipeText, 1);
      expect(parsed.ingredients.length).toBe(3);
      expect(parsed.instructions.length).toBeGreaterThanOrEqual(3);

      // Verify none of the instructions became food items
      const hasInstructionAsFood = parsed.ingredients.some(i =>
        i.name.toLowerCase().includes('нарізати') ||
        i.name.toLowerCase().includes('обсмажити') ||
        i.name.toLowerCase().includes('приготування')
      );
      expect(hasInstructionAsFood).toBe(false);
    });
  });

  describe('3. Cross-Lingual Entity Ontology Precision (False Positives Prevention)', () => {
    it('does NOT falsely match "pan" (bread in ES) to syrniki or pancakes', () => {
      const resolved = resolveCrossLingualEntity('pan');
      expect(resolved?.id).toBe('bread');
      expect(resolved?.id).not.toBe('syrniki');
    });

    it('does NOT falsely match "sal" (salt in ES) to salmon', () => {
      const resolved = resolveCrossLingualEntity('sal');
      expect(resolved?.id).toBeUndefined();
    });

    it('correctly maps Spanish staple food items', () => {
      expect(resolveCrossLingualEntity('leche')?.id).toBe('milk');
      expect(resolveCrossLingualEntity('arroz')?.id).toBe('rice');
      expect(resolveCrossLingualEntity('queso')?.id).toBe('cheese');
      expect(resolveCrossLingualEntity('mantequilla')?.id).toBe('butter');
      expect(resolveCrossLingualEntity('cerdo')?.id).toBe('pork');
    });
  });

  describe('4. Real Video AI Metadata Scraping & Servings Division', () => {
    it('fetches real YouTube oEmbed video metadata without API key', async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          title: 'Healthy High Protein Meal Prep - Chicken and Rice',
          author_name: 'FitnessChef'
        })
      });

      const meta = await fetchRealVideoMetadata('https://www.youtube.com/watch?v=dQw4w9WgXcQ', mockFetch as any);
      expect(meta).not.toBeNull();
      expect(meta?.title).toContain('Chicken and Rice');
      expect(meta?.description).toContain('FitnessChef');
    });

    it('divides total macros accurately across multiple servings for video recipes', () => {
      const parsed = parseRecipeFromUrl('https://www.tiktok.com/@healthy/video/987654321', 'Вівсянка з бананом та ягодами', 2);
      expect(parsed.servings).toBe(2);
      expect(parsed.macrosPerServing.calories).toBe(Math.round(parsed.totalMacros.calories / 2));
      expect(parsed.macrosPerServing.protein).toBe(Math.round((parsed.totalMacros.protein / 2) * 10) / 10);
    });

    it('attaches -25% cook-loss note when meat or poultry is present in video recipe', async () => {
      const result = await parseVideoRecipeWithAi({
        videoUrl: 'https://www.tiktok.com/@fitness/video/12345678',
        dishHint: 'Соковитий курячий стейк з рисом',
        servings: 1
      });

      expect(result.success).toBe(true);
      expect(result.cookLossNote).toBe('-25% уварка вологи (Cook-Loss)');
    });
  });

  describe('5. Dietary Conflicts Safety Gate', () => {
    it('flags dietary conflict when meat dish is parsed for a vegetarian profile', () => {
      const chickenDish = parseSmartDish('250g куряче філе з рисом');
      const conflicts = detectDietaryConflicts(
        chickenDish.title,
        chickenDish.ingredients.map(i => i.name),
        { dietType: 'vegetarian', allergens: [], customAllergies: [] }
      );

      expect(conflicts.length).toBeGreaterThan(0);
      expect(conflicts[0].name.toLowerCase()).toContain('м\'ясо');
    });

    it('passes cleanly when vegetarian dish matches vegetarian profile', () => {
      const vegDish = parseSmartDish('150g броколі, 100g рис, 10g оливкова олія');
      const conflicts = detectDietaryConflicts(
        vegDish.title,
        vegDish.ingredients.map(i => i.name),
        { dietType: 'vegetarian', allergens: [], customAllergies: [] }
      );

      expect(conflicts.length).toBe(0);
    });
  });
});
