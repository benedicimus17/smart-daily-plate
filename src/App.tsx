import React, { useState, useEffect } from 'react';
import { useNutritionStore } from './store/nutritionStore';
import { useUserStore } from './store/userStore';
import { Header } from './components/Header';
import { CalorieRings } from './components/CalorieRings';
import { WeeklyBankWidget } from './components/WeeklyBankWidget';
import { BottomNav, NavTab } from './components/BottomNav';
import { SmartGroceryList } from './components/SmartGroceryList';
import { QuickAddModal } from './components/QuickAddModal';
import { DiningOutEstimatorModal } from './components/DiningOutEstimatorModal';
import { ChefHubModal } from './components/ChefHubModal';
import { TrueFatTrend } from './components/TrueFatTrend';
import { ProfileScreen } from './components/ProfileScreen';
import { AuthModal } from './components/AuthModal';
import { SplashScreen } from './components/SplashScreen';
import { MealType } from './types/nutrition';
import { TrendingUp, ShoppingBag } from 'lucide-react';
import { MyPlanWizard } from './components/MyPlanWizard';
import { NextMealSpotlight } from './components/NextMealSpotlight';
import { WaterTracker } from './components/WaterTracker';
import { LogScreen } from './components/LogScreen';
import { ProSubscriptionModal } from './components/ProSubscriptionModal';

