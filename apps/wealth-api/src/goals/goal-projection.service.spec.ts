import type { Goal } from '@wealth/shared-types';
import { GoalProjectionService } from './goal-projection.service';

const goal: Goal = {
  id: 'goal-test-001',
  customerId: 'cust-test-001',
  name: 'Child Education',
  type: 'education',
  targetAmount: 1000000,
  currentAmount: 100000,
  currency: 'INR',
  targetDate: '2031-07-02',
  status: 'active',
  priority: 'high',
};

describe('GoalProjectionService', () => {
  let service: GoalProjectionService;

  beforeEach(() => {
    service = new GoalProjectionService();
  });

  it('calculates projection with positive annual return', () => {
    const projection = service.calculateProjection({
      goal,
      plannedMonthlyContribution: 10000,
      expectedAnnualReturnPercent: 8,
      calculatedAt: '2026-07-02T00:00:00.000Z',
    });

    expect(projection.monthsRemaining).toBe(60);
    expect(projection.projectedAmount).toBeGreaterThan(790000);
    expect(projection.requiredMonthlyContribution).toBe(11582);
    expect(projection.shortfallOrSurplus).toBeLessThan(0);
    expect(projection.achievabilityStatus).toBe('AT_RISK');
    expect(projection.stepUpSuggestion.isRequired).toBe(true);
  });

  it('calculates projection with zero annual return safely', () => {
    const projection = service.calculateProjection({
      goal,
      plannedMonthlyContribution: 15000,
      expectedAnnualReturnPercent: 0,
      calculatedAt: '2026-07-02T00:00:00.000Z',
    });

    expect(projection.projectedAmount).toBe(1000000);
    expect(projection.requiredMonthlyContribution).toBe(15000);
    expect(projection.shortfallOrSurplus).toBe(0);
    expect(projection.achievabilityStatus).toBe('ACHIEVABLE');
  });

  it('returns off-track status and best step-up when goal is far short', () => {
    const projection = service.calculateProjection({
      goal: {
        ...goal,
        targetAmount: 5000000,
      },
      plannedMonthlyContribution: 5000,
      expectedAnnualReturnPercent: 6,
      calculatedAt: '2026-07-02T00:00:00.000Z',
    });

    expect(projection.achievabilityStatus).toBe('OFF_TRACK');
    expect(projection.stepUpSuggestion).toMatchObject({
      isRequired: true,
      suggestedAnnualStepUpPercent: 15,
    });
    expect(projection.stepUpSuggestion.explanation).toContain(
      'advisor support',
    );
  });
});
