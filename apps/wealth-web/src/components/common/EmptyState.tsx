import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { Button, Stack, Typography } from '@mui/material';

export function EmptyState(props: { title: string; description?: string; actionLabel?: string }) {
  return (
    <Stack spacing={1.25}>
      <Typography fontWeight={800}>{props.title}</Typography>
      {props.description ? (
        <Typography color="text.secondary">{props.description}</Typography>
      ) : null}
      {props.actionLabel ? (
        <Button variant="outlined" endIcon={<ArrowForwardIcon />} sx={{ alignSelf: 'flex-start' }}>
          {props.actionLabel}
        </Button>
      ) : null}
    </Stack>
  );
}
