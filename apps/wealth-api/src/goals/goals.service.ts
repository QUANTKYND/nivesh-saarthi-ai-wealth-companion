import { BadRequestException, Injectable } from '@nestjs/common';
import type {
  CreateGoalRequest,
  Goal,
  GoalProjection,
  GoalResponse,
} from '@wealth/shared-types';
import { InMemoryWealthRepository } from '../data/in-memory-wealth.repository';
import { SpendingInsightsService } from '../spending-insights/spending-insights.service';
import { GoalProjectionService } from './goal-projection.service';

const supportedGoalTypes: Goal['type'][] = [
  'emergency-fund',
  'home',
  'education',
  'retirement',
  'travel',
  'wealth-building',
];

const priorityMap: Record<CreateGoalRequest['priority'], Goal['priority']> = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
};

@Injectable()
export class GoalsService {
  constructor(
    private readonly repository: InMemoryWealthRepository,
    private readonly projectionService: GoalProjectionService,
    private readonly spendingInsightsService: SpendingInsightsService,
  ) {}

  findByCustomerId(customerId: string): Goal[] {
    return this.repository.findGoalsByCustomerId(customerId);
  }

  createGoal(customerId: string, request: CreateGoalRequest): GoalResponse {
    this.repository.findCustomerById(customerId);
    this.validateCreateGoalRequest(request);

    const plannedMonthlyContribution =
      request.plannedMonthlyContribution ??
      this.calculateFallbackMonthlyContribution(customerId);
    const expectedAnnualReturnPercent =
      request.expectedAnnualReturnPercent ?? 6;
    const goal = this.repository.createGoal({
      id: `goal-${customerId}-${Date.now()}`,
      customerId,
      name: request.name.trim(),
      type: request.goalType,
      targetAmount: request.targetAmount,
      currentAmount: request.currentSavings,
      currency: 'INR',
      targetDate: request.targetDate,
      status: 'active',
      priority: priorityMap[request.priority],
      plannedMonthlyContribution,
      expectedAnnualReturnPercent,
    });

    return this.toGoalResponse(goal);
  }

  getProjection(customerId: string, goalId: string): GoalProjection {
    const goal = this.repository.findGoalByCustomerId(customerId, goalId);
    const plannedMonthlyContribution =
      goal.plannedMonthlyContribution ??
      this.calculateFallbackMonthlyContribution(customerId);

    return this.projectionService.calculateProjection({
      goal,
      plannedMonthlyContribution,
      expectedAnnualReturnPercent: goal.expectedAnnualReturnPercent ?? 6,
    });
  }

  private validateCreateGoalRequest(request: CreateGoalRequest): void {
    if (!supportedGoalTypes.includes(request.goalType)) {
      throw new BadRequestException('Unsupported goalType');
    }

    if (!request.name?.trim()) {
      throw new BadRequestException('name is required');
    }

    if (request.targetAmount <= 0) {
      throw new BadRequestException('targetAmount must be greater than 0');
    }

    if (request.currentSavings < 0) {
      throw new BadRequestException(
        'currentSavings must be greater than or equal to 0',
      );
    }

    if (new Date(request.targetDate).getTime() <= Date.now()) {
      throw new BadRequestException('targetDate must be in the future');
    }

    if (
      request.plannedMonthlyContribution !== undefined &&
      request.plannedMonthlyContribution < 0
    ) {
      throw new BadRequestException(
        'plannedMonthlyContribution must be greater than or equal to 0',
      );
    }

    if (
      request.expectedAnnualReturnPercent !== undefined &&
      (request.expectedAnnualReturnPercent < 0 ||
        request.expectedAnnualReturnPercent > 15)
    ) {
      throw new BadRequestException(
        'expectedAnnualReturnPercent must be between 0 and 15',
      );
    }

    if (!Object.keys(priorityMap).includes(request.priority)) {
      throw new BadRequestException('Unsupported priority');
    }
  }

  private calculateFallbackMonthlyContribution(customerId: string): number {
    const spendingInsights =
      this.spendingInsightsService.getSpendingInsights(customerId);

    if (spendingInsights.investableSurplusEstimate.min > 0) {
      return spendingInsights.investableSurplusEstimate.min;
    }

    return Math.max(0, Math.round(spendingInsights.monthlySurplus * 0.1));
  }

  private toGoalResponse(goal: Goal): GoalResponse {
    return {
      ...goal,
      plannedMonthlyContribution: goal.plannedMonthlyContribution ?? 0,
      expectedAnnualReturnPercent: goal.expectedAnnualReturnPercent ?? 6,
    };
  }
}
