import { useEffect, useState } from 'react';
import { X, Loader2, Sparkles, Trash2 } from 'lucide-react';
import { getInferences, deleteInference, type Inference } from '../services/api';

interface InferencesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function InferencesModal({ isOpen, onClose }: InferencesModalProps) {
  const [inferences, setInferences] = useState<Inference[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let ignore = false;

    async function fetchInferences() {
      if (!isOpen) return;
      
      // Delay state update slightly to avoid synchronous cascading render warning
      await Promise.resolve();
      
      setIsLoading(true);
      setError('');
      try {
        const data = await getInferences();
        if (!ignore) setInferences(data);
      } catch (err) {
        if (!ignore) {
          setError('Failed to load inferences.');
          console.error(err);
        }
      } finally {
        if (!ignore) setIsLoading(false);
      }
    }

    fetchInferences();

    return () => {
      ignore = true;
    };
  }, [isOpen]);

  const handleDelete = async (id: number) => {
    try {
      await deleteInference(id);
      setInferences(prev => prev.filter(inf => inf.id !== id));
    } catch (err) {
      console.error('Failed to delete inference', err);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-2xl max-h-[80vh] flex flex-col rounded-2xl border border-slate-700 bg-surface shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-800 bg-slate-900/50">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/20 text-primary">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-white">What I know about you</h2>
              <p className="text-xs text-slate-400">Extracted from your past conversations</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 scrollbar-hide">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-48 space-y-3 text-slate-500">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p>Analyzing memories...</p>
            </div>
          ) : error ? (
            <div className="text-center p-6 text-red-400 bg-red-400/10 rounded-xl border border-red-400/20">
              {error}
            </div>
          ) : inferences.length === 0 ? (
            <div className="text-center py-12 px-4 text-slate-500 space-y-4">
              <Sparkles className="h-12 w-12 mx-auto opacity-20" />
              <p>I haven't learned anything specific about you yet. Keep chatting with me, and I'll start remembering facts about your preferences, work, and life!</p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {inferences.map(inf => (
                <div 
                  key={inf.id} 
                  className="group relative flex flex-col justify-between p-4 rounded-xl border border-slate-700 bg-slate-800/50 hover:bg-slate-800 transition-colors"
                >
                  <p className="text-sm text-slate-200 leading-relaxed pr-8">{inf.fact}</p>
                  
                  <div className="flex items-center justify-between mt-4">
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md ${
                      inf.confidence === 'high' ? 'bg-green-500/10 text-green-400 border border-green-500/20' :
                      inf.confidence === 'medium' ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20' :
                      'bg-slate-500/10 text-slate-400 border border-slate-500/20'
                    }`}>
                      {inf.confidence} Match
                    </span>
                    
                    <button 
                      onClick={() => handleDelete(inf.id)}
                      className="opacity-0 group-hover:opacity-100 p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-400/10 rounded-md transition-all"
                      title="Forget this fact"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
