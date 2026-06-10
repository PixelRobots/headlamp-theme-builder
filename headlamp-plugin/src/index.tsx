import {
  AppLogoProps,
  Headlamp,
  Plugin,
  registerAppLogo,
  registerAppTheme,
  registerRoute,
  registerSidebarEntry,
} from '@kinvolk/headlamp-plugin/lib';
import type { SidebarEntryProps } from '@kinvolk/headlamp-plugin/lib';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import Typography from '@mui/material/Typography';
import { useTheme } from '@mui/material/styles';
import { useEffect, useState } from 'react';
import ThemePanel from '@builder/components/ThemePanel';
import Preview from '@builder/components/Preview';
import HowToUseDialog from '@builder/components/HowToUseDialog';
import { completeTheme, defaultDark, defaultLight } from '@builder/defaults/defaultTheme';
import type { HeadlampTheme } from '@builder/types/theme';
import { downloadPlugin } from '@builder/utils/generateCode';
import ThemeBuilderLogoSvg from '@builder/../public/theme-builder-logo.svg?raw';

const STORAGE_KEY = 'headlamp-theme-builder-plugin-state';
const THEME_PREFERENCE_KEY = 'headlampThemePreference';

const PLUGIN_NAME = 'headlamp-theme-builder';
const BUILT_IN_OR_LEGACY_DEFAULT_THEMES = new Set([
  'Light',
  'Dark',
  'Theme Builder Light',
  'Theme Builder Dark',
]);
const THEME_BUILDER_LOGO_DATA_URL = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(ThemeBuilderLogoSvg)}`;

interface BuilderPluginState {
  lightTheme: HeadlampTheme;
  darkTheme: HeadlampTheme;
  logoDataUrl: string | null;
}

function readStoredState(): BuilderPluginState | null {
  const raw = localStorage.getItem(STORAGE_KEY);
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

function ThemeBuilderLogo(props: AppLogoProps) {
  const state = readStoredState();
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
  const state = readStoredState();
  if (!state) {
    return;
  }

  getCustomThemes([state.lightTheme, state.darkTheme]).forEach(theme => registerAppTheme(theme));

  if (state.logoDataUrl) {
    registerAppLogo(ThemeBuilderLogo);
  }
}

function getCustomThemes(themes: HeadlampTheme[]) {
  return themes.filter(theme => !BUILT_IN_OR_LEGACY_DEFAULT_THEMES.has(theme.name));
}

function saveBuilderTheme(state: BuilderPluginState, active: 'light' | 'dark') {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));

  getCustomThemes([state.lightTheme, state.darkTheme]).forEach(theme => registerAppTheme(theme));

  if (state.logoDataUrl) {
    registerAppLogo(ThemeBuilderLogo);
  }

  localStorage.setItem(
    THEME_PREFERENCE_KEY,
    active === 'light' ? state.lightTheme.name : state.darkTheme.name
  );
}

function resetBuilderTheme() {
  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem(THEME_PREFERENCE_KEY);
  window.location.reload();
}

function ThemeBuilderPage() {
  const headlampTheme = useTheme();
  const storedState = readStoredState();
  const [lightTheme, setLightTheme] = useState<HeadlampTheme>(
    storedState?.lightTheme ?? defaultLight
  );
  const [darkTheme, setDarkTheme] = useState<HeadlampTheme>(storedState?.darkTheme ?? defaultDark);
  const [active, setActive] = useState<'light' | 'dark'>('light');
  const [logoDataUrl, setLogoDataUrl] = useState<string | null>(storedState?.logoDataUrl ?? null);
  const [helpOpen, setHelpOpen] = useState(false);
  const [highlightedPath, setHighlightedPath] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);

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
    if (storedState) {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ lightTheme, darkTheme, logoDataUrl })
      );
    }
  }, []);

  function handleApply() {
    saveBuilderTheme({ lightTheme, darkTheme, logoDataUrl }, active);
    setStatus(`Applied ${active === 'light' ? lightTheme.name : darkTheme.name}. Reloading...`);
    window.setTimeout(() => window.location.reload(), 500);
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
              src={THEME_BUILDER_LOGO_DATA_URL}
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
            onClick={() => downloadPlugin([lightTheme, darkTheme], logoDataUrl)}
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

        <HowToUseDialog open={helpOpen} onClose={() => setHelpOpen(false)} />
      </Box>
    </>
  );
}

const sidebarEntries: SidebarEntryProps[] = [{
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
