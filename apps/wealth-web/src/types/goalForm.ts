import type { CreateGoalPriority, GoalType } from '@wealth/shared-types';

export interface GoalFormState {
  goalType: GoalType | '';
  name: string;
  targetAmount: string;
  currentSavings: string;
  targetDate: string;
  priority: CreateGoalPriority | '';
  plannedMonthlyContribution: string;
  expectedAnnualReturnPercent: string;
}

export type GoalFormErrors = Partial<Record<keyof GoalFormState, string>>;
