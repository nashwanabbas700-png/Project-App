export const COLORS = {
  primary: '#0F1E45',
  primaryDark: '#070F22',
  primaryLight: '#1a2f6b',
  secondary: '#2E7CF6',
  secondaryLight: '#60A5FA',
  accent: '#38BDF8',
  background: '#F0F4FF',
  surface: '#FFFFFF',
  surfaceBlue: '#EFF6FF',
  card: '#FFFFFF',
  border: '#E2E8F0',
  borderLight: '#F1F5F9',
  text: '#0F1E45',
  textSecondary: '#475569',
  textMuted: '#94A3B8',
  textOnDark: '#FFFFFF',
  success: '#16A34A',
  successLight: '#DCFCE7',
  warning: '#F59E0B',
  warningLight: '#FEF3C7',
  danger: '#EF4444',
  dangerLight: '#FEE2E2',
  info: '#3B82F6',
  infoLight: '#DBEAFE',
  purple: '#7C3AED',
  purpleLight: '#EDE9FE',
  teal: '#0D9488',
  tealLight: '#CCFBF1',
  // Legacy color aliases for backward compatibility
  textPrimary: '#0F1E45',
  textInverse: '#FFFFFF',
  surfaceSubtle: '#F8FAFF',
  successSubtle: '#F0FDF4',
  secondarySubtle: '#DBEAFE',
  warningSubtle: '#FEF3C7',
  dangerSubtle: '#FEE2E2',
  infoSubtle: '#DBEAFE',
  borderSubtle: '#F1F5F9',
  primaryMedium: '#1a2f6b',
  surfaceMedium: '#F8FAFF',
  textSubtle: '#94A3B8',
  // Sidebar
  sidebarBg: '#0F1E45',
  sidebarActive: '#2E7CF6',
  sidebarText: '#94A3B8',
  sidebarTextActive: '#FFFFFF',
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  xxxl: 64,
};

export const RADIUS = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
};

export const SHADOW = {
  sm: {
    shadowColor: '#0F1E45',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  md: {
    shadowColor: '#0F1E45',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  lg: {
    shadowColor: '#0F1E45',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 8,
  },
  card: {
    shadowColor: '#0F1E45',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  subtle: {
    shadowColor: '#0F1E45',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  floating: {
    shadowColor: '#0F1E45',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.2,
    shadowRadius: 32,
    elevation: 12,
  },
};

// SHADOWS is a backward-compatible alias for SHADOW
export const SHADOWS = SHADOW;

export const TYPOGRAPHY = {
  h1: { fontSize: 28, fontWeight: '800' as const, letterSpacing: -0.5 },
  h2: { fontSize: 22, fontWeight: '700' as const, letterSpacing: -0.3 },
  h3: { fontSize: 18, fontWeight: '600' as const },
  h4: { fontSize: 16, fontWeight: '600' as const },
  body: { fontSize: 14, fontWeight: '400' as const },
  bodyLg: { fontSize: 16, fontWeight: '400' as const },
  caption: { fontSize: 12, fontWeight: '400' as const },
  label: {
    fontSize: 11,
    fontWeight: '600' as const,
    letterSpacing: 0.5,
    textTransform: 'uppercase' as const,
  },
};

export const COURSE_COLORS = [
  { bg: '#DBEAFE', text: '#1D4ED8', border: '#93C5FD' },
  { bg: '#DCFCE7', text: '#15803D', border: '#86EFAC' },
  { bg: '#FEF3C7', text: '#B45309', border: '#FCD34D' },
  { bg: '#EDE9FE', text: '#6D28D9', border: '#C4B5FD' },
  { bg: '#FEE2E2', text: '#B91C1C', border: '#FCA5A5' },
  { bg: '#CCFBF1', text: '#0F766E', border: '#5EEAD4' },
  { bg: '#FCE7F3', text: '#9D174D', border: '#F9A8D4' },
  { bg: '#FEF9C3', text: '#854D0E', border: '#FDE047' },
];
