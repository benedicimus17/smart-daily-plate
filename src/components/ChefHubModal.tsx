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
  ChefHat
} from 'lucide-react';
import { MealType } from '../types/nutrition';
import { parseRecipeFromUrl, parseSmartDish } from '../services/recipeParser';
import { ParsedRecipe } from '../types/recipe';

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
}

const CHEF_CATALOG: ChefDishItem[] = [
  // СНІДАНКИ
  {
    id: 'chef-b1',
    name: 'Сирники з рікоти та ванілі',
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

  // ПЕРЕКУСИ
  {
    id: 'chef-s1',
    name: 'Протеїновий шейк (1 скуп ізоляту)',
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
  }
];

interface ChefHubModalProps {
  isOpen: boolean;
  targetDate?: string;
  onClose: () => void;
  onAddDishToDay: (mealType: MealType, data: { name: string; weightGrams: number; macros: { calories: number; protein: number; fat: number; carbs: number }; timestamp?: string }) => void;
  onSaveToRecipeBook?: (recipe: ParsedRecipe) => void;
}

export const ChefHubModal: React.FC<ChefHubModalProps> = ({
  isOpen,
  targetDate,
  onClose,
  onAddDishToDay,
  onSaveToRecipeBook
}) => {
  if (!isOpen) return null;

  // Режим роботи Шеф-Хабу: 1. Меню страв, 2. AI Парсер (TikTok/Reels), 3. Розумний текст
  const [activeTab, setActiveTab] = useState<'catalog' | 'ai_parser' | 'smart_text'>('catalog');

  // Фільтри каталогу
  const [selectedFilter, setSelectedFilter] = useState<'all' | MealType>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [addedDishId, setAddedDishId] = useState<string | null>(null);

  // Стан для детального перегляду рецепта з каталогу (Preview Modal)
  const [selectedDishPreview, setSelectedDishPreview] = useState<ChefDishItem | null>(null);
  const [previewTargetSlot, setPreviewTargetSlot] = useState<MealType>('breakfast');
  const [isPreviewAdded, setIsPreviewAdded] = useState(false);

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

  // Фільтрація каталогу
  const filteredCatalog = CHEF_CATALOG.filter((item) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) {
      return selectedFilter === 'all' || item.category === selectedFilter;
    }

    const matchesSearch =
      item.name.toLowerCase().includes(q) ||
      item.shortDesc.toLowerCase().includes(q) ||
      item.categoryLabel.toLowerCase().includes(q) ||
      (q.includes('снек') && (item.category === 'snack' || item.name.toLowerCase().includes('снек'))) ||
      (q.includes('горіх') && (item.name.toLowerCase().includes('горіх') || item.shortDesc.toLowerCase().includes('горіх') || item.name.toLowerCase().includes('мигдал'))) ||
      (q.includes('салат') && (item.name.toLowerCase().includes('салат') || item.shortDesc.toLowerCase().includes('салат'))) ||
      (q.includes('бургер') || q.includes('мак') || q.includes('біг') ? item.name.toLowerCase().includes('бургер') || item.name.toLowerCase().includes('мак') : false) ||
      (q.includes('круас') && item.name.toLowerCase().includes('круас')) ||
      (item.ingredients && item.ingredients.some(ing => ing.name.toLowerCase().includes(q)));

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
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3.5 bg-black/85 backdrop-blur-md animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm rounded-[32px] bg-[#101612]/98 border border-white/10 text-white relative max-h-[92vh] flex flex-col shadow-[0_25px_60px_rgba(0,0,0,0.9)] overflow-hidden"
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

        {/* 3 ГОЛОВНІ РЕЖИМИ ШЕФ-ХАБУ */}
        <div className="grid grid-cols-3 gap-1.5 p-2 bg-black/40 border-b border-white/10 shrink-0 text-xs">
          <button
            id="tab-chef-catalog"
            type="button"
            onClick={() => setActiveTab('catalog')}
            className={`py-2 rounded-xl font-bold flex items-center justify-center gap-1.5 transition-all ${
              activeTab === 'catalog'
                ? 'bg-amber-400 text-zinc-950 shadow-md shadow-amber-400/20'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Меню страв</span>
          </button>

          <button
            id="tab-chef-parser"
            type="button"
            onClick={() => setActiveTab('ai_parser')}
            className={`py-2 rounded-xl font-bold flex items-center justify-center gap-1.5 transition-all ${
              activeTab === 'ai_parser'
                ? 'bg-amber-400 text-zinc-950 shadow-md shadow-amber-400/20'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Link2 className="w-3.5 h-3.5" />
            <span>AI Імпорт</span>
          </button>

          <button
            id="tab-chef-smart"
            type="button"
            onClick={() => setActiveTab('smart_text')}
            className={`py-2 rounded-xl font-bold flex items-center justify-center gap-1.5 transition-all ${
              activeTab === 'smart_text'
                ? 'bg-amber-400 text-zinc-950 shadow-md shadow-amber-400/20'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Вільний текст</span>
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
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Пошук страви (сирники, лосось, стейк...)"
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

                  return (
                    <div
                      key={item.id}
                      onClick={() => {
                        setSelectedDishPreview(item);
                        setPreviewTargetSlot(item.category);
                      }}
                      className="p-2.5 rounded-2xl bg-black/40 border border-white/10 flex items-center gap-3 transition-all hover:border-amber-400/40 cursor-pointer active:scale-[0.99] group"
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
                      </div>

                      {/* Текст страви */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.2 rounded bg-amber-400/15 text-amber-300 border border-amber-400/30">
                            {item.categoryLabel}
                          </span>
                          <span className="text-[10px] text-zinc-500 font-semibold">{item.weightGrams}г</span>
                        </div>

                        <h4 className="text-xs font-bold text-white truncate mt-0.5 group-hover:text-amber-300 transition-colors">
                          {item.name}
                        </h4>

                        <div className="text-[10px] text-zinc-400 flex items-center gap-1.5 mt-0.5">
                          <span className="text-amber-300 font-black">{item.macros.calories} ккал</span>
                          <span>•</span>
                          <span className="text-emerald-400">{item.macros.protein}г Б</span>
                          <span>•</span>
                          <span className="text-amber-400">{item.macros.fat}г Ж</span>
                        </div>
                      </div>

                      {/* Кнопка швидкого додавання в розклад */}
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
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* РЕЖИМ 2: AI ІМПОРТ З TIKTOK / REELS / ПОСИЛАННЯ */}
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
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
