import clsx from 'clsx';
import { User, Bot } from 'lucide-react';

interface MessageBubbleProps {
  role: 'user' | 'assistant';
  content: string;
}

export function MessageBubble({ role, content }: MessageBubbleProps) {
  const isUser = role === 'user';

  return (
    <div className={clsx("flex w-full mb-6", isUser ? "justify-end" : "justify-start")}>
      <div className={clsx(
        "flex max-w-[85%] md:max-w-[75%] gap-3",
        isUser ? "flex-row-reverse" : "flex-row"
      )}>
        <div className={clsx(
          "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center shadow-md",
          isUser ? "bg-primary text-white" : "bg-slate-700 text-slate-200"
        )}>
          {isUser ? <User className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
        </div>
        
        <div className={clsx(
          "px-4 py-3 rounded-2xl shadow-sm relative group",
          isUser 
            ? "bg-primary text-white rounded-tr-none" 
            : "bg-surface text-slate-200 border border-slate-700/50 rounded-tl-none"
        )}>
          <div className="prose prose-invert max-w-none text-sm md:text-base leading-relaxed whitespace-pre-wrap">
            {content}
          </div>
        </div>
      </div>
    </div>
  );
}
