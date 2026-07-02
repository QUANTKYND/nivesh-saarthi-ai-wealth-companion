import { Injectable } from '@nestjs/common';
import type {
  Goal,
  GoalAchievabilityStatus,
  GoalProjection,
  StepUpSuggestion,
} from '@wealth/shared-types';

export interface GoalProjectionInput {
  goal: Goal;
  plannedMonthlyContribution: number;
  expectedAnnualReturnPercent: number;
  calculatedAt?: string;
}

@Injectable()
export class GoalProjectionService {
  calculateProjection(input: GoalProjectionInput): GoalProjection {
    const monthsRemaining = this.calculateMonthsRemaining(
      input.goal.targetDate,
      input.calculatedAt,
    );
    const monthlyRate = input.expectedAnnualReturnPercent / 12 / 100;
    const futureValueOfCurrentSavings =
      this.calculateFutureValueOfCurrentSavings(
        input.goal.currentAmount,
        monthlyRate,
        monthsRemaining,
      );
    const annuityFactor = this.calculateAnnuityFactor(
      monthlyRate,
      monthsRemaining,
    );
    const futureValueOfMonthlyContribution =
      input.plannedMonthlyContribution * annuityFactor;
    const projectedAmount = this.roundCurrency(
      futureValueOfCurrentSavings + futureValueOfMonthlyContribution,
    );
    const requiredMonthlyContribution = this.roundCurrency(
      Math.max(
        0,
        (input.goal.targetAmount - futureValueOfCurrentSavings) / annuityFactor,
      ),
    );
    const shortfallOrSurplus = this.roundCurrency(
      projectedAmount - input.goal.targetAmount,
    );
    const achievabilityStatus = this.toAchievabilityStatus(
      projectedAmount,
      input.goal.targetAmount,
    );
    const stepUpSuggestion = this.calculateStepUpSuggestion({
      goal: input.goal,
      monthsRemaining,
      monthlyRate,
      plannedMonthlyContribution: input.plannedMonthlyContribution,
      achievabilityStatus,
    });

    return {
      goalId: input.goal.id,
      customerId: input.goal.customerId,
      goalName: input.goal.name,
      goalType: input.goal.type,
      targetAmount: input.goal.targetAmount,
      currentSavings: input.goal.currentAmount,
      targetDate: input.goal.targetDate,
      monthsRemaining,
      plannedMonthlyContribution: input.plannedMonthlyContribution,
      expectedAnnualReturnPercent: input.expectedAnnualReturnPercent,
      requiredMonthlyContribution,
      projectedAmount,
      shortfallOrSurplus,
      achievabilityStatus,
      stepUpSuggestion,
      assumptions: {
        compoundingFrequency: 'MONTHLY',
        inflationAdjusted: false,
        returnsAreIllustrative: true,
      },
      explanations: this.buildExplanations({
        monthsRemaining,
        plannedMonthlyContribution: input.plannedMonthlyContribution,
        shortfallOrSurplus,
        stepUpSuggestion,
      }),
      calculatedAt: input.calculatedAt ?? new Date().toISOString(),
    };
  }

  private calculateMonthsRemaining(
    targetDate: string,
    calculatedAt: string | undefined,
  ): number {
    const from = new Date(calculatedAt ?? new Date().toISOString());
    const to = new Date(targetDate);
    const monthDelta =
      (to.getUTCFullYear() - from.getUTCFullYear()) * 12 +
      (to.getUTCMonth() - from.getUTCMonth());

    return Math.max(
      1,
      monthDelta + (to.getUTCDate() >= from.getUTCDate() ? 0 : -1),
    );
  }

  private calculateFutureValueOfCurrentSavings(
    currentSavings: number,
    monthlyRate: number,
    monthsRemaining: number,
  ): number {
    if (monthlyRate === 0) {
      return currentSavings;
    }

    return currentSavings * (1 + monthlyRate) ** monthsRemaining;
  }

