import { describe, it, expect } from 'vitest';
import { resolveCrossLingualEntity } from '../foodOntology';
import { findBestMatch } from '../recipeParser';

describe('Global Multilingual Food Ontology & Cross-Market Search', () => {
  it('resolves chicken across Spanish, Ukrainian, English, and French queries (kurka / pollo / chicken / poulet)', () => {
    expect(resolveCrossLingualEntity('kurka')?.id).toBe('chicken');
    expect(resolveCrossLingualEntity('курка')?.id).toBe('chicken');
    expect(resolveCrossLingualEntity('pollo')?.id).toBe('chicken');
    expect(resolveCrossLingualEntity('pechuga de pollo')?.id).toBe('chicken');
    expect(resolveCrossLingualEntity('chicken breast')?.id).toBe('chicken');
    expect(resolveCrossLingualEntity('poulet')?.id).toBe('chicken');

    // Verify findBestMatch returns chicken breast item
    expect(findBestMatch('kurka').id).toBe('chicken_breast');
    expect(findBestMatch('pechuga de pollo').id).toBe('chicken_breast');
    expect(findBestMatch('grilled chicken').id).toBe('chicken_breast');
  });

  it('resolves Spanish iconic dishes: Tortilla de patatas, Gazpacho, Jamón Ibérico', () => {
    // Tortilla
    expect(resolveCrossLingualEntity('tortilla')?.id).toBe('tortilla');
    expect(resolveCrossLingualEntity('тортилья')?.id).toBe('tortilla');
    expect(resolveCrossLingualEntity('tortilla de patatas')?.id).toBe('tortilla');
    expect(findBestMatch('tortilla').id).toBe('tortilla_espanola');

    // Gazpacho
    expect(resolveCrossLingualEntity('gazpacho')?.id).toBe('gazpacho');
    expect(resolveCrossLingualEntity('гаспачо')?.id).toBe('gazpacho');
    expect(findBestMatch('gazpacho andaluz').id).toBe('gazpacho_andaluz');

    // Jamón
    expect(resolveCrossLingualEntity('jamon')?.id).toBe('jamon');
    expect(resolveCrossLingualEntity('jamón')?.id).toBe('jamon');
    expect(resolveCrossLingualEntity('хамон')?.id).toBe('jamon');
    expect(findBestMatch('jamon iberico').id).toBe('jamon_iberico');
  });

  it('resolves French iconic dishes: Croissant, Baguette', () => {
    // Croissant
    expect(resolveCrossLingualEntity('croissant')?.id).toBe('croissant');
    expect(resolveCrossLingualEntity('круасан')?.id).toBe('croissant');
    expect(findBestMatch('croissant').id).toBe('croissant');

    // Baguette
    expect(resolveCrossLingualEntity('baguette')?.id).toBe('baguette');
    expect(resolveCrossLingualEntity('багет')?.id).toBe('baguette');
    expect(findBestMatch('baguette tradition').id).toBe('baguette_tradition');
  });

  it('resolves Italian iconic dishes: Pasta e fagioli, Pizza Margherita', () => {
    // Pasta e fagioli
    expect(resolveCrossLingualEntity('pasta e fagioli')?.id).toBe('pasta_fagioli');
    expect(findBestMatch('pasta e fagioli').id).toBe('pasta_fagioli');

    // Pizza
    expect(resolveCrossLingualEntity('pizza')?.id).toBe('pizza');
    expect(resolveCrossLingualEntity('піца')?.id).toBe('pizza');
    expect(findBestMatch('pizza').id).toBe('pizza');
  });

  it('resolves Spanish Mercadona/Hacendado products', () => {
    expect(resolveCrossLingualEntity('hacendado yogur')?.id).toBe('yogurt_protein');
    expect(findBestMatch('yogur proteico hacendado').id).toBe('yogur_proteico_hacendado');
  });

  it('checks why dishes match search query in CHEF_CATALOG', async () => {
    const { CHEF_CATALOG } = await import('../../components/ChefHubModal');
    const pizza = CHEF_CATALOG.find(i => i.name.includes('Піца'));
    expect(pizza).toBeDefined();

    const q = 'tortilla';
    const matchesName = pizza!.name.toLowerCase().includes(q);
    const matchesDesc = pizza!.shortDesc.toLowerCase().includes(q);
    const matchesCat = pizza!.categoryLabel.toLowerCase().includes(q);
    const matchesIngredients = pizza!.ingredients?.some(ing => ing.name.toLowerCase().includes(q));

    expect(matchesName).toBe(false);
    expect(matchesDesc).toBe(false);
    expect(matchesCat).toBe(false);
    expect(matchesIngredients).toBe(false);

    // Test crossEntity for 'tortilla' on pizza
    const crossEntity = resolveCrossLingualEntity(q);
    expect(crossEntity?.id).toBe('tortilla');

    const matchesOntology = (crossEntity?.id === 'tortilla' && (pizza!.name.toLowerCase().includes('тортиль') || pizza!.name.toLowerCase().includes('tortilla')));
    expect(matchesOntology).toBe(false);

    const qIncludesPizza = q.includes('піц') && pizza!.name.toLowerCase().includes('піц');
    expect(qIncludesPizza).toBe(false);
  });
});
