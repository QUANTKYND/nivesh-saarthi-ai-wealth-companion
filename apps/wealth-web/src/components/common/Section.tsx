import { Paper, Stack, Typography } from '@mui/material';
import type { ReactNode } from 'react';

export function Section(props: { title: string; icon: ReactNode; children: ReactNode }) {
  return (
    <Paper
      component="section"
      variant="outlined"
      sx={{
        borderRadius: 2,
        p: { xs: 2, md: 2.5 },
      }}
    >
      <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
        <Stack component="span" sx={{ color: 'primary.main' }}>
          {props.icon}
        </Stack>
        <Typography variant="h2">{props.title}</Typography>
      </Stack>
      {props.children}
    </Paper>
  );
}
