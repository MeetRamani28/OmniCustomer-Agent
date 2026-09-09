import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { io, Socket } from 'socket.io-client';
import toast from 'react-hot-toast';

export interface Message {
  id: string;
  text: string;
  sender: 'user' | 'agent';
  route?: string;
  timestamp: Date;
}

interface ChatContextType {
  messages: Message[];
  sendMessage: (text: string) => void;
  isTyping: boolean;
  isConnected: boolean;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Vite proxy redirects this directly to our backend server
    const newSocket = io(); 

    newSocket.on('connect', () => {
      setIsConnected(true);
    });

    newSocket.on('disconnect', () => {
      setIsConnected(false);
    });

    newSocket.on('agent:typing', (data: { status: boolean }) => {
      setIsTyping(data.status);
    });

    newSocket.on('agent:response', (data: { reply: string; route: string }) => {
      setMessages((prev) => [
        ...prev,
        {
          id: Math.random().toString(36).substring(7),
          text: data.reply,
          sender: 'agent',
          route: data.route,
          timestamp: new Date(),
        },
      ]);
    });

    newSocket.on('agent:error', (data: { error: string }) => {
      toast.error(data.error);
      setIsTyping(false);
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, []);

  const sendMessage = (text: string) => {
    if (!text.trim() || !socket) return;
    
    const userMsg: Message = {
      id: Math.random().toString(36).substring(7),
      text,
      sender: 'user',
      timestamp: new Date(),
    };
    
    setMessages((prev) => [...prev, userMsg]);
    socket.emit('agent:message', { message: text });
  };

  return (
    <ChatContext.Provider value={{ messages, sendMessage, isTyping, isConnected }}>
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = (): ChatContextType => {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};
