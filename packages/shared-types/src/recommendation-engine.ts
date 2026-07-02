import type { ProductCatalogItem, RiskProfileCategory } from './index.js';

export type RecommendationSuitability =
  'SUITABLE' | 'PARTIALLY_SUITABLE' | 'NOT_SUITABLE' | 'NEEDS_ADVISOR_REVIEW';

export type RecommendationNextBestActionType =
  | 'BUILD_EMERGENCY_FUND'
  | 'START_RD'
  | 'START_FD'
  | 'START_SIP'
  | 'REVIEW_WITH_ADVISOR'
  | 'REDUCE_DEBT'
  | 'COMPLETE_RISK_PROFILE'
  | 'CREATE_GOAL';

export interface GenerateRecommendationRequest {
  goalId: string;
  monthlyInvestmentCapacity?: number;
}

export interface RecommendedAllocationItem {
  productId: string;
  productName: string;
  productType: ProductCatalogItem['productType'];
  percentage: number;
  monthlyAmount: number;
  oneTimeAmount: number;
  rationale: string;
}

export interface RecommendedPlan {
  name: string;
  description: string;
  monthlyAmount: number;
  oneTimeAmount: number;
  allocation: RecommendedAllocationItem[];
}

export interface RecommendationNextBestAction {
  type: RecommendationNextBestActionType;
  label: string;
  description: string;
}

export interface RecommendationResult {
  recommendationId: string;
  customerId: string;
  goalId: string;
  suitability: RecommendationSuitability;
  riskProfile: RiskProfileCategory | null;
  recommendedPlan: RecommendedPlan | null;
  reasoning: string[];
  riskWarnings: string[];
  disclaimer: string;
  nextBestAction: RecommendationNextBestAction;
  createdAt: string;
}
