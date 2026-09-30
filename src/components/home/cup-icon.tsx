import Svg, { Path, Rect } from 'react-native-svg';

type Props = {
  size?: number;
  water?: string;
  outline?: string;
  plus?: boolean;
};

// Mug with water inside, optionally with a "+" on it (the add button)
export function CupIcon({ size = 56, water = '#3FA2FF', outline = '#111111', plus = false }: Props) {
  return (
    <Svg width={size} height={size} viewBox="0 0 64 64">
      {/* handle */}
      <Path
        d="M46 22 h6 a6 6 0 0 1 6 6 v10 a6 6 0 0 1 -6 6 h-6"
        stroke={outline}
        strokeWidth={4}
        fill="none"
      />
      {/* water */}
      <Path d="M12 30 Q22 24 30 30 T46 28 V54 a4 4 0 0 1 -4 4 H16 a4 4 0 0 1 -4 -4 Z" fill={water} />
      {/* glass */}
      <Rect x={10} y={6} width={38} height={54} rx={6} stroke={outline} strokeWidth={4} fill="none" />
      <Path d="M10 14 H48" stroke={outline} strokeWidth={3} />
      {plus && (
        <Path d="M29 36 V52 M21 44 H37" stroke="#FFFFFF" strokeWidth={4} strokeLinecap="round" />
      )}
    </Svg>
  );
}