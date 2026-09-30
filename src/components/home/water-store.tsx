import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useColorScheme } from 'react-native';

import {
  OnboardingData,
  PROFILE_STORAGE_KEY,
  calculateDailyGoalMl,
} from '@/components/onboarding/onboarding-context';
import { HomeColors, HomePalette } from '@/constants/home';

import { ReminderMode, ReminderSound, scheduleReminders } from './reminders';
import { UnitSystem, WaterRecord, dayKey, newId } from './water-utils';

export type Profile = OnboardingData & { dailyGoalMl: number };

export type ThemeSetting = 'light' | 'dark' | 'system';

export type Settings = {
  cupSizeMl: number;
  // null means "use the recommended goal from the profile"
  goalOverrideMl: number | null;
  unit: UnitSystem;
  theme: ThemeSetting;
  reminderMode: ReminderMode;
  reminderSound: ReminderSound;
  reminderIntervalMin: number;
  furtherReminder: boolean;
  hideTips: boolean;
  wakeMin: number;
  bedMin: number;
};

const RECORDS_KEY = 'waterRecords';
const SETTINGS_KEY = 'appSettings';

const DEFAULT_SETTINGS: Settings = {
  cupSizeMl: 300,
  goalOverrideMl: null,
  unit: 'metric',
  theme: 'light',
  reminderMode: 'device',
  reminderSound: 'default',
  reminderIntervalMin: 60,
  furtherReminder: false,
  hideTips: false,
  wakeMin: 6 * 60,
  bedMin: 23 * 60,
};

type WaterContextValue = {
  loaded: boolean;
  profile: Profile | null;
  settings: Settings;
  records: WaterRecord[];
  dailyGoalMl: number;
  recommendedGoalMl: number;
  todayTotalMl: number;
  colors: HomePalette;
  isDark: boolean;
  addRecord: (amountMl: number, timestamp?: number) => void;
  updateRecord: (id: string, patch: Partial<Omit<WaterRecord, 'id'>>) => void;
  deleteRecord: (id: string) => void;
  updateProfile: (patch: Partial<OnboardingData>) => void;
  updateSettings: (patch: Partial<Settings>) => void;
  resetData: () => void;
};

const WaterContext = createContext<WaterContextValue | null>(null);

async function readJson<T>(key: string): Promise<T | null> {
  try {
    const raw = await AsyncStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

const sortRecords = (list: WaterRecord[]) => [...list].sort((a, b) => b.timestamp - a.timestamp);

export function WaterProvider({ children }: { children: React.ReactNode }) {
  const systemScheme = useColorScheme();
  const [loaded, setLoaded] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [records, setRecords] = useState<WaterRecord[]>([]);

  useEffect(() => {
    (async () => {
      const [storedProfile, storedSettings, storedRecords] = await Promise.all([
        readJson<Profile>(PROFILE_STORAGE_KEY),
        readJson<Partial<Settings>>(SETTINGS_KEY),
        readJson<WaterRecord[]>(RECORDS_KEY),
      ]);
      setProfile(storedProfile);
      setSettings({ ...DEFAULT_SETTINGS, ...storedSettings });
      setRecords(sortRecords(storedRecords ?? []));
      setLoaded(true);
    })();
  }, []);

  // Save each piece whenever it changes (after the first load)
  useEffect(() => {
    if (loaded) AsyncStorage.setItem(RECORDS_KEY, JSON.stringify(records));
  }, [loaded, records]);
  useEffect(() => {
    if (loaded) AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  }, [loaded, settings]);
  useEffect(() => {
    if (loaded && profile) AsyncStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profile));
  }, [loaded, profile]);

  const recommendedGoalMl = profile ? calculateDailyGoalMl(profile) : 2000;
  const dailyGoalMl = settings.goalOverrideMl ?? recommendedGoalMl;

  const todayKey = dayKey(Date.now());
  const todayTotalMl = records
    .filter((r) => dayKey(r.timestamp) === todayKey)
    .reduce((sum, r) => sum + r.amountMl, 0);
  const goalReachedToday = todayTotalMl >= dailyGoalMl;

  useEffect(() => {
    if (!loaded) return;
    scheduleReminders({
      mode: settings.reminderMode,
      sound: settings.reminderSound,
      intervalMin: settings.reminderIntervalMin,
      wakeMin: settings.wakeMin,
      bedMin: settings.bedMin,
      furtherReminder: settings.furtherReminder,
      goalReachedToday,
    }).catch((error) => console.log('Schedule reminders error:', error));
  }, [
    loaded,
    goalReachedToday,
    settings.reminderMode,
    settings.reminderSound,
    settings.reminderIntervalMin,
    settings.wakeMin,
    settings.bedMin,
    settings.furtherReminder,
  ]);

  const addRecord = useCallback((amountMl: number, timestamp = Date.now()) => {
    setRecords((prev) => sortRecords([{ id: newId(), amountMl, timestamp }, ...prev]));
  }, []);

  const updateRecord = useCallback((id: string, patch: Partial<Omit<WaterRecord, 'id'>>) => {
    setRecords((prev) => sortRecords(prev.map((r) => (r.id === id ? { ...r, ...patch } : r))));
  }, []);

  const deleteRecord = useCallback((id: string) => {
    setRecords((prev) => prev.filter((r) => r.id !== id));
  }, []);

  const updateProfile = useCallback((patch: Partial<OnboardingData>) => {
    setProfile((prev) => {
      if (!prev) return prev;
      const next = { ...prev, ...patch };
      return { ...next, dailyGoalMl: calculateDailyGoalMl(next) };
    });
  }, []);

  const updateSettings = useCallback((patch: Partial<Settings>) => {
    setSettings((prev) => ({ ...prev, ...patch }));
  }, []);

  const resetData = useCallback(() => {
    setRecords([]);
    setSettings((prev) => ({ ...DEFAULT_SETTINGS, theme: prev.theme, unit: prev.unit }));
  }, []);

  const isDark =
    settings.theme === 'dark' || (settings.theme === 'system' && systemScheme === 'dark');
  const colors = isDark ? HomeColors.dark : HomeColors.light;

  const value = useMemo(
    () => ({
      loaded,
      profile,
      settings,
      records,
      dailyGoalMl,
      recommendedGoalMl,
      todayTotalMl,
      colors,
      isDark,
      addRecord,
      updateRecord,
      deleteRecord,
      updateProfile,
      updateSettings,
      resetData,
    }),
    [
      loaded,
      profile,
      settings,
      records,
      dailyGoalMl,
      recommendedGoalMl,
      todayTotalMl,
      colors,
      isDark,
      addRecord,
      updateRecord,
      deleteRecord,
      updateProfile,
      updateSettings,
      resetData,
    ],
  );

  return <WaterContext.Provider value={value}>{children}</WaterContext.Provider>;
}

export function useWater() {
  const ctx = useContext(WaterContext);
  if (!ctx) throw new Error('useWater must be used inside WaterProvider');
  return ctx;
}
