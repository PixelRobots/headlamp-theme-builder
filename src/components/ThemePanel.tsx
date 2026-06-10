import { useRef, useState, type ChangeEvent, type ReactNode } from 'react';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Button from '@mui/material/Button';
import Collapse from '@mui/material/Collapse';
import { useTheme } from '@mui/material/styles';
import ColorField from './ColorField';
import type { HeadlampTheme } from '../types/theme';
import { contrastRatio, getContrastResult } from '../utils/contrast';

interface Props {
  theme: HeadlampTheme;
  onChange: (t: HeadlampTheme) => void;
  /** Called when the user changes the Base mode dropdown, so the active editable theme changes */
  onBaseChange: (base: 'light' | 'dark') => void;
  logoDataUrl: string | null;
  onLogoChange: (url: string | null) => void;
  onHighlightPath: (path: string | null) => void;
  uploadIcon?: ReactNode;
  deleteIcon?: ReactNode;
}

function setPath(obj: HeadlampTheme, path: string, value: unknown): HeadlampTheme {
  const keys = path.split('.');
  const copy = { ...obj } as Record<string, unknown>;
  let cur = copy;

  keys.forEach((key, index) => {
    if (index === keys.length - 1) {
      cur[key] = value;
      return;
    }

    const next = cur[key];
    cur[key] = typeof next === 'object' && next !== null ? { ...next } : {};
    cur = cur[key] as Record<string, unknown>;
  });

  return copy as unknown as HeadlampTheme;
}

function getPath(obj: HeadlampTheme, path: string): string {
  const keys = path.split('.');
  let cur: unknown = obj;
  for (const k of keys) {
    if (typeof cur !== 'object' || cur === null || !(k in cur)) {
      return '#000000';
    }

    cur = (cur as Record<string, unknown>)[k];
  }

  return typeof cur === 'string' ? cur : '#000000';
}

const COLOUR_GROUPS: { group: string; fields: { label: string; path: string }[] }[] = [
  {
    group: 'Brand',
    fields: [
      { label: 'Primary', path: 'primary' },
      { label: 'Secondary', path: 'secondary' },
    ],
  },
  {
    group: 'Text & links',
    fields: [
      { label: 'Body text', path: 'text.primary' },
      { label: 'Link colour', path: 'link.color' },
    ],
  },
  {
    group: 'Background',
    fields: [
      { label: 'Page background', path: 'background.default' },
      { label: 'Card / surface', path: 'background.surface' },
      { label: 'Muted / subtle', path: 'background.muted' },
    ],
  },
  {
    group: 'Sidebar',
    fields: [
      { label: 'Background', path: 'sidebar.background' },
      { label: 'Item text', path: 'sidebar.color' },
      { label: 'Selected background', path: 'sidebar.selectedBackground' },
      { label: 'Selected text', path: 'sidebar.selectedColor' },
    ],
  },
  {
    group: 'Navbar / header',
    fields: [
      { label: 'Background', path: 'navbar.background' },
      { label: 'Text', path: 'navbar.color' },
    ],
  },
  {
    group: 'Terminal',
    fields: [
      { label: 'Background', path: 'terminal.background' },
      { label: 'Text', path: 'terminal.foreground' },
      { label: 'Cursor', path: 'terminal.cursor' },
    ],
  },
];

const FONT_OPTIONS = [
  { label: 'Roboto (MUI default)', value: 'Roboto, sans-serif' },
  { label: 'Inter', value: 'Inter, sans-serif' },
  { label: 'IBM Plex Sans', value: '"IBM Plex Sans", sans-serif' },
  { label: 'Source Sans Pro', value: '"Source Sans Pro", sans-serif' },
  { label: 'Open Sans', value: '"Open Sans", sans-serif' },
  { label: 'Lato', value: 'Lato, sans-serif' },
  { label: 'Nunito', value: 'Nunito, sans-serif' },
  { label: 'DM Sans', value: '"DM Sans", sans-serif' },
  { label: 'System UI', value: 'system-ui, sans-serif' },
  { label: 'Segoe UI (Windows)', value: '"Segoe UI", sans-serif' },
  { label: 'Monospace', value: '"Courier New", monospace' },
];

