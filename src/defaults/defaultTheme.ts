import type { HeadlampTheme } from '../types/theme';

/**
 * Headlamp Classic Light
 * Matches the exact fallback values in frontend/src/lib/themes.ts
 *   primary:                 #0078d4  (Fluent blue)
 *   sidebar.background:      #ffffff
 *   sidebar.selectedBg:      #59636e
 *   navbar.background:       #ffffff
 *   text.primary:            rgba(0,0,0,0.87)
 */
export const defaultLight: HeadlampTheme = {
  name: 'Headlamp Classic Light',
  base: 'light',
  primary: '#0078d4',
  secondary: '#f50057',
  text: { primary: 'rgba(0,0,0,0.87)' },
  link: { color: '#0078D4' },
  background: {
    default: '#fafafa',
    surface: '#ffffff',
    muted: '#f3f2f1',
  },
  sidebar: {
    background: '#ffffff',
    color: '#333333',
    selectedBackground: '#59636e',
    selectedColor: '#59636e',
    actionBackground: '#333333',
  },
  navbar: {
    background: '#ffffff',
    color: '#333333',
  },
  fontFamily: ['Roboto', 'sans-serif'],
  radius: 4,
  buttonTextTransform: 'uppercase',
};

/**
 * Headlamp Classic Dark
 * Matches the exact fallback values in frontend/src/lib/themes.ts (dark branch)
 *   primary:                 #4B99EE
 *   sidebar.background:      #1f1f1f  (same as navbar/bg default)
 *   sidebar.selectedBg:      #59636e  (inherited from commonRules)
 *   navbar.background:       #1f1f1f
 *   background.default:      #1f1f1f
 *   text.primary:            #ffffff
 */
export const defaultDark: HeadlampTheme = {
  name: 'Headlamp Classic Dark',
  base: 'dark',
  primary: '#4B99EE',
  secondary: '#f50057',
  text: { primary: '#ffffff' },
  link: { color: '#6CB6F2' },
  background: {
    default: '#1f1f1f',
    surface: '#1f1f1f',
    muted: '#1B1A19',
  },
  sidebar: {
    background: '#1f1f1f',
    color: 'rgba(255,255,255,0.7)',
    selectedBackground: '#59636e',
    selectedColor: '#ffffff',
    actionBackground: '#333333',
  },
  navbar: {
    background: '#1f1f1f',
    color: '#ffffff',
  },
  fontFamily: ['Roboto', 'sans-serif'],
  radius: 4,
  buttonTextTransform: 'uppercase',
};
