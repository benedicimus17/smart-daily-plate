import { describe, it, expect } from 'vitest';
import {
  detectDietaryConflicts,
  UserDietaryRestrictions
} from '../allergenService';
import { generateDailyMealsForTargets } from '../menuGenerator';

describe('allergenService - Smart Allergen & Dietary Restriction Engine (Stage 6.4)', () => {
  describe('Lactose / Dairy Detection', () => {
    const lactoseUser: UserDietaryRestrictions = {
      dietType: 'standard',
      allergens: ['lactose']
    };

    it('detects lactose in сырники and milk dishes', () => {
      const conflicts = detectDietaryConflicts('Ніжні сирники з рікоти', ['сир рікота 150г', 'молоко 30мл'], lactoseUser);
      expect(conflicts.length).toBeGreaterThan(0);
      expect(conflicts[0].id).toBe('lactose');
      expect(conflicts[0].safeAlternativeSuggestion).toContain('безлактозн');
    });

    it('passes safely on lactose-free dishes', () => {
      const conflicts = detectDietaryConflicts('Куряче філе з рисом та броколі', ['філе 150г', 'рис 100г'], lactoseUser);
      expect(conflicts).toHaveLength(0);
    });
  });

  describe('Vegetarian & Vegan Meat Protection', () => {
    const vegUser: UserDietaryRestrictions = {
      dietType: 'vegetarian',
      allergens: []
    };

    it('flags steak, chicken and turkey as prohibited meat for vegetarians', () => {
      const steakConflict = detectDietaryConflicts('Стейк рибай зі спаржею', ['яловичина 200г'], vegUser);
      expect(steakConflict.length).toBeGreaterThan(0);
      expect(steakConflict[0].type).toBe('diet');
      expect(steakConflict[0].id).toBe('diet_meat');

      const chickenConflict = detectDietaryConflicts('Куряче філе на грилі', ['курка 150г'], vegUser);
      expect(chickenConflict.length).toBeGreaterThan(0);
    });

    it('allows eggs and dairy for vegetarians', () => {
      const omeletConflict = detectDietaryConflicts('Омлет з авокадо та сиром', ['яйця 3 шт', 'сир 30г'], vegUser);
      expect(omeletConflict).toHaveLength(0);
    });

    it('flags eggs, dairy and seafood for vegans', () => {
      const veganUser: UserDietaryRestrictions = {
        dietType: 'vegan',
        allergens: []
      };

      const eggConflict = detectDietaryConflicts('Омлет зі шпинатом', ['яйця 2 шт'], veganUser);
      expect(eggConflict.some((c) => c.id === 'diet_eggs')).toBe(true);

      const fishConflict = detectDietaryConflicts('Лосось су-від', ['лосось 180г'], veganUser);
      expect(fishConflict.some((c) => c.id === 'diet_seafood')).toBe(true);
    });
  });

  describe('Custom Allergies Detection (e.g. Apples, Honey)', () => {
    const customUser: UserDietaryRestrictions = {
      dietType: 'standard',
      customAllergies: ['яблуко', 'мед']
    };

    it('detects custom apple allergy in oats or salads', () => {
      const conflicts = detectDietaryConflicts('Вівсяна каша з тертим яблуком та корицею', ['вівсянка 60г', 'яблуко 1 шт'], customUser);
      expect(conflicts.length).toBeGreaterThan(0);
      expect(conflicts[0].id).toBe('custom_яблуко');
      expect(conflicts[0].name).toContain('яблуко');
    });

    it('detects honey in dressings or tea', () => {
      const conflicts = detectDietaryConflicts('Салат із медово-гірчичною заправкою', ['зелень', 'мед 10г'], customUser);
      expect(conflicts.length).toBeGreaterThan(0);
      expect(conflicts[0].id).toBe('custom_мед');
    });
  });

  describe('Diet-Adaptive Menu Generator Integration', () => {
    it('generates 100% vegetarian menu without meat when vegetarian diet is chosen', () => {
      const vegUser: UserDietaryRestrictions = {
        dietType: 'vegetarian',
        allergens: []
      };

      const meals = generateDailyMealsForTargets(
        { calories: 2000, protein: 140, fat: 70, carbs: 200 },
        '3_meals',
        { userRestrictions: vegUser }
      );

      // Lunch must be chickpea / quinoa bowl, dinner must be tofu steak
      expect(meals.lunch.entries[0].name).toContain('Нут та кіноа');
      expect(meals.dinner.entries[0].name).toContain('тофу');
      expect(meals.lunch.entries[0].name).not.toContain('індичк');
      expect(meals.dinner.entries[0].name).not.toContain('Стейк рибай');
    });

    it('generates vegan scramble when egg allergy or vegan diet is chosen', () => {
      const veganUser: UserDietaryRestrictions = {
        dietType: 'vegan',
        allergens: ['eggs']
      };

      const meals = generateDailyMealsForTargets(
        { calories: 1800, protein: 120, fat: 60, carbs: 190 },
        '3_meals',
        { userRestrictions: veganUser }
      );

      expect(meals.breakfast.entries[0].name).toContain('Скрембл з тофу');
      expect(meals.breakfast.entries[0].recipeDetails).not.toContain('яйця');
    });
  });
});
