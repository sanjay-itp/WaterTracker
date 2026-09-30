import Ionicons from '@expo/vector-icons/Ionicons';
import { useEffect, useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

import { CUP_SIZES_ML, HomePalette } from '@/constants/home';

import { useWater } from './water-store';
import { addDays, formatTime, formatVolume, startOfDay } from './water-utils';

type Props = {
  visible: boolean;
  title: string;
  initialAmountMl: number;
  initialTimestamp: number;
  onSave: (amountMl: number, timestamp: number) => void;
  onClose: () => void;
};

const MINUTE = 60 * 1000;

function formatDay(timestamp: number) {
  const today = startOfDay(new Date()).getTime();
  const day = startOfDay(timestamp).getTime();
  if (day === today) return 'Today';
  if (day === addDays(new Date(today), -1).getTime()) return 'Yesterday';
  return new Date(timestamp).toLocaleDateString(undefined, {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  });
}

function Stepper({
  label,
  value,
  onMinus,
  onPlus,
  plusDisabled,
  colors,
}: {
  label: string;
  value: string;
  onMinus: () => void;
  onPlus: () => void;
  plusDisabled?: boolean;
  colors: HomePalette;
}) {
  return (
    <View style={styles.stepperRow}>
      <Text style={[styles.stepperLabel, { color: colors.textMuted }]}>{label}</Text>
      <View style={styles.stepper}>
        <Pressable
          onPress={onMinus}
          hitSlop={8}
          style={[styles.stepButton, { backgroundColor: colors.primarySoft }]}
        >
          <Ionicons name="chevron-back" size={18} color={colors.primary} />
        </Pressable>
        <Text style={[styles.stepperValue, { color: colors.text }]}>{value}</Text>
        <Pressable
          onPress={onPlus}
          disabled={plusDisabled}
          hitSlop={8}
          style={[
            styles.stepButton,
            { backgroundColor: colors.primarySoft },
            plusDisabled && styles.disabled,
          ]}
        >
          <Ionicons name="chevron-forward" size={18} color={colors.primary} />
        </Pressable>
      </View>
    </View>
  );
}

export function AddRecordModal({
  visible,
  title,
  initialAmountMl,
  initialTimestamp,
  onSave,
  onClose,
}: Props) {
  const { colors, settings } = useWater();
  const [amount, setAmount] = useState(initialAmountMl);
  const [timestamp, setTimestamp] = useState(initialTimestamp);

  // Reset the form each time it opens
  useEffect(() => {
    if (visible) {
      setAmount(initialAmountMl);
      setTimestamp(initialTimestamp);
    }
  }, [visible, initialAmountMl, initialTimestamp]);

  const now = Date.now();
  const shift = (ms: number) => setTimestamp((t) => Math.min(now, t + ms));

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={[styles.backdrop, { backgroundColor: colors.overlay }]} onPress={onClose}>
        <Pressable style={[styles.card, { backgroundColor: colors.card }]} onPress={() => {}}>
          <Text style={[styles.title, { color: colors.text }]}>{title}</Text>

          <Text style={[styles.amount, { color: colors.primary }]}>
            {formatVolume(amount, settings.unit)}
          </Text>

          <View style={styles.chips}>
            {CUP_SIZES_ML.map((size) => {
              const selected = size === amount;
              return (
                <Pressable
                  key={size}
                  onPress={() => setAmount(size)}
                  style={[
                    styles.chip,
                    { backgroundColor: selected ? colors.primary : colors.primarySoft },
                  ]}
                >
                  <Text style={[styles.chipText, { color: selected ? '#FFFFFF' : colors.primary }]}>
                    {formatVolume(size, settings.unit)}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <Stepper
            label="Amount"
            value={formatVolume(amount, settings.unit)}
            onMinus={() => setAmount((a) => Math.max(10, a - 10))}
            onPlus={() => setAmount((a) => Math.min(2000, a + 10))}
            colors={colors}
          />
          <Stepper
            label="Day"
            value={formatDay(timestamp)}
            onMinus={() => shift(-24 * 60 * MINUTE)}
            onPlus={() => shift(24 * 60 * MINUTE)}
            plusDisabled={startOfDay(timestamp).getTime() === startOfDay(now).getTime()}
            colors={colors}
          />
          <Stepper
            label="Time"
            value={formatTime(timestamp)}
            onMinus={() => shift(-15 * MINUTE)}
            onPlus={() => shift(15 * MINUTE)}
            plusDisabled={timestamp + 15 * MINUTE > now}
            colors={colors}
          />

          <View style={styles.actions}>
            <Pressable onPress={onClose} style={styles.actionButton}>
              <Text style={[styles.actionText, { color: colors.textMuted }]}>Cancel</Text>
            </Pressable>
            <Pressable
              onPress={() => {
                onSave(amount, timestamp);
                onClose();
              }}
              style={[styles.actionButton, { backgroundColor: colors.primary }]}
            >
              <Text style={[styles.actionText, styles.saveText]}>Save</Text>
            </Pressable>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  card: {
    borderRadius: 20,
    padding: 20,
    maxWidth: 420,
    width: '100%',
    alignSelf: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
  },
  amount: {
    fontSize: 34,
    fontWeight: '700',
    textAlign: 'center',
    marginVertical: 12,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 12,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
  },
  chipText: {
    fontSize: 14,
    fontWeight: '600',
  },
  stepperRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  stepperLabel: {
    fontSize: 16,
  },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  stepButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabled: {
    opacity: 0.35,
  },
  stepperValue: {
    minWidth: 110,
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  actionButton: {
    flex: 1,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionText: {
    fontSize: 16,
    fontWeight: '600',
  },
  saveText: {
    color: '#FFFFFF',
  },
});
