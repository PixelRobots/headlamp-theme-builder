import React, { useState } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import DownloadIcon from '@mui/icons-material/Download';
import ThemePanel from './components/ThemePanel';
import Preview from './components/Preview';
import { defaultLight, defaultDark } from './defaults/defaultTheme';
import { downloadPlugin } from './utils/generateCode';
import type { HeadlampTheme } from './types/theme';

const appTheme = createTheme({ palette: { mode: 'dark' } });

export default function App() {
  const [lightTheme, setLightTheme] = useState<HeadlampTheme>(defaultLight);
  const [darkTheme, setDarkTheme] = useState<HeadlampTheme>(defaultDark);
  const [active, setActive] = useState<'light' | 'dark'>('light');

  const currentTheme = active === 'light' ? lightTheme : darkTheme;
  const setCurrentTheme = active === 'light' ? setLightTheme : setDarkTheme;

  return (
    <ThemeProvider theme={appTheme}>
      <CssBaseline />
      <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh', bgcolor: '#111' }}>
        {/* Top bar */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            px: 3,
            py: 1.5,
            bgcolor: '#1a1a2e',
            borderBottom: '1px solid #333',
            gap: 2,
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: 700, color: '#fff', flex: 1 }}>
            Headlamp Theme Builder
          </Typography>
          <Button
            variant={active === 'light' ? 'contained' : 'outlined'}
            size="small"
            onClick={() => setActive('light')}
          >
            Light
          </Button>
          <Button
            variant={active === 'dark' ? 'contained' : 'outlined'}
            size="small"
            onClick={() => setActive('dark')}
          >
            Dark
          </Button>
          <Button
            variant="contained"
            color="success"
            size="small"
            startIcon={<DownloadIcon />}
            onClick={() => downloadPlugin([lightTheme, darkTheme])}
          >
            Download plugin
          </Button>
        </Box>

        {/* Main split */}
        <Box sx={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
          {/* Left: controls */}
          <Box
            sx={{
              width: 300,
              flexShrink: 0,
              bgcolor: '#1a1a2e',
              borderRight: '1px solid #333',
              overflow: 'auto',
            }}
          >
            <ThemePanel theme={currentTheme} onChange={setCurrentTheme} />
          </Box>

          {/* Right: live preview */}
          <Box sx={{ flex: 1, p: 3, overflow: 'hidden', display: 'flex', flexDirection: 'column', gap: 1 }}>
            <Typography variant="caption" sx={{ color: '#aaa', letterSpacing: 1, textTransform: 'uppercase' }}>
              Live preview — {active} theme
            </Typography>
            <Box sx={{ flex: 1, overflow: 'hidden' }}>
              <Preview theme={currentTheme} />
            </Box>
          </Box>
        </Box>
      </Box>
    </ThemeProvider>
  );
}
