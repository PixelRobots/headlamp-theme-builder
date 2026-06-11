import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import type { ThemeValidationResult } from '../utils/themeValidation';

interface Props {
  result: ThemeValidationResult;
}

export default function ThemeValidationSummary({ result }: Props) {
  const visibleErrors = result.errors.slice(0, 3);
  const visibleWarnings = result.warnings.slice(0, 3);
  const hiddenCount =
    Math.max(0, result.errors.length - visibleErrors.length) +
    Math.max(0, result.warnings.length - visibleWarnings.length);

  if (result.errors.length === 0 && result.warnings.length === 0) {
    return null;
  }

  return (
    <Alert
      severity={result.errors.length > 0 ? 'error' : 'warning'}
      variant="outlined"
      sx={{
        alignItems: 'flex-start',
        py: 0.75,
        '& .MuiAlert-message': { width: '100%' },
      }}
    >
      <Typography variant="caption" sx={{ display: 'block', fontWeight: 700, mb: 0.5 }}>
        {result.errors.length > 0
          ? 'Fix theme errors before applying or downloading.'
          : 'Theme warnings'}
      </Typography>
      <Box component="ul" sx={{ m: 0, pl: 2.25 }}>
        {[...visibleErrors, ...visibleWarnings].map(message => (
          <Typography key={message} component="li" variant="caption">
            {message}
          </Typography>
        ))}
      </Box>
      {hiddenCount > 0 && (
        <Typography variant="caption" color="text.secondary">
          {hiddenCount} more validation item{hiddenCount === 1 ? '' : 's'}.
        </Typography>
      )}
    </Alert>
  );
}