export const App: React.FC = () => {
  const { dailyLog, weeklyBank, addFoodToMeal } = useNutritionStore();
  const { user } = useUserStore();
  const [activeTab, setActiveTab] = useState<NavTab>('today');
  const [showSplash, setShowSplash] = useState(true);
  
  // Керування модалками
  const [modalOpen, setModalOpen] = useState(false);
  const [chefHubOpen, setChefHubOpen] = useState(false);
  const [planWizardOpen, setPlanWizardOpen] = useState(false);
  const [proModalOpen, setProModalOpen] = useState(false);
  const [pendingAddAfterWizard, setPendingAddAfterWizard] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [diningModalOpen, setDiningModalOpen] = useState(false);
  const [targetMealType, setTargetMealType] = useState<MealType>('lunch');
  const [trendSubTab, setTrendSubTab] = useState<'trend' | 'grocery'>('trend');

  // Автоматичне відкриття візарда анкети для нового користувача
  useEffect(() => {
    if (!user.hasCompletedPlan) {
      setPlanWizardOpen(true);
    }
  }, [user.hasCompletedPlan]);

  const handleOpenAdd = (mealType: MealType) => {
    setTargetMealType(mealType);
    setModalOpen(true);
  };

  const handleQuickAddCenter = () => {
    setChefHubOpen(true);
  };

  const handleWizardCompleted = () => {
    setPlanWizardOpen(false);
    if (pendingAddAfterWizard) {
      setPendingAddAfterWizard(false);
      setChefHubOpen(true);
    }
  };

  return (
    <>
      {showSplash && <SplashScreen onFinish={() => setShowSplash(false)} />}
      
      <div className="min-h-screen bg-slate-moss text-zinc-100 flex justify-center selection:bg-amber-400/20 selection:text-amber-300 relative overflow-x-hidden">
        {/* М'яке атмосферне фонове світіння (NUTRIQ Zen Glow) */}
        <div className="fixed top-10 left-1/2 -translate-x-1/2 w-[500px] h-[320px] bg-amber-400/8 rounded-full blur-[110px] pointer-events-none" />
        <div className="fixed bottom-10 right-0 w-[380px] h-[280px] bg-emerald-400/6 rounded-full blur-[100px] pointer-events-none" />

        <div className={`w-full max-w-md px-4 pt-safe pb-safe flex flex-col relative z-10 ${activeTab === 'today' ? 'h-screen max-h-screen overflow-hidden' : 'min-h-screen'}`}>
          {/* Верхня панель */}
          {activeTab !== 'cookloss' && (
            <Header
              date={dailyLog.date}
              onOpenSplash={() => setShowSplash(true)}
              hideCalendarButton={activeTab === 'today'}
              onOpenProModal={() => setProModalOpen(true)}
              onResetTestUser={() => setPlanWizardOpen(true)}
            />
          )}

          {/* 1. Вкладка "Сьогодні" (Концептуальний статичний 1-екранний дашборд) */}
          {activeTab === 'today' && (
            <main className="flex-1 flex flex-col justify-between py-0.5 pb-24 animate-fadeIn select-none overflow-hidden">
              {/* 1. Головне золоте кільце калорій та 3 спідометри БЖУ */}
              <CalorieRings totals={dailyLog.totals} targets={dailyLog.targets} />

              {/* 2. Скляна капсула Weekly Flex Bank */}
              <div className="w-full my-0.5">
                <WeeklyBankWidget bank={weeklyBank} />
              </div>

              {/* 3. НАСТУПНИЙ ПРИЙОМ ЇЖІ (Smart Meal Spotlight з кнопкою "Рецепт") */}
              <div className="w-full my-0.5">
                <NextMealSpotlight onOpenLog={() => setActiveTab('cookloss')} />
              </div>

              {/* 4. ГЕЙМІФІКОВАНИЙ ТРЕКЕР: 6 СКЛЯНОК ВОДИ (Aqua Zen) */}
              <div className="w-full my-0.5">
                <WaterTracker />
              </div>
            </main>
          )}

          {/* 2. Вкладка "Log" (Щоденник страв, розклад дня, ШІ-Балансувальник та Каструля) */}
          {activeTab === 'cookloss' && (
            <LogScreen
              onOpenQuickAdd={handleOpenAdd}
              onOpenProModal={() => setProModalOpen(true)}
            />
          )}

          {/* 3. Вкладка "Trends" (Істинний жировий тренд та згрупований список покупок) */}
          {activeTab === 'grocery' && (
            <div className="space-y-4 animate-fadeIn pb-24">
              <div className="flex bg-[#121814] p-1 rounded-2xl border border-white/10 shadow-lg">
                <button
                  id="tab-sub-trend"
                  type="button"
                  onClick={() => setTrendSubTab('trend')}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                    trendSubTab === 'trend'
                      ? 'bg-amber-400/20 text-amber-300 border border-amber-400/40 shadow-sm'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span>Істинний тренд</span>
                </button>
                <button
                  id="tab-sub-grocery"
                  type="button"
                  onClick={() => setTrendSubTab('grocery')}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                    trendSubTab === 'grocery'
                      ? 'bg-amber-400/20 text-amber-300 border border-amber-400/40 shadow-sm'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  <ShoppingBag className="w-3.5 h-3.5" />
                  <span>Список покупок</span>
                </button>
              </div>

              {trendSubTab === 'trend' && <TrueFatTrend />}
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

          {/* Центральний Шеф-Хаб: Каталог 50 рецептів, AI Парсер соцмереж та Вільний текст */}
          <ChefHubModal
            isOpen={chefHubOpen}
            targetDate={dailyLog.date}
            onClose={() => setChefHubOpen(false)}
            onOpenProModal={() => setProModalOpen(true)}
            onAddDishToDay={(mealType, data) => {
              addFoodToMeal(mealType, {
                ...data,
                eaten: false,
                foodId: `chef-${Date.now()}`
              });
            }}
          />

          {/* Розкішний Apple Dark Glass пейволл NUTRIQ PRO */}
          <ProSubscriptionModal
            isOpen={proModalOpen}
            onClose={() => setProModalOpen(false)}
          />

          {/* Швидка модалка запису страв для окремих слотів */}
          <QuickAddModal
            isOpen={modalOpen}
            mealType={targetMealType}
            onClose={() => setModalOpen(false)}
            onAdd={(mealType, data) => addFoodToMeal(mealType, { ...data, eaten: false, foodId: `item-${Date.now()}` })}
          />

          {/* Модалка ресторанної оцінки страв (Dining Out Estimator) */}
          <DiningOutEstimatorModal
            isOpen={diningModalOpen}
            onClose={() => setDiningModalOpen(false)}
            onAddMeal={(mealType, data) => addFoodToMeal(mealType, { ...data, eaten: false, foodId: `dining-${Date.now()}` })}
          />
        </div>
      </div>
    </>
  );
};

export default App;
