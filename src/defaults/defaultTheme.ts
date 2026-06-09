import type { HeadlampTheme } from '../types/theme';

/**
 * Headlamp Classic Light — mirrors the out-of-the-box Headlamp light defaults.
 * Primary: #0078d4 (Microsoft/Fluent blue)
 * Sidebar/navbar: white, grey selected state
 */
export const defaultLight: HeadlampTheme = {
  name: 'My Light Theme',
  base: 'light',
  primary: '#0078d4',
  secondary: '#ff4081',
  text: { primary: 'rgba(0,0,0,0.87)' },
  link: { color: '#0078d4' },
  background: {
    default: '#fafafa',
    surface: '#ffffff',
    muted: '#f3f2f1',
  },
  sidebar: {
    background: '#ffffff',
    color: '#333333',
    selectedBackground: '#59636e',
    selectedColor: '#ffffff',
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
 * Headlamp Classic Dark — mirrors the out-of-the-box Headlamp dark defaults.
 * Primary: #4B99EE (lighter blue for dark backgrounds)
 * Sidebar/navbar: #1f1f1f
 */
export const defaultDark: HeadlampTheme = {
  name: 'My Dark Theme',
  base: 'dark',
  primary: '#4B99EE',
  secondary: '#ff4081',
  text: { primary: '#ffffff' },
  link: { color: '#4B99EE' },
  background: {
    default: '#121212',
    surface: '#1e1e1e',
    muted: '#2d2d2d',
  },
  sidebar: {
    background: '#1f1f1f',
    color: 'rgba(255,255,255,0.7)',
    selectedBackground: '#4B99EE',
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
