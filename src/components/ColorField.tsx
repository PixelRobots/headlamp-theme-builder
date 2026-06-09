import React, { useState, useRef, useEffect } from 'react';
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
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
      <Box
        onClick={e => setAnchorEl(e.currentTarget)}
        sx={{
          width: 28,
          height: 28,
          borderRadius: 1,
          border: '2px solid',
          borderColor: 'divider',
          bgcolor: value,
          cursor: 'pointer',
          flexShrink: 0,
        }}
      />
      <Typography variant="body2" sx={{ flex: 1, fontSize: '0.78rem' }}>
        {label}
      </Typography>
      <Typography
        variant="body2"
        sx={{ fontSize: '0.75rem', fontFamily: 'monospace', color: 'text.secondary' }}
      >
        {value}
      </Typography>
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
            }}
          />
        </Box>
      </Popover>
    </Box>
  );
}
