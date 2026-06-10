import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import ExtensionIcon from '@mui/icons-material/Extension';
import PaletteIcon from '@mui/icons-material/Palette';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

interface Props {
  open: boolean;
  onClose: () => void;
  onShowHelp: () => void;
}

const FEATURES = [
  {
    icon: <PaletteIcon fontSize="small" />,
    title: 'Design against a live Headlamp preview',
    body: 'Tune colours, surfaces, typography, sidebar states, and navbar contrast while seeing the result immediately.',
  },
  {
    icon: <ExtensionIcon fontSize="small" />,
    title: 'Export a real plugin',
    body: 'Download an installable zip with a compiled Headlamp plugin, editable source files, and package metadata.',
  },
  {
    icon: <AutoAwesomeIcon fontSize="small" />,
    title: 'Include your logo',
    body: 'Upload a brand asset before downloading and the generated plugin registers it with Headlamp automatically.',
  },
];

export default function WelcomeDialog({ open, onClose, onShowHelp }: Props) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ pb: 1 }}>
        <Typography variant="overline" sx={{ color: 'primary.main', fontWeight: 700 }}>
          Headlamp Theme Builder
        </Typography>
        <Typography variant="h5" component="div" sx={{ fontWeight: 800, mt: 0.5 }}>
          Build, preview, and package a custom Headlamp theme
        </Typography>
      </DialogTitle>
      <DialogContent dividers>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          This tool helps you turn brand colours and a logo into a Headlamp theme plugin without
          hand-writing the plugin scaffold. Adjust the light and dark variants, check the UI preview,
          then download a zip you can copy into Headlamp.
        </Typography>

        <Box sx={{ display: 'grid', gap: 1.5 }}>
          {FEATURES.map(item => (
            <Box key={item.title} sx={{ display: 'flex', gap: 1.5, alignItems: 'flex-start' }}>
              <Box
                sx={{
                  width: 30,
                  height: 30,
                  borderRadius: 1,
                  bgcolor: 'primary.main',
                  color: 'primary.contrastText',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                {item.icon}
              </Box>
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                  {item.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {item.body}
                </Typography>
              </Box>
            </Box>
          ))}
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onShowHelp}>How to use</Button>
        <Button onClick={onClose} variant="contained">
          Start building
        </Button>
      </DialogActions>
    </Dialog>
  );
}
