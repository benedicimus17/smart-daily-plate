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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fadeIn">
      <div className="bg-[#101612]/95 border border-[#233226] rounded-3xl w-full max-w-sm p-6 relative shadow-[0_20px_50px_rgba(0,0,0,0.85)]">
        <div className="flex items-center justify-between pb-3 border-b border-[#233226]">
          <div>
            <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
              {mealTitles[mealType]}
            </span>
            <h3 className="text-lg font-bold text-zinc-100">Додати страву</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#18221B] hover:bg-[#223026] text-zinc-400 hover:text-zinc-200 border border-[#2A3B2E] flex items-center justify-center transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-3.5">
          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1">Назва страви / продукту</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Наприклад: Куряче філе гриль"
              className="w-full px-3.5 py-2.5 rounded-2xl bg-[#162019] border border-[#27392C] text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-amber-400/60 focus:ring-1 focus:ring-amber-400/40"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1">Вага порції (г)</label>
              <input
                type="number"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                placeholder="150"
                className="w-full px-3.5 py-2.5 rounded-2xl bg-[#162019] border border-[#27392C] text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-amber-400/60 focus:ring-1 focus:ring-amber-400/40"
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
                className="w-full px-3.5 py-2.5 rounded-2xl bg-[#162019] border border-[#27392C] text-sm font-bold text-amber-300 placeholder:text-zinc-500 focus:outline-none focus:border-amber-400/60 focus:ring-1 focus:ring-amber-400/40"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-medium text-zinc-300">БЖВ (необов'язково)</label>
              <span className="text-[10px] text-zinc-400">Авторозрахунок за ккал</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <input
                type="number"
                value={protein}
                onChange={(e) => setProtein(e.target.value)}
                placeholder="Б (г)"
                className="w-full px-2.5 py-2 rounded-xl bg-[#162019] border border-emerald-500/30 text-xs text-center text-emerald-300 placeholder:text-zinc-500 focus:border-emerald-400 focus:outline-none"
              />
              <input
                type="number"
                value={fat}
                onChange={(e) => setFat(e.target.value)}
                placeholder="Ж (г)"
                className="w-full px-2.5 py-2 rounded-xl bg-[#162019] border border-amber-500/30 text-xs text-center text-amber-300 placeholder:text-zinc-500 focus:border-amber-400 focus:outline-none"
              />
              <input
                type="number"
                value={carbs}
                onChange={(e) => setCarbs(e.target.value)}
                placeholder="В (г)"
                className="w-full px-2.5 py-2 rounded-xl bg-[#162019] border border-indigo-500/30 text-xs text-center text-indigo-300 placeholder:text-zinc-500 focus:border-indigo-400 focus:outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full mt-4 py-3 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 text-zinc-950 font-bold text-sm shadow-[0_0_20px_rgba(245,158,11,0.4)] hover:brightness-110 active:scale-[0.98] flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-zinc-950" /> Додати в щоденник
          </button>
        </form>
      </div>
    </div>
  );
};
