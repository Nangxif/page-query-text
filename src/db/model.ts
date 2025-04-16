import { TextSelectionType } from '@/types';

export type SummaryResult = {
  id: string;
  pageUrl: string;
  model: string;
  // 文本选中方式
  textSelectionType: TextSelectionType;
  // 原文
  originalText: string;
  // 总结
  summary: string;
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  timeUsed: number;
  createdAt: number;
};
