import { Injectable, NotFoundException } from '@nestjs/common';
import type {
  AccountSummary,
  AdvisorCallbackRequest,
  AdvisorChatMessage,
  AuditLog,
  Customer,
  Goal,
  ProductCatalogItem,
  Recommendation,
  RecommendationResult,
  RiskProfile,
  RiskProfileResult,
  SpendingCategory,
  Transaction,
} from '@wealth/shared-types';

const currency = 'INR' as const;

const customers: Customer[] = [
  {
    id: 'cust-young-001',
    persona: 'young-salaried-professional',
    fullName: 'Aarav Mehta',
    age: 29,
    city: 'Mumbai',
    occupation: 'Product Manager',
    monthlyIncome: 145000,
    dependents: 0,
    customerSince: '2021-06-12',
  },
  {
    id: 'cust-family-001',
    persona: 'family-focused-mid-career',
    fullName: 'Nisha Rao',
    age: 41,
    city: 'Bengaluru',
    occupation: 'Senior Engineering Manager',
    monthlyIncome: 245000,
    dependents: 3,
    customerSince: '2017-03-20',
  },
  {
    id: 'cust-retired-001',
    persona: 'retired-conservative',
    fullName: 'Vikram Iyer',
    age: 67,
    city: 'Pune',
    occupation: 'Retired Government Officer',
    monthlyIncome: 82000,
    dependents: 1,
    customerSince: '2011-11-05',
  },
];

const accountSummaries: AccountSummary[] = [
  {
    id: 'acct-summary-young-001',
    customerId: 'cust-young-001',
    currency,
    savingsBalance: 420000,
    investmentBalance: 680000,
    fixedDepositBalance: 150000,
    recurringDepositBalance: 100000,
    mutualFundBalance: 430000,
    loanOutstanding: 0,
    creditCardOutstanding: 22000,
    monthlyIncome: 145000,
    monthlyExpenses: 92000,
    monthlySurplus: 53000,
    lastUpdatedAt: '2026-07-01T09:00:00.000Z',
  },
  {
    id: 'acct-summary-family-001',
    customerId: 'cust-family-001',
    currency,
    savingsBalance: 920000,
    investmentBalance: 1850000,
    fixedDepositBalance: 750000,
    recurringDepositBalance: 250000,
    mutualFundBalance: 850000,
    loanOutstanding: 6200000,
    creditCardOutstanding: 48000,
    monthlyIncome: 245000,
    monthlyExpenses: 176000,
    monthlySurplus: 69000,
    lastUpdatedAt: '2026-07-01T09:00:00.000Z',
  },
  {
    id: 'acct-summary-retired-001',
    customerId: 'cust-retired-001',
    currency,
    savingsBalance: 620000,
    investmentBalance: 3190000,
    fixedDepositBalance: 2650000,
    recurringDepositBalance: 240000,
    mutualFundBalance: 300000,
    loanOutstanding: 0,
    creditCardOutstanding: 0,
    monthlyIncome: 82000,
    monthlyExpenses: 56000,
    monthlySurplus: 26000,
    lastUpdatedAt: '2026-07-01T09:00:00.000Z',
  },
];

function transaction(
  id: string,
  customerId: string,
  postedAt: string,
  description: string,
  category: SpendingCategory,
  direction: Transaction['direction'],
  amount: number,
  merchant?: string,
): Transaction {
  return {
    id,
    customerId,
    accountId: `${customerId}-primary-savings`,
    postedAt,
    description,
    category,
    direction,
    amount,
    currency,
    merchant,
  };
}

