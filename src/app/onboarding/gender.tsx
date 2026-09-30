import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import FemaleAvatar from '@/assets/svg/avatars/female.svg';
import MaleAvatar from '@/assets/svg/avatars/male.svg';
import { NextButton } from '@/components/onboarding/next-button';
import { Gender, useOnboarding } from '@/components/onboarding/onboarding-context';
import { OnboardingHeader } from '@/components/onboarding/onboarding-header';
import { OnboardingColors } from '@/constants/onboarding';

const OPTIONS: { value: Gender; label: string; Avatar: typeof MaleAvatar }[] = [
  { value: 'male', label: 'Male', Avatar: MaleAvatar },
  { value: 'female', label: 'Female', Avatar: FemaleAvatar },
];

export default function GenderScreen() {
  const router = useRouter();
  const { data, update } = useOnboarding();

  return (
    <SafeAreaView style={styles.safe}>
      {/* First step after sign up, so there is nowhere to go back to */}
      <OnboardingHeader step={1} showBack={false} />

      <View style={styles.content}>
        <Text style={styles.title}>Choose your gender</Text>
        <Text style={styles.subtitle}>We'll calculate your daily water goal just for you</Text>

        <View style={styles.cards}>
          {OPTIONS.map(({ value, label, Avatar }) => {
            const selected = data.gender === value;
            return (
              <Pressable
                key={value}
                onPress={() => update({ gender: value })}
                accessibilityRole="radio"
                accessibilityState={{ selected }}
                style={({ pressed }) => [
                  styles.card,
                  selected ? styles.cardSelected : styles.cardIdle,
                  pressed && styles.cardPressed,
                ]}
              >
                <Text style={[styles.cardLabel, selected && styles.cardLabelSelected]}>
                  {label}
                </Text>
                <View style={styles.avatarWrap}>
                  <Avatar width="80%" height="100%" preserveAspectRatio="xMidYMax meet" />
                </View>
              </Pressable>
            );
          })}
        </View>
      </View>

      <View style={styles.footer}>
        <NextButton onPress={() => router.push('../onboarding/weight')} />
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
    paddingHorizontal: 16,
    paddingTop: 48,
  },
  title: {
    color: OnboardingColors.text,
    fontSize: 30,
    fontWeight: '800',
    textAlign: 'center',
  },
  subtitle: {
    color: OnboardingColors.textMuted,
    fontSize: 16,
    lineHeight: 22,
    textAlign: 'center',
    marginTop: 10,
    paddingHorizontal: 24,
  },
  cards: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 40,
  },
  card: {
    flex: 1,
    aspectRatio: 0.63,
    borderRadius: 28,
    paddingTop: 24,
    alignItems: 'center',
    overflow: 'hidden',
  },
  cardSelected: {
    backgroundColor: OnboardingColors.primary,
  },
  cardIdle: {
    backgroundColor: OnboardingColors.card,
  },
  cardPressed: {
    opacity: 0.9,
  },
  cardLabel: {
    color: OnboardingColors.cardLabelMuted,
    fontSize: 17,
    fontWeight: '600',
  },
  cardLabelSelected: {
    color: OnboardingColors.text,
  },
  avatarWrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '52%',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  footer: {
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
});