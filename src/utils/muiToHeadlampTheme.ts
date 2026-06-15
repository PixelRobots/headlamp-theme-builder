import type { Theme } from '@mui/material/styles';
import type { HeadlampTheme } from '../types/theme';
import { completeTheme } from '../defaults/defaultTheme';

/**
 * Convert the live MUI theme from useTheme() back into a HeadlampTheme.
 * We can only read what MUI exposes — sidebar/navbar/terminal are not
 * stored in MUI, so we fall back to the defaults for those.
 */
export function muiToHeadlampTheme(mui: Theme, name: string): HeadlampTheme {
  const base = mui.palette.mode;

  const partial: Partial<HeadlampTheme> & Pick<HeadlampTheme, 'name' | 'base'> = {
    name,
    base,
    primary: mui.palette.primary.main,
    secondary: mui.palette.secondary?.main ?? mui.palette.primary.main,
    text: { primary: mui.palette.text.primary },
    link: { color: mui.palette.primary.main },
    background: {
      default: mui.palette.background.default,
      surface: mui.palette.background.paper,
      muted: mui.palette.background.paper,
    },
    // sidebar and navbar are not in MUI palette — use sensible derived values
    sidebar: {
      background: mui.palette.background.paper,
      color: mui.palette.text.secondary,
      selectedBackground: mui.palette.primary.main,
      selectedColor: mui.palette.primary.contrastText,
      actionBackground: mui.palette.primary.main,
    },
    navbar: {
      background: mui.palette.background.paper,
      color: mui.palette.text.primary,
      searchHint: mui.palette.text.secondary,
    },
    fontFamily: [mui.typography.fontFamily ?? 'Roboto, sans-serif'],
    radius: typeof mui.shape.borderRadius === 'number' ? mui.shape.borderRadius : 4,
  };

  return completeTheme(partial as HeadlampTheme);
}