const transactions: Transaction[] = [
  transaction(
    'txn-y-001',
    'cust-young-001',
    '2026-06-01',
    'Salary credit',
    'income',
    'credit',
    145000,
    'Datakynd Labs',
  ),
  transaction(
    'txn-y-002',
    'cust-young-001',
    '2026-06-02',
    'Apartment rent',
    'housing',
    'debit',
    38000,
    'Urban Nest',
  ),
  transaction(
    'txn-y-003',
    'cust-young-001',
    '2026-06-03',
    'Grocery run',
    'groceries',
    'debit',
    5400,
    'FreshMart',
  ),
  transaction(
    'txn-y-004',
    'cust-young-001',
    '2026-06-04',
    'Metro card recharge',
    'transport',
    'debit',
    2500,
    'Mumbai Metro',
  ),
  transaction(
    'txn-y-005',
    'cust-young-001',
    '2026-06-05',
    'SIP auto debit',
    'investments',
    'debit',
    25000,
    'IDBI Mutual Fund',
  ),
  transaction(
    'txn-y-006',
    'cust-young-001',
    '2026-06-06',
    'Electricity bill',
    'utilities',
    'debit',
    3200,
    'BEST',
  ),
  transaction(
    'txn-y-007',
    'cust-young-001',
    '2026-06-07',
    'Team dinner',
    'dining',
    'debit',
    4200,
    'The Bombay Canteen',
  ),
  transaction(
    'txn-y-008',
    'cust-young-001',
    '2026-06-08',
    'Online shopping',
    'shopping',
    'debit',
    6800,
    'Myntra',
  ),
  transaction(
    'txn-y-009',
    'cust-young-001',
    '2026-06-09',
    'Gym membership',
    'healthcare',
    'debit',
    3000,
    'FitLife',
  ),
  transaction(
    'txn-y-010',
    'cust-young-001',
    '2026-06-10',
    'Weekend movie',
    'entertainment',
    'debit',
    1200,
    'PVR',
  ),
  transaction(
    'txn-y-011',
    'cust-young-001',
    '2026-06-11',
    'Mobile bill',
    'utilities',
    'debit',
    999,
    'Airtel',
  ),
  transaction(
    'txn-y-012',
    'cust-young-001',
    '2026-06-12',
    'Fuel refill',
    'transport',
    'debit',
    4200,
    'HP Petrol Pump',
  ),
  transaction(
    'txn-y-013',
    'cust-young-001',
    '2026-06-13',
    'Coffee subscription',
    'dining',
    'debit',
    2100,
    'Blue Tokai',
  ),
  transaction(
    'txn-y-014',
    'cust-young-001',
    '2026-06-14',
    'Travel booking',
    'travel',
    'debit',
    11500,
    'IndiGo',
  ),
  transaction(
    'txn-y-015',
    'cust-young-001',
    '2026-06-15',
    'Emergency fund transfer',
    'investments',
    'debit',
    10000,
    'IDBI Recurring Deposit',
  ),
  transaction(
    'txn-y-016',
    'cust-young-001',
    '2026-06-16',
    'Pharmacy purchase',
    'healthcare',
    'debit',
    850,
    'Apollo Pharmacy',
  ),
  transaction(
    'txn-y-017',
    'cust-young-001',
    '2026-06-17',
    'Cash withdrawal',
    'cash-withdrawal',
    'debit',
    5000,
    'IDBI ATM',
  ),
  transaction(
    'txn-y-018',
    'cust-young-001',
    '2026-06-18',
    'Internet bill',
    'utilities',
    'debit',
    1499,
    'JioFiber',
  ),
  transaction(
    'txn-y-019',
    'cust-young-001',
    '2026-06-19',
    'Office lunch',
    'dining',
    'debit',
    780,
    'EatFit',
  ),
  transaction(
    'txn-y-020',
    'cust-young-001',
    '2026-06-20',
    'Book purchase',
    'education',
    'debit',
    1650,
    'Amazon',
  ),
  transaction(
    'txn-y-021',
    'cust-young-001',
    '2026-04-10',
    'Netflix subscription',
    'subscriptions',
    'debit',
    649,
    'Netflix',
  ),
  transaction(
    'txn-y-022',
    'cust-young-001',
    '2026-05-10',
    'Netflix subscription',
    'subscriptions',
    'debit',
    649,
    'Netflix',
  ),
  transaction(
    'txn-y-023',
    'cust-young-001',
    '2026-06-10',
    'Netflix subscription',
    'subscriptions',
    'debit',
    649,
    'Netflix',
  ),
  transaction(
    'txn-y-024',
    'cust-young-001',
    '2026-05-18',
    'Online shopping',
    'shopping',
    'debit',
    4200,
    'Myntra',
  ),
  transaction(
    'txn-y-025',
    'cust-young-001',
    '2026-05-01',
    'Salary credit',
    'income',
    'credit',
    145000,
    'Datakynd Labs',
  ),
  transaction(
    'txn-f-001',
    'cust-family-001',
    '2026-06-01',
    'Salary credit',
    'income',
    'credit',
    245000,
    'Fintech Systems',
  ),
  transaction(
    'txn-f-002',
    'cust-family-001',
    '2026-06-02',
    'Home loan EMI',
    'housing',
    'debit',
    72000,
    'IDBI Home Loan',
  ),
  transaction(
    'txn-f-003',
    'cust-family-001',
    '2026-06-03',
    'School fees',
    'education',
    'debit',
    36000,
    'Green Valley School',
  ),
  transaction(
    'txn-f-004',
    'cust-family-001',
    '2026-06-04',
    'Grocery basket',
    'groceries',
    'debit',
    12500,
    'BigBasket',
  ),
  transaction(
    'txn-f-005',
    'cust-family-001',
    '2026-06-05',
    'Family health insurance',
    'insurance',
    'debit',
    18500,
    'IDBI Federal',
  ),
  transaction(
    'txn-f-006',
    'cust-family-001',
    '2026-06-06',
    'SIP auto debit',
    'investments',
    'debit',
    40000,
    'IDBI Mutual Fund',
  ),
  transaction(
    'txn-f-007',
    'cust-family-001',
    '2026-06-07',
    'Electricity bill',
    'utilities',
    'debit',
    6200,
    'BESCOM',
  ),
  transaction(
    'txn-f-008',
    'cust-family-001',
    '2026-06-08',
    'Domestic help salary',
    'miscellaneous',
    'debit',
    9000,
    'Bank Transfer',
  ),
  transaction(
    'txn-f-009',
    'cust-family-001',
    '2026-06-09',
    'Fuel refill',
    'transport',
    'debit',
    7800,
    'Shell',
  ),
  transaction(
    'txn-f-010',
    'cust-family-001',
    '2026-06-10',
    'Family dinner',
    'dining',
    'debit',
    5200,
    'MTR',
  ),
  transaction(
    'txn-f-011',
    'cust-family-001',
    '2026-06-11',
    'Children activity class',
    'education',
    'debit',
    8500,
    'Music Academy',
  ),
  transaction(
    'txn-f-012',
    'cust-family-001',
    '2026-06-12',
    'Mobile family plan',
    'utilities',
    'debit',
    2499,
    'Airtel',
  ),
  transaction(
    'txn-f-013',
    'cust-family-001',
    '2026-06-13',
    'Doctor consultation',
    'healthcare',
    'debit',
    3200,
    'Manipal Hospital',
  ),
  transaction(
    'txn-f-014',
    'cust-family-001',
    '2026-06-14',
    'Clothing purchase',
    'shopping',
    'debit',
    9600,
    'Lifestyle',
  ),
  transaction(
    'txn-f-015',
    'cust-family-001',
    '2026-06-15',
    'Recurring deposit',
    'investments',
    'debit',
    15000,
    'IDBI Bank',
  ),
  transaction(
    'txn-f-016',
    'cust-family-001',
    '2026-06-16',
    'Internet bill',
    'utilities',
    'debit',
    1799,
    'ACT Fibernet',
  ),
  transaction(
    'txn-f-017',
    'cust-family-001',
    '2026-06-17',
    'Cab rides',
    'transport',
    'debit',
    3100,
    'Ola',
  ),
  transaction(
    'txn-f-018',
    'cust-family-001',
    '2026-06-18',
    'Weekend outing',
    'entertainment',
    'debit',
    4400,
    'Wonderla',
  ),
  transaction(
    'txn-f-019',
    'cust-family-001',
    '2026-06-19',
    'Cash withdrawal',
    'cash-withdrawal',
    'debit',
    10000,
    'IDBI ATM',
  ),
  transaction(
    'txn-f-020',
    'cust-family-001',
    '2026-06-20',
    'Vacation advance',
    'travel',
    'debit',
    22000,
    'MakeMyTrip',
  ),
  transaction(
    'txn-f-021',
    'cust-family-001',
    '2026-05-02',
    'Home loan EMI',
    'housing',
    'debit',
    72000,
    'IDBI Home Loan',
  ),
  transaction(
    'txn-f-022',
    'cust-family-001',
    '2026-05-01',
    'Salary credit',
    'income',
    'credit',
    245000,
    'Fintech Systems',
  ),
  transaction(
    'txn-f-023',
    'cust-family-001',
    '2026-04-12',
    'Disney Hotstar subscription',
    'subscriptions',
    'debit',
    299,
    'Disney Hotstar',
  ),
  transaction(
    'txn-f-024',
    'cust-family-001',
    '2026-05-12',
    'Disney Hotstar subscription',
    'subscriptions',
    'debit',
    299,
    'Disney Hotstar',
  ),
  transaction(
    'txn-f-025',
    'cust-family-001',
    '2026-06-12',
    'Disney Hotstar subscription',
    'subscriptions',
    'debit',
    299,
    'Disney Hotstar',
  ),
  transaction(
    'txn-r-001',
    'cust-retired-001',
    '2026-06-01',
    'Pension credit',
    'income',
    'credit',
    82000,
    'Government Pension',
  ),
  transaction(
    'txn-r-002',
    'cust-retired-001',
    '2026-06-02',
    'Apartment maintenance',
    'housing',
    'debit',
    12000,
    'Society Office',
  ),
  transaction(
    'txn-r-003',
    'cust-retired-001',
    '2026-06-03',
    'Grocery purchase',
    'groceries',
    'debit',
    7800,
    'D-Mart',
  ),
  transaction(
    'txn-r-004',
    'cust-retired-001',
    '2026-06-04',
    'Medicines',
    'healthcare',
    'debit',
    6400,
    'Wellness Forever',
  ),
  transaction(
    'txn-r-005',
    'cust-retired-001',
    '2026-06-05',
    'Fixed deposit renewal',
    'investments',
    'debit',
    25000,
    'IDBI Bank',
  ),
  transaction(
    'txn-r-006',
    'cust-retired-001',
    '2026-06-06',
    'Electricity bill',
    'utilities',
    'debit',
    2800,
    'MSEDCL',
  ),
  transaction(
    'txn-r-007',
    'cust-retired-001',
    '2026-06-07',
    'Health checkup',
    'healthcare',
    'debit',
    4500,
    'Ruby Hall Clinic',
  ),
  transaction(
    'txn-r-008',
    'cust-retired-001',
    '2026-06-08',
    'Temple donation',
    'miscellaneous',
    'debit',
    2100,
    'Trust Donation',
  ),
  transaction(
    'txn-r-009',
    'cust-retired-001',
    '2026-06-09',
    'Local transport',
    'transport',
    'debit',
    1200,
    'Auto/Cab',
  ),
  transaction(
    'txn-r-010',
    'cust-retired-001',
    '2026-06-10',
    'Family lunch',
    'dining',
    'debit',
    3600,
    'Vaishali',
  ),
  transaction(
    'txn-r-011',
    'cust-retired-001',
    '2026-06-11',
    'Mobile bill',
    'utilities',
    'debit',
    599,
    'Jio',
  ),
  transaction(
    'txn-r-012',
    'cust-retired-001',
    '2026-06-12',
    'Insurance premium',
    'insurance',
    'debit',
    9500,
    'IDBI Federal',
  ),
  transaction(
    'txn-r-013',
    'cust-retired-001',
    '2026-06-13',
    'Cash withdrawal',
    'cash-withdrawal',
    'debit',
    8000,
    'IDBI ATM',
  ),
  transaction(
    'txn-r-014',
    'cust-retired-001',
    '2026-06-14',
    'Books and newspaper',
    'education',
    'debit',
    950,
    'Book Store',
  ),
  transaction(
    'txn-r-015',
    'cust-retired-001',
    '2026-06-15',
    'Grandchild gift',
    'shopping',
    'debit',
    4200,
    'Hamleys',
  ),
  transaction(
    'txn-r-016',
    'cust-retired-001',
    '2026-06-16',
    'Water bill',
    'utilities',
    'debit',
    750,
    'PMC',
  ),
  transaction(
    'txn-r-017',
    'cust-retired-001',
    '2026-06-17',
    'Doctor follow-up',
    'healthcare',
    'debit',
    1800,
    'Clinic',
  ),
  transaction(
    'txn-r-018',
    'cust-retired-001',
    '2026-06-18',
    'Train ticket',
    'travel',
    'debit',
    2200,
    'IRCTC',
  ),
  transaction(
    'txn-r-019',
    'cust-retired-001',
    '2026-06-19',
    'Cable TV',
    'entertainment',
    'debit',
    650,
    'Tata Play',
  ),
  transaction(
    'txn-r-020',
    'cust-retired-001',
    '2026-06-20',
    'Monthly provisions',
    'groceries',
    'debit',
    5600,
    'Reliance Smart',
  ),
];

