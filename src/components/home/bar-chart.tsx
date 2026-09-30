import Svg, { Line, Rect, Text as SvgText } from 'react-native-svg';

import { HomePalette } from '@/constants/home';

type Props = {
  width: number;
  height: number;
  // Percent of goal per slot (day or month); null means no data
  values: (number | null)[];
  // Which slots get a label under the axis
  labels: { index: number; text: string }[];
  caption?: string;
  colors: HomePalette;
};

const AXIS_WIDTH = 40;
const TOP = 36;
const BOTTOM = 56;
const Y_STEPS = [0, 20, 40, 60, 80, 100];

export function BarChart({ width, height, values, labels, caption, colors }: Props) {
  const plotWidth = width - AXIS_WIDTH - 8;
  const plotHeight = height - TOP - BOTTOM;
  const slot = plotWidth / Math.max(values.length, 1);
  const barWidth = Math.max(3, Math.min(slot * 0.6, 22));
  const baseY = TOP + plotHeight;
  const yFor = (pct: number) => baseY - (Math.min(pct, 100) / 100) * plotHeight;

  return (
    <Svg width={width} height={height}>
      <SvgText x={AXIS_WIDTH - 8} y={16} fontSize={13} fill={colors.textMuted} textAnchor="end">
        (%)
      </SvgText>

      {Y_STEPS.map((step) => (
        <SvgText
          key={`y-${step}`}
          x={AXIS_WIDTH - 8}
          y={yFor(step) + 4}
          fontSize={13}
          fill={colors.textMuted}
          textAnchor="end"
        >
          {step}
        </SvgText>
      ))}
      {Y_STEPS.filter((s) => s > 0).map((step) => (
        <Line
          key={`grid-${step}`}
          x1={AXIS_WIDTH}
          x2={width - 8}
          y1={yFor(step)}
          y2={yFor(step)}
          stroke={colors.border}
          strokeDasharray="4 4"
        />
      ))}

      {/* axes */}
      <Line x1={AXIS_WIDTH} x2={AXIS_WIDTH} y1={TOP - 10} y2={baseY + 16} stroke={colors.border} />
      <Line x1={AXIS_WIDTH} x2={width - 8} y1={baseY} y2={baseY} stroke={colors.textMuted} />

      {values.map((value, i) => {
        const x = AXIS_WIDTH + slot * i + slot / 2;
        return (
          <Line
            key={`tick-${i}`}
            x1={x}
            x2={x}
            y1={baseY}
            y2={baseY + 6}
            stroke={colors.textMuted}
            strokeWidth={0.8}
          />
        );
      })}

      {labels.map(({ index, text }) => {
        const x = AXIS_WIDTH + slot * index + slot / 2;
        return (
          <SvgText
            key={`label-${index}`}
            x={x}
            y={baseY + 22}
            fontSize={13}
            fill={colors.textMuted}
            textAnchor="middle"
          >
            {text}
          </SvgText>
        );
      })}

      {values.map((value, i) => {
        if (!value) return null;
        const x = AXIS_WIDTH + slot * i + (slot - barWidth) / 2;
        const top = yFor(value);
        return (
          <Rect
            key={`bar-${i}`}
            x={x}
            y={top}
            width={barWidth}
            height={Math.max(baseY - top, 2)}
            rx={2}
            fill={value >= 100 ? colors.success : colors.primary}
          />
        );
      })}

      {caption && (
        <SvgText x={AXIS_WIDTH} y={height - 8} fontSize={14} fill={colors.textMuted}>
          {caption}
        </SvgText>
      )}
    </Svg>
  );
}