import React, { useState, useEffect } from 'react';
import { User, Lock, Mail } from 'lucide-react';

export default function LoginModal({ isOpen, onClose, onSave, currentUser }) {
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [isRegistering, setIsRegistering] = useState(false);

  useEffect(() => {
    if (!currentUser) {
      setLoginForm({ email: '', password: '' });
      setIsRegistering(false);
    }
  }, [currentUser, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({ ...loginForm, mode: isRegistering ? 'REGISTER' : 'LOGIN' });
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
            <h3 className="text-2xl font-bold text-center text-[var(--app-text)] mb-2">{isRegistering ? 'Create Account' : 'Welcome Back'}</h3>
            <p className="text-sm font-medium text-center text-[var(--app-text-muted)] mb-8">{isRegistering ? 'Sign up to sync your sessions.' : 'Sign in to access your dashboard.'}</p>
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

              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-[var(--app-text-muted)] mb-2 ml-1 flex items-center gap-1.5"><Lock size={14} /> Password</label>
                <input
                  type="password"
                  value={loginForm.password}
                  onChange={e => setLoginForm({ ...loginForm, password: e.target.value })}
                  placeholder="••••••••"
                  className="w-full px-5 py-4 rounded-[1.25rem] border-2 border-[var(--app-border)] bg-[var(--app-bg)]/80 focus:bg-[var(--app-card)] focus:outline-none focus:border-[var(--app-accent)]/30 focus:ring-4 focus:ring-[var(--app-accent)]/10 transition-all font-semibold text-[var(--app-text)] placeholder:text-[var(--app-text-muted)]/50"
                  required
                  minLength={6}
                />
              </div>

              <div className="mt-2 text-center">
                <button
                  type="button"
                  onClick={() => setIsRegistering(!isRegistering)}
                  className="text-xs font-bold text-[var(--app-text-muted)] hover:text-[var(--app-accent)] transition-colors"
                >
                  {isRegistering ? "Already have an account? Sign In" : "Don't have an account? Register"}
                </button>
              </div>

              <div className="mt-2">
                <button
                  type="submit"
                  className="w-full py-4 rounded-[1.25rem] font-bold text-lg bg-[var(--app-accent)] text-white hover:bg-[#d68b60] shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all"
                >
                  {isRegistering ? 'Sign Up' : 'Sign In'}
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
