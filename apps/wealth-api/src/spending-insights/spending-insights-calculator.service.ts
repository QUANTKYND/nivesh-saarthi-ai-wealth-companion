import { Injectable } from '@nestjs/common';
import type {
  CategoryMonthOverMonthChange,
  CategorySpendBreakdownItem,
  DiscretionarySpendStatus,
  EmiBurdenStatus,
  EmiBurdenSummary,
  InvestableSurplusEstimate,
  RecurringSubscriptionInsight,
  SpendingCategory,
  SpendingChangeDirection,
  SpendingInsightMessage,
  SpendingInsights,
  SpendingInsightsPeriod,
  Transaction,
} from '@wealth/shared-types';

const expenseExcludedCategories: SpendingCategory[] = ['investments'];
const discretionaryCategories: SpendingCategory[] = [
  'shopping',
  'dining',
  'travel',
  'subscriptions',
];

export interface SpendingInsightsCalculationInput {
  customerId: string;
  transactions: Transaction[];
  calculatedAt?: string;
}

@Injectable()
export class SpendingInsightsCalculatorService {
  calculate(input: SpendingInsightsCalculationInput): SpendingInsights {
    const period = this.calculatePeriod(input.transactions);
    const monthlyIncome = this.roundCurrency(
      this.calculateAverageMonthlyTotal(input.transactions, (transaction) => {
        return (
          transaction.direction === 'credit' &&
          transaction.category === 'income'
        );
      }),
    );
    const monthlyExpenses = this.roundCurrency(
      this.calculateAverageMonthlyTotal(input.transactions, (transaction) =>
        this.isExpenseTransaction(transaction),
      ),
    );
    const monthlySurplus = this.roundCurrency(monthlyIncome - monthlyExpenses);
    const categoryBreakdown = this.calculateCategoryBreakdown(
      input.transactions,
    );
    const topCategories = categoryBreakdown.slice(0, 5);
    const monthOverMonthChanges = this.calculateMonthOverMonthChanges(
      input.transactions,
    );
    const recurringSubscriptions = this.detectRecurringSubscriptions(
      input.transactions,
    );
    const discretionarySpend = this.calculateDiscretionarySpend(
      input.transactions,
      monthlyExpenses,
    );
    const emiBurden = this.calculateEmiBurden(
      input.transactions,
      monthlyIncome,
    );
    const investableSurplusEstimate = this.calculateInvestableSurplusEstimate(
      monthlySurplus,
      emiBurden.status,
    );

    return {
      customerId: input.customerId,
      period,
      monthlyIncome,
      monthlyExpenses,
      monthlySurplus,
      investableSurplusEstimate,
      categoryBreakdown,
      topCategories,
      monthOverMonthChanges,
      recurringSubscriptions,
      discretionarySpend,
      emiBurden,
      insights: this.buildInsights({
        monthlySurplus,
        topCategories,
        monthOverMonthChanges,
        recurringSubscriptions,
        discretionarySpend,
        emiBurden,
        investableSurplusEstimate,
      }),
      calculatedAt: input.calculatedAt ?? new Date().toISOString(),
    };
  }

  private calculatePeriod(transactions: Transaction[]): SpendingInsightsPeriod {
    if (transactions.length === 0) {
      return {
        label: 'No transactions available',
        from: '',
        to: '',
      };
    }

    const sortedDates = transactions
      .map((transaction) => transaction.postedAt)
      .sort((left, right) => left.localeCompare(right));
    const from = sortedDates[0] ?? '';
    const to = sortedDates[sortedDates.length - 1] ?? '';
    const monthCount = this.getAvailableMonths(transactions).length;

    return {
      label:
        monthCount === 1
          ? 'Latest available month'
          : `Last ${monthCount} available months`,
      from,
      to,
    };
  }

  private calculateCategoryBreakdown(
    transactions: Transaction[],
  ): CategorySpendBreakdownItem[] {
    const totals = this.groupExpenseTransactionsByCategory(transactions);
    const totalExpenses = [...totals.values()].reduce(
      (sum, amount) => sum + amount,
      0,
    );

    if (totalExpenses === 0) {
      return [];
    }

    return [...totals.entries()]
      .map(([category, amount]) => ({
        category,
        label: this.toCategoryLabel(category),
        amount: this.roundCurrency(amount),
        percentage: this.roundPercent((amount / totalExpenses) * 100),
      }))
      .sort((left, right) => right.amount - left.amount);
  }

