import { completeTheme, defaultDark, defaultLight } from '../defaults/defaultTheme';
import type { HeadlampTheme } from '../types/theme';

export interface SharedThemeState {
  version: 2;
  active: 'light' | 'dark';
  themes: HeadlampTheme[];
}

const SHARE_FIELDS = [
  ['n', 'name'],
  ['b', 'base'],
  ['p', 'primary'],
  ['s', 'secondary'],
  ['tp', 'text.primary'],
  ['lc', 'link.color'],
  ['bd', 'background.default'],
  ['bs', 'background.surface'],
  ['bm', 'background.muted'],
  ['sb', 'sidebar.background'],
  ['sc', 'sidebar.color'],
  ['ssb', 'sidebar.selectedBackground'],
  ['ssc', 'sidebar.selectedColor'],
  ['sa', 'sidebar.actionBackground'],
  ['nb', 'navbar.background'],
  ['nc', 'navbar.color'],
  ['nh', 'navbar.searchHint'],
  ['tb', 'terminal.background'],
  ['tf', 'terminal.foreground'],
  ['tc', 'terminal.cursor'],
  ['tak', 'terminal.ansi.black'],
  ['tar', 'terminal.ansi.red'],
  ['tag', 'terminal.ansi.green'],
  ['tay', 'terminal.ansi.yellow'],
  ['tab', 'terminal.ansi.blue'],
  ['tam', 'terminal.ansi.magenta'],
  ['tac', 'terminal.ansi.cyan'],
  ['taw', 'terminal.ansi.white'],
  ['tabk', 'terminal.ansi.brightBlack'],
  ['tabr', 'terminal.ansi.brightRed'],
  ['tabg', 'terminal.ansi.brightGreen'],
  ['taby', 'terminal.ansi.brightYellow'],
  ['tabb', 'terminal.ansi.brightBlue'],
  ['tabm', 'terminal.ansi.brightMagenta'],
  ['tabc', 'terminal.ansi.brightCyan'],
  ['tabw', 'terminal.ansi.brightWhite'],
  ['f', 'fontFamily'],
  ['q', 'radius'],
  ['u', 'buttonTextTransform'],
] as const;

type ShareField = (typeof SHARE_FIELDS)[number];
type ShareFieldKey = ShareField[0];
type ShareThemeDelta = Record<ShareFieldKey, unknown> & { b: 'light' | 'dark' };

interface CompactSharedThemeState {
  v: 2;
  a: 'light' | 'dark';
  t: ShareThemeDelta[];
}

function getPath(value: unknown, path: string): unknown {
  return path.split('.').reduce<unknown>((current, key) => {
    if (typeof current !== 'object' || current === null || Array.isArray(current)) {
      return undefined;
    }

    return (current as Record<string, unknown>)[key];
  }, value);
}

function setPath(target: Record<string, unknown>, path: string, value: unknown) {
  const keys = path.split('.');
  let current = target;

  keys.slice(0, -1).forEach(key => {
    if (typeof current[key] !== 'object' || current[key] === null || Array.isArray(current[key])) {
      current[key] = {};
    }
    current = current[key] as Record<string, unknown>;
  });

  current[keys[keys.length - 1]] = value;
}

function valuesEqual(left: unknown, right: unknown) {
  return JSON.stringify(left) === JSON.stringify(right);
}

function baseThemeFor(theme: HeadlampTheme) {
  return theme.base === 'dark' ? defaultDark : defaultLight;
}

function toShareDelta(theme: HeadlampTheme): ShareThemeDelta {
  const baseTheme = baseThemeFor(theme);
  const delta = { b: theme.base } as ShareThemeDelta;

  SHARE_FIELDS.forEach(([key, path]) => {
    const value = getPath(theme, path);
    if (key === 'b' || valuesEqual(value, getPath(baseTheme, path))) {
      return;
    }
    delta[key] = value;
  });

  return delta;
}

function fromShareDelta(delta: ShareThemeDelta): HeadlampTheme {
  const partialTheme: Record<string, unknown> = { base: delta.b };

  SHARE_FIELDS.forEach(([key, path]) => {
    if (key === 'b' || delta[key] === undefined) {
      return;
    }
    setPath(partialTheme, path, delta[key]);
  });

  return completeTheme(partialTheme as unknown as HeadlampTheme);
}

function encodeBase64Url(value: string) {
  const bytes = new TextEncoder().encode(value);
  let binary = '';
  bytes.forEach(byte => {
    binary += String.fromCharCode(byte);
  });

  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

function decodeBase64Url(value: string) {
  const padded = value.replace(/-/g, '+').replace(/_/g, '/').padEnd(
    Math.ceil(value.length / 4) * 4,
    '='
  );
  const binary = atob(padded);
  const bytes = Uint8Array.from(binary, char => char.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

export function encodeSharedThemeState(state: Omit<SharedThemeState, 'version'>): string {
  return encodeBase64Url(
    JSON.stringify({
      v: 2,
      a: state.active,
      t: state.themes.map(toShareDelta),
    } satisfies CompactSharedThemeState)
  );
}

export function decodeSharedThemeState(value: string): SharedThemeState {
  const data = JSON.parse(decodeBase64Url(value)) as Partial<CompactSharedThemeState>;

  if (data.v !== 2) {
    throw new Error('Shared theme link uses an unsupported version.');
  }

  if (data.a !== 'light' && data.a !== 'dark') {
    throw new Error('Shared theme link is missing the active theme mode.');
  }

  if (!Array.isArray(data.t) || data.t.length < 1) {
    throw new Error('Shared theme link does not contain any themes.');
  }

  return {
    version: 2,
    active: data.a,
    themes: data.t.map(fromShareDelta),
  };
}
