import CheckIcon from '@mui/icons-material/Check';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { useState } from 'react';
import { detectOS, pluginArchiveFormat } from '../utils/os';

interface Props {
  open: boolean;
  onClose: () => void;
  pluginName?: string;
}

function getPluginsPath(os: ReturnType<typeof detectOS>, pluginName: string): string {
  switch (os) {
    case 'windows':
      return `%APPDATA%\\Headlamp\\user-plugins\\${pluginName}\\`;
    case 'mac':
      return `~/Library/Application Support/Headlamp/user-plugins/${pluginName}/`;
    default:
      return `~/.local/share/Headlamp/user-plugins/${pluginName}/`;
  }
}

export default function InstallInstructionsDialog({
  open,
  onClose,
  pluginName = '<plugin-name>',
}: Props) {
  const [copied, setCopied] = useState(false);
  const os = detectOS();
  const format = pluginArchiveFormat(os);
  const pluginsPath = getPluginsPath(os, pluginName);

  function handleCopy() {
    navigator.clipboard.writeText(pluginsPath).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontWeight: 700 }}>Plugin downloaded</DialogTitle>
      <DialogContent dividers>
        <Typography component="p" variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          The <strong>.{format}</strong> file contains only the files Headlamp needs to load the
          generated theme plugin: <strong>main.js</strong> and <strong>package.json</strong>.
        </Typography>
        <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
          Install it in Headlamp
        </Typography>
        <Box
          component="pre"
          sx={{
            bgcolor: '#f5f5f5',
            border: '1px solid #ddd',
            borderRadius: 1,
            p: 1.5,
            m: 0,
            mb: 2,
            fontSize: '0.75rem',
            fontFamily: 'monospace',
            overflowX: 'auto',
            whiteSpace: 'pre',
            color: '#333',
          }}
        >
          {['1. Unzip the downloaded file.', '2. Copy the plugin folder to the path below.', '3. Restart Headlamp.', '4. Select the theme in Settings > General > Theme.'].join('\n')}
        </Box>
        <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.5 }}>
          Plugins directory
        </Typography>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            bgcolor: '#f5f5f5',
            border: '1px solid #ddd',
            borderRadius: 1,
            px: 1.5,
            py: 1,
            gap: 1,
          }}
        >
          <Typography
            sx={{
              fontFamily: 'monospace',
              fontSize: '0.75rem',
              color: '#333',
              flex: 1,
              wordBreak: 'break-all',
            }}
          >
            {pluginsPath}
          </Typography>
          <Tooltip title={copied ? 'Copied!' : 'Copy path'} placement="top">
            <IconButton size="small" onClick={handleCopy} aria-label="Copy plugins path">
              {copied ? <CheckIcon fontSize="small" /> : <ContentCopyIcon fontSize="small" />}
            </IconButton>
          </Tooltip>
        </Box>
        <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
          Detected OS: {os === 'windows' ? 'Windows' : os === 'mac' ? 'macOS' : 'Linux'}
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} variant="contained">
          Got it
        </Button>
      </DialogActions>
    </Dialog>
  );
}
