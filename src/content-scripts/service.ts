import { ModelType } from '@/types';
import request from '@/utils/insert-script-request';

export type SummaryParams = {
  model: ModelType;
  apiKey: string;
  content: string;
  systemPrompt?: string;
  userPrompt?: string;
  temperature?: number;
  maxTokens?: number;
};
export const summaryService = async (params: SummaryParams) => {
  return request<
    API.BaseResponse<{
      summary: string;
      tokenUsage: {
        promptTokens: number;
        completionTokens: number;
        totalTokens: number;
      };
      timeUsed: number;
    }>
  >('/api/ai/ask', {
    method: 'POST',
    data: params,
  });
};
