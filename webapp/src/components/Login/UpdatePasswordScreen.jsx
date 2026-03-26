import React, { useState } from 'react';
import { Lock, CheckCircle2, ShieldAlert } from 'lucide-react';
import { supabase } from '../../utils/supabaseClient';

export default function UpdatePasswordScreen({ onComplete }) {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);
    setError(null);

    const { error: updateError } = await supabase.auth.updateUser({ password });

    setLoading(false);

    if (updateError) {
      setError(updateError.message);
    } else {
      setSuccess(true);
      setTimeout(() => {
        if (onComplete) onComplete();
      }, 3000);
    }
  };

  return (
    <div className="fixed inset-0 bg-[var(--app-bg)] flex items-center justify-center p-4 z-[100] animate-in fade-in duration-300">
      <div className="bg-[var(--app-card)] rounded-[2rem] p-8 max-w-md w-full shadow-2xl border border-[var(--app-border)] relative overflow-hidden">
        {/* Decorative flair */}
        <div className="absolute -right-10 -top-10 w-40 h-40 bg-[var(--app-accent)]/10 rounded-full blur-3xl" />
        <div className="absolute -left-10 -bottom-10 w-40 h-40 bg-indigo-500/10 rounded-full blur-3xl" />

        <div className="relative z-10 flex flex-col items-center">
          <div className="p-4 bg-gradient-to-br from-[var(--app-bg)] to-[var(--app-border)] rounded-full text-[var(--app-accent)] shadow-inner mb-6">
            <Lock size={32} strokeWidth={2.5} />
          </div>

          <h3 className="text-2xl font-black text-center text-[var(--app-text)] mb-2 tracking-tight">Set New Password</h3>
          <p className="text-sm font-medium text-center text-[var(--app-text-muted)] mb-8 max-w-[280px]">
            Your link is valid. Please enter a new password to secure your account.
          </p>

          {success ? (
            <div className="w-full flex flex-col items-center py-6 animate-in zoom-in-95 fill-mode-forwards">
              <div className="text-emerald-500 mb-4 animate-bounce">
                <CheckCircle2 size={48} strokeWidth={2.5} />
              </div>
              <h4 className="text-lg font-bold text-[var(--app-text)] mb-2">Password Updated!</h4>
              <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">Taking you to your dashboard...</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="w-full flex flex-col gap-5">
              {error && (
                <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800/30 text-red-600 dark:text-red-400 text-xs font-bold flex items-center gap-3">
                  <ShieldAlert size={16} className="shrink-0" />
                  <span className="flex-1 leading-relaxed">{error}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-[var(--app-text-muted)] mb-2 ml-1">New Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="ΓÇóΓÇóΓÇóΓÇóΓÇóΓÇóΓÇóΓÇó"
                  className="w-full px-5 py-4 rounded-[1.25rem] border-2 border-[var(--app-border)] bg-[var(--app-bg)]/80 focus:bg-[var(--app-card)] focus:outline-none focus:border-[var(--app-accent)]/30 focus:ring-4 focus:ring-[var(--app-accent)]/10 transition-all font-semibold text-[var(--app-text)] placeholder:text-[var(--app-text-muted)]/50"
                  required
                  minLength={6}
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-[var(--app-text-muted)] mb-2 ml-1">Confirm Password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  placeholder="ΓÇóΓÇóΓÇóΓÇóΓÇóΓÇóΓÇóΓÇó"
                  className="w-full px-5 py-4 rounded-[1.25rem] border-2 border-[var(--app-border)] bg-[var(--app-bg)]/80 focus:bg-[var(--app-card)] focus:outline-none focus:border-[var(--app-accent)]/30 focus:ring-4 focus:ring-[var(--app-accent)]/10 transition-all font-semibold text-[var(--app-text)] placeholder:text-[var(--app-text-muted)]/50"
                  required
                  minLength={6}
                />
              </div>

              <div className="mt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 rounded-[1.25rem] font-bold text-lg bg-[var(--app-accent)] text-white hover:bg-[#d68b60] shadow-sm hover:shadow-md hover:-translate-y-0.5 disabled:opacity-70 disabled:hover:translate-y-0 transition-all"
                >
                  {loading ? 'Updating...' : 'Update Password'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
