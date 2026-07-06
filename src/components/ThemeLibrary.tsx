import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Typography from '@mui/material/Typography';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import { useCallback, useEffect, useMemo, useRef, useState, type ChangeEvent } from 'react';
import {
  normalizeThemeLibraryEntry,
  type RawThemeLibraryEntry,
  type ThemeLibraryEntry,
} from '../library/themeLibrary';
import type { HeadlampTheme } from '../types/theme';
import { getImportedLibraryEntry, normalizeThemeImportUrl } from '../utils/themeImport';

const PAGE_SIZE = 12;

type ThemeSource = 'bundled' | 'imported' | 'public';
type SourceFilter = 'all' | ThemeSource;
type ModeFilter = 'all' | 'light' | 'dark' | 'pair';

interface DisplayThemeLibraryEntry {
  entry: ThemeLibraryEntry;
  source: ThemeSource;
}

interface PublicThemeLibraryIndex {
  themes?: RawThemeLibraryEntry[];
}

interface ThemeLibraryProps {
  entries: ThemeLibraryEntry[];
  onApply?: (entry: ThemeLibraryEntry, theme?: HeadlampTheme) => void;
  onEdit: (entry: ThemeLibraryEntry) => void;
  onDownload: (entry: ThemeLibraryEntry) => void;
  onImportEntry?: (entry: ThemeLibraryEntry) => void;
  onDeleteEntry?: (entry: ThemeLibraryEntry) => void;
  publicLibraryUrl?: string;
  applyLabel?: string;
}

function modeLabel(themes: HeadlampTheme[]) {
  const hasLight = themes.some(theme => theme.base === 'light');
  const hasDark = themes.some(theme => theme.base === 'dark');
  if (hasLight && hasDark) {
    return 'Pair';
  }
  return hasDark ? 'Dark only' : 'Light only';
}

function getPreviewTheme(entry: ThemeLibraryEntry) {
  return entry.themes.find(theme => theme.base === 'dark') ?? entry.themes[0];
}

function getPreviewThemeForMode(entry: ThemeLibraryEntry, mode?: 'light' | 'dark') {
  if (mode) {
    return entry.themes.find(theme => theme.base === mode) ?? getPreviewTheme(entry);
  }
  return getPreviewTheme(entry);
}

function sourceLabel(source: ThemeSource) {
  if (source === 'public') {
    return 'Public';
  }
  return source === 'imported' ? 'Imported' : 'Bundled';
}

function sourceForEntry(entry: ThemeLibraryEntry): ThemeSource {
  return entry.tags.includes('imported') ? 'imported' : 'bundled';
}

function baseEntryId(entryId: string) {
  return entryId.replace(/^imported-/, '');
}

function entryMatchesMode(entry: ThemeLibraryEntry, mode: ModeFilter) {
  if (mode === 'all') {
    return true;
  }

  const hasLight = entry.themes.some(theme => theme.base === 'light');
  const hasDark = entry.themes.some(theme => theme.base === 'dark');

  if (mode === 'pair') {
    return hasLight && hasDark;
  }

  return mode === 'light' ? hasLight : hasDark;
}

function entryMatchesSearch(entry: ThemeLibraryEntry, searchTerm: string) {
  const normalizedSearch = searchTerm.trim().toLowerCase();
  if (!normalizedSearch) {
    return true;
  }

  return [entry.name, entry.description, ...entry.tags]
    .join(' ')
    .toLowerCase()
    .includes(normalizedSearch);
}

function getPublicIndexEntries(data: unknown): RawThemeLibraryEntry[] {
  if (Array.isArray(data)) {
    return data as RawThemeLibraryEntry[];
  }

  if (typeof data === 'object' && data !== null && Array.isArray((data as PublicThemeLibraryIndex).themes)) {
    return (data as PublicThemeLibraryIndex).themes ?? [];
  }

  throw new Error('Public library index did not contain a themes array.');
}

function toImportedEntry(entry: ThemeLibraryEntry): ThemeLibraryEntry {
  return {
    ...entry,
    id: `imported-${entry.id}`,
    tags: Array.from(new Set(['imported', ...entry.tags.filter(tag => tag !== 'public')])),
  };
}

