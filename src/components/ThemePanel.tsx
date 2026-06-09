import React, { useRef } from 'react';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Button from '@mui/material/Button';
import UploadIcon from '@mui/icons-material/Upload';
import DeleteIcon from '@mui/icons-material/Delete';
import ColorField from './ColorField';
import type { HeadlampTheme } from '../types/theme';

interface Props {
  theme: HeadlampTheme;
  onChange: (t: HeadlampTheme) => void;
  /** Called when the user changes the Base mode dropdown, so the top toggle stays in sync */
  onBaseChange: (base: 'light' | 'dark') => void;
  logoDataUrl: string | null;
  onLogoChange: (url: string | null) => void;
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
];

export default function ThemePanel({ theme, onChange, onBaseChange, logoDataUrl, onLogoChange }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const set = (path: string) => (value: unknown) =>
    onChange(setPath(theme, path, value));

  function handleBaseChange(value: string) {
    onChange(setPath(theme, 'base', value));
    onBaseChange(value as 'light' | 'dark');
  }

  function handleLogoFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => onLogoChange(ev.target?.result as string);
    reader.readAsDataURL(file);
    // reset so the same file can be re-uploaded
    e.target.value = '';
  }

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: 1.5,
        p: 2,
        overflowY: 'auto',
        height: '100%',
        boxSizing: 'border-box',
      }}
    >
      <Typography variant="subtitle2" sx={{ color: 'rgba(255,255,255,0.9)', fontWeight: 700 }}>
        Theme settings
      </Typography>

      <TextField
        label="Theme name"
        value={theme.name}
        onChange={e => set('name')(e.target.value)}
        size="small"
        fullWidth
        InputLabelProps={{ style: { color: 'rgba(255,255,255,0.6)' } }}
        InputProps={{ style: { color: '#fff' } }}
        sx={{ '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.2)' } }}
      />

      <FormControl size="small" fullWidth>
        <InputLabel sx={{ color: 'rgba(255,255,255,0.6)' }}>Base mode</InputLabel>
        <Select
          value={theme.base}
          label="Base mode"
          onChange={e => handleBaseChange(e.target.value)}
          sx={{ color: '#fff', '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.2)' } }}
        >
          <MenuItem value="light">Light</MenuItem>
          <MenuItem value="dark">Dark</MenuItem>
        </Select>
      </FormControl>

      <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)' }} />

      {/* Logo */}
      <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
        Logo (optional)
      </Typography>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        {logoDataUrl && (
          <Box
            component="img"
            src={logoDataUrl}
            alt="logo preview"
            sx={{ height: 24, maxWidth: 80, objectFit: 'contain', borderRadius: 0.5, bgcolor: theme.navbar.background }}
          />
        )}
        <Button
          size="small"
          variant="outlined"
          startIcon={<UploadIcon />}
          onClick={() => fileInputRef.current?.click()}
          sx={{ color: 'rgba(255,255,255,0.7)', borderColor: 'rgba(255,255,255,0.2)', fontSize: '0.7rem' }}
        >
          {logoDataUrl ? 'Replace' : 'Upload'}
        </Button>
        {logoDataUrl && (
          <Button
            size="small"
            variant="text"
            startIcon={<DeleteIcon />}
            onClick={() => onLogoChange(null)}
            sx={{ color: 'rgba(255,100,100,0.8)', fontSize: '0.7rem' }}
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

      <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)' }} />

      {/* Colour groups */}
      {COLOUR_GROUPS.map(group => (
        <Box key={group.group}>
          <Typography
            variant="caption"
            sx={{
              color: 'rgba(255,255,255,0.45)',
              fontSize: '0.68rem',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              display: 'block',
              mb: 1,
            }}
          >
            {group.group}
          </Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5 }}>
            {group.fields.map(f => (
              <ColorField
                key={f.path}
                label={f.label}
                value={getPath(theme, f.path)}
                onChange={v => set(f.path)(v)}
              />
            ))}
          </Box>
        </Box>
      ))}
    </Box>
  );
}
