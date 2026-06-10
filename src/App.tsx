import { useEffect, useRef, useState, type ChangeEvent } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import GlobalStyles from '@mui/material/GlobalStyles';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import DownloadIcon from '@mui/icons-material/Download';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import SaveAltIcon from '@mui/icons-material/SaveAlt';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import DeleteIcon from '@mui/icons-material/Delete';
import ThemePanel from './components/ThemePanel';
import Preview from './components/Preview';
import HowToUseDialog from './components/HowToUseDialog';
import WelcomeDialog from './components/WelcomeDialog';
import { completeTheme, defaultLight, defaultDark } from './defaults/defaultTheme';
import { downloadPlugin, downloadThemeJson } from './utils/generateCode';
import type { HeadlampTheme } from './types/theme';

// headlamp.dev colour palette
const YELLOW = '#f2e600';
const YELLOW_DARK = '#d4ca00';
const HEADER_BG = '#252422';   // headlamp.dev navbar / dark app sidebar
const PANEL_BG = '#1a1a18';    // headlamp.dev hero background
const BORDER = 'rgba(255,255,255,0.06)';
const WELCOME_DISMISSED_KEY = 'headlamp-theme-builder-welcome-dismissed';
const THEME_BUILDER_LOGO_URL = `${import.meta.env.BASE_URL}theme-builder-logo.svg`;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isTheme(value: unknown): value is HeadlampTheme {
  if (!isRecord(value)) {
    return false;
  }

  return (
    typeof value.name === 'string' &&
    (value.base === 'light' || value.base === 'dark') &&
    typeof value.primary === 'string' &&
    typeof value.secondary === 'string' &&
    isRecord(value.text) &&
    typeof value.text.primary === 'string' &&
    isRecord(value.link) &&
    typeof value.link.color === 'string' &&
    isRecord(value.background) &&
    typeof value.background.default === 'string' &&
    typeof value.background.surface === 'string' &&
    typeof value.background.muted === 'string' &&
    isRecord(value.sidebar) &&
    typeof value.sidebar.background === 'string' &&
    typeof value.sidebar.color === 'string' &&
    typeof value.sidebar.selectedBackground === 'string' &&
    typeof value.sidebar.selectedColor === 'string' &&
    isRecord(value.navbar) &&
    typeof value.navbar.background === 'string' &&
    typeof value.navbar.color === 'string' &&
    (value.terminal === undefined ||
      (isRecord(value.terminal) &&
        (value.terminal.background === undefined ||
          typeof value.terminal.background === 'string') &&
        (value.terminal.foreground === undefined ||
          typeof value.terminal.foreground === 'string') &&
        (value.terminal.cursor === undefined || typeof value.terminal.cursor === 'string')))
  );
}

function getImportedThemes(data: unknown): HeadlampTheme[] {
  const rawThemes = Array.isArray(data)
    ? data
    : isRecord(data) && Array.isArray(data.themes)
      ? data.themes
      : null;

  if (!rawThemes) {
    throw new Error('Theme JSON must contain a themes array.');
  }

  const themes = rawThemes.filter(isTheme);
  if (themes.length < 2) {
    throw new Error('Theme JSON must contain at least two valid themes.');
  }

  return themes.map(completeTheme);
}

function getImportedLogoDataUrl(data: unknown): string | null {
  if (!isRecord(data)) {
    return null;
  }

  return typeof data.logoDataUrl === 'string' ? data.logoDataUrl : null;
}

/** App shell using the headlamp.dev dark palette */
const appTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: { main: YELLOW, contrastText: '#1a1a18' },
    background: {
      default: PANEL_BG,
      paper: HEADER_BG,
    },
  },
  typography: {
    fontFamily: 'Roboto, sans-serif',
  },
});