function MiniPreview({ theme }: { theme: HeadlampTheme }) {
  return (
    <Box
      sx={{
        height: 130,
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 1,
        overflow: 'hidden',
        bgcolor: theme.background.default,
      }}
    >
      <Box sx={{ height: 24, bgcolor: theme.navbar.background, display: 'flex', alignItems: 'center', px: 1, gap: 0.75 }}>
        <Box sx={{ width: 38, height: 8, borderRadius: 0.5, bgcolor: theme.navbar.color, opacity: 0.85 }} />
        <Box sx={{ flex: 1 }} />
        <Box sx={{ width: 26, height: 10, borderRadius: 0.5, border: '1px solid', borderColor: theme.navbar.searchHint ?? theme.navbar.color }} />
      </Box>
      <Box sx={{ display: 'flex', height: 'calc(100% - 24px)' }}>
        <Box sx={{ width: 54, bgcolor: theme.sidebar.background, p: 0.75 }}>
          <Box sx={{ height: 9, mb: 0.75, borderRadius: 0.5, bgcolor: theme.sidebar.color, opacity: 0.7 }} />
          <Box sx={{ height: 14, mb: 0.75, borderRadius: 0.75, bgcolor: theme.sidebar.selectedBackground, p: '3px 5px' }} />
          <Box
            sx={{
              height: 9,
              mb: 0.75,
              ml: 1,
              borderLeft: `3px solid ${theme.sidebar.selectedColor}`,
              borderRadius: 0.5,
              bgcolor: theme.sidebar.selectedColor,
              opacity: 0.95,
            }}
          />
          <Box sx={{ height: 13, mt: 3.5, borderRadius: 0.75, bgcolor: theme.sidebar.actionBackground }} />
        </Box>
        <Box sx={{ flex: 1, p: 1, minWidth: 0 }}>
          <Box sx={{ height: 12, width: '42%', mb: 1, borderRadius: 0.5, bgcolor: theme.text.primary, opacity: 0.9 }} />
          <Box sx={{ height: 46, mb: 1, borderRadius: 1, bgcolor: theme.background.surface, border: '1px solid rgba(127,127,127,0.25)', p: 1 }}>
            <Box sx={{ height: 8, width: '74%', mb: 0.75, borderRadius: 0.5, bgcolor: theme.text.primary, opacity: 0.55 }} />
            <Box sx={{ height: 12, width: 48, borderRadius: 0.75, bgcolor: theme.primary }} />
          </Box>
          <Box sx={{ height: 22, borderRadius: 0.75, bgcolor: theme.terminal?.background ?? theme.background.muted, p: 0.75 }}>
            <Box sx={{ height: 6, width: '62%', borderRadius: 0.5, bgcolor: theme.terminal?.foreground ?? theme.text.primary, opacity: 0.85 }} />
          </Box>
        </Box>
      </Box>
    </Box>
  );
}

