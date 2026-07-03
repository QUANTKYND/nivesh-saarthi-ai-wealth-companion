import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import { Button, Chip, Stack, Typography } from '@mui/material';
import type { RiskProfileResult } from '@wealth/shared-types';
import { Section } from '../common/Section';

export function RiskProfileStatus(props: {
  riskProfile: RiskProfileResult | null | undefined;
  onOpenWizard: () => void;
}) {
  return (
    <Section title="Risk profile" icon={<AssignmentTurnedInIcon />}>
      {props.riskProfile ? (
        <Stack spacing={1}>
          <Chip
            label={props.riskProfile.category}
            color={
              props.riskProfile.category === 'AGGRESSIVE'
                ? 'warning'
                : props.riskProfile.category === 'MODERATE'
                  ? 'primary'
                  : 'success'
            }
            sx={{ alignSelf: 'flex-start', fontWeight: 800 }}
          />
          <Typography variant="h2">{props.riskProfile.scorePercent}%</Typography>
          <Typography color="text.secondary">
            {props.riskProfile.explanation[0] ??
              'Suitability result is available for recommendation rules.'}
          </Typography>
          <Button variant="outlined" onClick={props.onOpenWizard} sx={{ alignSelf: 'flex-start' }}>
            Review or retake
          </Button>
        </Stack>
      ) : (
        <Stack spacing={1.25}>
          <Typography fontWeight={800}>Risk profile pending</Typography>
          <Typography color="text.secondary">
            Complete suitability profiling before market-linked recommendations.
          </Typography>
          <Button variant="contained" onClick={props.onOpenWizard} sx={{ alignSelf: 'flex-start' }}>
            Take risk profile
          </Button>
        </Stack>
      )}
    </Section>
  );
}
