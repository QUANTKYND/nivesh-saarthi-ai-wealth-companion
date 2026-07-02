import { NotFoundException } from '@nestjs/common';
import { InMemoryWealthRepository } from '../data/in-memory-wealth.repository';
import { SpendingInsightsCalculatorService } from './spending-insights-calculator.service';
import { SpendingInsightsController } from './spending-insights.controller';
import { SpendingInsightsService } from './spending-insights.service';

describe('SpendingInsightsController', () => {
  let controller: SpendingInsightsController;

  beforeEach(() => {
    controller = new SpendingInsightsController(
      new SpendingInsightsService(
        new InMemoryWealthRepository(),
        new SpendingInsightsCalculatorService(),
      ),
    );
  });

  it('returns spending insights with required sections', () => {
    const insights = controller.getSpendingInsights('cust-young-001');

    expect(insights.customerId).toBe('cust-young-001');
    expect(insights.categoryBreakdown.length).toBeGreaterThan(0);
    expect(insights.topCategories.length).toBeGreaterThan(0);
    expect(insights.discretionarySpend.status).toBeDefined();
    expect(insights.emiBurden.status).toBeDefined();
    expect(insights.investableSurplusEstimate.explanation).toContain(
      'goal-based investing',
    );
    expect(insights.insights.length).toBeGreaterThanOrEqual(5);
  });

  it('throws a clean not found error for missing customers', () => {
    expect(() => controller.getSpendingInsights('missing-customer')).toThrow(
      NotFoundException,
    );
  });
});
