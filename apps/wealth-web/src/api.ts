import type {
  AdvisorChatMessage,
  AdvisorChatRequest,
  AdvisorChatResponse,
  AdminAdvisorCallbackListItem,
  Customer,
  AdvisorCallbackResponse,
  CreateAdvisorCallbackRequest,
  CreateGoalRequest,
  Goal,
  GoalProjection,
  GoalResponse,
  GenerateRecommendationRequest,
  RiskProfileQuestionnaire,
  Recommendation,
  RecommendationResult,
  RiskProfileResult,
  SubmitRiskProfileRequest,
  SpendingInsights,
  WealthProfile,
} from '@wealth/shared-types';

const configuredBaseUrl = import.meta.env.VITE_API_BASE_URL as string | undefined;

export const apiBaseUrl = configuredBaseUrl?.replace(/\/$/, '') ?? 'http://localhost:3000/api';

export class ApiError extends Error {
  readonly status: number;

  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

async function getJson<TResponse>(path: string): Promise<TResponse> {
  const response = await fetch(`${apiBaseUrl}${path}`);

  if (!response.ok) {
    throw new ApiError(await extractErrorMessage(response), response.status);
  }

  return (await response.json()) as TResponse;
}

async function postJson<TRequest, TResponse>(path: string, body: TRequest): Promise<TResponse> {
  const response = await fetch(`${apiBaseUrl}${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw new ApiError(await extractErrorMessage(response), response.status);
  }

  return (await response.json()) as TResponse;
}

async function extractErrorMessage(response: Response): Promise<string> {
  try {
    const payload = (await response.json()) as
      | { message?: string | string[]; error?: string }
      | undefined;

    if (payload && typeof payload.message === 'string' && payload.message.trim()) {
      return payload.message;
    }

    if (payload && Array.isArray(payload.message) && payload.message.length > 0) {
      return payload.message.join(', ');
    }

    if (payload && typeof payload.error === 'string' && payload.error.trim()) {
      return payload.error;
    }
  } catch {
    // Fall through to the generic status message.
  }

  return `Request failed with status ${response.status}`;
}

export type DashboardRecommendation = Recommendation | RecommendationResult;

export const wealthApi = {
  getRiskProfileQuestionnaire: () =>
    getJson<RiskProfileQuestionnaire>('/risk-profile/questions'),
  getCustomers: () => getJson<Customer[]>('/customers'),
  getWealthProfile: (customerId: string) =>
    getJson<WealthProfile>(`/customers/${customerId}/wealth-profile`),
  getSpendingInsights: (customerId: string) =>
    getJson<SpendingInsights>(`/customers/${customerId}/spending-insights`),
  getGoals: (customerId: string) => getJson<Goal[]>(`/customers/${customerId}/goals`),
  createGoal: (customerId: string, request: CreateGoalRequest) =>
    postJson<CreateGoalRequest, GoalResponse>(`/customers/${customerId}/goals`, request),
  getGoalProjection: (customerId: string, goalId: string) =>
    getJson<GoalProjection>(`/customers/${customerId}/goals/${goalId}/projection`),
  getRiskProfile: async (customerId: string) => {
    try {
      return await getJson<RiskProfileResult>(`/customers/${customerId}/risk-profile`);
    } catch (error) {
      if (error instanceof ApiError && error.status === 404) {
        return null;
      }

      throw error;
    }
  },
  submitRiskProfile: (customerId: string, request: SubmitRiskProfileRequest) =>
    postJson<SubmitRiskProfileRequest, RiskProfileResult>(
      `/customers/${customerId}/risk-profile`,
      request,
    ),
  getRecommendations: (customerId: string) =>
    getJson<DashboardRecommendation[]>(`/customers/${customerId}/recommendations`),
  generateRecommendation: (customerId: string, request: GenerateRecommendationRequest) =>
    postJson<GenerateRecommendationRequest, RecommendationResult>(
      `/customers/${customerId}/recommendations`,
      request,
    ),
  getAdvisorChatMessages: (customerId: string) =>
    getJson<AdvisorChatMessage[]>(`/customers/${customerId}/advisor-chat/messages`),
  sendAdvisorChatMessage: (request: AdvisorChatRequest) =>
    postJson<AdvisorChatRequest, AdvisorChatResponse>('/advisor-chat/message', request),
  getAdvisorCallbacks: (customerId: string) =>
    getJson<AdvisorCallbackResponse[]>(`/customers/${customerId}/advisor-callbacks`),
  createAdvisorCallback: (customerId: string, request: CreateAdvisorCallbackRequest) =>
    postJson<CreateAdvisorCallbackRequest, AdvisorCallbackResponse>(
      `/customers/${customerId}/advisor-callbacks`,
      request,
    ),
  getAdminAdvisorCallbacks: () =>
    getJson<AdminAdvisorCallbackListItem[]>('/admin/advisor-callbacks'),
};
