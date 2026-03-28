import { AiMessageDto } from './ai.req.dto';

export interface AiChatResDto {
  assistantMessage: string;
  turnCount: number;
}

export interface AiAnalysisDto {
  summary: string;
  rootCause: string;
  insights: string[];
  recommendations: string[];
}

export interface AiAnalyzeResDto {
  analysis: AiAnalysisDto;
}

// Shape tipado del aiSession dentro de structuredData
export interface AiSessionDto {
  sessionId: string;
  toolId: number;
  toolNombre: string;
  createdAt: string;
  updatedAt: string;
  status: 'active' | 'analyzed';
  turnCount: number;
  messages: AiMessageDto[];
  analysis: AiAnalysisDto | null;
}
