import AutoGraphIcon from '@mui/icons-material/AutoGraph';
import CloudQueueIcon from '@mui/icons-material/CloudQueue';
import HubIcon from '@mui/icons-material/Hub';
import {
  AppBar,
  Box,
  Container,
  CssBaseline,
  Divider,
  Stack,
  ThemeProvider,
  Toolbar,
  Typography,
  createTheme,
} from '@mui/material';
import type { HealthCheckDto } from '@wealth/shared-types';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#174a7c',
    },
    secondary: {
      main: '#3d6f3b',
    },
    background: {
      default: '#f7f8fa',
    },
  },
  shape: {
    borderRadius: 8,
  },
});

const placeholderHealth: HealthCheckDto = {
  service: 'wealth-web',
  status: 'ok',
  timestamp: new Date().toISOString(),
};

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AppBar position="static" color="inherit" elevation={0}>
        <Toolbar>
          <AutoGraphIcon color="primary" sx={{ mr: 1.5 }} />
          <Typography variant="h6" component="h1">
            Digital Wealth Management MVP
          </Typography>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ py: 5 }}>
        <Stack spacing={4}>
          <Box>
            <Typography variant="h4" component="h2" gutterBottom>
              Foundation Scaffold
            </Typography>
            <Typography color="text.secondary" maxWidth="720px">
              The frontend shell is ready for product workflows. Business features are intentionally
              not implemented in this scaffold.
            </Typography>
          </Box>

          <Divider />

          <Stack direction={{ xs: 'column', md: 'row' }} spacing={3}>
            <Stack spacing={1} flex={1}>
              <HubIcon color="primary" />
              <Typography variant="h6">Shared Contracts</Typography>
              <Typography color="text.secondary">
                DTOs and cross-boundary TypeScript types resolve through
                {' @wealth/shared-types'}.
              </Typography>
            </Stack>

            <Stack spacing={1} flex={1}>
              <CloudQueueIcon color="secondary" />
              <Typography variant="h6">API Boundary</Typography>
              <Typography color="text.secondary">
                Local API base URL is configured with Vite environment variables.
              </Typography>
            </Stack>
          </Stack>

          <Typography variant="caption" color="text.secondary">
            Local health placeholder: {placeholderHealth.service} / {placeholderHealth.status}
          </Typography>
        </Stack>
      </Container>
    </ThemeProvider>
  );
}

export default App;
