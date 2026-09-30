import { useRouter } from 'expo-router';
import { signOut } from 'firebase/auth';
import { useState } from 'react';
import { Linking, Platform, Pressable, ScrollView, Share, StyleSheet, Switch, Text, View} from 'react-native';

import { OptionSheet, SheetOption } from '@/components/home/option-sheet';
import { useWater } from '@/components/home/water-store';
import {
  formatHeight,
  formatMinutes,
  formatVolume,
  formatWeight,
} from '@/components/home/water-utils';
import { auth } from '@/services/firebaseConfig';

type SheetValue = string | number;

type SheetConfig = {
  title: string;
  message?: string;
  options: SheetOption<SheetValue>[];
  selected?: SheetValue;
  onSelect: (value: SheetValue) => void;
};

const range = (from: number, to: number, step = 1) =>
  Array.from({ length: Math.floor((to - from) / step) + 1 }, (_, i) => from + i * step);

const INTERVALS = [30, 60, 90, 120, 180];
const intervalLabel = (min: number) =>
  min < 60 ? `Every ${min} min` : `Every ${min / 60} hour${min === 60 ? '' : 's'}`;

const MODE_LABELS = { device: 'As device settings', silent: 'Silent', off: 'Off' } as const;
const THEME_LABELS = { light: 'Light', dark: 'Dark', system: 'System' } as const;

