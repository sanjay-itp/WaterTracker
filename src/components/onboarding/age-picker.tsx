import { useCallback, useEffect, useRef, useState } from 'react';
import {
  LayoutChangeEvent,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { OnboardingColors } from '@/constants/onboarding';

const ITEM_WIDTH = 104;
const CIRCLE = 86;
const CIRCLE_SELECTED = 100;

type Props = {
  min?: number;
  max?: number;
  value: number;
  onChange: (value: number) => void;
};

export function AgePicker({ min = 10, max = 100, value, onChange }: Props) {
  const scrollRef = useRef<ScrollView>(null);
  const lastValue = useRef(value);
  const [width, setWidth] = useState(0);

  const ages = Array.from({ length: max - min + 1 }, (_, i) => min + i);

  useEffect(() => {
    if (!width) return;
    scrollRef.current?.scrollTo({ x: (value - min) * ITEM_WIDTH, animated: false });
    // Only run on first layout; afterwards the scroll position drives the value
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [width]);

  const handleLayout = (e: LayoutChangeEvent) => setWidth(e.nativeEvent.layout.width);

  const handleScroll = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      const index = Math.round(e.nativeEvent.contentOffset.x / ITEM_WIDTH);
      const next = Math.min(max, Math.max(min, min + index));
      if (next !== lastValue.current) {
        lastValue.current = next;
        onChange(next);
      }
    },
    [min, max, onChange],
  );

  const scrollToAge = (age: number) => {
    scrollRef.current?.scrollTo({ x: (age - min) * ITEM_WIDTH, animated: true });
  };

  const sidePadding = width / 2 - ITEM_WIDTH / 2;

  return (
    <View style={styles.container} onLayout={handleLayout}>
      {width > 0 && (
        <ScrollView
          ref={scrollRef}
          horizontal
          showsHorizontalScrollIndicator={false}
          snapToInterval={ITEM_WIDTH}
          decelerationRate="fast"
          scrollEventThrottle={16}
          onScroll={handleScroll}
          contentContainerStyle={{ paddingHorizontal: sidePadding, alignItems: 'center' }}
        >
          {ages.map((age) => {
            const selected = age === value;
            return (
              <View key={age} style={styles.slot}>
                <Pressable
                  onPress={() => scrollToAge(age)}
                  accessibilityRole="button"
                  accessibilityLabel={`${age} years`}
                  accessibilityState={{ selected }}
                  style={[styles.circle, selected && styles.circleSelected]}
                >
                  <Text style={[styles.label, selected && styles.labelSelected]}>{age}</Text>
                </Pressable>
              </View>
            );
          })}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: CIRCLE_SELECTED + 20,
    justifyContent: 'center',
  },
  slot: {
    width: ITEM_WIDTH,
    alignItems: 'center',
    justifyContent: 'center',
  },
  circle: {
    width: CIRCLE,
    height: CIRCLE,
    borderRadius: CIRCLE / 2,
    backgroundColor: OnboardingColors.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  circleSelected: {
    width: CIRCLE_SELECTED,
    height: CIRCLE_SELECTED,
    borderRadius: CIRCLE_SELECTED / 2,
    backgroundColor: OnboardingColors.primary,
    boxShadow: '0px 6px 24px rgba(26, 102, 255, 0.45)',
  },
  label: {
    color: '#7C8290',
    fontSize: 18,
    fontWeight: '700',
  },
  labelSelected: {
    color: '#E4ECFF',
    fontSize: 36,
    fontWeight: '800',
  },
});
