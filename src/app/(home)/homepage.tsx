import Ionicons from '@expo/vector-icons/Ionicons';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions} from 'react-native';

import Mascot from '@/assets/svg/mascot.svg';
import { AddRecordModal } from '@/components/home/add-record-modal';
import { CupIcon } from '@/components/home/cup-icon';
import { OptionSheet } from '@/components/home/option-sheet';
import { ProgressArc } from '@/components/home/progress-arc';
import { useWater } from '@/components/home/water-store';
import { WaterRecord, dayKey, formatTime, formatVolume, nextReminderDate, volumeNumber, volumeUnitLabel } from '@/components/home/water-utils';
import { CUP_SIZES_ML, TIPS } from '@/constants/home';

type RecordAction = 'edit' | 'delete';

export default function HomeScreen() {
  const { colors, settings, records, dailyGoalMl, todayTotalMl, addRecord, updateRecord, deleteRecord, updateSettings} = useWater();
  const { width } = useWindowDimensions();

  const [tipIndex, setTipIndex] = useState(() => new Date().getDate() % TIPS.length);
  const [cupPickerOpen, setCupPickerOpen] = useState(false);
  const [addOpenedAt, setAddOpenedAt] = useState<number | null>(null);
  const [menuRecord, setMenuRecord] = useState<WaterRecord | null>(null);
  const [editRecord, setEditRecord] = useState<WaterRecord | null>(null);

  const unit = settings.unit;
  const todayKey = dayKey(Date.now());
  const todayRecords = records.filter((r) => dayKey(r.timestamp) === todayKey);
  const progress = dailyGoalMl > 0 ? todayTotalMl / dailyGoalMl : 0;
  const goalReached = todayTotalMl >= dailyGoalMl;
  const nextReminder =
    settings.reminderMode === 'off'
      ? null
      : nextReminderDate(new Date(), settings.wakeMin, settings.bedMin, settings.reminderIntervalMin);

  const size = Math.min(width - 32, 380);
  const radius = size / 2 - 8;
  const circle = radius * 1.64;
  const center = size / 2;

  const handleRecordAction = (action: RecordAction) => {
    if (!menuRecord) return;
    if (action === 'delete') {
      deleteRecord(menuRecord.id);
      return;
    }
    
    const record = menuRecord;
    setTimeout(() => setEditRecord(record), 350);
  };

  return (
    <ScrollView
      style={{ backgroundColor: colors.background }}
      contentContainerStyle={styles.content}
    >
      {!settings.hideTips && (
        <Pressable
          style={styles.tipRow}
          onPress={() => setTipIndex((i) => (i + 1) % TIPS.length)}
          accessibilityHint="Shows the next tip"
        >
          <Mascot width={96} height={106} />
          <View style={[styles.bubble, { backgroundColor: colors.primarySoft }]}>
            <View style={[styles.bubbleTail, { borderRightColor: colors.primarySoft }]} />
            <Text style={[styles.tipText, { color: colors.text }]}>{TIPS[tipIndex]}</Text>
          </View>
        </Pressable>
      )}

      {/* Gauge */}
      <View style={[styles.gauge, { width: size, height: size }]}>
        <ProgressArc
          size={size}
          progress={progress}
          trackColor={colors.track}
          progressColor={colors.primary}
        />

        <View
          style={[
            styles.innerCircle,
            {
              width: circle,
              height: circle,
              borderRadius: circle / 2,
              left: center - circle / 2,
              top: center - circle / 2,
              backgroundColor: colors.card,
              boxShadow: `0px 4px 16px ${colors.shadow}`,
            },
          ]}
        >
          <View style={styles.totalRow}>
            <Text style={[styles.total, { color: colors.primary, fontSize: circle * 0.13 }]}>
              {volumeNumber(todayTotalMl, unit)}
            </Text>
            <Text style={[styles.total, { color: colors.text, fontSize: circle * 0.13 }]}>
              /{volumeNumber(dailyGoalMl, unit)}
            </Text>
            <Text style={[styles.total, { color: colors.text, fontSize: circle * 0.09 }]}>
              {volumeUnitLabel(unit)}
            </Text>
          </View>
          <Text style={[styles.targetLabel, { color: colors.text }]}>
            {goalReached ? 'Goal reached! 🎉' : 'Daily Drink Target'}
          </Text>

          {/* Tap the cup to log one drink */}
          <Pressable
            onPress={() => addRecord(settings.cupSizeMl)}
            accessibilityRole="button"
            accessibilityLabel={`Add ${formatVolume(settings.cupSizeMl, unit)}`}
            style={({ pressed }) => [
              styles.dome,
              {
                width: circle * 0.64,
                height: circle * 0.64,
                borderRadius: circle * 0.32,
                left: circle * 0.18,
                top: circle * 0.69,
                backgroundColor: colors.primarySoft,
              },
              pressed && styles.domePressed,
            ]}
          >
            <Text style={[styles.cupAmount, { color: colors.text }]}>
              {formatVolume(settings.cupSizeMl, unit)}
            </Text>
            <CupIcon size={circle * 0.16} plus water={colors.primary} outline={colors.text} />
          </Pressable>
        </View>

        <Ionicons
          name="heart-dislike"
          size={34}
          color={colors.textMuted}
          style={[styles.endIcon, { left: center - radius * 0.866 - 17, top: center + radius * 0.5 + 12 }]}
        />
        <Ionicons
          name="water"
          size={34}
          color={colors.primary}
          style={[styles.endIcon, { left: center + radius * 0.866 - 17, top: center + radius * 0.5 + 12 }]}
        />

        {/* Change cup size */}
        <Pressable
          onPress={() => setCupPickerOpen(true)}
          accessibilityRole="button"
          accessibilityLabel="Change cup size"
          style={[
            styles.switchButton,
            {
              left: center + radius * 0.5,
              top: center + radius * 0.72,
              backgroundColor: colors.card,
              boxShadow: `0px 3px 10px ${colors.shadow}`,
            },
          ]}
        >
          <CupIcon size={34} water={colors.primary} outline={colors.text} />
          <View style={[styles.switchBadge, { backgroundColor: colors.card }]}>
            <Ionicons name="sync" size={14} color={colors.primary} />
          </View>
        </Pressable>
      </View>

      <View style={styles.confirm}>
        <Ionicons name="arrow-up" size={20} color={colors.primary} />
        <Text style={[styles.confirmText, { color: colors.text }]}>
          Confirm that you have just drunk water
        </Text>
      </View>

      {/* Today's records */}
      <View style={styles.recordsHeader}>
        <Text style={[styles.recordsTitle, { color: colors.text }]}>Today&apos;s records</Text>
        <Pressable
          onPress={() => setAddOpenedAt(Date.now())}
          hitSlop={10}
          accessibilityRole="button"
          accessibilityLabel="Add a record"
        >
          <Ionicons name="add" size={32} color={colors.text} />
        </Pressable>
      </View>

      <View
        style={[
          styles.recordsCard,
          { backgroundColor: colors.card, boxShadow: `0px 2px 8px ${colors.shadow}` },
        ]}
      >
        {nextReminder && (
          <RecordRow
            icon={<Ionicons name="time-outline" size={30} color={colors.text} />}
            time={formatTime(nextReminder.getTime())}
            subtitle="Next time"
            amount={formatVolume(settings.cupSizeMl, unit)}
            showConnector={todayRecords.length > 0}
          />
        )}

        {todayRecords.map((record, index) => (
          <RecordRow
            key={record.id}
            icon={<CupIcon size={30} water={colors.primary} outline={colors.text} />}
            time={formatTime(record.timestamp)}
            amount={formatVolume(record.amountMl, unit)}
            onMenu={() => setMenuRecord(record)}
            showConnector={index < todayRecords.length - 1}
          />
        ))}

        {todayRecords.length === 0 && (
          <Text style={[styles.empty, { color: colors.textMuted }]}>
            No drinks yet today. Tap the cup above to log one.
          </Text>
        )}
      </View>

      <OptionSheet
        visible={cupPickerOpen}
        title="Cup size"
        options={CUP_SIZES_ML.map((ml) => ({ label: formatVolume(ml, unit), value: ml }))}
        selected={settings.cupSizeMl}
        onSelect={(cupSizeMl) => updateSettings({ cupSizeMl })}
        onClose={() => setCupPickerOpen(false)}
      />

      <OptionSheet<RecordAction>
        visible={menuRecord !== null}
        title={menuRecord ? `${formatTime(menuRecord.timestamp)}, ${formatVolume(menuRecord.amountMl, unit)}` : ''}
        options={[
          { label: 'Edit', value: 'edit' },
          { label: 'Delete', value: 'delete', destructive: true },
        ]}
        onSelect={handleRecordAction}
        onClose={() => setMenuRecord(null)}
      />

      <AddRecordModal
        visible={addOpenedAt !== null}
        title="Add record"
        initialAmountMl={settings.cupSizeMl}
        initialTimestamp={addOpenedAt ?? 0}
        onSave={(amountMl, timestamp) => addRecord(amountMl, timestamp)}
        onClose={() => setAddOpenedAt(null)}
      />

      <AddRecordModal
        visible={editRecord !== null}
        title="Edit record"
        initialAmountMl={editRecord?.amountMl ?? settings.cupSizeMl}
        initialTimestamp={editRecord?.timestamp ?? 0}
        onSave={(amountMl, timestamp) => editRecord && updateRecord(editRecord.id, { amountMl, timestamp })}
        onClose={() => setEditRecord(null)}
      />
    </ScrollView>
  );
}

