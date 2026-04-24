import { BrainCircuit, X, LogOut, User } from 'lucide-react';
import clsx from 'clsx';
import type { Memory } from '../services/api';
import { useAuth } from '../context/AuthContext';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  memories: Memory[];
  onOpenProfile: () => void;
}

export function Sidebar({ isOpen, onClose, memories, onOpenProfile }: SidebarProps) {
  const { logout } = useAuth();
  
  return (
    <div
      className={clsx(
        "fixed inset-y-0 right-0 z-40 w-80 bg-surface border-l border-slate-700/50 shadow-2xl transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 flex flex-col",
        isOpen ? "translate-x-0" : "translate-x-full hidden md:flex"
      )}
    >
      <div className="flex items-center justify-between p-4 border-b border-slate-700/50 bg-surface/50 backdrop-blur-sm">
        <div className="flex items-center gap-2 text-primary">
          <BrainCircuit className="w-5 h-5" />
          <h2 className="font-semibold tracking-wide">Memories Used</h2>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded-md hover:bg-slate-700 text-slate-400 hover:text-white transition-colors md:hidden"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide">
        {memories.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-slate-500 space-y-3 opacity-50">
            <BrainCircuit className="w-12 h-12" />
            <p className="text-sm text-center px-4">No memories were used for the current response.</p>
          </div>
        ) : (
          memories.map((mem, i) => (
            <div 
              key={i} 
              className="group bg-slate-800/50 border border-slate-700/50 rounded-xl p-3 hover:border-primary/50 hover:bg-slate-800 transition-all duration-300 shadow-sm"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-slate-400 bg-slate-700/50 px-2 py-1 rounded-md uppercase tracking-wider">
                  {mem.role}
                </span>
              </div>
              <p className="text-sm text-slate-300 leading-relaxed line-clamp-4 group-hover:line-clamp-none transition-all">
                {mem.content}
              </p>
            </div>
          ))
        )}
      </div>

      {/* User Actions Footer */}
      <div className="p-4 border-t border-slate-700/50 bg-slate-900/30 space-y-2">
        <button
          onClick={onOpenProfile}
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <User className="w-4 h-4 text-primary" />
          What AI knows about me
        </button>
        
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:text-red-400 hover:bg-red-400/10 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Log Out
        </button>
      </div>
    </div>
  );
}
