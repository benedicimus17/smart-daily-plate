import React, { useState } from 'react';
import {
  X,
  Trash2,
  Check,
  Search,
  Zap,
  ArrowRight
} from 'lucide-react';
import { MealType, Macros } from '../types/nutrition';
import { parseQuickDishInput } from '../services/recipeParser';

export interface QuickPreset {
  id: string;
  name: string;
  category: string;
  icon: string;
  weightGrams: number;
  macros: Macros;
  note: string;
}

export const REALITY_PRESETS: QuickPreset[] = [
  {
    id: 'croissant_coffee',
    name: '2 масляні круасани з кавою (Mercadona/Пекарня)',
    category: 'Випічка на ходу',
    icon: '🥐',
    weightGrams: 160,
    macros: { calories: 640, protein: 12, fat: 34, carbs: 72 },
    note: '2 свіжі круасани з кавою без цукру'
  },
  {
    id: 'pizza_slice',
    name: 'Піца (2 шматки або 1/2 піци Mercadona/Pizzeria)',
    category: 'Фастфуд / Піца',
    icon: '🍕',
    weightGrams: 240,
    macros: { calories: 680, protein: 26, fat: 28, carbs: 80 },
    note: 'Тонке тісто, сир моцарела, томати'
  },
  {
    id: 'sandwich_baguette',
    name: 'Сендвіч / Багет з шинкою та сиром (Bocadillo)',
    category: 'Сендвіч',
    icon: '🥪',
    weightGrams: 200,
    macros: { calories: 520, protein: 24, fat: 20, carbs: 60 },
    note: 'Хрусткий хліб, хамон/шинка, сир'
  },
  {
    id: 'market_salad_bowl',
    name: 'Готовий боул / Салат з супермаркету з куркою',
    category: 'Швидкий салат',
    icon: '🥗',
    weightGrams: 280,
    macros: { calories: 360, protein: 28, fat: 14, carbs: 30 },
    note: 'Мікс зелені, куряче філе, заправка'
  },
  {
    id: 'shawarma_kebab',
    name: 'Шаурма / Донер кебаб (Вулична їжа)',
    category: 'Вулична їжа',
    icon: '🌯',
    weightGrams: 350,
    macros: { calories: 720, protein: 36, fat: 32, carbs: 72 },
    note: 'Лаваш, мʼясо на вертелі, овочі, часниковий соус'
  },
  {
    id: 'burger_fries',
    name: 'Бургер класичний з яловичиною',
    category: 'Фастфуд',
    icon: '🍔',
    weightGrams: 220,
    macros: { calories: 590, protein: 30, fat: 29, carbs: 52 },
    note: 'Булочка бріош, котлета з яловичини, соус'
  },
  {
    id: 'protein_bar_shake',
    name: 'Протеїновий батончик + напій',
    category: 'Спорт-снек',
    icon: '🥤',
    weightGrams: 90,
    macros: { calories: 280, protein: 25, fat: 9, carbs: 24 },
    note: 'Швидкий перекус у дорозі'
  },
  {
    id: 'sushi_set',
    name: 'Суші сет (8 ролів, лосось/філадельфія)',
    category: 'Японська їжа',
    icon: '🍣',
    weightGrams: 240,
    macros: { calories: 440, protein: 18, fat: 12, carbs: 64 },
    note: 'Рис, лосось, крем-сир, норі'
  }
];

interface QuickMealSwapModalProps {
  isOpen: boolean;
  mealType: MealType;
  currentDishName?: string;
  currentCalories?: number;
  onClose: () => void;
  onSkipMeal: (mealType: MealType) => void;
  onReplaceMeal: (
    mealType: MealType,
    newDish: {
      name: string;
      weightGrams: number;
      macros: Macros;
      recipeDetails?: string;
    }
  ) => void;
}

const MEAL_LABELS: Record<MealType, string> = {
  breakfast: 'Сніданок',
  lunch: 'Обід',
  dinner: 'Вечеря',
  snack: 'Перекус'
};

