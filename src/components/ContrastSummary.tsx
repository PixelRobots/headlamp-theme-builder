import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { contrastRatio } from '../utils/contrast';
import type { HeadlampTheme } from '../types/theme';

interface ContrastPair {
  label: string;
  foreground: string;
  background: string;
}

function getContrastPairs(theme: HeadlampTheme): ContrastPair[] {
  return [
    { label: 'Body text / page bg', foreground: theme.text.primary, background: theme.background.default },
    { label: 'Body text / surface', foreground: theme.text.primary, background: theme.background.surface },
    { label: 'Link / page bg', foreground: theme.link.color, background: theme.background.default },
    { label: 'Navbar text / navbar bg', foreground: theme.navbar.color, background: theme.navbar.background },
    { label: 'Sidebar text / sidebar bg', foreground: theme.sidebar.color, background: theme.sidebar.background },
    { label: 'Nested selected / sidebar bg', foreground: theme.sidebar.selectedColor, background: theme.sidebar.background },
    { label: 'Terminal text / terminal bg', foreground: theme.terminal?.foreground ?? theme.text.primary, background: theme.terminal?.background ?? theme.background.default },
  ];
}

function wcagLabel(ratio: number | null): { label: string; pass: boolean; color: string } {
  if (ratio === null) return { label: '?', pass: false, color: 'text.disabled' };
  if (ratio >= 7) return { label: 'AAA', pass: true, color: 'success.main' };
  if (ratio >= 4.5) return { label: 'AA', pass: true, color: 'success.main' };
  if (ratio >= 3) return { label: 'AA Large', pass: false, color: 'warning.main' };
  return { label: 'Fail', pass: false, color: 'error.main' };
}

interface Props {
  theme: HeadlampTheme;
}

export default function ContrastSummary({ theme }: Props) {
  const pairs = getContrastPairs(theme);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
      <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.64rem', mb: 0.5 }}>
        WCAG 2.1 normal text: AA ≥ 4.5, AAA ≥ 7
      </Typography>
      {pairs.map(pair => {
        const ratio = contrastRatio(pair.foreground, pair.background);
        const { label, color } = wcagLabel(ratio);
        return (
          <Box
            key={pair.label}
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 1,
            }}
          >
            <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.7rem', flex: 1 }}>
              {pair.label}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, flexShrink: 0 }}>
              <Typography variant="caption" sx={{ color, fontWeight: 700, fontSize: '0.7rem', minWidth: 52, textAlign: 'right' }}>
                {label}
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.disabled', fontSize: '0.65rem', minWidth: 36, textAlign: 'right' }}>
                {ratio !== null ? ratio.toFixed(2) : '—'}:1
              </Typography>
              <Box
                sx={{
                  width: 28,
                  height: 16,
                  borderRadius: 0.5,
                  border: '1px solid',
                  borderColor: 'divider',
                  background: `linear-gradient(90deg, ${pair.foreground} 50%, ${pair.background} 50%)`,
                  flexShrink: 0,
                }}
              />
            </Box>
          </Box>
        );
      })}
    </Box>
  );
}
