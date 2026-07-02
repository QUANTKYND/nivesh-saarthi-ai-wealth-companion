import { Injectable, NotFoundException } from '@nestjs/common';
import type {
  AccountSummary,
  Customer,
  CustomerSegment,
  DashboardRiskProfile,
  Goal,
  InvestmentAllocationItem,
  RiskProfile,
  Transaction,
  WealthProfile,
} from '@wealth/shared-types';
import { InMemoryWealthRepository } from '../data/in-memory-wealth.repository';
import { WealthReadinessScoreService } from './wealth-readiness-score.service';

export interface WealthProfileCalculationInput {
  customer: Customer;
  accountSummary: AccountSummary;
  transactions: Transaction[];
  goals: Goal[];
  riskProfile?: RiskProfile;
  calculatedAt?: string;
}

@Injectable()
export class WealthDashboardService {
  constructor(
    private readonly repository: InMemoryWealthRepository,
    private readonly readinessScoreService: WealthReadinessScoreService,
  ) {}

  getWealthProfile(customerId: string): WealthProfile {
    const customer = this.repository.findCustomerById(customerId);
    const accountSummary =
      this.repository.findAccountSummaryByCustomerId(customerId);
    const transactions =
      this.repository.findTransactionsByCustomerId(customerId);
    const goals = this.repository.findGoalsByCustomerId(customerId);
    const riskProfile = this.findRiskProfileIfAvailable(customerId);

    return this.calculateWealthProfile({
      customer,
      accountSummary,
      transactions,
      goals,
      riskProfile,
    });
  }

  calculateWealthProfile(input: WealthProfileCalculationInput): WealthProfile {
    const monthlyIncome = this.roundCurrency(
      this.calculateAverageMonthlyTotal(input.transactions, (transaction) => {
        return (
          transaction.direction === 'credit' &&
          transaction.category === 'income'
        );
      }),
    );
    const monthlyExpenses = this.roundCurrency(
      this.calculateAverageMonthlyTotal(input.transactions, (transaction) => {
        return (
          transaction.direction === 'debit' &&
          transaction.category !== 'investments'
        );
      }),
    );
    const monthlySurplus = this.roundCurrency(monthlyIncome - monthlyExpenses);
    const savingsRatePercent = this.roundPercent(
      monthlyIncome > 0 ? (monthlySurplus / monthlyIncome) * 100 : 0,
    );
    const monthlyEmiPayments = this.calculateAverageMonthlyTotal(
      input.transactions,
      (transaction) => this.isEmiTransaction(transaction),
    );
    const emiBurdenPercent = this.roundPercent(
      monthlyIncome > 0 ? (monthlyEmiPayments / monthlyIncome) * 100 : 0,
    );
    const idleBalance = this.roundCurrency(
      Math.max(0, input.accountSummary.savingsBalance - monthlyExpenses * 2),
    );
    const emergencyFundCoverageMonths = this.roundPercent(
      monthlyExpenses > 0
        ? input.accountSummary.savingsBalance / monthlyExpenses
        : 0,
    );
    const investmentAllocation = this.calculateInvestmentAllocation(
      input.accountSummary,
    );
    const totalInvestments = this.roundCurrency(
      input.accountSummary.fixedDepositBalance +
        input.accountSummary.recurringDepositBalance +
        input.accountSummary.mutualFundBalance,
    );
    const readinessScore = this.readinessScoreService.calculate({
      savingsRatePercent,
      emergencyFundCoverageMonths,
      emiBurdenPercent,
      fixedDepositBalance: input.accountSummary.fixedDepositBalance,
      recurringDepositBalance: input.accountSummary.recurringDepositBalance,
      mutualFundBalance: input.accountSummary.mutualFundBalance,
      hasGoals: input.goals.length > 0,
      hasRiskProfile: Boolean(input.riskProfile),
    });

    return {
      customerId: input.customer.id,
      fullName: input.customer.fullName,
      age: input.customer.age,
      occupation: input.customer.occupation,
      city: input.customer.city,
      customerSegment: this.calculateCustomerSegment(
        input.customer,
        input.accountSummary,
      ),
      currency: input.accountSummary.currency,
      monthlyIncome,
      monthlyExpenses,
      monthlySurplus,
      savingsRatePercent,
      savingsBalance: input.accountSummary.savingsBalance,
      fixedDepositBalance: input.accountSummary.fixedDepositBalance,
      recurringDepositBalance: input.accountSummary.recurringDepositBalance,
      mutualFundBalance: input.accountSummary.mutualFundBalance,
      totalInvestments,
      loanOutstanding: input.accountSummary.loanOutstanding,
      creditCardOutstanding: input.accountSummary.creditCardOutstanding,
      emiBurdenPercent,
      idleBalance,
      emergencyFundCoverageMonths,
      riskProfile: this.toDashboardRiskProfile(input.riskProfile),
      wealthReadinessScore: readinessScore.score,
      wealthReadinessBand: readinessScore.band,
      investmentAllocation,
      summaryInsights: this.buildSummaryInsights({
        monthlySurplus,
        emergencyFundCoverageMonths,
        emiBurdenPercent,
        idleBalance,
        totalInvestments,
      }),
      scoreExplanation: readinessScore.explanation,
      calculatedAt: input.calculatedAt ?? new Date().toISOString(),
    };
  }

