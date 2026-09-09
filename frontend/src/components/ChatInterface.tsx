import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Loader2, ServerCrash, ShieldCheck } from 'lucide-react';
import { useChat } from '../context/ChatContext.tsx';
import ReactMarkdown from 'react-markdown';

export const ChatInterface: React.FC = () => {
  const { messages, sendMessage, isTyping, isConnected } = useChat();
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      sendMessage(input);
      setInput('');
    }
  };

  return (
    <div className="flex flex-col h-screen max-w-4xl mx-auto p-4 md:p-6">
      <header className="flex items-center justify-between pb-4 border-b border-slate-200 mb-4">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 p-2 rounded-lg shadow-sm">
            <Bot className="text-white" size={24} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-800">OmniCustomer</h1>
            <p className="text-sm text-slate-500 font-medium">Enterprise Agent Swarm</p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-sm font-medium px-3 py-1.5 rounded-full bg-slate-100">
          {isConnected ? (
            <><ShieldCheck size={16} className="text-emerald-500" /> <span className="text-slate-600">Secure WebSocket</span></>
          ) : (
            <><ServerCrash size={16} className="text-rose-500" /> <span className="text-slate-600">Disconnected</span></>
          )}
        </div>
      </header>

      <div className="flex-1 overflow-y-auto rounded-2xl bg-white shadow-sm border border-slate-100 p-4 space-y-6 scroll-smooth">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-4">
            <Bot size={48} className="text-slate-200" />
            <p>Initialize the swarm. Type a message below.</p>
          </div>
        ) : (
          messages.map((msg) => (
            <div key={msg.id} className={`flex gap-4 ${msg.sender === 'user' ? 'flex-row-reverse' : ''}`}>
              <div className={`w-10 h-10 shrink-0 rounded-full flex items-center justify-center shadow-sm ${msg.sender === 'user' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-blue-600'}`}>
                {msg.sender === 'user' ? <User size={20} /> : <Bot size={20} />}
              </div>
              <div className={`flex flex-col max-w-[75%] ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
                <div className={`px-5 py-3.5 rounded-2xl ${msg.sender === 'user' ? 'bg-indigo-600 text-white rounded-tr-sm' : 'bg-slate-50 text-slate-800 rounded-tl-sm border border-slate-100'}`}>
                  <ReactMarkdown className="prose prose-sm max-w-none">
                    {msg.text}
                  </ReactMarkdown>
                </div>
                {msg.route && (
                  <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 mt-1.5 ml-1">
                    Swarm Node: {msg.route}
                  </span>
                )}
              </div>
            </div>
          ))
        )}
        {isTyping && (
          <div className="flex gap-4">
            <div className="w-10 h-10 rounded-full flex items-center justify-center shadow-sm bg-slate-100 text-blue-600">
              <Bot size={20} />
            </div>
            <div className="px-5 py-3.5 rounded-2xl bg-slate-50 border border-slate-100 rounded-tl-sm flex items-center gap-2 text-slate-400">
              <Loader2 size={16} className="animate-spin" />
              <span className="text-sm font-medium">Agent synthesizing response...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSend} className="mt-4 relative group">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about logistics, tech support, or request a refund..."
          className="w-full bg-white border border-slate-200 text-slate-800 rounded-2xl pl-5 pr-14 py-4 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm group-hover:shadow-md"
          disabled={!isConnected}
        />
        <button
          type="submit"
          disabled={!input.trim() || !isConnected}
          className="absolute right-2 top-2 bottom-2 aspect-square bg-blue-600 hover:bg-blue-700 text-white rounded-xl flex items-center justify-center transition-colors disabled:opacity-50 disabled:hover:bg-blue-600"
        >
          <Send size={18} />
        </button>
      </form>
    </div>
  );
};