  private calculateMonthOverMonthChanges(
    transactions: Transaction[],
  ): CategoryMonthOverMonthChange[] {
    const months = this.getAvailableMonths(transactions);

    if (months.length < 2) {
      return [];
    }

    const previousMonth = months[months.length - 2] ?? '';
    const currentMonth = months[months.length - 1] ?? '';
    const previousTotals = this.groupExpenseTransactionsByCategory(
      transactions.filter((transaction) =>
        transaction.postedAt.startsWith(previousMonth),
      ),
    );
    const currentTotals = this.groupExpenseTransactionsByCategory(
      transactions.filter((transaction) =>
        transaction.postedAt.startsWith(currentMonth),
      ),
    );
    const categories = new Set<SpendingCategory>([
      ...previousTotals.keys(),
      ...currentTotals.keys(),
    ]);

    return [...categories]
      .map((category) => {
        const previousMonthAmount = previousTotals.get(category) ?? 0;
        const currentMonthAmount = currentTotals.get(category) ?? 0;
        const changeAmount = currentMonthAmount - previousMonthAmount;
        const changePercent =
          previousMonthAmount > 0
            ? this.roundPercent((changeAmount / previousMonthAmount) * 100)
            : currentMonthAmount > 0
              ? null
              : 0;

        return {
          category,
          label: this.toCategoryLabel(category),
          currentMonthAmount: this.roundCurrency(currentMonthAmount),
          previousMonthAmount: this.roundCurrency(previousMonthAmount),
          changeAmount: this.roundCurrency(changeAmount),
          changePercent,
          direction: this.toChangeDirection(
            previousMonthAmount,
            currentMonthAmount,
          ),
        };
      })
      .sort(
        (left, right) =>
          Math.abs(right.changeAmount) - Math.abs(left.changeAmount),
      );
  }

  private detectRecurringSubscriptions(
    transactions: Transaction[],
  ): RecurringSubscriptionInsight[] {
    const subscriptionGroups = new Map<string, Transaction[]>();

    for (const transaction of transactions) {
      if (
        transaction.direction !== 'debit' ||
        transaction.category !== 'subscriptions'
      ) {
        continue;
      }

      const merchant = this.normalizeMerchant(transaction);
      subscriptionGroups.set(merchant, [
        ...(subscriptionGroups.get(merchant) ?? []),
        transaction,
      ]);
    }

    return [...subscriptionGroups.entries()]
      .map(([merchant, merchantTransactions]) => {
        const months = new Set(
          merchantTransactions.map((transaction) =>
            transaction.postedAt.slice(0, 7),
          ),
        );
        const total = merchantTransactions.reduce(
          (sum, transaction) => sum + transaction.amount,
          0,
        );

        return {
          merchant,
          category: 'subscriptions' as const,
          averageAmount: this.roundCurrency(
            total / merchantTransactions.length,
          ),
          frequency: 'MONTHLY' as const,
          occurrences: months.size,
        };
      })
      .filter((subscription) => subscription.occurrences >= 2)
      .sort((left, right) => right.averageAmount - left.averageAmount);
  }

  private calculateDiscretionarySpend(
    transactions: Transaction[],
    monthlyExpenses: number,
  ) {
    const monthlyDiscretionarySpend = this.roundCurrency(
      this.calculateAverageMonthlyTotal(transactions, (transaction) => {
        return (
          transaction.direction === 'debit' &&
          discretionaryCategories.includes(transaction.category)
        );
      }),
    );
    const percentageOfExpenses = this.roundPercent(
      monthlyExpenses > 0
        ? (monthlyDiscretionarySpend / monthlyExpenses) * 100
        : 0,
    );

    return {
      amount: monthlyDiscretionarySpend,
      percentageOfExpenses,
      categories: discretionaryCategories,
      status: this.toDiscretionarySpendStatus(percentageOfExpenses),
    };
  }

  private calculateEmiBurden(
    transactions: Transaction[],
    monthlyIncome: number,
  ): EmiBurdenSummary {
    const monthlyEmiAmount = this.roundCurrency(
      this.calculateAverageMonthlyTotal(transactions, (transaction) =>
        this.isEmiTransaction(transaction),
      ),
    );
    const percentageOfIncome = this.roundPercent(
      monthlyIncome > 0 ? (monthlyEmiAmount / monthlyIncome) * 100 : 0,
    );
    const status = this.toEmiBurdenStatus(percentageOfIncome);

    return {
      amount: monthlyEmiAmount,
      percentageOfIncome,
      status,
      warning: this.toEmiBurdenWarning(status, percentageOfIncome),
    };
  }

  private calculateInvestableSurplusEstimate(
    monthlySurplus: number,
    emiBurdenStatus: EmiBurdenStatus,
  ): InvestableSurplusEstimate {
    if (monthlySurplus <= 0) {
      return {
        min: 0,
        max: 0,
        explanation:
          'No investable surplus is estimated until monthly cash flow turns positive.',
      };
    }

    const min = this.roundCurrency(monthlySurplus * 0.25);
    const maxMultiplier =
      emiBurdenStatus === 'HIGH'
        ? 0.25
        : emiBurdenStatus === 'ELEVATED'
          ? 0.35
          : 0.5;

    return {
      min,
      max: this.roundCurrency(monthlySurplus * maxMultiplier),
      explanation:
        'Based on your average surplus and liquidity needs, this range may be available for goal-based investing.',
    };
  }

