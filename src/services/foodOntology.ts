/**
 * NUTRIQ Global Food Ontology & Cross-Lingual Semantic Search Engine
 * Maps culinary queries across 6 languages (ES, EN, UK, FR, IT, DE, PL)
 * into canonical nutritional entities and authentic national recipes.
 */

export interface CanonicalFoodEntity {
  id: string;
  canonicalName: string;
  aliases: string[]; // Multilingual stems and synonyms
  defaultDishId?: string;
}

export const CANONICAL_FOOD_ONTOLOGY: CanonicalFoodEntity[] = [
  // ФАРШ (Minced Meat - має пріоритет над птицею та яловичиною, бо фарш буває курячим/яловичим)
  {
    id: 'minced_meat',
    canonicalName: 'Фарш м’ясний / Carne picada / Ground meat',
    aliases: [
      'фарш', 'фаршу', 'farsh',
      'carne picada', 'picada',
      'ground meat', 'minced meat', 'ground beef',
      'viande hachée',
      'carne macinata',
      'hackfleisch'
    ]
  },

  // ПТИЦЯ ТА М'ЯСО (Poultry & Meat)
  {
    id: 'chicken',
    canonicalName: 'Курка / Pollo / Chicken',
    aliases: [
      'курк', 'курочк', 'куряч', 'філе куряче', 'kurka', 'kurochka',
      'pollo', 'pechuga', 'pechuga de pollo',
      'chicken', 'chicken breast',
      'poulet', 'blanc de poulet',
      'petto di pollo',
      'hähnchen', 'hühnerbrust', 'huhn',
      'kurczak', 'pierś'
    ],
    defaultDishId: 'chef-d2' // Куряче філе на грилі / Pechuga a la plancha
  },
  {
    id: 'beef_steak',
    canonicalName: 'Яловичина / Стейк / Ternera / Steak',
    aliases: [
      'яловичин', 'телятин', 'стейк', 'рібай', 'філе міньйон', 'steyk', 'yalovychyna',
      'ternera', 'buey', 'entrecot', 'solomillo', 'chuleton', 'vaca',
      'beef', 'steak', 'ribeye', 'sirloin', 'tenderloin',
      'boeuf', 'steak haché',
      'manzo', 'bistecca', 'tagliata',
      'rindfleisch', 'rindersteak',
      'wołowina', 'stek'
    ],
    defaultDishId: 'chef-d1' // Стейк рибай / Entrecot
  },
  {
    id: 'jamon',
    canonicalName: 'Хамон / Jamón Ibérico / Prosciutto',
    aliases: [
      'хамон', 'іберіко', 'серрано', 'в\'ялене м\'ясо', 'khamon',
      'jamon', 'jamón', 'iberico', 'ibérico', 'serrano', 'paleta', 'cecina',
      'prosciutto', 'crudo', 'parma',
      'jambon', 'jambon cru', 'jambon de parme',
      'schinken', 'serano'
    ],
    defaultDishId: 'chef-s2' // Хамон Іберіко з динею
  },
  {
    id: 'turkey',
    canonicalName: 'Індичка / Pavo / Turkey',
    aliases: [
      'індичк', 'індик', 'філе індички', 'indychka',
      'pavo', 'pechuga de pavo',
      'turkey', 'turkey breast',
      'dinde', 'filet de dinde',
      'tacchino',
      'pute', 'truthahn'
    ]
  },

  // МОРЕПРОДУКТИ (Fish & Seafood)
  {
    id: 'salmon',
    canonicalName: 'Лосось / Сьомга / Salmón / Saumon',
    aliases: [
      'лосос', 'сьомг', 'форел', 'червона риба', 'losos',
      'salmon', 'salmón', 'trucha',
      'saumon',
      'salmone',
      'lachs'
    ],
    defaultDishId: 'chef-l2' // Лосось су-від
  },
  {
    id: 'tuna',
    canonicalName: 'Тунець / Atún / Thon / Tuna',
    aliases: [
      'тунець', 'тунц', 'tunets',
      'atun', 'atún', 'bonito',
      'tuna',
      'thon',
      'tonno',
      'thunfisch'
    ]
  },

  // НАЦІОНАЛЬНІ СТРАВИ (Iconic National Dishes)
  {
    id: 'tortilla',
    canonicalName: 'Тортилья / Tortilla de patatas (Іспанія)',
    aliases: [
      'тортиль', 'тортилья', 'іспанський омлет', 'tortilia', 'tortylia',
      'tortilla', 'tortilla de patatas', 'tortilla española', 'tortilla de patata', 'tortilla francesa',
      'spanish omelette', 'potato omelette',
      'omelette espagnole',
      'frittata di patate',
      'kartoffelomelett'
    ],
    defaultDishId: 'chef-es1' // Тортилья де пататас
  },
  {
    id: 'gazpacho',
    canonicalName: 'Гаспачо / Gazpacho Andaluz (Іспанія)',
    aliases: [
      'гаспач', 'сальморехо', 'томатний холодний суп', 'gaspacho',
      'gazpacho', 'salmorejo', 'gazpacho andaluz', 'gazpacho andaluz tradicional',
      'cold tomato soup'
    ],
    defaultDishId: 'chef-es2' // Гаспачо андалузький
  },
  {
    id: 'croissant',
    canonicalName: 'Круасан / Croissant (Франція)',
    aliases: [
      'круас', 'круасан', 'рогалик французький', 'kruasan',
      'croissant', 'croissants', 'croissant de mantequilla', 'croissant au beurre',
      'cornetto', 'medialuna'
    ],
    defaultDishId: 'chef-fr1' // Круасан вершковий паризький
  },
  {
    id: 'baguette',
    canonicalName: 'Багет / Baguette Tradition (Франція)',
    aliases: [
      'багет', 'французький багет', 'хрусткий багет', 'baget',
      'baguette', 'baguette de tradition', 'baguette tradition',
      'french baguette', 'french bread',
      'pan frances', 'barra de pan'
    ]
  },
  {
    id: 'pasta_fagioli',
    canonicalName: 'Паста е фаджолі / Pasta e fagioli (Італія)',
    aliases: [
      'фаджол', 'паста з квасолею', 'pasta e fagioli', 'pasta fagioli', 'pasta e fasul',
      'pasta con alubias', 'pasta con judias', 'pasta beans'
    ],
    defaultDishId: 'chef-it1' // Паста е фаджолі
  },
  {
    id: 'pizza',
    canonicalName: 'Піца / Pizza (Італія)',
    aliases: [
      'піц', 'піца', 'піцца', 'маргарита', 'кватро формаджо', 'pitsa',
      'pizza', 'pizzas', 'pizza margherita', 'quattro formaggi', 'napolitana'
    ],
    defaultDishId: 'chef-l3' // Піца Маргарита
  },
  {
    id: 'pasta',
    canonicalName: 'Паста / Макарони / Pasta / Pâtes',
    aliases: [
      'паст', 'макарон', 'спагет', 'пенне', 'карбонара', 'болоньєзе', 'past',
      'pasta', 'espaguetis', 'macarrones', 'carbonara', 'boloñesa',
      'spaghetti', 'penne', 'noodles',
      'pâtes',
      'nudeln'
    ]
  },
  {
    id: 'burger',
    canonicalName: 'Бургер / Біг Мак / Hamburguesa / Burger',
    aliases: [
      'бургер', 'біг мак', 'бігмак', 'чізбургер', 'гамбургер', 'burger',
      'hamburguesa', 'big mac', 'cheeseburger'
    ]
  },

  // БАЗОВІ ПРОДУКТИ (Staples & Dairy)
  {
    id: 'eggs',
    canonicalName: 'Яйця / Омлет / Huevos / Eggs',
    aliases: [
      'яйц', 'яйко', 'яєчн', 'омлет', 'yaytsya', 'omlet',
      'huevo', 'huevos', 'huevos revueltos', 'tortilla francesa',
      'egg', 'eggs', 'scrambled eggs', 'omelet', 'omelette',
      'oeuf', 'oeufs',
      'uova',
      'eier'
    ],
    defaultDishId: 'chef-b2' // Омлет зі шпинатом
  },
  {
    id: 'syrniki',
    canonicalName: 'Сирники / Сир / Ricotta Pancakes / Syrnyky',
    aliases: [
      'сирник', 'сирнички', 'творожн', 'syrnyky', 'syrniki',
      'ricotta pancakes', 'curd pancakes',
      'tortitas de requeson'
    ],
    defaultDishId: 'chef-b1' // Сирники з рікоти
  },
  {
    id: 'yogurt_protein',
    canonicalName: 'Протеїновий йогурт / Yogur +Proteínas (Mercadona/Hacendado)',
    aliases: [
      'йогурт', 'протеїновий йогурт', 'йогурт білковий',
      'yogur', 'yogur proteico', 'yogur mas proteinas', 'hacendado yogur', 'skyr',
      'protein yogurt', 'greek yogurt',
      'yaourt'
    ]
  },
  {
    id: 'salad',
    canonicalName: 'Салат / Ensalada / Salad',
    aliases: [
      'салат', 'цезар', 'грецький', 'salat',
      'ensalada', 'ensalada cesar', 'ensalada griega',
      'salad', 'caesar salad', 'greek salad',
      'salade',
      'insalata'
    ]
  }
];

/**
 * Searches the canonical food ontology for any user input query across all languages.
 * Returns the matching canonical food entity or null.
 */
export function resolveCrossLingualEntity(query: string): CanonicalFoodEntity | null {
  const q = query.toLowerCase().trim();
  if (!q) return null;

  for (const entity of CANONICAL_FOOD_ONTOLOGY) {
    for (const alias of entity.aliases) {
      // Check full word match or stem match (minimum 3 chars)
      if (alias.length >= 3 && (q.includes(alias) || alias.includes(q))) {
        return entity;
      }
    }
  }

  return null;
}
