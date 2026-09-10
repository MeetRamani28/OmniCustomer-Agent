import React, { useState, useRef, useEffect } from "react";
import {
  Send,
  Bot,
  User,
  Loader2,
  ServerCrash,
  ShieldCheck,
  Zap,
} from "lucide-react";
import { useChat } from "../context/ChatContext";
import ReactMarkdown from "react-markdown";

export const ChatInterface: React.FC = () => {
  const { messages, sendMessage, isTyping, isConnected } = useChat();
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      sendMessage(input);
      setInput("");
    }
  };

  return (
    <div className="flex flex-col h-full max-w-5xl mx-auto p-4 md:p-6 lg:p-8">
      {/* Header */}
      <header className="flex items-center justify-between pb-6 border-b border-slate-200 mb-6 shrink-0">
        <div className="flex items-center gap-4">
          <div className="bg-gradient-to-tr from-blue-600 to-indigo-600 p-2.5 rounded-xl shadow-md ring-1 ring-black/5">
            <Bot className="text-white" size={26} />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight">OmniCustomer</h1>
            <p className="text-sm text-slate-500 font-medium flex items-center gap-1.5 mt-0.5">
              <Zap size={14} className="text-amber-500" />
              Enterprise Agent Swarm
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2.5 text-sm font-semibold px-4 py-2 rounded-full bg-white shadow-sm border border-slate-200 transition-all">
          {isConnected ? (
            <>
              <ShieldCheck size={18} className="text-emerald-500" />
              <span className="text-slate-700">Secure WebSocket</span>
            </>
          ) : (
            <>
              <ServerCrash size={18} className="text-rose-500 animate-pulse" />
              <span className="text-slate-700">Disconnected</span>
            </>
          )}
        </div>
      </header>

      {/* Message Feed */}
      <div className="flex-1 overflow-y-auto rounded-3xl bg-white shadow-sm ring-1 ring-slate-900/5 p-4 md:p-8 space-y-8 scroll-smooth mb-6">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-5 animate-in fade-in duration-700">
            <div className="bg-slate-50 p-6 rounded-full ring-1 ring-slate-100">
              <Bot size={56} className="text-blue-500/50" />
            </div>
            <div className="text-center space-y-1.5">
              <p className="font-semibold text-slate-600 text-lg">System Initialized.</p>
              <p className="text-sm">Awaiting user input to deploy swarm logic.</p>
            </div>
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-4 group animate-in slide-in-from-bottom-2 duration-300 ${msg.sender === "user" ? "flex-row-reverse" : ""}`}
            >
              <div
                className={`w-11 h-11 shrink-0 rounded-full flex items-center justify-center shadow-sm ring-1 ring-black/5 ${
                  msg.sender === "user" ? "bg-gradient-to-br from-indigo-500 to-indigo-600 text-white" : "bg-gradient-to-br from-slate-100 to-slate-200 text-blue-600"
                }`}
              >
                {msg.sender === "user" ? <User size={22} /> : <Bot size={22} />}
              </div>
              <div
                className={`flex flex-col max-w-[80%] ${msg.sender === "user" ? "items-end" : "items-start"}`}
              >
                <div
                  className={`px-6 py-4 rounded-3xl shadow-sm leading-relaxed ${
                    msg.sender === "user" 
                      ? "bg-indigo-600 text-white rounded-tr-sm" 
                      : "bg-slate-50 text-slate-800 rounded-tl-sm border border-slate-200"
                  }`}
                >
                  <ReactMarkdown className="prose prose-sm max-w-none prose-p:leading-relaxed">
                    {msg.text}
                  </ReactMarkdown>
                </div>
                {msg.route && (
                  <span className="text-[11px] font-mono uppercase tracking-widest text-slate-400 mt-2 mx-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                    Swarm Node: {msg.route}
                  </span>
                )}
              </div>
            </div>
          ))
        )}
        
        {isTyping && (
          <div className="flex gap-4 animate-in fade-in duration-300">
            <div className="w-11 h-11 rounded-full flex items-center justify-center shadow-sm ring-1 ring-black/5 bg-gradient-to-br from-slate-100 to-slate-200 text-blue-600">
              <Bot size={22} />
            </div>
            <div className="px-6 py-4 rounded-3xl bg-slate-50 border border-slate-200 rounded-tl-sm flex items-center gap-3 text-slate-500 shadow-sm">
              <Loader2 size={18} className="animate-spin text-blue-600" />
              <span className="text-sm font-medium tracking-wide">
                Agent synthesizing response...
              </span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} className="h-1" />
      </div>

      {/* Input Area */}
      <form onSubmit={handleSend} className="relative group shrink-0">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about logistics, tech support, or request a refund..."
          className="w-full bg-white border-2 border-slate-200 text-slate-800 rounded-2xl pl-6 pr-16 py-4.5 focus:outline-none focus:ring-4 focus:ring-blue-600/10 focus:border-blue-600 transition-all shadow-sm font-medium placeholder:font-normal placeholder:text-slate-400 disabled:opacity-50 disabled:bg-slate-50"
          disabled={!isConnected}
        />
        <button
          type="submit"
          disabled={!input.trim() || !isConnected}
          className="absolute right-2.5 top-2.5 bottom-2.5 aspect-square bg-blue-600 hover:bg-blue-700 text-white rounded-xl flex items-center justify-center transition-all disabled:opacity-40 disabled:hover:bg-blue-600 shadow-sm active:scale-95"
        >
          <Send size={20} className={input.trim() ? "translate-x-0.5 -translate-y-0.5 transition-transform" : ""} />
        </button>
      </form>
    </div>
  );
};
