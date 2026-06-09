import React, { useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Popover from '@mui/material/Popover';
import { HexColorPicker, HexColorInput } from 'react-colorful';

interface ColorFieldProps {
  label: string;
  value: string;
  onChange: (v: string) => void;
}

export default function ColorField({ label, value, onChange }: ColorFieldProps) {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

  return (
    <Box sx={{ mb: 0.5 }}>
      {/* Label row */}
      <Typography
        variant="caption"
        sx={{
          display: 'block',
          color: 'rgba(255,255,255,0.6)',
          fontSize: '0.7rem',
          mb: 0.25,
          letterSpacing: '0.04em',
          textTransform: 'uppercase',
        }}
      >
        {label}
      </Typography>

      {/* Swatch + hex row */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Box
          onClick={e => setAnchorEl(e.currentTarget)}
          sx={{
            width: 32,
            height: 24,
            borderRadius: '4px',
            border: '2px solid rgba(255,255,255,0.25)',
            bgcolor: value,
            cursor: 'pointer',
            flexShrink: 0,
            '&:hover': { borderColor: 'rgba(255,255,255,0.6)' },
          }}
        />
        <Typography
          variant="body2"
          sx={{
            fontSize: '0.75rem',
            fontFamily: 'monospace',
            color: 'rgba(255,255,255,0.5)',
            cursor: 'pointer',
          }}
          onClick={e => setAnchorEl(e.currentTarget)}
        >
          {value.toUpperCase()}
        </Typography>
      </Box>

      <Popover
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        onClose={() => setAnchorEl(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      >
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
      </Popover>
    </Box>
  );
}
