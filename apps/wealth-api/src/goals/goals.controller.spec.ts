import { InMemoryWealthRepository } from '../data/in-memory-wealth.repository';
import { SpendingInsightsCalculatorService } from '../spending-insights/spending-insights-calculator.service';
import { SpendingInsightsService } from '../spending-insights/spending-insights.service';
import { GoalProjectionService } from './goal-projection.service';
import { GoalsController } from './goals.controller';
import { GoalsService } from './goals.service';

describe('GoalsController', () => {
  let controller: GoalsController;

  beforeEach(() => {
    const repository = new InMemoryWealthRepository();
    controller = new GoalsController(
      new GoalsService(
        repository,
        new GoalProjectionService(),
        new SpendingInsightsService(
          repository,
          new SpendingInsightsCalculatorService(),
        ),
      ),
    );
  });

  it('returns goals for a customer', () => {
    expect(
      controller.findByCustomerId('cust-family-001').length,
    ).toBeGreaterThan(0);
  });

  it('creates a goal for a customer', () => {
    const goal = controller.createGoal('cust-young-001', {
      goalType: 'travel',
      name: 'Anniversary Trip',
      targetAmount: 300000,
      currentSavings: 50000,
      targetDate: '2030-01-01',
      priority: 'MEDIUM',
      plannedMonthlyContribution: 5000,
      expectedAnnualReturnPercent: 6,
    });

    expect(goal.name).toBe('Anniversary Trip');
    expect(goal.type).toBe('travel');
  });

  it('returns projection for a customer goal', () => {
    const projection = controller.getProjection(
      'cust-family-001',
      'goal-f-001',
    );

    expect(projection.goalId).toBe('goal-f-001');
    expect(projection.projectedAmount).toBeGreaterThan(0);
  });
});
