import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useMemo, useState } from 'react';

export type Gender = 'male' | 'female';
export type WeightUnit = 'kg' | 'lb';
export type HeightUnit = 'cm' | 'ft';

export type OnboardingData = {
  gender: Gender;
  weightKg: number;
  weightUnit: WeightUnit;
  heightCm: number;
  heightUnit: HeightUnit;
  age: number;
};

type OnboardingContextValue = {
  data: OnboardingData;
  update: (patch: Partial<OnboardingData>) => void;
};

export const PROFILE_STORAGE_KEY = 'userProfile';

const DEFAULT_DATA: OnboardingData = {
  gender: 'male',
  weightKg: 55,
  weightUnit: 'kg',
  heightCm: 170,
  heightUnit: 'cm',
  age: 25,
};

const OnboardingContext = createContext<OnboardingContextValue | null>(null);

export function OnboardingProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<OnboardingData>(DEFAULT_DATA);

  const value = useMemo(
    () => ({
      data,
      update: (patch: Partial<OnboardingData>) => setData((prev) => ({ ...prev, ...patch })),
    }),
    [data],
  );

  return <OnboardingContext.Provider value={value}>{children}</OnboardingContext.Provider>;
}

export function useOnboarding() {
  const ctx = useContext(OnboardingContext);
  if (!ctx) throw new Error('useOnboarding must be used inside OnboardingProvider');
  return ctx;
}

// Rough daily water estimate in ml: about 35 ml per kg of body weight,
// adjusted a little for gender and age, rounded to the nearest 50 ml.
export function calculateDailyGoalMl({ gender, weightKg, age }: OnboardingData) {
  let goal = weightKg * 35;
  if (gender === 'male') goal += 250;
  if (age >= 55) goal -= 250;
  return Math.round(goal / 50) * 50;
}

export async function saveProfile(data: OnboardingData) {
  const profile = {
    ...data,
    weightKg: Math.round(data.weightKg * 10) / 10,
    heightCm: Math.round(data.heightCm),
    dailyGoalMl: calculateDailyGoalMl(data),
  };
  await AsyncStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profile));
  return profile;
}

// Metric values are stored unrounded so switching units and scrolling in
// lb or inches never makes the displayed number skip. Round only for display.
export const kgToLb = (kg: number) => Math.round(kg * 2.20462);
export const lbToKg = (lb: number) => lb / 2.20462;
export const cmToInches = (cm: number) => Math.round(cm / 2.54);
export const inchesToCm = (inches: number) => inches * 2.54;