const FIELD_DESCRIPTIONS: Record<string, string> = {
  primary: 'Main action colour. Used for contained buttons, cluster chip, and primary accents.',
  secondary: 'Secondary brand colour available to the generated Headlamp theme for secondary UI accents.',
  'text.primary': 'Default readable text colour for page headings and body copy.',
  'link.color': 'Link colour used for resource names and navigation-style text links.',
  'background.default': 'Main page background behind Headlamp content.',
  'background.surface': 'Card, table, panel, and raised surface background.',
  'background.muted': 'Subtle background available to the generated theme for quieter UI areas.',
  'sidebar.background': 'Left navigation/sidebar background.',
  'sidebar.color': 'Default text colour for unselected sidebar items.',
  'sidebar.selectedBackground': 'Background colour for the active sidebar item.',
  'sidebar.selectedColor': 'Accent and text colour associated with selected sidebar states.',
  'navbar.background': 'Top header and navbar background.',
  'navbar.color': 'Text and logo colour area in the top header.',
  'terminal.background': 'Background colour used by Headlamp terminal and log viewer surfaces.',
  'terminal.foreground': 'Default readable text colour used inside terminal and log viewers.',
  'terminal.cursor': 'Cursor colour used by the xterm.js terminal.',
};

function getContrastForPath(theme: HeadlampTheme, path: string) {
  if (path === 'primary') {
    const blackRatio = contrastRatio('#000000', theme.primary) ?? 0;
    const whiteRatio = contrastRatio('#ffffff', theme.primary) ?? 0;
    const textColor = blackRatio >= whiteRatio ? '#000000' : '#ffffff';
    const result = getContrastResult(textColor, theme.primary);
    return result
      ? { ...result, against: `${textColor === '#000000' ? 'black' : 'white'} button text` }
      : null;
  }

  const checks: Record<string, { foreground: string; background: string; against: string }> = {
    'text.primary': {
      foreground: theme.text.primary,
      background: theme.background.default,
      against: 'page background',
    },
    'link.color': {
      foreground: theme.link.color,
      background: theme.background.default,
      against: 'page background',
    },
    'navbar.color': {
      foreground: theme.navbar.color,
      background: theme.navbar.background,
      against: 'navbar background',
    },
    'sidebar.color': {
      foreground: theme.sidebar.color,
      background: theme.sidebar.background,
      against: 'sidebar background',
    },
    'sidebar.selectedColor': {
      foreground: theme.sidebar.selectedColor,
      background: theme.sidebar.selectedBackground,
      against: 'selected background',
    },
    'terminal.foreground': {
      foreground: theme.terminal?.foreground ?? theme.text.primary,
      background: theme.terminal?.background ?? theme.background.default,
      against: 'terminal background',
    },
    'terminal.cursor': {
      foreground: theme.terminal?.cursor ?? theme.primary,
      background: theme.terminal?.background ?? theme.background.default,
      against: 'terminal background',
    },
  };

  const check = checks[path];
  if (!check) {
    return null;
  }

  const result = getContrastResult(check.foreground, check.background);
  return result ? { ...result, against: check.against } : null;
}

