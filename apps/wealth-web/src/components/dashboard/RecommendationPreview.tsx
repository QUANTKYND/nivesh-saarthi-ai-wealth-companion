import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import {
  Alert,
  Box,
  Button,
  Chip,
  Divider,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useMutation } from '@tanstack/react-query';
import { useMemo, useState } from 'react';
import type {
  Goal,
  RecommendationResult,
  RiskProfileResult,
} from '@wealth/shared-types';
import type { DashboardRecommendation } from '../../api';
import { wealthApi } from '../../api';
import { EmptyState } from '../common/EmptyState';
import { Section } from '../common/Section';

const marketLinkedProductTypes = new Set([
  'CONSERVATIVE_MF_BASKET',
  'BALANCED_MF_BASKET',
  'EQUITY_SIP_BASKET',
  'TAX_SAVING',
]);

export function RecommendationPreview(props: {
  customerId: string;
  goals: Goal[];
  riskProfile: RiskProfileResult | null | undefined;
  recommendations: DashboardRecommendation[];
  selectedGoal: Goal | null;
  onSelectGoal: (goalId: string) => void;
  onCreateGoal: () => void;
  onTakeRiskProfile: () => void;
  onOpenAdvisorCallback: () => void;
}) {
  const latest = props.recommendations.at(-1);
  const [capacityInput, setCapacityInput] = useState('');
  const [generatedRecommendation, setGeneratedRecommendation] = useState<RecommendationResult | null>(
    null,
  );

  const generateMutation = useMutation({
    mutationFn: (request: {
      customerId: string;
      goalId: string;
      monthlyInvestmentCapacity?: number;
    }) =>
      wealthApi.generateRecommendation(request.customerId, {
        goalId: request.goalId,
        monthlyInvestmentCapacity: request.monthlyInvestmentCapacity,
      }),
    onSuccess: (result) => {
      setGeneratedRecommendation(result);
    },
  });

  const selectedGoal = props.selectedGoal;
  const currentGenerated = generatedRecommendation ?? getLatestGeneratedRecommendation(latest);

  const monthlyCapacity = useMemo(() => {
    if (capacityInput.trim() === '') {
      return undefined;
    }

    const parsed = Number(capacityInput);
    return Number.isFinite(parsed) ? parsed : Number.NaN;
  }, [capacityInput]);

  const capacityError =
    capacityInput.trim() !== '' && (Number.isNaN(monthlyCapacity) || (monthlyCapacity ?? 0) < 0)
      ? 'Monthly investment capacity must be 0 or more.'
      : '';

  const handleGenerate = () => {
    if (!selectedGoal || capacityError) {
      return;
    }

    generateMutation.mutate({
      customerId: props.customerId,
      goalId: selectedGoal.id,
      monthlyInvestmentCapacity: monthlyCapacity,
    });
  };

  if (!props.goals.length) {
    return (
      <Section title="Recommendations" icon={<TrendingUpIcon />}>
        <Stack spacing={1.25}>
          <EmptyState
            title="Create a goal first"
            description="Recommendations are generated against a concrete goal and risk profile."
            actionLabel="Create goal"
          />
          <Button variant="contained" onClick={props.onCreateGoal} sx={{ alignSelf: 'flex-start' }}>
            Create goal
          </Button>
        </Stack>
      </Section>
    );
  }

  if (!props.riskProfile) {
    return (
      <Section title="Recommendations" icon={<TrendingUpIcon />}>
        <Stack spacing={1.25}>
          <Alert severity="info" variant="outlined">
            Complete risk profiling before generating a recommendation.
          </Alert>
          <Button variant="contained" onClick={props.onTakeRiskProfile} sx={{ alignSelf: 'flex-start' }}>
            Take risk profile
          </Button>
        </Stack>
      </Section>
    );
  }

  return (
    <Section title="Recommendations" icon={<TrendingUpIcon />}>
      <Stack spacing={2}>
        <Paper variant="outlined" sx={{ p: 2, bgcolor: 'rgba(18, 76, 99, 0.03)' }}>
          <Stack spacing={1}>
            <Typography fontWeight={800}>Bank-approved guidance</Typography>
            <Typography color="text.secondary">
              Select a goal and confirm capacity. The backend will calculate a suitable plan based on
              available banking data, goal horizon, and your risk profile.
            </Typography>
          </Stack>
        </Paper>

        <Stack spacing={1.25}>
          <Typography variant="h3">Select goal</Typography>
          <Stack spacing={1}>
            {props.goals.map((goal) => {
              const isSelected = goal.id === selectedGoal?.id;
              return (
                <Button
                  key={goal.id}
                  variant={isSelected ? 'contained' : 'outlined'}
                  onClick={() => props.onSelectGoal(goal.id)}
                  sx={{ justifyContent: 'space-between', textAlign: 'left' }}
                >
                  <Box sx={{ textAlign: 'left' }}>
                    <Typography fontWeight={800}>{goal.name}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      Target {goal.targetAmount.toLocaleString('en-IN')} · {goal.priority}
                    </Typography>
                  </Box>
                </Button>
              );
            })}
          </Stack>
        </Stack>

        <TextField
          label="Monthly investment capacity"
          type="number"
          value={capacityInput}
          onChange={(event) => setCapacityInput(event.target.value)}
          inputProps={{ min: 0 }}
          helperText={capacityError || 'Optional. Leave blank to use backend defaults.'}
          error={Boolean(capacityError)}
        />

        <Button
          variant="contained"
          onClick={handleGenerate}
          disabled={!selectedGoal || Boolean(capacityError) || generateMutation.isPending}
        >
          {generateMutation.isPending ? 'Generating...' : 'Generate recommendation'}
        </Button>

        {generateMutation.error ? (
          <Alert severity="error" variant="outlined">
            {generateMutation.error.message}
          </Alert>
        ) : null}

        {currentGenerated ? (
          <GeneratedRecommendationSummary
            recommendation={currentGenerated}
            onOpenAdvisorCallback={props.onOpenAdvisorCallback}
          />
        ) : latest ? (
          <HistoricalRecommendationSummary recommendation={latest} />
        ) : (
          <EmptyState
            title="No recommendation yet"
            description="Generate a recommendation after choosing a goal and confirming capacity."
          />
        )}
      </Stack>
    </Section>
  );
}

