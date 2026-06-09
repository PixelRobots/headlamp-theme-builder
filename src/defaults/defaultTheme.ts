import type { HeadlampTheme } from '../types/theme';

/**
 * Headlamp built-in "Light" theme
 * Matches frontend/src/components/App/defaultAppThemes.ts — lightTheme
 */
export const defaultLight: HeadlampTheme = {
  name: 'My Light Theme',
  base: 'light',
  primary: '#414141',
  secondary: '#eff2f5',
  text: { primary: '#44444f' },
  link: { color: '#0072c9' },
  background: {
    default: '#ffffff',
    surface: '#ffffff',
    muted: '#f5f5f5',
  },
  sidebar: {
    background: '#f0f0f0',
    color: '#605e5c',
    selectedBackground: '#f2e600',
    selectedColor: '#292827',
    actionBackground: '#414141',
  },
  navbar: {
    background: '#f0f0f0',
    color: '#292827',
  },
  fontFamily: ['Roboto', 'sans-serif'],
  radius: 6,
  buttonTextTransform: 'none',
};

/**
 * Headlamp built-in "Dark" theme
 * Matches frontend/src/components/App/defaultAppThemes.ts — darkTheme
 */
export const defaultDark: HeadlampTheme = {
  name: 'My Dark Theme',
  base: 'dark',
  primary: '#ffffff',
  secondary: '#1b1a19',
  text: { primary: '#faf9f8' },
  link: { color: '#6fb3f2' },
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
