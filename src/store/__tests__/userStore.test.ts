import { describe, it, expect, beforeEach } from 'vitest';
import { useUserStore } from '../userStore';

describe('userStore - Onboarding, Freemium & Test User Reset', () => {
  beforeEach(() => {
    useUserStore.getState().resetToNewGuestUser();
  });

  it('resets to a fresh guest user with hasCompletedPlan: false and isPro: false', () => {
    // Modify user
    useUserStore.getState().setProStatus(true);
    expect(useUserStore.getState().user.isPro).toBe(true);

    // Reset
    useUserStore.getState().resetToNewGuestUser();
    const state = useUserStore.getState().user;
    expect(state.name).toBe('Гість');
    expect(state.email).toBe('');
    expect(state.isRegistered).toBe(false);
    expect(state.hasCompletedPlan).toBe(false);
    expect(state.isPro).toBe(false);
  });

  it('toggles PRO status correctly between FREE and PRO', () => {
    const store = useUserStore.getState();
    expect(store.user.isPro).toBe(false);

    store.setProStatus(true);
    expect(useUserStore.getState().user.isPro).toBe(true);

    store.setProStatus(false);
    expect(useUserStore.getState().user.isPro).toBe(false);
  });

  it('accepts arbitrary test strings in registration without email regex failure', () => {
    const store = useUserStore.getState();

    store.savePlanAndRegister(
      {
        gender: 'female',
        age: 28,
        weightKg: 65,
        heightCm: 168,
        activityLevel: 'moderate',
        goal: 'lose_weight',
        pace: 'steady',
        eatingRhythm: '3_meals',
        takesProtein: true
      },
      { calories: 1850, protein: 130, fat: 55, carbs: 205 },
      {
        name: 'Олена',
        email: 'тестовий юзер' // Arbitrary non-email string
      }
    );

    const user = useUserStore.getState().user;
    expect(user.isRegistered).toBe(true);
    expect(user.hasCompletedPlan).toBe(true);
    expect(user.email).toBe('тестовий юзер');
    expect(user.eatingRhythm).toBe('3_meals');
    expect(user.takesProtein).toBe(true);
    expect(user.savedTargets?.calories).toBe(1850);
  });

  it('handles guest skip mode preserving calculated plan without email registration', () => {
    const store = useUserStore.getState();

    store.savePlanAndRegister(
      {
        gender: 'male',
        age: 32,
        weightKg: 85,
        heightCm: 182,
        activityLevel: 'high',
        goal: 'recomp',
        pace: 'fast',
        eatingRhythm: '5_meals',
        takesProtein: false
      },
      { calories: 2300, protein: 170, fat: 65, carbs: 260 },
      {
        name: 'Гість',
        email: '' // Skipped registration
      }
    );

    const user = useUserStore.getState().user;
    expect(user.isRegistered).toBe(false);
    expect(user.hasCompletedPlan).toBe(true);
    expect(user.email).toBe('');
    expect(user.savedTargets?.calories).toBe(2300);
    expect(user.eatingRhythm).toBe('5_meals');
  });
});
