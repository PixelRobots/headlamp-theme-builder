import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Typography from '@mui/material/Typography';

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function MobileWarningDialog({ open, onClose }: Props) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ fontWeight: 700 }}>Desktop recommended</DialogTitle>
      <DialogContent dividers>
        <Typography variant="body2" color="text.secondary">
          Headlamp Theme Builder works best on a desktop-sized screen. For the best editing
          experience, use the website on desktop or install the Headlamp plugin.
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} variant="contained">
          Continue
        </Button>
      </DialogActions>
    </Dialog>
  );
}
