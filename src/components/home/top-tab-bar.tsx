import Ionicons from '@expo/vector-icons/Ionicons';
import type { BottomTabBarProps } from 'expo-router/js-tabs';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useWater } from './water-store';

const ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
  homepage: 'water',
  history: 'time-outline',
  settings: 'settings-sharp',
};


export function TopTabBar({ state, descriptors, navigation, insets }: BottomTabBarProps) {
  const { colors } = useWater();

  return (
    <View style={[styles.bar, { backgroundColor: colors.header, paddingTop: insets.top }]}>
      <View style={styles.row}>
        {state.routes.map((route, index) => {
          const focused = state.index === index;
          const { options } = descriptors[route.key];
          const label = options.title ?? route.name;
          const color = focused ? colors.headerText : colors.headerTextInactive;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });
            if (!focused && !event.defaultPrevented) navigation.navigate(route.name);
          };

          return (
            <Pressable
              key={route.key}
              onPress={onPress}
              accessibilityRole="tab"
              accessibilityState={{ selected: focused }}
              style={styles.tab}
            >
              <View style={styles.tabContent}>
                <Ionicons name={ICONS[route.name] ?? 'ellipse'} size={22} color={color} />
                <Text style={[styles.label, { color }]} numberOfLines={1}>
                  {label}
                </Text>
              </View>
              <View
                style={[
                  styles.indicator,
                  { backgroundColor: focused ? colors.headerText : 'transparent' },
                ]}
              />
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    boxShadow: '0px 2px 6px rgba(0, 0, 0, 0.15)',
    zIndex: 1,
  },
  row: {
    flexDirection: 'row',
  },
  tab: {
    flex: 1,
    height: 56,
    justifyContent: 'flex-end',
  },
  tabContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  label: {
    fontSize: 17,
    fontWeight: '500',
  },
  indicator: {
    height: 3,
  },
});