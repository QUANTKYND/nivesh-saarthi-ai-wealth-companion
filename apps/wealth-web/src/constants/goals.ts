import type { CreateGoalPriority, GoalType } from '@wealth/shared-types';

export const goalTypeOptions: Array<{ value: GoalType; label: string }> = [
  { value: 'emergency-fund', label: 'Emergency fund' },
  { value: 'home', label: 'Home purchase' },
  { value: 'education', label: 'Education' },
  { value: 'retirement', label: 'Retirement' },
  { value: 'travel', label: 'Travel' },
  { value: 'wealth-building', label: 'Wealth building' },
];

export const goalPriorityOptions: Array<{ value: CreateGoalPriority; label: string }> = [
  { value: 'LOW', label: 'Low' },
  { value: 'MEDIUM', label: 'Medium' },
  { value: 'HIGH', label: 'High' },
];
