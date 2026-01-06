import React, { useState, useEffect, useRef } from 'react';
import { ChatMessage, DailyLog } from '../types';
import { initializeChat, sendMessageToMara, resetChatSession } from '../services/geminiService';
import { saveChatHistory, getUser, clearChatHistory } from '../services/storageService';
import { Send, Bot, Loader2, RotateCcw } from 'lucide-react';

interface ChatProps {
  logs: DailyLog[];
  history: ChatMessage[];
  onUpdateHistory: (msgs: ChatMessage[]) => void;
  onRefreshUser?: () => void;
}

export const Chat: React.FC<ChatProps> = ({ logs, history, onUpdateHistory, onRefreshUser }) => {
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    initializeChat(logs, history);
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [history, isLoading]);

  const handleReset = () => {
    if (window.confirm("Do you want to clear the conversation and start again?")) {
      clearChatHistory();
      onUpdateHistory([]);
      resetChatSession();
      // Re-initialize a fresh session
      initializeChat(logs, []);
    }
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: input,
      timestamp: Date.now()
    };

    const updatedHistory = [...history, userMsg];
    onUpdateHistory(updatedHistory);
    saveChatHistory(updatedHistory);
    setInput('');
    setIsLoading(true);

    const responseText = await sendMessageToMara(userMsg.text, onRefreshUser);

    const modelMsg: ChatMessage = {
      id: (Date.now() + 1).toString(),
      role: 'model',
      text: responseText,
      timestamp: Date.now()
    };

    const finalHistory = [...updatedHistory, modelMsg];
    onUpdateHistory(finalHistory);
    saveChatHistory(finalHistory);
    setIsLoading(false);
  };

  return (
    <div className="flex flex-col h-screen bg-slate-50 pb-20 overflow-hidden">
      <div className="bg-white border-b border-slate-200 p-4 pt-12 shadow-sm sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-full text-purple-600">
              <Bot size={24} />
            </div>
            <div>
              <h1 className="font-bold text-slate-900">Mara</h1>
              <p className="text-xs text-green-600 font-bold flex items-center gap-1">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span> Online
              </p>
            </div>
          </div>
          <button
            onClick={handleReset}
            className="p-2 text-slate-400 hover:text-rose-500 transition-colors flex items-center gap-1 hover:bg-rose-50 rounded-lg"
            title="Reset Conversation"
          >
            <RotateCcw size={18} />
            <span className="text-[10px] font-black uppercase tracking-widest hidden sm:inline">Reset</span>
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar">
        {history.length === 0 && (
          <div className="text-center text-slate-500 mt-12 px-8">
            <p className="mb-2 font-bold text-lg text-slate-900">👋 Hi! I'm Mara.</p>
            <p className="text-sm font-medium text-slate-600">I'm here to listen without judgment. How are you feeling about things today?</p>
            <button
              onClick={() => setInput("I'd like to do a Toxic Check.")}
              className="mt-4 px-4 py-2 bg-purple-50 text-purple-700 rounded-full text-xs font-bold border border-purple-100"
            >
              Start Toxic Check 🔍
            </button>
          </div>
        )}

        {history.map((msg) => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] rounded-2xl p-4 text-sm leading-relaxed shadow-sm font-medium ${msg.role === 'user'
              ? 'bg-purple-600 text-white rounded-br-none'
              : 'bg-white text-slate-800 border border-slate-200 rounded-bl-none'
              }`}>
              {msg.text}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white p-4 rounded-2xl rounded-bl-none border border-slate-200 shadow-sm flex items-center gap-2 text-slate-600 text-sm font-bold">
              <Loader2 size={16} className="animate-spin" /> Mara is thinking...
            </div>
          </div>
        )}
        <div ref={scrollRef} />
      </div>

      <div className="p-4 bg-white border-t border-slate-200 pb-safe">
        <div className="flex gap-2">
          <input
            type="text"
            className="flex-1 bg-slate-100 border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-purple-500 focus:outline-none transition-all text-slate-900 font-medium placeholder-slate-400"
            placeholder="Type a message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            disabled={isLoading}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="bg-purple-600 text-white p-3 rounded-xl disabled:opacity-50 hover:bg-purple-700 transition-colors shadow-lg shadow-purple-100 flex items-center justify-center"
          >
            <Send size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};