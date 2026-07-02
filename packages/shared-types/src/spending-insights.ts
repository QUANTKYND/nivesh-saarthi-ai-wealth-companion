import type { SpendingCategory } from './index.js';

export type InsightSeverity = 'POSITIVE' | 'INFO' | 'WARNING' | 'CRITICAL';

export type SpendingInsightType =
  | 'SURPLUS'
  | 'LOW_SURPLUS'
  | 'NEGATIVE_SURPLUS'
  | 'TOP_CATEGORY'
  | 'CATEGORY_INCREASE'
  | 'CATEGORY_DECREASE'
  | 'RECURRING_SUBSCRIPTION'
  | 'DISCRETIONARY_SPEND'
  | 'EMI_BURDEN'
  | 'INVESTABLE_SURPLUS';

export type SpendingChangeDirection = 'INCREASED' | 'DECREASED' | 'UNCHANGED' | 'NEW';

export type DiscretionarySpendStatus = 'LOW' | 'MODERATE' | 'ELEVATED' | 'HIGH';

export type EmiBurdenStatus = 'MANAGEABLE' | 'ELEVATED' | 'HIGH';

export interface SpendingInsightsPeriod {
  label: string;
  from: string;
  to: string;
}

export interface CategorySpendBreakdownItem {
  category: SpendingCategory;
  label: string;
  amount: number;
  percentage: number;
}

export interface CategoryMonthOverMonthChange {
  category: SpendingCategory;
  label: string;
  currentMonthAmount: number;
  previousMonthAmount: number;
  changeAmount: number;
  changePercent: number | null;
  direction: SpendingChangeDirection;
}

export interface RecurringSubscriptionInsight {
  merchant: string;
  category: SpendingCategory;
  averageAmount: number;
  frequency: 'MONTHLY';
  occurrences: number;
}

export interface DiscretionarySpendSummary {
  amount: number;
  percentageOfExpenses: number;
  categories: SpendingCategory[];
  status: DiscretionarySpendStatus;
}

export interface EmiBurdenSummary {
  amount: number;
  percentageOfIncome: number;
  status: EmiBurdenStatus;
  warning: string | null;
}

export interface InvestableSurplusEstimate {
  min: number;
  max: number;
  explanation: string;
}

export interface SpendingInsightMessage {
  type: SpendingInsightType;
  severity: InsightSeverity;
  title: string;
  message: string;
  actionLabel?: string;
}

export interface SpendingInsights {
  customerId: string;
  period: SpendingInsightsPeriod;
  monthlyIncome: number;
  monthlyExpenses: number;
  monthlySurplus: number;
  investableSurplusEstimate: InvestableSurplusEstimate;
  categoryBreakdown: CategorySpendBreakdownItem[];
  topCategories: CategorySpendBreakdownItem[];
  monthOverMonthChanges: CategoryMonthOverMonthChange[];
  recurringSubscriptions: RecurringSubscriptionInsight[];
  discretionarySpend: DiscretionarySpendSummary;
  emiBurden: EmiBurdenSummary;
  insights: SpendingInsightMessage[];
  calculatedAt: string;
}
