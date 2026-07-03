import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { Alert, Box, Button, Chip, CircularProgress, Grid, IconButton, Paper, Stack, Tooltip, Typography } from '@mui/material';
import type { Goal, GoalProjection } from '@wealth/shared-types';
import { MetricCard } from '../common/MetricCard';
import { formatCurrency, formatGoalDate, formatGoalTypeLabel, formatProjectionDate } from '../../utils/formatters';

export function GoalProjectionPanel(props: {
  goal: Goal | null;
  projection: GoalProjection | undefined;
  isLoading: boolean;
  error: Error | null;
  createGoalError: Error | null;
  isCreatingGoal: boolean;
  onRetry: () => void;
  onUseGoalForRecommendation: (goalId: string) => void;
}) {
  if (!props.goal) {
    return (
      <Paper
        variant="outlined"
        sx={{
          borderStyle: 'dashed',
          borderRadius: 1,
          p: 2,
        }}
      >
        <Typography fontWeight={800}>Select a goal</Typography>
        <Typography color="text.secondary" sx={{ mt: 0.5 }}>
          Projection details appear here after you choose a goal from the list.
        </Typography>
      </Paper>
    );
  }

  const goal = props.goal;

  if (props.isLoading) {
    return (
      <Paper variant="outlined" sx={{ borderRadius: 1, p: 2, minHeight: 240 }}>
        <Stack direction="row" spacing={1.5} alignItems="center">
          <CircularProgress size={20} />
          <Typography color="text.secondary">Loading projection...</Typography>
        </Stack>
      </Paper>
    );
  }

  if (props.error) {
    return (
      <Paper variant="outlined" sx={{ borderRadius: 1, p: 2 }}>
        <Stack spacing={1.25}>
          <Typography fontWeight={800}>Could not load projection</Typography>
          <Typography color="text.secondary">{props.error.message}</Typography>
          <Button variant="outlined" onClick={props.onRetry} sx={{ alignSelf: 'flex-start' }}>
            Retry projection
          </Button>
        </Stack>
      </Paper>
    );
  }

  if (!props.projection) {
    return (
      <Paper variant="outlined" sx={{ borderRadius: 1, p: 2 }}>
        <Typography color="text.secondary">Projection data is not available yet.</Typography>
      </Paper>
    );
  }

  const statusColor =
    props.projection.achievabilityStatus === 'ACHIEVABLE'
      ? 'success'
      : props.projection.achievabilityStatus === 'AT_RISK'
        ? 'warning'
        : 'error';
  const shortfallIsPositive = props.projection.shortfallOrSurplus >= 0;
  const shortfallLabel = shortfallIsPositive ? 'Surplus' : 'Shortfall';
  const shortfallAmount = Math.abs(props.projection.shortfallOrSurplus);

  return (
    <Paper variant="outlined" sx={{ borderRadius: 1, p: 2 }}>
      <Stack spacing={1.5}>
        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap alignItems="center">
          <Chip label={props.projection.achievabilityStatus} color={statusColor} size="small" />
          <Chip label={formatGoalTypeLabel(goal.type)} variant="outlined" size="small" />
          <Tooltip title="Continue to recommendations">
            <span>
              <IconButton
                size="small"
                color="primary"
                onClick={() => props.onUseGoalForRecommendation(goal.id)}
                disabled={props.isCreatingGoal}
                aria-label="Continue to recommendations"
              >
                <OpenInNewIcon fontSize="small" />
              </IconButton>
            </span>
          </Tooltip>
        </Stack>

        <Box>
          <Typography variant="h3">{goal.name}</Typography>
          <Typography color="text.secondary">
            Due {formatGoalDate(goal.targetDate)} · backend projection as of{' '}
            {formatProjectionDate(props.projection.calculatedAt)}
          </Typography>
        </Box>

        {props.createGoalError ? (
          <Alert severity="error" variant="outlined">
            {props.createGoalError.message}
          </Alert>
        ) : null}

        <Grid container spacing={1.25}>
          <Grid item xs={12} sm={6}>
            <MetricCard
              label="Projected amount"
              value={formatCurrency(props.projection.projectedAmount)}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <MetricCard
              label="Required monthly contribution"
              value={formatCurrency(props.projection.requiredMonthlyContribution)}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <MetricCard
              label="Planned monthly contribution"
              value={formatCurrency(props.projection.plannedMonthlyContribution)}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <MetricCard
              label="Months remaining"
              value={`${props.projection.monthsRemaining.toLocaleString('en-IN')} months`}
            />
          </Grid>
        </Grid>

        <Box
          sx={{
            border: '1px solid',
            borderColor: shortfallIsPositive ? 'success.light' : 'warning.light',
            borderRadius: 1,
            p: 1.5,
            bgcolor: shortfallIsPositive ? 'rgba(36, 122, 77, 0.05)' : 'rgba(166, 106, 0, 0.05)',
          }}
        >
          <Typography variant="caption" color="text.secondary">
            {shortfallLabel}
          </Typography>
          <Typography variant="h2" color={shortfallIsPositive ? 'success.main' : 'warning.main'}>
            {formatCurrency(shortfallAmount)}
          </Typography>
          <Typography color="text.secondary" sx={{ mt: 0.5 }}>
            {shortfallIsPositive
              ? 'Projected savings exceed the target amount at the current plan.'
              : 'The current plan still falls short of the target and needs a higher contribution or longer horizon.'}
          </Typography>
        </Box>

        <Box>
          <Typography variant="h3" gutterBottom>
            Suitability notes
          </Typography>
          <Stack spacing={1}>
            {props.projection.explanations.map((explanation) => (
              <Typography key={explanation} color="text.secondary" variant="body2">
                {explanation}
              </Typography>
            ))}
          </Stack>
        </Box>

        <Box>
          <Typography variant="h3" gutterBottom>
            Step-up suggestion
          </Typography>
          <Typography color="text.secondary" variant="body2">
            {props.projection.stepUpSuggestion.explanation}
          </Typography>
          {props.projection.stepUpSuggestion.isRequired ? (
            <Stack spacing={0.75} sx={{ mt: 1 }}>
              <Typography variant="body2" fontWeight={700}>
                Suggested annual step-up: {props.projection.stepUpSuggestion.suggestedAnnualStepUpPercent}%
              </Typography>
              {props.projection.stepUpSuggestion.estimatedProjectedAmountWithStepUp !== null ? (
                <Typography variant="body2" color="text.secondary">
                  Estimated projected amount with step-up:{' '}
                  {formatCurrency(props.projection.stepUpSuggestion.estimatedProjectedAmountWithStepUp)}
                </Typography>
              ) : null}
            </Stack>
          ) : null}
        </Box>

        <Box>
          <Typography variant="h3" gutterBottom>
            Projection assumptions
          </Typography>
          <Stack spacing={0.75}>
            <Typography variant="body2" color="text.secondary">
              Compounding frequency: {props.projection.assumptions.compoundingFrequency}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Inflation adjusted: {props.projection.assumptions.inflationAdjusted ? 'Yes' : 'No'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Returns are illustrative: {props.projection.assumptions.returnsAreIllustrative ? 'Yes' : 'No'}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Projected returns are illustrative only and do not guarantee outcomes.
            </Typography>
          </Stack>
        </Box>
      </Stack>
    </Paper>
  );
}
