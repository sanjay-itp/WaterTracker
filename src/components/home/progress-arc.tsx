import Svg, { Path } from 'react-native-svg';

type Props = {
  size: number;
  progress: number; // 0 to 1
  trackColor: string;
  progressColor: string;
  strokeWidth?: number;
};

// Arc runs from lower left, over the top, to lower right (240 degrees).
const START = -120;
const SWEEP = 240;

function point(cx: number, cy: number, r: number, deg: number) {
  const rad = (deg * Math.PI) / 180;
  return { x: cx + r * Math.sin(rad), y: cy - r * Math.cos(rad) };
}

function arcPath(cx: number, cy: number, r: number, from: number, to: number) {
  const a = point(cx, cy, r, from);
  const b = point(cx, cy, r, to);
  const largeArc = to - from > 180 ? 1 : 0;
  return `M ${a.x} ${a.y} A ${r} ${r} 0 ${largeArc} 1 ${b.x} ${b.y}`;
}

export function ProgressArc({ size, progress, trackColor, progressColor, strokeWidth = 8 }: Props) {
  const c = size / 2;
  const r = c - strokeWidth;
  const clamped = Math.max(0, Math.min(1, progress));
  const end = START + SWEEP * clamped;

  return (
    <Svg width={size} height={size}>
      <Path
        d={arcPath(c, c, r, START, START + SWEEP)}
        stroke={trackColor}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        fill="none"
      />
      {clamped > 0 && (
        <Path
          d={arcPath(c, c, r, START, Math.max(end, START + 0.5))}
          stroke={progressColor}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          fill="none"
        />
      )}
    </Svg>
  );
}