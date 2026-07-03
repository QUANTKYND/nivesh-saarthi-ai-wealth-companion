import { Chip, Grid, LinearProgress, Paper, Stack, Typography } from '@mui/material';
import type { Customer, WealthProfile } from '@wealth/shared-types';

export function HeaderBand(props: {
  customer: Customer | null;
  profile?: WealthProfile;
  isLoading: boolean;
}) {
  return (
    <Grid container spacing={2} alignItems="stretch">
      <Grid size={{ xs: 12, md: 8 }}>
        <Paper
          sx={{
            bgcolor: 'primary.dark',
            color: 'common.white',
            borderRadius: 2,
            p: { xs: 2, md: 3 },
            minHeight: 156,
            height: '100%',
          }}
        >
          <Stack spacing={2} justifyContent="space-between" sx={{ minHeight: 108, height: '100%' }}>
            <Stack spacing={1}>
              <Typography variant="overline" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                Bank wealth dashboard
              </Typography>
              <Typography variant="h1">
                {props.isLoading
                  ? 'Loading customer profile'
                  : `Good day, ${props.profile?.fullName ?? props.customer?.fullName ?? 'Customer'}`}
              </Typography>
              <Typography sx={{ color: 'rgba(255,255,255,0.78)', maxWidth: 680 }}>
                Review cash flow, readiness, goals, risk status, and bank-approved next steps from one
                advisor workspace.
              </Typography>
            </Stack>

            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              <Chip
                label={props.profile?.customerSegment ?? 'Segment pending'}
                size="small"
                sx={{ color: 'common.white', borderColor: 'rgba(255,255,255,0.36)' }}
                variant="outlined"
              />
              <Chip
                label={props.profile?.city ?? props.customer?.city ?? 'City pending'}
                size="small"
                sx={{ color: 'common.white', borderColor: 'rgba(255,255,255,0.36)' }}
                variant="outlined"
              />
            </Stack>
          </Stack>
        </Paper>
      </Grid>

      <Grid size={{ xs: 12, md: 4 }}>
        <Paper
          variant="outlined"
          sx={{
            borderRadius: 2,
            p: 2,
            minHeight: 156,
            height: '100%',
          }}
        >
          <Stack spacing={1.5}>
            <Typography variant="h3">Wealth readiness</Typography>
            <Stack spacing={0.25}>
              <Typography variant="h2" color="primary">
                {props.profile ? `${props.profile.wealthReadinessScore}/100` : '--/100'}
              </Typography>
              <Typography color="text.secondary">
                {props.profile?.wealthReadinessBand ?? 'Awaiting profile'}
              </Typography>
            </Stack>
            <LinearProgress
              variant="determinate"
              value={props.profile?.wealthReadinessScore ?? 0}
              sx={{ height: 8, borderRadius: 1 }}
            />
            <Typography variant="caption" color="text.secondary">
              Score reflects savings, emergency fund, EMI burden, investments, and planning readiness.
            </Typography>
          </Stack>
        </Paper>
      </Grid>
    </Grid>
  );
}
