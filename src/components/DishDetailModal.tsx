import React, { useState } from 'react';
import { X, Check, ChefHat, Sparkles, Scale, Clock, RefreshCw } from 'lucide-react';
import { MealEntry, MealType, Macros } from '../types/nutrition';
import { getNextSwapCandidate, SmartSwapResult } from '../services/smartSwapEngine';
import { CHEF_CATALOG } from './ChefHubModal';

interface DishDetailModalProps {
  isOpen: boolean;
  mealType: MealType | null;
  entry: MealEntry | null;
  onClose: () => void;
  onToggleEaten: (mealType: MealType, entryId: string) => void;
  onRemove: (mealType: MealType, entryId: string) => void;
  onUpdateTime?: (mealType: MealType, entryId: string, newTime: string) => void;
  onSwapDish?: (mealType: MealType, entryId: string, newDish: { name: string; weightGrams: number; macros: Macros; recipeDetails?: string }) => void;
}

const MEAL_LABELS: Record<MealType, string> = {
  breakfast: 'Сніданок',
  lunch: 'Обід',
  dinner: 'Вечеря',
  snack: 'Перекус'
};

const DEFAULT_RECIPES: Record<string, {
  photo: string;
  ingredients: { name: string; grams: number; calories: number; protein: number; fat: number; carbs: number }[];
  instructions: string[];
  cookLossNote?: string;
}> = {
  'syrniki': {
    photo: 'https://images.unsplash.com/photo-1575853121743-60c24f0a7502?auto=format&fit=crop&w=600&q=80',
    ingredients: [
      { name: 'Кисломолочний сир 5% або рікота', grams: 200, calories: 242, protein: 34, fat: 10, carbs: 4 },
      { name: 'Куряче яйце (велике)', grams: 55, calories: 78, protein: 7, fat: 5.2, carbs: 0.4 },
      { name: 'Борошно рисове / вівсяне', grams: 25, calories: 90, protein: 2.5, fat: 0.5, carbs: 19 },
      { name: 'Ванільний екстракт та стевія', grams: 2, calories: 5, protein: 0, fat: 0, carbs: 1 }
    ],
    instructions: [
      'Перетерти рікоту або сир виделкою з яйцем та натуральним підсолоджувачем до кремової текстури.',
      'Додати рисове борошно і замішати ніжне, еластичне тісто.',
      'Сформувати круглі сирники товщиною 2 см за допомогою кулінарного кільця або широкої склянки.',
      'Смажити на антипригарній пательні на мінімальному вогні під кришкою по 4-5 хв з кожного боку до золотистої скоринки.',
      'Подавати теплими зі свіжими лісовими ягодами або грецьким йогуртом.'
    ],
    cookLossNote: 'Маса сирого тіста: 280г ➔ Готові сирники: 240г (-14% випаровування вологи)'
  },
  'protein_shake': {
    photo: 'https://images.unsplash.com/photo-1553787499-6f9133860278?auto=format&fit=crop&w=600&q=80',
    ingredients: [
      { name: 'Сироватковий протеїн ізолят (1 скуп)', grams: 30, calories: 120, protein: 25, fat: 1.2, carbs: 1.8 },
      { name: 'Фільтрована вода або мигдалеве молоко', grams: 250, calories: 25, protein: 1, fat: 2, carbs: 0.5 }
    ],
    instructions: [
      'Налити 250 мл холодної води або несолодкого мигдалевого молока у шейкер.',
      'Додати 1 мірну ложку (30г) сухого протеїну ізоляту.',
      'Щільно закрити клапан та струшувати протягом 20-30 секунд до утворення легкої кремової пінки.',
      'Випити як легкий білковий перекус або через 30 хвилин після активності.'
    ]
  },
  'omelet': {
    photo: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&w=600&q=80',
    ingredients: [
      { name: 'Курячі яйця (великі)', grams: 165, calories: 235, protein: 21, fat: 16, carbs: 1 },
      { name: 'Авокадо хасс (стигле)', grams: 60, calories: 96, protein: 1.2, fat: 9, carbs: 5 },
      { name: 'Шпинат свіжий бейбі', grams: 50, calories: 12, protein: 1.5, fat: 0.2, carbs: 1.8 },
      { name: 'Оливкова олія Extra Virgin', grams: 5, calories: 44, protein: 0, fat: 5, carbs: 0 }
    ],
    instructions: [
      'Розігріти пательню з 5г оливкової олії на середньому вогні.',
      'Припустити листя шпинату протягом 60 секунд до легкого зменшення об\'єму.',
      'Збити 3 яйця з дрібкою морської солі та вилити на пательню.',
      'Готувати 3-4 хвилини під кришкою на мінімальному вогні.',
      'Перед подачею викласти зверху нарізані скибочки стиглого авокадо.'
    ],
    cookLossNote: 'Сира маса: 280г ➔ Готова страва: 220г (-21% випаровування вологи)'
  },
  'chicken': {
    photo: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80',
    ingredients: [
      { name: 'Філе курячої грудки', grams: 220, calories: 242, protein: 50, fat: 3.3, carbs: 0 },
      { name: 'Кіноа сухе (відварене)', grams: 60, calories: 218, protein: 8, fat: 3.5, carbs: 38 },
      { name: 'Броколі / спаржа на пару', grams: 100, calories: 34, protein: 2.8, fat: 0.4, carbs: 7 },
      { name: 'Лимонний сік та прованські трави', grams: 10, calories: 3, protein: 0, fat: 0, carbs: 1 }
    ],
    instructions: [
      'Філе куряче замаринувати в травах і запекти при 180°C рівно 22 хвилини.',
      'Кіноа промити та відварити у співвідношенні 1:2 з водою 15 хвилин.',
      'Броколі приготувати на пару 4-5 хвилин для збереження яскравого кольору та вітамінів.',
      'Зібрати збалансовану тарілку та збризнути лимонним соком.'
    ],
    cookLossNote: 'Уварка курячого філе: 220г сирого ➔ 165г готового (-25% Cook-Loss)'
  },
  'yogurt': {
    photo: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&w=600&q=80',
    ingredients: [
      { name: 'Грецький густий йогурт 2%', grams: 150, calories: 110, protein: 15, fat: 3, carbs: 6 },
      { name: 'Мікс свіжих лісових ягід (лохина, малина)', grams: 60, calories: 32, protein: 0.6, fat: 0.3, carbs: 7 },
      { name: 'Мигдалеві пластівці', grams: 8, calories: 48, protein: 1.7, fat: 4.1, carbs: 1.7 }
    ],
    instructions: [
      'Викласти охолоджений грецький йогурт у скляну креманку.',
      'Додати промиті свіжі ягоди зверху.',
      'Присипати пелюстками обсмаженого мигдалю.'
    ]
  },
  'steak': {
    photo: '/dinner_steak_hd.jpg',
    ingredients: [
      { name: 'Яловичий стейк Рибай зернової відгодівлі', grams: 350, calories: 440, protein: 42, fat: 22, carbs: 0 },
      { name: 'Спаржа свіжа молода', grams: 140, calories: 28, protein: 3, fat: 0.3, carbs: 5.5 },
      { name: 'Вершкове масло 82%', grams: 5, calories: 37, protein: 0, fat: 4.1, carbs: 0 },
      { name: 'Морська сіль пластівцями та розмарин', grams: 3, calories: 0, protein: 0, fat: 0, carbs: 0 }
    ],
    instructions: [
      'Дістати стейк за 20 хв до смаження, щоб він досяг кімнатної температури.',
      'Розігріти чавунну гриль-сковороду до появи легкого серпанку.',
      'Обсмажувати по 3.5 хвилини з кожного боку до ідеального ступеня Medium-Rare.',
      'Спаржу бланшувати в окропі 2 хвилини, потім швидко прогріти з вершковим маслом.',
      'Дати стейку відпочити 5 хвилин на теплій дошці перед нарізкою.'
    ],
    cookLossNote: 'Ужарка стейка: 350г сирого м\'яса ➔ 260г на тарілці (-26% Cook-Loss)'
  },
  'salmon': {
    photo: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?auto=format&fit=crop&w=600&q=80',
    ingredients: [
      { name: 'Філе лосося слабосолоне або запечене', grams: 200, calories: 380, protein: 40, fat: 24, carbs: 0 },
      { name: 'Кіноа відварене', grams: 150, calories: 180, protein: 6, fat: 3, carbs: 32 },
      { name: 'Стигле авокадо', grams: 60, calories: 96, protein: 1.2, fat: 9, carbs: 5 }
    ],
    instructions: [
      'Запекти філе лосося з сіллю та прованськими травами при 180°C 15 хвилин.',
      'Викласти в боул разом із теплим кіноа та шматочками авокадо.'
    ]
  },
  'toast_avocado': {
    photo: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&w=600&q=80',
    ingredients: [
      { name: 'Цільнозерновий хліб на заквасці', grams: 85, calories: 205, protein: 7.8, fat: 2.4, carbs: 38 },
      { name: 'Стигле авокадо Хасс', grams: 65, calories: 104, protein: 1.3, fat: 9.6, carbs: 5.5 },
      { name: 'Куряче яйце пашот', grams: 55, calories: 78, protein: 7.0, fat: 5.2, carbs: 0.4 },
      { name: 'Мікрогрін та насіння льону', grams: 5, calories: 8, protein: 0.3, fat: 0.5, carbs: 0.7 }
    ],
    instructions: [
      'Підсушити скибочки цільнозернового хліба в тостері або на пательні до золотистої скоринки.',
      'Розім\'яти м\'якоть стиглого авокадо виделкою з кількома краплями лимонного соку та сіллю.',
      'Приготувати ніжне яйце пашот у слабо киплячій воді 3 хвилини.',
      'Викласти авокадо-крем на хрусткий тост, зверху помістити яйце пашот і прикрасити мікрогріном.'
    ]
  },
  'toast_banana': {
    photo: 'https://images.unsplash.com/photo-1528207776546-365bb710ee93?auto=format&fit=crop&w=600&q=80',
    ingredients: [
      { name: 'Цільнозерновий тостовий хліб', grams: 85, calories: 205, protein: 7.8, fat: 2.4, carbs: 38 },
      { name: 'Стиглий банан', grams: 115, calories: 102, protein: 1.3, fat: 0.3, carbs: 26.2 },
      { name: 'Натуральна арахісова паста', grams: 10, calories: 59, protein: 2.5, fat: 5.0, carbs: 2.0 }
    ],
    instructions: [
      'Підсушити скибочки тостів до хрусткості.',
      'Рівномірно змастити натуральною арахісовою пастою.',
      'Нарізати банан кружальцями та гарно викласти зверху.'
    ]
  },
  'crepes_meat': {
    photo: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&w=600&q=80',
    ingredients: [
      { name: 'Тонкі домашні крепси / млинці', grams: 120, calories: 252, protein: 7.8, fat: 8.4, carbs: 36 },
      { name: 'Нежирний яловичий фарш', grams: 120, calories: 258, protein: 24.0, fat: 18.0, carbs: 0 },
      { name: 'Оливкова олія та цибуля', grams: 10, calories: 88, protein: 0.2, fat: 10.0, carbs: 0.5 }
    ],
    instructions: [
      'Обсмажити подрібнену цибулю та фарш зі спеціями до готовності.',
      'Викласти соковиту начинку в центр тонкого млинця.',
      'Згорнути конвертиком та підрум\'янити на пательні по 1 хв з кожного боку.'
    ]
  },
  'pancakes': {
    photo: 'https://images.unsplash.com/photo-1528207776546-365bb710ee93?auto=format&fit=crop&w=600&q=80',
    ingredients: [
      { name: 'Вівсяне борошно грубого помелу', grams: 60, calories: 215, protein: 8.0, fat: 3.5, carbs: 38 },
      { name: 'Сироватковий ізолят (протеїн)', grams: 25, calories: 95, protein: 22.0, fat: 0.5, carbs: 1 },
      { name: 'Яєчний білок', grams: 60, calories: 30, protein: 6.5, fat: 0.1, carbs: 0.4 },
      { name: 'Свіжа лохина та малина', grams: 50, calories: 28, protein: 0.5, fat: 0.2, carbs: 6 }
    ],
    instructions: [
      'Збити вівсянку, протеїн та білки до однорідної маси.',
      'Випікати невеликі панкейки на сухій пательні по 2 хв з боку.',
      'Подавати теплими зі свіжими ягодами.'
    ]
  },
  'pasta_shrimp': {
    photo: 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&w=600&q=80',
    ingredients: [
      { name: 'Паста з твердих сортів al dente', grams: 140, calories: 210, protein: 8.0, fat: 1.5, carbs: 42 },
      { name: 'Тигрові креветки очищені', grams: 110, calories: 120, protein: 24.0, fat: 1.2, carbs: 1 },
      { name: 'Томати чері та часник', grams: 25, calories: 15, protein: 0.5, fat: 0.1, carbs: 3 },
      { name: 'Оливкова олія Extra Virgin', grams: 5, calories: 44, protein: 0, fat: 5.0, carbs: 0 }
    ],
    instructions: [
      'Відварити пасту до стану al dente 8-9 хвилин.',
      'Швидко обсмажити креветки з часником по 1.5 хвилини з боку.',
      'З\'єднати пасту з креветками та свіжим базиліком.'
    ]
  },
  'beef_salad': {
    photo: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=80',
    ingredients: [
      { name: 'Теляча вирізка на грилі', grams: 130, calories: 240, protein: 34.0, fat: 11.0, carbs: 0 },
      { name: 'Хрусткий салатний мікс', grams: 50, calories: 12, protein: 1.0, fat: 0.2, carbs: 2 },
      { name: 'Томати чері соковиті', grams: 40, calories: 10, protein: 0.4, fat: 0.1, carbs: 2 },
      { name: 'Діжонська заправка з кедровими горішками', grams: 20, calories: 85, protein: 1.5, fat: 8.0, carbs: 2 }
    ],
    instructions: [
      'Обсмажити телятину на грилі до ступеня Medium.',
      'Викласти салатне листя та томати на тарілку.',
      'Нарізати тепле м\'ясо слайсами та полити заправкою.'
    ]
  },
  'chia_pudding': {
    photo: 'https://images.unsplash.com/photo-1517673132405-a56a62b18caf?auto=format&fit=crop&w=600&q=80',
    ingredients: [
      { name: 'Насіння чіа органічне', grams: 25, calories: 120, protein: 4.5, fat: 7.5, carbs: 10 },
      { name: 'Мигдалеве молоко несолодке', grams: 130, calories: 20, protein: 0.8, fat: 1.5, carbs: 0.5 },
      { name: 'Ванільний протеїн', grams: 15, calories: 60, protein: 12.0, fat: 0.5, carbs: 1 },
      { name: 'Ягоди для прикраси', grams: 20, calories: 10, protein: 0.2, fat: 0.1, carbs: 2 }
    ],
    instructions: [
      'Змішати насіння чіа з рослинним молоком та протеїном.',
      'Залишити в холодильнику на 2 години до желювання.'
    ]
  },
  'sea_bass': {
    photo: 'https://images.unsplash.com/photo-1534939561126-855b8675edd7?auto=format&fit=crop&w=600&q=80',
    ingredients: [
      { name: 'Філе сібаса свіже', grams: 170, calories: 220, protein: 32.0, fat: 9.0, carbs: 0 },
      { name: 'Цукіні на грилі', grams: 100, calories: 20, protein: 1.5, fat: 0.2, carbs: 4 },
      { name: 'Оливкова олія та лимонний чебрець', grams: 10, calories: 75, protein: 0.1, fat: 8.0, carbs: 0.5 }
    ],
    instructions: [
      'Запекти сібас у духовці при 190°C 15 хвилин.',
      'Обсмажити кружальця цукіні на гриль-пательні.',
      'Збризнути лимоном та подавати теплим.'
    ]
  },
  'tuna_steak': {
    photo: 'https://images.unsplash.com/photo-1501595091296-3aa970afb3ff?auto=format&fit=crop&w=600&q=80',
    ingredients: [
      { name: 'Стейк жовтоперого тунця', grams: 160, calories: 210, protein: 40.0, fat: 5.0, carbs: 0 },
      { name: 'Чорний кунжут', grams: 10, calories: 55, protein: 1.8, fat: 4.8, carbs: 1.5 },
      { name: 'Стигле авокадо Хасс', grams: 70, calories: 112, protein: 1.4, fat: 10.5, carbs: 6 },
      { name: 'Соєвий соус та лайм', grams: 10, calories: 10, protein: 0.8, fat: 0, carbs: 1.5 }
    ],
    instructions: [
      'Обваляти стейк тунця у кунжуті.',
      'Обсмажити на пательні по 60 секунд з кожного боку (Rare/Medium Rare).',
      'Нарізати тонкими слайсами та подати з авокадо.'
    ]
  },
  'big_mac': {
    photo: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=600&q=80',
    ingredients: [
      { name: 'Булочка з кунжутом', grams: 85, calories: 210, protein: 7.5, fat: 2.5, carbs: 39 },
      { name: 'Котлета з добірної яловичини', grams: 85, calories: 215, protein: 20.0, fat: 15.0, carbs: 0 },
      { name: 'Сир Чеддер', grams: 20, calories: 76, protein: 5.0, fat: 6.0, carbs: 0.3 },
      { name: 'Соус Біг Мак та мариновані огірки', grams: 20, calories: 39, protein: 0.5, fat: 3.5, carbs: 1.5 }
    ],
    instructions: [
      'Обсмажити котлету з яловичини на грилі.',
      'Підрум’янити булочку на пательні.',
      'Зібрати соковитий бургер з сиром та соусом.'
    ]
  },
  'croissant': {
    photo: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=600&q=80',
    ingredients: [
      { name: 'Французький масляний круасан', grams: 80, calories: 325, protein: 6.6, fat: 16.8, carbs: 36.6 }
    ],
    instructions: [
      'Злегка прогріти в духовці 2 хвилини.',
      'Подавати з кавою чи улюбленим теплим напоєм.'
    ]
  },
  'nuts': {
    photo: 'https://images.unsplash.com/photo-1599599810769-bcde5a160d32?auto=format&fit=crop&w=600&q=80',
    ingredients: [
      { name: 'Мікс добірних горіхів (мигдаль, волоські, фундук)', grams: 50, calories: 304, protein: 9.0, fat: 27.0, carbs: 7.0 }
    ],
    instructions: [
      'Натуральний чистий снек, готовий до споживання.',
      'Відмінне джерело корисних омега-3 жирів.'
    ]
  },
  'greek_salad': {
    photo: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=600&q=80',
    ingredients: [
      { name: 'Свіжі томати чері', grams: 80, calories: 15, protein: 0.7, fat: 0.2, carbs: 3.1 },
      { name: 'Свіжі хрусткі огірки', grams: 80, calories: 12, protein: 0.6, fat: 0.1, carbs: 2.4 },
      { name: 'Грецька фета', grams: 45, calories: 117, protein: 6.3, fat: 9.5, carbs: 1.8 },
      { name: 'Оливкова олія Extra Virgin', grams: 15, calories: 133, protein: 0, fat: 15.0, carbs: 0 }
    ],
    instructions: [
      'Нарізати томати та огірки великими скибками.',
      'Додати шматочки фети, заправити оливковою олією та сухим орегано.'
    ]
  },
  'snack_bar': {
    photo: 'https://images.unsplash.com/photo-1622484216850-4d5162a40fd9?auto=format&fit=crop&w=600&q=80',
    ingredients: [
      { name: 'Протеїновий снек-батончик (шоколад-арахіс)', grams: 60, calories: 228, protein: 12.0, fat: 7.2, carbs: 28.8 }
    ],
    instructions: [
      'Зручний поживний снек без доданого цукру.'
    ]
  }
};

