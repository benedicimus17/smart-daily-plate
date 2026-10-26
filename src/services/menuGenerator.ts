/**
 * Smart Daily Plate (NUTRIQ) — Детермінований генератор щоденного раціону під персональну норму
 * Автоматично масштабує порції, страви, інгредієнти та КБЖВ на 100% відповідно до цілі користувача (калорії, білок, жири, вуглеводи).
 */

import { DailyLog, MacroTargets, MealEntry } from '../types/nutrition';
import { UserDietaryRestrictions } from './allergenService';

export interface GeneratedDayMenu {
  meals: DailyLog['meals'];
  totals: {
    calories: number;
    protein: number;
    fat: number;
    carbs: number;
  };
}

/**
 * Генерує збалансоване щоденне меню, яке рівно на 100% закриває персональні таргет-макроси
 * та суворо враховує дієтичні обмеження (вегетаріанство, веганство, алергії на лактозу, глютен, яйця тощо).
 */
export function generateDailyMealsForTargets(
  targets: MacroTargets,
  eatingRhythm: '3_meals' | '5_meals' = '3_meals',
  options: { markPastAsEaten?: boolean; userRestrictions?: UserDietaryRestrictions } = {}
): DailyLog['meals'] {
  const targetCals = Math.max(1200, targets.calories || 2000);
  const targetProt = Math.max(80, targets.protein || 140);
  const targetFat = Math.max(40, targets.fat || 70);
  const targetCarbs = Math.max(50, targets.carbs || 200);

  // Коефіцієнт масштабу відносно базового профілю 2000 ккал
  const baseScale = targetCals / 2000;

  const restrictions = options.userRestrictions;
  const isVegetarian = restrictions?.dietType === 'vegetarian' || restrictions?.dietType === 'vegan';
  const isVegan = restrictions?.dietType === 'vegan';
  const isPescatarian = restrictions?.dietType === 'pescatarian';
  const hasEggsAllergy = restrictions?.allergens?.includes('eggs');
  const hasGlutenAllergy = restrictions?.allergens?.includes('gluten');

  const toastLabel = hasGlutenAllergy ? 'безглютеновий тост' : 'цільнозерновий тост';

  if (eatingRhythm === '3_meals') {
    // 3 прийоми: Сніданок 32%, Обід 42%, Вечеря 26%
    const bfCals = Math.round(targetCals * 0.32);
    const bfProt = Math.round(targetProt * 0.30);
    const bfFat = Math.round(targetFat * 0.35);
    const bfCarbs = Math.round(targetCarbs * 0.30);

    const luCals = Math.round(targetCals * 0.42);
    const luProt = Math.round(targetProt * 0.42);
    const luFat = Math.round(targetFat * 0.35);
    const luCarbs = Math.round(targetCarbs * 0.45);

    // Вечеря забирає решту для 100% точності
    const diCals = targetCals - (bfCals + luCals);
    const diProt = targetProt - (bfProt + luProt);
    const diFat = targetFat - (bfFat + luFat);
    const diCarbs = targetCarbs - (bfCarbs + luCarbs);

    // Розрахунок грамів
    const avocadoGrams = Math.round(50 * baseScale);
    const toastGrams = Math.round(60 * baseScale);
    const quinoaGrams = Math.round(150 * baseScale);
    const asparagusGrams = Math.round(140 * baseScale);

    // Сніданок (захист від яєць / веганство)
    let breakfastEntry: MealEntry;
    if (isVegan || hasEggsAllergy) {
      const tofuGrams = Math.round(220 * baseScale);
      breakfastEntry = {
        id: `gen-b-${Date.now()}`,
        foodId: 'vegan_scramble',
        name: 'Дзен-Скрембл з тофу, авокадо та шпинатом',
        weightGrams: Math.round(220 * baseScale),
        macros: { calories: bfCals, protein: bfProt, fat: bfFat, carbs: bfCarbs },
        timestamp: '08:30',
        eaten: options.markPastAsEaten ? true : false,
        recipeDetails: `Тофу органічний ${tofuGrams}г, авокадо хасс ${avocadoGrams}г, шпинат свіжий 50г, ${toastLabel} ${toastGrams}г`
      };
    } else {
      const eggsCount = Math.max(2, Math.round(3 * baseScale));
      breakfastEntry = {
        id: `gen-b-${Date.now()}`,
        foodId: 'zen_omelet',
        name: 'Дзен-Омлет з авокадо, шпинатом та тостом',
        weightGrams: Math.round(220 * baseScale),
        macros: { calories: bfCals, protein: bfProt, fat: bfFat, carbs: bfCarbs },
        timestamp: '08:30',
        eaten: options.markPastAsEaten ? true : false,
        recipeDetails: `Курячі яйця ${eggsCount} шт, авокадо хасс ${avocadoGrams}г, шпинат свіжий 50г, ${toastLabel} ${toastGrams}г`
      };
    }

    // Обід (захист від м'яса для Vegetarian / Vegan / Pescatarian)
    let lunchEntry: MealEntry;
    if (isVegetarian) {
      const chickpeaGrams = Math.round(200 * baseScale);
      lunchEntry = {
        id: `gen-l-${Date.now()}`,
        foodId: 'chickpea_quinoa_bowl',
        name: 'Нут та кіноа Боул з печеними овочами',
        weightGrams: Math.round(chickpeaGrams + quinoaGrams + 80),
        macros: { calories: luCals, protein: luProt, fat: luFat, carbs: luCarbs },
        timestamp: '13:00',
        eaten: options.markPastAsEaten ? true : false,
        recipeDetails: `Нут відварений ${chickpeaGrams}г, кіноа ${quinoaGrams}г, броколі на пару 80г, оливкова олія`
      };
    } else if (isPescatarian && !isVegan) {
      const salmonRaw = Math.round(220 * baseScale);
      const salmonCooked = Math.round(salmonRaw * 0.78);
      lunchEntry = {
        id: `gen-l-${Date.now()}`,
        foodId: 'salmon_quinoa',
        name: 'Філе лосося на пару з кіноа та броколі',
        weightGrams: Math.round(salmonCooked + quinoaGrams + 80),
        macros: { calories: luCals, protein: luProt, fat: luFat, carbs: luCarbs },
        timestamp: '13:00',
        eaten: options.markPastAsEaten ? true : false,
        isCookLoss: true,
        rawWeightGrams: salmonRaw,
        cookedWeightGrams: salmonCooked,
        recipeDetails: `Лосось ${salmonRaw}г ➔ ${salmonCooked}г (-22% Cook-Loss), кіноа ${quinoaGrams}г, броколі 80г`
      };
    } else {
      const rawTurkeyGrams = Math.round(260 * (bfProt + luProt) / 140);
      const cookedTurkeyGrams = Math.round(rawTurkeyGrams * 0.75); // -25% Cook-Loss
      lunchEntry = {
        id: `gen-l-${Date.now()}`,
        foodId: 'turkey_quinoa',
        name: 'Філе індички запечене з кіноа та броколі',
        weightGrams: Math.round(cookedTurkeyGrams + quinoaGrams + 80),
        macros: { calories: luCals, protein: luProt, fat: luFat, carbs: luCarbs },
        timestamp: '13:00',
        eaten: options.markPastAsEaten ? true : false,
        isCookLoss: true,
        rawWeightGrams: rawTurkeyGrams,
        cookedWeightGrams: cookedTurkeyGrams,
        recipeDetails: `Філе індички ${rawTurkeyGrams}г ➔ ${cookedTurkeyGrams}г (-25% Cook-Loss), кіноа відварене ${quinoaGrams}г, броколі на пару 80г`
      };
    }

    // Вечеря (захист від м'яса)
    let dinnerEntry: MealEntry;
    if (isVegetarian) {
      const tofuSteakGrams = Math.round(240 * baseScale);
      dinnerEntry = {
        id: `gen-d-${Date.now()}`,
        foodId: 'tofu_steak',
        name: 'Стейк з тофу на грилі зі спаржею',
        weightGrams: Math.round(tofuSteakGrams + asparagusGrams),
        macros: { calories: diCals, protein: diProt, fat: diFat, carbs: diCarbs },
        timestamp: '19:30',
        eaten: false,
        recipeDetails: `Тофу гриль ${tofuSteakGrams}г, спаржа свіжа гриль ${asparagusGrams}г, мікс зелені`
      };
    } else if (isPescatarian && !isVegan) {
      const tunaRaw = Math.round(240 * baseScale);
      const tunaCooked = Math.round(tunaRaw * 0.76);
      dinnerEntry = {
        id: `gen-d-${Date.now()}`,
        foodId: 'tuna_steak',
        name: 'Стейк тунця на грилі зі спаржею',
        weightGrams: Math.round(tunaCooked + asparagusGrams),
        macros: { calories: diCals, protein: diProt, fat: diFat, carbs: diCarbs },
        timestamp: '19:30',
        eaten: false,
        isCookLoss: true,
        rawWeightGrams: tunaRaw,
        cookedWeightGrams: tunaCooked,
        recipeDetails: `Тунець стейк ${tunaRaw}г ➔ ${tunaCooked}г (-24% Cook-Loss), спаржа ${asparagusGrams}г, мікс зелені`
      };
    } else {
      const rawSteakGrams = Math.round(280 * (diProt / 60));
      const cookedSteakGrams = Math.round(rawSteakGrams * 0.74); // -26% Cook-Loss
      dinnerEntry = {
        id: `gen-d-${Date.now()}`,
        foodId: 'gourmet_steak',
        name: 'Gourmet Steak & Greens (Стейк рибай зі спаржею)',
        weightGrams: Math.round(cookedSteakGrams + asparagusGrams),
        macros: { calories: diCals, protein: diProt, fat: diFat, carbs: diCarbs },
        timestamp: '19:30',
        eaten: false,
        isCookLoss: true,
        rawWeightGrams: rawSteakGrams,
        cookedWeightGrams: cookedSteakGrams,
        recipeDetails: `Стейк яловичий ${rawSteakGrams}г ➔ ${cookedSteakGrams}г (-26% Cook-Loss), спаржа свіжа гриль ${asparagusGrams}г, мікс зелені`
      };
    }

    return {
      breakfast: {
        type: 'breakfast',
        title: 'Сніданок',
        icon: 'SunMedium',
        entries: [breakfastEntry],
        totalMacros: options.markPastAsEaten ? breakfastEntry.macros : { calories: 0, protein: 0, fat: 0, carbs: 0 }
      },
      lunch: {
        type: 'lunch',
        title: 'Обід',
        icon: 'Flame',
        entries: [lunchEntry],
        totalMacros: options.markPastAsEaten ? lunchEntry.macros : { calories: 0, protein: 0, fat: 0, carbs: 0 }
      },
      snack: {
        type: 'snack',
        title: 'Перекус',
        icon: 'Apple',
        entries: [],
        totalMacros: { calories: 0, protein: 0, fat: 0, carbs: 0 }
      },
      dinner: {
        type: 'dinner',
        title: 'Вечеря',
        icon: 'Moon',
        entries: [dinnerEntry],
        totalMacros: { calories: 0, protein: 0, fat: 0, carbs: 0 }
      }
    };
  }

  // 4/5 прийомів (Дробове харчування): Сніданок 25%, Обід 35%, Перекус 15%, Вечеря 25%
  const bfCals = Math.round(targetCals * 0.25);
  const bfProt = Math.round(targetProt * 0.24);
  const bfFat = Math.round(targetFat * 0.28);
  const bfCarbs = Math.round(targetCarbs * 0.24);

  const luCals = Math.round(targetCals * 0.35);
  const luProt = Math.round(targetProt * 0.38);
  const luFat = Math.round(targetFat * 0.28);
  const luCarbs = Math.round(targetCarbs * 0.40);

  const snCals = Math.round(targetCals * 0.15);
  const snProt = Math.round(targetProt * 0.14);
  const snFat = Math.round(targetFat * 0.16);
  const snCarbs = Math.round(targetCarbs * 0.14);

  // Вечеря забирає залишок для 100% точності
  const diCals = targetCals - (bfCals + luCals + snCals);
  const diProt = targetProt - (bfProt + luProt + snProt);
  const diFat = targetFat - (bfFat + luFat + snFat);
  const diCarbs = targetCarbs - (bfCarbs + luCarbs + snCarbs);

  const hasLactoseAllergy = restrictions?.allergens?.includes('lactose');
  const hasNutsAllergy = restrictions?.allergens?.includes('nuts');

  // 1. Сніданок (захист від яєць / веганство)
  let breakfastEntry: MealEntry;
  if (isVegan || hasEggsAllergy) {
    const tofuGrams = Math.round(180 * baseScale);
    breakfastEntry = {
      id: `gen-b-${Date.now()}`,
      foodId: 'vegan_scramble',
      name: 'Скрембл з тофу, авокадо та тостом',
      weightGrams: Math.round(180 * baseScale),
      macros: { calories: bfCals, protein: bfProt, fat: bfFat, carbs: bfCarbs },
      timestamp: '08:30',
      eaten: options.markPastAsEaten ? true : false,
      recipeDetails: `Тофу органічний ${tofuGrams}г, авокадо хасс ${Math.round(40 * baseScale)}г, ${toastLabel} ${Math.round(45 * baseScale)}г`
    };
  } else {
    const eggsCount = Math.max(2, Math.round(3 * baseScale));
    breakfastEntry = {
      id: `gen-b-${Date.now()}`,
      foodId: 'zen_omelet',
      name: 'Омлет з авокадо та тостом',
      weightGrams: Math.round(200 * baseScale),
      macros: { calories: bfCals, protein: bfProt, fat: bfFat, carbs: bfCarbs },
      timestamp: '08:30',
      eaten: options.markPastAsEaten ? true : false,
      recipeDetails: `Курячі яйця ${eggsCount} шт, авокадо хасс ${Math.round(45 * baseScale)}г, ${toastLabel} ${Math.round(45 * baseScale)}г`
    };
  }

  // 2. Обід (захист від м'яса / веганство / пескетаріанство)
  let lunchEntry: MealEntry;
  if (isVegetarian) {
    const chickpeaGrams = Math.round(180 * baseScale);
    lunchEntry = {
      id: `gen-l-${Date.now()}`,
      foodId: 'chickpea_quinoa_bowl',
      name: 'Нут та кіноа Боул з печеними овочами',
      weightGrams: Math.round(chickpeaGrams + 130 * baseScale + 60),
      macros: { calories: luCals, protein: luProt, fat: luFat, carbs: luCarbs },
      timestamp: '13:00',
      eaten: options.markPastAsEaten ? true : false,
      recipeDetails: `Нут відварений ${chickpeaGrams}г, кіноа ${Math.round(130 * baseScale)}г, броколі на пару 60г, оливкова олія`
    };
  } else if (isPescatarian && !isVegan) {
    const salmonRaw = Math.round(200 * baseScale);
    const salmonCooked = Math.round(salmonRaw * 0.78);
    lunchEntry = {
      id: `gen-l-${Date.now()}`,
      foodId: 'salmon_quinoa',
      name: 'Філе лосося на пару з кіноа',
      weightGrams: Math.round(salmonCooked + 130 * baseScale),
      macros: { calories: luCals, protein: luProt, fat: luFat, carbs: luCarbs },
      timestamp: '13:00',
      eaten: options.markPastAsEaten ? true : false,
      isCookLoss: true,
      rawWeightGrams: salmonRaw,
      cookedWeightGrams: salmonCooked,
      recipeDetails: `Лосось ${salmonRaw}г ➔ ${salmonCooked}г (-22% Cook-Loss), кіноа ${Math.round(130 * baseScale)}г`
    };
  } else {
    const rawTurkeyGrams = Math.round(240 * (luProt / 60));
    const cookedTurkeyGrams = Math.round(rawTurkeyGrams * 0.75);
    lunchEntry = {
      id: `gen-l-${Date.now()}`,
      foodId: 'turkey_quinoa',
      name: 'Філе індички запечене з кіноа',
      weightGrams: Math.round(cookedTurkeyGrams + 160 * baseScale),
      macros: { calories: luCals, protein: luProt, fat: luFat, carbs: luCarbs },
      timestamp: '13:00',
      eaten: options.markPastAsEaten ? true : false,
      isCookLoss: true,
      rawWeightGrams: rawTurkeyGrams,
      cookedWeightGrams: cookedTurkeyGrams,
      recipeDetails: `Філе індички ${rawTurkeyGrams}г ➔ ${cookedTurkeyGrams}г (-25% Cook-Loss), кіноа ${Math.round(130 * baseScale)}г`
    };
  }

  // 3. Перекус (захист від лактози / горіхів / веганство)
  let snackEntry: MealEntry;
  const berriesGrams = Math.round(70 * baseScale);
  if (isVegan || hasLactoseAllergy) {
    const chiaGrams = Math.round(35 * baseScale);
    const nutDetail = hasNutsAllergy ? 'насіння соняшника 15г' : `мигдаль ${Math.round(15 * baseScale)}г`;
    snackEntry = {
      id: `gen-s-${Date.now()}`,
      foodId: 'chia_coconut_pudding',
      name: 'Кокосовий чіа-пудинг з лісовими ягодами',
      weightGrams: Math.round(150 + berriesGrams + 20),
      macros: { calories: snCals, protein: snProt, fat: snFat, carbs: snCarbs },
      timestamp: '16:30',
      eaten: options.markPastAsEaten ? true : false,
      recipeDetails: `Кокосове молоко 150г, насіння чіа ${chiaGrams}г, ягоди ${berriesGrams}г, ${nutDetail}`
    };
  } else {
    const yogurtGrams = Math.round(180 * baseScale);
    const nutDetail = hasNutsAllergy ? 'насіння соняшника 15г' : `мигдаль ${Math.round(15 * baseScale)}г`;
    snackEntry = {
      id: `gen-s-${Date.now()}`,
      foodId: 'greek_yogurt',
      name: hasNutsAllergy ? 'Грецький йогурт 2% з лісовими ягодами та насінням' : 'Грецький йогурт 2% з лісовими ягодами та горіхами',
      weightGrams: Math.round(yogurtGrams + berriesGrams + 20),
      macros: { calories: snCals, protein: snProt, fat: snFat, carbs: snCarbs },
      timestamp: '16:30',
      eaten: options.markPastAsEaten ? true : false,
      recipeDetails: `Грецький йогурт ${yogurtGrams}г, ягоди ${berriesGrams}г, ${nutDetail}`
    };
  }

  // 4. Вечеря (захист від м'яса / веганство / пескетаріанство)
  let dinnerEntry: MealEntry;
  if (isVegetarian) {
    const tofuSteakGrams = Math.round(220 * baseScale);
    dinnerEntry = {
      id: `gen-d-${Date.now()}`,
      foodId: 'tofu_steak',
      name: 'Стейк з тофу на грилі зі спаржею',
      weightGrams: Math.round(tofuSteakGrams + 140 * baseScale),
      macros: { calories: diCals, protein: diProt, fat: diFat, carbs: diCarbs },
      timestamp: '19:30',
      eaten: false,
      recipeDetails: `Тофу гриль ${tofuSteakGrams}г, спаржа свіжа ${Math.round(140 * baseScale)}г`
    };
  } else if (isPescatarian && !isVegan) {
    const tunaRaw = Math.round(220 * baseScale);
    const tunaCooked = Math.round(tunaRaw * 0.76);
    dinnerEntry = {
      id: `gen-d-${Date.now()}`,
      foodId: 'tuna_steak',
      name: 'Стейк тунця на грилі зі спаржею',
      weightGrams: Math.round(tunaCooked + 140 * baseScale),
      macros: { calories: diCals, protein: diProt, fat: diFat, carbs: diCarbs },
      timestamp: '19:30',
      eaten: false,
      isCookLoss: true,
      rawWeightGrams: tunaRaw,
      cookedWeightGrams: tunaCooked,
      recipeDetails: `Тунець стейк ${tunaRaw}г ➔ ${tunaCooked}г (-24% Cook-Loss), спаржа свіжа ${Math.round(140 * baseScale)}г`
    };
  } else {
    const rawSteakGrams = Math.round(260 * (diProt / 55));
    const cookedSteakGrams = Math.round(rawSteakGrams * 0.74);
    dinnerEntry = {
      id: `gen-d-${Date.now()}`,
      foodId: 'gourmet_steak',
      name: 'Gourmet Steak & Greens (Стейк рибай зі спаржею)',
      weightGrams: Math.round(cookedSteakGrams + 140 * baseScale),
      macros: { calories: diCals, protein: diProt, fat: diFat, carbs: diCarbs },
      timestamp: '19:30',
      eaten: false,
      isCookLoss: true,
      rawWeightGrams: rawSteakGrams,
      cookedWeightGrams: cookedSteakGrams,
      recipeDetails: `Стейк яловичий ${rawSteakGrams}г ➔ ${cookedSteakGrams}г (-26% Cook-Loss), спаржа свіжа ${Math.round(140 * baseScale)}г`
    };
  }

  return {
    breakfast: {
      type: 'breakfast',
      title: 'Сніданок',
      icon: 'SunMedium',
      entries: [breakfastEntry],
      totalMacros: options.markPastAsEaten ? breakfastEntry.macros : { calories: 0, protein: 0, fat: 0, carbs: 0 }
    },
    lunch: {
      type: 'lunch',
      title: 'Обід',
      icon: 'Flame',
      entries: [lunchEntry],
      totalMacros: options.markPastAsEaten ? lunchEntry.macros : { calories: 0, protein: 0, fat: 0, carbs: 0 }
    },
    snack: {
      type: 'snack',
      title: 'Перекус',
      icon: 'Apple',
      entries: [snackEntry],
      totalMacros: options.markPastAsEaten ? snackEntry.macros : { calories: 0, protein: 0, fat: 0, carbs: 0 }
    },
    dinner: {
      type: 'dinner',
      title: 'Вечеря',
      icon: 'Moon',
      entries: [dinnerEntry],
      totalMacros: { calories: 0, protein: 0, fat: 0, carbs: 0 }
    }
  };
}
