import React from 'react';
import { UtensilsCrossed, CookingPot, ShoppingCart, Plus, Sparkles } from 'lucide-react';

export type NavTab = 'today' | 'cookloss' | 'grocery' | 'tools';

interface BottomNavProps {
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
  onQuickAdd: () => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, setActiveTab, onQuickAdd }) => {
  return (
    <div className="fixed bottom-safe inset-x-0 mx-auto max-w-md px-4 pointer-events-none z-40 mb-2">
      <div className="rounded-3xl p-2 px-3 flex items-center justify-between bg-[#101612]/92 border border-[#223125]/85 shadow-[0_12px_40px_rgba(0,0,0,0.9)] backdrop-blur-2xl pointer-events-auto">
        {/* 1. Сьогодні (Меню дня & Кільце калорій) */}
        <button
          type="button"
          onClick={() => setActiveTab('today')}
          className={`flex flex-col items-center justify-center py-1.5 px-3 rounded-2xl transition-all duration-200 ${
            activeTab === 'today'
              ? 'text-amber-400 font-bold bg-amber-500/15 shadow-[0_0_12px_rgba(245,158,11,0.25)] border border-amber-500/30'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <UtensilsCrossed className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] tracking-tight">Сьогодні</span>
        </button>

        {/* 2. Cook-Loss Каструля (Уварка / Ужарка) */}
        <button
          type="button"
          onClick={() => setActiveTab('cookloss')}
          className={`flex flex-col items-center justify-center py-1.5 px-3 rounded-2xl transition-all duration-200 ${
            activeTab === 'cookloss'
              ? 'text-amber-400 font-bold bg-amber-500/15 shadow-[0_0_12px_rgba(245,158,11,0.25)] border border-amber-500/30'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <CookingPot className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] tracking-tight">Каструля</span>
        </button>

        {/* 3. Головна центральна кнопка швидкого додавання (Apple style золоте світіння) */}
        <button
          type="button"
          onClick={onQuickAdd}
          className="w-12 h-12 -my-2.5 rounded-2xl bg-gradient-to-tr from-amber-500 via-amber-400 to-amber-300 text-zinc-950 flex items-center justify-center shadow-[0_0_22px_rgba(245,158,11,0.7)] hover:scale-105 active:scale-95 transition-all"
          title="Швидкий запис"
        >
          <Plus className="w-6 h-6 stroke-[3]" />
        </button>

        {/* 4. Покупки (Smart Grocery - автосписок на тиждень) */}
        <button
          type="button"
          onClick={() => setActiveTab('grocery')}
          className={`flex flex-col items-center justify-center py-1.5 px-3 rounded-2xl transition-all duration-200 ${
            activeTab === 'grocery'
              ? 'text-amber-400 font-bold bg-amber-500/15 shadow-[0_0_12px_rgba(245,158,11,0.25)] border border-amber-500/30'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <ShoppingCart className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] tracking-tight">Покупки</span>
        </button>

        {/* 5. Інструменти (Парсер TikTok & True Fat Trend) */}
        <button
          type="button"
          onClick={() => setActiveTab('tools')}
          className={`flex flex-col items-center justify-center py-1.5 px-3 rounded-2xl transition-all duration-200 ${
            activeTab === 'tools'
              ? 'text-amber-400 font-bold bg-amber-500/15 shadow-[0_0_12px_rgba(245,158,11,0.25)] border border-amber-500/30'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <Sparkles className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] tracking-tight">Інструменти</span>
        </button>
      </div>
    </div>
  );
};