function GeneratedRecommendationSummary(props: {
  recommendation: RecommendationResult;
  onOpenAdvisorCallback: () => void;
}) {
  const { recommendation } = props;
  const needsAdvisorReview = recommendation.suitability === 'NEEDS_ADVISOR_REVIEW';
  const notSuitable = recommendation.suitability === 'NOT_SUITABLE';
  const recommendedPlan = recommendation.recommendedPlan;

  return (
    <Stack spacing={1.5}>
      <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
        <Chip label={recommendation.suitability} color="primary" size="small" />
        <Chip label={recommendation.riskProfile ?? 'Risk pending'} variant="outlined" size="small" />
      </Stack>
      <Typography variant="h3">{recommendedPlan?.name ?? 'Advisor review needed'}</Typography>
      <Typography color="text.secondary">
        {recommendedPlan?.description ??
          'The backend determined that a human advisor should review this case.'}
      </Typography>

      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
        <Paper variant="outlined" sx={{ p: 1.5, flex: 1 }}>
          <Typography variant="caption" color="text.secondary">
            Monthly amount
          </Typography>
          <Typography fontWeight={800}>
            {recommendedPlan ? recommendedPlan.monthlyAmount.toLocaleString('en-IN') : '0'}
          </Typography>
        </Paper>
        <Paper variant="outlined" sx={{ p: 1.5, flex: 1 }}>
          <Typography variant="caption" color="text.secondary">
            One-time amount
          </Typography>
          <Typography fontWeight={800}>
            {recommendedPlan ? recommendedPlan.oneTimeAmount.toLocaleString('en-IN') : '0'}
          </Typography>
        </Paper>
      </Stack>

      <Divider />

      <Stack spacing={1}>
        <Typography fontWeight={800}>Allocation</Typography>
        {recommendedPlan?.allocation.map((item) => (
          <Paper key={item.productId} variant="outlined" sx={{ p: 1.5 }}>
            <Stack spacing={0.5}>
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap alignItems="center">
                <Chip
                  label={item.productType}
                  size="small"
                  color={marketLinkedProductTypes.has(item.productType) ? 'warning' : 'default'}
                />
                <Typography fontWeight={700}>{item.productName}</Typography>
              </Stack>
              <Typography variant="body2" color="text.secondary">
                {item.percentage}% · monthly {item.monthlyAmount.toLocaleString('en-IN')} · one-time{' '}
                {item.oneTimeAmount.toLocaleString('en-IN')}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {item.rationale}
              </Typography>
            </Stack>
          </Paper>
        ))}
      </Stack>

      <Stack spacing={0.5}>
        <Typography fontWeight={800}>Reasoning</Typography>
        {recommendation.reasoning.map((line) => (
          <Typography key={line} color="text.secondary">
            {line}
          </Typography>
        ))}
      </Stack>

      {recommendation.riskWarnings.length > 0 ? (
        <Alert severity="warning" variant="outlined">
          <Stack spacing={0.5}>
            <Typography fontWeight={800}>Risk warnings</Typography>
            {recommendation.riskWarnings.map((warning) => (
              <Typography key={warning} variant="body2">
                {warning}
              </Typography>
            ))}
          </Stack>
        </Alert>
      ) : null}

      <Alert severity={needsAdvisorReview ? 'warning' : 'info'} variant="outlined">
        {recommendation.disclaimer}
      </Alert>

      <Paper variant="outlined" sx={{ p: 1.5, bgcolor: 'rgba(18, 76, 99, 0.03)' }}>
        <Typography variant="caption" color="text.secondary">
          Next best action
        </Typography>
        <Typography fontWeight={800}>{recommendation.nextBestAction.label}</Typography>
        <Typography color="text.secondary">{recommendation.nextBestAction.description}</Typography>
      </Paper>

      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
        {notSuitable ? null : (
          <Button variant="contained" onClick={props.onOpenAdvisorCallback}>
            Request advisor callback
          </Button>
        )}
        {needsAdvisorReview ? (
          <Button variant="outlined" onClick={props.onOpenAdvisorCallback}>
            Review with advisor
          </Button>
        ) : null}
      </Stack>
    </Stack>
  );
}

function HistoricalRecommendationSummary({ recommendation }: { recommendation: DashboardRecommendation }) {
  if (!isGeneratedRecommendation(recommendation)) {
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

  return (
    <GeneratedRecommendationSummary
      recommendation={recommendation}
      onOpenAdvisorCallback={() => undefined}
    />
  );
}

function isGeneratedRecommendation(
  recommendation: DashboardRecommendation | null,
): recommendation is RecommendationResult {
  return Boolean(recommendation && 'recommendationId' in recommendation);
}

function getLatestGeneratedRecommendation(
  recommendation: DashboardRecommendation | undefined,
): RecommendationResult | null {
  if (recommendation && 'recommendationId' in recommendation) {
    return recommendation;
  }

  return null;
}