  private calculateAnnuityFactor(
    monthlyRate: number,
    monthsRemaining: number,
  ): number {
    if (monthlyRate === 0) {
      return monthsRemaining;
    }

    return ((1 + monthlyRate) ** monthsRemaining - 1) / monthlyRate;
  }

  private toAchievabilityStatus(
    projectedAmount: number,
    targetAmount: number,
  ): GoalAchievabilityStatus {
    if (projectedAmount >= targetAmount) {
      return 'ACHIEVABLE';
    }

    if (projectedAmount >= targetAmount * 0.75) {
      return 'AT_RISK';
    }

    return 'OFF_TRACK';
  }

  private calculateStepUpSuggestion(input: {
    goal: Goal;
    monthsRemaining: number;
    monthlyRate: number;
    plannedMonthlyContribution: number;
    achievabilityStatus: GoalAchievabilityStatus;
  }): StepUpSuggestion {
    if (input.achievabilityStatus === 'ACHIEVABLE') {
      return {
        isRequired: false,
        suggestedAnnualStepUpPercent: null,
        estimatedProjectedAmountWithStepUp: null,
        explanation: 'Your current plan is projected to meet this goal.',
      };
    }

    const testedStepUps = [5, 10, 15];
    const projections = testedStepUps.map((stepUpPercent) => ({
      stepUpPercent,
      projectedAmount: this.roundCurrency(
        this.calculateProjectedAmountWithStepUp(input, stepUpPercent),
      ),
    }));
    const successfulProjection = projections.find(
      (projection) => projection.projectedAmount >= input.goal.targetAmount,
    );
    const selectedProjection =
      successfulProjection ?? projections[projections.length - 1];

    return {
      isRequired: true,
      suggestedAnnualStepUpPercent: selectedProjection?.stepUpPercent ?? null,
      estimatedProjectedAmountWithStepUp:
        selectedProjection?.projectedAmount ?? null,
      explanation: successfulProjection
        ? `A ${successfulProjection.stepUpPercent}% yearly step-up may help close the projected shortfall.`
        : 'Even a 15% yearly step-up may not fully close the shortfall. Consider a higher starting contribution, longer timeline, or advisor support.',
    };
  }

  private calculateProjectedAmountWithStepUp(
    input: {
      goal: Goal;
      monthsRemaining: number;
      monthlyRate: number;
      plannedMonthlyContribution: number;
    },
    annualStepUpPercent: number,
  ): number {
    let projectedAmount = this.calculateFutureValueOfCurrentSavings(
      input.goal.currentAmount,
      input.monthlyRate,
      input.monthsRemaining,
    );

    for (let month = 1; month <= input.monthsRemaining; month += 1) {
      const completedYears = Math.floor((month - 1) / 12);
      const steppedContribution =
        input.plannedMonthlyContribution *
        (1 + annualStepUpPercent / 100) ** completedYears;
      const monthsToCompound = input.monthsRemaining - month;

      projectedAmount +=
        steppedContribution * (1 + input.monthlyRate) ** monthsToCompound;
    }

    return projectedAmount;
  }

  private buildExplanations(input: {
    monthsRemaining: number;
    plannedMonthlyContribution: number;
    shortfallOrSurplus: number;
    stepUpSuggestion: StepUpSuggestion;
  }): string[] {
    const explanations = [
      `You have ${input.monthsRemaining} months remaining for this goal.`,
    ];

    if (input.shortfallOrSurplus >= 0) {
      explanations.push(
        `At your planned contribution of INR ${input.plannedMonthlyContribution.toLocaleString('en-IN')} per month, you may exceed the target by around INR ${input.shortfallOrSurplus.toLocaleString('en-IN')}.`,
      );
    } else {
      explanations.push(
        `At your planned contribution of INR ${input.plannedMonthlyContribution.toLocaleString('en-IN')} per month, you may fall short by around INR ${Math.abs(input.shortfallOrSurplus).toLocaleString('en-IN')}.`,
      );
    }

    explanations.push(input.stepUpSuggestion.explanation);

    return explanations;
  }

  private roundCurrency(value: number): number {
    return Math.round(value);
  }
}