export const QuickMealSwapModal: React.FC<QuickMealSwapModalProps> = ({
  isOpen,
  mealType,
  currentDishName,
  currentCalories,
  onClose,
  onSkipMeal,
  onReplaceMeal
}) => {
  const [customInput, setCustomInput] = useState('');
  const [customCalories, setCustomCalories] = useState('');
  const [parsedPreview, setParsedPreview] = useState<{ name: string; calories: number } | null>(null);

  if (!isOpen) return null;

  const handleInputChange = (val: string) => {
    setCustomInput(val);
    if (val.trim().length >= 3) {
      const parsed = parseQuickDishInput(val);
      if (parsed) {
        setParsedPreview({
          name: parsed.name,
          calories: parsed.macros.calories
        });
      } else {
        setParsedPreview(null);
      }
    } else {
      setParsedPreview(null);
    }
  };

  const handleApplyPreset = (preset: QuickPreset) => {
    onReplaceMeal(mealType, {
      name: preset.name,
      weightGrams: preset.weightGrams,
      macros: preset.macros,
      recipeDetails: preset.note
    });
    onClose();
  };

  const handleApplyCustom = (e: React.FormEvent) => {
    e.preventDefault();
    const title = customInput.trim();
    if (!title) return;

    // Спроба розпарсити через NLP онтологію або звичайне число калорій
    const parsed = parseQuickDishInput(title);
    const manualCals = parseInt(customCalories, 10);

    const calories = manualCals || (parsed ? parsed.macros.calories : 500);
    const protein = parsed ? parsed.macros.protein : Math.round(calories * 0.15 / 4);
    const fat = parsed ? parsed.macros.fat : Math.round(calories * 0.35 / 9);
    const carbs = parsed ? parsed.macros.carbs : Math.round(calories * 0.50 / 4);

    onReplaceMeal(mealType, {
      name: title,
      weightGrams: parsed?.weightGrams || 200,
      macros: { calories, protein, fat, carbs },
      recipeDetails: `Швидка заміна в 1 клік (${title})`
    });
    onClose();
  };

  return (
    <div
      id="quick-meal-swap-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fadeIn select-none"
      onClick={onClose}
    >
      <div
        id="quick-meal-swap-modal"
        className="w-full max-w-md rounded-[32px] p-5 sm:p-6 text-white relative max-h-[92vh] overflow-y-auto shadow-[0_25px_60px_rgba(0,0,0,0.95)] border border-white/10"
        onClick={(e) => e.stopPropagation()}
        style={{
          background: 'linear-gradient(165deg, rgba(20,28,23,0.98) 0%, rgba(10,15,12,0.99) 100%)'
        }}
      >
        {/* Кнопка закриття */}
        <button
          id="btn-close-swap-modal"
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-zinc-400 hover:text-white transition-all active:scale-95 cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Заголовок */}
        <div className="pr-8 space-y-1">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-400/15 border border-amber-400/30 text-amber-300 text-[11px] font-black uppercase tracking-wider">
            <Zap className="w-3 h-3 text-amber-400" />
            <span>Реальне життя • Швидка підміна</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            Що ви з'їли на {MEAL_LABELS[mealType]}?
          </h2>
          {currentDishName && (
            <p className="text-xs text-zinc-400">
              Зараз у плані: <span className="text-zinc-200 font-semibold">{currentDishName}</span>
              {currentCalories ? ` (${currentCalories} ккал)` : ''}
            </p>
          )}
        </div>

        {/* 1. ВАРІАНТ: ПРОПУСТИВ ПРИЙОМ ЇЖІ В 1 ТАП */}
        <div className="mt-4 pt-3 border-t border-white/10">
          <button
            id="btn-skip-meal-now"
            type="button"
            onClick={() => {
              onSkipMeal(mealType);
              onClose();
            }}
            className="w-full p-3.5 rounded-2xl bg-rose-500/10 hover:bg-rose-500/15 border border-rose-500/30 hover:border-rose-500/50 flex items-center justify-between text-left transition-all active:scale-[0.98] group cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-rose-500/20 text-rose-300 flex items-center justify-center shrink-0">
                <Trash2 className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-black text-rose-200 group-hover:text-rose-100">
                  Пропустив цей прийом (0 ккал)
                </div>
                <div className="text-[10px] text-zinc-400">
                  Не було часу / на інтервальному голодуванні. Вивільнити калорії дня.
                </div>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-rose-400/60 group-hover:text-rose-300 group-hover:translate-x-0.5 transition-all shrink-0" />
          </button>
        </div>

        {/* 2. ВАРІАНТ: ПОПУЛЯРНІ СИТУАЦІЇ (MERCADONA / ПІЦА / КРУАСАНИ) */}
        <div className="mt-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-zinc-300 uppercase tracking-wider">
              Швидкі готові варіанти (1 тап)
            </span>
            <span className="text-[10px] text-zinc-500">Авто-розрахунок КБЖВ</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-56 overflow-y-auto pr-1">
            {REALITY_PRESETS.map((preset) => (
              <button
                key={preset.id}
                id={`btn-preset-${preset.id}`}
                type="button"
                onClick={() => handleApplyPreset(preset)}
                className="p-2.5 rounded-2xl bg-black/40 hover:bg-white/[0.06] border border-white/10 hover:border-amber-400/40 text-left transition-all active:scale-[0.98] flex items-center gap-2.5 group cursor-pointer"
              >
                <span className="text-2xl shrink-0 group-hover:scale-110 transition-transform">
                  {preset.icon}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="text-[11px] font-bold text-white truncate leading-tight">
                    {preset.name}
                  </div>
                  <div className="flex items-center gap-1.5 text-[9.5px] text-zinc-400 mt-0.5">
                    <span className="text-amber-300 font-extrabold">{preset.macros.calories} ккал</span>
                    <span>•</span>
                    <span className="text-emerald-400">{preset.macros.protein}г Б</span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* 3. ВАРІАНТ: ВВЕСТИ СВОЄ ЗА 2 СЕКУНДИ */}
        <form onSubmit={handleApplyCustom} className="mt-4 pt-3 border-t border-white/10 space-y-2.5">
          <label className="text-xs font-bold text-zinc-300 uppercase tracking-wider block">
            Або введіть що з'їли (наприклад: 2 круасани, піца, шаурма)
          </label>

          <div className="space-y-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <input
                id="input-swap-custom-dish"
                type="text"
                value={customInput}
                onChange={(e) => handleInputChange(e.target.value)}
                placeholder="Наприклад: 2 круасани з капучино..."
                className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-black/50 border border-white/10 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-400"
              />
            </div>

            <div className="flex gap-2">
              <input
                id="input-swap-custom-calories"
                type="number"
                value={customCalories}
                onChange={(e) => setCustomCalories(e.target.value)}
                placeholder="Калорії (якщо відомо, або лишіть пустим)"
                className="flex-1 px-3 py-2 rounded-xl bg-black/50 border border-white/10 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-400"
              />

              <button
                id="btn-apply-custom-swap"
                type="submit"
                disabled={!customInput.trim()}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 disabled:opacity-40 text-zinc-950 font-black text-xs flex items-center gap-1.5 shadow-md active:scale-95 transition-all cursor-pointer"
              >
                <Check className="w-3.5 h-3.5 stroke-[3]" />
                <span>Замінити</span>
              </button>
            </div>

            {parsedPreview && (
              <div className="p-2 rounded-xl bg-amber-400/10 border border-amber-400/30 text-[10.5px] text-amber-200 flex items-center justify-between">
                <span>Знайдено в онтології: <strong>{parsedPreview.name}</strong></span>
                <span className="font-black text-amber-300">~{parsedPreview.calories} ккал</span>
              </div>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};
