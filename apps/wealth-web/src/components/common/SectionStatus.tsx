import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { Button, CircularProgress, Paper, Stack, Typography } from '@mui/material';
import type { ReactNode } from 'react';

export function SectionStatus(props: {
  isLoading: boolean;
  error: Error | null;
  onRetry: () => void;
  label: string;
  children: ReactNode;
}) {
  if (props.isLoading) {
    return (
      <Paper variant="outlined" sx={{ borderRadius: 2, p: 2 }}>
        <Stack direction="row" spacing={1.5} alignItems="center">
          <CircularProgress size={20} />
          <Typography color="text.secondary">Loading {props.label}...</Typography>
        </Stack>
      </Paper>
    );
  }

  if (props.error) {
    return (
      <Paper variant="outlined" sx={{ borderRadius: 2, p: 2 }}>
        <Stack spacing={1.25}>
          <Typography fontWeight={800}>Could not load {props.label}</Typography>
          <Typography color="text.secondary">Check the API server and try again.</Typography>
          <Button
            variant="outlined"
            onClick={props.onRetry}
            endIcon={<ArrowForwardIcon />}
            sx={{ alignSelf: 'flex-start' }}
          >
            Retry
          </Button>
        </Stack>
      </Paper>
    );
  }

  return <>{props.children}</>;
}
