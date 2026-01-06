import React, { useState, useEffect, useRef } from 'react';
import { ChatMessage, DailyLog, ChatSession } from '../types';
import { initializeChat, sendMessageToMara, resetChatSession } from '../services/geminiService';
import { saveChatSession, deleteChatSession, getUser } from '../services/storageService';
import { Send, Bot, Loader2, RotateCcw, Menu, Plus, MessageSquare, Trash2, X } from 'lucide-react';

interface ChatProps {
  logs: DailyLog[];
  sessions: ChatSession[];
  activeSessionId: string | null;
  onUpdateSessions: (sessions: ChatSession[]) => void;
  onActiveSessionChange: (id: string | null) => void;
  onRefreshUser?: () => void;
}

export const Chat: React.FC<ChatProps> = ({
  logs,
  sessions,
  activeSessionId,
  onUpdateSessions,
  onActiveSessionChange,
  onRefreshUser
}) => {
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const activeSession = sessions.find(s => s.id === activeSessionId) || null;
  const history = activeSession?.messages || [];

  useEffect(() => {
    if (activeSessionId) {
      initializeChat(logs, history);
    }
  }, [activeSessionId]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [history, isLoading]);

  const handleCreateNewChat = () => {
    const newSession: ChatSession = {
      id: Date.now().toString(),
      title: 'New Conversation',
      messages: [],
      lastUpdated: Date.now()
    };
    const updated = saveChatSession(newSession);
    onUpdateSessions(updated);
    onActiveSessionChange(newSession.id);
    setIsSidebarOpen(false);
    resetChatSession();
  };

  const handleDeleteSession = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (window.confirm("Delete this conversation?")) {
      const updated = deleteChatSession(id);
      onUpdateSessions(updated);
      if (activeSessionId === id) {
        onActiveSessionChange(updated.length > 0 ? updated[0].id : null);
      }
    }
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    let currentSession = activeSession;

    if (!currentSession) {
      const newSession: ChatSession = {
        id: Date.now().toString(),
        title: input.slice(0, 30) + (input.length > 30 ? '...' : ''),
        messages: [],
        lastUpdated: Date.now()
      };
      currentSession = newSession;
      onActiveSessionChange(newSession.id);
    }

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: input,
      timestamp: Date.now()
    };

    const updatedHistory = [...currentSession.messages, userMsg];

    // Update title if it's the first message
    const updatedTitle = currentSession.messages.length === 0
      ? input.slice(0, 30) + (input.length > 30 ? '...' : '')
      : currentSession.title;

    const updatedSession: ChatSession = {
      ...currentSession,
      title: updatedTitle,
      messages: updatedHistory,
      lastUpdated: Date.now()
    };

    const nextSessions = saveChatSession(updatedSession);
    onUpdateSessions(nextSessions);

    setInput('');
    setIsLoading(true);

    const responseText = await sendMessageToMara(userMsg.text, onRefreshUser);

    const modelMsg: ChatMessage = {
      id: (Date.now() + 1).toString(),
      role: 'model',
      text: responseText,
      timestamp: Date.now()
    };

    const finalSession: ChatSession = {
      ...updatedSession,
      messages: [...updatedHistory, modelMsg],
      lastUpdated: Date.now()
    };

    const finalSessions = saveChatSession(finalSession);
    onUpdateSessions(finalSessions);
    setIsLoading(false);
  };

  return (
    <div className="flex flex-col h-screen bg-slate-50 pb-20 overflow-hidden relative">
      {/* Sidebar Overlay */}
      {isSidebarOpen && (
        <div
          className="absolute inset-0 bg-slate-900/40 z-40 transition-opacity backdrop-blur-sm"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar Drawer */}
      <div className={`absolute left-0 top-0 h-full w-72 bg-white z-50 shadow-2xl transition-transform duration-300 transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-4 pt-12 flex flex-col h-full">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-black text-xl tracking-tight text-slate-900">History</h2>
            <button onClick={() => setIsSidebarOpen(false)} className="p-2 text-slate-400">
              <X size={20} />
            </button>
          </div>

          <button
            onClick={handleCreateNewChat}
            className="flex items-center gap-2 w-full p-4 mb-4 bg-purple-600 text-white rounded-xl font-bold shadow-lg shadow-purple-100 hover:bg-purple-700 transition-all hover:scale-[1.02]"
          >
            <Plus size={20} /> New Chat
          </button>

          <div className="flex-1 overflow-y-auto space-y-2 no-scrollbar">
            {sessions.map(s => (
              <div
                key={s.id}
                onClick={() => { onActiveSessionChange(s.id); setIsSidebarOpen(false); }}
                className={`group flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all border ${activeSessionId === s.id
                    ? 'bg-purple-50 border-purple-200 text-purple-700 shadow-sm'
                    : 'bg-white border-transparent hover:bg-slate-50 text-slate-600'
                  }`}
              >
                <div className="flex items-center gap-3 overflow-hidden">
                  <MessageSquare size={18} className={activeSessionId === s.id ? 'text-purple-600' : 'text-slate-400'} />
                  <span className="text-sm font-bold truncate">{s.title}</span>
                </div>
                <button
                  onClick={(e) => handleDeleteSession(e, s.id)}
                  className="opacity-0 group-hover:opacity-100 p-1 hover:text-rose-600 transition-all"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
            {sessions.length === 0 && (
              <p className="text-center text-slate-400 text-xs mt-8">No previous chats yet.</p>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white border-b border-slate-200 p-4 pt-12 shadow-sm sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <Menu size={24} />
            </button>
            <div className="p-1 px-3 bg-purple-100 rounded-full text-purple-600 flex items-center gap-2">
              <Bot size={20} />
              <span className="text-sm font-black tracking-tight">MARA</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleCreateNewChat}
              className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
              title="New Chat"
            >
              <Plus size={24} />
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar">
        {!activeSession || history.length === 0 ? (
          <div className="text-center text-slate-500 mt-12 px-8">
            <div className="w-16 h-16 bg-purple-100 rounded-3xl flex items-center justify-center text-purple-600 mx-auto mb-6 shadow-inner">
              <Bot size={32} />
            </div>
            <p className="mb-2 font-black text-2xl tracking-tight text-slate-900">How can I help today?</p>
            <p className="text-sm font-medium text-slate-500 max-w-[240px] mx-auto leading-relaxed">
              I'm Mara, your clarity companion. We can talk about your day, or start a deep analysis.
            </p>
            <button
              onClick={() => setInput("I'd like to do a Toxic Check.")}
              className="mt-8 px-6 py-3 bg-white text-purple-700 rounded-2xl text-sm font-black border-2 border-purple-100 shadow-sm hover:border-purple-200 transition-all flex items-center gap-2 mx-auto"
            >
              Start Toxic Check 🔍
            </button>
          </div>
        ) : (
          history.map((msg) => (
            <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] rounded-2xl p-4 text-sm leading-relaxed shadow-sm font-medium ${msg.role === 'user'
                  ? 'bg-purple-600 text-white rounded-br-none'
                  : 'bg-white text-slate-800 border border-slate-200 rounded-bl-none'
                }`}>
                {msg.text}
              </div>
            </div>
          ))
        )}

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
            className="flex-1 bg-slate-100 border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-purple-500 focus:outline-none transition-all text-slate-900 font-medium placeholder-slate-400 shadow-inner"
            placeholder="Type a message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            disabled={isLoading}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="bg-purple-600 text-white p-3 rounded-xl disabled:opacity-50 hover:bg-purple-700 transition-colors shadow-lg shadow-purple-200 flex items-center justify-center"
          >
            <Send size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};