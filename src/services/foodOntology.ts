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
      'spaghetti', 'penne',
      'pâtes',
      'nudeln'
    ]
  },
  {
    id: 'noodles_asian',
    canonicalName: 'Локшина яєчна / Wok / Noodles / Fideos asiáticos',
    aliases: [
      'локшин', 'локшини', 'лопш', 'вок', 'рамен', 'соба', 'удон', 'фунчоз',
      'noodles', 'egg noodles', 'ramen', 'soba', 'udon', 'wok',
      'fideos asiaticos', 'fideos chinos', 'tallarines', 'nouilles'
    ]
  },
  {
    id: 'teriyaki_sauce',
    canonicalName: 'Соус Теріякі / Teriyaki',
    aliases: ['теріякі', 'теріакі', 'teriyaki', 'salsa teriyaki']
  },
  {
    id: 'soy_sauce',
    canonicalName: 'Соєвий соус / Salsa de soja',
    aliases: ['соєв', 'соя', 'соєвий соус', 'темний соєвий', 'soy sauce', 'salsa de soja', 'sauce soja']
  },
  {
    id: 'sesame',
    canonicalName: 'Кунжут / Сезам / Sésamo / Sesame',
    aliases: ['кунжут', 'сезам', 'кунжутна', 'кунжутне', 'кунжутного', 'sesame', 'sesamo', 'sésamo']
  },
  {
    id: 'green_peas',
    canonicalName: 'Зелений горошок / Guisantes / Peas',
    aliases: ['горох', 'горошок', 'гороху', 'guisantes', 'peas', 'pois']
  },
  {
    id: 'garlic',
    canonicalName: 'Часник / Ajo / Garlic',
    aliases: ['часник', 'часнику', 'часников', 'зубчик', 'зубчики', 'ajo', 'ajos', 'garlic']
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
  },
  {
    id: 'rice',
    canonicalName: 'Рис / Arroz / Rice',
    aliases: [
      'рис', 'рису', 'рисовий', 'басматі',
      'arroz', 'arroz blanco', 'arroz integral', 'arroz basmati',
      'rice', 'white rice', 'brown rice', 'basmati rice',
      'riz', 'reis', 'ryż'
    ]
  },
  {
    id: 'olive_oil',
    canonicalName: 'Олія / Aceite / Olive Oil',
    aliases: [
      'олія', 'олії', 'олію', 'олією', 'оливкова олія', 'соняшникова олія',
      'aceite', 'aceite de oliva', 'aceite de girasol', 'aove',
      'olive oil', 'vegetable oil', 'oil', 'sunflower oil',
      'huile', 'olio', 'öl', 'oliwa'
    ]
  },
  {
    id: 'butter',
    canonicalName: 'Масло / Mantequilla / Butter',
    aliases: [
      'вершкове масло', 'масло вершкове',
      'mantequilla', 'mantequilla con sal', 'mantequilla sin sal',
      'butter', 'unsalted butter', 'salted butter',
      'beurre', 'burro', 'masło'
    ]
  },
  {
    id: 'milk',
    canonicalName: 'Молоко / Leche / Milk',
    aliases: [
      'молоко', 'молока', 'молоком',
      'leche', 'leche entera', 'leche semidesnatada', 'leche desnatada',
      'milk', 'whole milk', 'skim milk',
      'lait', 'latte', 'milch', 'mleko'
    ]
  },
  {
    id: 'cheese',
    canonicalName: 'Сир твердий / Queso / Cheese',
    aliases: [
      'твердий сир', 'сир чеддер', 'сир гауда', 'сир пармезан',
      'queso', 'queso curado', 'queso manchego', 'queso semicurado', 'queso cheddar',
      'cheese', 'cheddar', 'gouda', 'parmesan',
      'fromage', 'formaggio', 'käse', 'ser'
    ]
  },
  {
    id: 'bread',
    canonicalName: 'Хліб / Pan / Bread',
    aliases: [
      'хліб', 'хліба', 'тост', 'булка', 'булочка',
      'pan', 'pan blanco', 'pan integral', 'pan de molde', 'tostada', 'tostadas',
      'bread', 'toast', 'whole wheat bread', 'white bread',
      'pain', 'pane', 'brot', 'chleb'
    ]
  },
  {
    id: 'potato',
    canonicalName: 'Картопля / Patata / Potato',
    aliases: [
      'картопля', 'картоплі', 'картоплю', 'картопляний', 'пюре',
      'patata', 'patatas', 'papa', 'papas', 'patatas asadas',
      'potato', 'potatoes', 'baked potato',
      'pomme de terre', 'patate', 'kartoffel', 'ziemniak'
    ]
  },
  {
    id: 'pork',
    canonicalName: 'Свинина / Cerdo / Pork',
    aliases: [
      'свинина', 'свинини', 'свинячий', 'вирізка свинна',
      'cerdo', 'lomo', 'lomo de cerdo', 'solomillo de cerdo', 'costillas',
      'pork', 'pork loin', 'pork tenderloin', 'pork chop',
      'porc', 'maiale', 'schweinefleisch', 'wieprzowina'
    ]
  },
  {
    id: 'avocado',
    canonicalName: 'Авокадо / Aguacate / Avocado',
    aliases: [
      'авокадо', 'авокадо хасс',
      'aguacate', 'aguacates', 'aguacate hass',
      'avocado', 'hass avocado',
      'avocat', 'awokado'
    ]
  },
  {
    id: 'banana',
    canonicalName: 'Банан / Plátano / Banana',
    aliases: [
      'банан', 'банани', 'банана', 'бананів',
      'platano', 'plátano', 'platanos', 'plátanos',
      'banana', 'bananas',
      'banane'
    ]
  },
  {
    id: 'apple',
    canonicalName: 'Яблуко / Manzana / Apple',
    aliases: [
      'яблуко', 'яблука', 'яблук', 'яблучний',
      'manzana', 'manzanas',
      'apple', 'apples',
      'pomme', 'mela', 'apfel', 'jabłko'
    ]
  },
  {
    id: 'oats',
    canonicalName: 'Вівсянка / Avena / Oats',
    aliases: [
      'вівсянка', 'вівсяні пластівці', 'вівсянки', 'вівсянку',
      'avena', 'copos de avena', 'avena integral',
      'oats', 'oatmeal', 'rolled oats',
      'haferflocken', 'flocons d\'avoine', 'owsianka'
    ]
  },
  {
    id: 'broccoli',
    canonicalName: 'Броколі / Brócoli / Broccoli',
    aliases: [
      'броколі', 'броколи',
      'brocoli', 'brócoli',
      'broccoli',
      'brokuł'
    ]
  },
  {
    id: 'almonds',
    canonicalName: 'Мигдаль / Almendras / Almonds',
    aliases: [
      'мигдаль', 'мигдалю',
      'almendra', 'almendras',
      'almond', 'almonds',
      'amande', 'mandorla', 'mandel', 'migdały'
    ]
  },
  {
    id: 'tofu',
    canonicalName: 'Тофу / Tofu',
    aliases: [
      'тофу', 'соєвий тофу',
      'tofu', 'tofu firme',
      'soya tofu'
    ]
  },
  {
    id: 'shrimp',
    canonicalName: 'Креветки / Gambas / Shrimp',
    aliases: [
      'креветка', 'креветки', 'креветок', 'тигрові креветки',
      'gamba', 'gambas', 'langostino', 'langostinos', 'camaron', 'camarones',
      'shrimp', 'prawns', 'king prawns',
      'crevette', 'gambero', 'krewetka'
    ]
  },
  {
    id: 'sour_cream',
    canonicalName: 'Сметана / Nata / Sour cream',
    aliases: [
      'сметана', 'сметани', 'сметану',
      'crema agria', 'nata agria',
      'sour cream',
      'crème fraîche', 'śmietana'
    ]
  },
  {
    id: 'kefir',
    canonicalName: 'Кефір / Kéfir / Kefir',
    aliases: [
      'кефір', 'кефіру',
      'kefir', 'kéfir'
    ]
  },
  {
    id: 'honey',
    canonicalName: 'Мед / Miel / Honey',
    aliases: [
      'мед', 'меду', 'медовий',
      'miel',
      'honey',
      'honig', 'miód'
    ]
  }
];

