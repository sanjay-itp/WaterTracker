import { useRouter } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { NextButton } from '@/components/onboarding/next-button';
import {WeightUnit, kgToLb, lbToKg, useOnboarding} from '@/components/onboarding/onboarding-context';
import { OnboardingHeader } from '@/components/onboarding/onboarding-header';
import { RulerPicker } from '@/components/onboarding/ruler-picker';
import { UnitToggle } from '@/components/onboarding/unit-toggle';
import { OnboardingColors } from '@/constants/onboarding';

const RANGES = {
  kg: { min: 30, max: 200 },
  lb: { min: 66, max: 440 },
} as const;

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: OnboardingColors.background,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 48,
  },
  title: {
    color: OnboardingColors.text,
    fontSize: 30,
    fontWeight: '800',
    textAlign: 'center',
  },
  toggle: {
    marginTop: 40,
    marginBottom: 32,
  },
  footer: {
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
});

export default 
function WeightScreen() {
  const router = useRouter();
  const { data, update } = useOnboarding();
  const unit = data.weightUnit;
  const displayValue = unit === 'kg' ? Math.round(data.weightKg) : kgToLb(data.weightKg);

  const handleChange = (value: number) => {
    update({ weightKg: unit === 'kg' ? value : lbToKg(value) });
  };

  return (
    <SafeAreaView style={styles.safe}>
      <OnboardingHeader step={2} />

      <View style={styles.content}>
        <Text style={styles.title}>Choose your weight</Text>

        <View style={styles.toggle}>
          <UnitToggle<WeightUnit>
            options={[
              { label: 'kg', value: 'kg' },
              { label: 'lb', value: 'lb' },
            ]}
            value={unit}
            onChange={(weightUnit) => update({ weightUnit })}
          />
        </View>

        {/* key remounts the ruler so it scrolls to the converted value */}
        <RulerPicker
          key={unit}
          min={RANGES[unit].min}
          max={RANGES[unit].max}
          value={displayValue}
          onChange={handleChange}
          unitLabel={unit}
        />
      </View>

      <View style={styles.footer}>
        <NextButton onPress={() => router.push('../onboarding/height')} />
      </View>
    </SafeAreaView>
  );
}
