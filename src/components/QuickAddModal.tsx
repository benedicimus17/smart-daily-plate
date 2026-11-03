import React, { useState, useEffect } from 'react';
import { MealType } from '../types/nutrition';
import { X, Sparkles, Clock } from 'lucide-react';
import { useTranslation } from '../store/languageStore';

interface QuickAddModalProps {
  isOpen: boolean;
  mealType: MealType | null;
  initialTime?: string;
  onClose: () => void;
  onAdd: (mealType: MealType, data: { name: string; weightGrams: number; macros: { calories: number; protein: number; fat: number; carbs: number }; timestamp?: string }) => void;
}

const DEFAULT_TIMES: Record<MealType, string> = {
  breakfast: '08:30',
  lunch: '13:00',
  snack: '11:00',
  dinner: '19:30'
};

const WEEK_DAYS: Record<string, string[]> = {
  uk: ['ПН', 'ВТ', 'СР', 'ЧТ', 'ПТ', 'СБ', 'НД'],
  es: ['LUN', 'MAR', 'MIÉ', 'JUE', 'VIE', 'SÁB', 'DOM'],
  en: ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'],
  de: ['MO', 'DI', 'MI', 'DO', 'FR', 'SA', 'SO'],
  fr: ['LUN', 'MAR', 'MER', 'JEU', 'VEN', 'SAM', 'DIM'],
  it: ['LUN', 'MAR', 'MER', 'GIO', 'VEN', 'SAB', 'DOM']
};

const getQuickTemplates = (lang: string) => {
  if (lang === 'es') {
    return [
      { name: 'Batido de proteínas (1 scoop)', weight: '30', calories: '120', protein: '25', fat: '1', carbs: '2', defaultMeal: 'snack' as MealType, time: '11:00' },
      { name: 'Tortitas de requesón', weight: '200', calories: '310', protein: '26', fat: '11', carbs: '24', defaultMeal: 'breakfast' as MealType, time: '09:00' },
      { name: 'Tortilla con aguacate', weight: '180', calories: '380', protein: '28', fat: '24', carbs: '12', defaultMeal: 'breakfast' as MealType, time: '08:30' },
      { name: 'Pechuga de pollo al horno', weight: '200', calories: '240', protein: '46', fat: '4', carbs: '0', defaultMeal: 'lunch' as MealType, time: '13:00' },
      { name: 'Yogur griego 2%', weight: '150', calories: '110', protein: '15', fat: '3', carbs: '6', defaultMeal: 'snack' as MealType, time: '16:30' }
    ];
  }
  if (lang === 'en') {
    return [
      { name: 'Protein Shake (1 scoop)', weight: '30', calories: '120', protein: '25', fat: '1', carbs: '2', defaultMeal: 'snack' as MealType, time: '11:00' },
      { name: 'Cottage Cheese Pancakes', weight: '200', calories: '310', protein: '26', fat: '11', carbs: '24', defaultMeal: 'breakfast' as MealType, time: '09:00' },
      { name: 'Avocado Omelette', weight: '180', calories: '380', protein: '28', fat: '24', carbs: '12', defaultMeal: 'breakfast' as MealType, time: '08:30' },
      { name: 'Baked Chicken Breast', weight: '200', calories: '240', protein: '46', fat: '4', carbs: '0', defaultMeal: 'lunch' as MealType, time: '13:00' },
      { name: 'Greek Yogurt 2%', weight: '150', calories: '110', protein: '15', fat: '3', carbs: '6', defaultMeal: 'snack' as MealType, time: '16:30' }
    ];
  }
  return [
    { name: 'Протеїновий шейк (1 скуп)', weight: '30', calories: '120', protein: '25', fat: '1', carbs: '2', defaultMeal: 'snack' as MealType, time: '11:00' },
    { name: 'Сирники з рікоти', weight: '200', calories: '310', protein: '26', fat: '11', carbs: '24', defaultMeal: 'breakfast' as MealType, time: '09:00' },
    { name: 'Омлет з авокадо', weight: '180', calories: '380', protein: '28', fat: '24', carbs: '12', defaultMeal: 'breakfast' as MealType, time: '08:30' },
    { name: 'Куряче філе запечене', weight: '200', calories: '240', protein: '46', fat: '4', carbs: '0', defaultMeal: 'lunch' as MealType, time: '13:00' },
    { name: 'Грецький йогурт 2%', weight: '150', calories: '110', protein: '15', fat: '3', carbs: '6', defaultMeal: 'snack' as MealType, time: '16:30' }
  ];
};

