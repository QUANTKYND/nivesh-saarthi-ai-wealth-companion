import { Paper, Stack, Typography } from '@mui/material';
import type { ReactNode } from 'react';

export function MetricCard(props: { label: string; value: string; icon?: ReactNode }) {
  return (
    <Paper
      variant="outlined"
      sx={{
        p: 1.5,
        minHeight: 96,
      }}
    >
      <Stack direction="row" spacing={1} alignItems="center">
        {props.icon ? (
          <Stack component="span" sx={{ color: 'primary.main' }}>
            {props.icon}
          </Stack>
        ) : null}
        <Typography variant="caption" color="text.secondary">
          {props.label}
        </Typography>
      </Stack>
      <Typography variant="h3" sx={{ mt: 1, overflowWrap: 'anywhere' }}>
        {props.value}
      </Typography>
    </Paper>
  );
}