  private buildInsights(input: {
    monthlySurplus: number;
    topCategories: CategorySpendBreakdownItem[];
    monthOverMonthChanges: CategoryMonthOverMonthChange[];
    recurringSubscriptions: RecurringSubscriptionInsight[];
    discretionarySpend: ReturnType<
      SpendingInsightsCalculatorService['calculateDiscretionarySpend']
    >;
    emiBurden: EmiBurdenSummary;
    investableSurplusEstimate: InvestableSurplusEstimate;
  }): SpendingInsightMessage[] {
    const insights: SpendingInsightMessage[] = [];

    if (input.monthlySurplus > 0) {
      insights.push({
        type: 'SURPLUS',
        severity: 'POSITIVE',
        title: 'Healthy monthly surplus',
        message: `You have an average monthly surplus of INR ${input.monthlySurplus.toLocaleString('en-IN')} after regular expenses.`,
        actionLabel: 'Plan investment',
      });
    } else if (input.monthlySurplus === 0) {
      insights.push({
        type: 'LOW_SURPLUS',
        severity: 'WARNING',
        title: 'No monthly surplus',
        message:
          'Your average monthly income is fully used by regular expenses.',
        actionLabel: 'Review budget',
      });
    } else {
      insights.push({
        type: 'NEGATIVE_SURPLUS',
        severity: 'CRITICAL',
        title: 'Negative monthly surplus',
        message: `Your average monthly expenses exceed income by INR ${Math.abs(input.monthlySurplus).toLocaleString('en-IN')}.`,
        actionLabel: 'Reduce expenses',
      });
    }

    const topCategory = input.topCategories[0];
    if (topCategory) {
      insights.push({
        type: 'TOP_CATEGORY',
        severity: 'INFO',
        title: `${topCategory.label} is your top spend`,
        message: `Your highest spending category is ${topCategory.label} at INR ${topCategory.amount.toLocaleString('en-IN')}.`,
        actionLabel: 'View category',
      });
    }

    const increasedCategory = input.monthOverMonthChanges.find(
      (change) =>
        change.direction === 'INCREASED' || change.direction === 'NEW',
    );
    if (increasedCategory) {
      insights.push({
        type: 'CATEGORY_INCREASE',
        severity: 'INFO',
        title: `${increasedCategory.label} increased`,
        message:
          increasedCategory.changePercent === null
            ? `${increasedCategory.label} appeared as a new spending category this month.`
            : `${increasedCategory.label} changed by ${Math.abs(increasedCategory.changePercent)}% compared to last month.`,
        actionLabel: 'Review spending',
      });
    }

    if (input.recurringSubscriptions.length > 0) {
      const estimatedMonthlyCost = input.recurringSubscriptions.reduce(
        (sum, subscription) => sum + subscription.averageAmount,
        0,
      );
      insights.push({
        type: 'RECURRING_SUBSCRIPTION',
        severity: 'INFO',
        title: 'Recurring subscriptions found',
        message: `We found ${input.recurringSubscriptions.length} recurring subscriptions with an estimated monthly cost of INR ${estimatedMonthlyCost.toLocaleString('en-IN')}.`,
        actionLabel: 'Review subscriptions',
      });
    }

    insights.push({
      type: 'DISCRETIONARY_SPEND',
      severity:
        input.discretionarySpend.status === 'HIGH'
          ? 'WARNING'
          : input.discretionarySpend.status === 'ELEVATED'
            ? 'WARNING'
            : 'INFO',
      title: 'Discretionary spend',
      message: `Discretionary spending is ${input.discretionarySpend.percentageOfExpenses}% of monthly expenses, which is ${input.discretionarySpend.status.toLowerCase()}.`,
      actionLabel: 'Review lifestyle spend',
    });

    if (input.emiBurden.warning) {
      insights.push({
        type: 'EMI_BURDEN',
        severity: input.emiBurden.status === 'HIGH' ? 'CRITICAL' : 'WARNING',
        title: 'EMI burden needs attention',
        message: input.emiBurden.warning,
        actionLabel: 'Review debt',
      });
    } else {
      insights.push({
        type: 'EMI_BURDEN',
        severity: 'POSITIVE',
        title: 'EMI burden is manageable',
        message: `Your EMI burden is ${input.emiBurden.percentageOfIncome}% of income.`,
        actionLabel: 'Continue monitoring',
      });
    }

    insights.push({
      type: 'INVESTABLE_SURPLUS',
      severity:
        input.investableSurplusEstimate.max > 0 ? 'POSITIVE' : 'WARNING',
      title: 'Investable surplus estimate',
      message:
        input.investableSurplusEstimate.max > 0
          ? `Based on your surplus and liquidity needs, you may be able to invest INR ${input.investableSurplusEstimate.min.toLocaleString('en-IN')}-INR ${input.investableSurplusEstimate.max.toLocaleString('en-IN')} per month.`
          : 'No investable surplus is estimated from current cash flow.',
      actionLabel: 'Plan investment',
    });

    return insights;
  }

