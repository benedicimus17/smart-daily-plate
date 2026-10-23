import React, { useState } from 'react';
import {
  X,
  Sparkles,
  BookOpen,
  Link2,
  FileText,
  Plus,
  Check,
  Search,
  CheckCircle2,
  Layers,
  BookmarkPlus,
  Calendar,
  Clock,
  Scale,
  ChefHat,
  Lock,
  Crown,
  Globe,
  Barcode,
  Camera,
  ScanLine,
  AlertCircle
} from 'lucide-react';
import { MealType } from '../types/nutrition';
import { parseRecipeFromUrl, parseSmartDish } from '../services/recipeParser';
import { ParsedRecipe } from '../types/recipe';
import { useUserStore } from '../store/userStore';
import { resolveCrossLingualEntity } from '../services/foodOntology';
import {
  lookupBarcode,
  calculatePortionMacros,
  ScannedProduct
} from '../services/openFoodFactsService';

export interface ChefDishItem {
  id: string;
  name: string;
  category: MealType;
  categoryLabel: string;
  weightGrams: number;
  macros: { calories: number; protein: number; fat: number; carbs: number };
  photo: string;
  prepTime: string;
  cookLossNote?: string;
  shortDesc: string;
  ingredients?: { name: string; grams: number }[];
  instructions?: string[];
  tier?: 'free' | 'pro';
}

