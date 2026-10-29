import React, { useState, useMemo } from 'react';
import { TrendingDown, Info, Plus, Sparkles, Scale, CheckCircle2 } from 'lucide-react';
import { calculateTrueFatTrend, WeightEntry } from '../math/trueFatTrend';
import { useUserStore } from '../store/userStore';
import { useTranslation } from '../store/languageStore';

export const TrueFatTrend: React.FC = () => {
  const { user } = useUserStore();
  const { t, lang } = useTranslation();
  const baseline = user?.weightKg && user.weightKg > 30 ? user.weightKg : 74;
  const kgUnit = t('kg_unit', 'kg');
  const localeCode =
    lang === 'es'
      ? 'es-ES'
      : lang === 'uk'
      ? 'uk-UA'
      : lang === 'de'
      ? 'de-DE'
      : lang === 'fr'
      ? 'fr-FR'
      : lang === 'it'
      ? 'it-IT'
      : 'en-US';

  // Генеруємо 7-денну реалістичну історію на базі ваги користувача
  const initialEntries: WeightEntry[] = useMemo(() => {
    const dates = ['16.10', '17.10', '18.10', '19.10', '20.10', '21.10', '22.10'];
    const deltas = [0.8, 0.5, 0.4, 1.1, 0.3, 0.1, -0.2]; // тимчасовий стрибок води 19.10
    return dates.map((d, i) => ({
      date: d,
      rawWeightKg: Math.round((baseline + deltas[i]) * 10) / 10
    }));
  }, [baseline]);

  const [entries, setEntries] = useState<WeightEntry[]>(initialEntries);
  const [inputWeight, setInputWeight] = useState('');
  const [addedToast, setAddedToast] = useState(false);

  const trendData = calculateTrueFatTrend(entries, 0.1);
  const latest = trendData[trendData.length - 1];

  // Динамічний розрахунок масштабу для колонок графіка
  const recentTrend = trendData.slice(-7);
  const minEma = Math.min(...recentTrend.map(item => item.emaWeightKg));
  const maxEma = Math.max(...recentTrend.map(item => item.emaWeightKg));
  const emaRange = Math.max(0.1, maxEma - minEma);

  const weeklyDelta = Math.round((latest.emaWeightKg - trendData[0].emaWeightKg) * 10) / 10;

  const handleAddWeight = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(inputWeight);
    if (!val || val <= 0) return;

    const todayStr = new Intl.DateTimeFormat(localeCode, { day: '2-digit', month: '2-digit' }).format(new Date());
    setEntries(prev => [...prev, { date: todayStr, rawWeightKg: val }]);
    setInputWeight('');
    setAddedToast(true);
    setTimeout(() => setAddedToast(false), 2000);
  };

  return (
    <div className="space-y-4 animate-fadeIn pb-24 text-white select-none">
      {/* 1. ГОЛОВНА КАРТКА В ТЕМНОМУ СКЛІ */}
      <div className="rounded-3xl p-5 bg-[#121814] border border-white/10 shadow-2xl relative overflow-hidden">
        {/* Заголовок простими словами */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-400/15 border border-amber-400/30 text-amber-400 flex items-center justify-center">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-black text-white tracking-tight">{t('my_weight_title')}</h2>
              <p className="text-xs text-zinc-400">{t('my_weight_subtitle')}</p>
            </div>
          </div>
          <span className="text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            {t('water_filter')}
          </span>
        </div>

        {/* 2. ЛЮДСЬКЕ ПОЯСНЕННЯ ДЛЯ КОРИСТУВАЧА */}
        <div className="p-3.5 rounded-2xl bg-black/40 border border-white/10 flex gap-2.5 items-start text-xs text-zinc-300">
          <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <p className="leading-relaxed text-[11.5px]">
            <strong className="text-white font-bold">{t('why_scale_lies')}</strong> {t('scale_lies_desc')}
          </p>
        </div>

        {/* 3. ДВІ ЧІТКІ КАРТКИ: НА ВАГАХ VS СПРАВЖНІЙ ЖИР */}
        <div className="grid grid-cols-2 gap-2.5 mt-3.5">
          {/* Щоденні ваги */}
          <div className="p-3.5 rounded-2xl bg-black/50 border border-white/10">
            <span className="text-[10.5px] text-zinc-400 font-bold uppercase tracking-wider block">
              {t('scale_today')}
            </span>
            <div className="text-2xl font-black text-white mt-0.5">
              {latest.rawWeightKg} <span className="text-xs font-semibold text-zinc-500">{kgUnit}</span>
            </div>
            <div className="text-[10.5px] font-semibold text-amber-300/90 mt-1">
              {latest.waterRetentionDeltaKg > 0
                ? `+${latest.waterRetentionDeltaKg} ${kgUnit} ${t('water_retention')}`
                : t('normal_water')}
            </div>
          </div>

          {/* Справжня вага (без водної похибки) */}
          <div className="p-3.5 rounded-2xl bg-emerald-950/30 border border-emerald-500/30">
            <span className="text-[10.5px] text-emerald-400 font-bold uppercase tracking-wider flex items-center gap-1">
              <TrendingDown className="w-3.5 h-3.5" /> {t('real_fat')}
            </span>
            <div className="text-2xl font-black text-emerald-400 mt-0.5">
              {latest.emaWeightKg} <span className="text-xs font-semibold text-emerald-500/70">{kgUnit}</span>
            </div>
            <div className="text-[10.5px] text-zinc-300 font-semibold mt-1">
              {weeklyDelta <= 0 ? `${weeklyDelta} ${kgUnit}` : `+${weeklyDelta} ${kgUnit}`}
            </div>
          </div>
        </div>

        {/* 4. ДИНАМІКА СПРАВЖНЬОЇ ВАГИ ЗА 7 ДНІВ */}
        <div className="mt-4 pt-3.5 border-t border-white/10">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-zinc-300">{t('trend_7days')}</span>
            <span className="text-[10px] text-emerald-400 font-extrabold flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> {t('stable_drop')}
            </span>
          </div>

          <div className="flex items-end justify-between h-28 gap-1.5 px-2 bg-black/40 p-3 rounded-2xl border border-white/5">
            {recentTrend.map((item, idx) => {
              // Адаптивний розрахунок висоти стовпчика від 35% до 92%
              const heightPercent = Math.round(35 + ((item.emaWeightKg - minEma) / emaRange) * 55);
              const isLatest = idx === recentTrend.length - 1;

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
                    title={`${t('true_weight_tooltip_scale', 'Ваги')}: ${item.rawWeightKg} ${kgUnit} • ${t('true_weight_tooltip_true', 'Справжня вага')}: ${item.emaWeightKg} ${kgUnit}`}
                  />
                  <span className="text-[9px] text-zinc-500 mt-1 font-semibold">{item.date}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* 5. ШВИДКИЙ ЗАПИС РАНКОВОЇ ВАГИ */}
        <form onSubmit={handleAddWeight} className="mt-4 pt-3.5 border-t border-white/10 flex gap-2">
          <input
            id="input-morning-weight"
            type="number"
            step="0.1"
            value={inputWeight}
            onChange={(e) => setInputWeight(e.target.value)}
            placeholder={t('morning_weight_ph_dynamic', `Ранкова вага натщесерце (наприклад ${baseline})`).replace('{val}', String(baseline))}
            className="flex-1 px-3.5 py-2.5 text-xs font-bold rounded-xl bg-black/60 border border-white/15 text-white placeholder-zinc-500 focus:outline-none focus:border-amber-400"
          />
          <button
            id="btn-record-weight"
            type="submit"
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 text-zinc-950 text-xs font-black flex items-center gap-1.5 shadow-md shadow-amber-400/20 active:scale-95 transition-all"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>{t('record_weight')}</span>
          </button>
        </form>

        {/* Спливаюче сповіщення про збереження */}
        {addedToast && (
          <div className="absolute inset-x-4 bottom-3 py-2 px-3 rounded-xl bg-emerald-500 text-zinc-950 font-bold text-xs flex items-center justify-center gap-1.5 shadow-2xl animate-fadeIn">
            <CheckCircle2 className="w-4 h-4" />
            <span>{t('weight_saved_toast', 'Вагу збережено! Справжній тренд перераховано.')}</span>
          </div>
        )}
      </div>
    </div>
  );
};
