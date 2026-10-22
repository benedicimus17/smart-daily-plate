import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { UserProfile, UserBodyMetrics } from '../types/user';
import { MacroTargets } from '../types/nutrition';

interface UserState {
  user: UserProfile;
  registerUser: (data: { name: string; email: string; phone: string; password?: string }) => void;
  savePlanAndRegister: (
    metrics: UserBodyMetrics,
    targets: MacroTargets,
    account: { name?: string; email: string; phone?: string; password?: string; pinCode?: string }
  ) => void;
  updateMetrics: (metrics: Partial<UserBodyMetrics>) => void;
  updateSavedTargets: (targets: MacroTargets) => void;
  toggleFaceId: (enabled: boolean) => void;
  togglePinCode: (enabled: boolean, pinCode?: string) => void;
  setProStatus: (isPro: boolean) => void;
  resetToNewGuestUser: () => void;
  deleteAccountAndAllData: () => void;
  exportUserData: () => string;
  logout: () => void;
}

const DEFAULT_USER: UserProfile = {
  name: 'Гість',
  email: '',
  phone: '',
  isRegistered: false,
  hasCompletedPlan: false,
  isPro: false,
  faceIdEnabled: false,
  pinCodeEnabled: false,
  gender: 'female',
  age: 29,
  weightKg: 70,
  heightCm: 160,
  activityLevel: 'moderate',
  goal: 'lose_weight',
  pace: 'fast',
  eatingRhythm: '3_meals',
  takesProtein: false,
  registeredAt: undefined
};

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      user: DEFAULT_USER,

      registerUser: ({ name, email, phone }) => {
        set((state) => ({
          user: {
            ...state.user,
            name: name.trim() || state.user.name,
            email: email.trim(),
            phone: phone.trim(),
            isRegistered: true,
            registeredAt: new Date().toISOString()
          }
        }));
      },

      savePlanAndRegister: (metrics, targets, account) => {
        set((state) => ({
          user: {
            ...state.user,
            ...metrics,
            name: account.name?.trim() || (account.email.trim() ? account.email.trim().split(' ')[0] : state.user.name),
            email: account.email.trim(),
            phone: account.phone?.trim() || state.user.phone,
            pinCode: account.pinCode || state.user.pinCode,
            isRegistered: Boolean(account.email && account.email.trim().length > 0),
            hasCompletedPlan: true,
            savedTargets: targets,
            registeredAt: new Date().toISOString()
          }
        }));
      },

      updateMetrics: (partialMetrics) => {
        set((state) => ({
          user: {
            ...state.user,
            ...partialMetrics
          }
        }));
      },

      updateSavedTargets: (targets) => {
        set((state) => ({
          user: {
            ...state.user,
            savedTargets: targets,
            hasCompletedPlan: true
          }
        }));
      },

      toggleFaceId: (enabled) => {
        set((state) => ({
          user: {
            ...state.user,
            faceIdEnabled: enabled
          }
        }));
      },

      togglePinCode: (enabled, pinCode) => {
        set((state) => ({
          user: {
            ...state.user,
            pinCodeEnabled: enabled,
            pinCode: pinCode || state.user.pinCode
          }
        }));
      },

      setProStatus: (isPro) => {
        set((state) => ({
          user: {
            ...state.user,
            isPro
          }
        }));
      },

      resetToNewGuestUser: () => {
        set({
          user: {
            ...DEFAULT_USER,
            name: 'Гість',
            email: '',
            phone: '',
            isRegistered: false,
            hasCompletedPlan: false,
            isPro: false
          }
        });
      },

      deleteAccountAndAllData: () => {
        try {
          localStorage.removeItem('nutriq-user-store-v2');
          localStorage.removeItem('nutriq-storage-v1');
          localStorage.removeItem('nutriq-grocery-storage-v1');
        } catch {}
        set({
          user: DEFAULT_USER
        });
      },

      exportUserData: (): string => {
        const state = get();
        let nutritionData: unknown = null;
        let groceryData: unknown = null;
        try {
          const rawNutr = localStorage.getItem('nutriq-storage-v1');
          if (rawNutr) nutritionData = JSON.parse(rawNutr);
          const rawGroc = localStorage.getItem('nutriq-grocery-storage-v1');
          if (rawGroc) groceryData = JSON.parse(rawGroc);
        } catch {}

        const exportObject = {
          gdpr_compliance: 'REGULATION (EU) 2016/679 - ART. 20 DATA PORTABILITY',
          export_date: new Date().toISOString(),
          user_profile: state.user,
          nutrition_records: nutritionData,
          grocery_list: groceryData
        };

        return JSON.stringify(exportObject, null, 2);
      },

      logout: () => {
        set({
          user: DEFAULT_USER
        });
      }
    }),
    {
      name: 'nutriq-user-store-v2'
    }
  )
);
