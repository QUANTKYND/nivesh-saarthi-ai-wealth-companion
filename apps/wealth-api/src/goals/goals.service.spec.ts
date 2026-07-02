import { BadRequestException, NotFoundException } from '@nestjs/common';
import { InMemoryWealthRepository } from '../data/in-memory-wealth.repository';
import { SpendingInsightsCalculatorService } from '../spending-insights/spending-insights-calculator.service';
import { SpendingInsightsService } from '../spending-insights/spending-insights.service';
import { GoalProjectionService } from './goal-projection.service';
import { GoalsService } from './goals.service';

function createService(): GoalsService {
  const repository = new InMemoryWealthRepository();

  return new GoalsService(
    repository,
    new GoalProjectionService(),
    new SpendingInsightsService(
      repository,
      new SpendingInsightsCalculatorService(),
    ),
  );
}

describe('GoalsService', () => {
  it('lists seeded customer goals', () => {
    const service = createService();

    expect(service.findByCustomerId('cust-family-001').length).toBeGreaterThan(
      0,
    );
  });

  it('creates a goal with validation and explicit projection inputs', () => {
    const service = createService();
    const goal = service.createGoal('cust-young-001', {
      goalType: 'travel',
      name: 'Europe Trip',
      targetAmount: 500000,
      currentSavings: 50000,
      targetDate: '2030-01-01',
      priority: 'MEDIUM',
      plannedMonthlyContribution: 10000,
      expectedAnnualReturnPercent: 7,
    });

    expect(goal).toMatchObject({
      customerId: 'cust-young-001',
      name: 'Europe Trip',
      type: 'travel',
      priority: 'medium',
      plannedMonthlyContribution: 10000,
      expectedAnnualReturnPercent: 7,
    });
  });

  it('uses spending insights fallback when planned contribution is missing', () => {
    const service = createService();
    const goal = service.createGoal('cust-young-001', {
      goalType: 'wealth-building',
      name: 'Long Term Wealth',
      targetAmount: 1000000,
      currentSavings: 100000,
      targetDate: '2031-01-01',
      priority: 'HIGH',
    });

    expect(goal.plannedMonthlyContribution).toBeGreaterThan(0);
    expect(goal.expectedAnnualReturnPercent).toBe(6);
  });

  it('returns projection for a seeded goal', () => {
    const service = createService();
    const projection = service.getProjection('cust-family-001', 'goal-f-001');

    expect(projection.goalId).toBe('goal-f-001');
    expect(projection.requiredMonthlyContribution).toBeGreaterThan(0);
    expect(projection.explanations.length).toBeGreaterThanOrEqual(3);
  });

  it('rejects invalid goal input', () => {
    const service = createService();

    expect(() =>
      service.createGoal('cust-young-001', {
        goalType: 'travel',
        name: 'Invalid Goal',
        targetAmount: 0,
        currentSavings: 0,
        targetDate: '2030-01-01',
        priority: 'LOW',
      }),
    ).toThrow(BadRequestException);
  });

  it('rejects target dates in the past', () => {
    const service = createService();

    expect(() =>
      service.createGoal('cust-young-001', {
        goalType: 'travel',
        name: 'Past Goal',
        targetAmount: 100000,
        currentSavings: 0,
        targetDate: '2020-01-01',
        priority: 'LOW',
      }),
    ).toThrow(BadRequestException);
  });

  it('throws not found for missing customer and missing goal', () => {
    const service = createService();

    expect(() => service.findByCustomerId('missing-customer')).toThrow(
      NotFoundException,
    );
    expect(() =>
      service.getProjection('cust-young-001', 'missing-goal'),
    ).toThrow(NotFoundException);
  });
});
