import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import { Chip, Stack, Typography } from '@mui/material';
import type { RiskProfileResult } from '@wealth/shared-types';
import { EmptyState } from '../common/EmptyState';
import { Section } from '../common/Section';

export function RiskProfileStatus({ riskProfile }: { riskProfile: RiskProfileResult | null | undefined }) {
  return (
    <Section title="Risk profile" icon={<AssignmentTurnedInIcon />}>
      {riskProfile ? (
        <Stack spacing={1}>
          <Chip
            label={riskProfile.category}
            color={
              riskProfile.category === 'AGGRESSIVE'
                ? 'warning'
                : riskProfile.category === 'MODERATE'
                  ? 'primary'
                  : 'success'
            }
            sx={{ alignSelf: 'flex-start', fontWeight: 800 }}
          />
          <Typography variant="h2">{riskProfile.scorePercent}%</Typography>
          <Typography color="text.secondary">
            {riskProfile.explanation[0] ??
              'Suitability result is available for recommendation rules.'}
          </Typography>
        </Stack>
      ) : (
        <EmptyState
          title="Risk profile pending"
          description="Complete suitability profiling before market-linked recommendations."
          actionLabel="Take risk profile"
        />
      )}
    </Section>
  );
}
