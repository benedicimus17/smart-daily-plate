import React, { useState } from 'react';
import { ChefHat, Scale, Sparkles, AlertCircle } from 'lucide-react';
import { calculateCookLoss } from '../math/cookLoss';
import { RawIngredient } from '../types/cookLoss';

export const CookLossCalculator: React.FC = () => {
  const [emptyPot, setEmptyPot] = useState('850');
  const [totalRaw, setTotalRaw] = useState('1200');
  const [potWithCooked, setPotWithCooked] = useState('1750');
  const [rawCalories, setRawCalories] = useState('1450');
  const [rawProtein, setRawProtein] = useState('110');

  const emptyPotWeight = parseFloat(emptyPot) || 0;
  const rawWeight = parseFloat(totalRaw) || 0;
  const potWithCookedWeight = parseFloat(potWithCooked) || 0;
  const totalCalories = parseFloat(rawCalories) || 0;
  const totalProtein = parseFloat(rawProtein) || 0;

  // Формуємо сирий інгредієнт для розрахунку
  const mockIngredients: RawIngredient[] = [
    {
      id: 'pot-raw-mix',
      name: 'Інгредієнти каструлі',
      rawWeightGrams: rawWeight,
      macrosPer100g: {
        calories: rawWeight > 0 ? (totalCalories / rawWeight) * 100 : 0,
        protein: rawWeight > 0 ? (totalProtein / rawWeight) * 100 : 0,
        fat: 3,
        carbs: 10
      }
    }
  ];

  let calculationResult = null;
  let calculationError = null;

  try {
    if (potWithCookedWeight > emptyPotWeight && rawWeight > 0) {
      calculationResult = calculateCookLoss({
        emptyPotWeightGrams: emptyPotWeight,
        potWithCookedDishWeightGrams: potWithCookedWeight,
        ingredients: mockIngredients
      });
    }
  } catch (err: unknown) {
    if (err instanceof Error) {
      calculationError = err.message;
    }
  }

  return (
    <div className="space-y-4 animate-fadeIn pb-24">
      <div className="glass-card rounded-4xl p-5 border border-white">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-2xl bg-brand-emerald/10 text-brand-emerald flex items-center justify-center">
            <ChefHat className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-800">Cook-Loss Engine</h2>
            <p className="text-xs text-slate-400">Точний розрахунок уварювання без виймання їжі з каструлі</p>
          </div>
        </div>

        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Вага сухого посуду (г)</label>
              <input
                type="number"
                value={emptyPot}
                onChange={(e) => setEmptyPot(e.target.value)}
                placeholder="850"
                className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-sm focus:border-brand-emerald focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Сумарна сира вага (г)</label>
              <input
                type="number"
                value={totalRaw}
                onChange={(e) => setTotalRaw(e.target.value)}
                placeholder="1200"
                className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-sm focus:border-brand-emerald focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Вага гарячої каструлі з їжею на вагах (г)</label>
            <input
              type="number"
              value={potWithCooked}
              onChange={(e) => setPotWithCooked(e.target.value)}
              placeholder="1750"
              className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-sm font-bold text-slate-800 focus:border-brand-emerald focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-100">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Сирі ккал каструлі</label>
              <input
                type="number"
                value={rawCalories}
                onChange={(e) => setRawCalories(e.target.value)}
                placeholder="1450"
                className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-sm text-brand-emerald font-semibold focus:border-brand-emerald focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Сирий білок каструлі (г)</label>
              <input
                type="number"
                value={rawProtein}
                onChange={(e) => setRawProtein(e.target.value)}
                placeholder="110"
                className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-sm font-semibold focus:border-brand-emerald focus:outline-none"
              />
            </div>
          </div>
        </div>
      </div>

      {calculationError && (
        <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-2 text-xs text-rose-700">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{calculationError}</span>
        </div>
      )}

      {/* Розрахований результат */}
      {calculationResult && (
        <div className="glass-card rounded-4xl p-5 border border-emerald-100 bg-gradient-to-br from-white/90 to-emerald-50/40">
          <div className="flex items-center justify-between pb-3 border-b border-emerald-100/60">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-brand-emerald" /> Результат готової страви
            </span>
            <span className="text-xs font-semibold text-slate-500">
              {calculationResult.waterLossPercentage >= 0 ? 'Википіло' : 'Увібрало'}:{' '}
              <span className="text-brand-amber font-bold">{Math.abs(calculationResult.waterLossPercentage)}%</span> води
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2 mt-4 text-center">
            <div className="p-3 bg-white/80 rounded-2xl border border-white shadow-sm">
              <div className="text-[10px] text-slate-400 uppercase font-semibold">Готова маса</div>
              <div className="text-base font-extrabold text-slate-800 mt-0.5">
                {calculationResult.cookedDishWeightGrams}г
              </div>
            </div>

            <div className="p-3 bg-white/80 rounded-2xl border border-white shadow-sm">
              <div className="text-[10px] text-brand-emerald uppercase font-semibold">ккал / 100г</div>
              <div className="text-base font-extrabold text-brand-emerald mt-0.5">
                {calculationResult.cookedMacrosPer100g.calories}
              </div>
            </div>

            <div className="p-3 bg-white/80 rounded-2xl border border-white shadow-sm">
              <div className="text-[10px] text-slate-600 uppercase font-semibold">Білок / 100г</div>
              <div className="text-base font-extrabold text-slate-800 mt-0.5">
                {calculationResult.cookedMacrosPer100g.protein}г
              </div>
            </div>
          </div>

          <button className="w-full mt-4 py-2.5 rounded-2xl bg-brand-emerald text-white text-xs font-bold shadow-glow-emerald flex items-center justify-center gap-1.5 active:scale-95 transition-all">
            <Scale className="w-4 h-4" /> Зафіксувати страву в базі
          </button>
        </div>
      )}
    </div>
  );
};
