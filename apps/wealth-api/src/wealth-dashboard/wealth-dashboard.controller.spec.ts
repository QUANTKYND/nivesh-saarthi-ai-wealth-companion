import { InMemoryWealthRepository } from '../data/in-memory-wealth.repository';
import { WealthDashboardController } from './wealth-dashboard.controller';
import { WealthDashboardService } from './wealth-dashboard.service';
import { WealthReadinessScoreService } from './wealth-readiness-score.service';

describe('WealthDashboardController', () => {
  let controller: WealthDashboardController;

  beforeEach(() => {
    controller = new WealthDashboardController(
      new WealthDashboardService(
        new InMemoryWealthRepository(),
        new WealthReadinessScoreService(),
      ),
    );
  });

  it('returns a complete calculated wealth profile for a seeded customer', () => {
    const profile = controller.getWealthProfile('cust-young-001');

    expect(profile.customerId).toBe('cust-young-001');
    expect(profile.fullName).toBe('Aarav Mehta');
    expect(profile.currency).toBe('INR');
    expect(profile.wealthReadinessBand).toBe('EXCELLENT');
  });
});
