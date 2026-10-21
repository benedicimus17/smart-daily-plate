import React, { useState } from 'react';
import { TrendingDown, Info, Plus, Sparkles, Activity } from 'lucide-react';
import { calculateTrueFatTrend, WeightEntry } from '../math/trueFatTrend';

export const TrueFatTrend: React.FC = () => {
  const [entries, setEntries] = useState<WeightEntry[]>([
    { date: '15.10', rawWeightKg: 74.8 },
    { date: '16.10', rawWeightKg: 74.5 },
    { date: '17.10', rawWeightKg: 74.3 },
    { date: '18.10', rawWeightKg: 74.1 },
    { date: '19.10', rawWeightKg: 75.2 }, // Стрибок через натрій/воду після солоної вечері
    { date: '20.10', rawWeightKg: 74.4 },
    { date: '21.10', rawWeightKg: 73.9 },
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
    <div className="space-y-4 animate-fadeIn pb-24 text-white select-none">
      {/* 1. ГОЛОВНА КАРТКА ТРЕНДУ В ТЕМНОМУ СКЛІ */}
      <div className="rounded-3xl p-5 bg-[#121814] border border-white/10 shadow-2xl relative overflow-hidden">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-400/15 border border-amber-400/30 text-amber-400 flex items-center justify-center">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-black text-white tracking-tight">True Fat Trend</h2>
              <p className="text-xs text-zinc-400">Істинний тренд: відсікання стрибків солі та води</p>
            </div>
          </div>
          <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400">
            EMA α=0.1
          </span>
        </div>

        {/* 2. РОЗ'ЯСНЕННЯ ДЛЯ КОРИСТУВАЧА ПРО ВОДУ VS ЖИР */}
        <div className="p-3.5 rounded-2xl bg-black/40 border border-white/10 flex gap-2.5 items-start text-xs text-zinc-300">
          <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <p className="leading-relaxed text-[11.5px]">
            <strong className="text-white font-bold">Чому ваги брешуть?</strong> Щоденна вага стрибає на 1–2 кг через натрій, вуглеводи та воду. Алгоритм NUTRIQ відфільтровує набряки і показує реальну швидкість спалювання чистого жиру.
          </p>
        </div>

        {/* 3. ПОРІВНЯННЯ: СИРА ВАГА ПРОТИ ЧИСТОГО ЖИРУ */}
        <div className="grid grid-cols-2 gap-2.5 mt-3.5">
          {/* Сира вага */}
          <div className="p-3.5 rounded-2xl bg-black/50 border border-white/10">
            <span className="text-[10.5px] text-zinc-400 font-bold uppercase tracking-wider block">
              Ваги сьогодні
            </span>
            <div className="text-2xl font-black text-white mt-0.5">
              {latest.rawWeightKg} <span className="text-xs font-semibold text-zinc-500">кг</span>
            </div>
            <div className="text-[10.5px] font-semibold text-amber-300/90 mt-1">
              {latest.waterRetentionDeltaKg > 0
                ? `+${latest.waterRetentionDeltaKg} кг води/набряку`
                : 'Без затримки води'}
            </div>
          </div>

          {/* Істинний жировий тренд */}
          <div className="p-3.5 rounded-2xl bg-emerald-950/30 border border-emerald-500/30">
            <span className="text-[10.5px] text-emerald-400 font-bold uppercase tracking-wider flex items-center gap-1">
              <TrendingDown className="w-3.5 h-3.5" /> Чистий жир
            </span>
            <div className="text-2xl font-black text-emerald-400 mt-0.5">
              {latest.emaWeightKg} <span className="text-xs font-semibold text-emerald-500/70">кг</span>
            </div>
            <div className="text-[10.5px] text-zinc-300 font-semibold mt-1">
              {(latest.emaWeightKg - previous.emaWeightKg).toFixed(1)} кг за тиждень
            </div>
          </div>
        </div>

        {/* 4. НЕОНОВИЙ ДИНАМІЧНИЙ ГРАФІК ТРЕНДУ (7 ДНІВ) */}
        <div className="mt-4 pt-3.5 border-t border-white/10">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-zinc-300">Динаміка жирового тренду за 7 днів</span>
            <span className="text-[10px] text-emerald-400 font-extrabold flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> Стабільний спад
            </span>
          </div>

          <div className="flex items-end justify-between h-28 gap-1.5 px-2 bg-black/40 p-3 rounded-2xl border border-white/5">
            {trendData.slice(-7).map((item, idx) => {
              const heightPercent = Math.max(25, Math.min(100, (item.emaWeightKg - 72) * 35));
              const isLatest = idx === trendData.slice(-7).length - 1;

              return (
                <div key={idx} className="flex-1 flex flex-col items-center h-full justify-end">
                  <span className={`text-[9px] mb-1 font-bold ${isLatest ? 'text-amber-300 font-black' : 'text-zinc-500'}`}>
                    {item.emaWeightKg}
                  </span>
                  <div
                    className={`w-full rounded-t-lg transition-all ${
                      isLatest
                        ? 'bg-gradient-to-t from-emerald-500 to-amber-400 shadow-lg shadow-emerald-500/30'
                        : 'bg-emerald-600/60 hover:bg-emerald-500/80'
                    }`}
                    style={{ height: `${heightPercent}%` }}
                    title={`Ваги: ${item.rawWeightKg}кг, Тренд: ${item.emaWeightKg}кг`}
                  />
                  <span className="text-[9px] text-zinc-500 mt-1 font-semibold">{item.date}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* 5. ФОРМА ШВИДКОГО ВНЕСЕННЯ РАНКОВОЇ ВАГИ */}
        <form onSubmit={handleAddWeight} className="mt-4 pt-3.5 border-t border-white/10 flex gap-2">
          <input
            type="number"
            step="0.1"
            value={inputWeight}
            onChange={(e) => setInputWeight(e.target.value)}
            placeholder="Ранкова вага (наприклад 74.2)"
            className="flex-1 px-3.5 py-2.5 text-xs font-bold rounded-xl bg-black/60 border border-white/15 text-white placeholder-zinc-500 focus:outline-none focus:border-amber-400"
          />
          <button
            type="submit"
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 text-zinc-950 text-xs font-black flex items-center gap-1.5 shadow-md shadow-amber-400/20 active:scale-95 transition-all"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Записати вагу</span>
          </button>
        </form>
      </div>
    </div>
  );
};
