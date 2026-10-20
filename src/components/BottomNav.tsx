import React from 'react';
import { Home, ClipboardList, Plus, BarChart3, User } from 'lucide-react';

export type NavTab = 'today' | 'cookloss' | 'grocery' | 'tools';

interface BottomNavProps {
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
  onQuickAdd: () => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, setActiveTab, onQuickAdd }) => {
  return (
    <div className="fixed bottom-0 inset-x-0 mx-auto max-w-md px-4 pointer-events-none z-40 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
      <div className="rounded-[28px] py-2 px-4 flex items-center justify-between liquid-dock pointer-events-auto">
        {/* 1. Home (Головна) */}
        <button
          type="button"
          onClick={() => setActiveTab('today')}
          className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-2xl transition-all duration-200 ${
            activeTab === 'today'
              ? 'text-[#F5B041] font-semibold'
              : 'text-[#9AB0A2] hover:text-zinc-200'
          }`}
        >
          <Home className={`w-5 h-5 mb-0.5 ${activeTab === 'today' ? 'fill-[#F5B041]/25 stroke-[#F5B041]' : ''}`} />
          <span className="text-[10px] tracking-tight">Home</span>
        </button>

        {/* 2. Log (Щоденник / Каструля) */}
        <button
          type="button"
          onClick={() => setActiveTab('cookloss')}
          className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-2xl transition-all duration-200 ${
            activeTab === 'cookloss'
              ? 'text-[#F5B041] font-semibold'
              : 'text-[#9AB0A2] hover:text-zinc-200'
          }`}
        >
          <ClipboardList className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] tracking-tight">Log</span>
        </button>

        {/* 3. Центральна матова бурштинова кнопка (+) точно як у макеті */}
        <button
          type="button"
          onClick={onQuickAdd}
          className="w-11 h-11 rounded-full flex items-center justify-center transition-all hover:scale-105 active:scale-95"
          style={{
            background: 'radial-gradient(circle at 50% 30%, rgba(245,176,65,0.42) 0%, rgba(180,115,28,0.28) 100%)',
            border: '1px solid rgba(253,224,71,0.45)',
            boxShadow: '0 0 18px rgba(245,158,11,0.35), inset 0 1px 1px rgba(255,255,255,0.25)'
          }}
          title="Quick Add"
        >
          <Plus className="w-5 h-5 text-[#FDE68A] stroke-[2.2]" />
        </button>

        {/* 4. Trends (Тренди / Покупки) */}
        <button
          type="button"
          onClick={() => setActiveTab('grocery')}
          className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-2xl transition-all duration-200 ${
            activeTab === 'grocery'
              ? 'text-[#F5B041] font-semibold'
              : 'text-[#9AB0A2] hover:text-zinc-200'
          }`}
        >
          <BarChart3 className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] tracking-tight">Trends</span>
        </button>

        {/* 5. Profile (Профіль / Інструменти) */}
        <button
          type="button"
          onClick={() => setActiveTab('tools')}
          className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-2xl transition-all duration-200 ${
            activeTab === 'tools'
              ? 'text-[#F5B041] font-semibold'
              : 'text-[#9AB0A2] hover:text-zinc-200'
          }`}
        >
          <User className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] tracking-tight">Profile</span>
        </button>
      </div>
    </div>
  );
};
