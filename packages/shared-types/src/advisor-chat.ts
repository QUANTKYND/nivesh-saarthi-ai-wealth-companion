export type AdvisorChatIntent =
  | 'spending_summary'
  | 'investment_capacity'
  | 'create_goal_help'
  | 'risk_profile_help'
  | 'recommendation_explanation'
  | 'emergency_fund_check'
  | 'advisor_callback'
  | 'unsupported_advice'
  | 'unknown';

export type AdvisorChatActionType =
  | 'OPEN_SPENDING_INSIGHTS'
  | 'OPEN_GOAL_PLANNER'
  | 'OPEN_RISK_PROFILE'
  | 'OPEN_RECOMMENDATIONS'
  | 'REQUEST_ADVISOR_CALLBACK';

export type AdvisorChatActionPayload = Record<string, string | number | boolean>;

export interface AdvisorChatActionCard {
  type: AdvisorChatActionType;
  label: string;
  description: string;
  payload?: AdvisorChatActionPayload;
}

export interface AdvisorChatRequest {
  customerId: string;
  message: string;
}

export interface AdvisorChatResponse {
  conversationId: string;
  customerId: string;
  intent: AdvisorChatIntent;
  response: string;
  actionCards: AdvisorChatActionCard[];
  disclaimer: string;
  createdAt: string;
}
