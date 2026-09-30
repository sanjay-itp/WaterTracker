import { Redirect } from 'expo-router';
import { Tabs } from 'expo-router/js-tabs';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { TopTabBar } from '@/components/home/top-tab-bar';
import { WaterProvider, useWater } from '@/components/home/water-store';

function HomeTabs() {
  const { loaded, profile, colors } = useWater();

  if (!loaded) {
    return (
      <View style={[styles.loading, { backgroundColor: colors.background }]}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  // Signed in but never filled in their details (new device, or skipped)
  if (!profile) return <Redirect href="/onboarding/gender" />;

  return (
    <>
      <StatusBar style="light" />
      <Tabs
        tabBar={(props) => <TopTabBar {...props} />}
        screenOptions={{
          headerShown: false,
          tabBarPosition: 'top',
          sceneStyle: { backgroundColor: colors.background },
        }}
      >
        <Tabs.Screen name="homepage" options={{ title: 'Home' }} />
        <Tabs.Screen name="history" options={{ title: 'History' }} />
        <Tabs.Screen name="settings" options={{ title: 'Settings' }} />
      </Tabs>
    </>
  );
}

export default function HomeLayout() {
  return (
    <WaterProvider>
      <HomeTabs />
    </WaterProvider>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