export default function ThemePanel({
  theme,
  onChange,
  onBaseChange,
  logoDataUrl,
  onLogoChange,
  onHighlightPath,
  uploadIcon,
  deleteIcon,
}: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [openSections, setOpenSections] = useState(
    () =>
      new Set([
        'Theme',
        'Logo',
        'Brand',
        'Text & links',
        'Background',
        'Sidebar',
        'Navbar / header',
      ])
  );
  const muiTheme = useTheme();
  const fieldSx = {
    color: 'text.primary',
    '& .MuiOutlinedInput-notchedOutline': { borderColor: 'divider' },
    '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'text.secondary' },
  } as const;

  const set = (path: string) => (value: unknown) =>
    onChange(setPath(theme, path, value));

  function handleBaseChange(value: string) {
    onBaseChange(value as 'light' | 'dark');
  }

  const currentFont = theme.fontFamily?.join(', ') ?? 'Roboto, sans-serif';
  const knownFont = FONT_OPTIONS.find(o => o.value === currentFont)?.value ?? 'Roboto, sans-serif';

  function handleFontChange(value: string) {
    onChange({ ...theme, fontFamily: [value] });
  }

  function handleLogoFile(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => onLogoChange(ev.target?.result as string);
    reader.readAsDataURL(file);
    e.target.value = '';
  }

  function toggleSection(section: string) {
    setOpenSections(current => {
      const next = new Set(current);
      if (next.has(section)) {
        next.delete(section);
      } else {
        next.add(section);
      }
      return next;
    });
  }

  function Section({ title, children }: { title: string; children: ReactNode }) {
    const open = openSections.has(title);

    return (
      <Box
        sx={{
          borderBottom: '1px solid',
          borderColor: 'divider',
          flexShrink: 0,
        }}
      >
        <Button
          fullWidth
          onClick={() => toggleSection(title)}
          sx={{
            justifyContent: 'space-between',
            color: 'text.primary',
            bgcolor: 'transparent',
            borderRadius: 0,
            px: 0,
            py: 1.25,
            fontWeight: 700,
            textTransform: 'none',
            '&:hover': {
              bgcolor: 'transparent',
            },
          }}
        >
          <span>{title}</span>
          <span aria-hidden>{open ? '-' : '+'}</span>
        </Button>
        <Collapse in={open} unmountOnExit>
          <Box sx={{ pb: 1.5 }}>
            {children}
          </Box>
        </Collapse>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: 1,
        p: 2,
        overflowY: 'auto',
        height: '100%',
        minHeight: 0,
        boxSizing: 'border-box',
      }}
    >
      <Section title="Theme">
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          <TextField
            label="Theme name"
            value={theme.name}
            onChange={e => set('name')(e.target.value)}
            size="small"
            fullWidth
            slotProps={{
              inputLabel: { sx: { color: 'text.secondary' } },
              input: { sx: { color: 'text.primary' } },
            }}
            sx={{ '& .MuiOutlinedInput-notchedOutline': { borderColor: 'divider' } }}
          />

          <FormControl size="small" fullWidth>
            <InputLabel sx={{ color: 'text.secondary' }}>Base mode</InputLabel>
            <Select
              value={theme.base}
              label="Base mode"
              onChange={e => handleBaseChange(e.target.value)}
              sx={fieldSx}
            >
              <MenuItem value="light">Light</MenuItem>
              <MenuItem value="dark">Dark</MenuItem>
            </Select>
          </FormControl>

          <FormControl size="small" fullWidth>
            <InputLabel sx={{ color: 'text.secondary' }}>Font family</InputLabel>
            <Select
              value={knownFont}
              label="Font family"
              onChange={e => handleFontChange(e.target.value)}
              sx={fieldSx}
            >
              {FONT_OPTIONS.map(o => (
                <MenuItem key={o.value} value={o.value}>
                  <span style={{ fontFamily: o.value }}>{o.label}</span>
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
      </Section>

      <Section title="Logo">
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.64rem' }}>
            Used in Headlamp's normal desktop logo locations. A wide logo with text usually works best.
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {logoDataUrl && (
              <Box
                component="img"
                src={logoDataUrl}
                alt="logo preview"
                sx={{
                  height: 24,
                  maxWidth: 88,
                  objectFit: 'contain',
                  borderRadius: 0.5,
                  bgcolor: theme.navbar.background,
                }}
              />
            )}
            <Button
              size="small"
              variant="outlined"
              startIcon={uploadIcon}
              onClick={() => fileInputRef.current?.click()}
              sx={{ color: 'text.secondary', borderColor: 'divider', fontSize: '0.7rem' }}
            >
              {logoDataUrl ? 'Replace' : 'Upload'}
            </Button>
            {logoDataUrl && (
              <Button
                size="small"
                variant="text"
                startIcon={deleteIcon}
                onClick={() => onLogoChange(null)}
                sx={{ color: muiTheme.palette.error.main, fontSize: '0.7rem' }}
              >
                Remove
              </Button>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,.svg"
              style={{ display: 'none' }}
              onChange={handleLogoFile}
            />
          </Box>
        </Box>
      </Section>

      {/* Colour groups */}
      {COLOUR_GROUPS.map(group => (
        <Section key={group.group} title={group.group}>
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5 }}>
            {group.fields.map(f => (
              <ColorField
                key={f.path}
                label={f.label}
                value={getPath(theme, f.path)}
                onChange={v => set(f.path)(v)}
                description={FIELD_DESCRIPTIONS[f.path]}
                contrast={getContrastForPath(theme, f.path)}
                onHighlight={() => onHighlightPath(f.path)}
                onClearHighlight={() => onHighlightPath(null)}
              />
            ))}
          </Box>
        </Section>
      ))}
    </Box>
  );
}
