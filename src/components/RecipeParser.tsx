import React, { useState } from 'react';
import { Link2, Sparkles, CheckCircle2, BookmarkPlus, Layers, FileText } from 'lucide-react';
import { parseRecipeFromText, parseRecipeFromUrl } from '../services/recipeParser';
import { ParsedRecipe } from '../types/recipe';
import { MealType } from '../types/nutrition';
import { useNutritionStore } from '../store/nutritionStore';

export const RecipeParser: React.FC = () => {
  const { addFoodToMeal, saveRecipe } = useNutritionStore();
  const [mode, setMode] = useState<'url' | 'text'>('url');
  const [url, setUrl] = useState('https://www.tiktok.com/@chef/video/7391823482');
  const [rawText, setRawText] = useState(
`- 250г паста з твердих сортів
- 350г очищені королівські креветки
- 120г свіжий шпинат
- 15 мл оливкова олія

Приготування:
1. Відварити пасту al dente.
2. Розігріти олію, обсмажити креветки зі шпинатом 3 хвилини.
3. Поєднати пасту з креветками.`
  );
  const [recipeTitle, setRecipeTitle] = useState('Протеїнова паста з креветками');
  const [servings, setServings] = useState('2');
  const [isParsing, setIsParsing] = useState(false);
  const [parsedResult, setParsedResult] = useState<ParsedRecipe | null>(() =>
    parseRecipeFromUrl('https://www.tiktok.com/@chef/video/7391823482', 2)
  );
  const [addedSuccessMeal, setAddedSuccessMeal] = useState<MealType | null>(null);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleParse = (e: React.FormEvent) => {
    e.preventDefault();
    setIsParsing(true);
    setAddedSuccessMeal(null);
    setSavedSuccess(false);

    setTimeout(() => {
      const numServings = parseInt(servings, 10) || 2;
      let res: ParsedRecipe;
      if (mode === 'url' && url.trim().length > 0) {
        res = parseRecipeFromUrl(url.trim(), numServings);
        setRecipeTitle(res.title);
      } else {
        res = parseRecipeFromText(recipeTitle, rawText, numServings, undefined);
      }
      setParsedResult(res);
      setIsParsing(false);
    }, 350);
  };

  const handleQuickPreset = (presetUrl: string) => {
    setMode('url');
    setUrl(presetUrl);
    setIsParsing(true);
    setTimeout(() => {
      const res = parseRecipeFromUrl(presetUrl, parseInt(servings, 10) || 2);
      setRecipeTitle(res.title);
      setParsedResult(res);
      setIsParsing(false);
    }, 250);
  };

  const handleAddToMeal = (targetMeal: MealType) => {
    if (!parsedResult) return;
    addFoodToMeal(targetMeal, {
      foodId: `recipe-${Date.now()}`,
      name: `${parsedResult.title} (1 порція)`,
      weightGrams: Math.round(parsedResult.totalWeightGrams / parsedResult.servings),
      macros: parsedResult.macrosPerServing,
      eaten: true
    });
    setAddedSuccessMeal(targetMeal);
    setTimeout(() => setAddedSuccessMeal(null), 2500);
  };

  const handleSaveToBook = () => {
    if (!parsedResult) return;
    saveRecipe(parsedResult);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  return (
    <div className="space-y-4 animate-fadeIn select-none text-white">
      {/* 1. КАРТКА ПАРСЕРА В ТЕМНОМУ ДЗЕН-СТИЛІ */}
      <div className="rounded-3xl p-5 bg-[#121814] border border-white/10 shadow-2xl relative overflow-hidden">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-2xl bg-amber-400/15 border border-amber-400/30 text-amber-400 flex items-center justify-center">
            <Link2 className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-black text-white tracking-tight">1-Click AI Recipe Parser</h2>
            <p className="text-xs text-zinc-400">Імпорт рецептів з TikTok, Instagram Reels або тексту</p>
          </div>
        </div>

        {/* Швидкі зразки для перевірки */}
        <div className="mb-3.5 space-y-1.5">
          <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">
            Швидкі тестові відео-посилання:
          </label>
          <div className="flex flex-wrap gap-1.5">
            <button
              type="button"
              onClick={() => handleQuickPreset('https://www.tiktok.com/@chef/video/pasta-shrimp-spinach')}
              className="px-2.5 py-1 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-[11px] font-bold text-amber-300 hover:border-amber-400/40 transition-all active:scale-95"
            >
              🍝 TikTok: Паста з креветками
            </button>
            <button
              type="button"
              onClick={() => handleQuickPreset('https://www.instagram.com/reels/protein-oat-pancakes')}
              className="px-2.5 py-1 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-[11px] font-bold text-amber-300 hover:border-amber-400/40 transition-all active:scale-95"
            >
              🥞 Reels: Панкейки
            </button>
            <button
              type="button"
              onClick={() => handleQuickPreset('https://www.tiktok.com/@healthy/video/salmon-quinoa-bowl')}
              className="px-2.5 py-1 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-[11px] font-bold text-amber-300 hover:border-amber-400/40 transition-all active:scale-95"
            >
              🥗 TikTok: Лососевий боул
            </button>
          </div>
        </div>

        {/* Перемикач режиму: URL або Текст */}
        <div className="grid grid-cols-2 gap-1.5 p-1 bg-black/40 border border-white/10 rounded-2xl mb-3.5 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setMode('url')}
            className={`py-2 rounded-xl transition-all flex items-center justify-center gap-1.5 font-bold ${
              mode === 'url' ? 'bg-amber-400 text-zinc-950 shadow-md shadow-amber-400/20' : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Link2 className="w-3.5 h-3.5" /> За посиланням
          </button>
          <button
            type="button"
            onClick={() => setMode('text')}
            className={`py-2 rounded-xl transition-all flex items-center justify-center gap-1.5 font-bold ${
              mode === 'text' ? 'bg-amber-400 text-zinc-950 shadow-md shadow-amber-400/20' : 'text-zinc-400 hover:text-white'
            }`}
          >
            <FileText className="w-3.5 h-3.5" /> Текст / Опис
          </button>
        </div>

        <form onSubmit={handleParse} className="space-y-3">
          {mode === 'url' ? (
            <div>
              <label className="block text-[10.5px] font-bold text-zinc-300 uppercase tracking-wider mb-1">
                Посилання на відео (TikTok / Reels / YouTube)
              </label>
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="Вставте посилання: https://www.tiktok.com/@..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-black/50 border border-white/15 text-xs font-bold text-white placeholder-zinc-500 focus:border-amber-400 focus:outline-none"
              />
            </div>
          ) : (
            <div>
              <label className="block text-[10.5px] font-bold text-zinc-300 uppercase tracking-wider mb-1">
                Текст інгредієнтів
              </label>
              <textarea
                rows={4}
                value={rawText}
                onChange={(e) => setRawText(e.target.value)}
                placeholder="- 300г куряче філе&#10;- 150г рис"
                className="w-full px-3.5 py-2.5 rounded-xl bg-black/50 border border-white/15 text-xs font-semibold text-white placeholder-zinc-500 focus:border-amber-400 focus:outline-none leading-relaxed"
              />
            </div>
          )}

          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="block text-[10.5px] font-bold text-zinc-300 mb-1">Назва страви</label>
              <input
                type="text"
                value={recipeTitle}
                onChange={(e) => setRecipeTitle(e.target.value)}
                placeholder="Назва страви"
                className="w-full px-3 py-2 rounded-xl bg-black/50 border border-white/15 text-xs font-bold text-white focus:border-amber-400 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[10.5px] font-bold text-zinc-300 mb-1">Кількість порцій</label>
              <input
                type="number"
                min="1"
                value={servings}
                onChange={(e) => setServings(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-black/50 border border-white/15 text-xs font-extrabold text-amber-300 focus:border-amber-400 focus:outline-none text-center"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isParsing}
            className="w-full py-3 rounded-2xl font-black text-xs text-zinc-950 flex items-center justify-center gap-2 shadow-lg transition-all active:scale-[0.98]"
            style={{
              background: 'linear-gradient(135deg, #FDE68A 0%, #F59E0B 100%)'
            }}
          >
            <Sparkles className="w-4 h-4 text-zinc-950" />
            <span>{isParsing ? 'Розпізнавання та розрахунок КБЖВ...' : 'Розрахувати КБЖВ страви'}</span>
          </button>
        </form>
      </div>

      {/* 2. РОЗПІЗНАНИЙ РЕЗУЛЬТАТ (ЗЕЛЕНА СМАРАГДОВА ПАНЕЛЬ) */}
      {parsedResult && (
        <div className="rounded-3xl p-5 bg-[#121814] border border-emerald-500/30 space-y-4 animate-fadeIn shadow-2xl">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <div>
              <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 rounded-full uppercase tracking-wider">
                Розпізнано ({parsedResult.servings} порції)
              </span>
              <h3 className="text-sm font-black text-white mt-1.5">{parsedResult.title}</h3>
            </div>
            <div className="text-right">
              <span className="text-[10.5px] text-zinc-400 block">На 1 порцію</span>
              <div className="text-base font-black text-amber-300">
                {parsedResult.macrosPerServing.calories} ккал
              </div>
            </div>
          </div>

          {/* Розпізнані інгредієнти */}
          <div className="space-y-1.5 text-xs">
            <span className="text-[10.5px] font-bold text-zinc-400 uppercase tracking-wide block mb-1">
              Інгредієнти ({parsedResult.totalWeightGrams}г сумарно)
            </span>
            {parsedResult.ingredients.map((ing, idx) => (
              <div key={idx} className="flex justify-between items-center py-1.5 px-2.5 rounded-xl bg-black/40 border border-white/5 text-zinc-200">
                <span className="font-semibold">• {ing.name} ({ing.amountGrams}г)</span>
                <span className="font-bold text-amber-300/90 text-[11px]">
                  {ing.macros.calories} ккал ({ing.macros.protein}г Б)
                </span>
              </div>
            ))}
          </div>

          {/* Зведена панель макросів порції */}
          <div className="p-3 bg-emerald-950/40 border border-emerald-500/30 rounded-2xl flex items-center justify-between text-xs font-semibold">
            <span className="text-emerald-400 flex items-center gap-1.5 font-bold">
              <Layers className="w-4 h-4 text-emerald-400" /> 1 порція:
            </span>
            <span className="text-white font-extrabold">
              {parsedResult.macrosPerServing.protein}г Б • {parsedResult.macrosPerServing.fat}г Ж • {parsedResult.macrosPerServing.carbs}г В
            </span>
          </div>

          {/* Кнопки додавання до розкладу */}
          <div className="space-y-2 pt-1">
            <div className="text-[10.5px] font-bold text-zinc-400 uppercase tracking-wider">
              Додати порцію в розклад дня:
            </div>
            <div className="grid grid-cols-4 gap-1.5">
              {(['breakfast', 'lunch', 'snack', 'dinner'] as MealType[]).map((mealType) => {
                const labels: Record<MealType, string> = {
                  breakfast: 'Сніданок',
                  lunch: 'Обід',
                  snack: 'Перекус',
                  dinner: 'Вечеря'
                };
                const isAdded = addedSuccessMeal === mealType;

                return (
                  <button
                    key={mealType}
                    type="button"
                    onClick={() => handleAddToMeal(mealType)}
                    className={`py-2 rounded-xl text-[11px] font-bold transition-all flex flex-col items-center justify-center active:scale-95 ${
                      isAdded
                        ? 'bg-emerald-500 text-zinc-950'
                        : 'bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-200 hover:text-amber-300'
                    }`}
                  >
                    {isAdded ? (
                      <CheckCircle2 className="w-3.5 h-3.5 mb-0.5" />
                    ) : (
                      <span className="text-amber-400 font-extrabold text-[12px]">+</span>
                    )}
                    <span>{labels[mealType]}</span>
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              onClick={handleSaveToBook}
              className={`w-full mt-2 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 active:scale-95 ${
                savedSuccess
                  ? 'bg-emerald-500 text-zinc-950'
                  : 'bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-300 hover:text-white'
              }`}
            >
              <BookmarkPlus className="w-4 h-4 text-amber-400" />
              <span>{savedSuccess ? 'Збережено в кулінарну книгу!' : 'Зберегти в кулінарну книгу'}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
