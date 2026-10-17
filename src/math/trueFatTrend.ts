export interface WeightEntry {
  date: string;
  rawWeightKg: number;
}

export interface TrueFatTrendResult {
  date: string;
  rawWeightKg: number;
  emaWeightKg: number;
  waterRetentionDeltaKg: number; // raw - ema
}

/**
 * Детермінований розрахунок істинного жирового тренду за алгоритмом EMA (α = 0.1)
 * Відсікає коливання затримки води, солі та натрію
 */
export function calculateTrueFatTrend(
  entries: WeightEntry[],
  alpha: number = 0.1
): TrueFatTrendResult[] {
  if (entries.length === 0) return [];

  const results: TrueFatTrendResult[] = [];
  let previousEma = entries[0].rawWeightKg;

  for (let i = 0; i < entries.length; i++) {
    const entry = entries[i];
    const ema = i === 0 
      ? entry.rawWeightKg 
      : (alpha * entry.rawWeightKg) + ((1 - alpha) * previousEma);

    previousEma = ema;

    const roundedRaw = Math.round(entry.rawWeightKg * 10) / 10;
    const roundedEma = Math.round(ema * 10) / 10;
    const waterDelta = Math.round((roundedRaw - roundedEma) * 10) / 10;

    results.push({
      date: entry.date,
      rawWeightKg: roundedRaw,
      emaWeightKg: roundedEma,
      waterRetentionDeltaKg: waterDelta,
    });
  }

  return results;
}
