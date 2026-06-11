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
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import DownloadIcon from '@mui/icons-material/Download';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import SaveAltIcon from '@mui/icons-material/SaveAlt';
import DeleteIcon from '@mui/icons-material/Delete';
import LaunchIcon from '@mui/icons-material/Launch';
import LinkIcon from '@mui/icons-material/Link';
import ThemePanel from './components/ThemePanel';
import Preview from './components/Preview';
import ThemeLibrary from './components/ThemeLibrary';
import ThemeValidationSummary from './components/ThemeValidationSummary';
import HowToUseDialog from './components/HowToUseDialog';
import InstallInstructionsDialog from './components/InstallInstructionsDialog';
import MobileWarningDialog from './components/MobileWarningDialog';
import PluginMetadataDialog from './components/PluginMetadataDialog';
import ShareLinkDialog from './components/ShareLinkDialog';
import WelcomeDialog from './components/WelcomeDialog';
import { defaultLight, defaultDark } from './defaults/defaultTheme';
import { themeLibrary, type ThemeLibraryEntry } from './library/themeLibrary';
import { downloadPlugin, downloadThemeJson, type PluginMetadata } from './utils/generateCode';
import { getImportedLogoDataUrl, getImportedThemes } from './utils/themeImport';
import { decodeSharedThemeState, encodeSharedThemeState } from './utils/shareTheme';
import { validateThemesForUse } from './utils/themeValidation';
import type { HeadlampTheme } from './types/theme';

// headlamp.dev colour palette
const YELLOW = '#f2e600';
const YELLOW_DARK = '#d4ca00';
const HEADER_BG = '#252422';   // headlamp.dev navbar / dark app sidebar
const PANEL_BG = '#1a1a18';    // headlamp.dev hero background
const BORDER = 'rgba(255,255,255,0.06)';
const WELCOME_DISMISSED_KEY = 'headlamp-theme-builder-welcome-dismissed';
const MOBILE_WARNING_DISMISSED_KEY = 'headlamp-theme-builder-mobile-warning-dismissed';
const THEME_BUILDER_LOGO_URL = `${import.meta.env.BASE_URL}headlamp-theme-builder.png`;
const PUBLIC_LIBRARY_URL = `${import.meta.env.BASE_URL}library/index.json`;

interface PendingPluginDownload {
  themes: HeadlampTheme[];
  logoDataUrl: string | null;
  initialName: string;
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
  const [installInstructionsOpen, setInstallInstructionsOpen] = useState(false);
  const [mobileWarningOpen, setMobileWarningOpen] = useState(false);
  const [welcomeOpen, setWelcomeOpen] = useState(false);
  const [highlightedPath, setHighlightedPath] = useState<string | null>(null);
  const [themeFileMenuAnchor, setThemeFileMenuAnchor] = useState<null | HTMLElement>(null);
  const [view, setView] = useState<'builder' | 'library'>('builder');
  const [importedLibraryEntries, setImportedLibraryEntries] = useState<ThemeLibraryEntry[]>([]);
  const [pendingPluginDownload, setPendingPluginDownload] =
    useState<PendingPluginDownload | null>(null);
  const [snackbarMessage, setSnackbarMessage] = useState<string | null>(null);
  const [shareUrl, setShareUrl] = useState('');

  const currentTheme = active === 'light' ? lightTheme : darkTheme;
  const setCurrentTheme = active === 'light' ? setLightTheme : setDarkTheme;
  const validationResult = validateThemesForUse([currentTheme]);
  const themeFileMenuOpen = Boolean(themeFileMenuAnchor);

  useEffect(() => {
    setWelcomeOpen(localStorage.getItem(WELCOME_DISMISSED_KEY) !== 'true');
  }, []);

  useEffect(() => {
    const sharedTheme = new URLSearchParams(window.location.search).get('theme');
    if (!sharedTheme) {
      return;
    }

    try {
      const sharedState = decodeSharedThemeState(sharedTheme);
      const themes = getImportedThemes({ themes: sharedState.themes });
      const sharedLight = themes.find(theme => theme.base === 'light');
      const sharedDark = themes.find(theme => theme.base === 'dark');

      if (sharedLight) {
        setLightTheme(sharedLight);
      }
      if (sharedDark) {
        setDarkTheme(sharedDark);
      }
      setLogoDataUrl(null);
      setActive(sharedState.active);
      setView('builder');
    } catch (error) {
      window.alert(error instanceof Error ? error.message : 'Could not load shared theme link.');
    }
  }, []);

