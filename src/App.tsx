import React, { useState } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import DownloadIcon from '@mui/icons-material/Download';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import ThemePanel from './components/ThemePanel';
import Preview from './components/Preview';
import HowToUseDialog from './components/HowToUseDialog';
import { defaultLight, defaultDark } from './defaults/defaultTheme';
import { downloadPlugin } from './utils/generateCode';
import type { HeadlampTheme } from './types/theme';

/** App shell styled after Headlamp classic — dark navy + #0078d4 blue */
const appTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: { main: '#0078d4' },
    background: {
      default: '#0d1117',
      paper: '#161b22',
    },
  },
  typography: {
    fontFamily: 'Roboto, sans-serif',
  },
});

const HEADER_BG = '#161b22';
const PANEL_BG = '#0d1117';
const BORDER = 'rgba(255,255,255,0.08)';

export default function App() {
  const [lightTheme, setLightTheme] = useState<HeadlampTheme>(defaultLight);
  const [darkTheme, setDarkTheme] = useState<HeadlampTheme>(defaultDark);
  const [active, setActive] = useState<'light' | 'dark'>('light');
  const [logoDataUrl, setLogoDataUrl] = useState<string | null>(null);
  const [helpOpen, setHelpOpen] = useState(false);

  const currentTheme = active === 'light' ? lightTheme : darkTheme;
  const setCurrentTheme = active === 'light' ? setLightTheme : setDarkTheme;

  return (
    <ThemeProvider theme={appTheme}>
      <CssBaseline />
      <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh', bgcolor: PANEL_BG }}>

        {/* Top bar — Headlamp-style header */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            px: 2,
            py: 1,
            bgcolor: HEADER_BG,
            borderBottom: `1px solid ${BORDER}`,
            gap: 1,
            flexShrink: 0,
          }}
        >
          {/* Logo area */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mr: 2 }}>
            <Box
              sx={{
                width: 28,
                height: 28,
                borderRadius: '6px',
                bgcolor: '#0078d4',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 900,
                fontSize: '0.75rem',
                color: '#fff',
                letterSpacing: '-0.5px',
              }}
            >
              HL
            </Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#fff', fontSize: '0.95rem' }}>
              Theme Builder
            </Typography>
          </Box>

          {/* Light / Dark toggle */}
          <Box
            sx={{
              display: 'flex',
              bgcolor: 'rgba(255,255,255,0.06)',
              borderRadius: 1,
              border: `1px solid ${BORDER}`,
              overflow: 'hidden',
            }}
          >
            {(['light', 'dark'] as const).map(mode => (
              <Button
                key={mode}
                size="small"
                onClick={() => setActive(mode)}
                sx={{
                  px: 2,
                  py: 0.5,
                  fontSize: '0.78rem',
                  textTransform: 'capitalize',
                  borderRadius: 0,
                  bgcolor: active === mode ? '#0078d4' : 'transparent',
                  color: active === mode ? '#fff' : 'rgba(255,255,255,0.55)',
                  '&:hover': { bgcolor: active === mode ? '#0078d4' : 'rgba(255,255,255,0.1)' },
                  minWidth: 60,
                }}
              >
                {mode}
              </Button>
            ))}
          </Box>

          <Box sx={{ flex: 1 }} />

          <IconButton
            size="small"
            onClick={() => setHelpOpen(true)}
            sx={{ color: 'rgba(255,255,255,0.55)', '&:hover': { color: '#fff' } }}
            title="How to use"
          >
            <HelpOutlineIcon fontSize="small" />
          </IconButton>

          <Button
            variant="contained"
            size="small"
            startIcon={<DownloadIcon />}
            onClick={() => downloadPlugin([lightTheme, darkTheme])}
            sx={{ bgcolor: '#0078d4', '&:hover': { bgcolor: '#106ebe' }, fontWeight: 600, fontSize: '0.78rem' }}
          >
            Download plugin
          </Button>
        </Box>

        {/* Main split */}
        <Box sx={{ display: 'flex', flex: 1, overflow: 'hidden' }}>

          {/* Left: controls */}
          <Box
            sx={{
              width: 280,
              flexShrink: 0,
              bgcolor: HEADER_BG,
              borderRight: `1px solid ${BORDER}`,
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <ThemePanel
              theme={currentTheme}
              onChange={setCurrentTheme}
              logoDataUrl={logoDataUrl}
              onLogoChange={setLogoDataUrl}
            />
          </Box>

          {/* Right: live preview */}
          <Box
            sx={{
              flex: 1,
              p: 3,
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              gap: 1,
              bgcolor: PANEL_BG,
            }}
          >
            <Typography
              variant="caption"
              sx={{ color: 'rgba(255,255,255,0.35)', letterSpacing: '0.1em', textTransform: 'uppercase', fontSize: '0.68rem' }}
            >
              Live preview — {active} theme
            </Typography>
            <Box sx={{ flex: 1, overflow: 'hidden' }}>
              <Preview theme={currentTheme} logoDataUrl={logoDataUrl} />
            </Box>
          </Box>
        </Box>

        <HowToUseDialog open={helpOpen} onClose={() => setHelpOpen(false)} />
      </Box>
    </ThemeProvider>
  );
}
