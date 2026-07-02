import type { CurrencyCode } from './index.js';

export type CustomerSegment = 'MASS' | 'MASS_AFFLUENT' | 'AFFLUENT' | 'SENIOR';

export type WealthReadinessBand = 'NEEDS_ATTENTION' | 'FAIR' | 'GOOD' | 'EXCELLENT';

export type DashboardRiskProfile = 'CONSERVATIVE' | 'MODERATE' | 'GROWTH' | 'NOT_ASSESSED';

export interface InvestmentAllocationItem {
  label: string;
  amount: number;
  percentage: number;
}

export interface WealthProfile {
  customerId: string;
  fullName: string;
  age: number;
  occupation: string;
  city: string;
  customerSegment: CustomerSegment;
  currency: CurrencyCode;
  monthlyIncome: number;
  monthlyExpenses: number;
  monthlySurplus: number;
  savingsRatePercent: number;
  savingsBalance: number;
  fixedDepositBalance: number;
  recurringDepositBalance: number;
  mutualFundBalance: number;
  totalInvestments: number;
  loanOutstanding: number;
  creditCardOutstanding: number;
  emiBurdenPercent: number;
  idleBalance: number;
  emergencyFundCoverageMonths: number;
  riskProfile: DashboardRiskProfile;
  wealthReadinessScore: number;
  wealthReadinessBand: WealthReadinessBand;
  investmentAllocation: InvestmentAllocationItem[];
  summaryInsights: string[];
  scoreExplanation: string[];
  calculatedAt: string;
}
