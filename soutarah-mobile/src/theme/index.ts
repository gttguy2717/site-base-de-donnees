// Thème SOUTARAH GROUP — cohérent avec le site web
export const colors = {
  primary: '#296c00',
  primaryDark: '#1b4c00',
  primaryLight: '#69c33b',
  darkGreen: '#092314',
  darkGreen2: '#061d10',
  darkGreenCard: '#0d321d',
  sidebarBg: '#071f11',
  sidebarItemActive: '#15803d',
  sidebarBorder: '#144627',
  emerald: '#10b981',
  emeraldLight: '#34d399',
  emeraldMuted: '#d1fae5',
  background: '#f3f7f1',
  surface: '#ffffff',
  surfaceAlt: '#eef4eb',
  border: '#cadcc6',
  text: '#1a1c1c',
  textSecondary: '#6b7280',
  textMuted: '#9ca3af',
  white: '#ffffff',
  error: '#ef4444',
  warning: '#f59e0b',
  success: '#10b981',
  info: '#3b82f6',
  gold: '#fbbf24',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
};

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  round: 999,
};

export const typography = {
  h1: { fontSize: 28, fontWeight: '800' as const, lineHeight: 34 },
  h2: { fontSize: 22, fontWeight: '700' as const, lineHeight: 28 },
  h3: { fontSize: 18, fontWeight: '700' as const, lineHeight: 24 },
  body: { fontSize: 16, fontWeight: '400' as const, lineHeight: 22 },
  bodySmall: { fontSize: 14, fontWeight: '400' as const, lineHeight: 20 },
  caption: { fontSize: 12, fontWeight: '500' as const, lineHeight: 16 },
  label: { fontSize: 12, fontWeight: '700' as const, lineHeight: 16 },
};

export const shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
};

export const API_URL = 'http://192.168.1.11:5000/api';
