import React, { useState, useEffect } from 'react';
import { User, Lock, Mail } from 'lucide-react';

export default function LoginModal({ isOpen, onClose, onSave, currentUser, error, clearError }) {
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [viewMode, setViewMode] = useState('LOGIN'); // 'LOGIN', 'REGISTER', 'RESET'

  useEffect(() => {
    if (!currentUser) {
      setLoginForm({ email: '', password: '' });
      setViewMode('LOGIN');
    }
  }, [currentUser, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({ ...loginForm, mode: viewMode });
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-[4px] flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
      <div className="bg-[var(--app-card)] rounded-[2rem] p-8 max-w-md w-full shadow-2xl border border-[var(--app-border)] animate-in slide-in-from-bottom-4 duration-300">
        <div className="flex justify-center mb-6">
          <div className="p-4 bg-gradient-to-br from-[var(--app-bg)] to-[var(--app-border)] rounded-full text-[var(--app-accent)] shadow-inner">
            <User size={32} strokeWidth={2.5} />
          </div>
        </div>

        {currentUser ? (
          <>
            <h3 className="text-2xl font-bold text-center text-[var(--app-text)] mb-2">Your Account</h3>
            <p className="text-sm font-medium text-center text-[var(--app-text-muted)] mb-8">Signed in as {currentUser.email}</p>
            <div className="flex flex-col gap-4">
              <button
                onClick={() => onSave('LOGOUT')}
                className="w-full py-4 rounded-[1.25rem] font-bold text-lg bg-[var(--app-accent)] text-white hover:bg-[#d68b60] shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all"
              >
                Sign Out
              </button>
              <button
                onClick={onClose}
                className="w-full py-3 rounded-[1.25rem] font-bold text-sm text-[var(--app-text-muted)] hover:bg-[var(--app-bg)] transition-colors"
              >
                Close
              </button>
            </div>
          </>
        ) : (
          <>
            <h3 className="text-2xl font-bold text-center text-[var(--app-text)] mb-2">
              {viewMode === 'REGISTER' ? 'Create Account' : viewMode === 'RESET' ? 'Reset Password' : 'Welcome Back'}
            </h3>
            <p className="text-sm font-medium text-center text-[var(--app-text-muted)] mb-6">
              {viewMode === 'REGISTER' ? 'Sign up to sync your sessions.' : viewMode === 'RESET' ? 'Enter email to receive reset link.' : 'Sign in to access your dashboard.'}
            </p>

            {error && (
              <div className="mb-6 p-4 rounded-2xl bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800/30 text-red-600 dark:text-red-400 text-xs font-bold flex items-center gap-3 animate-in fade-in zoom-in-95 duration-200">
                <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                <span className="flex-1 leading-relaxed">{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-[var(--app-text-muted)] mb-2 ml-1 flex items-center gap-1.5"><Mail size={14} /> Email Address</label>
                <input
                  type="email"
                  value={loginForm.email}
                  onChange={e => setLoginForm({ ...loginForm, email: e.target.value })}
                  placeholder="you@example.com"
                  className="w-full px-5 py-4 rounded-[1.25rem] border-2 border-[var(--app-border)] bg-[var(--app-bg)]/80 focus:bg-[var(--app-card)] focus:outline-none focus:border-[var(--app-accent)]/30 focus:ring-4 focus:ring-[var(--app-accent)]/10 transition-all font-semibold text-[var(--app-text)] placeholder:text-[var(--app-text-muted)]/50"
                  required
                />
              </div>

              {viewMode !== 'RESET' && (
                <div>
                  <div className="flex justify-between items-center mb-2 mx-1">
                    <label className="text-xs font-bold uppercase tracking-widest text-[var(--app-text-muted)] flex items-center gap-1.5"><Lock size={14} /> Password</label>
                    {viewMode === 'LOGIN' && (
                      <button type="button" onClick={() => { clearError(); setViewMode('RESET'); }} className="text-xs font-bold text-[var(--app-accent)] hover:opacity-80 transition-opacity">Forgot Password?</button>
                    )}
                  </div>
                  <input
                    type="password"
                    value={loginForm.password}
                    onChange={e => setLoginForm({ ...loginForm, password: e.target.value })}
                    placeholder="••••••••"
                    className="w-full px-5 py-4 rounded-[1.25rem] border-2 border-[var(--app-border)] bg-[var(--app-bg)]/80 focus:bg-[var(--app-card)] focus:outline-none focus:border-[var(--app-accent)]/30 focus:ring-4 focus:ring-[var(--app-accent)]/10 transition-all font-semibold text-[var(--app-text)] placeholder:text-[var(--app-text-muted)]/50"
                    required={viewMode !== 'RESET'}
                    minLength={6}
                  />
                </div>
              )}

              <div className="mt-2 text-center">
                <button
                  type="button"
                  onClick={() => {
                    clearError();
                    setViewMode(viewMode === 'LOGIN' ? 'REGISTER' : 'LOGIN');
                  }}
                  className="text-xs font-bold text-[var(--app-text-muted)] hover:text-[var(--app-accent)] transition-colors"
                >
                  {viewMode === 'REGISTER' ? "Already have an account? Sign In" : viewMode === 'RESET' ? "Back to Sign In" : "Don't have an account? Register"}
                </button>
              </div>

              <div className="mt-2">
                <button
                  type="submit"
                  className="w-full py-4 rounded-[1.25rem] font-bold text-lg bg-[var(--app-accent)] text-white hover:bg-[#d68b60] shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all"
                >
                  {viewMode === 'REGISTER' ? 'Sign Up' : viewMode === 'RESET' ? 'Send Reset Link' : 'Sign In'}
                </button>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="w-full py-3 rounded-[1.25rem] font-bold text-sm text-[var(--app-text-muted)] hover:bg-[var(--app-bg)] transition-colors"
              >
                Cancel
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
