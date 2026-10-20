import React, { useState } from 'react';
import { useNutritionStore } from './store/nutritionStore';
import { useUserStore } from './store/userStore';
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
import { ProfileScreen } from './components/ProfileScreen';
import { AuthModal } from './components/AuthModal';
import { SplashScreen } from './components/SplashScreen';
import { MealType } from './types/nutrition';
import { TrendingUp, ShoppingBag, Link2, Sparkles, ChevronRight } from 'lucide-react';
import { MyPlanWizard } from './components/MyPlanWizard';

export const App: React.FC = () => {
  const { dailyLog, weeklyBank, addFoodToMeal, removeFoodFromMeal, toggleMealEaten } = useNutritionStore();
  const { user } = useUserStore();
  const [activeTab, setActiveTab] = useState<NavTab>('today');
  const [showSplash, setShowSplash] = useState(true);
  
  // Керування модалками
  const [modalOpen, setModalOpen] = useState(false);
  const [planWizardOpen, setPlanWizardOpen] = useState(false);
  const [pendingAddAfterWizard, setPendingAddAfterWizard] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [diningModalOpen, setDiningModalOpen] = useState(false);
  const [targetMealType, setTargetMealType] = useState<MealType>('lunch');
  const [trendSubTab, setTrendSubTab] = useState<'trend' | 'parser' | 'grocery'>('trend');

  const handleOpenAdd = (mealType: MealType) => {
    setTargetMealType(mealType);
    if (!user.isRegistered) {
      setPendingAddAfterWizard(true);
      setPlanWizardOpen(true);
    } else {
      setModalOpen(true);
    }
  };

  const handleQuickAddCenter = () => {
    setTargetMealType('dinner');
    if (!user.isRegistered) {
      setPendingAddAfterWizard(true);
      setPlanWizardOpen(true);
    } else {
      setModalOpen(true);
    }
  };

  const handleWizardCompleted = () => {
    setPlanWizardOpen(false);
    if (pendingAddAfterWizard) {
      setPendingAddAfterWizard(false);
      setModalOpen(true);
    }
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

              {/* Банер швидкого налаштування «Мій План» для нового користувача */}
              {!user.hasCompletedPlan && (
                <div
                  id="my-plan-banner"
                  onClick={() => {
                    setPendingAddAfterWizard(false);
                    setPlanWizardOpen(true);
                  }}
                  className="cursor-pointer p-3.5 rounded-2xl border border-amber-500/30 bg-gradient-to-r from-amber-500/15 via-[#18231c] to-emerald-500/10 flex items-center justify-between shadow-lg hover:border-amber-400/50 transition-all active:scale-[0.99]"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-400/20 border border-amber-400/40 flex items-center justify-center text-amber-300 shrink-0">
                      <Sparkles className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white flex items-center gap-1.5">
                        <span>Налаштувати «Мій План»</span>
                        <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-amber-400 text-zinc-950">КРОК 1</span>
                      </div>
                      <p className="text-[11px] text-zinc-400 mt-0.5">
                        Розрахуйте точні норми калорій та БЖУ під вашу вагу
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-amber-400 shrink-0" />
                </div>
              )}

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

          {/* 3. Вкладка "Trends" (Тренди ваги, AI Парсер рецептів та список покупок) */}
          {activeTab === 'grocery' && (
            <div className="space-y-4 animate-fadeIn pb-24">
              <div className="flex bg-[#121814] p-1 rounded-2xl border border-[#233226]">
                <button
                  type="button"
                  onClick={() => setTrendSubTab('trend')}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                    trendSubTab === 'trend'
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span>Тренди</span>
                </button>
                <button
                  type="button"
                  onClick={() => setTrendSubTab('parser')}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                    trendSubTab === 'parser'
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  <Link2 className="w-3.5 h-3.5" />
                  <span>AI Парсер</span>
                </button>
                <button
                  type="button"
                  onClick={() => setTrendSubTab('grocery')}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                    trendSubTab === 'grocery'
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  <ShoppingBag className="w-3.5 h-3.5" />
                  <span>Покупки</span>
                </button>
              </div>

              {trendSubTab === 'trend' && <TrueFatTrend />}
              {trendSubTab === 'parser' && <RecipeParser />}
              {trendSubTab === 'grocery' && <SmartGroceryList />}
            </div>
          )}

          {/* 4. Вкладка "Profile" (Профіль, Акаунт, Мій План, 6 переваг) */}
          {activeTab === 'profile' && (
            <ProfileScreen />
          )}

          {/* Нижня плаваюча панель (Bottom Dock - Apple Dark Glass) */}
          <BottomNav
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            onQuickAdd={handleQuickAddCenter}
          />

          {/* Майстер індивідуального плану та реєстрації через пошту */}
          <MyPlanWizard
            isOpen={planWizardOpen}
            onClose={() => {
              setPlanWizardOpen(false);
              setPendingAddAfterWizard(false);
            }}
            onCompleted={handleWizardCompleted}
          />

          {/* Модалка реєстрації для гостей (Soft Gate лідогенерація) */}
          <AuthModal
            isOpen={authModalOpen}
            onClose={() => {
              setAuthModalOpen(false);
              setModalOpen(true);
            }}
            onSuccess={() => {
              setAuthModalOpen(false);
              setModalOpen(true);
            }}
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
