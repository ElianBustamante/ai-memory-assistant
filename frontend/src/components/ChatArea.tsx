import React, { useRef, useEffect, useState } from 'react';
import { MessageBubble } from './MessageBubble';
import { Send, Loader2, Menu } from 'lucide-react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface ChatAreaProps {
  messages: Message[];
  isLoading: boolean;
  onSendMessage: (msg: string) => void;
  onToggleSidebar: () => void;
}

export function ChatArea({ messages, isLoading, onSendMessage, onToggleSidebar }: ChatAreaProps) {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = (e: React.SyntheticEvent) => {
    e.preventDefault();
    if (input.trim() && !isLoading) {
      onSendMessage(input);
      setInput('');
    }
  };

  return (
    <div className="flex flex-col flex-1 h-full relative bg-slate-900/50">
      {/* Header Mobile */}
      <div className="md:hidden flex items-center justify-between p-4 border-b border-slate-800 bg-surface/80 backdrop-blur-md sticky top-0 z-10">
        <h1 className="font-semibold text-slate-200">AI Assistant</h1>
        <button onClick={onToggleSidebar} className="p-2 -mr-2 text-slate-400 hover:text-white">
          <Menu className="w-6 h-6" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 scrollbar-hide">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-slate-500 space-y-4">
            <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center mb-4">
              <span className="text-3xl">👋</span>
            </div>
            <h2 className="text-xl font-medium text-slate-300">Welcome to your AI Assistant</h2>
            <p className="text-sm max-w-md text-center px-4">
              I have semantic memory. I'll remember context from our conversations to help you better!
            </p>
          </div>
        ) : (
          <div className="max-w-3xl mx-auto">
            {messages.map((msg, idx) => (
              <MessageBubble key={idx} role={msg.role} content={msg.content} />
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="p-4 md:p-6 bg-gradient-to-t from-background via-background to-transparent">
        <form 
          onSubmit={handleSubmit}
          className="max-w-3xl mx-auto relative flex items-end gap-2 bg-surface border border-slate-700/80 rounded-2xl p-2 shadow-lg focus-within:border-primary/50 focus-within:ring-1 focus-within:ring-primary/50 transition-all"
        >
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
            placeholder="Type a message..."
            className="w-full max-h-32 bg-transparent text-slate-200 placeholder-slate-500 px-3 py-3 outline-none resize-none scrollbar-hide text-base leading-relaxed"
            rows={1}
            style={{ minHeight: '52px' }}
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="flex-shrink-0 mb-1 mr-1 w-10 h-10 rounded-xl bg-primary hover:bg-blue-600 disabled:bg-slate-700 disabled:text-slate-500 text-white flex items-center justify-center transition-all shadow-md active:scale-95 disabled:active:scale-100"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5 ml-0.5" />
            )}
          </button>
        </form>
        <p className="text-center text-xs text-slate-500 mt-3 hidden md:block">
          AI can make mistakes. Consider verifying important information.
        </p>
      </div>
    </div>
  );
}
