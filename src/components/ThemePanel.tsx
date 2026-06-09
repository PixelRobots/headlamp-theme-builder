import React from 'react';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import ColorField from './ColorField';
import type { HeadlampTheme } from '../types/theme';

interface Props {
  theme: HeadlampTheme;
  onChange: (t: HeadlampTheme) => void;
}

function setPath(obj: HeadlampTheme, path: string, value: unknown): HeadlampTheme {
  const keys = path.split('.');
  const copy = { ...obj } as Record<string, unknown>;
  if (keys.length === 1) {
    copy[keys[0]] = value;
  } else {
    copy[keys[0]] = { ...(copy[keys[0]] as object), [keys[1]]: value };
  }
  return copy as HeadlampTheme;
}

function getPath(obj: HeadlampTheme, path: string): string {
  const keys = path.split('.');
  let cur: unknown = obj;
  for (const k of keys) cur = (cur as Record<string, unknown>)[k];
  return cur as string;
}

const COLOUR_FIELDS: { label: string; path: string }[] = [
  { label: 'Primary', path: 'primary' },
  { label: 'Secondary', path: 'secondary' },
  { label: 'Text — primary', path: 'text.primary' },
  { label: 'Link colour', path: 'link.color' },
  { label: 'Background — page', path: 'background.default' },
  { label: 'Background — card / surface', path: 'background.surface' },
  { label: 'Background — muted', path: 'background.muted' },
  { label: 'Sidebar — background', path: 'sidebar.background' },
  { label: 'Sidebar — text', path: 'sidebar.color' },
  { label: 'Sidebar — selected bg', path: 'sidebar.selectedBackground' },
  { label: 'Sidebar — selected text', path: 'sidebar.selectedColor' },
  { label: 'Navbar — background', path: 'navbar.background' },
  { label: 'Navbar — text', path: 'navbar.color' },
];

export default function ThemePanel({ theme, onChange }: Props) {
  const set = (path: string) => (value: unknown) =>
    onChange(setPath(theme, path, value));

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, p: 2, overflowY: 'auto' }}>
      <Typography variant="h6">Theme settings</Typography>

      <TextField
        label="Theme name"
        value={theme.name}
        onChange={e => set('name')(e.target.value)}
        size="small"
        fullWidth
      />

      <FormControl size="small" fullWidth>
        <InputLabel>Base</InputLabel>
        <Select
          value={theme.base}
          label="Base"
          onChange={e => set('base')(e.target.value)}
        >
          <MenuItem value="light">Light</MenuItem>
          <MenuItem value="dark">Dark</MenuItem>
        </Select>
      </FormControl>

      <Divider />
      <Typography variant="subtitle2">Colours</Typography>

      {COLOUR_FIELDS.map(f => (
        <ColorField
          key={f.path}
          label={f.label}
          value={getPath(theme, f.path)}
          onChange={v => set(f.path)(v)}
        />
      ))}
    </Box>
  );
}