const goals: Goal[] = [
  {
    id: 'goal-y-001',
    customerId: 'cust-young-001',
    name: 'Emergency Fund',
    type: 'emergency-fund',
    targetAmount: 600000,
    currentAmount: 240000,
    currency,
    targetDate: '2027-06-30',
    status: 'active',
    priority: 'high',
    plannedMonthlyContribution: 10000,
    expectedAnnualReturnPercent: 5,
  },
  {
    id: 'goal-f-001',
    customerId: 'cust-family-001',
    name: "Children's Higher Education",
    type: 'education',
    targetAmount: 3500000,
    currentAmount: 1250000,
    currency,
    targetDate: '2032-04-01',
    status: 'active',
    priority: 'high',
    plannedMonthlyContribution: 35000,
    expectedAnnualReturnPercent: 8,
  },
  {
    id: 'goal-f-002',
    customerId: 'cust-family-001',
    name: 'Family Vacation',
    type: 'travel',
    targetAmount: 450000,
    currentAmount: 160000,
    currency,
    targetDate: '2027-12-15',
    status: 'active',
    priority: 'medium',
    plannedMonthlyContribution: 15000,
    expectedAnnualReturnPercent: 6,
  },
];

const riskProfiles: RiskProfile[] = [
  {
    id: 'risk-y-001',
    customerId: 'cust-young-001',
    band: 'growth',
    score: 78,
    assessedAt: '2026-06-21T10:30:00.000Z',
    horizonYears: 12,
    notes: [
      'Long investment horizon',
      'Comfortable with market-linked products',
    ],
  },
  {
    id: 'risk-f-001',
    customerId: 'cust-family-001',
    band: 'moderate',
    score: 58,
    assessedAt: '2026-06-22T11:30:00.000Z',
    horizonYears: 8,
    notes: [
      'Balances growth with family obligations',
      'Needs education goal protection',
    ],
  },
  {
    id: 'risk-r-001',
    customerId: 'cust-retired-001',
    band: 'conservative',
    score: 28,
    assessedAt: '2026-06-23T12:30:00.000Z',
    horizonYears: 3,
    notes: ['Capital preservation is primary', 'Prefers predictable cash flow'],
  },
];

