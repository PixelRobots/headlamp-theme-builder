import type { HeadlampTheme } from '../types/theme';
import { completeTheme } from '../defaults/defaultTheme';

interface MuiThemeSnapshot {
  palette: {
    mode: 'light' | 'dark';
    primary: {
      main: string;
      contrastText: string;
    };
    secondary?: {
      main: string;
    };
    text: {
      primary: string;
      secondary: string;
    };
    background: {
      default: string;
      paper: string;
    };
  };
  typography: {
    fontFamily?: string;
  };
  shape: {
    borderRadius: number | string;
  };
}

function toHexByte(value: number): string {
  return Math.round(value).toString(16).padStart(2, '0');
}

function normalizeImportedColour(value: string): string {
  const trimmed = value.trim();
  if (/^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(trimmed)) {
    return trimmed;
  }

  const rgbMatch = trimmed.match(/^rgba?\((.+)\)$/i);
  if (!rgbMatch) {
    return trimmed;
  }

  const channels = rgbMatch[1]
    .replace(/\s*\/\s*/, ' ')
    .split(/[,\s]+/)
    .filter(Boolean)
    .slice(0, 3)
    .map(channel => Number.parseFloat(channel));

  if (channels.length !== 3 || channels.some(channel => !Number.isFinite(channel))) {
    return trimmed;
  }

  const [red, green, blue] = channels.map(channel => Math.max(0, Math.min(255, channel)));
  return `#${toHexByte(red)}${toHexByte(green)}${toHexByte(blue)}`;
}

/**
 * Convert the live MUI theme from useTheme() back into a HeadlampTheme.
 * We can only read what MUI exposes — sidebar/navbar/terminal are not
 * stored in MUI, so we fall back to the defaults for those.
 */
export function muiToHeadlampTheme(mui: MuiThemeSnapshot, name: string): HeadlampTheme {
  const base = mui.palette.mode;

  const partial: Partial<HeadlampTheme> & Pick<HeadlampTheme, 'name' | 'base'> = {
    name,
    base,
    primary: normalizeImportedColour(mui.palette.primary.main),
    secondary: normalizeImportedColour(mui.palette.secondary?.main ?? mui.palette.primary.main),
    text: { primary: normalizeImportedColour(mui.palette.text.primary) },
    link: { color: normalizeImportedColour(mui.palette.primary.main) },
    background: {
      default: normalizeImportedColour(mui.palette.background.default),
      surface: normalizeImportedColour(mui.palette.background.paper),
      muted: normalizeImportedColour(mui.palette.background.paper),
    },
    // sidebar and navbar are not in MUI palette — use sensible derived values
    sidebar: {
      background: normalizeImportedColour(mui.palette.background.paper),
      color: normalizeImportedColour(mui.palette.text.secondary),
      selectedBackground: normalizeImportedColour(mui.palette.primary.main),
      selectedColor: normalizeImportedColour(mui.palette.primary.main),
      actionBackground: normalizeImportedColour(mui.palette.primary.main),
    },
    navbar: {
      background: normalizeImportedColour(mui.palette.background.paper),
      color: normalizeImportedColour(mui.palette.text.primary),
      searchHint: normalizeImportedColour(mui.palette.text.secondary),
    },
    fontFamily: [mui.typography.fontFamily ?? 'Roboto, sans-serif'],
    radius: typeof mui.shape.borderRadius === 'number' ? mui.shape.borderRadius : 4,
  };

  return completeTheme(partial as HeadlampTheme);
}
