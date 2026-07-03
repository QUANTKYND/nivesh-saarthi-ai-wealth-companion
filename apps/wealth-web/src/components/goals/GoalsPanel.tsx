import AddIcon from '@mui/icons-material/Add';
import { Alert, Box, Button, ButtonBase, Chip, Grid, IconButton, LinearProgress, Stack, Tooltip, Typography } from '@mui/material';
import type { Goal, GoalProjection } from '@wealth/shared-types';
import { EmptyState } from '../common/EmptyState';
import { formatCurrency, formatGoalDate, formatGoalTypeLabel } from '../../utils/formatters';
import { GoalProjectionPanel } from './GoalProjectionPanel';

export function GoalsPanel(props: {
  goals: Goal[];
  selectedGoalId: string;
  selectedGoal: Goal | null;
  projection: GoalProjection | undefined;
  isProjectionLoading: boolean;
  projectionError: Error | null;
  isCreatingGoal: boolean;
  createGoalError: Error | null;
  onOpenCreateGoal: () => void;
  onSelectGoal: (goalId: string) => void;
  onRetryProjection: () => void;
  onUseGoalForRecommendation: (goalId: string) => void;
}) {
  if (props.goals.length === 0) {
    return (
      <Stack spacing={1.5}>
        <Alert severity="info" variant="outlined">
          Create a goal to unlock backend projection and recommendation handoff.
        </Alert>
        <EmptyState
          title="No goals yet"
          description="Create a first goal for education, home purchase, retirement, or wealth building."
        />
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={props.onOpenCreateGoal}
          sx={{ alignSelf: 'flex-start' }}
        >
          Create goal
        </Button>
      </Stack>
    );
  }

  return (
    <Stack spacing={2}>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={1.5}
        justifyContent="space-between"
        alignItems={{ xs: 'stretch', sm: 'center' }}
      >
        <Box>
          <Typography variant="h3">Your goals</Typography>
          <Typography variant="body2" color="text.secondary">
            Select a goal to review the deterministic projection and set up the next step.
          </Typography>
        </Box>
        <Tooltip title="Create goal">
          <IconButton
            color="primary"
            onClick={props.onOpenCreateGoal}
            aria-label="Create goal"
            sx={{ alignSelf: { xs: 'flex-start', sm: 'center' } }}
          >
            <AddIcon />
          </IconButton>
        </Tooltip>
      </Stack>

      <Grid container spacing={2} alignItems="flex-start">
        <Grid size={{ xs: 12 }}>
          <Stack spacing={1.25}>
            {props.goals.map((goal) => {
              const progress =
                goal.targetAmount > 0
                  ? Math.min((goal.currentAmount / goal.targetAmount) * 100, 100)
                  : 0;
              const isSelected = goal.id === props.selectedGoalId;

              return (
                <ButtonBase
                  key={goal.id}
                  onClick={() => props.onSelectGoal(goal.id)}
                  sx={{
                    borderRadius: 1,
                    textAlign: 'left',
                    width: '100%',
                  }}
                >
                  <Box
                    sx={{
                      width: '100%',
                      border: '1px solid',
                      borderColor: isSelected ? 'primary.main' : 'divider',
                      bgcolor: isSelected ? 'rgba(18, 76, 99, 0.04)' : 'background.paper',
                      borderRadius: 1,
                      p: 1.5,
                      boxShadow: isSelected ? 1 : 0,
                    }}
                  >
                    <Stack direction="row" justifyContent="space-between" gap={1} alignItems="start">
                      <Box sx={{ minWidth: 0, flex: 1 }}>
                        <Stack direction="row" spacing={0.75} alignItems="center" flexWrap="wrap">
                          <Typography fontWeight={800} noWrap>
                            {goal.name}
                          </Typography>
                          {isSelected ? <Chip label="Selected" color="primary" size="small" /> : null}
                        </Stack>
                        <Typography variant="caption" color="text.secondary">
                          {formatGoalTypeLabel(goal.type)} · target {formatCurrency(goal.targetAmount)} ·
                          {` due ${formatGoalDate(goal.targetDate)}`}
                        </Typography>
                      </Box>
                      <Typography fontWeight={700} sx={{ whiteSpace: 'nowrap' }}>
                        {formatCurrency(goal.currentAmount)}
                      </Typography>
                    </Stack>

                    <LinearProgress
                      variant="determinate"
                      value={progress}
                      sx={{ height: 7, borderRadius: 1, mt: 1.25 }}
                    />

                    <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mt: 1 }}>
                      <Chip
                        label={goal.status.toUpperCase()}
                        size="small"
                        variant={isSelected ? 'filled' : 'outlined'}
                      />
                      <Chip label={`Priority: ${goal.priority}`} size="small" variant="outlined" />
                      {goal.plannedMonthlyContribution ? (
                        <Chip
                          label={`Planned ${formatCurrency(goal.plannedMonthlyContribution)}/mo`}
                          size="small"
                          variant="outlined"
                        />
                      ) : null}
                    </Stack>
                  </Box>
                </ButtonBase>
              );
            })}
          </Stack>
        </Grid>

        <Grid size={{ xs: 12 }}>
          <GoalProjectionPanel
            goal={props.selectedGoal}
            projection={props.projection}
            isLoading={props.isProjectionLoading}
            error={props.projectionError}
            createGoalError={props.createGoalError}
            isCreatingGoal={props.isCreatingGoal}
            onRetry={props.onRetryProjection}
            onUseGoalForRecommendation={props.onUseGoalForRecommendation}
          />
        </Grid>
      </Grid>
    </Stack>
  );
}
