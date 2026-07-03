import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import { Alert, Chip, Stack, Typography } from '@mui/material';
import type { Goal, Recommendation, RecommendationResult } from '@wealth/shared-types';
import type { DashboardRecommendation } from '../../api';
import { EmptyState } from '../common/EmptyState';
import { Section } from '../common/Section';

export function RecommendationPreview(props: {
  recommendations: DashboardRecommendation[];
  hasGoals: boolean;
  selectedGoal: Goal | null;
}) {
  const latest = props.recommendations.at(-1);

  if (!latest) {
    return (
      <Section title="Recommendations" icon={<TrendingUpIcon />}>
        <Stack spacing={1.25}>
          {props.selectedGoal ? (
            <Alert severity="info" variant="outlined">
              Selected goal for the next recommendation: <strong>{props.selectedGoal.name}</strong>
            </Alert>
          ) : null}
          <EmptyState
            title="No recommendation yet"
            description={
              props.hasGoals
                ? 'Generate a recommendation after confirming risk profile and capacity.'
                : 'Create a goal first so the engine can recommend against a clear target.'
            }
          />
        </Stack>
      </Section>
    );
  }

  return (
    <Section title="Recommendations" icon={<TrendingUpIcon />}>
      <Stack spacing={1.25}>
        {props.selectedGoal ? (
          <Alert severity="info" variant="outlined">
            Selected goal for the next recommendation: <strong>{props.selectedGoal.name}</strong>
          </Alert>
        ) : null}
        {'recommendationId' in latest ? (
          <GeneratedRecommendationSummary recommendation={latest} />
        ) : (
          <SeededRecommendationSummary recommendation={latest} />
        )}
      </Stack>
    </Section>
  );
}

function GeneratedRecommendationSummary({
  recommendation,
}: {
  recommendation: RecommendationResult;
}) {
  return (
    <Stack spacing={1.25}>
      <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
        <Chip label={recommendation.suitability} color="primary" size="small" />
        <Chip label={recommendation.riskProfile ?? 'Risk pending'} variant="outlined" size="small" />
      </Stack>
      <Typography fontWeight={800}>
        {recommendation.recommendedPlan?.name ?? 'Advisor review needed'}
      </Typography>
      <Typography color="text.secondary">
        {recommendation.reasoning[0] ?? recommendation.disclaimer}
      </Typography>
      {recommendation.riskWarnings[0] ? (
        <Typography variant="caption" color="warning.main">
          {recommendation.riskWarnings[0]}
        </Typography>
      ) : null}
    </Stack>
  );
}

function SeededRecommendationSummary({ recommendation }: { recommendation: Recommendation }) {
  return (
    <Stack spacing={1}>
      <Chip label={recommendation.status} size="small" sx={{ alignSelf: 'flex-start' }} />
      <Typography fontWeight={800}>{recommendation.title}</Typography>
      <Typography color="text.secondary">{recommendation.reasoning}</Typography>
      <Typography variant="caption" color="text.secondary">
        {recommendation.disclaimer}
      </Typography>
    </Stack>
  );
}
