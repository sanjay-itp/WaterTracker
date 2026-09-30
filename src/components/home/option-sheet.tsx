import Ionicons from '@expo/vector-icons/Ionicons';
import { useEffect, useRef } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useWater } from './water-store';

export type SheetOption<T> = {
  label: string;
  value: T;
  destructive?: boolean;
};

type Props<T> = {
  visible: boolean;
  title?: string;
  message?: string;
  options: SheetOption<T>[];
  selected?: T;
  onSelect: (value: T) => void;
  onClose: () => void;
};

const ROW_HEIGHT = 52;

// Bottom sheet with a list of choices. Works the same on iOS, Android and web,
// so it is also used for confirmations and record menus.
export function OptionSheet<T>({
  visible,
  title,
  message,
  options,
  selected,
  onSelect,
  onClose,
}: Props<T>) {
  const { colors } = useWater();
  const insets = useSafeAreaInsets();
  const scrollRef = useRef<ScrollView>(null);
  const selectedIndex = options.findIndex((o) => o.value === selected);

  // Long lists (weights, times) open scrolled to the current value
  useEffect(() => {
    if (!visible || selectedIndex < 3) return;
    const id = setTimeout(() => {
      scrollRef.current?.scrollTo({ y: (selectedIndex - 2) * ROW_HEIGHT, animated: false });
    }, 50);
    return () => clearTimeout(id);
  }, [visible, selectedIndex]);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={[styles.backdrop, { backgroundColor: colors.overlay }]} onPress={onClose}>
        <Pressable
          style={[
            styles.sheet,
            { backgroundColor: colors.card, paddingBottom: insets.bottom + 12 },
          ]}
          // Stops taps inside the sheet from closing it
          onPress={() => {}}
        >
          <View style={[styles.handle, { backgroundColor: colors.border }]} />
          {title ? <Text style={[styles.title, { color: colors.text }]}>{title}</Text> : null}
          {message ? <Text style={[styles.message, { color: colors.textMuted }]}>{message}</Text> : null}

          <ScrollView ref={scrollRef} style={styles.list} bounces={false}>
            {options.map((option, index) => {
              const isSelected = index === selectedIndex;
              const color = option.destructive
                ? colors.danger
                : isSelected
                  ? colors.primary
                  : colors.text;
              return (
                <Pressable
                  key={`${option.label}-${index}`}
                  onPress={() => {
                    onSelect(option.value);
                    onClose();
                  }}
                  style={({ pressed }) => [
                    styles.row,
                    { borderBottomColor: colors.border },
                    pressed && { backgroundColor: colors.primarySoft },
                  ]}
                >
                  <Text style={[styles.rowLabel, { color }, isSelected && styles.rowSelected]}>
                    {option.label}
                  </Text>
                  {isSelected && <Ionicons name="checkmark" size={22} color={colors.primary} />}
                </Pressable>
              );
            })}
          </ScrollView>

          <Pressable onPress={onClose} style={styles.cancel}>
            <Text style={[styles.cancelText, { color: colors.textMuted }]}>Cancel</Text>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  sheet: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 8,
    maxHeight: '75%',
  },
  handle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: 2,
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    paddingHorizontal: 24,
    marginBottom: 4,
  },
  message: {
    fontSize: 15,
    lineHeight: 21,
    paddingHorizontal: 24,
    marginBottom: 8,
  },
  list: {
    flexGrow: 0,
  },
  row: {
    height: ROW_HEIGHT,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  rowLabel: {
    fontSize: 17,
  },
  rowSelected: {
    fontWeight: '700',
  },
  cancel: {
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  cancelText: {
    fontSize: 17,
    fontWeight: '600',
  },
});
