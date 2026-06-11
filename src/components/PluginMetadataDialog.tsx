import { useEffect, useState } from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import type { PluginMetadata } from '../utils/generateCode';

interface Props {
  open: boolean;
  initialName: string;
  onClose: () => void;
  onConfirm: (metadata: PluginMetadata) => void;
}

function slugify(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'my-theme';
}

function isVersion(value: string): boolean {
  return /^\d+\.\d+\.\d+(?:[-+][0-9A-Za-z.-]+)?$/.test(value);
}

export default function PluginMetadataDialog({
  open,
  initialName,
  onClose,
  onConfirm,
}: Props) {
  const [name, setName] = useState('');
  const [version, setVersion] = useState('0.1.0');
  const [description, setDescription] = useState('');
  const [author, setAuthor] = useState('');

  useEffect(() => {
    if (!open) {
      return;
    }

    setName(initialName);
    setVersion('0.1.0');
    setDescription(`Headlamp theme plugin: ${initialName}`);
    setAuthor('');
  }, [initialName, open]);

  const packageName = slugify(name);
  const canDownload = name.trim().length > 0 && isVersion(version);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontWeight: 700 }}>Download theme plugin</DialogTitle>
      <DialogContent dividers sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Typography variant="body2" color="text.secondary">
          These values are written into the generated plugin package.json.
        </Typography>
        <TextField
          label="Plugin name"
          value={name}
          onChange={event => setName(event.target.value)}
          helperText={`Package folder/name: ${packageName}`}
          fullWidth
          autoFocus
        />
        <TextField
          label="Version"
          value={version}
          onChange={event => setVersion(event.target.value)}
          error={version.length > 0 && !isVersion(version)}
          helperText="Use semantic version format, for example 0.1.0."
          fullWidth
        />
        <TextField
          label="Description"
          value={description}
          onChange={event => setDescription(event.target.value)}
          fullWidth
        />
        <TextField
          label="Author/provider"
          value={author}
          onChange={event => setAuthor(event.target.value)}
          fullWidth
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          variant="contained"
          disabled={!canDownload}
          onClick={() =>
            onConfirm({
              name,
              version,
              description,
              author: author || undefined,
            })
          }
        >
          Download plugin
        </Button>
      </DialogActions>
    </Dialog>
  );
}