const submittedRiskProfileResults: RiskProfileResult[] = [];

const productCatalog: ProductCatalogItem[] = [
  {
    id: 'prod-fd-001',
    name: 'IDBI Senior Citizen Fixed Deposit',
    category: 'fixed-deposit',
    productType: 'FIXED_DEPOSIT',
    riskLevel: 'low',
    minimumInvestment: 10000,
    currency,
    suitableFor: ['conservative', 'moderate'],
    description: 'Bank fixed deposit option for stable income planning.',
    disclaimer:
      'Returns depend on booked deposit rate and premature withdrawal terms.',
    isActive: true,
  },
  {
    id: 'prod-rd-001',
    name: 'IDBI Goal Builder Recurring Deposit',
    category: 'recurring-deposit',
    productType: 'RECURRING_DEPOSIT',
    riskLevel: 'low',
    minimumInvestment: 1000,
    currency,
    suitableFor: ['conservative', 'moderate'],
    description: 'Recurring deposit for disciplined monthly savings.',
    disclaimer: 'Deposit rates and terms are subject to bank policy.',
    isActive: true,
  },
  {
    id: 'prod-mf-001',
    name: 'IDBI Conservative Mutual Fund Basket',
    category: 'mutual-fund',
    productType: 'CONSERVATIVE_MF_BASKET',
    riskLevel: 'medium',
    minimumInvestment: 5000,
    currency,
    suitableFor: ['moderate', 'growth'],
    description:
      'Bank-approved conservative market-linked basket for measured growth.',
    disclaimer: 'Mutual fund investments are subject to market risks.',
    isActive: true,
  },
  {
    id: 'prod-mf-balanced-001',
    name: 'IDBI Balanced Mutual Fund Basket',
    category: 'mutual-fund',
    productType: 'BALANCED_MF_BASKET',
    riskLevel: 'medium',
    minimumInvestment: 5000,
    currency,
    suitableFor: ['moderate', 'growth'],
    description: 'Bank-approved balanced basket for medium-to-long-term goals.',
    disclaimer: 'Mutual fund investments are subject to market risks.',
    isActive: true,
  },
  {
    id: 'prod-mf-002',
    name: 'IDBI Equity SIP Basket',
    category: 'mutual-fund',
    productType: 'EQUITY_SIP_BASKET',
    riskLevel: 'high',
    minimumInvestment: 5000,
    currency,
    suitableFor: ['growth'],
    description: 'Market-linked equity fund option for long-term goals.',
    disclaimer: 'No returns are guaranteed and capital value may fluctuate.',
    isActive: true,
  },
  {
    id: 'prod-tax-001',
    name: 'IDBI Tax Saving Basket',
    category: 'mutual-fund',
    productType: 'TAX_SAVING',
    riskLevel: 'medium',
    minimumInvestment: 5000,
    currency,
    suitableFor: ['moderate', 'growth'],
    description:
      'Bank-approved tax saving basket subject to lock-in and suitability.',
    disclaimer:
      'Tax treatment depends on prevailing law. This is not tax advice.',
    isActive: true,
  },
  {
    id: 'prod-ins-001',
    name: 'IDBI Family Protection Plan',
    category: 'insurance',
    productType: 'INSURANCE_PROTECTION',
    riskLevel: 'low',
    minimumInvestment: 12000,
    currency,
    suitableFor: ['conservative', 'moderate', 'growth'],
    description:
      'Protection-focused insurance plan for family financial resilience.',
    disclaimer:
      'Insurance benefits depend on policy terms, exclusions, and underwriting.',
    isActive: true,
  },
];