  useEffect(() => {
    const isMobileSized = window.matchMedia('(max-width: 760px)').matches;
    if (
      isMobileSized &&
      localStorage.getItem(MOBILE_WARNING_DISMISSED_KEY) !== 'true'
    ) {
      setMobileWarningOpen(true);
    }
  }, []);

  function closeWelcome() {
    localStorage.setItem(WELCOME_DISMISSED_KEY, 'true');
    setWelcomeOpen(false);
  }

  function closeMobileWarning() {
    localStorage.setItem(MOBILE_WARNING_DISMISSED_KEY, 'true');
    setMobileWarningOpen(false);
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
        const importedLight = themes.find(theme => theme.base === 'light');
        const importedDark = themes.find(theme => theme.base === 'dark');
        const preferredTheme = importedDark ?? importedLight ?? themes[0];

        if (importedLight) {
          setLightTheme(importedLight);
        }
        if (importedDark) {
          setDarkTheme(importedDark);
        }
        setLogoDataUrl(getImportedLogoDataUrl(data));
        setActive(preferredTheme.base);
        setView('builder');
      } catch (error) {
        window.alert(error instanceof Error ? error.message : 'Could not import theme JSON.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  }

  async function handleDownloadPlugin() {
    const downloadValidation = validateThemesForUse([currentTheme]);
    if (downloadValidation.errors.length > 0) {
      window.alert(`Fix theme errors before downloading:\n${downloadValidation.errors.join('\n')}`);
      return;
    }

    setPendingPluginDownload({
      themes: [currentTheme],
      logoDataUrl,
      initialName: currentTheme.name,
    });
  }

  function loadLibraryEntry(entry: ThemeLibraryEntry) {
    const entryLight = entry.themes.find(theme => theme.base === 'light');
    const entryDark = entry.themes.find(theme => theme.base === 'dark');
    const preferredTheme = entryDark ?? entryLight ?? entry.themes[0];

    if (entryLight) {
      setLightTheme(entryLight);
    }
    if (entryDark) {
      setDarkTheme(entryDark);
    }
    setLogoDataUrl(null);
    setActive(preferredTheme.base);
    setView('builder');
  }

  async function handleDownloadLibraryEntry(entry: ThemeLibraryEntry) {
    setPendingPluginDownload({
      themes: entry.themes,
      logoDataUrl: null,
      initialName: entry.name,
    });
  }

  async function confirmPluginDownload(metadata: PluginMetadata) {
    if (!pendingPluginDownload) {
      return;
    }

    await downloadPlugin(
      pendingPluginDownload.themes,
      pendingPluginDownload.logoDataUrl,
      metadata
    );
    setPendingPluginDownload(null);
    setInstallInstructionsOpen(true);
  }

  function getShareUrl() {
    const url = new URL(window.location.href);
    url.searchParams.set(
      'theme',
      encodeSharedThemeState({
        active,
        themes: [lightTheme, darkTheme],
      })
    );
    url.hash = '';

    return url.toString();
  }

  async function copyTextToClipboard(value: string) {
    try {
      await navigator.clipboard.writeText(value);
      setSnackbarMessage('Share link copied. Uploaded logos are not included.');
    } catch {
      window.prompt('Copy this share link:', value);
    }
  }

  async function copyShareLink() {
    const nextShareUrl = getShareUrl();
    setShareUrl(nextShareUrl);
    await copyTextToClipboard(nextShareUrl);
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

          <Button
            component="a"
            href="https://headlamp.dev/"
            target="_blank"
            rel="noopener noreferrer"
            variant="text"
            size="small"
            endIcon={<LaunchIcon />}
            sx={{
              color: 'rgba(255,255,255,0.78)',
              '&:hover': {
                color: '#fff',
                bgcolor: 'rgba(255,255,255,0.06)',
              },
              fontWeight: 700,
              fontSize: '0.78rem',
            }}
          >
            Headlamp
          </Button>

          <IconButton
            size="small"
            onClick={() => setHelpOpen(true)}
            sx={{ color: 'rgba(255,255,255,0.55)', '&:hover': { color: '#fff' } }}
            title="How to use"
          >
            <Typography component="span" sx={{ fontWeight: 700, lineHeight: 1 }}>
              ?
            </Typography>
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
            slotProps={{ list: { dense: true } }}
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
            <MenuItem
              onClick={() => {
                setThemeFileMenuAnchor(null);
                void copyShareLink();
              }}
            >
              <LinkIcon fontSize="small" sx={{ mr: 1 }} />
              Copy share link
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
            onClick={handleDownloadPlugin}
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

        <Box
          sx={{
            px: 2,
            py: 1,
            bgcolor: 'rgba(242,230,0,0.08)',
            borderBottom: `1px solid ${BORDER}`,
            color: 'rgba(255,255,255,0.78)',
            fontSize: '0.82rem',
            flexShrink: 0,
          }}
        >
          You can also install Headlamp Theme Builder into Headlamp to design, preview, and apply
          themes from inside the app.
        </Box>

        <Tabs
          value={view}
          onChange={(_, nextView: 'builder' | 'library') => setView(nextView)}
          sx={{
            px: 2,
            minHeight: 40,
            bgcolor: HEADER_BG,
            borderBottom: `1px solid ${BORDER}`,
            '& .MuiTab-root': {
              minHeight: 40,
              color: 'rgba(255,255,255,0.62)',
              fontWeight: 700,
              fontSize: '0.78rem',
            },
            '& .Mui-selected': {
              color: `${YELLOW} !important`,
            },
            '& .MuiTabs-indicator': {
              bgcolor: YELLOW,
            },
          }}
        >
          <Tab value="builder" label="Builder" />
          <Tab value="library" label="Library" />
        </Tabs>

        {/* Main split */}
        {view === 'builder' ? (
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
                Live preview - {active} theme
              </Typography>
              <ThemeValidationSummary result={validationResult} />
              <Box sx={{ flex: 1, overflow: 'hidden' }}>
                <Preview theme={currentTheme} logoDataUrl={logoDataUrl} highlightedPath={highlightedPath} />
              </Box>
            </Box>
          </Box>
        ) : (
          <Box sx={{ flex: 1, minHeight: 0, overflow: 'hidden', bgcolor: PANEL_BG }}>
            <ThemeLibrary
              entries={[...themeLibrary, ...importedLibraryEntries]}
              onEdit={loadLibraryEntry}
              onDownload={handleDownloadLibraryEntry}
              onImportEntry={entry =>
                setImportedLibraryEntries(entries => [
                  ...entries.filter(existingEntry => existingEntry.id !== entry.id),
                  entry,
                ])
              }
              onDeleteEntry={entry =>
                setImportedLibraryEntries(entries =>
                  entries.filter(existingEntry => existingEntry.id !== entry.id)
                )
              }
              publicLibraryUrl={PUBLIC_LIBRARY_URL}
            />
          </Box>
        )}

        <MobileWarningDialog open={mobileWarningOpen} onClose={closeMobileWarning} />
        <WelcomeDialog
          open={welcomeOpen}
          onClose={closeWelcome}
          onShowHelp={showHelpFromWelcome}
        />
        <HowToUseDialog open={helpOpen} onClose={() => setHelpOpen(false)} />
        <InstallInstructionsDialog
          open={installInstructionsOpen}
          onClose={() => setInstallInstructionsOpen(false)}
        />
        <PluginMetadataDialog
          open={Boolean(pendingPluginDownload)}
          initialName={pendingPluginDownload?.initialName ?? currentTheme.name}
          onClose={() => setPendingPluginDownload(null)}
          onConfirm={confirmPluginDownload}
        />
        <ShareLinkDialog
          open={Boolean(shareUrl)}
          shareUrl={shareUrl}
          onClose={() => setShareUrl('')}
          onCopy={() => void copyTextToClipboard(shareUrl)}
        />
        <Snackbar
          open={Boolean(snackbarMessage)}
          autoHideDuration={3000}
          onClose={() => setSnackbarMessage(null)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert severity="success" variant="filled" onClose={() => setSnackbarMessage(null)}>
            {snackbarMessage}
          </Alert>
        </Snackbar>
      </Box>
    </ThemeProvider>
  );
}
