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
import HeadlampLogoDark from '../assets/headlamp-logo-dark.svg?raw';
import HeadlampLogoLight from '../assets/headlamp-logo-light.svg?raw';
import { themeToMui } from '../utils/themeToMui';
import type { HeadlampTheme } from '../types/theme';

const NAV_ITEMS = ['Cluster', 'Workloads', 'Storage', 'Network', 'Security', 'Settings'];

const PODS = [
  { name: 'web-6d9f4b', namespace: 'default', status: 'Running' },
  { name: 'api-7c8d2a', namespace: 'default', status: 'Running' },
  { name: 'worker-3b1e9f', namespace: 'jobs', status: 'Pending' },
];

function svgToDataUrl(svg: string): string {
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

interface Props {
  theme: HeadlampTheme;
  logoDataUrl: string | null;
  highlightedPath: string | null;
}

export default function Preview({ theme, logoDataUrl, highlightedPath }: Props) {
  const muiTheme = themeToMui(theme);
  const defaultLargeLogo = svgToDataUrl(theme.base === 'dark' ? HeadlampLogoLight : HeadlampLogoDark);
  const terminalBackground = theme.terminal?.background ?? (theme.base === 'dark' ? '#1e1e1e' : '#ffffff');
  const terminalForeground = theme.terminal?.foreground ?? theme.text.primary;
  const terminalCursor = theme.terminal?.cursor ?? theme.primary;
  const terminalAnsi = theme.terminal?.ansi ?? {};
  function selectedTextColor(bg: string): string {
    try {
      return muiTheme.palette.getContrastText(bg);
    } catch {
      return '#000';
    }
  }

  function highlight(paths: string[]) {
    return paths.includes(highlightedPath ?? '')
      ? {
          outline: '2px solid #f2e600',
          outlineOffset: 2,
          boxShadow: '0 0 0 4px rgba(242, 230, 0, 0.2)',
        }
      : {};
  }

  const highlightTransition = { transition: 'outline-color 120ms ease, box-shadow 120ms ease' };

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
          sx={{
            bgcolor: theme.navbar.background,
            color: theme.navbar.color,
            boxShadow: '0 1px 4px rgba(0,0,0,0.15)',
            ...highlight(['navbar.background', 'navbar.color']),
            ...highlightTransition,
          }}
          elevation={0}
        >
          <Toolbar variant="dense">
            <Box
              component="img"
              src={logoDataUrl ?? defaultLargeLogo}
              alt={logoDataUrl ? 'custom logo' : 'Headlamp logo'}
              sx={{ height: 28, maxWidth: 136, objectFit: 'contain', mr: 1 }}
            />
            <Box sx={{ flex: 1 }} />

            <Box
              sx={{
                mr: 1,
                px: 1,
                py: 0.25,
                border: '1px solid',
                borderColor: 'currentColor',
                borderRadius: 1,
                color: theme.navbar.searchHint ?? theme.navbar.color,
                fontSize: '0.68rem',
                opacity: 0.9,
                ...highlight(['navbar.searchHint']),
                ...highlightTransition,
              }}
            >
              Ctrl K
            </Box>

            <Chip
              label="my-cluster"
              size="small"
              sx={{
                bgcolor: theme.primary,
                color: selectedTextColor(theme.primary),
                fontWeight: 600,
                ...highlight(['primary']),
                ...highlightTransition,
              }}
            />
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
              ...highlight(['sidebar.background', 'sidebar.color']),
              ...highlightTransition,
            }}
          >
            <List dense disablePadding>
              {NAV_ITEMS.map((item, i) => {
                const isSelected = i === 1;
                return (
                  <ListItemButton
                    key={item}
                    selected={isSelected}
                    sx={{
                      position: 'relative',
                      color: isSelected
                        ? selectedTextColor(theme.sidebar.selectedBackground)
                        : theme.sidebar.color,
                      bgcolor: isSelected
                        ? `${theme.sidebar.selectedBackground} !important`
                        : undefined,
                      boxShadow: isSelected ? '1px 1px 4px rgb(0 0 0 / 12%)' : undefined,
                      borderRadius: 1,
                      mx: 0.5,
                      mb: 0.25,
                      ...(isSelected
                        ? highlight(['sidebar.selectedBackground'])
                        : {}),
                      ...highlightTransition,
                      '&:hover': {
                        bgcolor: isSelected
                          ? `${theme.sidebar.selectedBackground} !important`
                          : 'rgba(255,255,255,0.07)',
                      },
                    }}
                  >
                    <ListItemText primary={item} slotProps={{ primary: { sx: { fontSize: '0.8rem' } } }} />
                  </ListItemButton>
                );
              })}
            </List>
            <Box
              sx={{
                position: 'relative',
                mx: 0.5,
                ml: 3,
                mb: 0.25,
                pl: 1.5,
                py: 0.45,
                color: theme.sidebar.selectedColor,
                borderRadius: 1,
                fontSize: '0.74rem',
                ...highlight(['sidebar.selectedColor']),
                ...highlightTransition,
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  left: 0,
                  top: 5,
                  bottom: 5,
                  width: 4,
                  borderRadius: 1,
                  bgcolor: theme.sidebar.selectedColor,
                },
              }}
            >
              Pods
            </Box>
            <Button
              size="small"
              sx={{
                mt: 'auto',
                mx: 1,
                bgcolor: theme.sidebar.actionBackground,
                color: selectedTextColor(theme.sidebar.actionBackground),
                fontSize: '0.7rem',
                textTransform: theme.buttonTextTransform ?? 'none',
                '&:hover': { bgcolor: theme.sidebar.actionBackground },
                ...highlight(['sidebar.actionBackground', 'buttonTextTransform']),
                ...highlightTransition,
              }}
            >
              Create
            </Button>
          </Box>

          {/* Main content */}
          <Box
            sx={{
              flex: 1,
              p: 2,
              overflow: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: 1.5,
              ...highlight(['background.default']),
              ...highlightTransition,
            }}
          >
            <Typography
              variant="h5"
              sx={{
                color: 'text.primary',
                fontWeight: 700,
                fontSize: '1.1rem',
                ...highlight(['text.primary']),
                ...highlightTransition,
              }}
            >
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
                ...highlight(['background.surface']),
                ...highlightTransition,
              }}
            >
              <Typography
                variant="subtitle2"
                gutterBottom
                sx={{ ...highlight(['text.primary']), ...highlightTransition }}
              >
                Deployments
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                3 of 3 running &mdash;{' '}
                <Link
                  href="#"
                  underline="hover"
                  sx={{
                    color: theme.link.color,
                    ...highlight(['link.color']),
                    ...highlightTransition,
                  }}
                >
                  view events
                </Link>
              </Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                  variant="contained"
                  size="small"
                  sx={{ ...highlight(['primary']), ...highlightTransition }}
                >
                  Create
                </Button>
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
                ...highlight(['background.surface']),
                ...highlightTransition,
              }}
            >
              <Table size="small">
                <TableHead>
                  <TableRow
                    sx={{
                      bgcolor: theme.base === 'dark' ? '#1f1f1f' : '#faf9f8',
                    }}
                  >
                    {['Name', 'Namespace', 'Status'].map(h => (
                      <TableCell
                        key={h}
                        sx={{
                          fontWeight: 700,
                          fontSize: '0.72rem',
                          color: theme.base === 'dark' ? '#faf9f8' : '#242424',
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
                        <Link
                          href="#"
                          underline="hover"
                          sx={{
                            fontSize: '0.78rem',
                            color: theme.link.color,
                            ...highlight(['link.color']),
                            ...highlightTransition,
                          }}
                        >
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

            <Box
              sx={{
                bgcolor: terminalBackground,
                color: terminalForeground,
                borderRadius: 1,
                border: '1px solid',
                borderColor: 'divider',
                p: 1.5,
                fontFamily: '"Courier New", monospace',
                fontSize: '0.76rem',
                lineHeight: 1.6,
                ...highlight(['terminal.background', 'terminal.foreground', 'terminal.cursor']),
                ...highlightTransition,
              }}
            >
              <Box component="span" sx={{ color: terminalCursor }}>
                $
              </Box>{' '}
              kubectl logs deploy/api
              <br />
              <Box component="span" sx={{ color: terminalForeground }}>
                server started on :8080
              </Box>
              <br />
              <Box component="span" sx={{ color: terminalAnsi.green ?? terminalForeground }}>
                status=ok
              </Box>{' '}
              <Box component="span" sx={{ color: terminalAnsi.yellow ?? terminalForeground }}>
                warnings=1
              </Box>{' '}
              <Box component="span" sx={{ color: terminalAnsi.red ?? terminalForeground }}>
                errors=0
              </Box>
              <br />
              <Box component="span" sx={{ color: terminalCursor }}>
                _
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>
    </ThemeProvider>
  );
}
