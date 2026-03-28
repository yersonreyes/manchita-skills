export interface AiMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface IAiProvider {
  readonly name: string;

  chat(
    messages: AiMessage[],
    systemPrompt: string,
    maxTokens?: number,
  ): Promise<string>;
}