function RecordRow({
  icon,
  time,
  subtitle,
  amount,
  onMenu,
  showConnector,
}: {
  icon: React.ReactNode;
  time: string;
  subtitle?: string;
  amount: string;
  onMenu?: () => void;
  showConnector: boolean;
}) {
  const { colors } = useWater();
  return (
    <View>
      <View style={styles.recordRow}>
        <View style={styles.recordIcon}>{icon}</View>
        <View style={styles.recordText}>
          <Text style={[styles.recordTime, { color: colors.text }]}>{time}</Text>
          {subtitle ? (
            <Text style={[styles.recordSubtitle, { color: colors.textMuted }]}>{subtitle}</Text>
          ) : null}
        </View>
        <Text style={[styles.recordAmount, { color: colors.textMuted }]}>{amount}</Text>
        <View style={styles.menuSlot}>
          {onMenu && (
            <Pressable onPress={onMenu} hitSlop={10} accessibilityLabel="Record options">
              <Ionicons name="ellipsis-vertical" size={20} color={colors.textMuted} />
            </Pressable>
          )}
        </View>
      </View>
      {showConnector && (
        <View style={styles.connector}>
          {[0, 1, 2, 3].map((i) => (
            <View key={i} style={[styles.dot, { backgroundColor: colors.textMuted }]} />
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingBottom: 40,
    alignItems: 'center',
  },
  tipRow: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'stretch',
    paddingHorizontal: 12,
    paddingTop: 8,
  },
  bubble: {
    flex: 1,
    marginLeft: 16,
    borderRadius: 24,
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  bubbleTail: {
    position: 'absolute',
    left: -14,
    top: 22,
    width: 0,
    height: 0,
    borderTopWidth: 10,
    borderBottomWidth: 10,
    borderRightWidth: 16,
    borderTopColor: 'transparent',
    borderBottomColor: 'transparent',
  },
  tipText: {
    fontSize: 16,
    lineHeight: 22,
    textAlign: 'center',
  },
  gauge: {
    marginTop: 24,
  },
  innerCircle: {
    position: 'absolute',
    alignItems: 'center',
    overflow: 'hidden',
    paddingTop: '34%',
  },
  totalRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  total: {
    fontWeight: '400',
  },
  targetLabel: {
    fontSize: 18,
    fontWeight: '700',
    marginTop: 6,
  },
  dome: {
    position: 'absolute',
    alignItems: 'center',
    paddingTop: 10,
    gap: 2,
  },
  domePressed: {
    opacity: 0.75,
  },
  cupAmount: {
    fontSize: 16,
  },
  endIcon: {
    position: 'absolute',
  },
  switchButton: {
    position: 'absolute',
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  switchBadge: {
    position: 'absolute',
    right: 2,
    bottom: 4,
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirm: {
    alignItems: 'center',
    marginTop: 4,
  },
  confirmText: {
    fontSize: 16,
    marginTop: 2,
  },
  recordsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'stretch',
    gap: 14,
    paddingHorizontal: 12,
    marginTop: 24,
    marginBottom: 16,
  },
  recordsTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  recordsCard: {
    alignSelf: 'stretch',
    marginHorizontal: 24,
    borderRadius: 4,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  recordRow: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 56,
  },
  recordIcon: {
    width: 44,
    alignItems: 'center',
  },
  recordText: {
    flex: 1,
    marginLeft: 16,
  },
  recordTime: {
    fontSize: 22,
  },
  recordSubtitle: {
    fontSize: 16,
    marginTop: 2,
  },
  recordAmount: {
    fontSize: 18,
  },
  menuSlot: {
    width: 36,
    alignItems: 'flex-end',
  },
  connector: {
    width: 44,
    alignItems: 'center',
    gap: 4,
    paddingVertical: 4,
  },
  dot: {
    width: 2,
    height: 4,
    borderRadius: 1,
  },
  empty: {
    fontSize: 15,
    textAlign: 'center',
    paddingVertical: 16,
  },
});