export const QuickAddModal: React.FC<QuickAddModalProps> = ({
  isOpen,
  mealType,
  initialTime,
  onClose,
  onAdd
}) => {
  const { t, lang } = useTranslation();

  const currentDaysList = WEEK_DAYS[lang] || WEEK_DAYS.uk;
  const templates = getQuickTemplates(lang);

  const [currentMealType, setCurrentMealType] = useState<MealType>(mealType || 'snack');
  const [time, setTime] = useState<string>(initialTime || (mealType ? DEFAULT_TIMES[mealType] : '11:00'));
  const [name, setName] = useState('');
  const [weight, setWeight] = useState('150');
  const [calories, setCalories] = useState('');
  const [protein, setProtein] = useState('');
  const [fat, setFat] = useState('');
  const [carbs, setCarbs] = useState('');

  const [selectedDays, setSelectedDays] = useState<string[]>([currentDaysList[0]]);

  useEffect(() => {
    if (mealType) {
      setCurrentMealType(mealType);
      setTime(initialTime || DEFAULT_TIMES[mealType] || '11:00');
    }
  }, [mealType, initialTime]);

  const toggleDay = (day: string) => {
    setSelectedDays(prev =>
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    );
  };

  const handleSelectTemplate = (item: ReturnType<typeof getQuickTemplates>[0]) => {
    setName(item.name);
    setWeight(item.weight);
    setCalories(item.calories);
    setProtein(item.protein);
    setFat(item.fat);
    setCarbs(item.carbs);
    setCurrentMealType(item.defaultMeal);
    setTime(item.time);
  };

  // Розумний авторозрахунок за назвою
  const handleAutoEstimate = () => {
    const lower = name.toLowerCase();
    const w = parseFloat(weight) || 100;

    if (lower.includes('протеїн') || lower.includes('шейк') || lower.includes('коктейль') || lower.includes('ізолят') || lower.includes('protein') || lower.includes('shake') || lower.includes('batido')) {
      const scoops = w / 30;
      setCalories(String(Math.round(120 * scoops)));
      setProtein(String(Math.round(25 * scoops)));
      setFat(String(Math.round(1.2 * scoops)));
      setCarbs(String(Math.round(2 * scoops)));
      return;
    }
    if (lower.includes('сирник') || lower.includes('рікот') || lower.includes('творог') || lower.includes('requesón') || lower.includes('cottage')) {
      const ratio = w / 100;
      setCalories(String(Math.round(155 * ratio)));
      setProtein(String(Math.round(13 * ratio)));
      setFat(String(Math.round(5.5 * ratio)));
      setCarbs(String(Math.round(12 * ratio)));
      return;
    }
    if (lower.includes('яйц') || lower.includes('egg') || lower.includes('huevo') || lower.includes('омлет') || lower.includes('tortilla')) {
      const ratio = w / 100;
      setCalories(String(Math.round(150 * ratio)));
      setProtein(String(Math.round(12.5 * ratio)));
      setFat(String(Math.round(10.5 * ratio)));
      setCarbs(String(Math.round(1.0 * ratio)));
      return;
    }
    if (lower.includes('кур') || lower.includes('chicken') || lower.includes('pollo') || lower.includes('філе') || lower.includes('pechuga')) {
      const ratio = w / 100;
      setCalories(String(Math.round(120 * ratio)));
      setProtein(String(Math.round(23.5 * ratio)));
      setFat(String(Math.round(2.0 * ratio)));
      setCarbs(String(0));
      return;
    }

    // Загальна формула за калоріями, якщо калорії введено
    const cal = parseFloat(calories) || Math.round(w * 1.5);
    setCalories(String(cal));
    setProtein(String(Math.round((cal * 0.25) / 4)));
    setFat(String(Math.round((cal * 0.25) / 9)));
    setCarbs(String(Math.round((cal * 0.50) / 4)));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    let cal = parseFloat(calories);
    let p = parseFloat(protein);
    let f = parseFloat(fat);
    let c = parseFloat(carbs);

    const hasP = !isNaN(p) && p >= 0;
    const hasF = !isNaN(f) && f >= 0;
    const hasC = !isNaN(c) && c >= 0;
    const hasMacros = hasP || hasF || hasC;

    // Розрахунок за формулою Етватера, якщо калорії не введено вручну
    if ((isNaN(cal) || cal <= 0) && hasMacros) {
      cal = Math.round((p || 0) * 4 + (f || 0) * 9 + (c || 0) * 4);
    } else if (isNaN(cal) || cal <= 0) {
      const lower = name.toLowerCase();
      const w = parseFloat(weight) || 100;
      if (lower.includes('протеїн') || lower.includes('шейк') || lower.includes('batido') || lower.includes('protein')) {
        cal = Math.round((w / 30) * 120);
        p = Math.round((w / 30) * 25);
        f = Math.round((w / 30) * 1);
        c = Math.round((w / 30) * 2);
      } else {
        cal = Math.round(w * 1.5);
        p = Math.round((cal * 0.25) / 4);
        f = Math.round((cal * 0.25) / 9);
        c = Math.round((cal * 0.50) / 4);
      }
    } else {
      if (isNaN(p)) p = Math.round((cal * 0.25) / 4);
      if (isNaN(f)) f = Math.round((cal * 0.25) / 9);
      if (isNaN(c)) c = Math.round((cal * 0.50) / 4);
    }

    onAdd(currentMealType, {
      name: name.trim() || (lang === 'es' ? 'Plato' : lang === 'en' ? 'Dish' : 'Страва'),
      weightGrams: parseFloat(weight) || 100,
      timestamp: time || DEFAULT_TIMES[currentMealType],
      macros: {
        calories: cal,
        protein: p,
        fat: f,
        carbs: c
      }
    });

    onClose();
  };

  if (!isOpen || !mealType) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="bg-[#101612]/95 border border-[#233226] rounded-3xl w-full max-w-sm p-5 relative shadow-[0_20px_50px_rgba(0,0,0,0.85)] max-h-[92vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-2.5 border-b border-[#233226]">
          <div>
            <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block">
              {t('quick_add_title')}
            </span>
            <h3 className="text-base font-black text-zinc-100">{t('quick_add_subtitle')}</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-[#18221B] hover:bg-[#223026] text-zinc-400 hover:text-zinc-200 border border-[#2A3B2E] flex items-center justify-center transition-all cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* 1. ВИБІР КАТЕГОРІЇ ТА ЧАСУ */}
        <div className="mt-3 space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-[10.5px] font-bold text-zinc-400 uppercase tracking-wider">
              {t('quick_add_type')}
            </label>
            <div className="flex items-center gap-1.5 bg-black/40 px-2 py-1 rounded-xl border border-white/10">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="bg-transparent text-amber-300 font-black text-xs focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-4 gap-1.5">
            {(['breakfast', 'snack', 'lunch', 'dinner'] as MealType[]).map((type) => {
              const isSelected = currentMealType === type;

              return (
                <button
                  key={type}
                  type="button"
                  onClick={() => {
                    setCurrentMealType(type);
                    if (!time || time === DEFAULT_TIMES[currentMealType]) {
                      setTime(DEFAULT_TIMES[type]);
                    }
                  }}
                  className={`py-1.5 rounded-xl text-[11px] font-bold transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-amber-400 text-zinc-950 shadow-md shadow-amber-400/20'
                      : 'bg-white/5 text-zinc-400 hover:text-white border border-white/5'
                  }`}
                >
                  {t(type)}
                </button>
              );
            })}
          </div>
        </div>

        {/* 2. ШВИДКІ ШАБЛОНИ (ПРОТЕЇН, СИРНИКИ, ОМЛЕТ) */}
        <div className="mt-3">
          <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block mb-1.5">
            {t('quick_add_quick_templates')}
          </label>
          <div className="flex flex-wrap gap-1.5">
            {templates.map((item) => (
              <button
                key={item.name}
                type="button"
                onClick={() => handleSelectTemplate(item)}
                className="px-2.5 py-1 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-[10.5px] font-bold text-zinc-300 hover:text-amber-300 hover:border-amber-400/30 transition-all active:scale-95 cursor-pointer"
              >
                {item.name}
              </button>
            ))}
          </div>
        </div>

        {/* 3. ФОРМА ВВЕДЕННЯ */}
        <form onSubmit={handleSubmit} className="mt-3 space-y-3">
          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1">
              {t('quick_add_name')}
            </label>
            <input
              id="quick-add-name-input"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t('quick_add_name_ph')}
              className="w-full px-3.5 py-2 rounded-xl bg-[#162019] border border-[#27392C] text-xs font-bold text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-amber-400/60"
            />
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">{t('quick_add_weight')}</label>
              <input
                id="quick-add-weight-input"
                type="number"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                placeholder="100"
                className="w-full px-3.5 py-2 rounded-xl bg-[#162019] border border-[#27392C] text-xs font-bold text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-amber-400/60"
              />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-zinc-300">{t('quick_add_calories')}</label>
                <button
                  type="button"
                  onClick={handleAutoEstimate}
                  className="text-[9.5px] text-amber-400 hover:underline flex items-center gap-0.5 cursor-pointer"
                >
                  <Sparkles className="w-2.5 h-2.5" /> Auto
                </button>
              </div>
              <input
                id="quick-add-cal-input"
                type="number"
                value={calories}
                onChange={(e) => setCalories(e.target.value)}
                placeholder="150"
                className="w-full px-3.5 py-2 rounded-xl bg-[#162019] border border-[#27392C] text-xs font-extrabold text-amber-300 placeholder:text-zinc-500 focus:outline-none focus:border-amber-400/60"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-zinc-300">БЖВ / PFC</label>
              <span className="text-[10px] text-zinc-500">{t('quick_add_protein')} • {t('quick_add_fat')} • {t('quick_add_carbs')}</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <input
                id="quick-add-p-input"
                type="number"
                value={protein}
                onChange={(e) => setProtein(e.target.value)}
                placeholder="P"
                className="w-full px-2 py-1.5 rounded-xl bg-[#162019] border border-emerald-500/30 text-xs text-center font-bold text-emerald-300 placeholder:text-zinc-500 focus:border-emerald-400 focus:outline-none"
              />
              <input
                id="quick-add-f-input"
                type="number"
                value={fat}
                onChange={(e) => setFat(e.target.value)}
                placeholder="F"
                className="w-full px-2 py-1.5 rounded-xl bg-[#162019] border border-amber-500/30 text-xs text-center font-bold text-amber-300 placeholder:text-zinc-500 focus:border-amber-400 focus:outline-none"
              />
              <input
                id="quick-add-c-input"
                type="number"
                value={carbs}
                onChange={(e) => setCarbs(e.target.value)}
                placeholder="C"
                className="w-full px-2 py-1.5 rounded-xl bg-[#162019] border border-indigo-500/30 text-xs text-center font-bold text-indigo-300 placeholder:text-zinc-500 focus:border-indigo-400 focus:outline-none"
              />
            </div>
          </div>

          {/* Мульти-вибір днів тижня для планування */}
          <div className="pt-1">
            <label className="text-[10.5px] font-bold text-zinc-400 uppercase tracking-wider block mb-1.5">
              {t('quick_add_repeat_days')}
            </label>
            <div className="flex items-center justify-between gap-1">
              {currentDaysList.map((d) => {
                const active = selectedDays.includes(d);
                return (
                  <button
                    key={d}
                    type="button"
                    onClick={() => toggleDay(d)}
                    className={`flex-1 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                      active
                        ? 'bg-amber-400 text-zinc-950 shadow-sm'
                        : 'bg-white/5 text-zinc-400 hover:text-white border border-white/5'
                    }`}
                  >
                    {d}
                  </button>
                );
              })}
            </div>
          </div>

          <button
            id="quick-add-submit-btn"
            type="submit"
            className="w-full mt-3 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 text-zinc-950 font-black text-xs shadow-md hover:brightness-110 active:scale-[0.98] flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-zinc-950" />
            <span>{t('quick_add_btn')} ({time} • {selectedDays.length} {lang === 'es' ? 'días' : lang === 'en' ? 'days' : 'дн.'})</span>
          </button>
        </form>
      </div>
    </div>
  );
};
