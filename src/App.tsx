import React, { useState } from 'react';
import { useNutritionStore } from './store/nutritionStore';
import { Header } from './components/Header';
import { CalorieRings } from './components/CalorieRings';
import { WeeklyBankWidget } from './components/WeeklyBankWidget';
import { MacroGapWidget } from './components/MacroGapWidget';
import { MealList } from './components/MealList';
import { BottomNav } from './components/BottomNav';
import { QuickAddModal } from './components/QuickAddModal';
import { DiningOutEstimatorModal } from './components/DiningOutEstimatorModal';
import { CookLossCalculator } from './components/CookLossCalculator';
import { RecipeParser } from './components/RecipeParser';
import { TrueFatTrend } from './components/TrueFatTrend';
import { MealType } from './types/nutrition';

export const App: React.FC = () => {
  const { dailyLog, weeklyBank, addFoodToMeal, removeFoodFromMeal } = useNutritionStore();
  const [activeTab, setActiveTab] = useState<'today' | 'cookloss' | 'parser' | 'trend'>('today');
  
  // Керування модалкою додавання
  const [modalOpen, setModalOpen] = useState(false);
  const [diningModalOpen, setDiningModalOpen] = useState(false);
  const [targetMealType, setTargetMealType] = useState<MealType>('lunch');

  const handleOpenAdd = (mealType: MealType) => {
    setTargetMealType(mealType);
    setModalOpen(true);
  };

  const handleQuickAddCenter = () => {
    setTargetMealType('dinner');
    setModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-canvas text-slate-850 flex justify-center selection:bg-brand-emerald/20 selection:text-brand-emerald">
      <div className="w-full max-w-md sm:max-w-lg md:max-w-xl px-4 pt-safe pb-safe flex flex-col relative min-h-screen">
        {/* Верхня панель */}
        <Header date={dailyLog.date} />

        {/* Контент активної вкладки */}
        {activeTab === 'today' && (
          <main className="space-y-4 animate-fadeIn">
            {/* Неоморфне кільце калорій та БЖВ */}
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
                  macros
                });
              }}
            />

            {/* Список страв за прийомами їжі (Progressive Disclosure) */}
            <MealList
              meals={dailyLog.meals}
              onOpenAddModal={handleOpenAdd}
              onRemoveEntry={removeFoodFromMeal}
              onOpenDiningEstimator={() => setDiningModalOpen(true)}
            />
          </main>
        )}

        {activeTab === 'cookloss' && <CookLossCalculator />}
        {activeTab === 'parser' && <RecipeParser />}
        {activeTab === 'trend' && <TrueFatTrend />}

        {/* Нижня плаваюча скляна навігація (Apple Dock) */}
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
          onAdd={(mealType, data) => addFoodToMeal(mealType, { ...data, foodId: `item-${Date.now()}` })}
        />

        {/* Модалка ресторанної оцінки страв (Dining Out Estimator) */}
        <DiningOutEstimatorModal
          isOpen={diningModalOpen}
          onClose={() => setDiningModalOpen(false)}
          onAddMeal={(mealType, data) => addFoodToMeal(mealType, { ...data, foodId: `dining-${Date.now()}` })}
        />
      </div>
    </div>
  );
};

export default App;
