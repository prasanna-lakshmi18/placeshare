import { useState } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { KeyRound, Loader2, CheckCircle2 } from 'lucide-react';
import api from '../../api/client';

export function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      setStatus('error');
      setErrorMessage('Invalid or missing reset token.');
      return;
    }

    if (password !== confirmPassword) {
      setStatus('error');
      setErrorMessage('Passwords do not match.');
      return;
    }
    
    if (password.length < 6) {
      setStatus('error');
      setErrorMessage('Password must be at least 6 characters.');
      return;
    }

    setStatus('loading');
    try {
      await api.post('/auth/reset-password', { token, new_password: password });
      setStatus('success');
      setTimeout(() => navigate('/'), 3000);
    } catch (err: any) {
      setStatus('error');
      setErrorMessage(err.response?.data?.detail || 'An error occurred. The token may be expired or invalid.');
    }
  };

  if (!token) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white dark:bg-gray-900 rounded-3xl p-8 text-center shadow-sm border border-gray-200 dark:border-gray-800">
           <p className="text-rose-500 font-medium mb-4">Invalid or missing reset token.</p>
           <Link to="/" className="text-brand-600 dark:text-brand-400 font-medium hover:underline">Return to Home</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[60vh] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white dark:bg-gray-900 rounded-3xl p-8 shadow-sm border border-gray-200 dark:border-gray-800">
        <div className="w-12 h-12 bg-brand-100 dark:bg-brand-900/50 rounded-2xl flex items-center justify-center mb-6">
          <KeyRound className="text-brand-600 dark:text-brand-400" size={24} />
        </div>

        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Create new password</h2>
        
        {status === 'success' ? (
          <div className="mt-4 p-4 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 rounded-2xl flex flex-col items-center text-center">
            <CheckCircle2 className="text-emerald-500 mb-3" size={32} />
            <p className="text-emerald-700 dark:text-emerald-400 font-medium">Password reset successfully!</p>
            <p className="text-sm text-emerald-600/80 dark:text-emerald-400/80 mt-1 mb-4">
              You can now log in with your new password.
            </p>
            <Link to="/" className="text-brand-600 dark:text-brand-400 font-medium hover:underline">Return to Home</Link>
          </div>
        ) : (
          <>
            <p className="text-gray-500 dark:text-gray-400 mb-8 text-sm">
              Your new password must be different from previous used passwords.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">New password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500 outline-none transition-all"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Confirm new password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500 outline-none transition-all"
                  required
                />
              </div>

              {status === 'error' && (
                <p className="text-rose-500 text-sm font-medium">{errorMessage}</p>
              )}

              <button
                type="submit"
                disabled={status === 'loading' || !password || !confirmPassword}
                className="w-full flex items-center justify-center gap-2 bg-brand-600 hover:bg-brand-700 text-white py-3 rounded-xl font-medium shadow-sm hover:shadow transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed mt-4"
              >
                {status === 'loading' ? <Loader2 size={18} className="animate-spin" /> : 'Reset password'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
