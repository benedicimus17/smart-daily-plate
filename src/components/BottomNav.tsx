import React from 'react';
import { Home, ClipboardList, Plus, TrendingUp, User } from 'lucide-react';

export type NavTab = 'today' | 'cookloss' | 'grocery' | 'tools';

interface BottomNavProps {
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
  onQuickAdd: () => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, setActiveTab, onQuickAdd }) => {
  return (
    <div className="fixed bottom-0 inset-x-0 mx-auto max-w-md px-4 pointer-events-none z-40 pb-[max(1.25rem,env(safe-area-inset-bottom))] mb-1">
      <div className="rounded-3xl p-1.5 px-3 flex items-center justify-between bg-[#0F1612]/95 border border-[#203023]/90 shadow-[0_15px_40px_rgba(0,0,0,0.95)] backdrop-blur-2xl pointer-events-auto">
        {/* 1. Home (Головна) */}
        <button
          type="button"
          onClick={() => setActiveTab('today')}
          className={`flex flex-col items-center justify-center py-1.5 px-3 rounded-2xl transition-all duration-200 ${
            activeTab === 'today'
              ? 'text-amber-400 font-bold'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <Home className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] tracking-tight">Home</span>
        </button>

        {/* 2. Log (Щоденник / Каструля) */}
        <button
          type="button"
          onClick={() => setActiveTab('cookloss')}
          className={`flex flex-col items-center justify-center py-1.5 px-3 rounded-2xl transition-all duration-200 ${
            activeTab === 'cookloss'
              ? 'text-amber-400 font-bold'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <ClipboardList className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] tracking-tight">Log</span>
        </button>

        {/* 3. Головна центральна золота кнопка (+) точно як у макеті */}
        <button
          type="button"
          onClick={onQuickAdd}
          className="w-12 h-12 -my-2 rounded-full bg-gradient-to-tr from-amber-500 via-amber-400 to-amber-300 text-zinc-950 flex items-center justify-center shadow-[0_0_20px_rgba(245,158,11,0.7)] hover:scale-105 active:scale-95 transition-all"
          title="Quick Add"
        >
          <Plus className="w-6 h-6 stroke-[3]" />
        </button>

        {/* 4. Trends (Тренди / Покупки) */}
        <button
          type="button"
          onClick={() => setActiveTab('grocery')}
          className={`flex flex-col items-center justify-center py-1.5 px-3 rounded-2xl transition-all duration-200 ${
            activeTab === 'grocery'
              ? 'text-amber-400 font-bold'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <TrendingUp className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] tracking-tight">Trends</span>
        </button>

        {/* 5. Profile (Профіль / Інструменти) */}
        <button
          type="button"
          onClick={() => setActiveTab('tools')}
          className={`flex flex-col items-center justify-center py-1.5 px-3 rounded-2xl transition-all duration-200 ${
            activeTab === 'tools'
              ? 'text-amber-400 font-bold'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <User className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] tracking-tight">Profile</span>
        </button>
      </div>
    </div>
  );
};