export const CHEF_CATALOG: ChefDishItem[] = [
  // СНІДАНКИ
  {
    id: 'chef-b1',
    name: 'Сирники з рікоти та ванілі',
    tier: 'pro',
    category: 'breakfast',
    categoryLabel: 'Сніданок',
    weightGrams: 200,
    macros: { calories: 310, protein: 26, fat: 11, carbs: 24 },
    photo: 'https://images.unsplash.com/photo-1575853121743-60c24f0a7502?auto=format&fit=crop&w=500&q=80',
    prepTime: '15 хв',
    cookLossNote: '-14% уварка вологи',
    shortDesc: 'Ніжні сирники на рисовому борошні без цукру',
    ingredients: [
      { name: 'Кисломолочний сир 5% / рікота', grams: 140 },
      { name: 'Куряче яйце', grams: 40 },
      { name: 'Борошно рисове', grams: 18 },
      { name: 'Ваніль та стевія', grams: 2 }
    ],
    instructions: [
      'Перетерти рікоту з яйцем та ваніллю до кремової текстури.',
      'Додати рисове борошно, перемішати та сформувати круглі сирники.',
      'Обсмажувати на антипригарній пательні на малому вогні по 4 хв з боку.'
    ]
  },
  {
    id: 'chef-b2',
    name: 'Омлет з авокадо та бейбі-шпинатом',
    tier: 'free',
    category: 'breakfast',
    categoryLabel: 'Сніданок',
    weightGrams: 180,
    macros: { calories: 380, protein: 28, fat: 24, carbs: 12 },
    photo: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&w=500&q=80',
    prepTime: '10 хв',
    shortDesc: '3 добірні яйця, стигле авокадо хасс та оливкова олія',
    ingredients: [
      { name: 'Курячі яйця добірні', grams: 110 },
      { name: 'Стигле авокадо Хасс', grams: 45 },
      { name: 'Бейбі-шпинат свіжий', grams: 20 },
      { name: 'Оливкова олія Extra Virgin', grams: 5 }
    ],
    instructions: [
      'Припустити листя шпинату на пательні 60 секунд.',
      'Залити збитими яйцями з дрібкою морської солі та готувати під кришкою.',
      'Викласти слайси авокадо перед подачею.'
    ]
  },
  {
    id: 'chef-b3',
    name: 'Вівсяно-протеїнові панкейки з ягодами',
    tier: 'pro',
    category: 'breakfast',
    categoryLabel: 'Сніданок',
    weightGrams: 220,
    macros: { calories: 340, protein: 32, fat: 6, carbs: 42 },
    photo: 'https://images.unsplash.com/photo-1528207776546-365bb710ee93?auto=format&fit=crop&w=500&q=80',
    prepTime: '12 хв',
    shortDesc: 'Вівсянка тривалого варіння, ізолят та лохина',
    ingredients: [
      { name: 'Вівсяне борошно грубого помелу', grams: 60 },
      { name: 'Сироватковий ізолят (протеїн)', grams: 25 },
      { name: 'Яєчний білок', grams: 60 },
      { name: 'Свіжа лохина та малина', grams: 50 },
      { name: 'Мигдалеве молоко', grams: 25 }
    ],
    instructions: [
      'Збити вівсянку, протеїн, білок та молоко до однорідного тіста.',
      'Випікати невеликі панкейки на сухій пательні по 2 хв з кожного боку.',
      'Подавати теплими зі свіжими ягодами.'
    ]
  },
  {
    id: 'chef-b4',
    name: 'Тости з авокадо та яйцем пашот',
    tier: 'free',
    category: 'breakfast',
    categoryLabel: 'Сніданок',
    weightGrams: 210,
    macros: { calories: 395, protein: 22, fat: 23, carbs: 26 },
    photo: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&w=500&q=80',
    prepTime: '10 хв',
    shortDesc: 'Цільнозерновий хліб на заквасці з мікрогріном',
    ingredients: [
      { name: 'Цільнозерновий хліб на заквасці', grams: 85 },
      { name: 'Стигле авокадо Хасс', grams: 65 },
      { name: 'Куряче яйце пашот', grams: 55 },
      { name: 'Мікрогрін та насіння льону', grams: 5 }
    ],
    instructions: [
      'Підсушити хліб у тостері до хрусткості.',
      'Розім\'яти м\'якоть авокадо з краплею соку лимона та сіллю.',
      'Зварити яйце пашот 3 хвилини у слабо киплячій воді.',
      'Зібрати тост: хліб ➔ авокадо ➔ пашот ➔ мікрогрін.'
    ]
  },
  {
    id: 'chef-b5',
    name: 'Тости з бананом та арахісовою пастою',
    tier: 'free',
    category: 'breakfast',
    categoryLabel: 'Сніданок',
    weightGrams: 210,
    macros: { calories: 366, protein: 11.6, fat: 7.7, carbs: 66.2 },
    photo: 'https://images.unsplash.com/photo-1528207776546-365bb710ee93?auto=format&fit=crop&w=500&q=80',
    prepTime: '5 хв',
    shortDesc: 'Енергетичний тост із цільнозернового хліба, банана та натуральної пасти',
    ingredients: [
      { name: 'Цільнозерновий тостовий хліб', grams: 85 },
      { name: 'Стиглий солодкий банан', grams: 115 },
      { name: 'Натуральна 100% арахісова паста', grams: 10 }
    ],
    instructions: [
      'Підрум\'янити скибки цільнозернового хліба в тостері.',
      'Рівномірно намастити тонким шаром натуральної арахісової пасти.',
      'Викласти кружальця стиглого банана.'
    ]
  },

  // ОБІДИ
  {
    id: 'chef-l1',
    name: 'Куряче філе запечене з кіноа та броколі',
    tier: 'free',
    category: 'lunch',
    categoryLabel: 'Обід',
    weightGrams: 220,
    macros: { calories: 480, protein: 44, fat: 12, carbs: 48 },
    photo: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=500&q=80',
    prepTime: '25 хв',
    cookLossNote: '220г сирого ➔ 165г готового (-25%)',
    shortDesc: 'Запечене філе в прованських травах та суперфуд кіноа',
    ingredients: [
      { name: 'Куряче філе грудки (вага готова)', grams: 110 },
      { name: 'Відварене кіноа', grams: 70 },
      { name: 'Броколі на пару', grams: 35 },
      { name: 'Оливкова олія та трави', grams: 5 }
    ],
    instructions: [
      'Замаринувати філе у спеціях та запекти при 180°C 22 хвилини.',
      'Відварити кіноа у воді 1:2 протягом 15 хвилин.',
      'Броколі бланшувати на пару 4 хвилини для максимальної користі.'
    ]
  },
  {
    id: 'chef-l2',
    name: 'Боул із запеченим лососем та диким рисом',
    tier: 'pro',
    category: 'lunch',
    categoryLabel: 'Обід',
    weightGrams: 260,
    macros: { calories: 520, protein: 40, fat: 22, carbs: 42 },
    photo: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?auto=format&fit=crop&w=500&q=80',
    prepTime: '20 хв',
    shortDesc: 'Омега-3 лосось, свіжий огірок, норі та кунжутний дресинг',
    ingredients: [
      { name: 'Філе лосося запечене', grams: 120 },
      { name: 'Дикий та нешліфований рис', grams: 90 },
      { name: 'Стигле авокадо', grams: 40 },
      { name: 'Огірок свіжий та кунжут', grams: 10 }
    ],
    instructions: [
      'Запекти лосось з морською сіллю при 180°C 15 хвилин.',
      'Викласти теплий рис у боул, додати рибу та слайси авокадо.',
      'Посипати насінням кунжуту.'
    ]
  },
  {
    id: 'chef-l3',
    name: 'Паста з тигровими креветками у соусі',
    tier: 'pro',
    category: 'lunch',
    categoryLabel: 'Обід',
    weightGrams: 280,
    macros: { calories: 490, protein: 38, fat: 11, carbs: 58 },
    photo: 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&w=500&q=80',
    prepTime: '15 хв',
    shortDesc: 'Тверді сорти пшениці, креветки 16/20, часник та базилік',
    ingredients: [
      { name: 'Паста з твердих сортів al dente', grams: 140 },
      { name: 'Тигрові креветки очищені', grams: 110 },
      { name: 'Томати чері та часник', grams: 25 },
      { name: 'Оливкова олія Extra Virgin', grams: 5 }
    ],
    instructions: [
      'Відварити пасту до стану al dente 8-9 хвилин.',
      'Швидко обсмажити креветки з часником по 1.5 хвилини з боку.',
      'З\'єднати пасту з соковитими креветками та базиліком.'
    ]
  },
  {
    id: 'chef-l4',
    name: 'Теплий салат з телячою вирізкою гриль',
    tier: 'pro',
    category: 'lunch',
    categoryLabel: 'Обід',
    weightGrams: 240,
    macros: { calories: 420, protein: 42, fat: 16, carbs: 18 },
    photo: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=500&q=80',
    prepTime: '18 хв',
    shortDesc: 'Нежирна яловичина, томати чері та діжонська заправка',
    ingredients: [
      { name: 'Теляча вирізка на грилі', grams: 130 },
      { name: 'Хрусткий салатний мікс', grams: 50 },
      { name: 'Томати чері соковиті', grams: 40 },
      { name: 'Діжонська заправка з кедровими горішками', grams: 20 }
    ],
    instructions: [
      'Обсмажити телятину на грилі до ступеня Medium (по 2.5 хв).',
      'Викласти салатне листя та томати на тарілку.',
      'Нарізати тепле м\'ясо тонкими скибочками та полити заправкою.'
    ]
  },
  {
    id: 'chef-l5',
    name: 'Тонкі домашні крепси з соковитим м\'ясом',
    tier: 'pro',
    category: 'lunch',
    categoryLabel: 'Обід',
    weightGrams: 250,
    macros: { calories: 499, protein: 28.2, fat: 30.4, carbs: 28.6 },
    photo: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&w=500&q=80',
    prepTime: '20 хв',
    shortDesc: 'Автентичні крепси з відбірним яловичим фаршем — вірусний рецепт з TikTok',
    ingredients: [
      { name: 'Тонкі домашні крепси / млинці', grams: 120 },
      { name: 'Відбірний яловичий фарш', grams: 120 },
      { name: 'Цибуля ріпчаста та олія', grams: 10 }
    ],
    instructions: [
      'Обсмажити дрібно нарізану цибулю та фарш зі спеціями до повної готовності.',
      'Загорнути начинку у тонкий золотистий млинець конвертиком.',
      'Підрум\'янити на пательні по 1 хвилині з кожного боку.'
    ]
  },
  {
    id: 'chef-l6',
    name: 'Піца Маргарита зі свіжим базиліком (Pizza Margherita)',
    tier: 'free',
    category: 'lunch',
    categoryLabel: 'Обід',
    weightGrams: 260,
    macros: { calories: 540, protein: 24, fat: 18, carbs: 68 },
    photo: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&w=500&q=80',
    prepTime: '15 хв',
    shortDesc: 'Класична італійська піца: тонке хрустке тісто, соковитий томатний соус San Marzano та ніжна моцарела',
    ingredients: [
      { name: 'Тонке італійське тісто для піци', grams: 130 },
      { name: 'Сир моцарела Fior di Latte', grams: 70 },
      { name: 'Томатний соус San Marzano', grams: 50 },
      { name: 'Свіжий зелений базилік та крапля олії', grams: 10 }
    ],
    instructions: [
      'Розкачати тісто на пергаменті, змастити томатним соусом.',
      'Викласти скибочки моцарели.',
      'Випікати в розігрітій духовці (240-250°C) 7-9 хвилин.',
      'Перед подачею покласти свіжий базилік.'
    ]
  },
  {
    id: 'chef-d4',
    name: 'Піца 4 Сири на тонкому тісті (Quattro Formaggi PRO)',
    tier: 'pro',
    category: 'dinner',
    categoryLabel: 'Вечеря',
    weightGrams: 270,
    macros: { calories: 620, protein: 29, fat: 26, carbs: 66 },
    photo: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=500&q=80',
    prepTime: '18 хв',
    shortDesc: 'Ресторанна авторська піца: моцарела, благородна горгонзола, пармезан, едем та волоські горіхи',
    ingredients: [
      { name: 'Хрустка основа для піци', grams: 120 },
      { name: '4 види сиру (моцарела, горгонзола, пармезан, едем)', grams: 130 },
      { name: 'Подрібнені волоські горіхи', grams: 20 }
    ],
    instructions: [
      'Покрити тонке тісто асорті благородних сирів.',
      'Запікати до утворення рум\'яної золотистої скоринки.',
      'Посипати горішками перед подачею.'
    ]
  },

  // ПЕРЕКУСИ
  {
    id: 'chef-s1',
    name: 'Протеїновий шейк (1 скуп ізоляту)',
    tier: 'free',
    category: 'snack',
    categoryLabel: 'Перекус',
    weightGrams: 30,
    macros: { calories: 120, protein: 25, fat: 1, carbs: 2 },
    photo: 'https://images.unsplash.com/photo-1553787499-6f9133860278?auto=format&fit=crop&w=500&q=80',
    prepTime: '2 хв',
    shortDesc: 'Швидке засвоєння білка без зайвих калорій',
    ingredients: [
      { name: 'Сироватковий ізолят (протеїн)', grams: 30 },
      { name: 'Очищена вода або мигдалеве молоко', grams: 250 }
    ],
    instructions: [
      'Налити у шейкер рідину, додати скуп протеїну.',
      'Інтенсивно збовтати 20 секунд до появи легкої кремової пінки.'
    ]
  },
  {
    id: 'chef-s2',
    name: 'Грецький йогурт 2% з лісовими ягодами',
    tier: 'free',
    category: 'snack',
    categoryLabel: 'Перекус',
    weightGrams: 180,
    macros: { calories: 190, protein: 15, fat: 4, carbs: 22 },
    photo: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&w=500&q=80',
    prepTime: '3 хв',
    shortDesc: 'Автентичний густий йогурт, свіжа чорниця та малина',
    ingredients: [
      { name: 'Грецький йогурт 2%', grams: 140 },
      { name: 'Мікс свіжих лісових ягід', grams: 35 },
      { name: 'Мигдалеві пелюстки', grams: 5 }
    ],
    instructions: [
      'Викласти охолоджений густий йогурт у креманку.',
      'Додати свіжі ягоди та присипати мигдалем.'
    ]
  },
  {
    id: 'chef-s3',
    name: 'Протеїновий чіа-пудинг на мигдалевому молоці',
    tier: 'pro',
    category: 'snack',
    categoryLabel: 'Перекус',
    weightGrams: 190,
    macros: { calories: 210, protein: 18, fat: 7, carbs: 16 },
    photo: 'https://images.unsplash.com/photo-1517673132405-a56a62b18caf?auto=format&fit=crop&w=500&q=80',
    prepTime: '5 хв',
    shortDesc: 'Насіння чіа, антиоксиданти та рослинний білок',
    ingredients: [
      { name: 'Насіння чіа органічне', grams: 25 },
      { name: 'Мигдалеве молоко несолодке', grams: 130 },
      { name: 'Ванільний протеїн', grams: 15 },
      { name: 'Ягоди для прикраси', grams: 20 }
    ],
    instructions: [
      'Змішати насіння чіа з рослинним молоком та протеїном.',
      'Залишити в холодильнику на 2 години (або на ніч) до желювання.'
    ]
  },

  // ВЕЧЕРІ
  {
    id: 'chef-d1',
    name: 'Gourmet Steak & Greens (Рибай зі спаржею)',
    tier: 'pro',
    category: 'dinner',
    categoryLabel: 'Вечеря',
    weightGrams: 260,
    macros: { calories: 510, protein: 46, fat: 24, carbs: 8 },
    photo: '/dinner_steak_hd.jpg',
    prepTime: '20 хв',
    cookLossNote: '350г сирого м\'яса ➔ 260г готового (-26%)',
    shortDesc: 'Еталонний соковитий стейк зернової відгодівлі',
    ingredients: [
      { name: 'Яловичий стейк Рибай (вага готова)', grams: 180 },
      { name: 'Спаржа молода на грилі', grams: 75 },
      { name: 'Вершкове масло та розмарин', grams: 5 }
    ],
    instructions: [
      'Дістати м\'ясо за 20 хв до смаження для вирівнювання температури.',
      'Обсмажити на розпеченій пательні по 3.5 хв з кожного боку.',
      'Бланшувати спаржу 2 хвилини та прогріти з вершковим маслом.',
      'Дати стейку відпочити 5 хвилин перед подачею.'
    ]
  },
  {
    id: 'chef-d2',
    name: 'Запечений сібас із цукіні на грилі',
    tier: 'pro',
    category: 'dinner',
    categoryLabel: 'Вечеря',
    weightGrams: 280,
    macros: { calories: 430, protein: 42, fat: 18, carbs: 10 },
    photo: 'https://images.unsplash.com/photo-1534939561126-855b8675edd7?auto=format&fit=crop&w=500&q=80',
    prepTime: '22 хв',
    shortDesc: 'Біла морська риба, лимонний чебрець та молоді цукіні',
    ingredients: [
      { name: 'Філе сібаса свіже', grams: 170 },
      { name: 'Цукіні на грилі', grams: 100 },
      { name: 'Оливкова олія та лимонний чебрець', grams: 10 }
    ],
    instructions: [
      'Запекти рибу у духовці при 190°C рівно 15 хвилин.',
      'Підрум\'янити кружальця цукіні на сухій гриль-пательні.',
      'Збризнути лимоном та свіжими травами.'
    ]
  },
  {
    id: 'chef-d3',
    name: 'Стейк тунця у чорному кунжуті з авокадо',
    tier: 'pro',
    category: 'dinner',
    categoryLabel: 'Вечеря',
    weightGrams: 250,
    macros: { calories: 460, protein: 48, fat: 19, carbs: 6 },
    photo: 'https://images.unsplash.com/photo-1501595091296-3aa970afb3ff?auto=format&fit=crop&w=500&q=80',
    prepTime: '15 хв',
    shortDesc: 'Швидка прожарка Rare/Medium Rare, хрусткий кунжут',
    ingredients: [
      { name: 'Стейк жовтоперого тунця', grams: 160 },
      { name: 'Чорний кунжут для панірування', grams: 10 },
      { name: 'Стигле авокадо Хасс', grams: 70 },
      { name: 'Соєвий соус та лайм', grams: 10 }
    ],
    instructions: [
      'Обваляти стейк у кунжуті.',
      'Обсмажити на пательні по 60 секунд з кожного боку (всередині має бути соковитий рожевий колір).',
      'Нарізати тонкими скибочками і подати з авокадо.'
    ]
  },
  {
    id: 'chef-s4',
    name: 'Мікс добірних горішків (мигдаль, фундук, волоські)',
    tier: 'free',
    category: 'snack',
    categoryLabel: 'Перекус',
    weightGrams: 50,
    macros: { calories: 304, protein: 9.0, fat: 27.0, carbs: 7.0 },
    photo: 'https://images.unsplash.com/photo-1599599810769-bcde5a160d32?auto=format&fit=crop&w=500&q=80',
    prepTime: '1 хв',
    shortDesc: 'Натуральні добірні горіхи без солі — заряд корисної енергії (здоровий снек)',
    ingredients: [
      { name: 'Горіхи асорті (мигдаль, волоські, фундук)', grams: 50 }
    ],
    instructions: [
      'Готовий до вживання поживний снек, багатий на омега-3 та магній.'
    ]
  },
  {
    id: 'chef-b6',
    name: 'Французький масляний круасан',
    tier: 'pro',
    category: 'breakfast',
    categoryLabel: 'Сніданок',
    weightGrams: 80,
    macros: { calories: 325, protein: 6.6, fat: 16.8, carbs: 36.6 },
    photo: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=500&q=80',
    prepTime: '2 хв',
    shortDesc: 'Ніжний пухкий круасан на натуральному вершковому маслі',
    ingredients: [
      { name: 'Круасан вершковий французький', grams: 80 }
    ],
    instructions: [
      'Злегка підігріти в духовці або тостері перед подачею.',
      'Ідеально смакує з ранковою кавою або чаєм.'
    ]
  },
  {
    id: 'chef-l6',
    name: 'Грецький салат зі свіжими овочами та фетою',
    tier: 'free',
    category: 'lunch',
    categoryLabel: 'Обід',
    weightGrams: 220,
    macros: { calories: 253, protein: 7.7, fat: 20.9, carbs: 8.8 },
    photo: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=500&q=80',
    prepTime: '8 хв',
    shortDesc: 'Хрусткі огірки, томати чері, маслини каламата, грецька фета та олія',
    ingredients: [
      { name: 'Помідори свіжі', grams: 80 },
      { name: 'Огірок свіжий', grams: 80 },
      { name: 'Сир фета / бринза', grams: 45 },
      { name: 'Оливкова олія extra virgin', grams: 15 }
    ],
    instructions: [
      'Нарізати овочі великими шматочками, додати кубики фети.',
      'Заправити оливковою олією Extra Virgin та орегано.'
    ]
  },
  {
    id: 'chef-l7',
    name: 'Бургер Біг Мак із соковитою телятиною',
    tier: 'pro',
    category: 'lunch',
    categoryLabel: 'Обід',
    weightGrams: 210,
    macros: { calories: 540, protein: 25.2, fat: 29.4, carbs: 44.1 },
    photo: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=500&q=80',
    prepTime: '15 хв',
    shortDesc: 'Дві соковиті яловичі котлети, булочка з кунжутом, сир Чеддер та фірмовий соус',
    ingredients: [
      { name: 'Бургер Біг Мак (McDonalds)', grams: 210 }
    ],
    instructions: [
      'Підсмажити котлети на грилі, підігріти булочку та зібрати класичний бургер.'
    ]
  },
  {
    id: 'chef-s5',
    name: 'Протеїновий снек-батончик (шоколад-арахіс)',
    tier: 'pro',
    category: 'snack',
    categoryLabel: 'Перекус',
    weightGrams: 60,
    macros: { calories: 228, protein: 12.0, fat: 7.2, carbs: 28.8 },
    photo: 'https://images.unsplash.com/photo-1622484216850-4d5162a40fd9?auto=format&fit=crop&w=500&q=80',
    prepTime: '1 хв',
    shortDesc: 'Поживний швидкий снек без доданого цукру для відновлення м’язів',
    ingredients: [
      { name: 'Протеїновий снек-батончик', grams: 60 }
    ],
    instructions: [
      'Ідеальний снек перед або після фізичної активності чи як перекус у дорозі.'
    ]
  },
  {
    id: 'chef-es1',
    name: 'Іспанська тортилья де пататас (Tortilla de patatas)',
    tier: 'pro',
    category: 'lunch',
    categoryLabel: 'Обід',
    weightGrams: 220,
    macros: { calories: 341, protein: 12.1, fat: 21.5, carbs: 24.6 },
    photo: 'https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?auto=format&fit=crop&w=500&q=80',
    prepTime: '20 хв',
    cookLossNote: '-10% втрата вологи',
    shortDesc: 'Автентична іспанська тортилья на оливковій олії з картоплею та свіжими яйцями',
    ingredients: [
      { name: 'Куряче яйце добірне', grams: 110 },
      { name: 'Картопля золотиста', grams: 95 },
      { name: 'Оливкова олія Extra Virgin', grams: 15 }
    ],
    instructions: [
      'Повільно підсмажити тонкі слайси картоплі в оливковій олії до м’якості.',
      'Збити яйця з сіллю, з’єднати з теплою картоплею та дати постояти 5 хвилин.',
      'Вилити на гарячу пательню, сформувати округлу форму та перевернути тарілкою.'
    ]
  },
  {
    id: 'chef-es2',
    name: 'Гаспачо андалузький традиційний (Gazpacho andaluz)',
    tier: 'free',
    category: 'dinner',
    categoryLabel: 'Вечеря',
    weightGrams: 300,
    macros: { calories: 138, protein: 2.4, fat: 7.8, carbs: 14.4 },
    photo: 'https://images.unsplash.com/photo-1547496502-affa22d38842?auto=format&fit=crop&w=500&q=80',
    prepTime: '5 хв',
    shortDesc: 'Освіжаючий холодний томатний суп з огірками, солодким перцем та іспанською олією',
    ingredients: [
      { name: 'Стиглі томати', grams: 200 },
      { name: 'Огірок свіжий', grams: 60 },
      { name: 'Перець солодкий', grams: 30 },
      { name: 'Оливкова олія Extra Virgin', grams: 10 }
    ],
    instructions: [
      'Подрібнити стиглі помідори, огірок і перець у блендері до шовковистої текстури.',
      'Влити холодну оливкову олію Extra Virgin та винний оцет, охолодити в холодильнику.'
    ]
  },
  {
    id: 'chef-s2',
    name: 'Хамон Іберіко з соковитою динею (Jamón Ibérico con Melón)',
    tier: 'pro',
    category: 'snack',
    categoryLabel: 'Перекус',
    weightGrams: 160,
    macros: { calories: 195, protein: 18.6, fat: 7.8, carbs: 12.0 },
    photo: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=500&q=80',
    prepTime: '3 хв',
    shortDesc: 'Добірний іспанський в’ялений хамон із високим вмістом білка та солодка диня',
    ingredients: [
      { name: 'Хамон Іберіко / Серрано', grams: 60 },
      { name: 'Диня свіжа (Melón piel de sapo)', grams: 100 }
    ],
    instructions: [
      'Нарізати диню тонкими скибочками.',
      'Обернути кожну скибочку найтоншим слайсом хамону іберіко.'
    ]
  },
  {
    id: 'chef-fr1',
    name: 'Французький круасан вершковий (Croissant au beurre)',
    tier: 'free',
    category: 'breakfast',
    categoryLabel: 'Сніданок',
    weightGrams: 70,
    macros: { calories: 284, protein: 5.7, fat: 14.7, carbs: 32.1 },
    photo: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=500&q=80',
    prepTime: '2 хв',
    shortDesc: 'Класичний паризький круасан на натуральному вершковому маслі',
    ingredients: [
      { name: 'Круасан вершковий французький', grams: 70 }
    ],
    instructions: [
      'Злегка прогріти в духовці 2 хвилини до хрусткої скоринки та аромату масла.'
    ]
  },
  {
    id: 'chef-it1',
    name: 'Паста е фаджолі по-римськи (Pasta e fagioli)',
    tier: 'pro',
    category: 'lunch',
    categoryLabel: 'Обід',
    weightGrams: 280,
    macros: { calories: 350, protein: 17.4, fat: 7.8, carbs: 51.8 },
    photo: 'https://images.unsplash.com/photo-1621996346565-e3d5d62810a9?auto=format&fit=crop&w=500&q=80',
    prepTime: '20 хв',
    shortDesc: 'Італійська паста з білою квасолею каннелліні, томатами, розмарином та олією',
    ingredients: [
      { name: 'Паста твердих сортів (Ditalini)', grams: 60 },
      { name: 'Квасоля біла варена (Cannellini)', grams: 120 },
      { name: 'Томатний соус пасата', grams: 90 },
      { name: 'Оливкова олія Extra Virgin', grams: 10 }
    ],
    instructions: [
      'Припустити розмарин з часником в оливковій олії, додати томати та квасолю.',
      'Зварити пасту до стану al dente та з’єднати з густим квасолевим соусом.'
    ]
  },
  {
    id: 'chef-es3',
    name: 'Протеїновий йогурт Hacendado з чорницею (+Proteínas Mercadona)',
    tier: 'free',
    category: 'snack',
    categoryLabel: 'Перекус',
    weightGrams: 180,
    macros: { calories: 125, protein: 18.0, fat: 0.2, carbs: 12.5 },
    photo: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&w=500&q=80',
    prepTime: '1 хв',
    shortDesc: 'Популярний знежирений білковий десерт з Mercadona з додаванням ягід',
    ingredients: [
      { name: 'Йогурт +Протеїн Hacendado (Mercadona)', grams: 150 },
      { name: 'Свіжа чорниця / лохина', grams: 30 }
    ],
    instructions: [
      'Змішати протеїновий пудинг або йогурт Hacendado зі свіжими ягодами.'
    ]
  }
];

