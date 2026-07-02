import type {
  Customer,
  Goal,
  Recommendation,
  RecommendationResult,
  RiskProfileResult,
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
    throw new ApiError(`Request failed with status ${response.status}`, response.status);
  }

  return (await response.json()) as TResponse;
}

export type DashboardRecommendation = Recommendation | RecommendationResult;

export const wealthApi = {
  getCustomers: () => getJson<Customer[]>('/customers'),
  getWealthProfile: (customerId: string) =>
    getJson<WealthProfile>(`/customers/${customerId}/wealth-profile`),
  getSpendingInsights: (customerId: string) =>
    getJson<SpendingInsights>(`/customers/${customerId}/spending-insights`),
  getGoals: (customerId: string) => getJson<Goal[]>(`/customers/${customerId}/goals`),
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
  getRecommendations: (customerId: string) =>
    getJson<DashboardRecommendation[]>(`/customers/${customerId}/recommendations`),
};
