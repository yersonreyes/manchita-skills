export interface AiMessageDto {
  role: 'user' | 'assistant';
  content: string;
}

export interface AiChatReqDto {
  toolApplicationId: number;
  userMessage: string;
  history: AiMessageDto[];
}

export interface AiAnalyzeReqDto {
  toolApplicationId: number;
  history: AiMessageDto[];
}
