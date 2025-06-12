export const TONE_TYPES = ['professional', 'friendly', 'energetic', 'humor'] as const;
export type ToneType = (typeof TONE_TYPES)[number];

export const DEFAULT_TONE: ToneType = 'professional';

const TONE_INSTRUCTIONS = {
  professional: 'Write in a professional, business-appropriate tone. Use formal language, focus on quality and reliability, maintain credibility, and emphasize value proposition. Include trust signals and professional guarantees.',
  friendly: 'Write in a warm, friendly, and approachable tone. Use conversational language, create a personal connection with the reader, and make it feel like a recommendation from a trusted friend.',
  energetic: 'Write with high energy and excitement. Use dynamic language, action words, create enthusiasm about the product, and include urgency. Use caps strategically and power words.',
  humor: 'Write with appropriate humor and wit. Keep it light-hearted while still being informative and engaging. Use clever wordplay and funny comparisons, but maintain respect for the product.'
} as const;

export function isValidTone(tone: unknown): tone is ToneType {
  return typeof tone === 'string' && TONE_TYPES.includes(tone as ToneType);
}

export function getToneInstruction(tone: string): string {
  const validTone = isValidTone(tone) ? tone : DEFAULT_TONE;
  return TONE_INSTRUCTIONS[validTone as keyof typeof TONE_INSTRUCTIONS];
}

// DeepSeek API Types
export type DeepSeekModel = 'deepseek-chat' | 'deepseek-reasoner';

export interface DeepSeekMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface DeepSeekRequest {
  model: DeepSeekModel;
  messages: DeepSeekMessage[];
  max_tokens?: number;
  temperature?: number;
  top_p?: number;
  frequency_penalty?: number;
  presence_penalty?: number;
  stream?: false;
  response_format?: {
    type: 'text';
  };
  stop?: string[] | null;
  stream_options?: null;
  tools?: undefined;
  tool_choice?: undefined;
  logprobs?: boolean;
  top_logprobs?: null;
}

export interface DeepSeekResponse {
  id: string;
  object: 'chat.completion';
  created: number;
  model: string;
  system_fingerprint: string;
  choices: {
    index: number;
    message: DeepSeekMessage;
    finish_reason: string;
  }[];
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
} 