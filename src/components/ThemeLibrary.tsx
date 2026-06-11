import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { useRef, useState, type ChangeEvent } from 'react';
import type { ThemeLibraryEntry } from '../library/themeLibrary';
import type { HeadlampTheme } from '../types/theme';
import { getImportedLibraryEntry } from '../utils/themeImport';

interface ThemeLibraryProps {
  entries: ThemeLibraryEntry[];
  onApply?: (entry: ThemeLibraryEntry, theme?: HeadlampTheme) => void;
  onEdit: (entry: ThemeLibraryEntry) => void;
  onDownload: (entry: ThemeLibraryEntry) => void;
  onImportEntry?: (entry: ThemeLibraryEntry) => void;
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
          <Box sx={{ height: 14, mb: 0.75, borderRadius: 0.75, bgcolor: theme.sidebar.selectedBackground }} />
          <Box sx={{ height: 9, mb: 0.75, borderRadius: 0.5, bgcolor: theme.sidebar.color, opacity: 0.45 }} />
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
  applyLabel = 'Apply',
}: ThemeLibraryProps) {
  const importInputRef = useRef<HTMLInputElement>(null);
  const [applyMenu, setApplyMenu] = useState<{
    entry: ThemeLibraryEntry;
    anchorEl: HTMLElement;
  } | null>(null);
  const [importUrl, setImportUrl] = useState('');
  const [importStatus, setImportStatus] = useState<string | null>(null);

  function getApplyableThemes(entry: ThemeLibraryEntry) {
    const lightTheme = entry.themes.find(theme => theme.base === 'light');
    const darkTheme = entry.themes.find(theme => theme.base === 'dark');
    return [lightTheme, darkTheme].filter(Boolean) as HeadlampTheme[];
  }

  function importEntryFromData(data: unknown, fallbackName: string) {
    const entry = getImportedLibraryEntry(data, fallbackName);
    onImportEntry?.(entry);
    setImportStatus(`Imported ${entry.name}.`);
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
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Could not fetch theme JSON (${response.status}).`);
      }
      importEntryFromData(await response.json(), url.split('/').pop() || 'Imported URL Theme');
      setImportUrl('');
    } catch (error) {
      setImportStatus(
        error instanceof Error
          ? error.message
          : 'Could not import theme JSON from URL.'
      );
    }
  }

  return (
    <Box sx={{ height: '100%', overflow: 'auto', p: 2 }}>
      <Box sx={{ mb: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 700 }}>
          Theme Library
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Pick a bundled theme to edit in the builder or download it as a dedicated Headlamp theme plugin.
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
            <Typography variant="caption" color="text.secondary">
              {importStatus}
            </Typography>
          )}
        </Box>
      )}

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
          gap: 2,
        }}
      >
        {entries.map(entry => {
          const previewTheme = getPreviewTheme(entry);
          return (
            <Box
              key={entry.id}
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
              <MiniPreview theme={previewTheme} />

              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, minWidth: 0, flex: 1 }}>
                    {entry.name}
                  </Typography>
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
                {onApply && (
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
                <Button size="small" variant="outlined" onClick={() => onEdit(entry)}>
                  Edit
                </Button>
                <Button size="small" variant="text" onClick={() => onDownload(entry)}>
                  Download
                </Button>
              </Box>
            </Box>
          );
        })}
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
    </Box>
  );
}