export default function SettingsScreen() {
  const router = useRouter();
  const {
    colors,
    settings,
    profile,
    dailyGoalMl,
    recommendedGoalMl,
    updateSettings,
    updateProfile,
    resetData,
  } = useWater();
  const [sheet, setSheet] = useState<SheetConfig | null>(null);
  const unit = settings.unit;

  const open = (config: SheetConfig) => setSheet(config);

  const timeOptions = range(0, 23 * 60 + 30, 30).map((m) => ({ label: formatMinutes(m), value: m }));

  const handleLogOut = async () => {
    try {
      await signOut(auth);
    } finally {
      router.replace('/');
    }
  };

  return (
    <ScrollView style={{ backgroundColor: colors.background }} contentContainerStyle={styles.content}>
      <Section title="Reminder settings" />
      <Row
        label="Reminder schedule"
        value={intervalLabel(settings.reminderIntervalMin)}
        onPress={() =>
          open({
            title: 'Remind me',
            options: INTERVALS.map((m) => ({ label: intervalLabel(m), value: m })),
            selected: settings.reminderIntervalMin,
            onSelect: (v) => updateSettings({ reminderIntervalMin: Number(v) }),
          })
        }
      />
      <Row
        label="Reminder sound"
        value={settings.reminderSound === 'default' ? 'Default' : 'None'}
        onPress={() =>
          open({
            title: 'Reminder sound',
            options: [
              { label: 'Default', value: 'default' },
              { label: 'None', value: 'none' },
            ],
            selected: settings.reminderSound,
            onSelect: (v) => updateSettings({ reminderSound: v as 'default' | 'none' }),
          })
        }
      />
      <Row
        label="Reminder mode"
        value={MODE_LABELS[settings.reminderMode]}
        onPress={() =>
          open({
            title: 'Reminder mode',
            options: (Object.keys(MODE_LABELS) as (keyof typeof MODE_LABELS)[]).map((k) => ({
              label: MODE_LABELS[k],
              value: k,
            })),
            selected: settings.reminderMode,
            onSelect: (v) => updateSettings({ reminderMode: v as keyof typeof MODE_LABELS }),
          })
        }
      />
      <SwitchRow
        label="Further reminder"
        subtitle="Still remind when your goal is achieved"
        value={settings.furtherReminder}
        onChange={(furtherReminder) => updateSettings({ furtherReminder })}
      />

      <Section title="General" />
      <Row
        label="Light or dark interface"
        value={THEME_LABELS[settings.theme]}
        onPress={() =>
          open({
            title: 'Interface',
            options: (Object.keys(THEME_LABELS) as (keyof typeof THEME_LABELS)[]).map((k) => ({
              label: THEME_LABELS[k],
              value: k,
            })),
            selected: settings.theme,
            onSelect: (v) => updateSettings({ theme: v as keyof typeof THEME_LABELS }),
          })
        }
      />
      <Row
        label="Unit"
        value={unit === 'metric' ? 'kg, ml' : 'lb, fl oz'}
        onPress={() =>
          open({
            title: 'Unit',
            options: [
              { label: 'kg, ml', value: 'metric' },
              { label: 'lb, fl oz', value: 'imperial' },
            ],
            selected: unit,
            onSelect: (v) => updateSettings({ unit: v as 'metric' | 'imperial' }),
          })
        }
      />
      <Row
        label="Intake goal"
        value={formatVolume(dailyGoalMl, unit)}
        onPress={() =>
          open({
            title: 'Daily intake goal',
            message: `Recommended for you: ${formatVolume(recommendedGoalMl, unit)}`,
            options: [
              { label: `Recommended (${formatVolume(recommendedGoalMl, unit)})`, value: 'auto' },
              ...range(1000, 5000, 100).map((ml) => ({ label: formatVolume(ml, unit), value: ml })),
            ],
            selected: settings.goalOverrideMl ?? 'auto',
            onSelect: (v) => updateSettings({ goalOverrideMl: v === 'auto' ? null : Number(v) }),
          })
        }
      />
      <Row
        label="Language"
        value="Default"
        onPress={() =>
          open({
            title: 'Language',
            message: 'The app follows your device language. Only English is available for now.',
            options: [{ label: 'Default', value: 'default' }],
            selected: 'default',
            onSelect: () => {},
          })
        }
      />

      <Section title="Personal information" />
      {profile && (
        <>
          <Row
            label="Gender"
            value={profile.gender === 'male' ? 'Male' : 'Female'}
            onPress={() =>
              open({
                title: 'Gender',
                options: [
                  { label: 'Male', value: 'male' },
                  { label: 'Female', value: 'female' },
                ],
                selected: profile.gender,
                onSelect: (v) => updateProfile({ gender: v as 'male' | 'female' }),
              })
            }
          />
          <Row
            label="Weight"
            value={formatWeight(profile.weightKg, unit)}
            onPress={() =>
              open({
                title: 'Weight',
                options: range(30, 200).map((kg) => ({ label: formatWeight(kg, unit), value: kg })),
                selected: Math.round(profile.weightKg),
                onSelect: (v) => updateProfile({ weightKg: Number(v) }),
              })
            }
          />
          <Row
            label="Height"
            value={formatHeight(profile.heightCm, unit)}
            onPress={() =>
              open({
                title: 'Height',
                options: range(100, 230).map((cm) => ({ label: formatHeight(cm, unit), value: cm })),
                selected: Math.round(profile.heightCm),
                onSelect: (v) => updateProfile({ heightCm: Number(v) }),
              })
            }
          />
          <Row
            label="Age"
            value={String(profile.age)}
            onPress={() =>
              open({
                title: 'Age',
                options: range(10, 100).map((age) => ({ label: String(age), value: age })),
                selected: profile.age,
                onSelect: (v) => updateProfile({ age: Number(v) }),
              })
            }
          />
        </>
      )}
      <Row
        label="Wake-up time"
        value={formatMinutes(settings.wakeMin)}
        onPress={() =>
          open({
            title: 'Wake-up time',
            options: timeOptions,
            selected: settings.wakeMin,
            onSelect: (v) => updateSettings({ wakeMin: Number(v) }),
          })
        }
      />
      <Row
        label="Bedtime"
        value={formatMinutes(settings.bedMin)}
        onPress={() =>
          open({
            title: 'Bedtime',
            options: timeOptions,
            selected: settings.bedMin,
            onSelect: (v) => updateSettings({ bedMin: Number(v) }),
          })
        }
      />

      <Section title="Other" />
      <SwitchRow
        label="Hide tips on how to drink water"
        value={settings.hideTips}
        onChange={(hideTips) => updateSettings({ hideTips })}
      />
      <Row
        label="Why does Drink Water Reminder not work?"
        onPress={() =>
          open({
            title: 'Reminders not showing?',
            message:
              'Make sure notifications are allowed for WaterTracker, Reminder mode is not Off, ' +
              'and battery saver is not stopping the app. Reminders are planned for today and ' +
              'tomorrow, so open the app at least once a day to keep them coming.',
            options: Platform.OS === 'web' ? [] : [{ label: 'Open notification settings', value: 'open' }],
            onSelect: () => Linking.openSettings(),
          })
        }
      />
      <Row
        label="Reset data"
        onPress={() =>
          open({
            title: 'Reset data?',
            message: 'This deletes all your drink records and resets reminder settings. It cannot be undone.',
            options: [{ label: 'Reset data', value: 'reset', destructive: true }],
            onSelect: () => resetData(),
          })
        }
      />
      <Row
        label="Feedback"
        onPress={() => Linking.openURL('mailto:?subject=WaterTracker%20feedback')}
      />
      <Row
        label="Share"
        onPress={() =>
          Share.share({ message: 'I track my daily water intake with WaterTracker. Give it a try!' })
        }
      />
      <Row
        label="Log out"
        destructive
        onPress={() =>
          open({
            title: 'Log out?',
            options: [{ label: 'Log out', value: 'logout', destructive: true }],
            onSelect: () => handleLogOut(),
          })
        }
      />

      <OptionSheet<SheetValue>
        visible={sheet !== null}
        title={sheet?.title}
        message={sheet?.message}
        options={sheet?.options ?? []}
        selected={sheet?.selected}
        onSelect={(value) => sheet?.onSelect(value)}
        onClose={() => setSheet(null)}
      />
    </ScrollView>
  );
}

