import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Link from '@mui/material/Link';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Chip from '@mui/material/Chip';
import Table from '@mui/material/Table';
import TableHead from '@mui/material/TableHead';
import TableBody from '@mui/material/TableBody';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import { themeToMui } from '../utils/themeToMui';
import type { HeadlampTheme } from '../types/theme';

const NAV_ITEMS = ['Cluster', 'Workloads', 'Storage', 'Network', 'Security', 'Settings'];

const PODS = [
  { name: 'web-6d9f4b', namespace: 'default', status: 'Running' },
  { name: 'api-7c8d2a', namespace: 'default', status: 'Running' },
  { name: 'worker-3b1e9f', namespace: 'jobs', status: 'Pending' },
];

interface Props {
  theme: HeadlampTheme;
  logoDataUrl: string | null;
}

export default function Preview({ theme, logoDataUrl }: Props) {
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
          sx={{ bgcolor: theme.navbar.background, color: theme.navbar.color, boxShadow: '0 1px 4px rgba(0,0,0,0.15)' }}
          elevation={0}
        >
          <Toolbar variant="dense">
            {logoDataUrl ? (
              <Box
                component="img"
                src={logoDataUrl}
                alt="logo"
                sx={{ height: 28, maxWidth: 120, objectFit: 'contain', mr: 1 }}
              />
            ) : (
              <Typography
                variant="h6"
                sx={{ fontWeight: 700, letterSpacing: 1, color: theme.navbar.color, fontSize: '1rem' }}
              >
                headlamp
              </Typography>
            )}
            <Box sx={{ flex: 1 }} />
            <Chip label="my-cluster" size="small" sx={{ bgcolor: theme.primary, color: '#fff', fontWeight: 600 }} />
          </Toolbar>
        </AppBar>

        <Box sx={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
          {/* Sidebar */}
          <Box
            sx={{
              width: 150,
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
                  <ListItemText primary={item} primaryTypographyProps={{ fontSize: '0.8rem' }} />
                </ListItemButton>
              ))}
            </List>
          </Box>

          {/* Main content */}
          <Box sx={{ flex: 1, p: 2, overflow: 'auto', display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            <Typography variant="h5" sx={{ color: 'text.primary', fontWeight: 700, fontSize: '1.1rem' }}>
              Workloads
            </Typography>

            {/* Card with primary buttons + link */}
            <Box
              sx={{
                bgcolor: 'background.paper',
                borderRadius: 1,
                p: 1.5,
                border: '1px solid',
                borderColor: 'divider',
              }}
            >
              <Typography variant="subtitle2" gutterBottom>
                Deployments
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                3 of 3 running &mdash;{' '}
                <Link href="#" underline="hover" color="primary">
                  view events
                </Link>
              </Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button variant="contained" size="small">Create</Button>
                <Button variant="outlined" size="small">View logs</Button>
                <Button variant="text" size="small">Delete</Button>
              </Box>
            </Box>

            {/* Pod table */}
            <Box
              sx={{
                bgcolor: 'background.paper',
                borderRadius: 1,
                border: '1px solid',
                borderColor: 'divider',
                overflow: 'hidden',
              }}
            >
              <Table size="small">
                <TableHead>
                  <TableRow
                    sx={{
                      bgcolor: theme.base === 'dark' ? '#000' : '#faf9f8',
                    }}
                  >
                    {['Name', 'Namespace', 'Status'].map(h => (
                      <TableCell
                        key={h}
                        sx={{
                          fontWeight: 700,
                          fontSize: '0.72rem',
                          color: theme.base === 'dark' ? '#aeaeae' : '#242424',
                          borderColor: 'divider',
                          py: 0.75,
                        }}
                      >
                        {h}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {PODS.map(pod => (
                    <TableRow key={pod.name} hover>
                      <TableCell sx={{ py: 0.5, borderColor: 'divider' }}>
                        <Link href="#" underline="hover" color="primary" sx={{ fontSize: '0.78rem' }}>
                          {pod.name}
                        </Link>
                      </TableCell>
                      <TableCell sx={{ py: 0.5, borderColor: 'divider', fontSize: '0.78rem', color: 'text.secondary' }}>
                        {pod.namespace}
                      </TableCell>
                      <TableCell sx={{ py: 0.5, borderColor: 'divider' }}>
                        <Chip
                          label={pod.status}
                          size="small"
                          sx={{
                            height: 18,
                            fontSize: '0.68rem',
                            bgcolor: pod.status === 'Running' ? 'rgba(16,124,16,0.12)' : 'rgba(196,69,0,0.12)',
                            color: pod.status === 'Running' ? '#107C10' : 'rgb(196,69,0)',
                            fontWeight: 600,
                          }}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Box>
          </Box>
        </Box>
      </Box>
    </ThemeProvider>
  );
}
