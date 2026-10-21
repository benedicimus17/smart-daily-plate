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
  Calendar
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
    shortDesc: 'Ніжні сирники на рисовому борошні без цукру'
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
    shortDesc: '3 добірні яйця, стигле авокадо хасс та оливкова олія'
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
    shortDesc: 'Вівсянка тривалого варіння, ізолят та лохина'
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
    shortDesc: 'Цільнозерновий хліб на заквасці з мікрогріном'
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
    shortDesc: 'Запечене філе в прованських травах та суперфуд кіноа'
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
    shortDesc: 'Омега-3 лосось, свіжий огірок, норі та кунжутний дресинг'
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
    shortDesc: 'Тверді сорти пшениці, креветки 16/20, часник та базилік'
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
    shortDesc: 'Нежирна яловичина, томати чері та діжонська заправка'
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
    shortDesc: 'Швидке засвоєння білка без зайвих калорій'
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
    shortDesc: 'Автентичний густий йогурт, свіжа чорниця та малина'
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
    shortDesc: 'Насіння чіа, антиоксиданти та рослинний білок'
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
    shortDesc: 'Еталонний соковитий стейк зернової відгодівлі'
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
    shortDesc: 'Біла морська риба, лимонний чебрець та молоді цукіні'
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
    shortDesc: 'Швидка прожарка Rare/Medium Rare, хрусткий кунжут'
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
    const matchesCategory = selectedFilter === 'all' || item.category === selectedFilter;
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.shortDesc.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
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
                      className="p-2.5 rounded-2xl bg-black/40 border border-white/10 flex items-center gap-3 transition-all hover:border-amber-400/30"
                    >
                      {/* Міні-фото */}
                      <div className="w-16 h-16 rounded-xl overflow-hidden bg-black shrink-0 relative">
                        <img
                          src={item.photo}
                          alt={item.name}
                          className="w-full h-full object-cover"
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

                        <h4 className="text-xs font-bold text-white truncate mt-0.5">
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
                        onClick={() => handleAddCatalogItem(item)}
                        className={`p-2 rounded-xl text-xs font-bold flex items-center justify-center transition-all shrink-0 active:scale-95 ${
                          isAdded
                            ? 'bg-emerald-500 text-zinc-950'
                            : 'bg-gradient-to-r from-amber-400 to-amber-500 text-zinc-950 shadow-md shadow-amber-400/20 hover:brightness-110'
                        }`}
                        title="Додати в розклад"
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
                type="button"
                onClick={() => handleParseVideo(parserUrl)}
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
      </div>
    </div>
  );
};
