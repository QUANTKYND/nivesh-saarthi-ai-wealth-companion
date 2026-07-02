export type ApiStatus = 'ok' | 'error';

export interface ApiEnvelope<TData = unknown> {
  status: ApiStatus;
  data: TData;
  requestId?: string;
}

export interface HealthCheckDto {
  service: string;
  status: ApiStatus;
  timestamp: string;
}

export type CurrencyCode = 'INR';

export type CustomerPersona =
  'young-salaried-professional' | 'family-focused-mid-career' | 'retired-conservative';

export interface Customer {
  id: string;
  persona: CustomerPersona;
  fullName: string;
  age: number;
  city: string;
  occupation: string;
  monthlyIncome: number;
  dependents: number;
  customerSince: string;
}

export interface AccountSummary {
  id: string;
  customerId: string;
  currency: CurrencyCode;
  savingsBalance: number;
  investmentBalance: number;
  fixedDepositBalance: number;
  recurringDepositBalance: number;
  mutualFundBalance: number;
  loanOutstanding: number;
  creditCardOutstanding: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  monthlySurplus: number;
  lastUpdatedAt: string;
}

export type SpendingCategory =
  | 'income'
  | 'housing'
  | 'groceries'
  | 'utilities'
  | 'transport'
  | 'healthcare'
  | 'education'
  | 'insurance'
  | 'investments'
  | 'shopping'
  | 'dining'
  | 'travel'
  | 'entertainment'
  | 'subscriptions'
  | 'cash-withdrawal'
  | 'miscellaneous';

export type TransactionDirection = 'credit' | 'debit';

export interface Transaction {
  id: string;
  customerId: string;
  accountId: string;
  postedAt: string;
  description: string;
  category: SpendingCategory;
  direction: TransactionDirection;
  amount: number;
  currency: CurrencyCode;
  merchant?: string;
}

export type GoalStatus = 'active' | 'paused' | 'completed';
export type GoalType =
  'emergency-fund' | 'home' | 'education' | 'retirement' | 'travel' | 'wealth-building';

export interface Goal {
  id: string;
  customerId: string;
  name: string;
  type: GoalType;
  targetAmount: number;
  currentAmount: number;
  currency: CurrencyCode;
  targetDate: string;
  status: GoalStatus;
  priority: 'low' | 'medium' | 'high';
}

export type RiskProfileBand = 'conservative' | 'moderate' | 'growth';

export interface RiskProfile {
  id: string;
  customerId: string;
  band: RiskProfileBand;
  score: number;
  assessedAt: string;
  horizonYears: number;
  notes: string[];
}

export type ProductRiskLevel = 'low' | 'medium' | 'high';
export type ProductCategory =
  'savings' | 'fixed-deposit' | 'recurring-deposit' | 'mutual-fund' | 'insurance' | 'pension';

export interface ProductCatalogItem {
  id: string;
  name: string;
  category: ProductCategory;
  riskLevel: ProductRiskLevel;
  minimumInvestment: number;
  currency: CurrencyCode;
  suitableFor: RiskProfileBand[];
  description: string;
  disclaimer: string;
  isActive: boolean;
}

export type RecommendationStatus = 'draft' | 'shown' | 'accepted' | 'dismissed';

export interface Recommendation {
  id: string;
  customerId: string;
  productId: string;
  title: string;
  reasoning: string;
  disclaimer: string;
  status: RecommendationStatus;
  createdAt: string;
}

export type AdvisorChatRole = 'customer' | 'advisor' | 'system';

export interface AdvisorChatMessage {
  id: string;
  customerId: string;
  role: AdvisorChatRole;
  message: string;
  createdAt: string;
  isAuditable: boolean;
}

export type AuditLogAction =
  | 'customer_profile_viewed'
  | 'recommendation_viewed'
  | 'advisor_chat_message_recorded'
  | 'advisor_callback_requested';

export interface AuditLog {
  id: string;
  customerId: string;
  action: AuditLogAction;
  actor: 'system' | 'customer' | 'advisor';
  description: string;
  createdAt: string;
  metadata?: Record<string, string | number | boolean>;
}

export type AdvisorCallbackStatus = 'requested' | 'scheduled' | 'completed' | 'cancelled';

export interface AdvisorCallbackRequest {
  id: string;
  customerId: string;
  preferredDate: string;
  preferredTimeWindow: string;
  topic: string;
  status: AdvisorCallbackStatus;
  createdAt: string;
}

export type {
  CategoryMonthOverMonthChange,
  CategorySpendBreakdownItem,
  DiscretionarySpendStatus,
  DiscretionarySpendSummary,
  EmiBurdenStatus,
  EmiBurdenSummary,
  InsightSeverity,
  InvestableSurplusEstimate,
  RecurringSubscriptionInsight,
  SpendingChangeDirection,
  SpendingInsightMessage,
  SpendingInsights,
  SpendingInsightsPeriod,
  SpendingInsightType,
} from './spending-insights.js';

export type {
  CustomerSegment,
  DashboardRiskProfile,
  InvestmentAllocationItem,
  WealthProfile,
  WealthReadinessBand,
} from './wealth-profile.js';
