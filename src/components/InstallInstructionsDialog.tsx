import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function InstallInstructionsDialog({ open, onClose }: Props) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontWeight: 700 }}>Plugin downloaded</DialogTitle>
      <DialogContent dividers>
        <Typography component="p" variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          The zip contains only the files Headlamp needs to load the generated theme plugin:
          <strong> main.js</strong> and <strong> package.json</strong>.
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
            fontSize: '0.75rem',
            fontFamily: 'monospace',
            overflowX: 'auto',
            whiteSpace: 'pre',
            color: '#333',
          }}
        >
          {[
            '1. Unzip the downloaded file.',
            '2. Copy the generated plugin folder to:',
            '   Windows:',
            '     %APPDATA%\\Headlamp\\Config\\user-plugins\\<plugin-name>\\',
            '   Linux / macOS:',
            '     ~/.config/Headlamp/Config/user-plugins/<plugin-name>/',
            '3. Restart Headlamp.',
            '4. Select the theme in Settings > General > Theme.',
          ].join('\n')}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} variant="contained">
          Got it
        </Button>
      </DialogActions>
    </Dialog>
  );
}