export default function App() {
  const importInputRef = useRef<HTMLInputElement>(null);
  const [lightTheme, setLightTheme] = useState<HeadlampTheme>(defaultLight);
  const [darkTheme, setDarkTheme] = useState<HeadlampTheme>(defaultDark);
  const [active, setActive] = useState<'light' | 'dark'>('light');
  const [logoDataUrl, setLogoDataUrl] = useState<string | null>(null);
  const [helpOpen, setHelpOpen] = useState(false);
  const [welcomeOpen, setWelcomeOpen] = useState(false);
  const [highlightedPath, setHighlightedPath] = useState<string | null>(null);
  const [themeFileMenuAnchor, setThemeFileMenuAnchor] = useState<null | HTMLElement>(null);

  const currentTheme = active === 'light' ? lightTheme : darkTheme;
  const setCurrentTheme = active === 'light' ? setLightTheme : setDarkTheme;
  const themeFileMenuOpen = Boolean(themeFileMenuAnchor);

  useEffect(() => {
    setWelcomeOpen(localStorage.getItem(WELCOME_DISMISSED_KEY) !== 'true');
  }, []);

  function closeWelcome() {
    localStorage.setItem(WELCOME_DISMISSED_KEY, 'true');
    setWelcomeOpen(false);
  }

  function showHelpFromWelcome() {
    closeWelcome();
    setHelpOpen(true);
  }

  function handleImportThemeJson(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) {
      return;
    }

    const reader = new FileReader();
    reader.onload = event => {
      try {
        const data = JSON.parse(String(event.target?.result ?? ''));
        const themes = getImportedThemes(data);
        const importedLight = themes.find(theme => theme.base === 'light') ?? themes[0];
        const importedDark = themes.find(theme => theme.base === 'dark') ?? themes[1];

        setLightTheme(importedLight);
        setDarkTheme(importedDark);
        setLogoDataUrl(getImportedLogoDataUrl(data));
        setActive(importedLight.base);
      } catch (error) {
        window.alert(error instanceof Error ? error.message : 'Could not import theme JSON.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  }

  return (
    <ThemeProvider theme={appTheme}>
      <CssBaseline />
      <GlobalStyles
        styles={{
          '*': {
            scrollbarWidth: 'thin',
            scrollbarColor: `${YELLOW} ${HEADER_BG}`,
          },
          '*::-webkit-scrollbar': {
            width: 10,
            height: 10,
          },
          '*::-webkit-scrollbar-track': {
            backgroundColor: HEADER_BG,
          },
          '*::-webkit-scrollbar-thumb': {
            backgroundColor: YELLOW,
            borderRadius: 8,
            border: `2px solid ${HEADER_BG}`,
          },
          '*::-webkit-scrollbar-thumb:hover': {
            backgroundColor: YELLOW_DARK,
          },
        }}
      />
      <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh', bgcolor: PANEL_BG }}>

        {/* Top bar — headlamp.dev style */}
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
          {/* Logo */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, mr: 2 }}>
            <Box
              component="img"
              src={THEME_BUILDER_LOGO_URL}
              alt="Headlamp Theme Builder logo"
              sx={{
                width: 85,
                height: 85,
                objectFit: 'contain',
                display: 'block',
              }}
            />
            <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#fff', fontSize: '1.75rem' }}>
              Headlamp Theme Builder
            </Typography>
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
            variant="outlined"
            size="small"
            startIcon={<SaveAltIcon />}
            onClick={event => setThemeFileMenuAnchor(event.currentTarget)}
            sx={{
              color: 'rgba(255,255,255,0.8)',
              borderColor: 'rgba(255,255,255,0.2)',
              '&:hover': {
                borderColor: 'rgba(255,255,255,0.35)',
                bgcolor: 'rgba(255,255,255,0.06)',
              },
              fontWeight: 700,
              fontSize: '0.78rem',
            }}
          >
            Save / Load
          </Button>
          <Menu
            anchorEl={themeFileMenuAnchor}
            open={themeFileMenuOpen}
            onClose={() => setThemeFileMenuAnchor(null)}
            MenuListProps={{ dense: true }}
          >
            <MenuItem
              onClick={() => {
                setThemeFileMenuAnchor(null);
                importInputRef.current?.click();
              }}
            >
              <UploadFileIcon fontSize="small" sx={{ mr: 1 }} />
              Import saved JSON
            </MenuItem>
            <MenuItem
              onClick={() => {
                setThemeFileMenuAnchor(null);
                downloadThemeJson([lightTheme, darkTheme], logoDataUrl);
              }}
            >
              <DownloadIcon fontSize="small" sx={{ mr: 1 }} />
              Export saved JSON
            </MenuItem>
          </Menu>
          <input
            ref={importInputRef}
            type="file"
            accept="application/json,.json"
            style={{ display: 'none' }}
            onChange={handleImportThemeJson}
          />

          <Button
            variant="contained"
            size="small"
            startIcon={<DownloadIcon />}
            onClick={() => downloadPlugin([lightTheme, darkTheme], logoDataUrl)}
            sx={{
              bgcolor: YELLOW,
              color: '#1a1a18',
              '&:hover': { bgcolor: YELLOW_DARK },
              fontWeight: 700,
              fontSize: '0.78rem',
            }}
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
              onBaseChange={setActive}
              logoDataUrl={logoDataUrl}
              onLogoChange={setLogoDataUrl}
              onHighlightPath={setHighlightedPath}
              uploadIcon={<UploadFileIcon fontSize="small" />}
              deleteIcon={<DeleteIcon fontSize="small" />}
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
              sx={{
                color: 'rgba(255,255,255,0.3)',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                fontSize: '0.68rem',
              }}
            >
              Live preview — {active} theme
            </Typography>
            <Box sx={{ flex: 1, overflow: 'hidden' }}>
              <Preview theme={currentTheme} logoDataUrl={logoDataUrl} highlightedPath={highlightedPath} />
            </Box>
          </Box>
        </Box>

        <WelcomeDialog
          open={welcomeOpen}
          onClose={closeWelcome}
          onShowHelp={showHelpFromWelcome}
        />
        <HowToUseDialog open={helpOpen} onClose={() => setHelpOpen(false)} />
      </Box>
    </ThemeProvider>
  );
}
