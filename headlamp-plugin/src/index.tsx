import ThemeBuilderLogoUrl from '@builder/../public/headlamp-theme-builder.png';
import HowToUseDialog from '@builder/components/HowToUseDialog';
import InstallInstructionsDialog from '@builder/components/InstallInstructionsDialog';
import Preview from '@builder/components/Preview';
import ThemeLibrary from '@builder/components/ThemeLibrary';
import ThemePanel from '@builder/components/ThemePanel';
import { completeTheme, defaultDark, defaultLight } from '@builder/defaults/defaultTheme';
import { themeLibrary, type ThemeLibraryEntry } from '@builder/library/themeLibrary';
import type { HeadlampTheme } from '@builder/types/theme';
import { downloadPlugin } from '@builder/utils/generateCode';
import {
  AppLogoProps,
  Headlamp,
  Plugin,
  registerAppLogo,
  registerAppTheme,
  registerRoute,
  registerSidebarEntry,
} from '@kinvolk/headlamp-plugin/lib';
import type { AppTheme } from '@kinvolk/headlamp-plugin/lib/lib/AppTheme';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import { useTheme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import { useEffect, useState } from 'react';

const APPLIED_THEME_STORAGE_KEY = 'headlamp-theme-builder-plugin-state';
const BUILDER_DRAFT_STORAGE_KEY = 'headlamp-theme-builder-draft-state';
const IMPORTED_LIBRARY_STORAGE_KEY = 'headlamp-theme-builder-imported-library';
const THEME_PREFERENCE_KEY = 'headlampThemePreference';

const PLUGIN_NAME = 'headlamp-theme-builder';
const BUILT_IN_OR_LEGACY_DEFAULT_THEMES = new Set([
  'Light',
  'Dark',
  'Theme Builder Light',
  'Theme Builder Dark',
]);
interface BuilderPluginState {
  lightTheme: HeadlampTheme;
  darkTheme: HeadlampTheme;
  logoDataUrl: string | null;
}

function readThemeState(storageKey: string): BuilderPluginState | null {
  const raw = localStorage.getItem(storageKey);
  if (!raw) {
    return null;
  }

  try {
    const state = JSON.parse(raw) as BuilderPluginState;
    return {
      lightTheme: completeTheme(state.lightTheme),
      darkTheme: completeTheme(state.darkTheme),
      logoDataUrl: state.logoDataUrl ?? null,
    };
  } catch {
    return null;
  }
}

function readAppliedState(): BuilderPluginState | null {
  return readThemeState(APPLIED_THEME_STORAGE_KEY);
}

function readBuilderDraftState(): BuilderPluginState | null {
  return readThemeState(BUILDER_DRAFT_STORAGE_KEY);
}

function readImportedLibraryEntries(): ThemeLibraryEntry[] {
  const raw = localStorage.getItem(IMPORTED_LIBRARY_STORAGE_KEY);
  if (!raw) {
    return [];
  }

  try {
    const entries = JSON.parse(raw);
    return Array.isArray(entries) ? entries : [];
  } catch {
    return [];
  }
}

function ThemeBuilderLogo(props: AppLogoProps) {
  const state = readAppliedState();
  if (!state?.logoDataUrl) {
    return null;
  }

  const { logoType, className } = props;
  return (
    <img
      src={state.logoDataUrl}
      alt="logo"
      className={className}
      style={{
        display: 'block',
        height: logoType === 'small' ? 28 : 32,
        maxWidth: logoType === 'small' ? 44 : 180,
        width: 'auto',
        objectFit: 'contain',
      }}
    />
  );
}

function registerStoredBuilderTheme() {
  const state = readAppliedState();
  if (!state) {
    return;
  }

  getCustomThemes([state.lightTheme, state.darkTheme]).forEach(theme =>
    registerAppTheme(theme as AppTheme)
  );

  if (state.logoDataUrl) {
    registerAppLogo(ThemeBuilderLogo);
  }
}

function getCustomThemes(themes: HeadlampTheme[]) {
  return themes.filter(theme => !BUILT_IN_OR_LEGACY_DEFAULT_THEMES.has(theme.name));
}

function saveBuilderDraft(state: BuilderPluginState) {
  localStorage.setItem(BUILDER_DRAFT_STORAGE_KEY, JSON.stringify(state));
}

function saveAppliedTheme(state: BuilderPluginState, active: 'light' | 'dark') {
  localStorage.setItem(APPLIED_THEME_STORAGE_KEY, JSON.stringify(state));

  getCustomThemes([state.lightTheme, state.darkTheme]).forEach(theme =>
    registerAppTheme(theme as AppTheme)
  );

  if (state.logoDataUrl) {
    registerAppLogo(ThemeBuilderLogo);
  }

  localStorage.setItem(
    THEME_PREFERENCE_KEY,
    active === 'light' ? state.lightTheme.name : state.darkTheme.name
  );
}

function resetBuilderTheme() {
  localStorage.removeItem(APPLIED_THEME_STORAGE_KEY);
  localStorage.removeItem(THEME_PREFERENCE_KEY);
  window.location.reload();
}

function ThemeBuilderPage() {
  const headlampTheme = useTheme();
  const storedState = readBuilderDraftState();
  const [lightTheme, setLightTheme] = useState<HeadlampTheme>(
    storedState?.lightTheme ?? defaultLight
  );
  const [darkTheme, setDarkTheme] = useState<HeadlampTheme>(storedState?.darkTheme ?? defaultDark);
  const [active, setActive] = useState<'light' | 'dark'>('light');
  const [logoDataUrl, setLogoDataUrl] = useState<string | null>(storedState?.logoDataUrl ?? null);
  const [helpOpen, setHelpOpen] = useState(false);
  const [installInstructionsOpen, setInstallInstructionsOpen] = useState(false);
  const [highlightedPath, setHighlightedPath] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [view, setView] = useState<'builder' | 'library'>('builder');
  const [importedLibraryEntries, setImportedLibraryEntries] = useState<ThemeLibraryEntry[]>(
    readImportedLibraryEntries
  );

  const currentTheme = active === 'light' ? lightTheme : darkTheme;
  const setCurrentTheme = active === 'light' ? setLightTheme : setDarkTheme;
  const shellBackground = headlampTheme.palette.background.default;
  const panelBackground = headlampTheme.palette.background.paper;
  const borderColor = headlampTheme.palette.divider;
  const primary = headlampTheme.palette.primary.main;
  const primaryHover = headlampTheme.palette.primary.dark;
  const primaryContrast = headlampTheme.palette.getContrastText(primary);
  const subduedText = headlampTheme.palette.text.secondary;

  useEffect(() => {
    registerStoredBuilderTheme();
  }, []);

  useEffect(() => {
    saveBuilderDraft({ lightTheme, darkTheme, logoDataUrl });
  }, [lightTheme, darkTheme, logoDataUrl]);

  useEffect(() => {
    localStorage.setItem(IMPORTED_LIBRARY_STORAGE_KEY, JSON.stringify(importedLibraryEntries));
  }, [importedLibraryEntries]);

  function handleApply() {
    saveAppliedTheme({ lightTheme, darkTheme, logoDataUrl }, active);
    setStatus(`Applied ${active === 'light' ? lightTheme.name : darkTheme.name}. Reloading...`);
    window.setTimeout(() => window.location.reload(), 500);
  }

  async function handleDownloadPlugin() {
    await downloadPlugin([lightTheme, darkTheme], logoDataUrl);
    setInstallInstructionsOpen(true);
  }

  function getLibraryThemes(
    entry: ThemeLibraryEntry,
    selectedTheme: HeadlampTheme | undefined,
    fallbackState: BuilderPluginState
  ) {
    const entryLight = entry.themes.find(theme => theme.base === 'light');
    const entryDark = entry.themes.find(theme => theme.base === 'dark');
    const preferredTheme = selectedTheme ?? entryDark ?? entryLight ?? entry.themes[0];
    const nextLightTheme = entryLight ?? fallbackState.lightTheme;
    const nextDarkTheme = entryDark ?? fallbackState.darkTheme;

    return {
      activeTheme: preferredTheme.base,
      lightTheme: nextLightTheme,
      darkTheme: nextDarkTheme,
    };
  }

  function loadLibraryEntry(entry: ThemeLibraryEntry) {
    const nextState = getLibraryThemes(entry, undefined, { lightTheme, darkTheme, logoDataUrl });

    setLightTheme(nextState.lightTheme);
    setDarkTheme(nextState.darkTheme);
    setLogoDataUrl(null);
    setActive(nextState.activeTheme);
    setView('builder');
  }

  function applyLibraryEntry(entry: ThemeLibraryEntry, selectedTheme?: HeadlampTheme) {
    const fallbackState = readAppliedState() ?? { lightTheme: defaultLight, darkTheme: defaultDark, logoDataUrl: null };
    const nextState = getLibraryThemes(entry, selectedTheme, fallbackState);
    const nextBuilderState = {
      lightTheme: nextState.lightTheme,
      darkTheme: nextState.darkTheme,
      logoDataUrl: null,
    };

    saveAppliedTheme(nextBuilderState, nextState.activeTheme);
    setStatus(`Applied ${entry.name}. Reloading...`);
    window.setTimeout(() => window.location.reload(), 500);
  }

  async function handleDownloadLibraryEntry(entry: ThemeLibraryEntry) {
    await downloadPlugin(entry.themes, null);
    setInstallInstructionsOpen(true);
  }

  return (
    <>
      <CssBaseline />
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          minHeight: 0,
          overflow: 'hidden',
          bgcolor: shellBackground,
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            px: 2,
            py: 1,
            bgcolor: panelBackground,
            borderBottom: `1px solid ${borderColor}`,
            gap: 1,
            flexShrink: 0,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, mr: 2 }}>
            <Box
              component="img"
              src={ThemeBuilderLogoUrl}
              alt="Headlamp Theme Builder logo"
              sx={{
                width: 54,
                height: 42,
                objectFit: 'contain',
                display: 'block',
              }}
            />
            <Typography variant="subtitle1" sx={{ fontWeight: 700, color: 'text.primary', fontSize: '0.95rem' }}>
              Headlamp Theme Builder
            </Typography>
          </Box>

          {status && (
            <Typography variant="caption" sx={{ color: 'text.secondary', ml: 1 }}>
              {status}
            </Typography>
          )}

          <Box sx={{ flex: 1 }} />

          <Button
            variant="text"
            size="small"
            onClick={() => setHelpOpen(true)}
            sx={{ color: subduedText, fontWeight: 700, minWidth: 0 }}
          >
            Help
          </Button>

          <Button
            variant="outlined"
            size="small"
            onClick={resetBuilderTheme}
            sx={{
              borderColor,
              color: subduedText,
              '&:hover': { borderColor: primary, color: 'text.primary' },
              fontWeight: 700,
              fontSize: '0.78rem',
            }}
          >
            Reset applied
          </Button>

          <Button
            variant="outlined"
            size="small"
            onClick={handleApply}
            sx={{
              borderColor,
              color: 'text.primary',
              '&:hover': { borderColor: primary, color: primary },
              fontWeight: 700,
              fontSize: '0.78rem',
            }}
          >
            Apply to this Headlamp
          </Button>

          <Button
            variant="contained"
            size="small"
            onClick={handleDownloadPlugin}
            sx={{
              bgcolor: primary,
              color: primaryContrast,
              '&:hover': { bgcolor: primaryHover },
              fontWeight: 700,
              fontSize: '0.78rem',
            }}
          >
            Download plugin
          </Button>
        </Box>

        <Tabs
          value={view}
          onChange={(_, nextView: 'builder' | 'library') => setView(nextView)}
          sx={{
            px: 2,
            minHeight: 40,
            bgcolor: panelBackground,
            borderBottom: `1px solid ${borderColor}`,
            '& .MuiTab-root': {
              minHeight: 40,
              color: subduedText,
              fontWeight: 700,
              fontSize: '0.78rem',
            },
            '& .Mui-selected': {
              color: `${primary} !important`,
            },
            '& .MuiTabs-indicator': {
              bgcolor: primary,
            },
          }}
        >
          <Tab value="builder" label="Builder" />
          <Tab value="library" label="Library" />
        </Tabs>

        {view === 'builder' ? (
          <Box sx={{ display: 'flex', flex: 1, minHeight: 0, overflow: 'hidden' }}>
            <Box
              sx={{
                width: 300,
                flexShrink: 0,
                height: '100%',
                bgcolor: panelBackground,
                borderRight: `1px solid ${borderColor}`,
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                minHeight: 0,
              }}
            >
              <ThemePanel
                theme={currentTheme}
                onChange={setCurrentTheme}
                onBaseChange={setActive}
                logoDataUrl={logoDataUrl}
                onLogoChange={setLogoDataUrl}
                onHighlightPath={setHighlightedPath}
              />
            </Box>

            <Box
              sx={{
                flex: 1,
                p: 3,
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                gap: 1,
                bgcolor: shellBackground,
                minWidth: 0,
                minHeight: 0,
              }}
            >
              <Typography
                variant="caption"
                sx={{
                  color: 'text.secondary',
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  fontSize: '0.68rem',
                }}
              >
                Live preview - {active} theme
              </Typography>
              <Box sx={{ flex: 1, minHeight: 0, overflow: 'hidden' }}>
                <Preview theme={currentTheme} logoDataUrl={logoDataUrl} highlightedPath={highlightedPath} />
              </Box>
            </Box>
          </Box>
        ) : (
          <Box
            sx={{
              flex: 1,
              minHeight: 0,
              overflow: 'hidden',
              bgcolor: shellBackground,
            }}
          >
            <ThemeLibrary
              entries={[...themeLibrary, ...importedLibraryEntries]}
              onApply={applyLibraryEntry}
              onEdit={loadLibraryEntry}
              onDownload={handleDownloadLibraryEntry}
              onImportEntry={entry =>
                setImportedLibraryEntries(entries => [
                  ...entries.filter(existingEntry => existingEntry.id !== entry.id),
                  entry,
                ])
              }
              applyLabel="Apply"
            />
          </Box>
        )}

        <HowToUseDialog open={helpOpen} onClose={() => setHelpOpen(false)} />
        <InstallInstructionsDialog
          open={installInstructionsOpen}
          onClose={() => setInstallInstructionsOpen(false)}
        />
      </Box>
    </>
  );
}

const sidebarEntries = [{
  name: 'theme-builder-home',
  label: 'Theme Builder',
  url: '/theme-builder',
  icon: 'mdi:palette',
  sidebar: 'HOME',
  useClusterURL: false,
}];

const themeBuilderRoute = {
  path: '/theme-builder',
  sidebar: {
    item: 'theme-builder-home',
    sidebar: 'HOME',
  },
  name: 'theme-builder',
  exact: true,
  useClusterURL: false,
  noAuthRequired: true,
  isFullWidth: true,
  component: ThemeBuilderPage,
};

function registerThemeBuilder() {
  registerStoredBuilderTheme();
  sidebarEntries.forEach(entry => registerSidebarEntry(entry));
  registerRoute(themeBuilderRoute);
}

class ThemeBuilderPlugin extends Plugin {
  initialize(register: any) {
    registerStoredBuilderTheme();
    sidebarEntries.forEach(entry => register.registerSidebarEntry(entry));
    register.registerRoute(themeBuilderRoute);
    return true;
  }
}

try {
  Headlamp.registerPlugin(PLUGIN_NAME, new ThemeBuilderPlugin());
  registerThemeBuilder();
} catch (error) {
  console.error('headlamp-theme-builder failed to register', error);
}