const recommendations: Recommendation[] = [
  {
    id: 'rec-y-001',
    customerId: 'cust-young-001',
    productId: 'prod-rd-001',
    title: 'Strengthen emergency savings discipline',
    reasoning:
      'A recurring deposit can help build the emergency fund with predictable monthly saving.',
    disclaimer:
      'This is a mock bank-approved suggestion for demo purposes, not personalized financial advice.',
    status: 'shown',
    createdAt: '2026-06-24T09:15:00.000Z',
  },
  {
    id: 'rec-f-001',
    customerId: 'cust-family-001',
    productId: 'prod-ins-001',
    title: 'Review family protection coverage',
    reasoning:
      'Dependents and education goals make protection planning important before higher risk allocation.',
    disclaimer:
      'This is a mock bank-approved suggestion for demo purposes, not personalized financial advice.',
    status: 'shown',
    createdAt: '2026-06-24T10:15:00.000Z',
  },
];

const generatedRecommendations: RecommendationResult[] = [];

const advisorChatMessages: AdvisorChatMessage[] = [
  {
    id: 'chat-y-001',
    customerId: 'cust-young-001',
    role: 'customer',
    message: 'Can I save faster for my emergency fund?',
    createdAt: '2026-06-25T09:00:00.000Z',
    isAuditable: true,
  },
  {
    id: 'chat-y-002',
    customerId: 'cust-young-001',
    role: 'advisor',
    message:
      'We can review your monthly surplus and bank-approved savings options.',
    createdAt: '2026-06-25T09:01:00.000Z',
    isAuditable: true,
  },
  {
    id: 'chat-f-001',
    customerId: 'cust-family-001',
    role: 'customer',
    message: 'I want to protect my child education goal.',
    createdAt: '2026-06-25T10:00:00.000Z',
    isAuditable: true,
  },
];

