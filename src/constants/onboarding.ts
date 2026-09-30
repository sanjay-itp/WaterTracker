// Shared look for the onboarding screens (gender, weight, height, age).

export const OnboardingColors = {
  background: '#000000',
  primary: '#1A66FF',
  card: '#1F242B',
  panel: '#111A2E',
  text: '#FFFFFF',
  textMuted: '#9EA3AE',
  cardLabelMuted: '#B8BCC4',
  rulerTick: '#34405F',
  rulerLabel: '#4A5675',
  indicator: '#FF2D2D',
  progressTrack: '#23272F',
  backButton: '#1C1C1E',
  backButtonBorder: '#2C2C2E',
} as const;

// Number of steps in the onboarding flow, used by the progress bar.
export const ONBOARDING_TOTAL_STEPS = 5;