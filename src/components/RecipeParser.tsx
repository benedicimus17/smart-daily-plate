import React, { useState } from 'react';
import { Link2, Sparkles, CheckCircle2, BookmarkPlus, Layers, FileText } from 'lucide-react';
import { parseRecipeFromText } from '../services/recipeParser';
import { ParsedRecipe } from '../types/recipe';
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
    parseRecipeFromText('Протеїнова паста з креветками', rawText, 2, url)
  );
  const [addedSuccess, setAddedSuccess] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleParse = (e: React.FormEvent) => {
    e.preventDefault();
    setIsParsing(true);
    setAddedSuccess(false);
    setSavedSuccess(false);

    setTimeout(() => {
      const numServings = parseInt(servings, 10) || 2;
      const res = parseRecipeFromText(recipeTitle, rawText, numServings, mode === 'url' ? url : undefined);
      setParsedResult(res);
      setIsParsing(false);
    }, 400);
  };

  const handleAddToLunch = () => {
    if (!parsedResult) return;
    addFoodToMeal('lunch', {
      foodId: `recipe-${Date.now()}`,
      name: `${parsedResult.title} (1 порція)`,
      weightGrams: Math.round(parsedResult.totalWeightGrams / parsedResult.servings),
      macros: parsedResult.macrosPerServing
    });
    setAddedSuccess(true);
    setTimeout(() => setAddedSuccess(false), 2500);
  };

  const handleSaveToBook = () => {
    if (!parsedResult) return;
    saveRecipe(parsedResult);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  return (
    <div className="space-y-4 animate-fadeIn pb-24">
      <div className="glass-card rounded-4xl p-5 border border-white">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-2xl bg-brand-indigo/10 text-brand-indigo flex items-center justify-center">
            <Link2 className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-800">1-Click Recipe Parser</h2>
            <p className="text-xs text-slate-400">Імпорт рецептів з TikTok, Instagram Reels або кулінарних блогів</p>
          </div>
        </div>

        {/* Перемикач режиму: URL або Текст */}
        <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-100/80 rounded-2xl mb-3 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setMode('url')}
            className={`py-1.5 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              mode === 'url' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <Link2 className="w-3.5 h-3.5" /> За посиланням
          </button>
          <button
            type="button"
            onClick={() => setMode('text')}
            className={`py-1.5 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              mode === 'text' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <FileText className="w-3.5 h-3.5" /> Текст / Опис
          </button>
        </div>

        <form onSubmit={handleParse} className="space-y-3">
          {mode === 'url' ? (
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Посилання на TikTok / Reels</label>
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://www.tiktok.com/@chef/video/..."
                className="w-full px-3.5 py-2.5 rounded-2xl bg-white border border-slate-200 text-xs focus:border-brand-indigo focus:outline-none"
              />
            </div>
          ) : (
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Текст інгредієнтів</label>
              <textarea
                rows={4}
                value={rawText}
                onChange={(e) => setRawText(e.target.value)}
                placeholder="- 300г куряче філе&#10;- 150г рис"
                className="w-full px-3.5 py-2.5 rounded-2xl bg-white border border-slate-200 text-xs focus:border-brand-indigo focus:outline-none leading-relaxed"
              />
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Назва страви</label>
              <input
                type="text"
                value={recipeTitle}
                onChange={(e) => setRecipeTitle(e.target.value)}
                placeholder="Назва страви"
                className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs focus:border-brand-indigo focus:outline-none font-medium"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Кількість порцій</label>
              <input
                type="number"
                min="1"
                value={servings}
                onChange={(e) => setServings(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs focus:border-brand-indigo focus:outline-none font-bold text-center"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isParsing}
            className="w-full py-3 rounded-2xl bg-brand-indigo hover:bg-indigo-600 text-white font-bold text-xs shadow-glow-indigo flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
          >
            <Sparkles className="w-4 h-4" />
            {isParsing ? 'Розпізнавання та розрахунок...' : 'Розрахувати КБЖВ страви'}
          </button>
        </form>
      </div>

      {parsedResult && (
        <div className="glass-card rounded-4xl p-5 border border-white bg-white/85 space-y-4 animate-fadeIn">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <span className="text-[10px] font-bold text-brand-emerald bg-emerald-50 px-2 py-0.5 rounded-full uppercase tracking-wider">
                Розпізнано ({parsedResult.servings} порції)
              </span>
              <h3 className="text-sm font-bold text-slate-800 mt-1">{parsedResult.title}</h3>
            </div>
            <div className="text-right">
              <span className="text-[11px] text-slate-400">На 1 порцію</span>
              <div className="text-base font-extrabold text-brand-indigo">
                {parsedResult.macrosPerServing.calories} ккал
              </div>
            </div>
          </div>

          {/* Розпізнані інгредієнти */}
          <div className="space-y-1.5 text-xs">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide block mb-1">
              Інгредієнти ({parsedResult.totalWeightGrams}г сумарно)
            </span>
            {parsedResult.ingredients.map((ing, idx) => (
              <div key={idx} className="flex justify-between items-center py-1 px-2 rounded-xl bg-slate-50/70 text-slate-700">
                <span>• {ing.name} ({ing.amountGrams}г)</span>
                <span className="font-semibold text-slate-500">
                  {ing.macros.calories} ккал ({ing.macros.protein}г Б)
                </span>
              </div>
            ))}
          </div>

          {/* Зведена панель макросів порції */}
          <div className="p-3 bg-emerald-50/70 border border-emerald-100 rounded-2xl flex items-center justify-between text-xs font-semibold text-slate-700">
            <span className="text-emerald-800 flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-brand-emerald" /> 1 порція:
            </span>
            <span className="text-brand-emerald font-bold">
              {parsedResult.macrosPerServing.protein}г Б • {parsedResult.macrosPerServing.fat}г Ж • {parsedResult.macrosPerServing.carbs}г В
            </span>
          </div>

          {/* Кнопки дій */}
          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              onClick={handleAddToLunch}
              className={`py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 active:scale-95 ${
                addedSuccess
                  ? 'bg-emerald-600 text-white'
                  : 'bg-brand-emerald text-white shadow-glow-emerald hover:bg-emerald-600'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              {addedSuccess ? 'Додано в обід!' : 'Додати в обід'}
            </button>

            <button
              onClick={handleSaveToBook}
              className={`py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 active:scale-95 ${
                savedSuccess
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <BookmarkPlus className="w-4 h-4" />
              {savedSuccess ? 'Збережено!' : 'В кулінарну книгу'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
