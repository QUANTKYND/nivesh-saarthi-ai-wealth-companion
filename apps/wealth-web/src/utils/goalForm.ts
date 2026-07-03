import type { CreateGoalPriority, CreateGoalRequest, GoalType } from '@wealth/shared-types';
import { goalPriorityOptions, goalTypeOptions } from '../constants/goals';
import type { GoalFormErrors, GoalFormState } from '../types/goalForm';
import { getDateInputValueFromOffset, getTodayDateInputValue } from './date';

export function createBlankGoalForm(): GoalFormState {
  return {
    goalType: '',
    name: '',
    targetAmount: '',
    currentSavings: '',
    targetDate: getDateInputValueFromOffset(12),
    priority: 'MEDIUM',
    plannedMonthlyContribution: '',
    expectedAnnualReturnPercent: '',
  };
}

export function buildGoalRequest(form: GoalFormState): CreateGoalRequest {
  return {
    goalType: form.goalType as GoalType,
    name: form.name.trim(),
    targetAmount: Number(form.targetAmount),
    currentSavings: Number(form.currentSavings),
    targetDate: form.targetDate,
    priority: form.priority as CreateGoalPriority,
    plannedMonthlyContribution: parseOptionalNumber(form.plannedMonthlyContribution),
    expectedAnnualReturnPercent: parseOptionalNumber(form.expectedAnnualReturnPercent),
  };
}

export function validateGoalForm(form: GoalFormState): GoalFormErrors {
  const errors: GoalFormErrors = {};
  const today = getTodayDateInputValue();

  if (!goalTypeOptions.some((option) => option.value === form.goalType)) {
    errors.goalType = 'Select a supported goal type.';
  }

  if (!form.name.trim()) {
    errors.name = 'Goal name is required.';
  }

  if (!isPositiveNumber(form.targetAmount)) {
    errors.targetAmount = 'Target amount must be greater than 0.';
  }

  if (!isNonNegativeNumber(form.currentSavings)) {
    errors.currentSavings = 'Current savings must be greater than or equal to 0.';
  }

  if (!form.targetDate || form.targetDate <= today) {
    errors.targetDate = 'Target date must be in the future.';
  }

  if (!goalPriorityOptions.some((option) => option.value === form.priority)) {
    errors.priority = 'Select a supported priority.';
  }

  if (form.plannedMonthlyContribution.trim()) {
    const plannedMonthlyContribution = Number(form.plannedMonthlyContribution);

    if (!Number.isFinite(plannedMonthlyContribution) || plannedMonthlyContribution < 0) {
      errors.plannedMonthlyContribution =
        'Planned monthly contribution must be greater than or equal to 0.';
    }
  }

  if (form.expectedAnnualReturnPercent.trim()) {
    const expectedAnnualReturnPercent = Number(form.expectedAnnualReturnPercent);

    if (
      !Number.isFinite(expectedAnnualReturnPercent) ||
      expectedAnnualReturnPercent < 0 ||
      expectedAnnualReturnPercent > 15
    ) {
      errors.expectedAnnualReturnPercent = 'Expected annual return must be between 0 and 15.';
    }
  }

  return errors;
}

function isPositiveNumber(value: string): boolean {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0;
}

function isNonNegativeNumber(value: string): boolean {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0;
}

function parseOptionalNumber(value: string): number | undefined {
  const trimmed = value.trim();

  if (!trimmed) {
    return undefined;
  }

  const parsed = Number(trimmed);
  return Number.isFinite(parsed) ? parsed : undefined;
}