export default function ThemeLibrary({
  entries,
  onApply,
  onEdit,
  onDownload,
  onImportEntry,
  onDeleteEntry,
  publicLibraryUrl,
  applyLabel = 'Apply',
}: ThemeLibraryProps) {
  const importInputRef = useRef<HTMLInputElement>(null);
  const [applyMenu, setApplyMenu] = useState<{
    entry: ThemeLibraryEntry;
    anchorEl: HTMLElement;
  } | null>(null);
  const [previewModes, setPreviewModes] = useState<Record<string, 'light' | 'dark'>>({});
  const [importUrl, setImportUrl] = useState('');
  const [importStatus, setImportStatus] = useState<string | null>(null);
  const [publicEntries, setPublicEntries] = useState<ThemeLibraryEntry[]>([]);
  const [publicLibraryStatus, setPublicLibraryStatus] = useState<string | null>(null);
  const [publicLibraryLoading, setPublicLibraryLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [modeFilter, setModeFilter] = useState<ModeFilter>('all');
  const [sourceFilter, setSourceFilter] = useState<SourceFilter>('all');
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [snackbarMessage, setSnackbarMessage] = useState<string | null>(null);
  const existingEntryIdKey = entries.map(entry => baseEntryId(entry.id)).sort().join('\0');

  const loadPublicLibrary = useCallback(async () => {
    if (!publicLibraryUrl) {
      setPublicLibraryStatus('Public library URL is not configured.');
      return;
    }

    setPublicLibraryLoading(true);
    setPublicLibraryStatus(null);

    try {
      const response = await fetch(publicLibraryUrl);
      if (!response.ok) {
        throw new Error(`Could not load public library (${response.status}).`);
      }

      const existingIds = new Set(existingEntryIdKey.split('\0').filter(Boolean));
      const rawEntries = getPublicIndexEntries(await response.json());
      const normalizedEntries = rawEntries
        .map(entry => normalizeThemeLibraryEntry(entry))
        .filter(entry => !existingIds.has(baseEntryId(entry.id)));
      setPublicEntries(normalizedEntries);
      setVisibleCount(PAGE_SIZE);
      setPublicLibraryStatus(
        normalizedEntries.length > 0
          ? `${normalizedEntries.length} public themes loaded. Bundled duplicates are hidden.`
          : 'No additional public themes found. Bundled duplicates are hidden.'
      );
    } catch (error) {
      setPublicLibraryStatus(
        error instanceof TypeError
          ? 'Public library is unavailable. Bundled and imported themes are still available.'
          : error instanceof Error
            ? error.message
            : 'Could not load the public library.'
      );
    } finally {
      setPublicLibraryLoading(false);
    }
  }, [existingEntryIdKey, publicLibraryUrl]);

  useEffect(() => {
    if (!publicLibraryUrl) {
      return;
    }

    void loadPublicLibrary();
  }, [loadPublicLibrary, publicLibraryUrl]);

  const displayEntries = useMemo<DisplayThemeLibraryEntry[]>(
    () => [
      ...entries.map(entry => ({ entry, source: sourceForEntry(entry) })),
      ...publicEntries.map(entry => ({ entry, source: 'public' as const })),
    ],
    [entries, publicEntries]
  );

  const filteredEntries = useMemo(
    () =>
      displayEntries.filter(({ entry, source }) =>
        (sourceFilter === 'all' || sourceFilter === source) &&
        entryMatchesMode(entry, modeFilter) &&
        entryMatchesSearch(entry, searchTerm)
      ),
    [displayEntries, modeFilter, searchTerm, sourceFilter]
  );

  const visibleEntries = filteredEntries.slice(0, visibleCount);

  function getApplyableThemes(entry: ThemeLibraryEntry) {
    const lightTheme = entry.themes.find(theme => theme.base === 'light');
    const darkTheme = entry.themes.find(theme => theme.base === 'dark');
    return [lightTheme, darkTheme].filter(Boolean) as HeadlampTheme[];
  }

  function importEntryFromData(data: unknown, fallbackName: string, sourceUrl?: string) {
    const entry = getImportedLibraryEntry(data, fallbackName);
    onImportEntry?.({
      ...entry,
      jsonUrl: sourceUrl ?? entry.jsonUrl,
    });
    setImportStatus(`Imported ${entry.name}.`);
    return entry;
  }

  function importUrlFileName(url: string) {
    try {
      const parsedUrl = new URL(url);
      const pathParts = parsedUrl.pathname.split('/').filter(Boolean);
      return pathParts[pathParts.length - 1] || 'Imported URL Theme';
    } catch {
      return 'Imported URL Theme';
    }
  }

  function handleImportFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    const reader = new FileReader();
    reader.onload = loadEvent => {
      try {
        importEntryFromData(JSON.parse(String(loadEvent.target?.result ?? '')), file.name);
      } catch (error) {
        setImportStatus(error instanceof Error ? error.message : 'Could not import theme JSON.');
      }
    };
    reader.readAsText(file);
    event.target.value = '';
  }

  async function handleImportUrl() {
    const url = importUrl.trim();
    if (!url) {
      setImportStatus('Enter a JSON URL to import.');
      return;
    }

    try {
      const normalizedImport = normalizeThemeImportUrl(url);
      const response = await fetch(normalizedImport.url);
      if (!response.ok) {
        throw new Error(`Could not fetch theme JSON (${response.status}).`);
      }
      let data: unknown;
      try {
        data = await response.json();
      } catch {
        throw new Error('The URL did not return valid theme JSON.');
      }
      const entry = importEntryFromData(data, importUrlFileName(normalizedImport.url), normalizedImport.url);
      setImportStatus(
        normalizedImport.wasConverted
          ? `Converted GitHub file URL to raw JSON.\nImported ${entry.name}.`
          : `Imported ${entry.name}.`
      );
      setImportUrl('');
    } catch (error) {
      if (error instanceof TypeError) {
        setImportStatus(
          'Could not fetch the theme JSON. The host may be blocking browser requests with CORS.'
        );
        return;
      }

      setImportStatus(
        error instanceof Error
          ? error.message
          : 'Could not import theme JSON from URL.'
      );
    }
  }

  function resetVisibleEntries() {
    setVisibleCount(PAGE_SIZE);
  }

  function clearFilters() {
    setSearchTerm('');
    setModeFilter('all');
    setSourceFilter('all');
    resetVisibleEntries();
  }

  async function copyJsonUrl(entry: ThemeLibraryEntry) {
    if (!entry.jsonUrl) {
      setSnackbarMessage('This theme does not have a public JSON URL.');
      return;
    }

    try {
      await navigator.clipboard.writeText(entry.jsonUrl);
      setSnackbarMessage(`Copied ${entry.name} JSON URL.`);
    } catch {
      window.prompt('Copy this JSON URL:', entry.jsonUrl);
    }
  }

  return (
    <Box sx={{ height: '100%', overflow: 'auto', p: 2 }}>
      <Box sx={{ mb: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 700 }}>
          Theme Library
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Pick a bundled, imported, or public theme to apply, edit, import, or download.
        </Typography>
      </Box>

      {onImportEntry && (
        <Box
          sx={{
            mb: 2,
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            flexWrap: 'wrap',
          }}
        >
          <Button size="small" variant="outlined" onClick={() => importInputRef.current?.click()}>
            Import JSON
          </Button>
          <input
            ref={importInputRef}
            type="file"
            accept="application/json,.json"
            style={{ display: 'none' }}
            onChange={handleImportFile}
          />
          <TextField
            size="small"
            value={importUrl}
            onChange={event => setImportUrl(event.target.value)}
            placeholder="https://.../theme.json"
            sx={{ minWidth: 260, maxWidth: 520, flex: '1 1 260px' }}
          />
          <Button size="small" variant="outlined" onClick={handleImportUrl}>
            Import URL
          </Button>
          {importStatus && (
            <Typography variant="caption" color="text.secondary" sx={{ whiteSpace: 'pre-line' }}>
              {importStatus}
            </Typography>
          )}
          {publicLibraryStatus && (
            <Typography variant="caption" color="text.secondary" sx={{ whiteSpace: 'pre-line' }}>
              {publicLibraryStatus}
            </Typography>
          )}
          {publicLibraryLoading && (
            <Typography variant="caption" color="text.secondary">
              Loading public library...
            </Typography>
          )}
        </Box>
      )}

      <Box
        sx={{
          mb: 2,
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            md: 'minmax(220px, 1fr) 180px 180px auto auto',
          },
          gap: 1,
          alignItems: 'center',
        }}
      >
        <TextField
          size="small"
          label="Search themes"
          value={searchTerm}
          onChange={event => {
            setSearchTerm(event.target.value);
            resetVisibleEntries();
          }}
        />
        <TextField
          select
          size="small"
          label="Mode"
          value={modeFilter}
          onChange={event => {
            setModeFilter(event.target.value as ModeFilter);
            resetVisibleEntries();
          }}
        >
          <MenuItem value="all">All modes</MenuItem>
          <MenuItem value="pair">Pairs</MenuItem>
          <MenuItem value="light">Light</MenuItem>
          <MenuItem value="dark">Dark</MenuItem>
        </TextField>
        <TextField
          select
          size="small"
          label="Source"
          value={sourceFilter}
          onChange={event => {
            setSourceFilter(event.target.value as SourceFilter);
            resetVisibleEntries();
          }}
        >
          <MenuItem value="all">All sources</MenuItem>
          <MenuItem value="bundled">Bundled</MenuItem>
          <MenuItem value="imported">Imported</MenuItem>
          <MenuItem value="public">Public Library</MenuItem>
        </TextField>
        <Button
          size="small"
          variant="outlined"
          onClick={clearFilters}
          disabled={!searchTerm && modeFilter === 'all' && sourceFilter === 'all'}
          sx={{ whiteSpace: 'nowrap' }}
        >
          Clear filters
        </Button>
        {publicLibraryUrl && (
          <Button
            size="small"
            variant="text"
            onClick={() => void loadPublicLibrary()}
            disabled={publicLibraryLoading}
            sx={{ whiteSpace: 'nowrap' }}
          >
            Refresh public library
          </Button>
        )}
      </Box>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
          gap: 2,
        }}
      >
        {visibleEntries.map(({ entry, source }) => {
          const hasLight = entry.themes.some(theme => theme.base === 'light');
          const hasDark = entry.themes.some(theme => theme.base === 'dark');
          const previewTheme = getPreviewThemeForMode(entry, previewModes[entry.id]);
          return (
            <Box
              key={`${source}-${entry.id}`}
              sx={{
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 1,
                bgcolor: 'background.paper',
                p: 1.5,
                display: 'flex',
                flexDirection: 'column',
                gap: 1.25,
              }}
            >
              <Box sx={{ position: 'relative' }}>
                <MiniPreview theme={previewTheme} />
                {onDeleteEntry && entry.tags.includes('imported') && (
                  <IconButton
                    size="small"
                    color="error"
                    aria-label={`Delete ${entry.name}`}
                    onClick={() => onDeleteEntry(entry)}
                    sx={{
                      position: 'absolute',
                      top: 6,
                      right: 6,
                      width: 24,
                      height: 24,
                      bgcolor: 'rgba(0,0,0,0.72)',
                      color: 'error.light',
                      border: '1px solid',
                      borderColor: 'error.main',
                      fontSize: 18,
                      lineHeight: 1,
                      '&:hover': {
                        bgcolor: 'error.main',
                        color: 'error.contrastText',
                      },
                    }}
                  >
                    ×
                  </IconButton>
                )}
                {hasLight && hasDark && (
                  <ToggleButtonGroup
                    exclusive
                    size="small"
                    value={previewTheme.base}
                    onChange={(_, value: 'light' | 'dark' | null) => {
                      if (!value) {
                        return;
                      }
                      setPreviewModes(modes => ({ ...modes, [entry.id]: value }));
                    }}
                    aria-label={`${entry.name} preview mode`}
                    sx={{
                      position: 'absolute',
                      right: 8,
                      bottom: 8,
                      bgcolor: 'background.paper',
                      borderRadius: 1,
                      boxShadow: 1,
                      '& .MuiToggleButton-root': {
                        px: 0.75,
                        py: 0.25,
                        fontSize: 11,
                        lineHeight: 1.2,
                      },
                    }}
                  >
                    <ToggleButton value="light" aria-label="Preview light theme">
                      Light
                    </ToggleButton>
                    <ToggleButton value="dark" aria-label="Preview dark theme">
                      Dark
                    </ToggleButton>
                  </ToggleButtonGroup>
                )}
              </Box>

              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, minWidth: 0, flex: 1 }}>
                    {entry.name}
                  </Typography>
                  <Chip size="small" label={sourceLabel(source)} />
                  <Chip size="small" label={modeLabel(entry.themes)} />
                </Box>
                <Typography variant="body2" color="text.secondary" sx={{ minHeight: 40 }}>
                  {entry.description}
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', gap: 0.75, flexWrap: 'wrap' }}>
                {entry.tags.map(tag => (
                  <Chip key={tag} size="small" label={tag} variant="outlined" />
                ))}
              </Box>

              <Box sx={{ display: 'flex', gap: 1, mt: 'auto' }}>
                {source === 'public' ? (
                  <>
                    <Button
                      size="small"
                      variant="contained"
                      onClick={() => {
                        const importedEntry = toImportedEntry(entry);
                        onImportEntry?.(importedEntry);
                        setImportStatus(`Imported ${entry.name} from the public library.`);
                        setSourceFilter('imported');
                        setVisibleCount(PAGE_SIZE);
                      }}
                    >
                      Import
                    </Button>
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() => void copyJsonUrl(entry)}
                      disabled={!entry.jsonUrl}
                    >
                      Copy JSON URL
                    </Button>
                  </>
                ) : onApply && (
                  getApplyableThemes(entry).length > 1 ? (
                    <Button
                      size="small"
                      variant="contained"
                      onClick={event => setApplyMenu({ entry, anchorEl: event.currentTarget })}
                    >
                      {applyLabel}
                    </Button>
                  ) : (
                    <Button size="small" variant="contained" onClick={() => onApply(entry, entry.themes[0])}>
                      {applyLabel}
                    </Button>
                  )
                )}
                {source !== 'public' && (
                  <>
                    <Button size="small" variant="outlined" onClick={() => onEdit(entry)}>
                      Edit
                    </Button>
                    <Button size="small" variant="text" onClick={() => onDownload(entry)}>
                      Download plugin
                    </Button>
                  </>
                )}
              </Box>
            </Box>
          );
        })}
      </Box>
      <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 1 }}>
        <Typography variant="caption" color="text.secondary">
          Showing {Math.min(visibleCount, filteredEntries.length)} of {filteredEntries.length} themes
        </Typography>
        {visibleCount < filteredEntries.length && (
          <Button
            size="small"
            variant="outlined"
            onClick={() => setVisibleCount(count => count + PAGE_SIZE)}
          >
            Show more
          </Button>
        )}
      </Box>
      {onApply && (
        <Menu
          anchorEl={applyMenu?.anchorEl ?? null}
          open={Boolean(applyMenu)}
          onClose={() => setApplyMenu(null)}
          slotProps={{ list: { dense: true } }}
        >
          {applyMenu &&
            getApplyableThemes(applyMenu.entry).map(theme => (
              <MenuItem
                key={theme.name}
                onClick={() => {
                  onApply(applyMenu.entry, theme);
                  setApplyMenu(null);
                }}
              >
                {theme.base === 'light' ? 'Apply light theme' : 'Apply dark theme'}
              </MenuItem>
          ))}
        </Menu>
      )}
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
  );
}
