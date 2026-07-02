import { WealthReadinessScoreService } from './wealth-readiness-score.service';

describe('WealthReadinessScoreService', () => {
  let service: WealthReadinessScoreService;

  beforeEach(() => {
    service = new WealthReadinessScoreService();
  });

  it('maps excellent score bands', () => {
    expect(
      service.calculate({
        savingsRatePercent: 35,
        emergencyFundCoverageMonths: 8,
        emiBurdenPercent: 10,
        fixedDepositBalance: 100000,
        recurringDepositBalance: 0,
        mutualFundBalance: 100000,
        hasGoals: true,
        hasRiskProfile: true,
      }),
    ).toMatchObject({ score: 100, band: 'EXCELLENT' });
  });

  it('maps good score bands', () => {
    expect(
      service.calculate({
        savingsRatePercent: 22,
        emergencyFundCoverageMonths: 3,
        emiBurdenPercent: 25,
        fixedDepositBalance: 100000,
        recurringDepositBalance: 0,
        mutualFundBalance: 0,
        hasGoals: true,
        hasRiskProfile: false,
      }),
    ).toMatchObject({ score: 72, band: 'GOOD' });
  });

  it('maps fair score bands', () => {
    expect(
      service.calculate({
        savingsRatePercent: 15,
        emergencyFundCoverageMonths: 1.5,
        emiBurdenPercent: 35,
        fixedDepositBalance: 0,
        recurringDepositBalance: 0,
        mutualFundBalance: 100000,
        hasGoals: false,
        hasRiskProfile: false,
      }),
    ).toMatchObject({ score: 40, band: 'FAIR' });
  });

  it('maps needs-attention score bands', () => {
    expect(
      service.calculate({
        savingsRatePercent: -5,
        emergencyFundCoverageMonths: 0.25,
        emiBurdenPercent: 50,
        fixedDepositBalance: 0,
        recurringDepositBalance: 0,
        mutualFundBalance: 0,
        hasGoals: false,
        hasRiskProfile: false,
      }),
    ).toMatchObject({ score: 0, band: 'NEEDS_ATTENTION' });
  });
});
