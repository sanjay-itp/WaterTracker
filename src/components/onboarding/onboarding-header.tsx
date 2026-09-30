import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { ONBOARDING_TOTAL_STEPS, OnboardingColors } from '@/constants/onboarding';

type Props = {
  step: number;
  showBack?: boolean;
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    height: 56,
  },
  side: {
    width: 44,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: OnboardingColors.backButton,
    borderWidth: 1,
    borderColor: OnboardingColors.backButtonBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    opacity: 0.7,
  },
  track: {
    flex: 1,
    height: 4,
    marginHorizontal: 20,
    borderRadius: 2,
    backgroundColor: OnboardingColors.progressTrack,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 2,
    backgroundColor: OnboardingColors.primary,
  },
});

export function OnboardingHeader({ step, showBack = true }: Props) {
  const router = useRouter();
  const progress = Math.min(step / ONBOARDING_TOTAL_STEPS, 1);

  return (
    <View style={styles.row}>
      <View style={styles.side}>
        {showBack && (
          <Pressable
            onPress={() => router.back()}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="Go back"
            style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}
          >
            <Ionicons name="chevron-back" size={22} color={OnboardingColors.text} />
          </Pressable>
        )}
      </View>

      <View style={styles.track}>
        <View style={[styles.fill, { width: `${progress * 100}%` }]} />
      </View>

      {/* Mirrors the back button width so the bar stays centered */}
      <View style={styles.side} />
    </View>
  );
}

