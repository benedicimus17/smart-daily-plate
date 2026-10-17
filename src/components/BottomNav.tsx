import React from 'react';
import { UtensilsCrossed, ChefHat, Link2, Plus, LineChart } from 'lucide-react';

interface BottomNavProps {
  activeTab: 'today' | 'cookloss' | 'parser' | 'trend';
  setActiveTab: (tab: 'today' | 'cookloss' | 'parser' | 'trend') => void;
  onQuickAdd: () => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, setActiveTab, onQuickAdd }) => {
  return (
    <div className="fixed bottom-safe inset-x-0 mx-auto max-w-md px-4 pointer-events-none z-40">
      <div className="glass-card rounded-3xl p-2 flex items-center justify-between border border-white/80 shadow-glass-hover pointer-events-auto">
        {/* Сьогодні */}
        <button
          onClick={() => setActiveTab('today')}
          className={`flex flex-col items-center justify-center py-1.5 px-3 rounded-2xl transition-all ${
            activeTab === 'today'
              ? 'text-brand-emerald font-bold'
              : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          <UtensilsCrossed className="w-5 h-5 mb-0.5" />
          <span className="text-[10px]">Тарілка</span>
        </button>

        {/* Cook-Loss Каструля */}
        <button
          onClick={() => setActiveTab('cookloss')}
          className={`flex flex-col items-center justify-center py-1.5 px-3 rounded-2xl transition-all ${
            activeTab === 'cookloss'
              ? 'text-brand-emerald font-bold'
              : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          <ChefHat className="w-5 h-5 mb-0.5" />
          <span className="text-[10px]">Каструля</span>
        </button>

        {/* Головна центральна кнопка швидкого додавання */}
        <button
          onClick={onQuickAdd}
          className="w-12 h-12 -my-2 rounded-2xl bg-gradient-to-tr from-brand-emerald to-emerald-400 text-white flex items-center justify-center shadow-glow-emerald hover:scale-105 active:scale-95 transition-all"
          title="Швидкий запис"
        >
          <Plus className="w-6 h-6 stroke-[2.5]" />
        </button>

        {/* Парсер рецептів з TikTok/Web */}
        <button
          onClick={() => setActiveTab('parser')}
          className={`flex flex-col items-center justify-center py-1.5 px-3 rounded-2xl transition-all ${
            activeTab === 'parser'
              ? 'text-brand-emerald font-bold'
              : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          <Link2 className="w-5 h-5 mb-0.5" />
          <span className="text-[10px]">Парсер</span>
        </button>

        {/* Тренд ваги (True Fat Trend) */}
        <button
          onClick={() => setActiveTab('trend')}
          className={`flex flex-col items-center justify-center py-1.5 px-3 rounded-2xl transition-all ${
            activeTab === 'trend'
              ? 'text-brand-emerald font-bold'
              : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          <LineChart className="w-5 h-5 mb-0.5" />
          <span className="text-[10px]">Тренд</span>
        </button>
      </div>
    </div>
  );
};
