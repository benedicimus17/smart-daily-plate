import React, { useState } from 'react';
import { LineChart, TrendingDown, Info, Plus } from 'lucide-react';
import { calculateTrueFatTrend, WeightEntry } from '../math/trueFatTrend';

export const TrueFatTrend: React.FC = () => {
  const [entries, setEntries] = useState<WeightEntry[]>([
    { date: '10.10', rawWeightKg: 74.8 },
    { date: '11.10', rawWeightKg: 74.5 },
    { date: '12.10', rawWeightKg: 74.3 },
    { date: '13.10', rawWeightKg: 74.1 },
    { date: '14.10', rawWeightKg: 75.2 }, // Стрибок через натрій/воду після солоної їжі
    { date: '15.10', rawWeightKg: 74.4 },
    { date: '16.10', rawWeightKg: 73.9 },
  ]);

  const [inputWeight, setInputWeight] = useState('');

  const trendData = calculateTrueFatTrend(entries, 0.1);
  const latest = trendData[trendData.length - 1];
  const previous = trendData.length > 1 ? trendData[trendData.length - 2] : latest;

  const handleAddWeight = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(inputWeight);
    if (!val || val <= 0) return;

    const todayStr = new Intl.DateTimeFormat('uk-UA', { day: '2-digit', month: '2-digit' }).format(new Date());
    setEntries(prev => [...prev, { date: todayStr, rawWeightKg: val }]);
    setInputWeight('');
  };

  return (
    <div className="space-y-4 animate-fadeIn pb-24">
      <div className="glass-card rounded-4xl p-5 border border-white">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-brand-rose/10 text-brand-rose flex items-center justify-center">
              <LineChart className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-800">True Fat Trend</h2>
              <p className="text-xs text-slate-400">EMA α=0.1: відсікання стрибків солі та води</p>
            </div>
          </div>
        </div>

        {/* Порівняння: ваги проти істинного тренду */}
        <div className="p-4 rounded-3xl bg-slate-50/80 border border-slate-100 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 font-medium">Ваги сьогодні</span>
            <div className="text-2xl font-extrabold text-slate-800">
              {latest.rawWeightKg} <span className="text-sm font-normal text-slate-400">кг</span>
            </div>
            <div className="text-[11px] font-semibold text-slate-500 mt-0.5">
              {latest.waterRetentionDeltaKg > 0 ? `+${latest.waterRetentionDeltaKg} кг набряку` : 'Без затримки'}
            </div>
          </div>

          <div className="w-px h-10 bg-slate-200" />

          <div>
            <span className="text-xs text-brand-emerald font-semibold flex items-center gap-1">
              <TrendingDown className="w-3.5 h-3.5" /> Чистий жировий тренд
            </span>
            <div className="text-2xl font-extrabold text-brand-emerald">
              {latest.emaWeightKg} <span className="text-sm font-normal text-emerald-600/70">кг</span>
            </div>
            <span className="text-[11px] text-slate-500 font-medium">
              {(latest.emaWeightKg - previous.emaWeightKg).toFixed(1)} кг за останній запис
            </span>
          </div>
        </div>

        {/* Візуальний міні-графік останніх днів */}
        <div className="mt-4 pt-3 border-t border-slate-100">
          <span className="text-xs font-semibold text-slate-500 block mb-2">Хід тренду (EMA фільтр)</span>
          <div className="flex items-end justify-between h-24 gap-1.5 px-2">
            {trendData.slice(-7).map((item, idx) => {
              const heightPercent = Math.max(20, Math.min(100, (item.emaWeightKg - 72) * 25));
              return (
                <div key={idx} className="flex-1 flex flex-col items-center h-full justify-end">
                  <span className="text-[9px] text-slate-400 mb-1">{item.emaWeightKg}</span>
                  <div
                    className="w-full bg-brand-emerald/70 rounded-t-lg transition-all"
                    style={{ height: `${heightPercent}%` }}
                    title={`Ваги: ${item.rawWeightKg}кг, Тренд: ${item.emaWeightKg}кг`}
                  />
                  <span className="text-[9px] text-slate-400 mt-1">{item.date}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Форма швидкого запису ранкової ваги */}
        <form onSubmit={handleAddWeight} className="mt-4 pt-3 border-t border-slate-100 flex gap-2">
          <input
            type="number"
            step="0.1"
            value={inputWeight}
            onChange={(e) => setInputWeight(e.target.value)}
            placeholder="Ранкова вага (наприклад 74.2)"
            className="flex-1 px-3 py-2 text-xs rounded-xl bg-white border border-slate-200 focus:outline-none focus:border-brand-emerald"
          />
          <button
            type="submit"
            className="px-3 py-2 rounded-xl bg-brand-emerald text-white text-xs font-bold flex items-center gap-1 shadow-glow-emerald active:scale-95"
          >
            <Plus className="w-3.5 h-3.5" /> Записати
          </button>
        </form>

        <div className="mt-3 p-3 rounded-2xl bg-indigo-50/50 border border-indigo-100/50 flex gap-2.5 items-start text-xs text-slate-600">
          <Info className="w-4 h-4 text-brand-indigo shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            EMA фільтрує до 1-2 кг затримки глікогену та води після солоної їжі, оберігаючи від психологічних зривів дієти.
          </p>
        </div>
      </div>
    </div>
  );
};
