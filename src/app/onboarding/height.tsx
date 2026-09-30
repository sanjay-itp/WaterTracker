import { useRouter } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { NextButton } from '@/components/onboarding/next-button';
import {
  HeightUnit,
  cmToInches,
  inchesToCm,
  useOnboarding,
} from '@/components/onboarding/onboarding-context';
import { OnboardingHeader } from '@/components/onboarding/onboarding-header';
import { RulerPicker } from '@/components/onboarding/ruler-picker';
import { UnitToggle } from '@/components/onboarding/unit-toggle';
import { OnboardingColors } from '@/constants/onboarding';

// Feet mode works in whole inches: 36 in (3'0") to 96 in (8'0")
const RANGES = {
  cm: { min: 100, max: 230, labelEvery: 5 },
  ft: { min: 36, max: 96, labelEvery: 6 },
} as const;

const formatFeet = (inches: number) => `${Math.floor(inches / 12)}'${inches % 12}"`;

export default function HeightScreen() {
  const router = useRouter();
  const { data, update } = useOnboarding();
  const unit = data.heightUnit;
  const displayValue = unit === 'cm' ? Math.round(data.heightCm) : cmToInches(data.heightCm);

  const handleChange = (value: number) => {
    update({ heightCm: unit === 'cm' ? value : inchesToCm(value) });
  };

  return (
    <SafeAreaView style={styles.safe}>
      <OnboardingHeader step={3} />

      <View style={styles.content}>
        <Text style={styles.title}>Choose your height</Text>

        <View style={styles.toggle}>
          <UnitToggle<HeightUnit>
            options={[
              { label: 'cm', value: 'cm' },
              { label: 'feet, inches', value: 'ft' },
            ]}
            value={unit}
            onChange={(heightUnit) => update({ heightUnit })}
          />
        </View>

        {/* key remounts the ruler so it scrolls to the converted value */}
        <RulerPicker
          key={unit}
          min={RANGES[unit].min}
          max={RANGES[unit].max}
          labelEvery={RANGES[unit].labelEvery}
          value={displayValue}
          onChange={handleChange}
          unitLabel={unit === 'cm' ? 'cm' : 'ft, in'}
          formatValue={unit === 'ft' ? formatFeet : String}
        />
      </View>

      <View style={styles.footer}>
        <NextButton onPress={() => router.push('../onboarding/age')} />
      </View>
    </SafeAreaView>
  );
}

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