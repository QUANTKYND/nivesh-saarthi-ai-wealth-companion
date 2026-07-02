import type { Goal, GoalType } from './index.js';

export type CreateGoalPriority = 'LOW' | 'MEDIUM' | 'HIGH';

export type GoalAchievabilityStatus = 'ACHIEVABLE' | 'AT_RISK' | 'OFF_TRACK';

export interface CreateGoalRequest {
  goalType: GoalType;
  name: string;
  targetAmount: number;
  currentSavings: number;
  targetDate: string;
  priority: CreateGoalPriority;
  plannedMonthlyContribution?: number;
  expectedAnnualReturnPercent?: number;
}

export interface GoalResponse extends Goal {
  plannedMonthlyContribution: number;
  expectedAnnualReturnPercent: number;
}

export interface GoalProjectionAssumptions {
  compoundingFrequency: 'MONTHLY';
  inflationAdjusted: boolean;
  returnsAreIllustrative: boolean;
}

export interface StepUpSuggestion {
  isRequired: boolean;
  suggestedAnnualStepUpPercent: number | null;
  estimatedProjectedAmountWithStepUp: number | null;
  explanation: string;
}

export interface GoalProjection {
  goalId: string;
  customerId: string;
  goalName: string;
  goalType: GoalType;
  targetAmount: number;
  currentSavings: number;
  targetDate: string;
  monthsRemaining: number;
  plannedMonthlyContribution: number;
  expectedAnnualReturnPercent: number;
  requiredMonthlyContribution: number;
  projectedAmount: number;
  shortfallOrSurplus: number;
  achievabilityStatus: GoalAchievabilityStatus;
  stepUpSuggestion: StepUpSuggestion;
  assumptions: GoalProjectionAssumptions;
  explanations: string[];
  calculatedAt: string;
}
