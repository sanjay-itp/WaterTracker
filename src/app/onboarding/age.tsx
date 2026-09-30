import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AgePicker } from '@/components/onboarding/age-picker';
import { NextButton } from '@/components/onboarding/next-button';
import { saveProfile, useOnboarding } from '@/components/onboarding/onboarding-context';
import { OnboardingHeader } from '@/components/onboarding/onboarding-header';
import { OnboardingColors } from '@/constants/onboarding';

export default function AgeScreen() {
  const router = useRouter();
  const { data, update } = useOnboarding();
  const [saving, setSaving] = useState(false);

  const handleNext = async () => {
    setSaving(true);
    try {
      await saveProfile(data);
      router.replace('/(home)/homepage');
    } catch (error) {
      console.log('Save profile error:', error);
      Alert.alert('Could not save', 'Something went wrong. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <OnboardingHeader step={4} />

      <View style={styles.content}>
        <Text style={styles.title}>Choose your age</Text>

        <View style={styles.picker}>
          <AgePicker value={data.age} onChange={(age) => update({ age })} />
        </View>
      </View>

      <View style={styles.footer}>
        <NextButton onPress={handleNext} loading={saving} />
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
    paddingTop: 48,
  },
  title: {
    color: OnboardingColors.text,
    fontSize: 30,
    fontWeight: '800',
    textAlign: 'center',
  },
  picker: {
    marginTop: 120,
  },
  footer: {
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
});