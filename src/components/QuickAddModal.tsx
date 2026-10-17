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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/30 backdrop-blur-sm animate-fadeIn">
      <div className="glass-card rounded-4xl w-full max-w-sm p-6 relative border border-white shadow-2xl">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              {mealTitles[mealType]}
            </span>
            <h3 className="text-lg font-bold text-slate-800">Додати страву</h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-3.5">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Назва страви / продукту</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Наприклад: Куряче філе гриль"
              className="w-full px-3.5 py-2.5 rounded-2xl bg-white border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-emerald/30 focus:border-brand-emerald"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Вага порції (г)</label>
              <input
                type="number"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                placeholder="150"
                className="w-full px-3.5 py-2.5 rounded-2xl bg-white border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-emerald/30 focus:border-brand-emerald"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Калорії (ккал)</label>
              <input
                type="number"
                required
                value={calories}
                onChange={(e) => setCalories(e.target.value)}
                placeholder="250"
                className="w-full px-3.5 py-2.5 rounded-2xl bg-white border border-slate-200 text-sm font-bold text-brand-emerald focus:outline-none focus:ring-2 focus:ring-brand-emerald/30 focus:border-brand-emerald"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-slate-600">БЖВ (необов'язково)</label>
              <span className="text-[10px] text-slate-400">Авторозрахунок за ккал</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <input
                type="number"
                value={protein}
                onChange={(e) => setProtein(e.target.value)}
                placeholder="Б (г)"
                className="w-full px-2.5 py-2 rounded-xl bg-white border border-slate-200 text-xs text-center focus:border-brand-emerald focus:outline-none"
              />
              <input
                type="number"
                value={fat}
                onChange={(e) => setFat(e.target.value)}
                placeholder="Ж (г)"
                className="w-full px-2.5 py-2 rounded-xl bg-white border border-slate-200 text-xs text-center focus:border-brand-amber focus:outline-none"
              />
              <input
                type="number"
                value={carbs}
                onChange={(e) => setCarbs(e.target.value)}
                placeholder="В (г)"
                className="w-full px-2.5 py-2 rounded-xl bg-white border border-slate-200 text-xs text-center focus:border-brand-indigo focus:outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full mt-4 py-3 rounded-2xl bg-brand-emerald hover:bg-emerald-600 active:scale-[0.98] text-white font-bold text-sm shadow-glow-emerald flex items-center justify-center gap-2 transition-all"
          >
            <Sparkles className="w-4 h-4" /> Додати в щоденник
          </button>
        </form>
      </div>
    </div>
  );
};
