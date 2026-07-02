import { NotFoundException } from '@nestjs/common';
import type {
  AccountSummary,
  Customer,
  Goal,
  Transaction,
} from '@wealth/shared-types';
import { InMemoryWealthRepository } from '../data/in-memory-wealth.repository';
import { WealthDashboardService } from './wealth-dashboard.service';
import { WealthReadinessScoreService } from './wealth-readiness-score.service';

const customer: Customer = {
  id: 'cust-test-001',
  persona: 'young-salaried-professional',
  fullName: 'Test Customer',
  age: 36,
  city: 'Mumbai',
  occupation: 'Product Manager',
  monthlyIncome: 100000,
  dependents: 1,
  customerSince: '2020-01-01',
};

const accountSummary: AccountSummary = {
  id: 'acct-test-001',
  customerId: customer.id,
  currency: 'INR',
  savingsBalance: 130000,
  investmentBalance: 200000,
  fixedDepositBalance: 100000,
  recurringDepositBalance: 50000,
  mutualFundBalance: 50000,
  loanOutstanding: 1000000,
  creditCardOutstanding: 10000,
  monthlyIncome: 0,
  monthlyExpenses: 0,
  monthlySurplus: 0,
  lastUpdatedAt: '2026-07-01T09:00:00.000Z',
};

const goal: Goal = {
  id: 'goal-test-001',
  customerId: customer.id,
  name: 'Emergency Fund',
  type: 'emergency-fund',
  targetAmount: 300000,
  currentAmount: 100000,
  currency: 'INR',
  targetDate: '2027-01-01',
  status: 'active',
  priority: 'high',
};

function transaction(
  id: string,
  postedAt: string,
  description: string,
  category: Transaction['category'],
  direction: Transaction['direction'],
  amount: number,
): Transaction {
  return {
    id,
    customerId: customer.id,
    accountId: 'acct-test-primary',
    postedAt,
    description,
    category,
    direction,
    amount,
    currency: 'INR',
  };
}

describe('WealthDashboardService', () => {
  let service: WealthDashboardService;

  beforeEach(() => {
    service = new WealthDashboardService(
      new InMemoryWealthRepository(),
      new WealthReadinessScoreService(),
    );
  });

  it('calculates dashboard values from transactions, balances, goals, and risk profile', () => {
    const profile = service.calculateWealthProfile({
      customer,
      accountSummary,
      goals: [goal],
      riskProfile: {
        id: 'risk-test-001',
        customerId: customer.id,
        band: 'moderate',
        score: 60,
        assessedAt: '2026-07-01T09:00:00.000Z',
        horizonYears: 7,
        notes: [],
      },
      transactions: [
        transaction(
          'txn-001',
          '2026-01-01',
          'Salary credit',
          'income',
          'credit',
          100000,
        ),
        transaction(
          'txn-002',
          '2026-01-02',
          'Bonus credit',
          'income',
          'credit',
          20000,
        ),
        transaction('txn-003', '2026-01-03', 'Rent', 'housing', 'debit', 30000),
        transaction(
          'txn-004',
          '2026-01-04',
          'Home loan EMI',
          'housing',
          'debit',
          10000,
        ),
        transaction(
          'txn-005',
          '2026-01-05',
          'SIP transfer',
          'investments',
          'debit',
          15000,
        ),
        transaction(
          'txn-006',
          '2026-02-01',
          'Salary credit',
          'income',
          'credit',
          80000,
        ),
        transaction(
          'txn-007',
          '2026-02-02',
          'Groceries',
          'groceries',
          'debit',
          20000,
        ),
        transaction(
          'txn-008',
          '2026-02-03',
          'Personal loan EMI',
          'housing',
          'debit',
          5000,
        ),
      ],
      calculatedAt: '2026-07-02T00:00:00.000Z',
    });

    expect(profile.monthlyIncome).toBe(100000);
    expect(profile.monthlyExpenses).toBe(32500);
    expect(profile.monthlySurplus).toBe(67500);
    expect(profile.savingsRatePercent).toBe(67.5);
    expect(profile.emiBurdenPercent).toBe(7.5);
    expect(profile.idleBalance).toBe(65000);
    expect(profile.emergencyFundCoverageMonths).toBe(4);
    expect(profile.totalInvestments).toBe(200000);
    expect(profile.investmentAllocation).toEqual([
      { label: 'Fixed Deposits', amount: 100000, percentage: 50 },
      { label: 'Recurring Deposits', amount: 50000, percentage: 25 },
      { label: 'Mutual Funds', amount: 50000, percentage: 25 },
    ]);
    expect(profile.riskProfile).toBe('MODERATE');
    expect(profile.wealthReadinessScore).toBe(93);
    expect(profile.wealthReadinessBand).toBe('EXCELLENT');
    expect(profile.scoreExplanation).toEqual(
      expect.arrayContaining([
        'Savings rate contributed 25 of 25 points.',
        'Emergency fund coverage contributed 18 of 25 points.',
      ]),
    );
  });

  it('handles missing risk profile gracefully', () => {
    const profile = service.calculateWealthProfile({
      customer,
      accountSummary,
      goals: [goal],
      transactions: [
        transaction(
          'txn-001',
          '2026-01-01',
          'Salary credit',
          'income',
          'credit',
          100000,
        ),
      ],
    });

    expect(profile.riskProfile).toBe('NOT_ASSESSED');
    expect(profile.scoreExplanation).toContain(
      'Goal and risk-profile readiness contributed 8 of 15 points.',
    );
  });

  it('handles customers with no investments gracefully', () => {
    const profile = service.calculateWealthProfile({
      customer,
      accountSummary: {
        ...accountSummary,
        investmentBalance: 0,
        fixedDepositBalance: 0,
        recurringDepositBalance: 0,
        mutualFundBalance: 0,
      },
      goals: [],
      transactions: [
        transaction(
          'txn-001',
          '2026-01-01',
          'Salary credit',
          'income',
          'credit',
          100000,
        ),
        transaction('txn-002', '2026-01-02', 'Rent', 'housing', 'debit', 25000),
      ],
    });

    expect(profile.totalInvestments).toBe(0);
    expect(profile.investmentAllocation).toEqual([]);
    expect(profile.summaryInsights).toContain(
      'No active investments were found in the current profile.',
    );
  });

  it('handles customers with no loan or EMI gracefully', () => {
    const profile = service.calculateWealthProfile({
      customer,
      accountSummary: {
        ...accountSummary,
        loanOutstanding: 0,
        creditCardOutstanding: 0,
      },
      goals: [],
      transactions: [
        transaction(
          'txn-001',
          '2026-01-01',
          'Salary credit',
          'income',
          'credit',
          100000,
        ),
        transaction('txn-002', '2026-01-02', 'Rent', 'housing', 'debit', 25000),
      ],
    });

    expect(profile.loanOutstanding).toBe(0);
    expect(profile.creditCardOutstanding).toBe(0);
    expect(profile.emiBurdenPercent).toBe(0);
  });

  it('throws a clean not found error for missing customers', () => {
    expect(() => service.getWealthProfile('missing-customer')).toThrow(
      NotFoundException,
    );
  });
});
