import type { AdvisorChatResponse } from '@wealth/shared-types';

export interface AdvisorChatLlmAdapter {
  enhanceResponse(response: AdvisorChatResponse): Promise<AdvisorChatResponse>;
}

export class NoopAdvisorChatLlmAdapter implements AdvisorChatLlmAdapter {
  enhanceResponse(response: AdvisorChatResponse): Promise<AdvisorChatResponse> {
    return Promise.resolve(response);
  }
}
