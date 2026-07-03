import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';
import {
  Alert,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormHelperText,
  Grid,
  IconButton,
  InputAdornment,
  MenuItem,
  Select,
  Stack,
  TextField,
} from '@mui/material';
import type { CreateGoalPriority, GoalType } from '@wealth/shared-types';
import { goalPriorityOptions, goalTypeOptions } from '../../constants/goals';
import type { GoalFormErrors, GoalFormState } from '../../types/goalForm';
import { getTomorrowDateInputValue } from '../../utils/date';

export function GoalCreateDialog(props: {
  open: boolean;
  form: GoalFormState;
  errors: GoalFormErrors;
  error: Error | null;
  isSubmitting: boolean;
  onClose: () => void;
  onFieldChange: <K extends keyof GoalFormState>(field: K, value: GoalFormState[K]) => void;
  onSubmit: () => void;
}) {
  return (
    <Dialog open={props.open} onClose={props.onClose} fullWidth maxWidth="sm">
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        Create goal
        <IconButton
          aria-label="Close goal dialog"
          onClick={props.onClose}
          disabled={props.isSubmitting}
          size="small"
        >
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers>
        <Stack spacing={2} sx={{ pt: 0.5 }}>
          {props.error ? <Alert severity="error">{props.error.message}</Alert> : null}

          <TextField
            label="Goal name"
            value={props.form.name}
            onChange={(event) => props.onFieldChange('name', event.target.value)}
            error={Boolean(props.errors.name)}
            helperText={props.errors.name ?? 'Enter a clear goal title.'}
            fullWidth
            size="small"
          />

          <FormControl fullWidth size="small" error={Boolean(props.errors.goalType)}>
            <Select
              value={props.form.goalType}
              onChange={(event) =>
                props.onFieldChange('goalType', event.target.value as GoalType | '')
              }
              displayEmpty
            >
              <MenuItem value="" disabled>
                Select goal type
              </MenuItem>
              {goalTypeOptions.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
            <FormHelperText>
              {props.errors.goalType ?? 'Choose the closest supported goal type.'}
            </FormHelperText>
          </FormControl>

          <Grid container spacing={1.5}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="Target amount"
                value={props.form.targetAmount}
                onChange={(event) => props.onFieldChange('targetAmount', event.target.value)}
                error={Boolean(props.errors.targetAmount)}
                helperText={props.errors.targetAmount ?? 'Total amount needed for the goal.'}
                fullWidth
                size="small"
                type="number"
                inputProps={{ min: 0, step: '1' }}
                InputProps={{
                  startAdornment: <InputAdornment position="start">INR</InputAdornment>,
                }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="Current savings"
                value={props.form.currentSavings}
                onChange={(event) => props.onFieldChange('currentSavings', event.target.value)}
                error={Boolean(props.errors.currentSavings)}
                helperText={props.errors.currentSavings ?? 'Amount already saved for this goal.'}
                fullWidth
                size="small"
                type="number"
                inputProps={{ min: 0, step: '1' }}
                InputProps={{
                  startAdornment: <InputAdornment position="start">INR</InputAdornment>,
                }}
              />
            </Grid>
          </Grid>

          <Grid container spacing={1.5}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="Target date"
                value={props.form.targetDate}
                onChange={(event) => props.onFieldChange('targetDate', event.target.value)}
                error={Boolean(props.errors.targetDate)}
                helperText={props.errors.targetDate ?? 'Select a future date.'}
                fullWidth
                size="small"
                type="date"
                InputLabelProps={{ shrink: true }}
                inputProps={{ min: getTomorrowDateInputValue() }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <FormControl fullWidth size="small" error={Boolean(props.errors.priority)}>
                <Select
                  value={props.form.priority}
                  onChange={(event) =>
                    props.onFieldChange('priority', event.target.value as CreateGoalPriority | '')
                  }
                  displayEmpty
                >
                  <MenuItem value="" disabled>
                    Select priority
                  </MenuItem>
                  {goalPriorityOptions.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
                <FormHelperText>
                  {props.errors.priority ?? 'Choose how urgently the goal should be funded.'}
                </FormHelperText>
              </FormControl>
            </Grid>
          </Grid>

          <Grid container spacing={1.5}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="Planned monthly contribution"
                value={props.form.plannedMonthlyContribution}
                onChange={(event) =>
                  props.onFieldChange('plannedMonthlyContribution', event.target.value)
                }
                error={Boolean(props.errors.plannedMonthlyContribution)}
                helperText={
                  props.errors.plannedMonthlyContribution ??
                  'Optional. Leave blank to use backend fallback.'
                }
                fullWidth
                size="small"
                type="number"
                inputProps={{ min: 0, step: '1' }}
                InputProps={{
                  startAdornment: <InputAdornment position="start">INR</InputAdornment>,
                }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="Expected annual return %"
                value={props.form.expectedAnnualReturnPercent}
                onChange={(event) =>
                  props.onFieldChange('expectedAnnualReturnPercent', event.target.value)
                }
                error={Boolean(props.errors.expectedAnnualReturnPercent)}
                helperText={props.errors.expectedAnnualReturnPercent ?? 'Optional. Range 0 to 15.'}
                fullWidth
                size="small"
                type="number"
                inputProps={{ min: 0, max: 15, step: '0.1' }}
              />
            </Grid>
          </Grid>
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={props.onClose} disabled={props.isSubmitting}>
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={props.onSubmit}
          disabled={props.isSubmitting}
          startIcon={props.isSubmitting ? <CircularProgress size={16} /> : <AddIcon />}
        >
          Create goal
        </Button>
      </DialogActions>
    </Dialog>
  );
}
