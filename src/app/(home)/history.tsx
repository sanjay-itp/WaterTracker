import Ionicons from '@expo/vector-icons/Ionicons';
import { LinearGradient } from 'expo-linear-gradient';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';

import { AddRecordModal } from '@/components/home/add-record-modal';
import { BarChart } from '@/components/home/bar-chart';
import { useWater } from '@/components/home/water-store';
import {
  addDays,
  countsByDay,
  dayKey,
  daysInMonth,
  formatVolume,
  startOfDay,
  totalsByDay,
} from '@/components/home/water-utils';

type Mode = 'month' | 'year';

const MONTHS = ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'];
const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function HistoryScreen() {
  const { colors, records, dailyGoalMl, settings, addRecord } = useWater();
  const { width } = useWindowDimensions();
  const now = new Date();

  const [mode, setMode] = useState<Mode>('month');
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());
  const [addOpenedAt, setAddOpenedAt] = useState<number | null>(null);

  const totals = useMemo(() => totalsByDay(records), [records]);
  const counts = useMemo(() => countsByDay(records), [records]);
  const pctFor = (key: string) => {
    const total = totals.get(key);
    return total ? (total / dailyGoalMl) * 100 : null;
  };

  // Chart data for the selected month or year
  let values: (number | null)[];
  let labels: { index: number; text: string }[];
  let title: string;
  let caption: string;
  if (mode === 'month') {
    const days = daysInMonth(year, month);
    values = Array.from({ length: days }, (_, i) => pctFor(dayKey(new Date(year, month, i + 1))));
    labels = [1, 8, 15, 22, 29].filter((d) => d <= days).map((d) => ({ index: d - 1, text: String(d) }));
    title = new Date(year, month, 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    caption = new Date(year, month, 1).toLocaleDateString('en-US', { month: 'long' });
  } else {
    values = MONTHS.map((_, m) => {
      const daily = Array.from({ length: daysInMonth(year, m) }, (_, d) =>
        pctFor(dayKey(new Date(year, m, d + 1))),
      ).filter((v): v is number => v !== null);
      return daily.length ? daily.reduce((a, b) => a + b, 0) / daily.length : null;
    });
    labels = MONTHS.map((text, index) => ({ index, text }));
    title = String(year);
    caption = 'Average per month';
  }

  const atCurrent =
    mode === 'month' ? year === now.getFullYear() && month === now.getMonth() : year === now.getFullYear();

  const step = (dir: -1 | 1) => {
    if (mode === 'year') {
      setYear((y) => y + dir);
      return;
    }
    const next = new Date(year, month + dir, 1);
    setYear(next.getFullYear());
    setMonth(next.getMonth());
  };

  // This week, Sunday to Saturday
  const today = startOfDay(now);
  const weekStart = addDays(today, -today.getDay());
  const week = WEEKDAYS.map((label, i) => {
    const date = addDays(weekStart, i);
    const pct = pctFor(dayKey(date)) ?? 0;
    return { label, pct, future: date > today };
  });

  // Report: last 7 days (today included) and this month so far
  const last7 = Array.from({ length: 7 }, (_, i) => dayKey(addDays(today, -i)));
  const weekTotal = last7.reduce((sum, key) => sum + (totals.get(key) ?? 0), 0);
  const weekCount = last7.reduce((sum, key) => sum + (counts.get(key) ?? 0), 0);
  const weeklyAvg = weekTotal / 7;
  const monthDays = Array.from({ length: now.getDate() }, (_, i) =>
    dayKey(new Date(now.getFullYear(), now.getMonth(), i + 1)),
  );
  const monthlyAvg = monthDays.reduce((sum, key) => sum + (totals.get(key) ?? 0), 0) / monthDays.length;

  const report = [
    { label: 'Weekly average', value: `${formatVolume(weeklyAvg, settings.unit)} / day`, dot: colors.success },
    { label: 'Monthly average', value: `${formatVolume(monthlyAvg, settings.unit)} / day`, dot: colors.primary },
    {
      label: 'Average completion',
      value: `${Math.round((weeklyAvg / dailyGoalMl) * 100)}%`,
      dot: '#F5A623',
    },
    { label: 'Drink frequency', value: `${(weekCount / 7).toFixed(1)} times / day`, dot: colors.danger },
  ];

  return (
    <ScrollView style={{ backgroundColor: colors.background }} contentContainerStyle={styles.content}>
      {/* Period navigation */}
      <View style={styles.nav}>
        <Pressable
          onPress={() => step(-1)}
          style={[styles.navButton, { backgroundColor: colors.primarySoft }]}
          accessibilityLabel="Previous"
        >
          <Ionicons name="chevron-back" size={20} color={colors.textMuted} />
        </Pressable>
        <Text style={[styles.navTitle, { color: colors.text }]}>{title}</Text>
        <Pressable
          onPress={() => step(1)}
          disabled={atCurrent}
          style={[styles.navButton, { backgroundColor: colors.primarySoft }, atCurrent && styles.disabled]}
          accessibilityLabel="Next"
        >
          <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
        </Pressable>
      </View>

      <View style={styles.chart}>
        <BarChart
          width={width - 16}
          height={280}
          values={values}
          labels={labels}
          caption={caption}
          colors={colors}
        />
      </View>

      {/* Month / Year switch */}
      <View style={[styles.segment, { borderColor: colors.primary, backgroundColor: colors.primary }]}>
        {(['month', 'year'] as Mode[]).map((m) => {
          const selected = mode === m;
          return (
            <Pressable
              key={m}
              onPress={() => setMode(m)}
              style={[styles.segmentItem, selected && { backgroundColor: colors.card }]}
            >
              <Text style={[styles.segmentText, { color: selected ? colors.text : '#FFFFFF' }]}>
                {m === 'month' ? 'Month' : 'Year'}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <Pressable style={styles.addRow} onPress={() => setAddOpenedAt(Date.now())} hitSlop={8}>
        <Text style={[styles.addText, { color: colors.text }]}>Add record</Text>
        <Ionicons name="add" size={30} color={colors.text} />
      </Pressable>

      {/* Weekly completion */}
      <LinearGradient
        colors={['#62BEFF', '#3FA2FF']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.weekCard}
      >
        <Text style={styles.weekTitle}>Weekly completion</Text>
        <View style={styles.weekRow}>
          {week.map((day) => (
            <View key={day.label} style={styles.weekDay}>
              <View style={[styles.weekCircle, day.future && styles.weekFuture]}>
                <View style={[styles.weekFill, { height: `${Math.min(day.pct, 100)}%` }]} />
                {day.pct >= 100 && <Ionicons name="checkmark" size={26} color="#FFFFFF" />}
              </View>
              <Text style={styles.weekLabel}>{day.label}</Text>
            </View>
          ))}
        </View>
      </LinearGradient>

      {/* Report */}
      <View style={styles.report}>
        <Text style={[styles.reportTitle, { color: colors.text }]}>Drink water report</Text>
        {report.map((row) => (
          <View key={row.label} style={[styles.reportRow, { borderBottomColor: colors.border }]}>
            <View style={[styles.reportDot, { backgroundColor: row.dot }]} />
            <Text style={[styles.reportLabel, { color: colors.text }]}>{row.label}</Text>
            <Text style={[styles.reportValue, { color: colors.primary }]}>{row.value}</Text>
          </View>
        ))}
      </View>

      <AddRecordModal
        visible={addOpenedAt !== null}
        title="Add record"
        initialAmountMl={settings.cupSizeMl}
        initialTimestamp={addOpenedAt ?? 0}
        onSave={(amountMl, timestamp) => addRecord(amountMl, timestamp)}
        onClose={() => setAddOpenedAt(null)}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingBottom: 40,
  },
  nav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 28,
    marginTop: 24,
  },
  navButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabled: {
    opacity: 0.35,
  },
  navTitle: {
    fontSize: 20,
    minWidth: 160,
    textAlign: 'center',
  },
  chart: {
    marginTop: 16,
    paddingHorizontal: 8,
  },
  segment: {
    flexDirection: 'row',
    alignSelf: 'center',
    borderWidth: 2,
    borderRadius: 10,
    overflow: 'hidden',
    marginTop: 4,
  },
  segmentItem: {
    width: 104,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  segmentText: {
    fontSize: 17,
    fontWeight: '600',
  },
  addRow: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-end',
    gap: 6,
    paddingHorizontal: 16,
    marginVertical: 12,
  },
  addText: {
    fontSize: 17,
  },
  weekCard: {
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 32,
  },
  weekTitle: {
    color: '#FFFFFF',
    fontSize: 26,
    marginLeft: 8,
    marginBottom: 20,
  },
  weekRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  weekDay: {
    alignItems: 'center',
    flex: 1,
  },
  weekCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#428CEB',
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  weekFuture: {
    opacity: 0.6,
  },
  weekFill: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#1BD1A5',
  },
  weekLabel: {
    color: '#FFFFFF',
    fontSize: 16,
    marginTop: 10,
  },
  report: {
    paddingHorizontal: 24,
    marginTop: 24,
  },
  reportTitle: {
    fontSize: 24,
    marginBottom: 12,
  },
  reportRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 18,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  reportDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 16,
  },
  reportLabel: {
    flex: 1,
    fontSize: 17,
  },
  reportValue: {
    fontSize: 17,
  },
});