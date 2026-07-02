import type { Transaction } from '@wealth/shared-types';
import { SpendingInsightsCalculatorService } from './spending-insights-calculator.service';

function transaction(
  id: string,
  postedAt: string,
  description: string,
  category: Transaction['category'],
  direction: Transaction['direction'],
  amount: number,
  merchant?: string,
): Transaction {
  return {
    id,
    customerId: 'cust-test-001',
    accountId: 'acct-test-primary',
    postedAt,
    description,
    category,
    direction,
    amount,
    currency: 'INR',
    merchant,
  };
}

describe('SpendingInsightsCalculatorService', () => {
  let calculator: SpendingInsightsCalculatorService;

  beforeEach(() => {
    calculator = new SpendingInsightsCalculatorService();
  });

  it('calculates category grouping, top categories, cash flow, and investment-transfer exclusion', () => {
    const insights = calculator.calculate({
      customerId: 'cust-test-001',
      calculatedAt: '2026-07-02T00:00:00.000Z',
      transactions: [
        transaction(
          'txn-001',
          '2026-01-01',
          'Salary',
          'income',
          'credit',
          100000,
        ),
        transaction('txn-002', '2026-01-02', 'Rent', 'housing', 'debit', 30000),
        transaction(
          'txn-003',
          '2026-01-03',
          'Home loan EMI',
          'housing',
          'debit',
          10000,
        ),
        transaction(
          'txn-004',
          '2026-01-04',
          'Shopping',
          'shopping',
          'debit',
          20000,
        ),
        transaction(
          'txn-005',
          '2026-01-05',
          'Netflix',
          'subscriptions',
          'debit',
          500,
          'Netflix',
        ),
        transaction(
          'txn-006',
          '2026-01-06',
          'SIP transfer',
          'investments',
          'debit',
          10000,
        ),
        transaction(
          'txn-007',
          '2026-02-01',
          'Salary',
          'income',
          'credit',
          100000,
        ),
        transaction('txn-008', '2026-02-02', 'Rent', 'housing', 'debit', 30000),
        transaction(
          'txn-009',
          '2026-02-03',
          'Home loan EMI',
          'housing',
          'debit',
          10000,
        ),
        transaction(
          'txn-010',
          '2026-02-04',
          'Shopping',
          'shopping',
          'debit',
          30000,
        ),
        transaction(
          'txn-011',
          '2026-02-05',
          'Dining',
          'dining',
          'debit',
          10000,
        ),
        transaction(
          'txn-012',
          '2026-02-06',
          'Netflix',
          'subscriptions',
          'debit',
          520,
          'Netflix',
        ),
      ],
    });

    expect(insights.monthlyIncome).toBe(100000);
    expect(insights.monthlyExpenses).toBe(70510);
    expect(insights.monthlySurplus).toBe(29490);
    expect(insights.categoryBreakdown[0]).toMatchObject({
      category: 'housing',
      amount: 80000,
    });
    expect(insights.topCategories.map((item) => item.category)).toContain(
      'shopping',
    );
    expect(
      insights.categoryBreakdown.some(
        (item) => item.category === 'investments',
      ),
    ).toBe(false);
  });

  it('calculates month-over-month changes and recurring subscriptions', () => {
    const insights = calculator.calculate({
      customerId: 'cust-test-001',
      transactions: [
        transaction(
          'txn-001',
          '2026-01-01',
          'Salary',
          'income',
          'credit',
          100000,
        ),
        transaction(
          'txn-002',
          '2026-01-04',
          'Shopping',
          'shopping',
          'debit',
          20000,
        ),
        transaction(
          'txn-003',
          '2026-01-05',
          'Netflix',
          'subscriptions',
          'debit',
          500,
          'Netflix',
        ),
        transaction(
          'txn-004',
          '2026-02-01',
          'Salary',
          'income',
          'credit',
          100000,
        ),
        transaction(
          'txn-005',
          '2026-02-04',
          'Shopping',
          'shopping',
          'debit',
          30000,
        ),
        transaction(
          'txn-006',
          '2026-02-05',
          'Netflix',
          'subscriptions',
          'debit',
          520,
          'Netflix',
        ),
      ],
    });
    const shoppingChange = insights.monthOverMonthChanges.find(
      (change) => change.category === 'shopping',
    );

    expect(shoppingChange).toMatchObject({
      currentMonthAmount: 30000,
      previousMonthAmount: 20000,
      changeAmount: 10000,
      changePercent: 50,
      direction: 'INCREASED',
    });
    expect(insights.recurringSubscriptions).toEqual([
      {
        merchant: 'Netflix',
        category: 'subscriptions',
        averageAmount: 510,
        frequency: 'MONTHLY',
        occurrences: 2,
      },
    ]);
  });

  it('calculates discretionary spend, investable surplus, EMI status, and insight messages', () => {
    const insights = calculator.calculate({
      customerId: 'cust-test-001',
      transactions: [
        transaction(
          'txn-001',
          '2026-01-01',
          'Salary',
          'income',
          'credit',
          100000,
        ),
        transaction('txn-002', '2026-01-02', 'Rent', 'housing', 'debit', 30000),
        transaction(
          'txn-003',
          '2026-01-03',
          'Home loan EMI',
          'housing',
          'debit',
          10000,
        ),
        transaction(
          'txn-004',
          '2026-01-04',
          'Shopping',
          'shopping',
          'debit',
          20000,
        ),
        transaction(
          'txn-005',
          '2026-01-05',
          'Netflix',
          'subscriptions',
          'debit',
          500,
          'Netflix',
        ),
        transaction(
          'txn-006',
          '2026-02-01',
          'Salary',
          'income',
          'credit',
          100000,
        ),
        transaction('txn-007', '2026-02-02', 'Rent', 'housing', 'debit', 30000),
        transaction(
          'txn-008',
          '2026-02-03',
          'Home loan EMI',
          'housing',
          'debit',
          10000,
        ),
        transaction(
          'txn-009',
          '2026-02-04',
          'Shopping',
          'shopping',
          'debit',
          30000,
        ),
        transaction(
          'txn-010',
          '2026-02-05',
          'Dining',
          'dining',
          'debit',
          10000,
        ),
        transaction(
          'txn-011',
          '2026-02-06',
          'Netflix',
          'subscriptions',
          'debit',
          520,
          'Netflix',
        ),
      ],
    });

    expect(insights.discretionarySpend).toMatchObject({
      amount: 30510,
      percentageOfExpenses: 43.27,
      status: 'ELEVATED',
    });
    expect(insights.emiBurden).toMatchObject({
      amount: 10000,
      percentageOfIncome: 10,
      status: 'MANAGEABLE',
      warning: null,
    });
    expect(insights.investableSurplusEstimate).toMatchObject({
      min: 7373,
      max: 14745,
    });
    expect(insights.insights.length).toBeGreaterThanOrEqual(6);
    expect(insights.insights.map((insight) => insight.type)).toEqual(
      expect.arrayContaining([
        'SURPLUS',
        'TOP_CATEGORY',
        'CATEGORY_INCREASE',
        'RECURRING_SUBSCRIPTION',
        'DISCRETIONARY_SPEND',
        'EMI_BURDEN',
        'INVESTABLE_SURPLUS',
      ]),
    );
  });

  it('returns EMI warning and reduced investable surplus for elevated debt burden', () => {
    const insights = calculator.calculate({
      customerId: 'cust-test-001',
      transactions: [
        transaction(
          'txn-001',
          '2026-01-01',
          'Salary',
          'income',
          'credit',
          100000,
        ),
        transaction(
          'txn-002',
          '2026-01-02',
          'Personal loan EMI',
          'housing',
          'debit',
          35000,
        ),
        transaction(
          'txn-003',
          '2026-01-03',
          'Groceries',
          'groceries',
          'debit',
          15000,
        ),
      ],
    });

    expect(insights.emiBurden.status).toBe('ELEVATED');
    expect(insights.emiBurden.warning).toContain('35% of income');
    expect(insights.investableSurplusEstimate).toMatchObject({
      min: 12500,
      max: 17500,
    });
  });

  it('handles no transactions', () => {
    const insights = calculator.calculate({
      customerId: 'cust-test-001',
      transactions: [],
    });

    expect(insights.period.label).toBe('No transactions available');
    expect(insights.monthlyIncome).toBe(0);
    expect(insights.categoryBreakdown).toEqual([]);
    expect(insights.monthOverMonthChanges).toEqual([]);
    expect(insights.recurringSubscriptions).toEqual([]);
  });

  it('handles one-month-only transaction data', () => {
    const insights = calculator.calculate({
      customerId: 'cust-test-001',
      transactions: [
        transaction(
          'txn-001',
          '2026-01-01',
          'Salary',
          'income',
          'credit',
          100000,
        ),
        transaction(
          'txn-002',
          '2026-01-02',
          'Groceries',
          'groceries',
          'debit',
          15000,
        ),
      ],
    });

    expect(insights.period.label).toBe('Latest available month');
    expect(insights.monthOverMonthChanges).toEqual([]);
  });
});
