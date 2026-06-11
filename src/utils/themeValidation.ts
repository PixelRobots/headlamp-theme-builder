import type { HeadlampTheme } from '../types/theme';

type RawTheme = Partial<HeadlampTheme> & Pick<HeadlampTheme, 'name' | 'base'>;

export interface ThemeValidationResult {
  errors: string[];
  warnings: string[];
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