const auditLogs: AuditLog[] = [
  {
    id: 'audit-y-001',
    customerId: 'cust-young-001',
    action: 'recommendation_viewed',
    actor: 'system',
    description: 'Mock emergency fund recommendation was viewed.',
    createdAt: '2026-06-24T09:16:00.000Z',
    metadata: { recommendationId: 'rec-y-001' },
  },
  {
    id: 'audit-f-001',
    customerId: 'cust-family-001',
    action: 'advisor_chat_message_recorded',
    actor: 'system',
    description: 'Advisor chat message was recorded for audit trail.',
    createdAt: '2026-06-25T10:01:00.000Z',
    metadata: { messageId: 'chat-f-001' },
  },
];

const advisorCallbackRequests: AdvisorCallbackRequest[] = [
  {
    id: 'callback-f-001',
    customerId: 'cust-family-001',
    preferredDate: '2026-07-05',
    preferredTimeWindow: '16:00-18:00',
    topic: 'Education goal and protection review',
    status: 'requested',
    createdAt: '2026-06-26T08:30:00.000Z',
  },
];

@Injectable()
export class InMemoryWealthRepository {
  findCustomers(): Customer[] {
    return customers;
  }

  findCustomerById(customerId: string): Customer {
    const customer = customers.find((item) => item.id === customerId);

    if (!customer) {
      throw new NotFoundException(`Customer ${customerId} was not found`);
    }

    return customer;
  }

