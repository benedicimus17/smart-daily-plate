import React, { useState } from 'react';
import { ChefHat, ChevronRight, X } from 'lucide-react';

interface NextMealSpotlightProps {
  onOpenLog?: () => void;
}

export const NextMealSpotlight: React.FC<NextMealSpotlightProps> = ({ onOpenLog }) => {
  const [recipeModalOpen, setRecipeModalOpen] = useState(false);

  // Визначення поточної страви за часом доби
  const currentHour = new Date().getHours();
  let mealTag = '13:00 • ОБІД';
  let mealTitle = 'Лосось на грилі зі спаржею';
  let mealKcal = 480;
  let mealProtein = 42;
  let mealFats = 22;
  let mealCarbs = 18;
  let mealImage = '/dinner_steak_hd.jpg';
  let mealHint = 'Час приготувати збалансований обід';

  if (currentHour < 11) {
    mealTag = '08:30 • СНІДАНОК';
    mealTitle = 'Омлет з авокадо та шпинатом';
    mealKcal = 380;
    mealProtein = 28;
    mealFats = 24;
    mealCarbs = 12;
    mealHint = 'Ідеальний білковий старт дня';
  } else if (currentHour >= 16) {
    mealTag = '19:30 • ВЕЧЕРЯ';
    mealTitle = 'Gourmet Steak & Greens';
    mealKcal = 510;
    mealProtein = 46;
    mealFats = 24;
    mealCarbs = 14;
    mealImage = '/dinner_steak_hd.jpg';
    mealHint = 'Пора дістати стейк на розморозку';
  }

  return (
    <>
      <div
        className="w-full rounded-[26px] p-3.5 relative overflow-hidden transition-all group select-none shadow-lg"
        style={{
          background: 'linear-gradient(165deg, rgba(23,32,26,0.92) 0%, rgba(13,18,15,0.98) 100%)',
          border: '1px solid rgba(255,255,255,0.12)',
          boxShadow: '0 10px 28px rgba(0,0,0,0.55), inset 0 1px 1px rgba(255,255,255,0.15)'
        }}
      >
        {/* Фонове золоте та оливкове світіння */}
        <div className="absolute -top-10 -right-10 w-36 h-36 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            <span className="text-[10px] font-extrabold tracking-wider text-amber-300 uppercase">
              {mealTag}
            </span>
          </div>

          <button
            id="btn-recipe"
            type="button"
            onClick={() => setRecipeModalOpen(true)}
            className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 text-[10.5px] font-semibold text-zinc-300 hover:text-amber-300 transition-all active:scale-95"
          >
            <ChefHat className="w-3 h-3 text-amber-400" />
            <span>Рецепт</span>
            <ChevronRight className="w-3 h-3 text-zinc-500" />
          </button>
        </div>

        <div className="flex items-center gap-3">
          {/* Міні-фото страви */}
          <div className="w-14 h-14 rounded-2xl overflow-hidden shrink-0 relative border border-white/10 shadow-md">
            <img
              src={mealImage}
              alt={mealTitle}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          </div>

          {/* Інформація про страву */}
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-bold text-white tracking-tight truncate">
              {mealTitle}
            </h4>
            <div className="flex items-center gap-2 mt-1 text-[11px] text-zinc-300 font-medium">
              <span className="text-amber-300 font-bold">{mealKcal} ккал</span>
              <span className="text-zinc-600">•</span>
              <span className="text-emerald-400">{mealProtein}г білка</span>
              <span className="text-zinc-600">•</span>
              <span className="text-zinc-400">{mealCarbs}г вугл</span>
            </div>
            <p className="text-[10px] text-zinc-500 truncate mt-0.5">
              💡 {mealHint}
            </p>
          </div>
        </div>
      </div>

      {/* Модалка швидкого перегляду рецепта */}
      {recipeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn select-none">
          <div
            className="w-full max-w-sm rounded-[30px] p-5 relative overflow-hidden"
            style={{
              background: 'linear-gradient(165deg, rgba(22,32,26,0.96) 0%, rgba(12,17,14,0.98) 100%)',
              border: '1px solid rgba(255,255,255,0.15)',
              boxShadow: '0 24px 60px rgba(0,0,0,0.85)'
            }}
          >
            <button
              type="button"
              onClick={() => setRecipeModalOpen(false)}
              className="absolute top-4 right-4 w-7 h-7 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-zinc-400 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>

            <div className="flex items-center gap-2 mb-3">
              <ChefHat className="w-5 h-5 text-amber-400" />
              <h3 className="text-base font-bold text-white tracking-tight">
                {mealTitle}
              </h3>
            </div>

            <div className="w-full h-32 rounded-2xl overflow-hidden mb-3.5 border border-white/10 relative">
              <img src={mealImage} alt={mealTitle} className="w-full h-full object-cover" />
              <div className="absolute bottom-2 left-2 px-2.5 py-1 rounded-xl bg-black/70 backdrop-blur-sm text-xs font-bold text-amber-300">
                {mealKcal} ккал • {mealProtein}г білка • {mealFats}г жиру
              </div>
            </div>

            <div className="space-y-2 text-xs text-zinc-300">
              <div className="font-bold text-white text-[11px] uppercase tracking-wider text-amber-300">
                Інгредієнти:
              </div>
              <ul className="space-y-1 text-zinc-400 text-[11.5px]">
                <li>• Рибай стейк зернової відгодівлі — 220 г</li>
                <li>• Спаржа свіжа на грилі — 120 г</li>
                <li>• Оливкова олія Extra Virgin — 5 г (1 ч.л.)</li>
                <li>• Сіль морська, розмарин, чорний перець</li>
              </ul>

              <div className="font-bold text-white text-[11px] uppercase tracking-wider text-amber-300 pt-1">
                Порада приготування:
              </div>
              <p className="text-[11.5px] text-zinc-400 leading-relaxed">
                Дістаньте стейк із холодильника за 20 хв до смаження, щоб м'ясо прогрілося до кімнатної температури. Смажте по 2.5 хв з кожного боку до стану Medium Rare.
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                setRecipeModalOpen(false);
                onOpenLog?.();
              }}
              className="w-full mt-4 py-2.5 rounded-xl font-bold text-xs text-zinc-950 flex items-center justify-center gap-1.5 transition-all active:scale-95"
              style={{
                background: 'linear-gradient(135deg, #FDE68A 0%, #F59E0B 100%)',
                boxShadow: '0 4px 14px rgba(245,158,11,0.35)'
              }}
            >
              <span>Відкрити у щоденнику</span>
              <ChevronRight className="w-3.5 h-3.5 text-zinc-950" />
            </button>
          </div>
        </div>
      )}
    </>
  );
};
