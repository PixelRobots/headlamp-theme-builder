import type { HeadlampTheme } from '../types/theme';
import { contrastRatio } from './contrast';

type RawTheme = Partial<HeadlampTheme> & Pick<HeadlampTheme, 'name' | 'base'>;

export interface ThemeValidationResult {
  errors: string[];
  warnings: string[];
}

interface ContrastCheck {
  foreground: string | undefined;
  background: string | undefined;
  label: string;
  minimum?: number;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function getPath(value: unknown, path: string): unknown {
  return path.split('.').reduce<unknown>((current, key) => {
    if (!isRecord(current)) {
      return undefined;
    }

    return current[key];
  }, value);
}

function isHexColour(value: unknown): value is string {
  return typeof value === 'string' && /^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(value);
}

const REQUIRED_STRING_PATHS = [
  'name',
  'primary',
  'secondary',
  'text.primary',
  'link.color',
  'background.default',
  'background.surface',
  'background.muted',
  'sidebar.background',
  'sidebar.color',
  'sidebar.selectedBackground',
  'sidebar.selectedColor',
  'sidebar.actionBackground',
  'navbar.background',
  'navbar.color',
] as const;

const OPTIONAL_HEX_PATHS = [
  'navbar.searchHint',
  'terminal.background',
  'terminal.foreground',
  'terminal.cursor',
  'terminal.ansi.black',
  'terminal.ansi.red',
  'terminal.ansi.green',
  'terminal.ansi.yellow',
  'terminal.ansi.blue',
  'terminal.ansi.magenta',
  'terminal.ansi.cyan',
  'terminal.ansi.white',
  'terminal.ansi.brightBlack',
  'terminal.ansi.brightRed',
  'terminal.ansi.brightGreen',
  'terminal.ansi.brightYellow',
  'terminal.ansi.brightBlue',
  'terminal.ansi.brightMagenta',
  'terminal.ansi.brightCyan',
  'terminal.ansi.brightWhite',
] as const;

const TERMINAL_ANSI_LABELS: Record<string, string> = {
  black: 'ANSI black',
  red: 'ANSI red',
  green: 'ANSI green',
  yellow: 'ANSI yellow',
  blue: 'ANSI blue',
  magenta: 'ANSI magenta',
  cyan: 'ANSI cyan',
  white: 'ANSI white',
  brightBlack: 'bright ANSI black',
  brightRed: 'bright ANSI red',
  brightGreen: 'bright ANSI green',
  brightYellow: 'bright ANSI yellow',
  brightBlue: 'bright ANSI blue',
  brightMagenta: 'bright ANSI magenta',
  brightCyan: 'bright ANSI cyan',
  brightWhite: 'bright ANSI white',
};

export function validateTheme(theme: unknown, label = 'Theme'): ThemeValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!isRecord(theme)) {
    return { errors: [`${label} must be an object.`], warnings };
  }

  if (theme.base !== 'light' && theme.base !== 'dark') {
    errors.push(`${label}.base must be "light" or "dark".`);
  }

  REQUIRED_STRING_PATHS.forEach(path => {
    const value = getPath(theme, path);
    if (typeof value !== 'string' || value.trim() === '') {
      errors.push(`${label}.${path} is required.`);
      return;
    }

    if (path !== 'name' && !isHexColour(value)) {
      errors.push(`${label}.${path} must be a hex colour.`);
    }
  });

  OPTIONAL_HEX_PATHS.forEach(path => {
    const value = getPath(theme, path);
    if (value !== undefined && !isHexColour(value)) {
      errors.push(`${label}.${path} must be a hex colour when set.`);
    }
  });

  const radius = getPath(theme, 'radius');
  if (radius !== undefined && (typeof radius !== 'number' || radius < 0 || radius > 24)) {
    warnings.push(`${label}.radius should be a number from 0 to 24.`);
  }

  const buttonTextTransform = getPath(theme, 'buttonTextTransform');
  if (
    buttonTextTransform !== undefined &&
    buttonTextTransform !== 'none' &&
    buttonTextTransform !== 'uppercase'
  ) {
    warnings.push(`${label}.buttonTextTransform should be "none" or "uppercase".`);
  }

  const fontFamily = getPath(theme, 'fontFamily');
  if (
    fontFamily !== undefined &&
    (!Array.isArray(fontFamily) || fontFamily.some(item => typeof item !== 'string'))
  ) {
    warnings.push(`${label}.fontFamily should be an array of font family strings.`);
  }

  return { errors, warnings };
}

export function assertValidThemes(themes: RawTheme[]): void {
  const errors = themes.flatMap((theme, index) => validateTheme(theme, `themes[${index}]`).errors);
  if (errors.length > 0) {
    throw new Error(`Theme JSON validation failed:\n${errors.slice(0, 8).join('\n')}`);
  }
}

function addContrastWarnings(theme: HeadlampTheme, label: string, warnings: string[]) {
  const checks: ContrastCheck[] = [
    {
      foreground: theme.text.primary,
      background: theme.background.default,
      label: 'body text against page background',
    },
    {
      foreground: theme.link.color,
      background: theme.background.default,
      label: 'link colour against page background',
    },
    {
      foreground: theme.navbar.color,
      background: theme.navbar.background,
      label: 'navbar text against navbar background',
    },
    {
      foreground: theme.navbar.searchHint,
      background: theme.navbar.background,
      label: 'navbar search hint against navbar background',
      minimum: 3,
    },
    {
      foreground: theme.sidebar.color,
      background: theme.sidebar.background,
      label: 'sidebar text against sidebar background',
    },
    {
      foreground: theme.sidebar.selectedColor,
      background: theme.sidebar.background,
      label: 'nested selected sidebar text against sidebar background',
    },
    {
      foreground: theme.terminal?.foreground,
      background: theme.terminal?.background,
      label: 'terminal text against terminal background',
    },
    {
      foreground: theme.terminal?.cursor,
      background: theme.terminal?.background,
      label: 'terminal cursor against terminal background',
      minimum: 3,
    },
  ];

  checks.forEach(check => {
    if (!check.foreground || !check.background) {
      return;
    }

    const ratio = contrastRatio(check.foreground, check.background);
    const minimum = check.minimum ?? 4.5;
    if (ratio !== null && ratio < minimum) {
      warnings.push(
        `${label}: ${check.label} is ${ratio.toFixed(1)}:1; recommended minimum is ${minimum}:1.`
      );
    }
  });

  const terminalBackground = theme.terminal?.background;
  const terminalAnsi = theme.terminal?.ansi;
  if (!terminalBackground || !terminalAnsi) {
    return;
  }

  Object.entries(TERMINAL_ANSI_LABELS).forEach(([key, ansiLabel]) => {
    const value = terminalAnsi[key as keyof typeof terminalAnsi];
    if (!value) {
      return;
    }

    const ratio = contrastRatio(value, terminalBackground);
    if (ratio !== null && ratio < 3) {
      warnings.push(
        `${label}: ${ansiLabel} against terminal background is ${ratio.toFixed(1)}:1; recommended minimum is 3:1.`
      );
    }
  });
}

export function validateThemesForUse(themes: HeadlampTheme[]): ThemeValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  themes.forEach((theme, index) => {
    const label = `${theme.name || `Theme ${index + 1}`} (${theme.base})`;
    const result = validateTheme(theme, label);
    errors.push(...result.errors);
    warnings.push(...result.warnings);
    addContrastWarnings(theme, label, warnings);
  });

  return { errors, warnings };
}
