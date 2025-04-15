export type SummaryResult = {
  id: string;
  pageUrl: string;
  model: string;
  summary: string;
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  timeUsed: number;
  createdAt: number;
};
