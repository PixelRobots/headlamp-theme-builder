import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';

const STEPS = [
  {
    step: '1',
    title: 'Build your theme',
    body: 'Use the colour pickers on the left to customise each part of the Headlamp UI. Switch between Light and Dark to configure both variants independently.',
  },
  {
    step: '2',
    title: 'Download the plugin',
    body: 'Click "Download plugin" in the top bar. You will receive a zip file containing an installable, compiled Headlamp plugin folder with only the runtime files Headlamp needs.',
  },
  {
    step: '3',
    title: 'Install the plugin',
    body: 'Unzip the downloaded file and copy the generated plugin folder into your Headlamp user-plugins folder:',
    code:
      'Windows:\n  %APPDATA%\\Headlamp\\Config\\user-plugins\\<plugin-name>\\\n\nLinux / macOS:\n  ~/.config/Headlamp/Config/user-plugins/<plugin-name>/',
  },
  {
    step: '4',
    title: 'Apply your theme',
    body: 'Restart Headlamp, then go to Settings → General → Theme and select your theme from the list.',
  },
  {
    step: '5',
    title: 'Custom logo',
    body: 'If you upload a logo before downloading, the generated plugin registers it with Headlamp and includes it in the compiled bundle.',
  },
];

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function HowToUseDialog({ open, onClose }: Props) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontWeight: 700 }}>How to use</DialogTitle>
      <DialogContent dividers>
        {STEPS.map((s, i) => (
          <Box key={s.step}>
            {i > 0 && <Divider sx={{ my: 2 }} />}
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
              <Box
                sx={{
                  width: 28,
                  height: 28,
                  borderRadius: '50%',
                  bgcolor: 'primary.main',
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  flexShrink: 0,
                  mt: 0.25,
                }}
              >
                {s.step}
              </Box>
              <Box sx={{ flex: 1 }}>
                <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 700 }}>
                  {s.title}
                </Typography>
                <Typography component="p" variant="body2" color="text.secondary" sx={{ mb: s.code ? 1 : 0 }}>
                  {s.body}
                </Typography>
                {s.code && (
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
                    {s.code}
                  </Box>
                )}
              </Box>
            </Box>
          </Box>
        ))}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} variant="contained">
          Got it
        </Button>
      </DialogActions>
    </Dialog>
  );
}
