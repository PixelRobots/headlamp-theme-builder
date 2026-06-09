import { createTheme } from '@mui/material/styles';
import type { HeadlampTheme } from '../types/theme';

/**
 * Convert a HeadlampTheme object into a MUI theme so the Preview
 * component renders with the correct colours.
 */
export function themeToMui(t: HeadlampTheme) {
  return createTheme({
    palette: {
      mode: t.base,
      primary: { main: t.primary },
      secondary: { main: t.secondary },
      text: { primary: t.text.primary },
      background: {
        default: t.background.default,
        paper: t.background.surface,
      },
    },
    typography: {
      fontFamily: t.fontFamily?.join(', ') ?? 'Roboto, sans-serif',
    },
    shape: {
      borderRadius: t.radius ?? 4,
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            textTransform: t.buttonTextTransform ?? 'uppercase',
          },
        },
      },
    },
  });
}
