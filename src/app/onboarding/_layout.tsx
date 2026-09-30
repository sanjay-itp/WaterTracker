import { Stack } from 'expo-router';

import { OnboardingProvider } from '@/components/onboarding/onboarding-context';
import { OnboardingColors } from '@/constants/onboarding';

export default function OnboardingLayout() {
  return (
    <OnboardingProvider>
      <Stack
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right',
          contentStyle: { backgroundColor: OnboardingColors.background },
        }}
      >
        <Stack.Screen name="gender" />
        <Stack.Screen name="weight" />
        <Stack.Screen name="height" />
        <Stack.Screen name="age" />
      </Stack>
    </OnboardingProvider>
  );
}
