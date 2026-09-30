// Colors and fixed values for the main app (Home, History, Settings).

export type HomePalette = {
  background: string;
  header: string;
  headerText: string;
  headerTextInactive: string;
  text: string;
  textMuted: string;
  sectionTitle: string;
  primary: string;
  primarySoft: string;
  track: string;
  card: string;
  border: string;
  shadow: string;
  danger: string;
  success: string;
  overlay: string;
};

export const HomeColors: { light: HomePalette; dark: HomePalette } = {
  light: {
    background: '#FFFFFF',
    header: '#3FA2FF',
    headerText: '#FFFFFF',
    headerTextInactive: 'rgba(255, 255, 255, 0.6)',
    text: '#1A1A1A',
    textMuted: '#8A8A8A',
    sectionTitle: '#A6A6A6',
    primary: '#3FA2FF',
    primarySoft: '#DCEEFF',
    track: '#E3E3E3',
    card: '#FFFFFF',
    border: '#E6E6E6',
    shadow: 'rgba(0, 0, 0, 0.12)',
    danger: '#E5484D',
    success: '#2DB84C',
    overlay: 'rgba(0, 0, 0, 0.4)',
  },
  dark: {
    background: '#0E1116',
    header: '#1D6FC4',
    headerText: '#FFFFFF',
    headerTextInactive: 'rgba(255, 255, 255, 0.55)',
    text: '#F2F4F7',
    textMuted: '#9AA3AF',
    sectionTitle: '#6B7380',
    primary: '#4DA8FF',
    primarySoft: '#16304D',
    track: '#2A2F38',
    card: '#181C23',
    border: '#2A2F38',
    shadow: 'rgba(0, 0, 0, 0.5)',
    danger: '#FF6369',
    success: '#3FCF60',
    overlay: 'rgba(0, 0, 0, 0.6)',
  },
};

export const CUP_SIZES_ML = [100, 150, 200, 250, 300, 400, 500];

export const TIPS = [
  'Drinking water in a sitting posture is better than in a standing or running position',
  'Start your day with a glass of water to wake up your body',
  'Drink a glass of water about 30 minutes before each meal',
  'Keep a bottle of water on your desk as a visual reminder',
  'Feeling hungry? You might just be thirsty, so try a glass of water first',
  'Sip water slowly instead of drinking a lot at once',
  'Drink extra water when the weather is hot or after exercise',
];
