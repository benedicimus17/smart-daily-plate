import React, { useState } from 'react';
import { MealType } from '../types/nutrition';
import { X, Sparkles } from 'lucide-react';

interface QuickAddModalProps {
  isOpen: boolean;
  mealType: MealType | null;
  onClose: () => void;
  onAdd: (mealType: MealType, data: { name: string; weightGrams: number; macros: { calories: number; protein: number; fat: number; carbs: number } }) => void;
}

export const QuickAddModal: React.FC<QuickAddModalProps> = ({
  isOpen,
  mealType,
  onClose,
  onAdd
}) => {
  if (!isOpen || !mealType) return null;

  const [name, setName] = useState('');
  const [weight, setWeight] = useState('150');
  const [calories, setCalories] = useState('');
  const [protein, setProtein] = useState('');
  const [fat, setFat] = useState('');
  const [carbs, setCarbs] = useState('');

  const [selectedDays, setSelectedDays] = useState<string[]>(['ПН']);

  const toggleDay = (day: string) => {
    setSelectedDays(prev =>
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    );
  };

  const quickTemplates = [
    { name: 'Омлет з авокадо', weight: '180', calories: '380', protein: '28', fat: '24', carbs: '12' },
    { name: 'Куряче філе запечене', weight: '200', calories: '240', protein: '46', fat: '4', carbs: '0' },
    { name: 'Гречка варена', weight: '150', calories: '165', protein: '5', fat: '2', carbs: '32' },
    { name: 'Грецький йогурт 2%', weight: '150', calories: '110', protein: '15', fat: '3', carbs: '6' }
  ];

  const handleSelectTemplate = (t: typeof quickTemplates[0]) => {
    setName(t.name);
    setWeight(t.weight);
    setCalories(t.calories);
    setProtein(t.protein);
    setFat(t.fat);
    setCarbs(t.carbs);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cal = parseFloat(calories) || 0;
    if (cal <= 0) return;

    onAdd(mealType, {
      name: name.trim() || 'Страва',
      weightGrams: parseFloat(weight) || 100,
      macros: {
        calories: cal,
        protein: parseFloat(protein) || Math.round(cal * 0.15 / 4),
        fat: parseFloat(fat) || Math.round(cal * 0.3 / 9),
        carbs: parseFloat(carbs) || Math.round(cal * 0.55 / 4)
      }
    });

    onClose();
  };

  const mealTitles: Record<MealType, string> = {
    breakfast: 'Сніданок',
    lunch: 'Обід',
    dinner: 'Вечеря',
    snack: 'Перекус'
  };

  const allWeekDays = ['ПН', 'ВТ', 'СР', 'ЧТ', 'ПТ', 'СБ', 'НД'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fadeIn">
      <div className="bg-[#101612]/95 border border-[#233226] rounded-3xl w-full max-w-sm p-5 relative shadow-[0_20px_50px_rgba(0,0,0,0.85)] max-h-[92vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-2.5 border-b border-[#233226]">
          <div>
            <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
              {mealTitles[mealType]}
            </span>
            <h3 className="text-base font-bold text-zinc-100">Додати страву</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-[#18221B] hover:bg-[#223026] text-zinc-400 hover:text-zinc-200 border border-[#2A3B2E] flex items-center justify-center transition-all"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Швидкі шаблони */}
        <div className="mt-3">
          <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block mb-1.5">
            Швидкі страви з бази:
          </label>
          <div className="flex flex-wrap gap-1.5">
            {quickTemplates.map((t) => (
              <button
                key={t.name}
                type="button"
                onClick={() => handleSelectTemplate(t)}
                className="px-2.5 py-1 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-[10.5px] text-zinc-300 hover:text-amber-300 transition-all active:scale-95"
              >
                {t.name}
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="mt-3 space-y-3">
          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1">Назва страви / продукту</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Наприклад: Куряче філе гриль"
              className="w-full px-3.5 py-2 rounded-xl bg-[#162019] border border-[#27392C] text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-amber-400/60"
            />
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1">Вага порції (г)</label>
              <input
                type="number"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                placeholder="150"
                className="w-full px-3.5 py-2 rounded-xl bg-[#162019] border border-[#27392C] text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-amber-400/60"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1">Калорії (ккал)</label>
              <input
                type="number"
                required
                value={calories}
                onChange={(e) => setCalories(e.target.value)}
                placeholder="250"
                className="w-full px-3.5 py-2 rounded-xl bg-[#162019] border border-[#27392C] text-sm font-bold text-amber-300 placeholder:text-zinc-500 focus:outline-none focus:border-amber-400/60"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-medium text-zinc-300">БЖВ</label>
              <span className="text-[10px] text-zinc-500">Авторозрахунок за ккал</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <input
                type="number"
                value={protein}
                onChange={(e) => setProtein(e.target.value)}
                placeholder="Б (г)"
                className="w-full px-2 py-1.5 rounded-xl bg-[#162019] border border-emerald-500/30 text-xs text-center text-emerald-300 placeholder:text-zinc-500 focus:border-emerald-400 focus:outline-none"
              />
              <input
                type="number"
                value={fat}
                onChange={(e) => setFat(e.target.value)}
                placeholder="Ж (г)"
                className="w-full px-2 py-1.5 rounded-xl bg-[#162019] border border-amber-500/30 text-xs text-center text-amber-300 placeholder:text-zinc-500 focus:border-amber-400 focus:outline-none"
              />
              <input
                type="number"
                value={carbs}
                onChange={(e) => setCarbs(e.target.value)}
                placeholder="В (г)"
                className="w-full px-2 py-1.5 rounded-xl bg-[#162019] border border-indigo-500/30 text-xs text-center text-indigo-300 placeholder:text-zinc-500 focus:border-indigo-400 focus:outline-none"
              />
            </div>
          </div>

          {/* Мульти-вибір днів тижня для планування */}
          <div className="pt-1">
            <label className="text-[10.5px] font-bold text-zinc-400 uppercase tracking-wider block mb-1.5">
              Повторити на дні (розклад):
            </label>
            <div className="flex items-center justify-between gap-1">
              {allWeekDays.map((d) => {
                const active = selectedDays.includes(d);
                return (
                  <button
                    key={d}
                    type="button"
                    onClick={() => toggleDay(d)}
                    className={`flex-1 py-1 rounded-lg text-[10px] font-bold transition-all ${
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
            type="submit"
            className="w-full mt-3 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 text-zinc-950 font-bold text-xs shadow-md hover:brightness-110 active:scale-[0.98] flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-zinc-950" />
            <span>Додати в розклад ({selectedDays.length} дн.)</span>
          </button>
        </form>
      </div>
    </div>
  );
};
