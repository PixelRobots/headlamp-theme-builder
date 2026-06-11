import Box from '@mui/material/Box';
import { useTheme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import type { ThemeValidationResult } from '../utils/themeValidation';

interface Props {
  result: ThemeValidationResult;
}

export default function ThemeValidationSummary({ result }: Props) {
  const theme = useTheme();
  const visibleErrors = result.errors.slice(0, 3);
  const visibleWarnings = result.warnings.slice(0, 3);
  const hiddenCount =
    Math.max(0, result.errors.length - visibleErrors.length) +
    Math.max(0, result.warnings.length - visibleWarnings.length);

  if (result.errors.length === 0 && result.warnings.length === 0) {
    return null;
  }

  const isError = result.errors.length > 0;
  const borderColor = isError ? theme.palette.error.main : theme.palette.warning.main;
  const icon = isError ? '!' : '△';

  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: 'auto 1fr',
        gap: 1.25,
        alignItems: 'flex-start',
        border: '1px solid',
        borderColor,
        borderRadius: 1,
        bgcolor: theme.palette.background.paper,
        color: theme.palette.text.primary,
        px: 1.5,
        py: 1,
      }}
    >
      <Typography
        aria-hidden
        sx={{
          color: borderColor,
          fontWeight: 900,
          lineHeight: 1.3,
          fontSize: '1rem',
        }}
      >
        {icon}
      </Typography>
      <Box>
      <Typography variant="caption" sx={{ display: 'block', fontWeight: 700, mb: 0.5 }}>
        {isError
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
      </Box>
    </Box>
  );
}
