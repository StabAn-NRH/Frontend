// src/types/chat.ts
// 프롬프트 타입 정의
export type PromptType = 'friendly' | 'active' | 'pleasant' | 'reliable';


// 프롬프트 설정 인터페이스
export interface PromptConfig {
  type: PromptType;
  label: string;
  systemMessage: string;
}

// 메시지 역할
export type MessageRole = 'user' | 'assistant' | 'system';

// 메시지 인터페이스
export interface Message {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: Date;
}

// 채팅 인터페이스
export interface Chat {
  id: string;
  title: string;
  date: Date;
  messages: Message[];
  prompt: PromptType;
}
