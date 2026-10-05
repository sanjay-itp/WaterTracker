import { useCallback, useEffect, useRef, useState } from 'react';
import { LayoutChangeEvent, NativeScrollEvent, NativeSyntheticEvent, ScrollView, StyleSheet, Text, View} from 'react-native';
import { OnboardingColors } from '@/constants/onboarding';

const TICK_SPACING = 10;

type Props = {
  min: number;
  max: number;
  value: number;
  onChange: (value: number) => void;
  unitLabel: string;
  // Every Nth value gets a taller tick and a number above it
  labelEvery?: number;
  // Formats the big number and the scale labels, e.g. inches to 5'7"
  formatValue?: (value: number) => string;
};

export function RulerPicker({
  min,
  max,
  value,
  onChange,
  unitLabel,
  labelEvery = 5,
  formatValue = String,
}: Props) {
  const scrollRef = useRef<ScrollView>(null);
  const lastValue = useRef(value);
  const [width, setWidth] = useState(0);

  const count = max - min + 1;
  const ticks = Array.from({ length: count }, (_, i) => min + i);

  // Jump to the starting value once the ruler knows its width
  useEffect(() => {
    if (!width) return;
    scrollRef.current?.scrollTo({ x: (value - min) * TICK_SPACING, animated: false });
    // Only run on first layout; afterwards the scroll position drives the value
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [width]);

  const handleLayout = (e: LayoutChangeEvent) => setWidth(e.nativeEvent.layout.width);

  const handleScroll = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      const index = Math.round(e.nativeEvent.contentOffset.x / TICK_SPACING);
      const next = Math.min(max, Math.max(min, min + index));
      if (next !== lastValue.current) {
        lastValue.current = next;
        onChange(next);
      }
    },
    [min, max, onChange],
  );

  const sidePadding = width / 2 - TICK_SPACING / 2;

const styles = StyleSheet.create({
  panel: {
    backgroundColor: OnboardingColors.panel,
    borderRadius: 28,
    paddingTop: 36,
    paddingBottom: 28,
    alignItems: 'center',
    overflow: 'hidden',
  },
  value: {
    color: OnboardingColors.text,
    fontSize: 64,
    fontWeight: '800',
    lineHeight: 72,
  },
  unit: {
    color: OnboardingColors.rulerLabel,
    fontSize: 22,
    fontWeight: '600',
    marginTop: 2,
  },
  ruler: {
    alignSelf: 'stretch',
    height: 96,
    marginTop: 28,
    justifyContent: 'flex-end',
  },
  tickSlot: {
    width: TICK_SPACING,
    height: 96,
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingBottom: 12,
  },
  tick: {
    width: 2,
    height: 18,
    borderRadius: 1,
    backgroundColor: OnboardingColors.rulerTick,
  },
  tickMajor: {
    height: 28,
  },
  tickLabel: {
    position: 'absolute',
    top: 0,
    left: (TICK_SPACING - 60) / 2,
    width: 60,
    textAlign: 'center',
    color: OnboardingColors.rulerLabel,
    fontSize: 15,
    fontWeight: '700',
  },
  indicator: {
    position: 'absolute',
    pointerEvents: 'none',
    left: '50%',
    bottom: 6,
    width: 4,
    height: 48,
    marginLeft: -2,
    borderRadius: 2,
    backgroundColor: OnboardingColors.indicator,
  },
});

  return (
    <View style={styles.panel}>
      <Text style={styles.value}>{formatValue(value)}</Text>
      <Text style={styles.unit}>{unitLabel}</Text>

      <View style={styles.ruler} onLayout={handleLayout}>
        {width > 0 && (
          <ScrollView
            ref={scrollRef}
            horizontal
            showsHorizontalScrollIndicator={false}
            snapToInterval={TICK_SPACING}
            decelerationRate="fast"
            scrollEventThrottle={16}
            onScroll={handleScroll}
            contentContainerStyle={{ paddingHorizontal: sidePadding }}
          >
            {ticks.map((tick) => {
              const isMajor = (tick - min) % labelEvery === 0;
              return (
                <View key={tick} style={styles.tickSlot}>
                  {isMajor && (
                    <Text style={styles.tickLabel}>{formatValue(tick)}</Text>
                  )}
                  <View style={[styles.tick, isMajor && styles.tickMajor]} />
                </View>
              );
            })}
          </ScrollView>
        )}

        <View style={styles.indicator} />
      </View>
    </View>
  );
}

