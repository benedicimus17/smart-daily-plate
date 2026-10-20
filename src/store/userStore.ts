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
  logout: () => void;
}

const DEFAULT_USER: UserProfile = {
  name: 'Alistair',
  email: '',
  phone: '',
  isRegistered: false,
  hasCompletedPlan: false,
  faceIdEnabled: false,
  pinCodeEnabled: false,
  gender: 'female',
  age: 29,
  weightKg: 70,
  heightCm: 160,
  activityLevel: 'moderate',
  goal: 'lose_weight',
  pace: 'fast',
  registeredAt: undefined
};

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
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
            name: account.name?.trim() || state.user.name,
            email: account.email.trim(),
            phone: account.phone?.trim() || state.user.phone,
            pinCode: account.pinCode || state.user.pinCode,
            isRegistered: true,
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
