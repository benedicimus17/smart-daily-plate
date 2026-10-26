import { MacroTargets } from './nutrition';

export type Gender = 'female' | 'male';

export type NutritionGoal =
  | 'lose_weight' // Схуднути
  | 'recomp'      // Рельєф (спалювання жиру + утримання м'язів)
  | 'maintain'    // Підтримка ваги
  | 'gain';       // Набір маси

export type WeightLossPace = 'steady' | 'fast';

export type ActivityLevel =
  | 'sedentary' // Малорухливий (офіс, до 5 000 кроків)
  | 'light'     // Легка активність (1-2 тренування / 6 000-8 000 кроків)
  | 'moderate'  // Помірна активність (3-4 тренування / 9 000-12 000 кроків)
  | 'high';     // Висока активність (щоденний спорт / 12 000+ кроків)

export interface UserBodyMetrics {
  gender: Gender;
  age: number;
  weightKg: number;
  heightCm: number;
  activityLevel: ActivityLevel;
  goal: NutritionGoal;
  pace: WeightLossPace;
  eatingRhythm?: '3_meals' | '5_meals';
  takesProtein?: boolean;
  dietType?: 'standard' | 'vegetarian' | 'vegan' | 'pescatarian';
  allergens?: ('lactose' | 'gluten' | 'nuts' | 'eggs' | 'seafood' | 'soy')[];
  customAllergies?: string[];
}

export interface UserProfile extends UserBodyMetrics {
  name: string;
  email: string;
  phone: string;
  isRegistered: boolean;
  hasCompletedPlan: boolean;
  faceIdEnabled: boolean;
  pinCodeEnabled: boolean;
  pinCode?: string;
  registeredAt?: string;
  savedTargets?: MacroTargets;
  isPro?: boolean;
}
