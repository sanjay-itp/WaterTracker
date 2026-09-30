export type UnitSystem = 'metric' | 'imperial';

export type WaterRecord = {
  id: string;
  amountMl: number;
  timestamp: number;
};

const ML_PER_FL_OZ = 29.5735;
const LB_PER_KG = 2.20462;

export function formatVolume(ml: number, unit: UnitSystem) {
  if (unit === 'imperial') return `${Math.round(ml / ML_PER_FL_OZ)} fl oz`;
  return `${Math.round(ml)} ml`;
}

// Just the number part, used where the unit is shown separately
export function volumeNumber(ml: number, unit: UnitSystem) {
  return unit === 'imperial' ? Math.round(ml / ML_PER_FL_OZ) : Math.round(ml);
}

export const volumeUnitLabel = (unit: UnitSystem) => (unit === 'imperial' ? 'fl oz' : 'ml');

export function formatWeight(kg: number, unit: UnitSystem) {
  if (unit === 'imperial') return `${Math.round(kg * LB_PER_KG)} lb`;
  return `${Math.round(kg)} kg`;
}

export function formatHeight(cm: number, unit: UnitSystem) {
  if (unit === 'imperial') {
    const inches = Math.round(cm / 2.54);
    return `${Math.floor(inches / 12)}'${inches % 12}"`;
  }
  return `${Math.round(cm)} cm`;
}

// Minutes since midnight <-> "06:00 AM"
export function formatMinutes(minutes: number) {
  const h24 = Math.floor(minutes / 60) % 24;
  const m = minutes % 60;
  const suffix = h24 < 12 ? 'AM' : 'PM';
  const h12 = h24 % 12 === 0 ? 12 : h24 % 12;
  return `${String(h12).padStart(2, '0')}:${String(m).padStart(2, '0')} ${suffix}`;
}

export function formatTime(timestamp: number) {
  const d = new Date(timestamp);
  return formatMinutes(d.getHours() * 60 + d.getMinutes());
}

export function dayKey(date: Date | number) {
  const d = new Date(date);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function startOfDay(date: Date | number) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function addDays(date: Date, days: number) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

export function daysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

// Total ml per day, keyed by "YYYY-MM-DD"
export function totalsByDay(records: WaterRecord[]) {
  const totals = new Map<string, number>();
  for (const r of records) {
    const key = dayKey(r.timestamp);
    totals.set(key, (totals.get(key) ?? 0) + r.amountMl);
  }
  return totals;
}

export function countsByDay(records: WaterRecord[]) {
  const counts = new Map<string, number>();
  for (const r of records) {
    const key = dayKey(r.timestamp);
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  return counts;
}

// Reminder slots for one day, from wake-up time to bedtime, every intervalMin
export function reminderSlots(wakeMin: number, bedMin: number, intervalMin: number) {
  const end = bedMin > wakeMin ? bedMin : bedMin + 24 * 60;
  const slots: number[] = [];
  for (let t = wakeMin; t <= end; t += intervalMin) slots.push(t % (24 * 60));
  return slots;
}

// Next reminder after `now`, as a Date
export function nextReminderDate(
  now: Date,
  wakeMin: number,
  bedMin: number,
  intervalMin: number,
) {
  const slots = reminderSlots(wakeMin, bedMin, intervalMin);
  const nowMin = now.getHours() * 60 + now.getMinutes();
  const today = startOfDay(now);
  const upcoming = slots.find((m) => m > nowMin && m >= wakeMin);
  const minutes = upcoming ?? slots[0];
  const day = upcoming !== undefined ? today : addDays(today, 1);
  return new Date(day.getTime() + minutes * 60 * 1000);
}

export const newId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
