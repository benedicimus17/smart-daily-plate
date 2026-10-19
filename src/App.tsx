import React, { useState } from 'react';
import { useNutritionStore } from './store/nutritionStore';
import { Header } from './components/Header';
import { CalorieRings } from './components/CalorieRings';
import { WeeklyBankWidget } from './components/WeeklyBankWidget';
import { MacroGapWidget } from './components/MacroGapWidget';
import { MealList } from './components/MealList';
import { BottomNav, NavTab } from './components/BottomNav';
import { SmartGroceryList } from './components/SmartGroceryList';
import { QuickAddModal } from './components/QuickAddModal';
import { DiningOutEstimatorModal } from './components/DiningOutEstimatorModal';
import { CookLossCalculator } from './components/CookLossCalculator';
import { RecipeParser } from './components/RecipeParser';
import { TrueFatTrend } from './components/TrueFatTrend';
import { MealType } from './types/nutrition';
import { TrendingUp, Link2 } from 'lucide-react';

export const App: React.FC = () => {
  const { dailyLog, weeklyBank, addFoodToMeal, removeFoodFromMeal, toggleMealEaten } = useNutritionStore();
  const [activeTab, setActiveTab] = useState<NavTab>('today');
  
  // Керування модалками
  const [modalOpen, setModalOpen] = useState(false);
  const [diningModalOpen, setDiningModalOpen] = useState(false);
  const [targetMealType, setTargetMealType] = useState<MealType>('lunch');
  const [toolSubTab, setToolSubTab] = useState<'parser' | 'trend'>('parser');

  const handleOpenAdd = (mealType: MealType) => {
    setTargetMealType(mealType);
    setModalOpen(true);
  };

  const handleQuickAddCenter = () => {
    setTargetMealType('dinner');
    setModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#0C100E] text-zinc-100 flex justify-center selection:bg-amber-400/20 selection:text-amber-300 relative overflow-x-hidden">
      {/* М'яке атмосферне фонове світіння (NUTRIQ Zen Glow) */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-gradient-to-b from-amber-500/8 to-transparent rounded-full blur-[120px] pointer-events-none" />
      <div className="fixed bottom-0 right-0 w-[400px] h-[300px] bg-emerald-500/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="w-full max-w-md sm:max-w-lg md:max-w-xl px-4 pt-safe pb-safe flex flex-col relative min-h-screen z-10">
        {/* Верхня панель зі стрічкою тижня */}
        <Header date={dailyLog.date} />

        {/* 1. Вкладка "Сьогодні" (Головний дашборд) */}
        {activeTab === 'today' && (
          <main className="space-y-4 animate-fadeIn">
            {/* Головне золоте кільце калорій та БЖУ (Dark Glassmorphism) */}
            <CalorieRings totals={dailyLog.totals} targets={dailyLog.targets} />

            {/* Тижневий калорійний банк (Weekly Flex Bank) */}
            <WeeklyBankWidget bank={weeklyBank} />

            {/* Розумний підбір під залишок (Macro-Gap Solver) */}
            <MacroGapWidget
              remainingMacros={{
                calories: Math.max(0, dailyLog.targets.calories - dailyLog.totals.calories),
                protein: Math.max(0, dailyLog.targets.protein - dailyLog.totals.protein),
                fat: Math.max(0, dailyLog.targets.fat - dailyLog.totals.fat),
                carbs: Math.max(0, dailyLog.targets.carbs - dailyLog.totals.carbs)
              }}
              onAddSuggestion={(name, weightGrams, macros) => {
                addFoodToMeal('dinner', {
                  foodId: `gap-${Date.now()}`,
                  name,
                  weightGrams,
                  eaten: true,
                  macros
                });
              }}
            />

            {/* Список страв із швидкими чекбоксами [✓] та Cook-Loss бейджами */}
            <MealList
              meals={dailyLog.meals}
              onOpenAddModal={handleOpenAdd}
              onRemoveEntry={removeFoodFromMeal}
              onToggleEaten={toggleMealEaten}
              onOpenDiningEstimator={() => setDiningModalOpen(true)}
              onOpenCookLoss={() => setActiveTab('cookloss')}
            />
          </main>
        )}

        {/* 2. Вкладка "Каструля" (Cook-Loss Engine) */}
        {activeTab === 'cookloss' && (
          <div className="animate-fadeIn">
            <CookLossCalculator />
          </div>
        )}

        {/* 3. Вкладка "Покупки" (Smart Grocery List - автосписок на тиждень) */}
        {activeTab === 'grocery' && (
          <div className="animate-fadeIn">
            <SmartGroceryList />
          </div>
        )}

        {/* 4. Вкладка "Інструменти" (TikTok Parser + True Fat Trend) */}
        {activeTab === 'tools' && (
          <div className="space-y-4 pb-24 animate-fadeIn">
            {/* Перемикач під-вкладок інструментів */}
            <div className="p-1 rounded-2xl bg-zinc-900/80 border border-zinc-800 flex items-center gap-1">
              <button
                type="button"
                onClick={() => setToolSubTab('parser')}
                className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                  toolSubTab === 'parser'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <Link2 className="w-4 h-4" />
                <span>1-Click TikTok / Reels Парсер</span>
              </button>

              <button
                type="button"
                onClick={() => setToolSubTab('trend')}
                className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                  toolSubTab === 'trend'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <TrendingUp className="w-4 h-4" />
                <span>True Fat Trend (EMA вага)</span>
              </button>
            </div>

            {toolSubTab === 'parser' && <RecipeParser />}
            {toolSubTab === 'trend' && <TrueFatTrend />}
          </div>
        )}

        {/* Нижня плаваюча скляна навігація (Apple Dock Dark Glass) */}
        <BottomNav
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onQuickAdd={handleQuickAddCenter}
        />

        {/* Швидка модалка запису страв */}
        <QuickAddModal
          isOpen={modalOpen}
          mealType={targetMealType}
          onClose={() => setModalOpen(false)}
          onAdd={(mealType, data) => addFoodToMeal(mealType, { ...data, eaten: true, foodId: `item-${Date.now()}` })}
        />

        {/* Модалка ресторанної оцінки страв (Dining Out Estimator) */}
        <DiningOutEstimatorModal
          isOpen={diningModalOpen}
          onClose={() => setDiningModalOpen(false)}
          onAddMeal={(mealType, data) => addFoodToMeal(mealType, { ...data, eaten: true, foodId: `dining-${Date.now()}` })}
        />
      </div>
    </div>
  );
};

export default App;