  findAccountSummaryByCustomerId(customerId: string): AccountSummary {
    this.findCustomerById(customerId);
    const accountSummary = accountSummaries.find(
      (item) => item.customerId === customerId,
    );

    if (!accountSummary) {
      throw new NotFoundException(
        `Account summary for customer ${customerId} was not found`,
      );
    }

    return accountSummary;
  }

  findTransactionsByCustomerId(customerId: string): Transaction[] {
    this.findCustomerById(customerId);
    return transactions.filter((item) => item.customerId === customerId);
  }

  findGoalsByCustomerId(customerId: string): Goal[] {
    this.findCustomerById(customerId);
    return goals.filter((item) => item.customerId === customerId);
  }

  findGoalByCustomerId(customerId: string, goalId: string): Goal {
    this.findCustomerById(customerId);
    const goal = goals.find(
      (item) => item.customerId === customerId && item.id === goalId,
    );

    if (!goal) {
      throw new NotFoundException(
        `Goal ${goalId} for customer ${customerId} was not found`,
      );
    }

    return goal;
  }

  createGoal(goal: Goal): Goal {
    this.findCustomerById(goal.customerId);
    goals.push(goal);
    return goal;
  }

  findRiskProfileByCustomerId(customerId: string): RiskProfile {
    this.findCustomerById(customerId);
    const submittedRiskProfile = submittedRiskProfileResults.find(
      (item) => item.customerId === customerId,
    );

    if (submittedRiskProfile) {
      return this.toLegacyRiskProfile(submittedRiskProfile);
    }

    const riskProfile = riskProfiles.find(
      (item) => item.customerId === customerId,
    );

    if (!riskProfile) {
      throw new NotFoundException(
        `Risk profile for customer ${customerId} was not found`,
      );
    }

    return riskProfile;
  }

