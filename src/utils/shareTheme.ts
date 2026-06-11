import type { HeadlampTheme } from '../types/theme';

export interface SharedThemeState {
  version: 1;
  active: 'light' | 'dark';
  themes: HeadlampTheme[];
}

export function encodeSharedThemeState(state: Omit<SharedThemeState, 'version'>): string {
  return encodeURIComponent(JSON.stringify({ version: 1, ...state }));
}

export function decodeSharedThemeState(value: string): SharedThemeState {
  const data = JSON.parse(decodeURIComponent(value)) as Partial<SharedThemeState>;

  if (data.version !== 1) {
    throw new Error('Shared theme link uses an unsupported version.');
  }

  if (data.active !== 'light' && data.active !== 'dark') {
    throw new Error('Shared theme link is missing the active theme mode.');
  }

  if (!Array.isArray(data.themes) || data.themes.length < 1) {
    throw new Error('Shared theme link does not contain any themes.');
  }

  return {
    version: 1,
    active: data.active,
    themes: data.themes,
  };
}
