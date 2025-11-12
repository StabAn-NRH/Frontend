// src/contexts/ChatContext.tsx
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Chat, Message, PromptType } from '../types/chat';

interface ChatContextType {
  chats: Chat[];
  currentChat: Chat | null;
  currentPrompt: PromptType;
  setCurrentPrompt: (prompt: PromptType) => void;
  createNewChat: () => void;
  addMessage: (message: Omit<Message, 'id' | 'timestamp'>) => void;
  selectChat: (chatId: string) => void;
  deleteChats: (chatIds: string[]) => void;
  setAllChats: (chatList: Chat[]) => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [chats, setChats] = useState<Chat[]>([]);
  const [currentChat, setCurrentChat] = useState<Chat | null>(null);
  const [currentPrompt, setCurrentPrompt] = useState<PromptType>('gentle');

  const createNewChat = () => {
    const newChat: Chat = {
      id: `chat-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      title: '새로운 대화',
      date: new Date(),
      messages: [],
      prompt: currentPrompt,
    };
    setChats((prev) => [newChat, ...prev]);
    setCurrentChat(newChat);
  };


  const addMessage = (message: Omit<Message, 'id' | 'timestamp'>) => {
    const newMessage: Message = {
      ...message,
      id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
    };

    setCurrentChat((prevChat) => {
      // currentChat이 없으면 새로운 채팅을 생성
      if (!prevChat) {
        const newChat: Chat = {
          id: `chat-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          title: message.role === 'user'
            ? message.content.slice(0, 20) + (message.content.length > 20 ? '...' : '')
            : '새로운 대화',
          date: new Date(),
          messages: [newMessage],
          prompt: currentPrompt,
        };
        setChats((prev) => [newChat, ...prev]);
        return newChat;
      }

      const updatedChat = {
        ...prevChat,
        messages: [...prevChat.messages, newMessage],
        date: new Date(),
      };

      // Auto-generate title from first user message
      if (updatedChat.messages.length === 1 && message.role === 'user') {
        updatedChat.title = message.content.slice(0, 20) + (message.content.length > 20 ? '...' : '');
      }

      // chats 배열도 업데이트
      setChats((prev) => prev.map((chat) => (chat.id === updatedChat.id ? updatedChat : chat)));

      return updatedChat;
    });
  };

  const selectChat = (chatId: string) => {
    setChats((prevChats) => {
      const chat = prevChats.find((c) => c.id === chatId);
      if (chat) {
        setCurrentChat(chat);
        setCurrentPrompt(chat.prompt);
      }
      return prevChats;
    });
  };

  const deleteChats = (chatIds: string[]) => {
    setChats((prev) => prev.filter((chat) => !chatIds.includes(chat.id)));
    if (currentChat && chatIds.includes(currentChat.id)) {
      setCurrentChat(null);
    }
  };

  const setAllChats = (chatList: Chat[]) => {
      setChats(chatList);
  };
  return (
    <ChatContext.Provider
      value={{
        chats,
        currentChat,
        currentPrompt,
        setCurrentPrompt,
        createNewChat,
        addMessage,
        selectChat,
        deleteChats,
        setAllChats,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};