  findSubmittedRiskProfileResultByCustomerId(
    customerId: string,
  ): RiskProfileResult | undefined {
    this.findCustomerById(customerId);
    return submittedRiskProfileResults.find(
      (item) => item.customerId === customerId,
    );
  }

  upsertRiskProfileResult(result: RiskProfileResult): RiskProfileResult {
    this.findCustomerById(result.customerId);
    const existingIndex = submittedRiskProfileResults.findIndex(
      (item) => item.customerId === result.customerId,
    );

    if (existingIndex >= 0) {
      submittedRiskProfileResults[existingIndex] = result;
      return result;
    }

    submittedRiskProfileResults.push(result);
    return result;
  }

  findProductCatalog(): ProductCatalogItem[] {
    return productCatalog.filter((item) => item.isActive);
  }

  findRecommendationsByCustomerId(
    customerId: string,
  ): Array<Recommendation | RecommendationResult> {
    this.findCustomerById(customerId);
    return [
      ...recommendations.filter((item) => item.customerId === customerId),
      ...generatedRecommendations.filter(
        (item) => item.customerId === customerId,
      ),
    ];
  }

  createRecommendationResult(
    result: RecommendationResult,
  ): RecommendationResult {
    this.findCustomerById(result.customerId);
    generatedRecommendations.push(result);
    return result;
  }

  findAdvisorChatMessagesByCustomerId(
    customerId: string,
  ): AdvisorChatMessage[] {
    this.findCustomerById(customerId);
    return advisorChatMessages.filter((item) => item.customerId === customerId);
  }

  findAuditLogsByCustomerId(customerId: string): AuditLog[] {
    this.findCustomerById(customerId);
    return auditLogs.filter((item) => item.customerId === customerId);
  }

  findAdvisorCallbackRequestsByCustomerId(
    customerId: string,
  ): AdvisorCallbackRequest[] {
    this.findCustomerById(customerId);
    return advisorCallbackRequests.filter(
      (item) => item.customerId === customerId,
    );
  }

  private toLegacyRiskProfile(result: RiskProfileResult): RiskProfile {
    return {
      id: `risk-${result.customerId}`,
      customerId: result.customerId,
      band: this.toLegacyRiskBand(result.category),
      score: result.scorePercent,
      assessedAt: result.updatedAt,
      horizonYears: result.investmentHorizonYears,
      notes: result.explanation,
    };
  }

  private toLegacyRiskBand(
    category: RiskProfileResult['category'],
  ): RiskProfile['band'] {
    if (category === 'CONSERVATIVE') {
      return 'conservative';
    }
    if (category === 'MODERATE') {
      return 'moderate';
    }
    return 'growth';
  }
}
