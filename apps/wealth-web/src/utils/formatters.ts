import type { GoalType } from '@wealth/shared-types';
import { goalTypeOptions } from '../constants/goals';

export function formatGoalTypeLabel(goalType: GoalType): string {
  return goalTypeOptions.find((option) => option.value === goalType)?.label ?? goalType;
}

export function formatGoalDate(value: string): string {
  const date = new Date(`${value}T00:00:00`);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(date);
}

export function formatProjectionDate(value: string): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(date);
}

export function formatCurrency(value: number): string {
  return `INR ${Math.round(value).toLocaleString('en-IN')}`;
}
