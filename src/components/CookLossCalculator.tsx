import React, { useState } from 'react';
import { ChefHat, Scale, Sparkles, AlertCircle, ArrowLeft, X, CheckCircle2 } from 'lucide-react';
import { calculateCookLoss } from '../math/cookLoss';
import { RawIngredient } from '../types/cookLoss';
import { useNutritionStore } from '../store/nutritionStore';

interface CookLossCalculatorProps {
  onClose?: () => void;
}

export const CookLossCalculator: React.FC<CookLossCalculatorProps> = ({ onClose }) => {
  const { saveCookLossDish } = useNutritionStore();
  const [emptyPot, setEmptyPot] = useState('850');
  const [totalRaw, setTotalRaw] = useState('1200');
  const [potWithCooked, setPotWithCooked] = useState('1750');
  const [rawCalories, setRawCalories] = useState('1450');
  const [rawProtein, setRawProtein] = useState('110');
  const [dishName, setDishName] = useState('Домашня страва в каструлі');
  const [savedSuccess, setSavedSuccess] = useState(false);

  const emptyPotWeight = parseFloat(emptyPot) || 0;
  const rawWeight = parseFloat(totalRaw) || 0;
  const potWithCookedWeight = parseFloat(potWithCooked) || 0;
  const totalCalories = parseFloat(rawCalories) || 0;
  const totalProtein = parseFloat(rawProtein) || 0;

  // Формуємо сирий інгредієнт для розрахунку
  const mockIngredients: RawIngredient[] = [
    {
      id: 'pot-raw-mix',
      name: dishName,
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

  const handleSaveDish = () => {
    if (!calculationResult) return;
    saveCookLossDish({
      id: `cookloss-${Date.now()}`,
      name: dishName,
      dateCreated: new Date().toISOString(),
      ingredients: mockIngredients,
      totalRawWeightGrams: rawWeight,
      emptyPotWeightGrams: emptyPotWeight,
      potWithCookedDishWeightGrams: potWithCookedWeight,
      cookedDishWeightGrams: calculationResult.cookedDishWeightGrams,
      waterLossPercentage: calculationResult.waterLossPercentage,
      totalPotMacros: calculationResult.totalPotMacros,
      cookedMacrosPer100g: calculationResult.cookedMacrosPer100g
    });
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      if (onClose) onClose();
    }, 1200);
  };

  return (
    <div className="space-y-4 animate-fadeIn select-none text-white">
      {/* 1. ВЕРХНІЙ БАР З НАВІГАЦІЄЮ ТА ЗАКРИТТЯМ */}
      <div className="flex items-center justify-between pb-3 border-b border-white/10">
        <div className="flex items-center gap-2.5">
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white flex items-center gap-1 text-xs font-bold transition-all active:scale-95"
            >
              <ArrowLeft className="w-4 h-4 text-amber-400" />
              <span>Назад</span>
            </button>
          )}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-400/15 border border-amber-400/30 text-amber-400 flex items-center justify-center">
              <ChefHat className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-black text-white tracking-tight">Cook-Loss Engine</h2>
              <p className="text-[10px] text-zinc-400">Розрахунок уварки без виймання їжі з посуду</p>
            </div>
          </div>
        </div>

        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-zinc-400 hover:text-white"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* 2. НАЗВА СТРАВИ */}
      <div>
        <label className="block text-[11px] font-bold text-zinc-300 uppercase tracking-wider mb-1">
          Назва страви
        </label>
        <input
          type="text"
          value={dishName}
          onChange={(e) => setDishName(e.target.value)}
          placeholder="Наприклад: Борщ, Тушковане м'ясо"
          className="w-full px-3.5 py-2 rounded-xl bg-black/50 border border-white/15 text-white placeholder-zinc-500 text-xs font-semibold focus:border-amber-400 focus:outline-none"
        />
      </div>

      {/* 3. ОСНОВНІ ПОЛЯ ЗВАЖУВАННЯ (З ЧІТКИМ КОНТРАСТОМ) */}
      <div className="space-y-3 p-3.5 rounded-2xl bg-black/30 border border-white/10">
        <div className="grid grid-cols-2 gap-2.5">
          <div>
            <label className="block text-[10.5px] font-bold text-zinc-300 mb-1">
              Вага сухого посуду (г)
            </label>
            <input
              type="number"
              value={emptyPot}
              onChange={(e) => setEmptyPot(e.target.value)}
              placeholder="850"
              className="w-full px-3 py-2 rounded-xl bg-black/60 border border-white/20 text-sm font-black text-amber-300 focus:border-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-400/40"
            />
          </div>
          <div>
            <label className="block text-[10.5px] font-bold text-zinc-300 mb-1">
              Сумарна сира вага (г)
            </label>
            <input
              type="number"
              value={totalRaw}
              onChange={(e) => setTotalRaw(e.target.value)}
              placeholder="1200"
              className="w-full px-3 py-2 rounded-xl bg-black/60 border border-white/20 text-sm font-black text-amber-300 focus:border-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-400/40"
            />
          </div>
        </div>

        <div>
          <label className="block text-[10.5px] font-bold text-zinc-300 mb-1">
            Вага гарячої каструлі з їжею на вагах (г)
          </label>
          <input
            type="number"
            value={potWithCooked}
            onChange={(e) => setPotWithCooked(e.target.value)}
            placeholder="1750"
            className="w-full px-3 py-2.5 rounded-xl bg-black/70 border border-amber-400/40 text-base font-black text-white focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-400/30"
          />
        </div>

        <div className="grid grid-cols-2 gap-2.5 pt-2 border-t border-white/10">
          <div>
            <label className="block text-[10.5px] font-bold text-zinc-300 mb-1">
              Сирі ккал каструлі
            </label>
            <input
              type="number"
              value={rawCalories}
              onChange={(e) => setRawCalories(e.target.value)}
              placeholder="1450"
              className="w-full px-3 py-2 rounded-xl bg-black/60 border border-white/20 text-sm font-black text-amber-400 focus:border-amber-400 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-[10.5px] font-bold text-zinc-300 mb-1">
              Сирий білок каструлі (г)
            </label>
            <input
              type="number"
              value={rawProtein}
              onChange={(e) => setRawProtein(e.target.value)}
              placeholder="110"
              className="w-full px-3 py-2 rounded-xl bg-black/60 border border-white/20 text-sm font-black text-emerald-400 focus:border-emerald-400 focus:outline-none"
            />
          </div>
        </div>
      </div>

      {calculationError && (
        <div className="p-3 bg-rose-500/15 border border-rose-500/30 rounded-2xl flex items-center gap-2 text-xs text-rose-300">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
          <span>{calculationError}</span>
        </div>
      )}

      {/* 4. РОЗРАХОВАНИЙ РЕЗУЛЬТАТ (ЗЕЛЕНА ДЗЕН-ПАНЕЛЬ) */}
      {calculationResult && (
        <div className="p-4 rounded-3xl bg-emerald-950/40 border border-emerald-500/30 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-emerald-500/20">
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" /> Результат готової страви
            </span>
            <span className="text-[11px] font-semibold text-zinc-300">
              {calculationResult.waterLossPercentage >= 0 ? 'Википіло' : 'Увібрало'}:{' '}
              <span className="text-amber-400 font-extrabold">{Math.abs(calculationResult.waterLossPercentage)}%</span> води
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="p-2.5 bg-black/40 rounded-2xl border border-white/10">
              <div className="text-[9.5px] text-zinc-400 uppercase font-bold">Готова маса</div>
              <div className="text-sm font-black text-white mt-0.5">
                {calculationResult.cookedDishWeightGrams}г
              </div>
            </div>

            <div className="p-2.5 bg-black/40 rounded-2xl border border-amber-400/30">
              <div className="text-[9.5px] text-amber-400 uppercase font-bold">ккал / 100г</div>
              <div className="text-sm font-black text-amber-300 mt-0.5">
                {calculationResult.cookedMacrosPer100g.calories}
              </div>
            </div>

            <div className="p-2.5 bg-black/40 rounded-2xl border border-emerald-400/30">
              <div className="text-[9.5px] text-emerald-400 uppercase font-bold">Білок / 100г</div>
              <div className="text-sm font-black text-emerald-400 mt-0.5">
                {calculationResult.cookedMacrosPer100g.protein}г
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={handleSaveDish}
            disabled={savedSuccess}
            className={`w-full py-2.5 rounded-2xl font-bold text-xs flex items-center justify-center gap-1.5 shadow-lg active:scale-95 transition-all ${
              savedSuccess
                ? 'bg-emerald-500 text-zinc-950'
                : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/30'
            }`}
          >
            {savedSuccess ? (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>Збережено в базу страв!</span>
              </>
            ) : (
              <>
                <Scale className="w-4 h-4" />
                <span>Зафіксувати готову страву в базі</span>
              </>
            )}
          </button>
        </div>
      )}

      {/* КНОПКА ПОВЕРНУТИСЯ ДО ЩОДЕННИКА */}
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          className="w-full py-2.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold text-zinc-300 hover:text-white transition-all text-center"
        >
          ← Повернутися до щоденника харчування
        </button>
      )}
    </div>
  );
};
