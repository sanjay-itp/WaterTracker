import { Pressable, StyleSheet, Text, View } from 'react-native';

import { OnboardingColors } from '@/constants/onboarding';

type Option<T extends string> = {
  label: string;
  value: T;
};

type Props<T extends string> = {
  options: Option<T>[];
  value: T;
  onChange: (value: T) => void;
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
  },
  pill: {
    minWidth: 76,
    height: 46,
    paddingHorizontal: 22,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pillSelected: {
    backgroundColor: OnboardingColors.primary,
  },
  pillIdle: {
    backgroundColor: OnboardingColors.card,
  },
  label: {
    color: OnboardingColors.text,
    fontSize: 16,
    fontWeight: '600',
  },
  labelSelected: {
    color: '#DCE6FF',
  },
});

export function UnitToggle<T extends string>({ options, value, onChange }: Props<T>) {
  return (
    <View style={styles.row}>
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <Pressable
            key={option.value}
            onPress={() => onChange(option.value)}
            accessibilityRole="button"
            accessibilityState={{ selected }}
            style={[styles.pill, selected ? styles.pillSelected : styles.pillIdle]}
          >
            <Text style={[styles.label, selected && styles.labelSelected]}>{option.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}
