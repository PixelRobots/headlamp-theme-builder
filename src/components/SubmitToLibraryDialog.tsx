import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { useEffect, useState } from 'react';
import type { HeadlampTheme } from '../types/theme';

const REPO = 'PixelRobots/headlamp-theme-builder';
const ISSUE_LABEL = 'theme-submission';
const VARIANT_LABELS = {
  light: 'Light only',
  dark: 'Dark only',
  both: 'Both light and dark',
} as const;

type VariantSelection = keyof typeof VARIANT_LABELS;

interface Props {
  open: boolean;
  onClose: () => void;
  lightTheme: HeadlampTheme;
  darkTheme: HeadlampTheme;
}

export default function SubmitToLibraryDialog({ open, onClose, lightTheme, darkTheme }: Props) {
  const [themeName, setThemeName] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState('');
  const [variantSelection, setVariantSelection] = useState<VariantSelection>('both');

  const lightCandidate =
    lightTheme.base === 'light' ? lightTheme : darkTheme.base === 'light' ? darkTheme : null;
  const darkCandidate =
    darkTheme.base === 'dark' ? darkTheme : lightTheme.base === 'dark' ? lightTheme : null;
  const canSubmitLight = Boolean(lightCandidate);
  const canSubmitDark = Boolean(darkCandidate);
  const canSubmitBoth = canSubmitLight && canSubmitDark;

  useEffect(() => {
    if (variantSelection === 'both' && !canSubmitBoth) {
      setVariantSelection(canSubmitDark ? 'dark' : 'light');
    } else if (variantSelection === 'light' && !canSubmitLight) {
      setVariantSelection(canSubmitDark ? 'dark' : 'both');
    } else if (variantSelection === 'dark' && !canSubmitDark) {
      setVariantSelection(canSubmitLight ? 'light' : 'both');
    }
  }, [canSubmitBoth, canSubmitDark, canSubmitLight, variantSelection]);

  const selectedThemes =
    variantSelection === 'both'
      ? [lightCandidate, darkCandidate].filter(Boolean)
      : variantSelection === 'light'
        ? [lightCandidate].filter(Boolean)
        : [darkCandidate].filter(Boolean);
  const themes = selectedThemes.length ? (selectedThemes as HeadlampTheme[]) : [lightTheme];

  const displayName = themeName.trim() || lightTheme.name;
  const themeDescription = description.trim() || `A custom Headlamp theme.`;
  const tagList = tags
    .split(',')
    .map(tag => tag.trim())
    .filter(Boolean);
  const variants = VARIANT_LABELS[variantSelection];
  const themeJson = JSON.stringify(
    {
      id: displayName.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      name: displayName,
      description: themeDescription,
      tags: tagList,
      themes,
    },
    null,
    2
  );

  const issueParams = new URLSearchParams({
    template: 'theme-submission.yml',
    title: `Theme submission: ${displayName}`,
    labels: ISSUE_LABEL,
    name: displayName,
    description: themeDescription,
    variants,
    'theme-json': themeJson,
    tags: tagList.join(', '),
  });
  const issueUrl = `https://github.com/${REPO}/issues/new?${issueParams.toString()}`;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontWeight: 700 }}>Submit to community library</DialogTitle>
      <DialogContent dividers sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Typography variant="body2" color="text.secondary">
          This opens a GitHub issue pre-filled with your theme JSON. A maintainer will review and
          merge it into the public library.
        </Typography>
        <TextField
          label="Theme name (for the submission)"
          value={themeName}
          onChange={e => setThemeName(e.target.value)}
          placeholder={lightTheme.name}
          fullWidth
          autoFocus
        />
        <TextField
          label="Description"
          value={description}
          onChange={e => setDescription(e.target.value)}
          placeholder="A brief description of the theme's style or inspiration."
          fullWidth
          multiline
          minRows={2}
        />
        <TextField
          label="Tags (optional)"
          value={tags}
          onChange={e => setTags(e.target.value)}
          placeholder="dark, minimal, high-contrast"
          fullWidth
        />
        <TextField
          label="Variants included"
          value={variantSelection}
          onChange={e => setVariantSelection(e.target.value as VariantSelection)}
          select
          fullWidth
        >
          <MenuItem value="light" disabled={!canSubmitLight}>
            Light only
          </MenuItem>
          <MenuItem value="dark" disabled={!canSubmitDark}>
            Dark only
          </MenuItem>
          <MenuItem value="both" disabled={!canSubmitBoth}>
            Both light and dark
          </MenuItem>
        </TextField>
        <Typography variant="caption" color="text.secondary">
          The issue form will receive the selected variants and matching theme JSON.
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          variant="contained"
          onClick={() => {
            window.open(issueUrl, '_blank', 'noopener,noreferrer');
            onClose();
          }}
        >
          Open GitHub issue
        </Button>
      </DialogActions>
    </Dialog>
  );
}