  private calculateAverageMonthlyTotal(
    transactions: Transaction[],
    predicate: (transaction: Transaction) => boolean,
  ): number {
    const months = this.getAvailableMonths(transactions);

    if (months.length === 0) {
      return 0;
    }

    const total = transactions
      .filter(predicate)
      .reduce((sum, transaction) => sum + transaction.amount, 0);

    return total / months.length;
  }

  private groupExpenseTransactionsByCategory(
    transactions: Transaction[],
  ): Map<SpendingCategory, number> {
    const totals = new Map<SpendingCategory, number>();

    for (const transaction of transactions) {
      if (!this.isExpenseTransaction(transaction)) {
        continue;
      }

      totals.set(
        transaction.category,
        (totals.get(transaction.category) ?? 0) + transaction.amount,
      );
    }

    return totals;
  }

  private isExpenseTransaction(transaction: Transaction): boolean {
    return (
      transaction.direction === 'debit' &&
      !expenseExcludedCategories.includes(transaction.category)
    );
  }

  private isEmiTransaction(transaction: Transaction): boolean {
    if (transaction.direction !== 'debit') {
      return false;
    }

    const normalizedDescription = transaction.description.toLowerCase();
    return (
      normalizedDescription.includes('emi') ||
      normalizedDescription.includes('loan repayment') ||
      normalizedDescription.includes('credit card payment')
    );
  }

  private getAvailableMonths(transactions: Transaction[]): string[] {
    return [
      ...new Set(
        transactions.map((transaction) => transaction.postedAt.slice(0, 7)),
      ),
    ].sort((left, right) => left.localeCompare(right));
  }

  private normalizeMerchant(transaction: Transaction): string {
    return (transaction.merchant ?? transaction.description).trim();
  }

  private toChangeDirection(
    previousMonthAmount: number,
    currentMonthAmount: number,
  ): SpendingChangeDirection {
    if (previousMonthAmount === 0 && currentMonthAmount > 0) {
      return 'NEW';
    }
    if (currentMonthAmount > previousMonthAmount) {
      return 'INCREASED';
    }
    if (currentMonthAmount < previousMonthAmount) {
      return 'DECREASED';
    }
    return 'UNCHANGED';
  }

  private toDiscretionarySpendStatus(
    percentageOfExpenses: number,
  ): DiscretionarySpendStatus {
    if (percentageOfExpenses > 50) {
      return 'HIGH';
    }
    if (percentageOfExpenses >= 35) {
      return 'ELEVATED';
    }
    if (percentageOfExpenses >= 20) {
      return 'MODERATE';
    }
    return 'LOW';
  }

  private toEmiBurdenStatus(percentageOfIncome: number): EmiBurdenStatus {
    if (percentageOfIncome > 45) {
      return 'HIGH';
    }
    if (percentageOfIncome >= 30) {
      return 'ELEVATED';
    }
    return 'MANAGEABLE';
  }

  private toEmiBurdenWarning(
    status: EmiBurdenStatus,
    percentageOfIncome: number,
  ): string | null {
    if (status === 'HIGH') {
      return `Your EMI burden is ${percentageOfIncome}% of income. Consider prioritizing debt reduction before new commitments.`;
    }
    if (status === 'ELEVATED') {
      return `Your EMI burden is ${percentageOfIncome}% of income. Consider keeping new investments conservative until debt obligations reduce.`;
    }
    return null;
  }

  private toCategoryLabel(category: SpendingCategory): string {
    const labels: Record<SpendingCategory, string> = {
      income: 'Income',
      housing: 'Housing',
      groceries: 'Groceries',
      utilities: 'Utilities',
      transport: 'Transport',
      healthcare: 'Healthcare',
      education: 'Education',
      insurance: 'Insurance',
      investments: 'Investments',
      shopping: 'Shopping',
      dining: 'Food & Dining',
      travel: 'Travel',
      entertainment: 'Entertainment',
      subscriptions: 'Subscriptions',
      'cash-withdrawal': 'Cash Withdrawal',
      miscellaneous: 'Miscellaneous',
    };

    return labels[category];
  }

  private roundCurrency(value: number): number {
    return Math.round(value);
  }

  private roundPercent(value: number): number {
    return Math.round(value * 100) / 100;
  }
}
