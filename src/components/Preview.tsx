import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Chip from '@mui/material/Chip';
import { themeToMui } from '../utils/themeToMui';
import type { HeadlampTheme } from '../types/theme';

const NAV_ITEMS = ['Cluster', 'Workloads', 'Storage', 'Network', 'Security', 'Settings'];

interface Props {
  theme: HeadlampTheme;
}

export default function Preview({ theme }: Props) {
  const muiTheme = themeToMui(theme);

  return (
    <ThemeProvider theme={muiTheme}>
      <CssBaseline />
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          bgcolor: 'background.default',
          overflow: 'hidden',
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 1,
        }}
      >
        {/* Navbar */}
        <AppBar
          position="static"
          sx={{ bgcolor: theme.navbar.background, color: theme.navbar.color, boxShadow: 1 }}
        >
          <Toolbar variant="dense">
            <Typography variant="h6" sx={{ fontWeight: 700, letterSpacing: 1, color: theme.navbar.color }}>
              headlamp
            </Typography>
            <Box sx={{ flex: 1 }} />
            <Chip label="my-cluster" size="small" sx={{ bgcolor: theme.primary, color: '#fff' }} />
          </Toolbar>
        </AppBar>

        <Box sx={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
          {/* Sidebar */}
          <Box
            sx={{
              width: 180,
              bgcolor: theme.sidebar.background,
              display: 'flex',
              flexDirection: 'column',
              flexShrink: 0,
              py: 1,
            }}
          >
            <List dense disablePadding>
              {NAV_ITEMS.map((item, i) => (
                <ListItemButton
                  key={item}
                  selected={i === 1}
                  sx={{
                    color: i === 1 ? theme.sidebar.selectedColor : theme.sidebar.color,
                    bgcolor: i === 1 ? `${theme.sidebar.selectedBackground} !important` : undefined,
                    borderRadius: 1,
                    mx: 0.5,
                    mb: 0.25,
                  }}
                >
                  <ListItemText
                    primary={item}
                    primaryTypographyProps={{ fontSize: '0.8rem' }}
                  />
                </ListItemButton>
              ))}
            </List>
          </Box>

          {/* Main content */}
          <Box sx={{ flex: 1, p: 2, overflow: 'auto' }}>
            <Typography variant="h5" gutterBottom sx={{ color: 'text.primary' }}>
              Workloads
            </Typography>
            <Box
              sx={{
                bgcolor: 'background.paper',
                borderRadius: 1,
                p: 2,
                mb: 2,
                border: '1px solid',
                borderColor: 'divider',
              }}
            >
              <Typography variant="subtitle1" gutterBottom>Deployments</Typography>
              <Typography variant="body2" color="text.secondary">
                3 of 3 running
              </Typography>
              <Box sx={{ mt: 1, display: 'flex', gap: 1 }}>
                <Button variant="contained" size="small">Create</Button>
                <Button variant="outlined" size="small">View logs</Button>
              </Box>
            </Box>
            <Box
              sx={{
                bgcolor: 'background.paper',
                borderRadius: 1,
                p: 2,
                border: '1px solid',
                borderColor: 'divider',
              }}
            >
              <Typography variant="subtitle1" gutterBottom>Pods</Typography>
              <Typography variant="body2" color="text.secondary">12 running</Typography>
            </Box>
          </Box>
        </Box>
      </Box>
    </ThemeProvider>
  );
}
