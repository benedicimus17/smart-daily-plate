import React, { useState } from 'react';
import { useNutritionStore } from './store/nutritionStore';
import { Header } from './components/Header';
import { CalorieRings } from './components/CalorieRings';
import { WeeklyBankWidget } from './components/WeeklyBankWidget';
import { MealList } from './components/MealList';
import { BottomNav, NavTab } from './components/BottomNav';
import { SmartGroceryList } from './components/SmartGroceryList';
import { QuickAddModal } from './components/QuickAddModal';
import { DiningOutEstimatorModal } from './components/DiningOutEstimatorModal';
import { CookLossCalculator } from './components/CookLossCalculator';
import { RecipeParser } from './components/RecipeParser';
import { TrueFatTrend } from './components/TrueFatTrend';
import { SplashScreen } from './components/SplashScreen';
import { MealType } from './types/nutrition';
import { TrendingUp, Link2 } from 'lucide-react';

export const App: React.FC = () => {
  const { dailyLog, weeklyBank, addFoodToMeal, removeFoodFromMeal, toggleMealEaten } = useNutritionStore();
  const [activeTab, setActiveTab] = useState<NavTab>('today');
  const [showSplash, setShowSplash] = useState(true);
  
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
    <>
      {showSplash && <SplashScreen onFinish={() => setShowSplash(false)} />}
      
      <div className="min-h-screen bg-slate-moss text-zinc-100 flex justify-center selection:bg-amber-400/20 selection:text-amber-300 relative overflow-x-hidden">
        {/* М'яке атмосферне фонове світіння (NUTRIQ Zen Glow) */}
        <div className="fixed top-10 left-1/2 -translate-x-1/2 w-[500px] h-[320px] bg-amber-400/8 rounded-full blur-[110px] pointer-events-none" />
        <div className="fixed bottom-10 right-0 w-[380px] h-[280px] bg-emerald-400/6 rounded-full blur-[100px] pointer-events-none" />

        <div className="w-full max-w-md px-4 pt-safe pb-safe flex flex-col relative min-h-screen z-10">
          {/* Верхня панель */}
          <Header date={dailyLog.date} onOpenSplash={() => setShowSplash(true)} />

          {/* 1. Вкладка "Сьогодні" (Головний дашборд за еталонним макетом Layout 2) */}
          {activeTab === 'today' && (
            <main className="space-y-2.5 animate-fadeIn">
              {/* 1. Головне золоте кільце калорій та 3 спідометри БЖУ */}
              <CalorieRings totals={dailyLog.totals} targets={dailyLog.targets} />

              {/* 2. Скляна панель Weekly Flex Bank */}
              <WeeklyBankWidget bank={weeklyBank} />

              {/* 3. Панорамна картка Dinner (Gourmet Steak & Greens) + повне меню */}
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

          {/* 4. Вкладка "Інструменти" (TikTok AI Parser & True Fat Trend) */}
          {activeTab === 'tools' && (
            <div className="space-y-4 animate-fadeIn pb-24">
              <div className="flex bg-[#121814] p-1 rounded-2xl border border-[#233226]">
                <button
                  type="button"
                  onClick={() => setToolSubTab('parser')}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                    toolSubTab === 'parser'
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  <Link2 className="w-3.5 h-3.5" />
                  <span>AI Парсер рецептів</span>
                </button>
                <button
                  type="button"
                  onClick={() => setToolSubTab('trend')}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                    toolSubTab === 'trend'
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span>True Fat Trend</span>
                </button>
              </div>

              {toolSubTab === 'parser' && (
                <RecipeParser />
              )}

              {toolSubTab === 'trend' && (
                <TrueFatTrend />
              )}
            </div>
          )}

          {/* Нижня плаваюча панель (Bottom Dock - Apple Dark Glass) */}
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
    </>
  );
};

export default App;
