import type { HeadlampTheme } from '../types/theme';

export const defaultLight: HeadlampTheme = {
  name: 'My Light Theme',
  base: 'light',
  primary: '#51B148',
  secondary: '#1B1A32',
  text: { primary: '#1B1A32' },
  link: { color: '#3A9A33' },
  background: {
    default: '#FFFFFF',
    surface: '#FFFFFF',
    muted: '#EBFFF3',
  },
  sidebar: {
    background: '#1B1A32',
    color: '#D3D3D3',
    selectedBackground: '#51B148',
    selectedColor: '#FFFFFF',
    actionBackground: '#51B148',
  },
  navbar: {
    background: '#1B1A32',
    color: '#FFFFFF',
  },
  fontFamily: ['Roboto', 'sans-serif'],
  radius: 8,
  buttonTextTransform: 'none',
};

export const defaultDark: HeadlampTheme = {
  name: 'My Dark Theme',
  base: 'dark',
  primary: '#51B148',
  secondary: '#C0FFD9',
  text: { primary: '#FFFFFF' },
  link: { color: '#C0FFD9' },
  background: {
    default: '#13132A',
    surface: '#1B1A32',
    muted: '#222245',
  },
  sidebar: {
    background: '#13132A',
    color: '#D3D3D3',
    selectedBackground: '#51B148',
    selectedColor: '#FFFFFF',
    actionBackground: '#51B148',
  },
  navbar: {
    background: '#1B1A32',
    color: '#FFFFFF',
  },
  fontFamily: ['Roboto', 'sans-serif'],
  radius: 8,
  buttonTextTransform: 'none',
};
