import { ModelType } from '@/types';
import request from '@/utils/insert-script-request';

type SummaryParams = {
  model: ModelType;
  apiKey: string;
  content: string;
};
export const summaryService = async (params: SummaryParams) => {
  return request<API.BaseResponse<{ summary: string }>>('/api/ai/ask', {
    method: 'POST',
    data: params,
  });
};
