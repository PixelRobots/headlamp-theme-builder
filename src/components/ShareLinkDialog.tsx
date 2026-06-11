import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

interface Props {
  open: boolean;
  shareUrl: string;
  onClose: () => void;
  onCopy: () => void;
}

export default function ShareLinkDialog({ open, shareUrl, onClose, onCopy }: Props) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ fontWeight: 700 }}>Share theme link</DialogTitle>
      <DialogContent dividers>
        <Typography component="p" variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          This link restores the current light and dark theme colours. Uploaded logos are not
          included.
        </Typography>
        <TextField
          value={shareUrl}
          fullWidth
          multiline
          minRows={3}
          slotProps={{
            input: {
              readOnly: true,
            },
          }}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
        <Button onClick={onCopy} variant="contained">
          Copy link
        </Button>
      </DialogActions>
    </Dialog>
  );
}
