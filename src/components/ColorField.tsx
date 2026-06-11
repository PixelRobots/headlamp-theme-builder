import { useEffect, useRef, useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Popper from '@mui/material/Popper';
import Tooltip from '@mui/material/Tooltip';
import { useTheme } from '@mui/material/styles';
import { HexColorPicker, HexColorInput } from 'react-colorful';

interface ColorFieldProps {
  label: string;
  value: string;
  onChange: (v: string) => void;
  description: string;
  onHighlight: () => void;
  onClearHighlight: () => void;
  contrast?: {
    ratio: number;
    label: 'AAA' | 'AA' | 'Low';
    passes: boolean;
    against: string;
  } | null;
}

export default function ColorField({
  label,
  value,
  onChange,
  description,
  onHighlight,
  onClearHighlight,
  contrast,
}: ColorFieldProps) {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const pickerRef = useRef<HTMLDivElement | null>(null);
  const theme = useTheme();

  useEffect(() => {
    if (!anchorEl) {
      return;
    }

    const currentAnchor = anchorEl;

    function handlePointerDown(event: PointerEvent) {
      const target = event.target;
      if (!(target instanceof Node)) {
        return;
      }

      if (currentAnchor.contains(target) || pickerRef.current?.contains(target)) {
        return;
      }

      setAnchorEl(null);
    }

    document.addEventListener('pointerdown', handlePointerDown, true);
    return () => document.removeEventListener('pointerdown', handlePointerDown, true);
  }, [anchorEl]);

  const togglePicker = (element: HTMLElement) => {
    setAnchorEl(current => (current ? null : element));
  };

  return (
    <Box
      onMouseEnter={onHighlight}
      onMouseLeave={onClearHighlight}
      onFocus={onHighlight}
      onBlur={onClearHighlight}
      sx={{ mb: 0.5 }}
    >
      {/* Label row */}
      <Tooltip title={description} placement="right" arrow>
        <Typography
          variant="caption"
          sx={{
            display: 'inline-block',
            color: 'text.secondary',
            fontSize: '0.7rem',
            mb: 0.25,
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
            cursor: 'help',
            textDecoration: 'underline',
            textDecorationStyle: 'dotted',
            textUnderlineOffset: 3,
          }}
        >
          {label}
        </Typography>
      </Tooltip>

      {/* Swatch + hex row */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Box
          onClick={e => togglePicker(e.currentTarget)}
          sx={{
            width: 32,
            height: 24,
            borderRadius: '4px',
            border: `2px solid ${theme.palette.divider}`,
            bgcolor: value,
            cursor: 'pointer',
            flexShrink: 0,
            '&:hover': { borderColor: 'text.secondary' },
          }}
        />
        <Typography
          variant="body2"
          sx={{
            fontSize: '0.75rem',
            fontFamily: 'monospace',
            color: 'text.secondary',
            cursor: 'pointer',
          }}
          onClick={e => togglePicker(e.currentTarget)}
        >
          {value.toUpperCase()}
        </Typography>
      </Box>

      {contrast && (
        <Tooltip
          title={`WCAG contrast against ${contrast.against}. AA is the normal minimum for readable text; AAA is stronger.`}
          placement="right"
          arrow
        >
          <Box
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              mt: 0.75,
              px: 0.75,
              py: 0.25,
              borderRadius: 0.75,
              bgcolor: contrast.passes ? 'rgba(82, 196, 26, 0.16)' : 'rgba(255, 77, 79, 0.18)',
              color: contrast.passes ? '#8bdc65' : '#ff8f8f',
              border: `1px solid ${
                contrast.passes ? 'rgba(82, 196, 26, 0.35)' : 'rgba(255, 77, 79, 0.4)'
              }`,
              cursor: 'help',
            }}
          >
            <Typography
              variant="caption"
              sx={{
                fontSize: '0.64rem',
                lineHeight: 1.2,
                fontWeight: 700,
                letterSpacing: 0,
                whiteSpace: 'nowrap',
              }}
            >
              {contrast.ratio.toFixed(1)}:1 {contrast.label}
            </Typography>
          </Box>
        </Tooltip>
      )}

      <Popper
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        placement="bottom-start"
        sx={{ zIndex: theme.zIndex.modal }}
      >
        <Paper ref={pickerRef} elevation={6}>
          <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 1 }}>
            <HexColorPicker color={value} onChange={onChange} />
            <HexColorInput
              color={value}
              onChange={onChange}
              prefixed
              style={{
                width: '100%',
                padding: '4px 8px',
                fontFamily: 'monospace',
                fontSize: '0.85rem',
                border: '1px solid #ccc',
                borderRadius: 4,
                boxSizing: 'border-box',
              }}
            />
          </Box>
        </Paper>
      </Popper>
    </Box>
  );
}
