import { supabase, isCloudConfigured } from './supabaseClient';
import { UserProfile } from '../types/user';
import { MealEntry } from '../types/nutrition';
import { GroceryItem } from '../types/grocery';
import { verifyLicenseIntegrity, SignedLicenseReceipt } from './cryptoSecurity';

export interface SyncStatus {
  isOnline: boolean;
  isCloudReady: boolean;
  lastSyncedAt: string | null;
  pendingSyncCount: number;
}

/**
 * Checks if device currently has active network connection
 */
export function checkNetworkOnline(): boolean {
  return typeof navigator !== 'undefined' ? navigator.onLine : true;
}

/**
 * Push user profile to Supabase `profiles` table
 */
export async function syncUserProfileToCloud(profile: UserProfile): Promise<{ success: boolean; error?: string }> {
  if (!isCloudConfigured || !supabase || !profile.email) {
    return { success: true }; // Local-first fallback
  }

  try {
    const { data: sessionData } = await supabase.auth.getSession();
    const userId = sessionData?.session?.user?.id;
    if (!userId) return { success: false, error: 'NO_AUTH_SESSION' };

    const { error } = await supabase.from('profiles').upsert({
      id: userId,
      email: profile.email,
      full_name: profile.name,
      phone: profile.phone,
      gender: profile.gender,
      age: profile.age,
      weight_kg: profile.weightKg,
      height_cm: profile.heightCm,
      activity_level: profile.activityLevel,
      goal: profile.goal,
      pace: profile.pace,
      target_calories: profile.savedTargets?.calories || 1500,
      target_protein: profile.savedTargets?.protein || 140,
      target_fat: profile.savedTargets?.fat || 45,
      target_carbs: profile.savedTargets?.carbs || 135,
      face_id_enabled: profile.faceIdEnabled
    });

    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : 'SYNC_FAILED' };
  }
}

/**
 * Push daily food logs to Supabase `daily_logs` table
 */
export async function syncDailyLogsToCloud(
  meals: MealEntry[],
  dateStr: string,
  mealSlot: 'breakfast' | 'lunch' | 'dinner' | 'snack' = 'lunch'
): Promise<{ success: boolean; count: number; error?: string }> {
  if (!isCloudConfigured || !supabase || meals.length === 0) {
    return { success: true, count: 0 };
  }

  try {
    const { data: sessionData } = await supabase.auth.getSession();
    const userId = sessionData?.session?.user?.id;
    if (!userId) return { success: false, count: 0, error: 'NO_AUTH_SESSION' };

    const rows = meals.map((m) => ({
      user_id: userId,
      log_date: dateStr,
      meal_slot: mealSlot,
      scheduled_time: m.timestamp || '12:00',
      dish_id: m.id,
      dish_name: m.name,
      calories: m.macros.calories,
      protein: m.macros.protein,
      fat: m.macros.fat,
      carbs: m.macros.carbs,
      raw_weight_g: m.rawWeightGrams || null,
      cooked_weight_g: m.cookedWeightGrams || m.weightGrams || null,
      cook_loss_factor: m.rawWeightGrams && m.cookedWeightGrams ? m.cookedWeightGrams / m.rawWeightGrams : 0.75,
      is_eaten: Boolean(m.eaten)
    }));

    const { error } = await supabase.from('daily_logs').upsert(rows, {
      onConflict: 'user_id,log_date,dish_id'
    });

    if (error) return { success: false, count: 0, error: error.message };
    return { success: true, count: rows.length };
  } catch (err: unknown) {
    return { success: false, count: 0, error: err instanceof Error ? err.message : 'SYNC_FAILED' };
  }
}

/**
 * Push grocery items to Supabase `grocery_items` table
 */
export async function syncGroceryItemsToCloud(
  items: GroceryItem[]
): Promise<{ success: boolean; error?: string }> {
  if (!isCloudConfigured || !supabase || items.length === 0) {
    return { success: true };
  }

  try {
    const { data: sessionData } = await supabase.auth.getSession();
    const userId = sessionData?.session?.user?.id;
    if (!userId) return { success: false, error: 'NO_AUTH_SESSION' };

    const rows = items.map((item) => ({
      user_id: userId,
      name: item.name,
      category: item.category,
      raw_quantity: item.amount,
      is_bought: item.isBought,
      is_custom: item.source === 'custom'
    }));

    const { error } = await supabase.from('grocery_items').upsert(rows);
    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : 'SYNC_FAILED' };
  }
}

/**
 * Server-authenticated PRO status check
 * Prevents client-side manipulation of `isPro: true`
 */
export async function verifyServerSubscription(
  userId: string,
  localReceipt: SignedLicenseReceipt | null
): Promise<{ isPro: boolean; tier: string; verifiedOnline: boolean }> {
  // 1. If online and cloud is configured, verify directly against the database
  if (checkNetworkOnline() && isCloudConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('subscriptions')
        .select('tier, status, is_pro, current_period_end, tamper_proof_token')
        .eq('user_id', userId)
        .single();

      if (!error && data) {
        const isServerPro = Boolean(data.is_pro);
        return {
          isPro: isServerPro,
          tier: data.tier,
          verifiedOnline: true
        };
      }
    } catch {
      // Fall through to cryptographic offline verification if server is unreachable
    }
  }

  // 2. Offline Mode: verify cryptographic signature without internet
  const offlineCheck = await verifyLicenseIntegrity(localReceipt);
  if (offlineCheck.isValid && offlineCheck.isPro) {
    return {
      isPro: true,
      tier: localReceipt?.payload.tier || 'pro_monthly',
      verifiedOnline: false
    };
  }

  // 3. Fallback: unauthenticated / expired / tampered
  return { isPro: false, tier: 'free', verifiedOnline: false };
}
