import React, { useState } from 'react';
import { BrainCircuit, Mail, Lock, Loader2, ArrowRight } from 'lucide-react';
import { login, register } from '../services/api';
import { useAuth } from '../context/AuthContext';

export function AuthScreen() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { login: setToken } = useAuth();

  const handleSubmit = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      if (isLogin) {
        const token = await login(email, password);
        setToken(token);
      } else {
        await register(email, password);
        const token = await login(email, password);
        setToken(token);
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unexpected error occurred");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-background bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-slate-900 via-background to-background p-4 font-sans text-slate-200">
      <div className="w-full max-w-md">
        
        {/* Logo Header */}
        <div className="mb-8 flex flex-col items-center justify-center space-y-3">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-indigo-600 shadow-lg shadow-primary/20">
            <BrainCircuit className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-white">
            Memory Assistant
          </h1>
          <p className="text-sm text-slate-400">
            {isLogin ? 'Welcome back to your personalized AI.' : 'Start building your personalized AI memory.'}
          </p>
        </div>

        {/* Auth Card */}
        <div className="relative overflow-hidden rounded-2xl border border-slate-800 bg-surface/50 p-8 shadow-2xl backdrop-blur-xl">
          <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
            
            {error && (
              <div className="rounded-lg bg-red-500/10 p-3 text-sm text-red-400 border border-red-500/20">
                {error}
              </div>
            )}

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-xl border border-slate-700 bg-slate-900/50 py-3 pl-10 pr-4 text-white placeholder-slate-500 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-all"
                    placeholder="you@example.com"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full rounded-xl border border-slate-700 bg-slate-900/50 py-3 pl-10 pr-4 text-white placeholder-slate-500 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-all"
                    placeholder="••••••••"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="group flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-primary to-indigo-600 py-3 text-sm font-semibold text-white shadow-lg shadow-primary/25 transition-all hover:from-indigo-500 hover:to-purple-500 disabled:opacity-50"
            >
              {isLoading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <>
                  {isLogin ? 'Sign In' : 'Create Account'}
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </>
              )}
            </button>
          </form>

          {/* Toggle Login/Register */}
          <div className="mt-6 text-center text-sm relative z-10">
            <span className="text-slate-400">
              {isLogin ? "Don't have an account? " : "Already have an account? "}
            </span>
            <button
              type="button"
              onClick={() => {
                setIsLogin(!isLogin);
                setError('');
              }}
              className="font-medium text-primary hover:text-indigo-400 transition-colors"
            >
              {isLogin ? 'Create one' : 'Sign in'}
            </button>
          </div>
          
          {/* Subtle background glow effect inside the card */}
          <div className="absolute -bottom-24 -right-24 h-48 w-48 rounded-full bg-primary/10 blur-3xl" />
        </div>
        
      </div>
    </div>
  );
}
