import type { HeadlampTheme } from '../types/theme';

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function mergeDeep<T>(base: T, override: unknown): T {
  if (!isRecord(base) || !isRecord(override)) {
    return (override ?? base) as T;
  }

  const merged: Record<string, unknown> = { ...base };
  Object.entries(override).forEach(([key, value]) => {
    const baseValue = merged[key];
    merged[key] = isRecord(baseValue) && isRecord(value) ? mergeDeep(baseValue, value) : value;
  });

  return merged as T;
}

/**
 * Headlamp built-in "Light" theme
 * Matches frontend/src/components/App/defaultAppThemes.ts — lightTheme
 */
export const defaultLight: HeadlampTheme = {
  name: 'Light',
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
    searchHint: '#605e5c',
  },
  terminal: {
    background: '#ffffff',
    foreground: '#242424',
    cursor: '#414141',
    ansi: {
      black: '#2e3436',
      red: '#cc0000',
      green: '#4e9a06',
      yellow: '#c4a000',
      blue: '#3465a4',
      magenta: '#75507b',
      cyan: '#06989a',
      white: '#888a85',
      brightBlack: '#555753',
      brightRed: '#ef2929',
      brightGreen: '#73d216',
      brightYellow: '#c4a000',
      brightBlue: '#729fcf',
      brightMagenta: '#ad7fa8',
      brightCyan: '#34e2e2',
      brightWhite: '#2e3436',
    },
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
  name: 'Dark',
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
    searchHint: '#cdcdcd',
  },
  terminal: {
    background: '#1e1e1e',
    foreground: '#f5f5f5',
    cursor: '#f2e600',
    ansi: {
      black: '#000000',
      red: '#ff6e67',
      green: '#5af78e',
      yellow: '#f3f99d',
      blue: '#57c7ff',
      magenta: '#ff77ff',
      cyan: '#9aedfe',
      white: '#eff0eb',
      brightBlack: '#686868',
      brightRed: '#ff5c57',
      brightGreen: '#5af78e',
      brightYellow: '#f3f99d',
      brightBlue: '#57c7ff',
      brightMagenta: '#ff6ac1',
      brightCyan: '#9aedfe',
      brightWhite: '#ffffff',
    },
  },
  fontFamily: ['Roboto', 'sans-serif'],
  radius: 6,
  buttonTextTransform: 'none',
};

export function completeTheme(theme: HeadlampTheme): HeadlampTheme {
  const baseTheme = theme.base === 'dark' ? defaultDark : defaultLight;
  return mergeDeep(baseTheme, theme);
}