  private findRiskProfileIfAvailable(
    customerId: string,
  ): RiskProfile | undefined {
    try {
      return this.repository.findRiskProfileByCustomerId(customerId);
    } catch (error) {
      if (error instanceof NotFoundException) {
        return undefined;
      }
      throw error;
    }
  }

  private calculateAverageMonthlyTotal(
    transactions: Transaction[],
    predicate: (transaction: Transaction) => boolean,
  ): number {
    const months = new Set(
      transactions.map((transaction) => transaction.postedAt.slice(0, 7)),
    );

    if (months.size === 0) {
      return 0;
    }

    const total = transactions
      .filter(predicate)
      .reduce((sum, transaction) => sum + transaction.amount, 0);

    return total / months.size;
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

  private calculateInvestmentAllocation(
    accountSummary: AccountSummary,
  ): InvestmentAllocationItem[] {
    const items: InvestmentAllocationItem[] = [
      {
        label: 'Fixed Deposits',
        amount: accountSummary.fixedDepositBalance,
        percentage: 0,
      },
      {
        label: 'Recurring Deposits',
        amount: accountSummary.recurringDepositBalance,
        percentage: 0,
      },
      {
        label: 'Mutual Funds',
        amount: accountSummary.mutualFundBalance,
        percentage: 0,
      },
    ].filter((item) => item.amount > 0);
    const totalInvestments = items.reduce((sum, item) => sum + item.amount, 0);

    if (totalInvestments === 0) {
      return [];
    }

    return items.map((item) => ({
      ...item,
      percentage: this.roundPercent((item.amount / totalInvestments) * 100),
    }));
  }

  private calculateCustomerSegment(
    customer: Customer,
    accountSummary: AccountSummary,
  ): CustomerSegment {
    const totalInvestments =
      accountSummary.fixedDepositBalance +
      accountSummary.recurringDepositBalance +
      accountSummary.mutualFundBalance;

    if (customer.age >= 60) {
      return 'SENIOR';
    }
    if (customer.monthlyIncome >= 200000 || totalInvestments >= 1500000) {
      return 'AFFLUENT';
    }
    if (customer.monthlyIncome >= 100000 || totalInvestments >= 500000) {
      return 'MASS_AFFLUENT';
    }
    return 'MASS';
  }

  private toDashboardRiskProfile(
    riskProfile: RiskProfile | undefined,
  ): DashboardRiskProfile {
    if (!riskProfile) {
      return 'NOT_ASSESSED';
    }

    if (riskProfile.band === 'conservative') {
      return 'CONSERVATIVE';
    }
    if (riskProfile.band === 'moderate') {
      return 'MODERATE';
    }
    return 'GROWTH';
  }

  private buildSummaryInsights(input: {
    monthlySurplus: number;
    emergencyFundCoverageMonths: number;
    emiBurdenPercent: number;
    idleBalance: number;
    totalInvestments: number;
  }): string[] {
    const insights: string[] = [];

    if (input.monthlySurplus >= 0) {
      insights.push(
        `You have a positive monthly surplus of INR ${input.monthlySurplus.toLocaleString('en-IN')}.`,
      );
    } else {
      insights.push(
        `Your monthly cash flow is negative by INR ${Math.abs(input.monthlySurplus).toLocaleString('en-IN')}.`,
      );
    }

    insights.push(
      `Your emergency fund covers around ${input.emergencyFundCoverageMonths.toFixed(1)} months of expenses.`,
    );

    if (input.emiBurdenPercent <= 30) {
      insights.push('Your EMI burden is within a manageable range.');
    } else if (input.emiBurdenPercent < 45) {
      insights.push('Your EMI burden is elevated and should be monitored.');
    } else {
      insights.push('Your EMI burden is high and may limit flexibility.');
    }

    if (input.totalInvestments === 0) {
      insights.push('No active investments were found in the current profile.');
    } else if (input.idleBalance > 0) {
      insights.push(
        'You may be able to invest part of your monthly surplus after maintaining liquidity.',
      );
    } else {
      insights.push(
        'Maintain liquidity before increasing investment commitments.',
      );
    }

    return insights;
  }

  private roundCurrency(value: number): number {
    return Math.round(value);
  }

  private roundPercent(value: number): number {
    return Math.round(value * 100) / 100;
  }
}
