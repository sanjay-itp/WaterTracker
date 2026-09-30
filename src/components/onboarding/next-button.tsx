import { ActivityIndicator, Pressable, StyleSheet, Text } from 'react-native';

import { OnboardingColors } from '@/constants/onboarding';

type Props = {
  title?: string;
  onPress: () => void;
  loading?: boolean;
};

const styles = StyleSheet.create({
  button: {
    height: 64,
    borderRadius: 24,
    backgroundColor: OnboardingColors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    opacity: 0.85,
    transform: [{ scale: 0.99 }],
  },
  text: {
    color: OnboardingColors.text,
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
});

export function NextButton({ title = 'Next', onPress, loading }: Props) {
  return (
    <Pressable
      onPress={onPress}
      disabled={loading}
      accessibilityRole="button"
      style={({ pressed }) => [styles.button, pressed && styles.pressed]}
    >
      {loading ? (
        <ActivityIndicator color={OnboardingColors.text} />
      ) : (
        <Text style={styles.text}>{title}</Text>
      )}
    </Pressable>
  );
}