interface ChefHubModalProps {
  isOpen: boolean;
  targetDate?: string;
  onClose: () => void;
  onAddDishToDay: (mealType: MealType, data: { name: string; weightGrams: number; macros: { calories: number; protein: number; fat: number; carbs: number }; timestamp?: string }) => void;
  onSaveToRecipeBook?: (recipe: ParsedRecipe) => void;
  onOpenProModal?: () => void;
}

export const ChefHubModal: React.FC<ChefHubModalProps> = ({
  isOpen,
  targetDate,
  onClose,
  onAddDishToDay,
  onSaveToRecipeBook,
  onOpenProModal
}) => {
  if (!isOpen) return null;

  const { user, setProStatus } = useUserStore();
  const isProUser = Boolean(user.isPro);

  // Режим роботи Шеф-Хабу: 1. Меню страв, 2. Сканер штрих-кодів, 3. AI Парсер (TikTok/Reels), 4. Розумний текст
  const [activeTab, setActiveTab] = useState<'catalog' | 'barcode' | 'ai_parser' | 'smart_text'>('catalog');

  // Стан для Barcode Scanner (Stage 5.4)
  const [barcodeInput, setBarcodeInput] = useState('8480000123456');
  const [scannedProduct, setScannedProduct] = useState<ScannedProduct | null>(null);
  const [barcodeGrams, setBarcodeGrams] = useState<number>(150);
  const [barcodeTargetSlot, setBarcodeTargetSlot] = useState<MealType>('snack');
  const [barcodeTargetTime, setBarcodeTargetTime] = useState<string>('11:00');
  const [isBarcodeLoading, setIsBarcodeLoading] = useState(false);
  const [barcodeError, setBarcodeError] = useState<string | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isAddedFromBarcode, setIsAddedFromBarcode] = useState(false);

  // Фільтри каталогу
  const [selectedFilter, setSelectedFilter] = useState<'all' | MealType>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [addedDishId, setAddedDishId] = useState<string | null>(null);

  // Стан для детального перегляду рецепта з каталогу (Preview Modal)
  const [selectedDishPreview, setSelectedDishPreview] = useState<ChefDishItem | null>(null);
  const [previewTargetSlot, setPreviewTargetSlot] = useState<MealType>('breakfast');
  const [isPreviewAdded, setIsPreviewAdded] = useState(false);
  const [proPaywallDish, setProPaywallDish] = useState<ChefDishItem | null>(null);

  // Стан для AI Парсера
  const [parserUrl, setParserUrl] = useState('https://www.tiktok.com/@chef/video/crepes-with-meat');
  const [videoDishHint, setVideoDishHint] = useState('');
  const [isParsing, setIsParsing] = useState(false);
  const [parsedRecipe, setParsedRecipe] = useState<ParsedRecipe | null>(null);
  const [addedMealSlot, setAddedMealSlot] = useState<MealType | null>(null);

  // Стан для Розумного тексту
  const [smartInputText, setSmartInputText] = useState('Тости з бананом');
  const [smartWeight, setSmartWeight] = useState('210');
  const [smartMealType, setSmartMealType] = useState<MealType>('breakfast');
  const [smartTime, setSmartTime] = useState('08:30');
  const [smartCalculated, setSmartCalculated] = useState<{ calories: number; protein: number; fat: number; carbs: number } | null>(null);

  // Фільтрація каталогу з підтримкою української, англійської мов та транслітерації
  const filteredCatalog = CHEF_CATALOG.filter((item) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) {
      return selectedFilter === 'all' || item.category === selectedFilter;
    }

    // Словник транслітерації та англійських синонімів
    const translitKeywords: Record<string, string> = {
      'pizza': 'піц',
      'pitsa': 'піц',
      'steak': 'стейк',
      'steyk': 'стейк',
      'salad': 'салат',
      'salat': 'салат',
      'burger': 'бургер',
      'big mac': 'бургер',
      'pasta': 'паст',
      'salmon': 'лосос',
      'tuna': 'тунець',
      'chicken': 'курк',
      'turkey': 'індич',
      'omelet': 'омлет',
      'egg': 'яйц',
      'soup': 'суп',
      'syrnyky': 'сирник',
      'croissant': 'круас',
      'snack': 'снек',
      'nuts': 'горіх'
    };

    let mappedUkrainianStem = '';
    for (const [eng, ua] of Object.entries(translitKeywords)) {
      if (q.includes(eng)) {
        mappedUkrainianStem = ua;
        break;
      }
    }

    // Крос-мовний онтологічний резолвер (ES, EN, UK, FR, IT, DE, PL)
    const crossEntity = resolveCrossLingualEntity(q);
    let matchesOntology = false;
    if (crossEntity) {
      if (crossEntity.id === 'chicken') {
        matchesOntology = item.name.toLowerCase().includes('курк') || item.name.toLowerCase().includes('chicken') || item.name.toLowerCase().includes('pollo') || item.shortDesc.toLowerCase().includes('курк');
      } else if (crossEntity.id === 'tortilla') {
        matchesOntology = item.name.toLowerCase().includes('тортиль') || item.name.toLowerCase().includes('tortilla');
      } else if (crossEntity.id === 'gazpacho') {
        matchesOntology = item.name.toLowerCase().includes('гаспач') || item.name.toLowerCase().includes('gazpacho');
      } else if (crossEntity.id === 'croissant') {
        matchesOntology = item.name.toLowerCase().includes('круас') || item.name.toLowerCase().includes('croissant');
      } else if (crossEntity.id === 'pasta_fagioli') {
        matchesOntology = item.name.toLowerCase().includes('фаджол') || item.name.toLowerCase().includes('fagioli') || item.name.toLowerCase().includes('квасол');
      } else if (crossEntity.id === 'jamon') {
        matchesOntology = item.name.toLowerCase().includes('хамон') || item.name.toLowerCase().includes('jamon') || item.name.toLowerCase().includes('jamón');
      } else if (crossEntity.id === 'yogurt_protein') {
        matchesOntology = item.name.toLowerCase().includes('йогурт') || item.name.toLowerCase().includes('hacendado') || item.name.toLowerCase().includes('протеїн');
      } else if (crossEntity.id === 'beef_steak') {
        matchesOntology = item.name.toLowerCase().includes('стейк') || item.name.toLowerCase().includes('яловичин') || item.name.toLowerCase().includes('beef') || item.name.toLowerCase().includes('steak') || item.name.toLowerCase().includes('ternera');
      } else if (crossEntity.id === 'salmon') {
        matchesOntology = item.name.toLowerCase().includes('лосос') || item.name.toLowerCase().includes('salmon') || item.name.toLowerCase().includes('salmón');
      } else if (crossEntity.id === 'pizza') {
        matchesOntology = item.name.toLowerCase().includes('піц') || item.name.toLowerCase().includes('pizza');
      } else if (crossEntity.id === 'burger') {
        matchesOntology = item.name.toLowerCase().includes('бургер') || item.name.toLowerCase().includes('мак') || item.name.toLowerCase().includes('burger');
      } else if (crossEntity.id === 'eggs') {
        matchesOntology = item.name.toLowerCase().includes('яйц') || item.name.toLowerCase().includes('омлет') || item.name.toLowerCase().includes('egg') || item.name.toLowerCase().includes('huevo');
      }
    }

    const matchesSearch =
      matchesOntology ||
      item.name.toLowerCase().includes(q) ||
      item.shortDesc.toLowerCase().includes(q) ||
      item.categoryLabel.toLowerCase().includes(q) ||
      (mappedUkrainianStem && (item.name.toLowerCase().includes(mappedUkrainianStem) || item.shortDesc.toLowerCase().includes(mappedUkrainianStem))) ||
      (q.includes('піц') && item.name.toLowerCase().includes('піц')) ||
      (q.includes('снек') && (item.category === 'snack' || item.name.toLowerCase().includes('снек'))) ||
      (q.includes('горіх') && (item.name.toLowerCase().includes('горіх') || item.shortDesc.toLowerCase().includes('горіх') || item.name.toLowerCase().includes('мигдал'))) ||
      (q.includes('салат') && (item.name.toLowerCase().includes('салат') || item.shortDesc.toLowerCase().includes('салат'))) ||
      (q.includes('бургер') || q.includes('мак') || q.includes('біг') ? item.name.toLowerCase().includes('бургер') || item.name.toLowerCase().includes('мак') : false) ||
      (q.includes('круас') && item.name.toLowerCase().includes('круас')) ||
      (item.ingredients && item.ingredients.some(ing => ing.name.toLowerCase().includes(q) || (mappedUkrainianStem && ing.name.toLowerCase().includes(mappedUkrainianStem))));

    return matchesSearch;
  });

  // Додавання страви з каталогу в розклад
  const handleAddCatalogItem = (item: ChefDishItem) => {
    const defaultTime = item.category === 'breakfast' ? '08:30' :
                        item.category === 'lunch' ? '13:00' :
                        item.category === 'snack' ? '11:00' : '19:30';

    onAddDishToDay(item.category, {
      name: item.name,
      weightGrams: item.weightGrams,
      macros: item.macros,
      timestamp: defaultTime
    });

    setAddedDishId(item.id);
    setTimeout(() => {
      setAddedDishId(null);
      onClose();
    }, 900);
  };

  // Додавання страви з детального перегляду (Preview Modal)
  const handleAddPreviewDish = () => {
    if (!selectedDishPreview) return;
    const defaultTime = previewTargetSlot === 'breakfast' ? '08:30' :
                        previewTargetSlot === 'lunch' ? '13:00' :
                        previewTargetSlot === 'snack' ? '16:00' : '19:30';

    onAddDishToDay(previewTargetSlot, {
      name: selectedDishPreview.name,
      weightGrams: selectedDishPreview.weightGrams,
      macros: selectedDishPreview.macros,
      timestamp: defaultTime
    });

    setIsPreviewAdded(true);
    setTimeout(() => {
      setIsPreviewAdded(false);
      setSelectedDishPreview(null);
      onClose();
    }, 900);
  };

  // Робота AI Парсера
  const handleParseVideo = (urlToParse: string, hint?: string) => {
    setIsParsing(true);
    setAddedMealSlot(null);
    const effectiveHint = hint !== undefined ? hint : videoDishHint;
    setTimeout(() => {
      const res = parseRecipeFromUrl(urlToParse, effectiveHint, 2);
      setParsedRecipe(res);
      setIsParsing(false);
    }, 350);
  };

  const handleAddParsedToSlot = (slot: MealType) => {
    if (!parsedRecipe) return;
    const defaultTime = slot === 'breakfast' ? '08:30' :
                        slot === 'lunch' ? '13:00' :
                        slot === 'snack' ? '16:30' : '19:30';

    onAddDishToDay(slot, {
      name: parsedRecipe.title,
      weightGrams: Math.round(parsedRecipe.totalWeightGrams / parsedRecipe.servings),
      macros: parsedRecipe.macrosPerServing,
      timestamp: defaultTime
    });

    setAddedMealSlot(slot);
    setTimeout(() => {
      setAddedMealSlot(null);
      onClose();
    }, 900);
  };

  // Робота Розумного тексту (Natural Language)
  const handleSmartTextRecognize = () => {
    const parsed = parseSmartDish(smartInputText, parseFloat(smartWeight) || 210);
    setSmartCalculated(parsed.macrosPerServing);
  };

  // Сканування / пошук товару за штрих-кодом (Stage 5.4)
  const handlePerformBarcodeScan = async (code: string) => {
    const targetCode = (code || barcodeInput).trim();
    if (!targetCode) return;

    setIsBarcodeLoading(true);
    setBarcodeError(null);

    try {
      const result = await lookupBarcode(targetCode);
      setIsBarcodeLoading(false);

      if (result.success && result.product) {
        setScannedProduct(result.product);
        setBarcodeGrams(result.product.servingGrams || 100);
        setBarcodeInput(result.product.barcode);
      } else {
        setBarcodeError(result.error || 'Не вдалося знайти товар за цим штрих-кодом.');
      }
    } catch (e: any) {
      setIsBarcodeLoading(false);
      setBarcodeError('Сталася помилка при зверненні до сервісу штрих-кодів.');
    }
  };

  // Додавання розпізнаного товару зі штрих-коду в розклад
  const handleAddScannedProduct = () => {
    if (!scannedProduct) return;
    const macros = calculatePortionMacros(scannedProduct, barcodeGrams);

    const defaultTime = barcodeTargetSlot === 'breakfast' ? '08:30' :
                        barcodeTargetSlot === 'lunch' ? '13:00' :
                        barcodeTargetSlot === 'snack' ? '11:00' : '19:30';

    onAddDishToDay(barcodeTargetSlot, {
      name: `${scannedProduct.name}${scannedProduct.brand ? ` (${scannedProduct.brand})` : ''}`,
      weightGrams: macros.grams,
      macros: {
        calories: macros.calories,
        protein: macros.protein,
        fat: macros.fat,
        carbs: macros.carbs
      },
      timestamp: barcodeTargetTime || defaultTime
    });

    setIsAddedFromBarcode(true);
    setTimeout(() => {
      setIsAddedFromBarcode(false);
      onClose();
    }, 850);
  };

  const handleAddSmartTextDish = () => {
    const macros = smartCalculated || {
      calories: Math.round((parseFloat(smartWeight) || 200) * 1.8),
      protein: Math.round((parseFloat(smartWeight) || 200) * 0.12),
      fat: Math.round((parseFloat(smartWeight) || 200) * 0.08),
      carbs: Math.round((parseFloat(smartWeight) || 200) * 0.15)
    };

    onAddDishToDay(smartMealType, {
      name: smartInputText.trim() || 'Корисна страва',
      weightGrams: parseFloat(smartWeight) || 200,
      macros,
      timestamp: smartTime
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3.5 animate-fadeIn">
      {/* Окремий бекдроп для закриття тапом збоку */}
      <div
        id="chef-hub-backdrop"
        className="absolute inset-0 bg-black/85 backdrop-blur-md cursor-pointer"
        onClick={onClose}
      />
      <div
        className="w-full max-w-sm rounded-[32px] bg-[#101612]/98 border border-white/10 text-white relative z-10 max-h-[92vh] flex flex-col shadow-[0_25px_60px_rgba(0,0,0,0.9)] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ШАПКА ХАБУ */}
        <div className="p-4 pb-3 border-b border-white/10 flex items-center justify-between shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-extrabold text-amber-400 uppercase tracking-wider block">
                Центр створення раціону
              </span>
              {targetDate && (
                <span className="text-[9.5px] font-bold text-emerald-300 bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <Calendar className="w-2.5 h-2.5" />
                  {targetDate}
                </span>
              )}
            </div>
            <h3 className="text-base font-black text-white tracking-tight">Шеф-Хаб NUTRIQ</h3>
          </div>

          <button
            id="btn-close-chef-hub"
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-zinc-300 hover:text-white transition-all active:scale-95"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 4 ГОЛОВНІ РЕЖИМИ ШЕФ-ХАБУ */}
        <div className="grid grid-cols-4 gap-1 p-1.5 bg-black/40 border-b border-white/10 shrink-0 text-[11px]">
          <button
            id="tab-chef-catalog"
            type="button"
            onClick={() => setActiveTab('catalog')}
            className={`py-2 px-1 rounded-xl font-bold flex flex-col items-center justify-center gap-0.5 transition-all ${
              activeTab === 'catalog'
                ? 'bg-amber-400 text-zinc-950 shadow-md shadow-amber-400/20'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span className="truncate">Меню</span>
          </button>

          <button
            id="tab-chef-barcode"
            type="button"
            onClick={() => setActiveTab('barcode')}
            className={`py-2 px-1 rounded-xl font-bold flex flex-col items-center justify-center gap-0.5 transition-all ${
              activeTab === 'barcode'
                ? 'bg-amber-400 text-zinc-950 shadow-md shadow-amber-400/20'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Barcode className="w-3.5 h-3.5" />
            <span className="truncate">Штрих-код</span>
          </button>

          <button
            id="tab-chef-parser"
            type="button"
            onClick={() => setActiveTab('ai_parser')}
            className={`py-2 px-1 rounded-xl font-bold flex flex-col items-center justify-center gap-0.5 transition-all ${
              activeTab === 'ai_parser'
                ? 'bg-amber-400 text-zinc-950 shadow-md shadow-amber-400/20'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Link2 className="w-3.5 h-3.5" />
            <span className="truncate">AI Імпорт</span>
          </button>

          <button
            id="tab-chef-smart"
            type="button"
            onClick={() => setActiveTab('smart_text')}
            className={`py-2 px-1 rounded-xl font-bold flex flex-col items-center justify-center gap-0.5 transition-all ${
              activeTab === 'smart_text'
                ? 'bg-amber-400 text-zinc-950 shadow-md shadow-amber-400/20'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span className="truncate">Вільний</span>
          </button>
        </div>

        {/* ОСНОВНИЙ КОНТЕНТ (СКРОЛИТЬСЯ) */}
        <div className="p-4 overflow-y-auto flex-1 space-y-3.5">
          {/* ========================================================= */}
          {/* РЕЖИМ 1: КАТАЛОГ МЕНЮ ШЕФА (50 ГОТОВИХ ПОЗИЦІЙ) */}
          {/* ========================================================= */}
          {activeTab === 'catalog' && (
            <div className="space-y-3 animate-fadeIn">
              {/* Пошук */}
              <div className="relative">
                <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  id="chef-catalog-search-input"
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Пошук страви (сирники, pizza, стейк...)"
                  className="w-full pl-9 pr-3.5 py-2 rounded-xl bg-black/50 border border-white/10 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-400"
                />
              </div>

              {/* Фільтри категорій */}
              <div className="flex items-center gap-1 overflow-x-auto pb-1 no-scrollbar">
                {[
                  { id: 'all', label: 'Всі' },
                  { id: 'breakfast', label: 'Сніданки' },
                  { id: 'lunch', label: 'Обіди' },
                  { id: 'snack', label: 'Перекуси' },
                  { id: 'dinner', label: 'Вечері' }
                ].map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => setSelectedFilter(f.id as typeof selectedFilter)}
                    className={`px-2.5 py-1 rounded-lg text-[10.5px] font-bold whitespace-nowrap transition-all ${
                      selectedFilter === f.id
                        ? 'bg-amber-400/20 text-amber-300 border border-amber-400/40'
                        : 'bg-white/5 text-zinc-400 hover:text-white border border-white/5'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>

              {/* Список карток */}
              <div className="space-y-2.5">
                {filteredCatalog.map((item) => {
                  const isAdded = addedDishId === item.id;
                  const isLocked = item.tier === 'pro' && !isProUser;

                  return (
                    <div
                      key={item.id}
                      id={`chef-dish-${item.id}`}
                      onClick={() => {
                        if (isLocked) {
                          setProPaywallDish(item);
                        } else {
                          setSelectedDishPreview(item);
                          setPreviewTargetSlot(item.category);
                        }
                      }}
                      className={`p-2.5 rounded-2xl bg-black/40 border transition-all cursor-pointer active:scale-[0.99] group flex items-center gap-3 ${
                        isLocked
                          ? 'border-amber-400/25 hover:border-amber-400/60 bg-gradient-to-r from-black/60 to-amber-950/10'
                          : 'border-white/10 hover:border-amber-400/40'
                      }`}
                    >
                      {/* Міні-фото */}
                      <div className="w-16 h-16 rounded-xl overflow-hidden bg-black shrink-0 relative">
                        <img
                          src={item.photo}
                          alt={item.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          onError={(e) => {
                            (e.currentTarget as HTMLImageElement).src = '/dinner_steak_hd.jpg';
                          }}
                        />
                        <span className="absolute bottom-1 right-1 text-[8px] font-black bg-black/70 px-1 rounded text-amber-300">
                          {item.prepTime}
                        </span>
                        {isLocked && (
                          <div className="absolute inset-0 bg-black/35 backdrop-blur-[0.5px] flex items-center justify-center">
                            <Lock className="w-4 h-4 text-amber-300 drop-shadow-[0_0_6px_rgba(245,158,11,0.8)]" />
                          </div>
                        )}
                      </div>

                      {/* Текст страви */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.2 rounded bg-amber-400/15 text-amber-300 border border-amber-400/30">
                            {item.categoryLabel}
                          </span>
                          {isLocked ? (
                            <span className="text-[9px] font-black uppercase px-1.5 py-0.2 rounded bg-gradient-to-r from-amber-500/20 to-amber-400/30 text-amber-300 border border-amber-400/50 flex items-center gap-0.5">
                              <Crown className="w-2.5 h-2.5" /> PRO
                            </span>
                          ) : (
                            <span className="text-[10px] text-zinc-500 font-semibold">{item.weightGrams}г</span>
                          )}
                        </div>

                        <h4 className="text-xs font-bold text-white truncate mt-0.5 group-hover:text-amber-300 transition-colors">
                          {item.name}
                        </h4>

                        {isLocked ? (
                          <div className="text-[10px] text-amber-300/80 font-bold flex items-center gap-1 mt-0.5">
                            <Lock className="w-3 h-3 text-amber-400 shrink-0" />
                            <span>PRO • КБЖВ та рецепт приховано</span>
                          </div>
                        ) : (
                          <div className="text-[10px] text-zinc-400 flex items-center gap-1.5 mt-0.5">
                            <span className="text-amber-300 font-black">{item.macros.calories} ккал</span>
                            <span>•</span>
                            <span className="text-emerald-400">{item.macros.protein}г Б</span>
                            <span>•</span>
                            <span className="text-amber-400">{item.macros.fat}г Ж</span>
                          </div>
                        )}
                      </div>

                      {/* Кнопка швидкого додавання в розклад або замок PRO */}
                      {isLocked ? (
                        <button
                          id={`btn-chef-lock-${item.id}`}
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setProPaywallDish(item);
                          }}
                          className="p-2.5 rounded-xl bg-amber-400/10 hover:bg-amber-400/25 border border-amber-400/40 text-amber-300 flex items-center justify-center transition-all shrink-0 active:scale-95 shadow-sm"
                          title="Ресторанна страва Шефа (PRO)"
                        >
                          <Lock className="w-4 h-4 stroke-[2.5]" />
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAddCatalogItem(item);
                          }}
                          className={`p-2.5 rounded-xl text-xs font-bold flex items-center justify-center transition-all shrink-0 active:scale-95 ${
                            isAdded
                              ? 'bg-emerald-500 text-zinc-950'
                              : 'bg-gradient-to-r from-amber-400 to-amber-500 text-zinc-950 shadow-md shadow-amber-400/20 hover:brightness-110'
                          }`}
                          title="Швидко додати в розклад"
                        >
                          {isAdded ? (
                            <Check className="w-4 h-4 stroke-[3]" />
                          ) : (
                            <Plus className="w-4 h-4 stroke-[3]" />
                          )}
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* РЕЖИМ 2: СКАНЕР ШТРИХ-КОДІВ (OPEN FOOD FACTS & СУПЕРМАРКЕТИ) */}
          {/* ========================================================= */}
          {activeTab === 'barcode' && (
            <div className="space-y-3.5 animate-fadeIn">
              {/* Інфо-банер */}
              <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-200 flex items-start gap-2.5">
                <ScanLine className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <div className="font-extrabold text-emerald-300">Камера & Open Food Facts API</div>
                  <div className="text-[11px] text-emerald-200/80 mt-0.5">
                    Скануйте штрих-код будь-якого упакованого продукту (Mercadona, Carrefour, Lidl, Сільпо та 3+ млн продуктів світу).
                  </div>
                </div>
              </div>

              {/* Відображення видошукача камери */}
              <div className="relative rounded-2xl border border-white/15 bg-black/60 p-4 overflow-hidden flex flex-col items-center justify-center min-h-[140px] shadow-inner">
                {/* Кутові рамки сканера */}
                <div className="absolute top-2.5 left-2.5 w-4 h-4 border-t-2 border-l-2 border-amber-400 rounded-tl-sm" />
                <div className="absolute top-2.5 right-2.5 w-4 h-4 border-t-2 border-r-2 border-amber-400 rounded-tr-sm" />
                <div className="absolute bottom-2.5 left-2.5 w-4 h-4 border-b-2 border-l-2 border-amber-400 rounded-bl-sm" />
                <div className="absolute bottom-2.5 right-2.5 w-4 h-4 border-b-2 border-r-2 border-amber-400 rounded-br-sm" />

                {/* Анімований неоновий лазерний промінь */}
                <div className="absolute inset-x-6 top-1/2 -translate-y-1/2 h-[2px] bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_12px_#34d399] animate-pulse pointer-events-none" />

                <Barcode className="w-10 h-10 text-zinc-500/60 mb-1" />
                <span className="text-[11px] font-bold text-zinc-300 text-center">
                  {isCameraActive ? '📷 Камера активна: наведіть на штрих-код' : 'Наведіть камеру на штрих-код товару (EAN-13 / EAN-8)'}
                </span>

                <button
                  id="btn-toggle-camera-scanner"
                  type="button"
                  onClick={() => setIsCameraActive(!isCameraActive)}
                  className="mt-2.5 px-3 py-1 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 text-[10.5px] font-bold text-white flex items-center gap-1.5 transition-all"
                >
                  <Camera className="w-3.5 h-3.5 text-amber-400" />
                  <span>{isCameraActive ? 'Вимкнути камеру' : 'Увімкнути камеру смартфона'}</span>
                </button>
              </div>

              {/* Швидкі 1-тап пресети перевірених товарів */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">
                  Швидкі штрих-коди (Mercadona / UA / Global):
                </label>
                <div className="flex flex-wrap gap-1.5">
                  <button
                    id="btn-preset-hacendado-yogurt"
                    type="button"
                    onClick={() => {
                      setBarcodeInput('8480000123456');
                      handlePerformBarcodeScan('8480000123456');
                    }}
                    className="px-2 py-1 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-[10.5px] font-bold text-emerald-300"
                  >
                    🇪🇸 +Proteínas Mercadona
                  </button>

                  <button
                    id="btn-preset-hacendado-queso"
                    type="button"
                    onClick={() => {
                      setBarcodeInput('8480000204780');
                      handlePerformBarcodeScan('8480000204780');
                    }}
                    className="px-2 py-1 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-[10.5px] font-bold text-emerald-300"
                  >
                    🇪🇸 Queso 0% Hacendado
                  </button>

                  <button
                    id="btn-preset-avena-mercadona"
                    type="button"
                    onClick={() => {
                      setBarcodeInput('8410076472092');
                      handlePerformBarcodeScan('8410076472092');
                    }}
                    className="px-2 py-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-[10.5px] font-bold text-zinc-300"
                  >
                    🇪🇸 Вівсянка Mercadona
                  </button>

                  <button
                    id="btn-preset-yagotynsky"
                    type="button"
                    onClick={() => {
                      setBarcodeInput('4823000914872');
                      handlePerformBarcodeScan('4823000914872');
                    }}
                    className="px-2 py-1 rounded-lg bg-blue-500/15 hover:bg-blue-500/25 border border-blue-500/30 text-[10.5px] font-bold text-blue-300"
                  >
                    🇺🇦 Сир 5% Яготинський
                  </button>

                  <button
                    id="btn-preset-grechka"
                    type="button"
                    onClick={() => {
                      setBarcodeInput('4820000000001');
                      handlePerformBarcodeScan('4820000000001');
                    }}
                    className="px-2 py-1 rounded-lg bg-blue-500/15 hover:bg-blue-500/25 border border-blue-500/30 text-[10.5px] font-bold text-blue-300"
                  >
                    🇺🇦 Гречка відбірна
                  </button>

                  <button
                    id="btn-preset-coca-cola-zero"
                    type="button"
                    onClick={() => {
                      setBarcodeInput('5449000131805');
                      handlePerformBarcodeScan('5449000131805');
                    }}
                    className="px-2 py-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-[10.5px] font-bold text-zinc-300"
                  >
                    🌍 Coca-Cola Zero
                  </button>
                </div>
              </div>

              {/* Поле ручного введення штрих-коду */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">
                  Номер штрих-коду (8-14 цифр):
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Barcode className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      id="input-manual-barcode"
                      type="text"
                      value={barcodeInput}
                      onChange={(e) => setBarcodeInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handlePerformBarcodeScan(barcodeInput)}
                      placeholder="Введіть код, напр. 8480000123456"
                      className="w-full pl-9 pr-3 py-2 rounded-xl bg-black/60 border border-white/15 text-xs font-mono font-bold text-white placeholder-zinc-500 focus:outline-none focus:border-amber-400"
                    />
                  </div>
                  <button
                    id="btn-search-barcode"
                    type="button"
                    disabled={isBarcodeLoading}
                    onClick={() => handlePerformBarcodeScan(barcodeInput)}
                    className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 font-bold text-xs text-zinc-950 transition-all flex items-center justify-center shrink-0 disabled:opacity-50"
                  >
                    {isBarcodeLoading ? (
                      <div className="w-3.5 h-3.5 border-2 border-zinc-950 border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <span>Знайти</span>
                    )}
                  </button>
                </div>
              </div>

              {/* Повідомлення про помилку */}
              {barcodeError && (
                <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/25 text-xs text-rose-300 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                  <span>{barcodeError}</span>
                </div>
              )}

              {/* Картка знайденого товару */}
              {scannedProduct && (
                <div className="p-3.5 rounded-2xl bg-[#0a0f0c] border border-amber-400/30 text-white space-y-3 shadow-lg animate-fadeIn">
                  <div className="flex gap-3 items-center">
                    {scannedProduct.imageUrl ? (
                      <img
                        src={scannedProduct.imageUrl}
                        alt={scannedProduct.name}
                        className="w-14 h-14 rounded-xl object-cover border border-white/10 bg-black/40 shrink-0"
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).src = '/dinner_steak_hd.jpg';
                        }}
                      />
                    ) : (
                      <div className="w-14 h-14 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0 text-zinc-500">
                        <Barcode className="w-6 h-6 text-amber-400" />
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {scannedProduct.brand && (
                          <span className="text-[10px] font-black uppercase text-amber-300 bg-amber-400/15 border border-amber-400/30 px-1.5 py-0.5 rounded">
                            {scannedProduct.brand}
                          </span>
                        )}
                        <span className="text-[9.5px] font-medium text-zinc-400">
                          {scannedProduct.source === 'offline_preset' ? '🟢 Офлайн-каталог' : '🌐 Open Food Facts'}
                        </span>
                      </div>
                      <h4 className="text-xs font-bold text-white truncate mt-0.5">
                        {scannedProduct.name}
                      </h4>
                      <p className="text-[10px] text-zinc-400 font-mono">
                        EAN: {scannedProduct.barcode}
                      </p>
                    </div>
                  </div>

                  {/* Вибір грамів порції */}
                  <div className="p-2.5 rounded-xl bg-black/50 border border-white/10 space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-zinc-400 font-bold">Розмір порції:</span>
                      <div className="flex items-center gap-1">
                        <input
                          id="input-barcode-grams"
                          type="number"
                          min="1"
                          max="2000"
                          value={barcodeGrams}
                          onChange={(e) => setBarcodeGrams(Math.max(1, parseFloat(e.target.value) || 100))}
                          className="w-16 px-2 py-0.5 rounded-lg bg-black/70 border border-amber-400/40 text-center text-xs font-black text-amber-300 focus:outline-none"
                        />
                        <span className="text-xs font-bold text-zinc-400">г</span>
                      </div>
                    </div>

                    {/* Швидкі кнопки розміру порції */}
                    <div className="grid grid-cols-4 gap-1 text-[10px]">
                      {[50, 100, 150, 200].map((g) => (
                        <button
                          key={g}
                          type="button"
                          onClick={() => setBarcodeGrams(g)}
                          className={`py-1 rounded-lg font-bold border transition-all ${
                            barcodeGrams === g
                              ? 'bg-amber-400 text-zinc-950 border-amber-400'
                              : 'bg-white/5 text-zinc-300 border-white/5 hover:text-white'
                          }`}
                        >
                          {g}г
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Розраховані макроси на вибрані грами */}
                  {(() => {
                    const macros = calculatePortionMacros(scannedProduct, barcodeGrams);
                    return (
                      <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs flex items-center justify-between">
                        <div>
                          <div className="text-[10px] font-bold text-emerald-300">
                            КБЖВ на {macros.grams}г:
                          </div>
                          <div className="text-[11px] text-zinc-300 mt-0.5">
                            <span className="text-emerald-400 font-bold">{macros.protein}г</span> Білки •{' '}
                            <span className="text-amber-400 font-bold">{macros.fat}г</span> Жири •{' '}
                            <span className="text-cyan-400 font-bold">{macros.carbs}г</span> Вуглеводи
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="text-base font-black text-white">{macros.calories}</span>
                          <span className="text-[10px] font-bold text-zinc-400 ml-1">ккал</span>
                        </div>
                      </div>
                    );
                  })()}

                  {/* Вибір прийому їжі */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">
                      Додати в прийом:
                    </label>
                    <div className="grid grid-cols-4 gap-1 text-[10.5px]">
                      {[
                        { id: 'breakfast', label: 'Сніданок', time: '08:30' },
                        { id: 'lunch', label: 'Обід', time: '13:00' },
                        { id: 'snack', label: 'Перекус', time: '11:00' },
                        { id: 'dinner', label: 'Вечеря', time: '19:30' }
                      ].map((slot) => (
                        <button
                          key={slot.id}
                          type="button"
                          onClick={() => {
                            setBarcodeTargetSlot(slot.id as MealType);
                            setBarcodeTargetTime(slot.time);
                          }}
                          className={`py-1.5 rounded-xl font-bold border transition-all ${
                            barcodeTargetSlot === slot.id
                              ? 'bg-amber-400 text-zinc-950 border-amber-400 shadow-sm'
                              : 'bg-white/5 text-zinc-400 border-white/5 hover:text-white'
                          }`}
                        >
                          {slot.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Кнопка додавання у щоденник */}
                  <button
                    id="btn-add-scanned-product"
                    type="button"
                    onClick={handleAddScannedProduct}
                    className="w-full py-2.5 rounded-xl font-black text-xs text-zinc-950 bg-gradient-to-r from-amber-400 to-amber-500 shadow-md flex items-center justify-center gap-1.5 active:scale-95 transition-all"
                  >
                    {isAddedFromBarcode ? (
                      <>
                        <Check className="w-4 h-4 text-zinc-950 stroke-[3]" />
                        <span>Додано в щоденник!</span>
                      </>
                    ) : (
                      <>
                        <Plus className="w-4 h-4 text-zinc-950 stroke-[3]" />
                        <span>
                          Додати {barcodeGrams}г ({calculatePortionMacros(scannedProduct, barcodeGrams).calories} ккал)
                        </span>
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* ========================================================= */}
          {/* РЕЖИМ 3: AI ІМПОРТ З TIKTOK / REELS / ПОСИЛАННЯ */}
          {/* ========================================================= */}
          {activeTab === 'ai_parser' && (
            <div className="space-y-3.5 animate-fadeIn">
              <div className="p-3 rounded-2xl bg-amber-400/10 border border-amber-400/20 text-xs text-amber-200 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Вставте посилання на відео з рецептом, і ШІ автоматично розпізнає тарілку.</span>
              </div>

              {/* Зразки */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">
                  Швидкі приклади:
                </label>
                <div className="flex flex-wrap gap-1.5">
                  <button
                    id="btn-example-crepes"
                    type="button"
                    onClick={() => {
                      setParserUrl('https://www.tiktok.com/@chef/video/crepes-with-meat');
                      setVideoDishHint('крепси з м’ясом');
                      handleParseVideo('https://www.tiktok.com/@chef/video/crepes-with-meat', 'крепси з м’ясом');
                    }}
                    className="px-2.5 py-1 rounded-xl bg-amber-400/15 hover:bg-amber-400/25 border border-amber-400/30 text-[10.5px] font-bold text-amber-300"
                  >
                    🥞 TikTok: Крепси з м'ясом
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setParserUrl('https://www.tiktok.com/@chef/video/pasta-shrimp-spinach');
                      setVideoDishHint('паста з креветками');
                      handleParseVideo('https://www.tiktok.com/@chef/video/pasta-shrimp-spinach', 'паста з креветками');
                    }}
                    className="px-2.5 py-1 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-[10.5px] font-bold text-zinc-300 hover:text-white"
                  >
                    🍝 TikTok: Паста з креветками
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setParserUrl('https://www.instagram.com/reels/protein-oat-pancakes');
                      setVideoDishHint('панкейки');
                      handleParseVideo('https://www.instagram.com/reels/protein-oat-pancakes', 'панкейки');
                    }}
                    className="px-2.5 py-1 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-[10.5px] font-bold text-zinc-300 hover:text-white"
                  >
                    🥞 Reels: Панкейки
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setParserUrl('https://www.tiktok.com/@healthy/video/salmon-quinoa-bowl');
                      setVideoDishHint('лососевий боул');
                      handleParseVideo('https://www.tiktok.com/@healthy/video/salmon-quinoa-bowl', 'лососевий боул');
                    }}
                    className="px-2.5 py-1 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-[10.5px] font-bold text-zinc-300 hover:text-white"
                  >
                    🥗 TikTok: Лососевий боул
                  </button>
                </div>
              </div>

              {/* Поле вводу посилання та уточнення страви */}
              <div className="space-y-2">
                <div>
                  <label className="block text-[10.5px] font-bold text-zinc-300 uppercase tracking-wider mb-1">
                    Посилання на відео (TikTok / Reels / YouTube):
                  </label>
                  <input
                    type="text"
                    value={parserUrl}
                    onChange={(e) => setParserUrl(e.target.value)}
                    placeholder="https://www.tiktok.com/@..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-white/15 text-xs font-bold text-white placeholder-zinc-500 focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="block text-[10.5px] font-bold text-zinc-300 uppercase tracking-wider mb-1 flex items-center justify-between">
                    <span>Назва страви з відео (якщо коротке посилання):</span>
                    <span className="text-[9.5px] text-zinc-500 font-normal">необов’язково</span>
                  </label>
                  <input
                    type="text"
                    value={videoDishHint}
                    onChange={(e) => setVideoDishHint(e.target.value)}
                    placeholder="Наприклад: крепси з м'ясом, вівсянка, шаурма..."
                    className="w-full px-3.5 py-2 rounded-xl bg-black/60 border border-white/15 text-xs font-bold text-white placeholder-zinc-500 focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <button
                id="btn-parse-video"
                type="button"
                onClick={() => handleParseVideo(parserUrl, videoDishHint)}
                disabled={isParsing}
                className="w-full py-2.5 rounded-xl font-black text-xs text-zinc-950 bg-gradient-to-r from-amber-400 to-amber-500 shadow-md flex items-center justify-center gap-1.5 active:scale-95 transition-all"
              >
                <Sparkles className="w-3.5 h-3.5 text-zinc-950" />
                <span>{isParsing ? 'Розпізнавання та розрахунок...' : 'Розпізнати КБЖВ з відео'}</span>
              </button>

              {/* Результат розпізнавання */}
              {parsedRecipe && (
                <div className="p-3.5 rounded-2xl bg-black/50 border border-emerald-500/30 space-y-3 animate-fadeIn">
                  <div className="flex items-center justify-between pb-2 border-b border-white/10">
                    <div>
                      <span className="text-[9.5px] font-bold text-emerald-400 bg-emerald-500/15 px-2 py-0.5 rounded-full uppercase">
                        Розпізнано
                      </span>
                      <h4 className="text-xs font-bold text-white mt-1">{parsedRecipe.title}</h4>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-zinc-400 block">1 порція</span>
                      <span className="text-sm font-black text-amber-300">{parsedRecipe.macrosPerServing.calories} ккал</span>
                    </div>
                  </div>

                  <div className="p-2.5 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-xs font-bold text-white flex items-center justify-between">
                    <span className="text-emerald-400 flex items-center gap-1">
                      <Layers className="w-3.5 h-3.5" /> Макроси:
                    </span>
                    <span>
                      {parsedRecipe.macrosPerServing.protein}г Б • {parsedRecipe.macrosPerServing.fat}г Ж • {parsedRecipe.macrosPerServing.carbs}г В
                    </span>
                  </div>

                  {/* Кнопки додавання */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">
                      Додати порцію в розклад:
                    </label>
                    <div className="grid grid-cols-4 gap-1.5">
                      {(['breakfast', 'lunch', 'snack', 'dinner'] as MealType[]).map((slot) => {
                        const labels: Record<MealType, string> = {
                          breakfast: 'Сніданок',
                          lunch: 'Обід',
                          snack: 'Перекус',
                          dinner: 'Вечеря'
                        };
                        const isAdded = addedMealSlot === slot;

                        return (
                          <button
                            key={slot}
                            type="button"
                            onClick={() => handleAddParsedToSlot(slot)}
                            className={`py-2 rounded-xl text-[10.5px] font-bold transition-all flex flex-col items-center justify-center active:scale-95 ${
                              isAdded
                                ? 'bg-emerald-500 text-zinc-950'
                                : 'bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-200 hover:text-amber-300'
                            }`}
                          >
                            {isAdded ? (
                              <CheckCircle2 className="w-3.5 h-3.5 mb-0.5" />
                            ) : (
                              <span className="text-amber-400 font-black">+</span>
                            )}
                            <span>{labels[slot]}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {onSaveToRecipeBook && (
                    <button
                      type="button"
                      onClick={() => onSaveToRecipeBook(parsedRecipe)}
                      className="w-full py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold text-zinc-300 flex items-center justify-center gap-1.5 transition-all"
                    >
                      <BookmarkPlus className="w-3.5 h-3.5 text-amber-400" />
                      <span>Зберегти в кулінарну книгу</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          )}

          {/* ========================================================= */}
          {/* РЕЖИМ 3: ВІЛЬНИЙ РОЗУМНИЙ ТЕКСТ (NATURAL LANGUAGE) */}
          {/* ========================================================= */}
          {activeTab === 'smart_text' && (
            <div className="space-y-3.5 animate-fadeIn">
              <div className="p-3 rounded-2xl bg-amber-400/10 border border-amber-400/20 text-xs text-amber-200">
                Напишіть звичну назву страви (наприклад, <em>«тости з авокадо»</em> або <em>«вівсянка з бананом»</em>). Система сама розпізнає та порахує КБЖВ.
              </div>

              <div>
                <label className="block text-[10.5px] font-bold text-zinc-300 uppercase tracking-wider mb-1">
                  Назва страви:
                </label>
                <input
                  type="text"
                  value={smartInputText}
                  onChange={(e) => setSmartInputText(e.target.value)}
                  onBlur={handleSmartTextRecognize}
                  placeholder="Наприклад: Тости з авокадо та яйцем пашот"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-white/15 text-xs font-bold text-white placeholder-zinc-500 focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-[10.5px] font-bold text-zinc-300 mb-1">Вага (г):</label>
                  <input
                    type="number"
                    value={smartWeight}
                    onChange={(e) => setSmartWeight(e.target.value)}
                    className="w-full px-2.5 py-2 rounded-xl bg-black/60 border border-white/15 text-xs font-bold text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10.5px] font-bold text-zinc-300 mb-1">Категорія:</label>
                  <select
                    value={smartMealType}
                    onChange={(e) => setSmartMealType(e.target.value as MealType)}
                    className="w-full px-2 py-2 rounded-xl bg-black/60 border border-white/15 text-xs font-bold text-white focus:outline-none"
                  >
                    <option value="breakfast">Сніданок</option>
                    <option value="snack">Перекус</option>
                    <option value="lunch">Обід</option>
                    <option value="dinner">Вечеря</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10.5px] font-bold text-zinc-300 mb-1">Час:</label>
                  <input
                    type="time"
                    value={smartTime}
                    onChange={(e) => setSmartTime(e.target.value)}
                    className="w-full px-2 py-2 rounded-xl bg-black/60 border border-white/15 text-xs font-bold text-amber-300 focus:outline-none"
                  />
                </div>
              </div>

              <button
                id="btn-auto-calc-smart"
                type="button"
                onClick={handleSmartTextRecognize}
                className="w-full py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold text-amber-300 flex items-center justify-center gap-1.5 transition-all"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Авторозрахунок КБЖВ страви</span>
              </button>

              {smartCalculated && (
                <div className="p-3 rounded-2xl bg-black/40 border border-amber-400/30 text-xs space-y-1.5">
                  <div className="flex justify-between items-center text-zinc-300 font-bold">
                    <span>Розраховано на {smartWeight}г:</span>
                    <span className="text-amber-300 text-sm font-black">{smartCalculated.calories} ккал</span>
                  </div>
                  <div className="text-[11px] text-zinc-400">
                    {smartCalculated.protein}г Б • {smartCalculated.fat}г Ж • {smartCalculated.carbs}г В
                  </div>
                </div>
              )}

              <button
                id="btn-add-smart-dish"
                type="button"
                onClick={handleAddSmartTextDish}
                className="w-full py-2.5 rounded-xl font-black text-xs text-zinc-950 bg-gradient-to-r from-amber-400 to-amber-500 shadow-md flex items-center justify-center gap-1.5 active:scale-95 transition-all"
              >
                <Plus className="w-4 h-4 text-zinc-950 stroke-[3]" />
                <span>Додати в розклад на {smartTime}</span>
              </button>
            </div>
          )}
        </div>

        {/* ========================================================= */}
        {/* РЕЖИМ ПЕРЕГЛЯДУ СТРАВИ ТА РЕЦЕПТА (DISH RECIPE PREVIEW) */}
        {/* ========================================================= */}
        {selectedDishPreview && (
          <div className="absolute inset-0 bg-[#0d120f]/98 backdrop-blur-xl z-50 rounded-[32px] flex flex-col overflow-hidden animate-fadeIn">
            {/* Фото та шапка */}
            <div className="relative h-48 shrink-0 w-full overflow-hidden bg-black">
              <img
                src={selectedDishPreview.photo}
                alt={selectedDishPreview.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = '/dinner_steak_hd.jpg';
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0d120f] via-transparent to-black/70" />

              {/* Кнопка повернення/закриття */}
              <button
                type="button"
                onClick={() => setSelectedDishPreview(null)}
                className="absolute top-3 right-3 p-2 rounded-full bg-black/60 hover:bg-black/80 text-white backdrop-blur-md border border-white/10 transition-all z-10 active:scale-95"
                title="Закрити перегляд"
              >
                <X className="w-4 h-4" />
              </button>

              {/* Бейджі категорії та часу */}
              <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between">
                <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-amber-400 text-zinc-950 shadow-md">
                  {selectedDishPreview.categoryLabel}
                </span>
                <span className="text-[11px] font-bold text-amber-300 bg-black/80 px-2.5 py-0.5 rounded-lg border border-white/15 flex items-center gap-1">
                  <Clock className="w-3 h-3 text-amber-400" />
                  {selectedDishPreview.prepTime}
                </span>
              </div>
            </div>

            {/* Вміст перегляду зі скролом */}
            <div className="p-4 overflow-y-auto flex-1 space-y-3.5 text-xs">
              <div>
                <h3 className="text-base font-black text-white leading-tight">
                  {selectedDishPreview.name}
                </h3>
                <p className="text-zinc-400 text-xs mt-1 leading-relaxed">
                  {selectedDishPreview.shortDesc}
                </p>
              </div>

              {/* Cook-Loss примітка, якщо є */}
              {selectedDishPreview.cookLossNote && (
                <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 flex items-center gap-2">
                  <Scale className="w-4 h-4 shrink-0 text-amber-400" />
                  <span className="text-[11px] font-medium leading-tight">{selectedDishPreview.cookLossNote}</span>
                </div>
              )}

              {/* Якщо страва PRO і користувач на безкоштовному тарифі — показуємо PRO Замок */}
              {selectedDishPreview.tier === 'pro' && !isProUser ? (
                <div className="space-y-3.5 p-4 rounded-2xl bg-gradient-to-b from-amber-500/10 to-black/60 border border-amber-400/40 text-center animate-fadeIn">
                  <div className="w-12 h-12 rounded-2xl bg-amber-400/20 border border-amber-400/50 text-amber-300 flex items-center justify-center mx-auto shadow-[0_0_20px_rgba(245,158,11,0.3)]">
                    <Crown className="w-6 h-6 stroke-[2.4]" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-white tracking-tight uppercase">
                      Ресторанна страва Шефа (PRO)
                    </h3>
                    <p className="text-xs text-zinc-300 mt-1 leading-relaxed">
                      Точні макроси, розкладка інгредієнтів у грамах, облік Cook-Loss та покрокова шеф-інструкція доступні підписникам <strong>NUTRIQ PRO</strong>.
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-black/60 border border-white/10 text-[11px] text-zinc-400 flex items-center justify-center gap-2">
                    <Lock className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>КБЖВ та секрети приготування надійно захищені</span>
                  </div>
                </div>
              ) : (
                <>
                  {/* КБЖВ картки */}
                  <div className="grid grid-cols-4 gap-1.5">
                    <div className="p-2 rounded-xl bg-black/50 border border-white/5 text-center">
                      <div className="text-[9px] uppercase font-bold text-zinc-400">Калорії</div>
                      <div className="text-xs font-black text-amber-300 mt-0.5">{selectedDishPreview.macros.calories}</div>
                      <div className="text-[8px] text-zinc-500 font-bold">ккал</div>
                    </div>
                    <div className="p-2 rounded-xl bg-black/50 border border-emerald-500/20 text-center">
                      <div className="text-[9px] uppercase font-bold text-emerald-400">Білок</div>
                      <div className="text-xs font-black text-emerald-300 mt-0.5">{selectedDishPreview.macros.protein}г</div>
                      <div className="text-[8px] text-zinc-500 font-bold">{Math.round((selectedDishPreview.macros.protein * 4 / selectedDishPreview.macros.calories) * 100)}%</div>
                    </div>
                    <div className="p-2 rounded-xl bg-black/50 border border-amber-500/20 text-center">
                      <div className="text-[9px] uppercase font-bold text-amber-400">Жири</div>
                      <div className="text-xs font-black text-amber-300 mt-0.5">{selectedDishPreview.macros.fat}г</div>
                      <div className="text-[8px] text-zinc-500 font-bold">{Math.round((selectedDishPreview.macros.fat * 9 / selectedDishPreview.macros.calories) * 100)}%</div>
                    </div>
                    <div className="p-2 rounded-xl bg-black/50 border border-sky-500/20 text-center">
                      <div className="text-[9px] uppercase font-bold text-sky-400">Вуглеводи</div>
                      <div className="text-xs font-black text-sky-300 mt-0.5">{selectedDishPreview.macros.carbs}г</div>
                      <div className="text-[8px] text-zinc-500 font-bold">{Math.round((selectedDishPreview.macros.carbs * 4 / selectedDishPreview.macros.calories) * 100)}%</div>
                    </div>
                  </div>

                  {/* Склад та інгредієнти у грамах */}
                  {selectedDishPreview.ingredients && selectedDishPreview.ingredients.length > 0 && (
                    <div className="space-y-1.5">
                      <div className="text-zinc-300 font-bold text-[11px] flex items-center gap-1.5">
                        <ChefHat className="w-3.5 h-3.5 text-amber-400" />
                        <span>Склад страви (на {selectedDishPreview.weightGrams}г):</span>
                      </div>
                      <div className="space-y-1 bg-black/40 p-2.5 rounded-xl border border-white/5">
                        {selectedDishPreview.ingredients.map((ing, idx) => (
                          <div key={idx} className="flex justify-between items-center text-[11px] py-0.5 border-b border-white/5 last:border-0">
                            <span className="text-zinc-200">{ing.name}</span>
                            <span className="text-amber-400 font-mono font-bold shrink-0">{ing.grams}г</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Покроковий рецепт */}
                  {selectedDishPreview.instructions && selectedDishPreview.instructions.length > 0 && (
                    <div className="space-y-1.5">
                      <div className="text-zinc-300 font-bold text-[11px] flex items-center gap-1.5">
                        <BookOpen className="w-3.5 h-3.5 text-amber-400" />
                        <span>Приготування:</span>
                      </div>
                      <div className="space-y-2 bg-black/40 p-2.5 rounded-xl border border-white/5">
                        {selectedDishPreview.instructions.map((step, idx) => (
                          <div key={idx} className="flex items-start gap-2 text-[11px] text-zinc-300 leading-relaxed">
                            <span className="w-4 h-4 rounded-full bg-amber-400/20 text-amber-300 flex items-center justify-center font-bold text-[9px] shrink-0 mt-0.5">
                              {idx + 1}
                            </span>
                            <span>{step}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Вибір прийому їжі для додавання */}
                  <div className="space-y-1.5 pt-1">
                    <label className="text-[11px] font-bold text-zinc-300 block">
                      Призначити на прийом:
                    </label>
                    <div className="grid grid-cols-4 gap-1.5">
                      {(['breakfast', 'lunch', 'snack', 'dinner'] as MealType[]).map((slot) => {
                        const labels = { breakfast: 'Сніданок', lunch: 'Обід', snack: 'Перекус', dinner: 'Вечеря' };
                        const isSel = previewTargetSlot === slot;
                        return (
                          <button
                            key={slot}
                            type="button"
                            onClick={() => setPreviewTargetSlot(slot)}
                            className={`py-1.5 rounded-xl text-[10.5px] font-bold transition-all ${
                              isSel
                                ? 'bg-amber-400 text-zinc-950 font-black shadow-md shadow-amber-400/20'
                                : 'bg-white/5 text-zinc-400 hover:text-white border border-white/5'
                            }`}
                          >
                            {labels[slot]}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Нижня панель дій */}
            <div className="p-3.5 bg-black/80 border-t border-white/10 shrink-0 flex items-center gap-2">
              <button
                type="button"
                onClick={() => setSelectedDishPreview(null)}
                className="px-3.5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-300 font-bold text-xs transition-all active:scale-95"
              >
                Назад
              </button>

              {selectedDishPreview.tier === 'pro' && !isProUser ? (
                <div className="flex-1 flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      if (onOpenProModal) {
                        onOpenProModal();
                      } else {
                        setProStatus(true);
                      }
                    }}
                    className="flex-1 py-2.5 rounded-xl font-black text-xs text-zinc-950 bg-gradient-to-r from-amber-400 to-amber-500 shadow-lg shadow-amber-400/25 hover:brightness-110 flex items-center justify-center gap-1.5 active:scale-95 transition-all"
                  >
                    <Crown className="w-3.5 h-3.5 stroke-[2.5]" />
                    <span>Розблокувати PRO</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      const dishTitle = selectedDishPreview.name;
                      setSelectedDishPreview(null);
                      setSmartInputText(dishTitle);
                      setActiveTab('smart_text');
                    }}
                    className="py-2.5 px-3 rounded-xl font-bold text-xs bg-white/10 hover:bg-white/15 text-zinc-200 border border-white/15 flex items-center justify-center gap-1 active:scale-95 transition-all"
                    title="Знайти в інтернеті та ввести безкоштовно через Вільний текст"
                  >
                    <Globe className="w-3.5 h-3.5 text-amber-400" />
                    <span>Ввести самому</span>
                  </button>
                </div>
              ) : (
                <button
                  id="btn-add-preview-dish"
                  type="button"
                  onClick={handleAddPreviewDish}
                  className={`flex-1 py-2.5 rounded-xl font-black text-xs flex items-center justify-center gap-1.5 transition-all active:scale-95 ${
                    isPreviewAdded
                      ? 'bg-emerald-500 text-zinc-950'
                      : 'bg-gradient-to-r from-amber-400 to-amber-500 text-zinc-950 shadow-md shadow-amber-400/20 hover:brightness-110'
                  }`}
                >
                  {isPreviewAdded ? (
                    <>
                      <Check className="w-4 h-4 stroke-[3]" />
                      <span>Додано в {previewTargetSlot === 'breakfast' ? 'Сніданок' : previewTargetSlot === 'lunch' ? 'Обід' : previewTargetSlot === 'snack' ? 'Перекус' : 'Вечерю'}!</span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4 stroke-[3]" />
                      <span>Додати в {previewTargetSlot === 'breakfast' ? 'Сніданок' : previewTargetSlot === 'lunch' ? 'Обід' : previewTargetSlot === 'snack' ? 'Перекус' : 'Вечерю'}</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        )}

        {/* Швидке вікно блокування PRO при тапі на замок */}
        {proPaywallDish && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 animate-fadeIn">
            {/* Окремий бекдроп для закриття тапом збоку */}
            <div
              id="chef-hub-locked-dish-backdrop"
              className="absolute inset-0 bg-black/85 backdrop-blur-md cursor-pointer"
              onClick={() => setProPaywallDish(null)}
            />
            <div
              className="w-full max-w-sm rounded-3xl bg-[#121814] border border-amber-400/50 p-5 shadow-2xl space-y-4 relative z-10 overflow-hidden text-white"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="absolute -top-12 -right-12 w-32 h-32 bg-amber-400/20 rounded-full blur-2xl pointer-events-none" />

              <button
                type="button"
                onClick={() => setProPaywallDish(null)}
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-zinc-400 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="w-full h-36 rounded-2xl overflow-hidden relative border border-white/10">
                <img src={proPaywallDish.photo} alt={proPaywallDish.name} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
                <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-amber-400/90 text-zinc-950 font-black text-[10px] flex items-center gap-1 shadow-md">
                  <Crown className="w-3 h-3" />
                  <span>NUTRIQ PRO РЕСТОРАН</span>
                </div>
                <div className="absolute bottom-2 left-3 right-3">
                  <h3 className="text-sm font-bold text-white truncate">{proPaywallDish.name}</h3>
                </div>
              </div>

              <div className="space-y-1.5 text-center">
                <div className="text-xs font-black text-amber-300 uppercase tracking-wide flex items-center justify-center gap-1.5">
                  <Lock className="w-3.5 h-3.5" />
                  <span>Ресторанне меню під замком</span>
                </div>
                <p className="text-xs text-zinc-300 leading-relaxed">
                  Повний розрахунок точних грамів, КБЖВ, облік уварки Cook-Loss та шеф-інструкція доступні в підписці PRO.
                </p>
              </div>

              <div className="pt-1">
                <button
                  id="btn-chef-pro-subscribe"
                  type="button"
                  onClick={() => {
                    setProPaywallDish(null);
                    if (onOpenProModal) {
                      onOpenProModal();
                    } else {
                      setProStatus(true);
                    }
                  }}
                  className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-zinc-950 font-black text-xs flex items-center justify-center gap-2 shadow-lg shadow-amber-400/25 active:scale-95 transition-all cursor-pointer"
                >
                  <Crown className="w-4 h-4 stroke-[2.5]" />
                  <span>Оформити NUTRIQ PRO</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
