import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { addDays, reminderSlots, startOfDay } from './water-utils';

export type ReminderMode = 'device' | 'silent' | 'off';
export type ReminderSound = 'default' | 'none';

type ReminderOptions = {
  mode: ReminderMode;
  sound: ReminderSound;
  intervalMin: number;
  wakeMin: number;
  bedMin: number;
  furtherReminder: boolean;
  goalReachedToday: boolean;
};

const CHANNEL_SOUND = 'reminders';
const CHANNEL_SILENT = 'reminders-silent';
const MAX_SCHEDULED = 60;

const supported = Platform.OS === 'ios' || Platform.OS === 'android';

if (supported) {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });
}

async function ensurePermission() {
  const current = await Notifications.getPermissionsAsync();
  if (current.granted) return true;
  if (!current.canAskAgain) return false;
  const next = await Notifications.requestPermissionsAsync();
  return next.granted;
}

async function ensureChannels() {
  if (Platform.OS !== 'android') return;
  await Notifications.setNotificationChannelAsync(CHANNEL_SOUND, {
    name: 'Drink reminders',
    importance: Notifications.AndroidImportance.HIGH,
    vibrationPattern: [0, 250, 250, 250],
  });
  await Notifications.setNotificationChannelAsync(CHANNEL_SILENT, {
    name: 'Drink reminders (silent)',
    importance: Notifications.AndroidImportance.DEFAULT,
    sound: null,
  });
}

export async function scheduleReminders(options: ReminderOptions) {
  if (!supported) return;

  await Notifications.cancelAllScheduledNotificationsAsync();
  if (options.mode === 'off') return;
  if (!(await ensurePermission())) return;
  await ensureChannels();

  const silent = options.mode === 'silent' || options.sound === 'none';
  const slots = reminderSlots(options.wakeMin, options.bedMin, options.intervalMin);
  const now = Date.now();
  const today = startOfDay(new Date());
  const skipToday = options.goalReachedToday && !options.furtherReminder;

  const dates: Date[] = [];
  for (const dayOffset of skipToday ? [1] : [0, 1]) {
    const day = addDays(today, dayOffset);
    for (const minutes of slots) {
      const extraDay = minutes < options.wakeMin ? 1 : 0;
      const date = new Date(addDays(day, extraDay).getTime() + minutes * 60 * 1000);
      if (date.getTime() > now) dates.push(date);
    }
  }

  for (const date of dates.slice(0, MAX_SCHEDULED)) {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Time to drink water 💧',
        body: 'Stay hydrated! Log a glass in WaterTracker.',
        sound: silent ? false : 'default',
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date,
        channelId: silent ? CHANNEL_SILENT : CHANNEL_SOUND,
      },
    });
  }
}