function Section({ title }: { title: string }) {
  const { colors } = useWater();
  return (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: colors.sectionTitle }]}>{title}</Text>
      <View style={[styles.sectionLine, { backgroundColor: colors.border }]} />
    </View>
  );
}

function Row({
  label,
  value,
  onPress,
  destructive,
}: {
  label: string;
  value?: string;
  onPress: () => void;
  destructive?: boolean;
}) {
  const { colors } = useWater();
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.row, pressed && { backgroundColor: colors.primarySoft }]}
    >
      <Text style={[styles.rowLabel, { color: destructive ? colors.danger : colors.text }]}>
        {label}
      </Text>
      {value ? <Text style={[styles.rowValue, { color: colors.primary }]}>{value}</Text> : null}
    </Pressable>
  );
}

function SwitchRow({
  label,
  subtitle,
  value,
  onChange,
}: {
  label: string;
  subtitle?: string;
  value: boolean;
  onChange: (value: boolean) => void;
}) {
  const { colors } = useWater();
  return (
    <View style={styles.row}>
      <View style={styles.rowTextBlock}>
        <Text style={[styles.rowLabel, { color: colors.text }]}>{label}</Text>
        {subtitle ? (
          <Text style={[styles.rowSubtitle, { color: colors.sectionTitle }]}>{subtitle}</Text>
        ) : null}
      </View>
      <Switch
        value={value}
        onValueChange={onChange}
        trackColor={{ false: colors.track, true: colors.primarySoft }}
        thumbColor={value ? colors.primary : '#111111'}
        ios_backgroundColor={colors.track}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingBottom: 40,
  },
  section: {
    paddingHorizontal: 24,
    paddingTop: 28,
    paddingBottom: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  sectionLine: {
    height: StyleSheet.hairlineWidth,
    width: '45%',
    marginTop: 14,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 64,
    paddingHorizontal: 24,
    paddingVertical: 10,
    gap: 16,
  },
  rowTextBlock: {
    flex: 1,
  },
  rowLabel: {
    fontSize: 18,
    flexShrink: 1,
  },
  rowSubtitle: {
    fontSize: 15,
    marginTop: 4,
  },
  rowValue: {
    fontSize: 18,
    fontWeight: '700',
  },
});