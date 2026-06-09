import type { HeadlampTheme } from '../types/theme';

/**
 * Headlamp Classic Light
 * Matches frontend/src/components/App/defaultAppThemes.ts – headlampClassicLightTheme
 */
export const defaultLight: HeadlampTheme = {
  name: 'Headlamp Classic Light',
  base: 'light',
  primary: '#222',
  secondary: '#eaeaea',
  text: { primary: 'rgba(0,0,0,0.87)' },
  link: { color: '#0072c9' },
  background: {
    default: '#fafafa',
    surface: '#ffffff',
    muted: '#f3f2f1',
  },
  sidebar: {
    background: '#242424',
    color: '#ffffff',
    selectedBackground: '#ebe811',
    selectedColor: '#ebe811',
    actionBackground: '#605e5c',
  },
  navbar: {
    background: '#ffffff',
    color: '#202020',
  },
  fontFamily: ['Roboto', 'sans-serif'],
  radius: 4,
  buttonTextTransform: 'uppercase',
};

/**
 * Headlamp Classic Dark
 * Matches frontend/src/components/App/defaultAppThemes.ts – darkTheme
 */
export const defaultDark: HeadlampTheme = {
  name: 'Headlamp Classic Dark',
  base: 'dark',
  primary: '#ffffff',
  secondary: '#1b1a19',
  text: { primary: '#faf9f8' },
  link: { color: '#6CB6F2' },
  background: {
    default: '#292827',
    surface: '#313131',
    muted: '#333333',
  },
  sidebar: {
    background: '#252423',
    color: '#cdcdcd',
    selectedBackground: '#f2e600',
    selectedColor: '#f2e600',
    actionBackground: '#1b1a19',
  },
  navbar: {
    background: '#252423',
    color: '#faf9f8',
  },
  fontFamily: ['Roboto', 'sans-serif'],
  radius: 6,
  buttonTextTransform: 'none',
};
