import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { useState } from 'react';
import type { HeadlampTheme } from '../types/theme';

const REPO = 'PixelRobots/headlamp-theme-builder';
const ISSUE_LABEL = 'theme-submission';

interface Props {
  open: boolean;
  onClose: () => void;
  lightTheme: HeadlampTheme;
  darkTheme: HeadlampTheme;
}

export default function SubmitToLibraryDialog({ open, onClose, lightTheme, darkTheme }: Props) {
  const [themeName, setThemeName] = useState('');
  const [description, setDescription] = useState('');

  const themes = [lightTheme, darkTheme].filter(
    t => !['Light', 'Dark'].includes(t.name)
  );
  if (!themes.length) {
    themes.push(lightTheme);
  }

  const displayName = themeName.trim() || lightTheme.name;

  const issueBody = [
    `## Theme submission: ${displayName}`,
    '',
    description.trim() ? `**Description:** ${description.trim()}` : '',
    '',
    '### Theme JSON',
    '',
    '```json',
    JSON.stringify(
      {
        id: displayName.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        name: displayName,
        description: description.trim() || `A custom Headlamp theme.`,
        tags: [],
        themes,
      },
      null,
      2
    ),
    '```',
    '',
    '_Submitted via Headlamp Theme Builder_',
  ]
    .filter(line => line !== undefined)
    .join('\n');

  const issueTitle = encodeURIComponent(`Theme submission: ${displayName}`);
  const issueBodyEncoded = encodeURIComponent(issueBody);
  const issueLabel = encodeURIComponent(ISSUE_LABEL);
  // body= takes precedence over template= on GitHub, so the form is pre-filled.
  // The template is still referenced so manual submissions via GitHub also get
  // the structured fields.
  const issueUrl =
    `https://github.com/${REPO}/issues/new` +
    `?template=theme-submission.yml` +
    `&title=${issueTitle}` +
    `&body=${issueBodyEncoded}` +
    `&labels=${issueLabel}`;

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
          label="Description (optional)"
          value={description}
          onChange={e => setDescription(e.target.value)}
          placeholder="A brief description of the theme's style or inspiration."
          fullWidth
          multiline
          minRows={2}
        />
        <Box
          component="pre"
          sx={{
            bgcolor: 'background.default',
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 1,
            p: 1.5,
            fontSize: '0.68rem',
            fontFamily: 'monospace',
            overflowX: 'auto',
            whiteSpace: 'pre',
            maxHeight: 180,
            overflowY: 'auto',
            color: 'text.secondary',
          }}
        >
          {themes.map(t => `${t.base}: ${t.name}`).join('\n')}
        </Box>
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
