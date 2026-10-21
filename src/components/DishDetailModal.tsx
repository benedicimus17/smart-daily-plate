import React from 'react';
import { X, Check, ChefHat, Sparkles, Scale } from 'lucide-react';
import { MealEntry, MealType } from '../types/nutrition';

interface DishDetailModalProps {
  isOpen: boolean;
  mealType: MealType | null;
  entry: MealEntry | null;
  onClose: () => void;
  onToggleEaten: (mealType: MealType, entryId: string) => void;
  onRemove: (mealType: MealType, entryId: string) => void;
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
  }
};

export const DishDetailModal: React.FC<DishDetailModalProps> = ({
  isOpen,
  mealType,
  entry,
  onClose,
  onToggleEaten,
  onRemove
}) => {
  if (!isOpen || !entry || !mealType) return null;

  // Визначаємо деталі страви за назвою
  const lowerName = entry.name.toLowerCase();
  let recipeMeta = DEFAULT_RECIPES['steak'];
  if (lowerName.includes('омлет') || lowerName.includes('яйц') || lowerName.includes('авокадо')) {
    recipeMeta = DEFAULT_RECIPES['omelet'];
  } else if (lowerName.includes('кур') || lowerName.includes('філе') || lowerName.includes('кіноа') || lowerName.includes('гречк')) {
    recipeMeta = DEFAULT_RECIPES['chicken'];
  } else if (lowerName.includes('йогурт') || lowerName.includes('ягід') || lowerName.includes('перекус')) {
    recipeMeta = DEFAULT_RECIPES['yogurt'];
  }

  const isEaten = entry.eaten !== false;

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
              // Fallback на локальний стейк
              (e.currentTarget as HTMLImageElement).src = '/dinner_steak_hd.jpg';
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#121814] via-[#121814]/40 to-transparent" />

          {/* Плашка часу та типу */}
          <div className="absolute bottom-3 left-4 flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-xl bg-amber-400/90 text-zinc-950 text-[11px] font-black tracking-tight shadow-md">
              {entry.timestamp || 'За розкладом'}
            </span>
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