export const DishDetailModal: React.FC<DishDetailModalProps> = ({
  isOpen,
  mealType,
  entry,
  onClose,
  onToggleEaten,
  onRemove,
  onUpdateTime,
  onSwapDish
}) => {
  if (!isOpen || !entry || !mealType) return null;

  const [isEditingTime, setIsEditingTime] = useState(false);
  const [timeValue, setTimeValue] = useState(entry.timestamp || '08:30');
  const [showSwapPanel, setShowSwapPanel] = useState(false);
  const [excludedSwapIds, setExcludedSwapIds] = useState<string[]>([]);
  const [currentSwapCandidate, setCurrentSwapCandidate] = useState<SmartSwapResult | null>(null);

  const handleInitSmartSwap = () => {
    const candidate = getNextSwapCandidate(
      { name: entry.name, macros: entry.macros, category: mealType },
      CHEF_CATALOG,
      []
    );
    setCurrentSwapCandidate(candidate);
    setExcludedSwapIds(candidate ? [candidate.candidate.id] : []);
    setShowSwapPanel(true);
  };

  const handleNextSwap = () => {
    let nextCandidate = getNextSwapCandidate(
      { name: entry.name, macros: entry.macros, category: mealType },
      CHEF_CATALOG,
      excludedSwapIds
    );
    if (!nextCandidate) {
      // Loop back if all options seen
      nextCandidate = getNextSwapCandidate(
        { name: entry.name, macros: entry.macros, category: mealType },
        CHEF_CATALOG,
        []
      );
      setExcludedSwapIds(nextCandidate ? [nextCandidate.candidate.id] : []);
    } else {
      setExcludedSwapIds(prev => [...prev, nextCandidate!.candidate.id]);
    }
    setCurrentSwapCandidate(nextCandidate);
  };

  const handleApplySwap = () => {
    if (!currentSwapCandidate || !onSwapDish) return;
    onSwapDish(mealType, entry.id, {
      name: currentSwapCandidate.candidate.name,
      weightGrams: currentSwapCandidate.candidate.weightGrams,
      macros: currentSwapCandidate.candidate.macros,
      recipeDetails: currentSwapCandidate.candidate.shortDesc
    });
    setShowSwapPanel(false);
    onClose();
  };

  // Визначаємо деталі страви за назвою
  const lowerName = entry.name.toLowerCase();
  let recipeMeta = DEFAULT_RECIPES['steak'];

  if (lowerName.includes('біг мак') || lowerName.includes('бігмак') || lowerName.includes('бургер') || lowerName.includes('макдональд')) {
    recipeMeta = DEFAULT_RECIPES['big_mac'];
  } else if (lowerName.includes('круас')) {
    recipeMeta = DEFAULT_RECIPES['croissant'];
  } else if (lowerName.includes('горіх') || lowerName.includes('мигдал') || lowerName.includes('фундук')) {
    recipeMeta = DEFAULT_RECIPES['nuts'];
  } else if (lowerName.includes('снек') || lowerName.includes('батончик')) {
    recipeMeta = DEFAULT_RECIPES['snack_bar'];
  } else if (lowerName.includes('тост') && lowerName.includes('банан')) {
    recipeMeta = DEFAULT_RECIPES['toast_banana'];
  } else if (lowerName.includes('тост') && (lowerName.includes('авокадо') || lowerName.includes('пашот'))) {
    recipeMeta = DEFAULT_RECIPES['toast_avocado'];
  } else if (lowerName.includes('креп') || lowerName.includes('млинц') || lowerName.includes('налисник')) {
    recipeMeta = DEFAULT_RECIPES['crepes_meat'];
  } else if (lowerName.includes('панкейк')) {
    recipeMeta = DEFAULT_RECIPES['pancakes'];
  } else if (lowerName.includes('паста') || lowerName.includes('кревет')) {
    recipeMeta = DEFAULT_RECIPES['pasta_shrimp'];
  } else if (lowerName.includes('сібас') || lowerName.includes('сибас')) {
    recipeMeta = DEFAULT_RECIPES['sea_bass'];
  } else if (lowerName.includes('тунц') || lowerName.includes('тунець')) {
    recipeMeta = DEFAULT_RECIPES['tuna_steak'];
  } else if (lowerName.includes('салат') && (lowerName.includes('телят') || lowerName.includes('яловичин'))) {
    recipeMeta = DEFAULT_RECIPES['beef_salad'];
  } else if (lowerName.includes('салат')) {
    recipeMeta = DEFAULT_RECIPES['greek_salad'];
  } else if (lowerName.includes('чіа') || lowerName.includes('chia') || lowerName.includes('пудинг')) {
    recipeMeta = DEFAULT_RECIPES['chia_pudding'];
  } else if (
    lowerName.includes('сирник') ||
    lowerName.includes('рікот') ||
    lowerName.includes('рикот') ||
    lowerName.includes('сир кисломол') ||
    lowerName.includes('творог')
  ) {
    recipeMeta = DEFAULT_RECIPES['syrniki'];
  } else if (
    lowerName.includes('протеїн') ||
    lowerName.includes('шейк') ||
    lowerName.includes('коктейль') ||
    lowerName.includes('гейнер') ||
    lowerName.includes('ізолят')
  ) {
    recipeMeta = DEFAULT_RECIPES['protein_shake'];
  } else if (
    lowerName.includes('омлет') ||
    lowerName.includes('яйц')
  ) {
    recipeMeta = DEFAULT_RECIPES['omelet'];
  } else if (
    lowerName.includes('лосос') ||
    lowerName.includes('сьомг') ||
    lowerName.includes('боул')
  ) {
    recipeMeta = DEFAULT_RECIPES['salmon'];
  } else if (
    lowerName.includes('кур') ||
    lowerName.includes('філе') ||
    lowerName.includes('грудк') ||
    lowerName.includes('грудин') ||
    lowerName.includes('кіноа') ||
    lowerName.includes('гречк')
  ) {
    recipeMeta = DEFAULT_RECIPES['chicken'];
  } else if (
    lowerName.includes('йогурт') ||
    lowerName.includes('ягід') ||
    lowerName.includes('перекус')
  ) {
    recipeMeta = DEFAULT_RECIPES['yogurt'];
  }

  const isEaten = entry.eaten !== false;

  const handleSaveTime = () => {
    if (onUpdateTime && timeValue) {
      onUpdateTime(mealType, entry.id, timeValue);
    }
    setIsEditingTime(false);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm rounded-[32px] bg-[#121814] border border-white/10 text-white relative max-h-[92vh] overflow-y-auto shadow-[0_25px_60px_rgba(0,0,0,0.9)] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Кнопка закриття */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-3.5 right-3.5 z-20 w-8 h-8 rounded-full bg-black/60 backdrop-blur-md border border-white/20 flex items-center justify-center text-zinc-300 hover:text-white transition-all active:scale-95"
        >
          <X className="w-4 h-4" />
        </button>

        {/* 1. ВЕРХНЄ ФОТО СТРАВИ З ГРАДІЄНТОМ */}
        <div className="relative h-48 w-full overflow-hidden bg-black">
          <img
            src={recipeMeta.photo}
            alt={entry.name}
            className="w-full h-full object-cover object-center"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src = '/dinner_steak_hd.jpg';
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#121814] via-[#121814]/40 to-transparent" />

          {/* Плашка часу та типу з можливістю редагування */}
          <div className="absolute bottom-3 left-4 flex items-center gap-2">
            {!isEditingTime ? (
              <button
                type="button"
                onClick={() => setIsEditingTime(true)}
                className="px-2.5 py-1 rounded-xl bg-amber-400 text-zinc-950 text-[11px] font-black tracking-tight shadow-md flex items-center gap-1 active:scale-95 transition-all"
                title="Натисніть щоб змінити час"
              >
                <Clock className="w-3 h-3 text-zinc-950" />
                <span>{entry.timestamp || 'За розкладом'}</span>
                <span className="text-[9px] opacity-75">✎</span>
              </button>
            ) : (
              <div className="flex items-center gap-1 bg-black/80 p-1 rounded-xl border border-amber-400">
                <input
                  type="time"
                  value={timeValue}
                  onChange={(e) => setTimeValue(e.target.value)}
                  className="bg-black text-amber-300 font-black text-xs px-1.5 py-0.5 rounded focus:outline-none"
                />
                <button
                  type="button"
                  onClick={handleSaveTime}
                  className="px-2 py-0.5 rounded bg-amber-400 text-zinc-950 text-[10px] font-extrabold"
                >
                  OK
                </button>
              </div>
            )}
            <span className="px-2.5 py-1 rounded-xl bg-black/60 backdrop-blur-md border border-white/15 text-zinc-200 text-[11px] font-bold">
              {MEAL_LABELS[mealType]}
            </span>
          </div>
        </div>

        {/* 2. ТІЛО МОДАЛКИ */}
        <div className="p-4 space-y-4">
          {/* Заголовок та вага */}
          <div>
            <h2 className="text-lg font-black text-white leading-tight tracking-tight">
              {entry.name}
            </h2>
            <div className="flex items-center gap-2 mt-1 text-xs text-zinc-400">
              <span className="font-semibold">{entry.weightGrams} г готова порція</span>
              <span>•</span>
              <span className="text-amber-300 font-bold">{entry.macros.calories} ккал</span>
            </div>
          </div>

          {/* 4 Чіпи КБЖВ */}
          <div className="grid grid-cols-4 gap-2">
            <div className="p-2.5 rounded-2xl bg-black/40 border border-amber-400/20 text-center">
              <div className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Ккал</div>
              <div className="text-sm font-black text-amber-300 mt-0.5">{entry.macros.calories}</div>
            </div>
            <div className="p-2.5 rounded-2xl bg-black/40 border border-emerald-400/20 text-center">
              <div className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Білок</div>
              <div className="text-sm font-black text-emerald-400 mt-0.5">{entry.macros.protein}г</div>
            </div>
            <div className="p-2.5 rounded-2xl bg-black/40 border border-amber-500/20 text-center">
              <div className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Жири</div>
              <div className="text-sm font-black text-amber-400 mt-0.5">{entry.macros.fat}г</div>
            </div>
            <div className="p-2.5 rounded-2xl bg-black/40 border border-indigo-400/20 text-center">
              <div className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Вуглеводи</div>
              <div className="text-sm font-black text-indigo-400 mt-0.5">{entry.macros.carbs}г</div>
            </div>
          </div>

          {/* Cook-Loss примітка (якщо є) */}
          {(recipeMeta.cookLossNote || entry.isCookLoss) && (
            <div className="p-2.5 rounded-2xl bg-amber-400/10 border border-amber-400/30 flex items-center gap-2.5 text-xs text-amber-200">
              <Scale className="w-4 h-4 text-amber-400 shrink-0" />
              <span className="text-[11px] leading-snug">
                {recipeMeta.cookLossNote || `Cook-Loss: ${entry.rawWeightGrams || 350}г сирого ➔ ${entry.cookedWeightGrams || entry.weightGrams}г готового`}
              </span>
            </div>
          )}

          {/* Список точних інгредієнтів у грамах */}
          <div className="space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-zinc-300">
              <ChefHat className="w-4 h-4 text-amber-400" />
              <span>Точні інгредієнти страви:</span>
            </div>

            <div className="space-y-1.5">
              {recipeMeta.ingredients.map((ing, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-2 rounded-xl bg-white/[0.04] border border-white/5 text-xs"
                >
                  <span className="text-zinc-200 font-medium">• {ing.name}</span>
                  <div className="flex items-center gap-2 text-right">
                    <span className="text-amber-300 font-bold">{ing.grams}г</span>
                    <span className="text-[10.5px] text-zinc-500">({ing.calories} ккал)</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Кроки приготування від шефа */}
          <div className="space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-zinc-300">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <span>Як готувати (Шеф-інструкція):</span>
            </div>

            <div className="space-y-1.5 text-xs text-zinc-300">
              {recipeMeta.instructions.map((step, i) => (
                <div key={i} className="flex gap-2 p-2 rounded-xl bg-black/30 border border-white/5">
                  <span className="w-5 h-5 rounded-full bg-white/10 text-amber-300 font-black text-[10px] flex items-center justify-center shrink-0">
                    {i + 1}
                  </span>
                  <p className="text-[11.5px] leading-relaxed text-zinc-300">{step}</p>
                </div>
              ))}
            </div>
          </div>

          {/* КНОПКА ШІ-ЗАМІНИ СТРАВИ (SMART SWAP) */}
          <div className="pt-2 border-t border-white/10 space-y-2">
            {!showSwapPanel ? (
              <button
                type="button"
                onClick={handleInitSmartSwap}
                className="w-full py-2.5 rounded-2xl bg-amber-400/10 hover:bg-amber-400/20 border border-amber-400/40 text-amber-300 font-bold text-xs flex items-center justify-center gap-2 transition-all active:scale-[0.98] shadow-sm"
              >
                <RefreshCw className="w-4 h-4 stroke-[2.2] text-amber-400" />
                <span>🔄 Smart Swap — Замінити страву за 2 секунди</span>
              </button>
            ) : (
              <div className="p-3.5 rounded-2xl bg-gradient-to-b from-amber-500/10 to-black/70 border border-amber-400/50 space-y-3 animate-fadeIn">
                <div className="flex items-center justify-between">
                  <div className="text-[11px] font-black uppercase text-amber-300 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>ШІ-Кандидат на заміну:</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowSwapPanel(false)}
                    className="text-[10px] text-zinc-400 hover:text-white"
                  >
                    Скасувати
                  </button>
                </div>

                {currentSwapCandidate ? (
                  <div className="space-y-2.5">
                    <div className="p-2.5 rounded-xl bg-black/60 border border-white/10 flex items-center gap-3">
                      <div className="w-12 h-12 rounded-lg bg-black overflow-hidden shrink-0">
                        <img
                          src={currentSwapCandidate.candidate.photo}
                          alt={currentSwapCandidate.candidate.name}
                          className="w-full h-full object-cover"
                          onError={(e) => { (e.currentTarget as HTMLImageElement).src = '/dinner_steak_hd.jpg'; }}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h5 className="text-xs font-bold text-white truncate">{currentSwapCandidate.candidate.name}</h5>
                        <div className="text-[10.5px] text-zinc-300 flex items-center gap-2 mt-0.5">
                          <span className="text-amber-300 font-black">{currentSwapCandidate.candidate.macros.calories} ккал</span>
                          <span>•</span>
                          <span className="text-emerald-400 font-bold">{currentSwapCandidate.candidate.macros.protein}г Б</span>
                        </div>
                        <p className="text-[9.5px] text-amber-300/90 font-medium mt-0.5 truncate">
                          {currentSwapCandidate.matchReason}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={handleApplySwap}
                        className="py-2 px-3 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-zinc-950 font-black text-xs flex items-center justify-center gap-1.5 shadow-md active:scale-95 transition-all"
                      >
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                        <span>Замінити в 1 клік</span>
                      </button>

                      <button
                        type="button"
                        onClick={handleNextSwap}
                        className="py-2 px-3 rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 text-zinc-200 font-bold text-xs flex items-center justify-center gap-1 active:scale-95 transition-all"
                      >
                        <RefreshCw className="w-3 h-3 text-amber-400" />
                        <span>Замінити знов</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-zinc-400 text-center py-2">
                    Немає інших кандидатів з подібним балансом.
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Кнопки дій */}
          <div className="pt-2 space-y-2">
            <button
              type="button"
              onClick={() => {
                onToggleEaten(mealType, entry.id);
                onClose();
              }}
              className={`w-full py-3 rounded-2xl font-black text-xs flex items-center justify-center gap-2 shadow-lg transition-all active:scale-[0.98] ${
                isEaten
                  ? 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-white/10'
                  : 'bg-gradient-to-r from-amber-400 to-amber-500 text-zinc-950 shadow-amber-500/20'
              }`}
            >
              <Check className="w-4 h-4 stroke-[3]" />
              <span>{isEaten ? 'Позначити як "Ще не з\'їдено"' : '✓ Позначити з\'їденим прямо зараз'}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                onRemove(mealType, entry.id);
                onClose();
              }}
              className="w-full py-2.5 rounded-2xl bg-white/[0.03] hover:bg-rose-500/10 border border-white/5 hover:border-rose-500/30 text-zinc-400 hover:text-rose-300 font-bold text-xs transition-all text-center"
            >
              Видалити страву з розкладу
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