/**
 * Searches the canonical food ontology for any user input query across all languages.
 * Token-based semantic matching with exact-phrase priority to prevent false positives.
 */
export function resolveCrossLingualEntity(query: string): CanonicalFoodEntity | null {
  const q = query.toLowerCase().trim();
  if (!q) return null;

  // Split query into individual clean tokens
  const qTokens = q.split(/[\s,./\(\)\-_+]+/).filter(t => t.length > 0);

  // Phase 1: High priority exact match or exact multi-word phrase
  for (const entity of CANONICAL_FOOD_ONTOLOGY) {
    for (const alias of entity.aliases) {
      const a = alias.toLowerCase().trim();
      // Exact match with query
      if (q === a) return entity;
      // Multi-word phrase contained in query with boundary
      if (a.includes(' ') && q.includes(a)) return entity;
    }
  }

  // Phase 2: Token-level matching
  for (const entity of CANONICAL_FOOD_ONTOLOGY) {
    for (const alias of entity.aliases) {
      const a = alias.toLowerCase().trim();
      if (!a.includes(' ')) {
        for (const token of qTokens) {
          // Exact token match (e.g. token 'pan' matches alias 'pan', but never matches 'ricotta pancakes')
          if (token === a) return entity;
          // Stem matching only for tokens and aliases >= 4 chars to prevent short word false matches
          if (a.length >= 4 && token.length >= 4) {
            if (token.startsWith(a) || a.startsWith(token)) return entity;
          }
        }
      }
    }
  }

  return null;
}
