export type RiskProfileQuestionType = 'SINGLE_CHOICE';

export type RiskProfileCategory = 'CONSERVATIVE' | 'MODERATE' | 'AGGRESSIVE';

export type RiskProfileLossTolerance = 'LOW' | 'MEDIUM' | 'HIGH';

export type RiskProfileIncomeStability = 'LOW' | 'MEDIUM' | 'HIGH';

export type RiskProfileLiquidityNeed = 'LOW' | 'MEDIUM' | 'HIGH';

export type RiskProfileInvestmentExperience = 'NONE' | 'BASIC' | 'INTERMEDIATE' | 'ADVANCED';

export interface RiskProfileQuestionOption {
  id: string;
  label: string;
  score: number;
  explanation?: string;
}

export interface RiskProfileQuestion {
  id: string;
  label: string;
  description?: string;
  type: RiskProfileQuestionType;
  required: boolean;
  options: RiskProfileQuestionOption[];
}

export interface RiskProfileQuestionnaire {
  questions: RiskProfileQuestion[];
}

export interface SubmitRiskProfileAnswer {
  questionId: string;
  optionId: string;
}

export interface SubmitRiskProfileRequest {
  answers: SubmitRiskProfileAnswer[];
}

export interface RiskProfileScoreBreakdown {
  questionId: string;
  label: string;
  selectedOptionId: string;
  selectedOptionLabel: string;
  score: number;
  maxScore: number;
  explanation: string;
}

export interface RiskProfileResult {
  customerId: string;
  category: RiskProfileCategory;
  score: number;
  maxScore: number;
  scorePercent: number;
  investmentHorizonYears: number;
  lossTolerance: RiskProfileLossTolerance;
  incomeStability: RiskProfileIncomeStability;
  liquidityNeed: RiskProfileLiquidityNeed;
  investmentExperience: RiskProfileInvestmentExperience;
  scoreBreakdown: RiskProfileScoreBreakdown[];
  explanation: string[];
  suitabilityNotes: string[];
  updatedAt: string;
}
