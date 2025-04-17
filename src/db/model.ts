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
  // 随机性
  temperature?: number;
  // 系统提示词
  systemPrompt?: string;
  // 用户提示词
  userPrompt?: string;
  // 最大token数
  maxTokens?: number;
  // 提示词token数
  promptTokens: number;
  // 完成token数
  completionTokens: number;
  // 总token数
  totalTokens: number;
  // 耗时
  timeUsed: number;
  // 创建时间
  createdAt: number;
};
