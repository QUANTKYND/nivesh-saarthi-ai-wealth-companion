import type { AdvisorChatIntent } from './advisor-chat.js';
import type { RecommendationResult } from './recommendation-engine.js';

export type ComplianceSeverity = 'ALLOW' | 'REVIEW' | 'BLOCKED';

export type ComplianceViolationCode =
  | 'PROHIBITED_CRYPTO_ADVICE'
  | 'PROHIBITED_STOCK_TIPS'
  | 'GUARANTEED_RETURN_CLAIM'
  | 'UNSUPPORTED_PRODUCT'
  | 'RISK_PROFILE_BYPASS'
  | 'MISSING_MARKET_LINKED_DISCLAIMER'
  | 'COMPLEX_ADVICE_REQUIRES_HUMAN_REVIEW';

export type ComplianceReviewAction = 'ALLOW' | 'BLOCK' | 'HANDOFF';

export interface ComplianceGuardrailResult {
  allowed: boolean;
  severity: ComplianceSeverity;
  violations: ComplianceViolationCode[];
  message: string;
  requiredDisclaimer: string;
  requiresHumanAdvisor: boolean;
}

export interface ComplianceCheckInput {
  message?: string;
  recommendation?: RecommendationResult;
  intent?: AdvisorChatIntent;
  riskProfileComplete?: boolean;
  selectedGoal?: boolean;
}
